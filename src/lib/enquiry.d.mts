import type { EnquiryData } from './enquiry-submission.mjs';

export function validateEnquiry(input: Record<string, unknown>): {
  data: EnquiryData;
  errors: Record<string, string>;
  valid: boolean;
};
export function formatBrief(data: EnquiryData): string;
