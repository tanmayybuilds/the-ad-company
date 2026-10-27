import { useRef, useState, type FormEvent } from 'react';
import { Download, ArrowUpRight } from 'lucide-react';
import { company, contact, services } from '@/content/site';
import { useReveal } from '@/hooks/use-reveal';
import { validateEnquiry, formatBrief } from '@/lib/enquiry.mjs';
import { ActionButton, ActionLink, Eyebrow } from './primitives';

export function Contact() {
  const root = useRef<HTMLElement>(null); useReveal(root);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setStatus('');
    const form = e.currentTarget;
    const result = validateEnquiry(Object.fromEntries(new FormData(form)));
    setErrors(result.errors);
    if (!result.valid) { (form.elements.namedItem(Object.keys(result.errors)[0]) as HTMLElement)?.focus(); return; }
    const url = URL.createObjectURL(new Blob([formatBrief(result.data)], {type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = 'the-ad-company-campaign-brief.txt';
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(contact.downloadStatus);
  }
  return <section id="contact" ref={root} className="contact-section section-y bg-orange text-on-accent" aria-labelledby="contact-title"><div className="container-page grid items-start gap-12 lg:grid-cols-[5fr_7fr]">
    <div data-reveal><Eyebrow tone="ink" className="mb-5">[07 // Let’s make a mark]</Eyebrow><h2 id="contact-title" className="text-display-lg">Got a brand<br />to put<br />out there?</h2><p className="mt-7 max-w-md text-lg leading-relaxed">{contact.copy}</p><div className="mt-7 flex flex-col items-start gap-3"><a className="break-all font-semibold underline underline-offset-4" href={`mailto:${company.contact.email}`}>{company.contact.email}</a><a className="font-semibold underline underline-offset-4" href={`tel:+${company.contact.whatsapp}`}>{company.contact.phone}</a><ActionLink href={`https://wa.me/${company.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" variant="inkOnSignal" size="md" className="mt-2">{contact.whatsappLabel}</ActionLink></div><div className="mt-10 border-t border-ink/30 pt-5"><ArrowUpRight className="mb-4 h-12 w-12" aria-hidden="true" /><p className="font-display text-2xl font-bold uppercase">Big plans start<br />with a small brief.</p><p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/75">{contact.briefNote}</p></div></div>
    <form noValidate onSubmit={submit} onChange={e => {setStatus(''); const field = e.target; if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) setErrors(previous => {const next = {...previous}; delete next[field.name]; return next;});}} className="contact-form border-2 border-ink bg-paper p-5 shadow-hard-lg sm:p-8" data-reveal aria-label="Prepare a campaign brief">
      <div className="mb-6 flex justify-between border-b border-ink/20 pb-4 text-label-index text-[10px]"><span>Start a brief / no pressure</span><span className="text-signal">First build</span></div>
      <div className="grid gap-5 sm:grid-cols-2">{[{name:'name',label:'Full name',required:true,type:'text',auto:'name',max:100},{name:'phone',label:'Phone number',required:true,type:'tel',auto:'tel',max:30},{name:'company',label:'Company',required:false,type:'text',auto:'organization',max:160},{name:'email',label:'Email',required:false,type:'email',auto:'email',max:254}].map(field => <div key={field.name}><label htmlFor={field.name}>{field.label} <span>{field.required ? '*' : '(optional)'}</span></label><input id={field.name} name={field.name} type={field.type} autoComplete={field.auto} required={field.required} maxLength={field.max} aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `${field.name}-error` : undefined} />{errors[field.name] && <p id={`${field.name}-error`} className="field-error">{errors[field.name]}</p>}</div>)}</div>
      <div className="mt-5"><label htmlFor="service">Interested in <span>(optional)</span></label><select id="service" name="service" defaultValue=""><option value="">Let’s discuss the right format</option><optgroup label={services.mediaOptionsLabel}>{services.catalogue.map(service => <option key={service.id}>{service.title}</option>)}</optgroup><optgroup label={services.environmentOptionsLabel}>{services.items.map(service => <option key={service.id}>{service.title}</option>)}</optgroup></select></div>
      <div className="mt-5"><label htmlFor="message">What do you have in mind? <span>*</span></label><textarea id="message" name="message" rows={5} required minLength={10} maxLength={3000} placeholder="Your brand, audience, city, timeline and anything else we should know…" aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined} />{errors.message && <p id="message-error" className="field-error">{errors.message}</p>}</div>
      <p className="my-5 text-xs leading-relaxed text-ink/65">Required fields marked *. This preview prepares a file on your device. It does not submit an enquiry.</p>
      <ActionButton type="submit" size="md" className="w-full sm:w-auto"><Download size={16} aria-hidden="true" />Download my brief</ActionButton>
      <p role="status" aria-live="polite" className={status ? 'mt-5 border border-lime-deep/30 bg-lime/30 p-4 text-sm leading-relaxed' : ''}>{status}</p>
      <details id="privacy" className="mt-7 border-t border-ink/20 pt-4 text-xs leading-relaxed"><summary className="cursor-pointer font-semibold">Privacy & enquiry information</summary><p className="mt-3">{contact.privacyNote}</p></details>
    </form>
  </div></section>;
}
