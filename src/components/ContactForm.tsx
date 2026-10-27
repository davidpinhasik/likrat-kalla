'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, AlertCircle } from 'lucide-react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const t = useTranslations('contact');

  const [state, setState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  function validate() {
    const errs: Record<string, string> = {};
    if (!values.name.trim()) errs.name = t('requiredField');
    if (!values.email.trim()) {
      errs.email = t('requiredField');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errs.email = t('invalidEmail');
    }
    if (!values.message.trim()) errs.message = t('requiredField');
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setState('submitting');

    try {
      // POST to a Next.js API route (to be implemented in Sub-Task 5).
      // For now, simulate a 1-second network delay.
      await new Promise((res) => setTimeout(res, 1000));
      setState('success');
    } catch {
      setState('error');
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  if (state === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-brand-navy">{t('successTitle')}</h3>
        <p className="text-gray-500 max-w-sm">{t('successText')}</p>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-colors';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const errorClass = 'mt-1 text-xs text-red-500';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="contact-name" className={labelClass}>
          {t('fieldName')}
          <span className="text-red-500 ms-0.5">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={handleChange}
          placeholder={t('fieldNamePlaceholder')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          className={`${inputClass} ${errors.name ? 'border-red-400' : ''}`}
        />
        {errors.name && (
          <p id="contact-name-error" className={errorClass} role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className={labelClass}>
          {t('fieldEmail')}
          <span className="text-red-500 ms-0.5">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          placeholder={t('fieldEmailPlaceholder')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          className={`${inputClass} ${errors.email ? 'border-red-400' : ''}`}
        />
        {errors.email && (
          <p id="contact-email-error" className={errorClass} role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {/* Phone (optional) */}
      <div>
        <label htmlFor="contact-phone" className={labelClass}>
          {t('fieldPhone')}
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={handleChange}
          placeholder={t('fieldPhonePlaceholder')}
          className={inputClass}
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className={labelClass}>
          {t('fieldMessage')}
          <span className="text-red-500 ms-0.5">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={values.message}
          onChange={handleChange}
          placeholder={t('fieldMessagePlaceholder')}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          className={`${inputClass} resize-none ${errors.message ? 'border-red-400' : ''}`}
        />
        {errors.message && (
          <p id="contact-message-error" className={errorClass} role="alert">
            {errors.message}
          </p>
        )}
      </div>

      {/* Error banner */}
      {state === 'error' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {t('errorText')}
        </div>
      )}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="w-full py-3 px-6 bg-brand-gold text-white font-semibold rounded-full hover:bg-brand-gold-dark disabled:opacity-60 transition-colors text-sm"
      >
        {state === 'submitting' ? t('submitting') : t('submitBtn')}
      </button>
    </form>
  );
}
