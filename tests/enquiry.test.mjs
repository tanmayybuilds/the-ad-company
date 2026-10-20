import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnquiry, formatBrief } from '../src/lib/enquiry.mjs';
const valid = {name:'Test Visitor',phone:'+91 98765 43210',email:'',company:'',service:'Residential & community',message:'A community campaign in Pune.'};
test('requires name, a real phone format and a useful campaign brief', () => {
  const result = validateEnquiry({});
  assert.equal(result.valid,false);
  assert.deepEqual(Object.keys(result.errors),['name','phone','message']);
  assert.equal(validateEnquiry({...valid,phone:'call me 9876543210'}).valid,false);
});
test('accepts an international phone and optional blank company/email', () => {
  const result = validateEnquiry({...valid,name:'  Test Visitor  '});
  assert.equal(result.valid,true); assert.equal(result.data.name,'Test Visitor');
});
test('rejects malformed email and excessive message length', () => {
  assert.equal(validateEnquiry({...valid,email:'bad@'}).valid,false);
  assert.equal(validateEnquiry({...valid,message:'a'.repeat(3001)}).valid,false);
});
test('download contains entered details and clearly states no delivery occurred', () => {
  const brief = formatBrief(valid);
  assert.match(brief,/This brief has not been sent/);
  assert.match(brief,/A community campaign in Pune/);
  assert.match(brief,/Phone: \+91 98765 43210/);
  assert.match(brief,/Email: Not provided/);
});
