import { describe, expect, it, vi } from 'vitest';

import {
  renderOneDayFollowUp,
  renderRsvpRequest,
  renderSevenDayReminder,
  sendEmail,
} from './email.js';

describe('email templates', () => {
  it('renders the reminder templates', () => {
    const input = {
      meetingTitle: 'Dune Discussion',
      date: '2099-12-10',
      time: '19:00',
      location: 'Library',
      meetingId: 42,
    };

    expect(renderSevenDayReminder(input).subject).toMatch(/Dune Discussion/);
    expect(renderRsvpRequest(input).text).toMatch(/RSVP/);
    expect(renderOneDayFollowUp(input).subject).toMatch(/Final RSVP reminder/);
  });

  it('logs in development mode instead of sending', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const result = await sendEmail({
      to: 'member@example.com',
      subject: 'Test',
      text: 'Body',
    });

    expect(result.mode).toBe('dev-log');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
