export type EnquirySubmissionState = 'idle' | 'unconfigured' | 'sending' | 'success' | 'error';
export type EnquiryData = { name: string; phone: string; message: string; email?: string; company?: string; service?: string };
export type EnquirySubmission = { submit: (data: EnquiryData) => Promise<boolean>; clear: () => void; destroy: () => void };
export function createEnquirySubmission(options: {
  accessKey: string;
  subject: string;
  onState: (state: EnquirySubmissionState) => void;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): EnquirySubmission;
