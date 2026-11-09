import 'server-only';

import type { SponsorshipType } from '@/types/database';
import type { DonorDetails } from '@/types/donation';

export type NotificationName = {
  name: string;
  /** Human-readable prayer reason (already resolved from prayer_reasons). */
  reason: string | null;
  note: string | null;
}

export type AdminNotification = {
  recipients: string[];
  submissionId: string;
  sponsorshipType: SponsorshipType;
  amountNis: number;
  donor: DonorDetails;
  names: NotificationName[];
  /** Extra context lines, e.g. the chosen bride or the catalog items. */
  details: string[];
}

export type SendEmailResult = { ok: boolean; mocked: boolean }

const PLACEHOLDER_PATTERN = /^(your[-_]|<|changeme|placeholder|xxx)/i;
const DEFAULT_FROM = 'Likrat Kalla <onboarding@resend.dev>';

const TYPE_LABELS: Record<SponsorshipType, string> = {
  package: 'Sponsor a Package',
  kalla_by_date: 'Sponsor a Kalla (browsed by wedding date)',
  kalla_by_story: 'Sponsor a Kalla (browsed by story)',
  catalog_items: 'Catalog items',
  general: 'General donation',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildContent(n: AdminNotification) {
  const typeLabel = TYPE_LABELS[n.sponsorshipType];
  const subject = `New Likrat Kalla donation: ${typeLabel} - ${n.amountNis} NIS`;

  const lines: string[] = [
    `Type: ${typeLabel}`,
    `Amount: ${n.amountNis} NIS`,
    `Donor: ${n.donor.name}`,
    `Email: ${n.donor.email}`,
    `Phone: ${n.donor.phone || '-'}`,
    `Reference: ${n.submissionId}`,
    ...n.details,
  ];
  if (n.names.length > 0) {
    lines.push('', 'Names to pray for:');
    n.names.forEach((p, i) => {
      const extras = [p.reason, p.note].filter(Boolean).join(' - ');
      lines.push(`${i + 1}. ${p.name}${extras ? ` (${extras})` : ''}`);
    });
  }
  lines.push(
    '',
    'The donor was redirected to Lemaan Achai to complete payment. Payment is not confirmed by this email.',
  );

  const text = lines.join('\n');
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.5">${lines
    .map((l) => (l === '' ? '<br/>' : `<div>${escapeHtml(l)}</div>`))
    .join('')}</div>`;

  return { subject, text, html };
}

type OutgoingEmail = {
  recipients: string[];
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Sends an email through Resend when RESEND_API_KEY is set; otherwise logs it
 * to the console (mock mode). Never throws.
 */
async function sendEmail(email: OutgoingEmail): Promise<SendEmailResult> {
  const { subject, text, html } = email;
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const configured = !!apiKey && !PLACEHOLDER_PATTERN.test(apiKey);

  const cleanRecipients = (
    Array.isArray(email.recipients)
      ? email.recipients
      : [String(email.recipients)]
  )
    .map((r) => r.trim())
    .filter((r) => r.length > 0 && r.includes('@'));

  if (!configured || cleanRecipients.length === 0) {
    console.info(
      `[email:mock] To: ${cleanRecipients.join(', ') || '(none)'}\nSubject: ${subject}\n${text}`,
    );
    return { ok: false, mocked: true };
  }

  try {
    const fromAddress = process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: cleanRecipients,
        reply_to: email.replyTo,
        subject,
        text,
        html,
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[email] Resend responded ${response.status}: ${errText}`);
      return { ok: false, mocked: false };
    }
    return { ok: true, mocked: false };
  } catch (err) {
    console.warn('[email] Failed to send email:', err);
    return { ok: false, mocked: false };
  }
}

/**
 * Notifies the admins about a new donation / prayer request.
 * Uses Resend when RESEND_API_KEY is set; otherwise logs the email to the
 * console (mock mode) so the flow works with zero configuration.
 * Never throws.
 */
export async function sendAdminNotification(
  notification: AdminNotification,
): Promise<SendEmailResult> {
  return sendEmail({
    recipients: notification.recipients,
    replyTo: notification.donor.email,
    ...buildContent(notification),
  });
}

export type ContactMessage = {
  recipients: string[];
  name: string;
  email: string;
  phone: string;
  message: string;
}

/**
 * Forwards a message from the public contact form to the admins. Replies go
 * straight to the sender. Never throws.
 */
export async function sendContactMessage(
  contact: ContactMessage,
): Promise<SendEmailResult> {
  const lines = [
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    `Phone: ${contact.phone || '-'}`,
    '',
    'Message:',
    ...contact.message.split(/\r?\n/),
  ];
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.5">${lines
    .map((l) => (l === '' ? '<br/>' : `<div>${escapeHtml(l)}</div>`))
    .join('')}</div>`;

  return sendEmail({
    recipients: contact.recipients,
    replyTo: contact.email,
    subject: `Likrat Kalla contact form: ${contact.name}`,
    text: lines.join('\n'),
    html,
  });
}
