/** Web3Forms confirms receipt before the UI may claim a successful submission. */
export function createEnquirySubmission({ accessKey, subject, onState, fetchImpl = globalThis.fetch, timeoutMs = 15000 }) {
  let busy = false, disposed = false, controller, timer;
  return {
    async submit(data) {
      if (disposed || busy) return false;
      if (!accessKey?.trim()) { onState('unconfigured'); return false; }
      busy = true;
      onState('sending');
      controller = new AbortController();
      timer = setTimeout(() => controller.abort(), timeoutMs);
      const payload = { access_key: accessKey.trim(), subject, from_name: 'The Ad Company website', name: data.name, phone: data.phone, message: data.message };
      for (const field of ['company', 'email', 'service']) if (data[field]) payload[field] = data[field];
      try {
        const response = await fetchImpl('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) throw new Error('Submission not accepted');
        if (disposed) return false;
        onState('success');
        return true;
      } catch {
        if (!disposed) onState('error');
        return false;
      } finally { clearTimeout(timer); busy = false; }
    },
    clear() { if (!busy && !disposed) onState(accessKey?.trim() ? 'idle' : 'unconfigured'); },
    destroy() { disposed = true; clearTimeout(timer); controller?.abort(); },
  };
}
