import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../db/client.js';
import { resetDatabase } from '../db/test-cleanup.js';
import {
  booksTable,
  meetingsTable,
  reminderDeliveriesTable,
  rsvpsTable,
  usersTable,
} from '../db/schema.js';
import * as emailService from './email.js';
import { sendReminderBatchForDate } from './reminders.js';

describe('reminder scheduling', () => {
  beforeEach(() => {
    resetDatabase();
    db.delete(reminderDeliveriesTable).run();
  });

  it('sends 7-day reminders once and respects opt-out', async () => {
    const users = db
      .insert(usersTable)
      .values([
        {
          email: 'admin@example.com',
          name: 'Admin',
          role: 'admin',
          active: true,
          emailReminderOptOut: false,
        },
        {
          email: 'member@example.com',
          name: 'Member',
          role: 'user',
          active: true,
          emailReminderOptOut: false,
        },
        {
          email: 'optout@example.com',
          name: 'Opt Out',
          role: 'user',
          active: true,
          emailReminderOptOut: true,
        },
      ])
      .returning()
      .all();

    const book = db
      .insert(booksTable)
      .values({ title: 'Dune', author: 'Frank Herbert', status: 'reading' })
      .returning()
      .get();
    db.insert(meetingsTable)
      .values({
        date: '2099-12-08',
        time: '19:00',
        location: 'Library',
        bookId: book.id,
        status: 'scheduled',
      })
      .run();

    const sendSpy = vi
      .spyOn(emailService, 'sendEmail')
      .mockResolvedValue({ delivered: false, mode: 'dev-log' });

    await sendReminderBatchForDate('2099-12-01');
    await sendReminderBatchForDate('2099-12-01');

    expect(sendSpy).toHaveBeenCalledTimes(2);
    expect(db.select().from(reminderDeliveriesTable).all()).toHaveLength(2);
    expect(users).toHaveLength(3);

    sendSpy.mockRestore();
  });

  it('sends 1-day follow-up only to members without RSVP', async () => {
    const users = db
      .insert(usersTable)
      .values([
        {
          email: 'admin@example.com',
          name: 'Admin',
          role: 'admin',
          active: true,
          emailReminderOptOut: false,
        },
        {
          email: 'member@example.com',
          name: 'Member',
          role: 'user',
          active: true,
          emailReminderOptOut: false,
        },
      ])
      .returning()
      .all();

    const meeting = db
      .insert(meetingsTable)
      .values({
        date: '2099-12-02',
        time: '19:00',
        location: 'Library',
        bookId: null,
        status: 'scheduled',
      })
      .returning()
      .get();

    db.insert(rsvpsTable)
      .values({
        meetingId: meeting.id,
        userId: users[0]!.id,
        status: 'yes',
        respondedAt: new Date().toISOString(),
      })
      .run();

    const sendSpy = vi
      .spyOn(emailService, 'sendEmail')
      .mockResolvedValue({ delivered: false, mode: 'dev-log' });

    await sendReminderBatchForDate('2099-12-01');

    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy.mock.calls[0]?.[0].to).toBe('member@example.com');
    sendSpy.mockRestore();
  });
});
