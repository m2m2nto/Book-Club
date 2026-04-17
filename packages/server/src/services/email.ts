import nodemailer from 'nodemailer';

import { env } from '../env.js';

type ReminderTemplateInput = {
  meetingTitle: string;
  date: string;
  time: string;
  location: string;
  meetingId: number;
};

type AuthLinkTemplateInput = {
  name: string;
  resetUrl: string;
  expiresAt: string;
};

export const renderSevenDayReminder = ({
  meetingTitle,
  date,
  time,
  location,
  meetingId,
}: ReminderTemplateInput) => ({
  subject: `Book Club Reminder: ${meetingTitle} is coming up`,
  text: [
    `Your next book club meeting is in about 7 days.`,
    '',
    `Book: ${meetingTitle}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Location: ${location}`,
    '',
    `Please RSVP here: ${env.clientUrl}/meetings/${meetingId}`,
  ].join('\n'),
});

export const renderRsvpRequest = ({
  meetingTitle,
  date,
  time,
  location,
  meetingId,
}: ReminderTemplateInput) => ({
  subject: `Please RSVP for ${meetingTitle}`,
  text: [
    `Please confirm your attendance for the upcoming meeting.`,
    '',
    `Book: ${meetingTitle}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Location: ${location}`,
    '',
    `RSVP here: ${env.clientUrl}/meetings/${meetingId}`,
  ].join('\n'),
});

export const renderOneDayFollowUp = ({
  meetingTitle,
  date,
  time,
  location,
  meetingId,
}: ReminderTemplateInput) => ({
  subject: `Final RSVP reminder for ${meetingTitle}`,
  text: [
    `Your meeting is tomorrow and we still need your RSVP.`,
    '',
    `Book: ${meetingTitle}`,
    `Date: ${date}`,
    `Time: ${time}`,
    `Location: ${location}`,
    '',
    `Respond here: ${env.clientUrl}/meetings/${meetingId}`,
  ].join('\n'),
});

export const renderInviteEmail = ({
  name,
  resetUrl,
  expiresAt,
}: AuthLinkTemplateInput) => ({
  subject: 'You are invited to Book Club Journal',
  text: [
    `Hi ${name},`,
    '',
    'You have been invited to join your book club workspace.',
    'Use the link below to set your password and sign in:',
    '',
    resetUrl,
    '',
    `This link expires at ${expiresAt}.`,
  ].join('\n'),
});

export const renderPasswordResetEmail = ({
  name,
  resetUrl,
  expiresAt,
}: AuthLinkTemplateInput) => ({
  subject: 'Reset your Book Club Journal password',
  text: [
    `Hi ${name},`,
    '',
    'We received a request to reset your password.',
    'Use the link below to choose a new password:',
    '',
    resetUrl,
    '',
    `This link expires at ${expiresAt}.`,
    'If you did not request this change, you can ignore this email.',
  ].join('\n'),
});

const createTransporter = () => {
  if (!env.smtpHost || !env.smtpPort || !env.smtpUser || !env.smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
};

export const sendEmail = async ({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) => {
  if (env.nodeEnv !== 'production') {
    console.log('[email:dev]', {
      toDomain: to.includes('@') ? to.split('@')[1] : 'unknown',
      subject,
      textPreview: `${text.slice(0, 80)}${text.length > 80 ? '…' : ''}`,
    });
    return { delivered: false, mode: 'dev-log' as const };
  }

  const transporter = createTransporter();
  if (!transporter || !env.smtpFrom) {
    throw new Error('SMTP is not configured.');
  }

  await transporter.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    text,
  });

  return { delivered: true, mode: 'smtp' as const };
};
