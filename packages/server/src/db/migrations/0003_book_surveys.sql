CREATE TABLE `book_surveys` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `max_votes` integer DEFAULT 1 NOT NULL,
  `closes_at` text NOT NULL,
  `created_by_user_id` integer NOT NULL,
  `status` text DEFAULT 'open' NOT NULL,
  `resolved_by_user_id` integer,
  `resolved_book_id` integer,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`resolved_by_user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`resolved_book_id`) REFERENCES `books`(`id`)
);
--> statement-breakpoint
CREATE TABLE `book_survey_options` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `survey_id` integer NOT NULL,
  `book_id` integer NOT NULL,
  FOREIGN KEY (`survey_id`) REFERENCES `book_surveys`(`id`),
  FOREIGN KEY (`book_id`) REFERENCES `books`(`id`)
);
--> statement-breakpoint
CREATE TABLE `book_survey_votes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `survey_id` integer NOT NULL,
  `survey_option_id` integer NOT NULL,
  `user_id` integer NOT NULL,
  `rank` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`survey_id`) REFERENCES `book_surveys`(`id`),
  FOREIGN KEY (`survey_option_id`) REFERENCES `book_survey_options`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `book_survey_vote_unique` ON `book_survey_votes` (`survey_id`, `user_id`, `rank`);
