import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Send, ArrowUpRight } from 'lucide-react';
import { company, contact, services } from '@/content/site';
import { useReveal } from '@/hooks/use-reveal';
import { useMobileLayout } from '@/hooks/use-mobile-layout';
import { validateEnquiry } from '@/lib/enquiry.mjs';
import { createEnquirySubmission, type EnquirySubmission, type EnquirySubmissionState } from '@/lib/enquiry-submission.mjs';
import { ActionButton, ActionLink, Eyebrow } from './primitives';

const accessKey = (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '').trim();

export function Contact() {
  const root = useRef<HTMLElement>(null); useReveal(root);
  const submission = useRef<EnquirySubmission | null>(null);
  const optional = useRef<HTMLDetailsElement>(null);
  const isMobile = useMobileLayout();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<EnquirySubmissionState>(accessKey ? 'idle' : 'unconfigured');
  const [optionalOpen, setOptionalOpen] = useState(false);
  const sending = state === 'sending';

  useEffect(() => {
    const control = createEnquirySubmission({ accessKey, subject: contact.emailSubject, onState: setState });
    submission.current = control;
    return () => { control.destroy(); submission.current = null; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    if (values.get('botcheck')) return;
    const result = validateEnquiry(Object.fromEntries(values));
    setErrors(result.errors);
    if (!result.valid) {
      const firstError = Object.keys(result.errors)[0];
      if (firstError === 'company' || firstError === 'email') {
        setOptionalOpen(true);
        if (optional.current) optional.current.open = true;
      }
      (form.elements.namedItem(firstError) as HTMLElement)?.focus();
      return;
    }
    if (await submission.current?.submit(result.data)) {
      form.reset();
      setOptionalOpen(false);
    }
  }

  const renderField = (field: typeof contact.fields[number]) => <div key={field.name}>
    <label htmlFor={field.name}>{field.label}<span>{field.required ? ' *' : ' (optional)'}</span></label>
    <input id={field.name} name={field.name} type={field.type} autoComplete={field.auto} required={field.required} maxLength={field.max} aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `${field.name}-error` : undefined} />
    {errors[field.name] && <p id={`${field.name}-error`} className="field-error">{errors[field.name]}</p>}
  </div>;
  const status = state === 'success' ? contact.successStatus : state === 'error' ? contact.errorStatus : state === 'unconfigured' ? contact.unconfiguredStatus : '';

  return <section id="contact" ref={root} className="contact-section section-y bg-orange text-on-accent" aria-labelledby="contact-title">
    <div className="container-page grid items-start gap-12 lg:grid-cols-[5fr_7fr]">
      <div className="contact-intro" data-reveal>
        <Eyebrow tone="ink" className="mb-5">{contact.eyebrow}</Eyebrow>
        <h2 id="contact-title" className="text-display-lg">{isMobile ? <>{contact.heading[0]}<br />{contact.heading[1]}</> : <>Got a brand<br />to put<br />out there?</>}</h2>
        <p className="contact-intro-copy mt-7 max-w-md text-lg leading-relaxed">{contact.copy}</p>
        <div className="contact-direct-links mt-7 flex flex-col items-start gap-3">
          <a className="break-all font-semibold underline underline-offset-4" href={`mailto:${company.contact.email}`}>{company.contact.email}</a>
          <a className="font-semibold underline underline-offset-4" href={`tel:+${company.contact.whatsapp}`}>{company.contact.phone}</a>
          <ActionLink href={`https://wa.me/${company.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" variant="inkOnSignal" size="md" className="mt-2">{contact.whatsappLabel}</ActionLink>
        </div>
        <div className="contact-brief-intro mt-10 border-t border-ink/30 pt-5"><ArrowUpRight className="mb-4 h-12 w-12" aria-hidden="true" /><p className="font-display text-2xl font-bold uppercase">{contact.briefHeading[0]}<br />{contact.briefHeading[1]}</p><p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/75">{contact.briefNote}</p></div>
      </div>
      <form noValidate onSubmit={submit} onChange={event => {
        submission.current?.clear();
        const field = event.target;
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) setErrors(previous => { const next = { ...previous }; delete next[field.name]; return next; });
      }} className="contact-form border-2 border-ink bg-paper p-5 shadow-hard-lg sm:p-8" data-reveal aria-label={contact.formLabel} aria-busy={sending}>
        <div className="contact-form-heading text-label-index">{contact.formHeading}</div>
        <fieldset disabled={sending} className="contact-fields">
          <input className="contact-honeypot" type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <div className="contact-primary-fields grid gap-5 sm:grid-cols-2">{contact.fields.filter(field => field.required).map(renderField)}</div>
          <details ref={optional} className="contact-optional" open={!isMobile || optionalOpen} onToggle={event => { if (isMobile) setOptionalOpen(event.currentTarget.open); }}>
            <summary>{contact.optionalLabel}</summary>
            <div className="contact-optional-fields grid gap-5 sm:grid-cols-2">{contact.fields.filter(field => !field.required).map(renderField)}</div>
            <div className="contact-service-field"><label htmlFor="service">Interested in <span>(optional)</span></label><select id="service" name="service" defaultValue=""><option value="">{contact.servicePlaceholder}</option><optgroup label={services.mediaOptionsLabel}>{services.catalogue.map(service => <option key={service.id}>{service.title}</option>)}</optgroup><optgroup label={services.environmentOptionsLabel}>{services.items.map(service => <option key={service.id}>{service.title}</option>)}</optgroup></select></div>
          </details>
          <div className="contact-message-field"><label htmlFor="message">{contact.messageLabel}<span> *</span></label><textarea id="message" name="message" rows={isMobile ? 2 : 5} required minLength={10} maxLength={3000} placeholder={contact.messagePlaceholder} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined} />{errors.message && <p id="message-error" className="field-error">{errors.message}</p>}</div>
        </fieldset>
        <div className="contact-form-meta">
          <p className="contact-required-note">{isMobile ? contact.mobileRequiredNote : contact.requiredNote}</p>
          <details id="privacy" className="contact-privacy text-xs leading-relaxed"><summary className="cursor-pointer font-semibold">{isMobile ? contact.mobilePrivacyLabel : contact.privacyLabel}</summary><p className="mt-3">{accessKey ? contact.privacyNote : contact.unconfiguredStatus}</p></details>
        </div>
        <ActionButton type="submit" size="md" className="contact-submit w-full sm:w-auto" disabled={!accessKey || sending}><Send size={16} aria-hidden="true" />{sending ? contact.sendingLabel : contact.submitLabel}</ActionButton>
        <p role="status" aria-live="polite" className={status ? 'contact-status' : ''}>{status}</p>
      </form>
    </div>
  </section>;
}
