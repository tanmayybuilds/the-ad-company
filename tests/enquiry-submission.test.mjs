import test from 'node:test';
import assert from 'node:assert/strict';
import { createEnquirySubmission } from '../src/lib/enquiry-submission.mjs';

const data = { name: 'Test Visitor', phone: '+91 9876543210', message: 'An outdoor campaign in Pune.', email: '', company: '', service: '' };
const reply = (ok, success) => ({ ok, json: async () => ({ success }) });

test('unconfigured delivery cannot send or report success', async () => {
  const states = [];
  const submission = createEnquirySubmission({ accessKey: '', subject: 'Enquiry', onState: value => states.push(value), fetchImpl: () => assert.fail('No request before configuration') });
  assert.equal(await submission.submit(data), false);
  assert.deepEqual(states, ['unconfigured']);
});

test('Web3Forms receives the validated enquiry once and only confirmed acceptance counts as success', async () => {
  const states = [], requests = [];
  let finish;
  const submission = createEnquirySubmission({ accessKey: 'fixture-key', subject: 'Website enquiry', onState: value => states.push(value), fetchImpl: (url, options) => {
    requests.push({ url, options });
    return new Promise(resolve => { finish = resolve; });
  } });
  const pending = submission.submit(data);
  assert.deepEqual(states, ['sending']);
  assert.equal(await submission.submit(data), false);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://api.web3forms.com/submit');
  assert.equal(requests[0].options.method, 'POST');
  assert.equal(requests[0].options.headers['Content-Type'], 'application/json');
  const payload = JSON.parse(requests[0].options.body);
  assert.equal(payload.access_key, 'fixture-key');
  assert.equal(payload.subject, 'Website enquiry');
  assert.equal(payload.phone, data.phone);
  assert.equal(payload.message, data.message);
  assert.ok(!('email' in payload), 'Blank optional email must not become an invalid reply-to address');
  finish(reply(true, true));
  assert.equal(await pending, true);
  assert.deepEqual(states, ['sending', 'success']);
  submission.destroy();
});

test('HTTP errors, declined submissions and network errors preserve a retryable error state', async () => {
  for (const response of [reply(false, true), reply(true, false), { ok: true, json: async () => { throw new Error('Invalid response'); } }, new Error('Offline')]) {
    const states = [];
    let fail = true;
    const submission = createEnquirySubmission({ accessKey: 'fixture', subject: 'Enquiry', onState: value => states.push(value), fetchImpl: async () => {
      if (!fail) return reply(true, true);
      if (response instanceof Error) throw response;
      return response;
    } });
    assert.equal(await submission.submit(data), false);
    assert.deepEqual(states, ['sending', 'error']);
    fail = false;
    assert.equal(await submission.submit(data), true);
    assert.equal(states.at(-1), 'success');
    submission.destroy();
  }
});

test('timeouts release pending state, and disposal cancels requests without late UI updates', async () => {
  for (const dispose of [false, true]) {
    const states = [];
    const submission = createEnquirySubmission({ accessKey: 'fixture', subject: 'Enquiry', timeoutMs: 5, onState: value => states.push(value), fetchImpl: (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('Aborted')))) });
    const pending = submission.submit(data);
    if (dispose) submission.destroy();
    assert.equal(await pending, false);
    assert.deepEqual(states, dispose ? ['sending'] : ['sending', 'error']);
    submission.destroy();
  }
});
