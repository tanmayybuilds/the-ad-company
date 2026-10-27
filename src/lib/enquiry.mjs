export function validateEnquiry(input) {
  const data = Object.fromEntries(['name','phone','email','company','service','message'].map(key => [key, String(input[key] ?? '').trim()]));
  /** @type {Record<string, string>} */
  const errors = {};
  if (data.name.length < 2 || data.name.length > 100) errors.name = 'Enter your name (2–100 characters).';
  if (!/^\+?[\d\s()\-]+$/.test(data.phone) || data.phone.replace(/\D/g, '').length < 10 || data.phone.replace(/\D/g, '').length > 15) errors.phone = 'Enter a valid phone number with 10–15 digits.';
  if (data.email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 254)) errors.email = 'Enter a valid email address, or leave it blank.';
  if (data.message.length < 10 || data.message.length > 3000) errors.message = 'Tell us a little about your campaign (10–3,000 characters).';
  if (data.company.length > 160) errors.company = 'Keep the company name under 160 characters.';
  return {data, errors, valid: Object.keys(errors).length === 0};
}
export function formatBrief(data) {
  return ['THE AD COMPANY — CAMPAIGN BRIEF', 'Prepared locally. This brief has not been sent.', '', `Name: ${data.name}`, `Phone: ${data.phone}`, `Email: ${data.email || 'Not provided'}`, `Company: ${data.company || 'Not provided'}`, `Interest: ${data.service || 'Let’s discuss'}`, '', 'CAMPAIGN', data.message, '', 'The world is our canvas.'].join('\n');
}
