CREATE TABLE `meetings` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `date` text NOT NULL,
  `time` text NOT NULL,
  `location` text NOT NULL,
  `book_id` integer,
  `status` text DEFAULT 'scheduled' NOT NULL,
  `recap` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`book_id`) REFERENCES `books`(`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `meetings_book_unique` ON `meetings` (`book_id`);
--> statement-breakpoint
CREATE TABLE `date_surveys` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `meeting_id` integer,
  `title` text NOT NULL,
  `closes_at` text NOT NULL,
  `created_by_user_id` integer NOT NULL,
  `status` text DEFAULT 'open' NOT NULL,
  `time` text NOT NULL,
  `location` text NOT NULL,
  `book_id` integer,
  `confirmed_option_id` integer,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`),
  FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`book_id`) REFERENCES `books`(`id`)
);
--> statement-breakpoint
CREATE TABLE `date_survey_options` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `date_survey_id` integer NOT NULL,
  `proposed_date` text NOT NULL,
  FOREIGN KEY (`date_survey_id`) REFERENCES `date_surveys`(`id`)
);
--> statement-breakpoint
CREATE TABLE `date_survey_votes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `date_survey_id` integer NOT NULL,
  `date_survey_option_id` integer NOT NULL,
  `user_id` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`date_survey_id`) REFERENCES `date_surveys`(`id`),
  FOREIGN KEY (`date_survey_option_id`) REFERENCES `date_survey_options`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `date_survey_vote_unique` ON `date_survey_votes` (`date_survey_id`, `date_survey_option_id`, `user_id`);
--> statement-breakpoint
CREATE TABLE `rsvps` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `meeting_id` integer NOT NULL,
  `user_id` integer NOT NULL,
  `status` text NOT NULL,
  `responded_at` text,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rsvp_meeting_user_unique` ON `rsvps` (`meeting_id`, `user_id`);
