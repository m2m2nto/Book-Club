import cron from 'node-cron';
import { and, eq, notInArray } from 'drizzle-orm';

import { db } from '../db/client.js';
import {
  meetingsTable,
  reminderDeliveriesTable,
  rsvpsTable,
  usersTable,
} from '../db/schema.js';
import {
  renderOneDayFollowUp,
  renderRsvpRequest,
  renderSevenDayReminder,
  sendEmail,
} from './email.js';

export const getLuxembourgDateString = (date: Date) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Luxembourg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const addDays = (dateString: string, days: number) => {
  const date = new Date(`${dateString}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return getLuxembourgDateString(date);
};

const alreadyDelivered = (
  meetingId: number,
  userId: number,
  type: 'seven-day' | 'one-day',
) =>
  db
    .select()
    .from(reminderDeliveriesTable)
    .where(
      and(
        eq(reminderDeliveriesTable.meetingId, meetingId),
        eq(reminderDeliveriesTable.userId, userId),
        eq(reminderDeliveriesTable.type, type),
      ),
    )
    .get();

const recordDelivery = (
  meetingId: number,
  userId: number,
  type: 'seven-day' | 'one-day',
) => {
  db.insert(reminderDeliveriesTable).values({ meetingId, userId, type }).run();
};

export const sendReminderBatchForDate = async (date: string) => {
  const sevenDayMeetings = db
    .select()
    .from(meetingsTable)
    .where(
      and(
        eq(meetingsTable.date, addDays(date, 7)),
        eq(meetingsTable.status, 'scheduled'),
      ),
    )
    .all();

  const oneDayMeetings = db
    .select()
    .from(meetingsTable)
    .where(
      and(
        eq(meetingsTable.date, addDays(date, 1)),
        eq(meetingsTable.status, 'scheduled'),
      ),
    )
    .all();

  for (const meeting of sevenDayMeetings) {
    const recipients = db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.active, true),
          eq(usersTable.emailReminderOptOut, false),
        ),
      )
      .all();

    for (const recipient of recipients) {
      if (alreadyDelivered(meeting.id, recipient.id, 'seven-day')) continue;
      const title = meeting.bookId ? `Book Club Meeting` : 'Book Club Meeting';
      const reminder = renderSevenDayReminder({
        meetingTitle: title,
        date: meeting.date,
        time: meeting.time,
        location: meeting.location,
        meetingId: meeting.id,
      });
      const rsvpRequest = renderRsvpRequest({
        meetingTitle: title,
        date: meeting.date,
        time: meeting.time,
        location: meeting.location,
        meetingId: meeting.id,
      });
      await sendEmail({
        to: recipient.email,
        subject: reminder.subject,
        text: `${reminder.text}\n\n${rsvpRequest.text}`,
      });
      recordDelivery(meeting.id, recipient.id, 'seven-day');
    }
  }

  for (const meeting of oneDayMeetings) {
    const respondedUserIds = db
      .select({ userId: rsvpsTable.userId })
      .from(rsvpsTable)
      .where(eq(rsvpsTable.meetingId, meeting.id))
      .all()
      .map((row) => row.userId);

    const recipients = db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
      })
      .from(usersTable)
      .where(
        respondedUserIds.length
          ? and(
              eq(usersTable.active, true),
              eq(usersTable.emailReminderOptOut, false),
              notInArray(usersTable.id, respondedUserIds),
            )
          : and(
              eq(usersTable.active, true),
              eq(usersTable.emailReminderOptOut, false),
            ),
      )
      .all();

    for (const recipient of recipients) {
      if (alreadyDelivered(meeting.id, recipient.id, 'one-day')) continue;
      const reminder = renderOneDayFollowUp({
        meetingTitle: 'Book Club Meeting',
        date: meeting.date,
        time: meeting.time,
        location: meeting.location,
        meetingId: meeting.id,
      });
      await sendEmail({
        to: recipient.email,
        subject: reminder.subject,
        text: reminder.text,
      });
      recordDelivery(meeting.id, recipient.id, 'one-day');
    }
  }
};

export const runReminderJob = async () => {
  await sendReminderBatchForDate(getLuxembourgDateString(new Date()));
};

export const startReminderScheduler = () => {
  cron.schedule(
    '0 8 * * *',
    () => {
      void runReminderJob();
    },
    {
      timezone: 'Europe/Luxembourg',
    },
  );
};
