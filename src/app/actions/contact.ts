'use server';

import { getSiteSettings } from '@/lib/data';
import { sendContactMessage } from '@/lib/email';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactRequest = {
  name: string;
  email: string;
  phone: string;
  message: string;
  /** Honeypot: hidden from people, so only bots fill it in. */
  website?: string;
};

export type ContactResult = { ok: true } | { ok: false };

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** Emails a contact form message to the admins. Nothing is stored. */
export async function submitContactMessage(
  request: ContactRequest,
): Promise<ContactResult> {
  // Bots fill the hidden field: pretend success and send nothing.
  if (clean(request?.website, 200)) return { ok: true };

  const name = clean(request?.name, 200);
  const email = clean(request?.email, 200);
  const phone = clean(request?.phone, 40);
  const message = clean(request?.message, 5000);

  if (!name || !message || !EMAIL_PATTERN.test(email)) return { ok: false };

  const settings = await getSiteSettings();
  const result = await sendContactMessage({
    recipients: settings.admin_emails,
    name,
    email,
    phone,
    message,
  });

  return result.ok ? { ok: true } : { ok: false };
}
