import { expect, test, type Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

const credentials = {
  admin: {
    email: 'admin@example.com',
    password: 'AdminPass123!',
  },
  member: {
    email: 'member@example.com',
    password: 'MemberPass123!',
  },
};

const loginAs = async (
  page: Page,
  email: string,
  password: string,
) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await page.waitForURL('**/');
};

const logout = async (page: Page) => {
  await page.getByRole('button', { name: /log out/i }).click();
  await page.waitForURL(/\/login/);
};

test('login page renders for password access', async ({ page }) => {
  await page.goto('/login');
  await expect(
    page.getByRole('heading', { name: /sign in with email/i }),
  ).toBeVisible();
  await expect(
    page.getByText(/invite-only, now through email and password/i),
  ).toBeVisible();
});

test('admin can invite a user, the user sets a password, and then signs in', async ({
  page,
}) => {
  await loginAs(page, credentials.admin.email, credentials.admin.password);
  await page.goto('/admin/users');
  await page.getByLabel('Name').fill('Created User');
  await page.getByLabel('Email').fill('created@example.com');
  await page.getByRole('button', { name: /add user/i }).click();
  await expect(page.getByText('created@example.com', { exact: true })).toBeVisible();

  const row = page.locator('tr', { hasText: 'created@example.com' });
  await row.getByRole('button', { name: /send invite/i }).click();

  const resetLink = await page
    .getByText(/http:\/\/127\.0\.0\.1:5173\/reset-password\?token=/i)
    .textContent();

  expect(resetLink).toBeTruthy();
  const invitePage = await page.context().newPage();
  await invitePage.goto(resetLink!);
  await invitePage.getByLabel('New password').fill('CreatedPass123!');
  await invitePage.getByLabel('Confirm password').fill('CreatedPass123!');
  await invitePage.getByRole('button', { name: /save password/i }).click();
  await invitePage.waitForURL('**/login?reset=success');
  await invitePage.close();

  await logout(page);
  await page.goto('/login');
  await page.getByLabel('Email').fill('created@example.com');
  await page.getByLabel('Password').fill('CreatedPass123!');
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await page.waitForURL('**/');
  await expect(page.getByText(/your book club at a glance/i)).toBeVisible();
});

test('admin can add a book', async ({ page }) => {
  await loginAs(page, credentials.admin.email, credentials.admin.password);
  await page.goto('/books');
  await page.getByLabel('title').fill('The Dispossessed');
  await page.getByLabel('author').fill('Ursula K. Le Guin');
  await page.getByRole('button', { name: /save book/i }).click();
  await expect(
    page.getByRole('link', { name: /The Dispossessed/i }).first(),
  ).toBeVisible();
});

test('member can rate a book', async ({ page }) => {
  await loginAs(page, credentials.member.email, credentials.member.password);
  await page.goto('/books');
  await page.getByRole('link', { name: /Foundation/i }).click();
  await page
    .locator('button')
    .filter({ has: page.locator('svg') })
    .nth(3)
    .click();
  await expect(page.getByRole('heading', { name: 'Ratings' })).toBeVisible();
});

test('member can vote in a survey', async ({ page }) => {
  await loginAs(page, credentials.admin.email, credentials.admin.password);
  await page.goto('/surveys');
  await page.getByLabel('Closes at').fill('2099-12-01T10:00');
  await page.getByText('Foundation').click();
  await page.getByText('Kindred').click();
  await page.getByRole('button', { name: /create survey/i }).click();
  await expect(
    page.getByRole('link', { name: /Next Book Vote/i }).first(),
  ).toBeVisible();

  await logout(page);
  await loginAs(page, credentials.member.email, credentials.member.password);
  await page.goto('/surveys');
  await page
    .getByRole('link', { name: /Next Book Vote/i })
    .first()
    .click();
  await page
    .getByRole('button', { name: /^Select$/ })
    .first()
    .click();
  await page.getByRole('button', { name: /submit vote/i }).click();
  await expect(page.getByText(/selected as #1/i)).toBeVisible();
});

test('member can RSVP to a meeting', async ({ page }) => {
  await loginAs(page, credentials.admin.email, credentials.admin.password);
  await page.goto('/meetings');
  const meetingForm = page.locator('form').filter({ hasText: /create meeting/i });
  await meetingForm.getByLabel('date').fill('2099-12-20');
  await meetingForm.getByLabel('time').fill('19:00');
  await meetingForm.getByLabel('location').fill('Library');
  await meetingForm.getByRole('button', { name: /create meeting/i }).click();
  await expect(
    page.getByRole('link', { name: /General meeting/i }).first(),
  ).toBeVisible();

  await logout(page);
  await loginAs(page, credentials.member.email, credentials.member.password);
  await page.goto('/meetings');
  await page
    .getByRole('link', { name: /General meeting/i })
    .first()
    .click();
  await page.getByRole('button', { name: /^yes$/i }).click();
  await expect(page.getByText(/attendees/i)).toBeVisible();
});

test('admin can trigger a reset link and a member can sign in with the new password', async ({
  page,
}) => {
  await loginAs(page, credentials.admin.email, credentials.admin.password);
  await page.goto('/admin/users');

  const row = page.locator('tr', { hasText: 'member@example.com' });
  await row.getByRole('button', { name: /reset password/i }).click();

  const resetLink = await page
    .getByText(/http:\/\/127\.0\.0\.1:5173\/reset-password\?token=/i)
    .textContent();

  expect(resetLink).toBeTruthy();
  const resetPage = await page.context().newPage();
  await resetPage.goto(resetLink!);
  await resetPage.getByLabel('New password').fill('MemberPass456!');
  await resetPage.getByLabel('Confirm password').fill('MemberPass456!');
  await resetPage.getByRole('button', { name: /save password/i }).click();
  await resetPage.waitForURL('**/login?reset=success');
  await resetPage.close();

  await logout(page);
  await page.goto('/login');
  await page.getByLabel('Email').fill(credentials.member.email);
  await page.getByLabel('Password').fill('MemberPass456!');
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await page.waitForURL('**/');
  await expect(page.getByText(/your book club at a glance/i)).toBeVisible();
});
