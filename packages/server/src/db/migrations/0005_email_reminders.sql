ALTER TABLE `users` ADD COLUMN `email_reminder_opt_out` integer DEFAULT false NOT NULL;
--> statement-breakpoint
CREATE TABLE `reminder_deliveries` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `meeting_id` integer NOT NULL,
  `user_id` integer NOT NULL,
  `type` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reminder_delivery_unique` ON `reminder_deliveries` (`meeting_id`, `user_id`, `type`);
