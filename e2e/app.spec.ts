import { expect, test } from '@playwright/test';

const loginAs = async (
  page: import('@playwright/test').Page,
  email: string,
) => {
  await page.goto(`/auth/test-login?email=${encodeURIComponent(email)}`);
  await page.waitForLoadState('networkidle');
};

test('login page renders', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText(/continue with google/i)).toBeVisible();
});

test('admin can create a user', async ({ page }) => {
  await loginAs(page, 'admin@example.com');
  await page.goto('/admin/users');
  await page.getByLabel('Name').fill('Created User');
  await page.getByLabel('Email').fill('created@example.com');
  await page.getByRole('button', { name: /add user/i }).click();
  await expect(
    page.getByText('created@example.com', { exact: true }),
  ).toBeVisible();
});

test('admin can add a book', async ({ page }) => {
  await loginAs(page, 'admin@example.com');
  await page.goto('/books');
  await page.getByLabel('title').fill('The Dispossessed');
  await page.getByLabel('author').fill('Ursula K. Le Guin');
  await page.getByRole('button', { name: /save book/i }).click();
  await expect(
    page.getByRole('link', { name: /The Dispossessed/i }).first(),
  ).toBeVisible();
});

test('member can rate a book', async ({ page }) => {
  await loginAs(page, 'member@example.com');
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
  await loginAs(page, 'admin@example.com');
  await page.goto('/surveys');
  await page.getByLabel('Closes at').fill('2099-12-01T10:00');
  await page.getByText('Foundation').click();
  await page.getByText('Kindred').click();
  await page.getByRole('button', { name: /create survey/i }).click();
  await expect(
    page.getByRole('link', { name: /Next Book Vote/i }).first(),
  ).toBeVisible();

  await loginAs(page, 'member@example.com');
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
  await loginAs(page, 'admin@example.com');
  await page.goto('/meetings');
  const meetingForm = page
    .locator('form')
    .filter({ hasText: /create meeting/i });
  await meetingForm.getByLabel('date').fill('2099-12-20');
  await meetingForm.getByLabel('time').fill('19:00');
  await meetingForm.getByLabel('location').fill('Library');
  await meetingForm.getByRole('button', { name: /create meeting/i }).click();
  await expect(
    page.getByRole('link', { name: /General meeting/i }).first(),
  ).toBeVisible();

  await loginAs(page, 'member@example.com');
  await page.goto('/meetings');
  await page
    .getByRole('link', { name: /General meeting/i })
    .first()
    .click();
  await page.getByRole('button', { name: /^yes$/i }).click();
  await expect(page.getByText(/attendees/i)).toBeVisible();
});
