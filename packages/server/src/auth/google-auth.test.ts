import type { Profile } from 'passport-google-oauth20';
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '../db/client.js';
import {
  bookSurveyOptionsTable,
  bookSurveyVotesTable,
  bookSurveysTable,
  booksTable,
  commentsTable,
  ratingsTable,
  usersTable,
} from '../db/schema.js';
import { completeGoogleLogin } from './google-auth.js';

const buildProfile = (email: string, name = 'Test User'): Profile =>
  ({
    provider: 'google',
    id: `google-${email}`,
    displayName: name,
    name: { familyName: 'User', givenName: 'Test' },
    emails: [{ value: email, verified: true }],
    photos: [{ value: 'https://example.com/avatar.png' }],
    profileUrl: '',
    _raw: '',
    _json: {
      iss: 'accounts.google.com',
      aud: 'client-id',
      sub: `google-${email}`,
      iat: 1,
      exp: 2,
      email,
      email_verified: true,
      name,
      picture: 'https://example.com/avatar.png',
    },
  }) as Profile;

describe('completeGoogleLogin', () => {
  beforeEach(() => {
    db.delete(bookSurveyVotesTable).run();
    db.delete(bookSurveyOptionsTable).run();
    db.delete(bookSurveysTable).run();
    db.delete(commentsTable).run();
    db.delete(ratingsTable).run();
    db.delete(booksTable).run();
    db.delete(usersTable).run();
  });

  it('returns the matching pre-registered user', () => {
    db.insert(usersTable)
      .values({
        email: 'member@example.com',
        name: 'Member',
        role: 'user',
        active: true,
      })
      .run();

    const user = completeGoogleLogin(buildProfile('member@example.com'));

    expect(user.email).toBe('member@example.com');
    expect(user.name).toBe('Test User');
  });

  it('rejects a user whose email is not pre-registered', () => {
    expect(() =>
      completeGoogleLogin(buildProfile('missing@example.com')),
    ).toThrow(/not authorized/i);
  });
});
