import { createApp } from './app.js';
import { env } from './env.js';
import { startReminderScheduler } from './services/reminders.js';

const app = createApp();
startReminderScheduler();

app.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
