import nodemailer from 'nodemailer';

import { env } from '../env.js';

type ReminderTemplateInput = {
  meetingTitle: string;
  date: string;
  time: string;
  location: string;
  meetingId: number;
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
    console.log('[email:dev]', { to, subject, text });
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
