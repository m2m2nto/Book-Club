CREATE TABLE `books` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `author` text NOT NULL,
  `cover_url` text,
  `description` text,
  `open_library_id` text,
  `status` text DEFAULT 'wishlist' NOT NULL,
  `date_read` text,
  `suggested_by_user_id` integer,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`suggested_by_user_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `book_id` integer NOT NULL,
  `user_id` integer NOT NULL,
  `score` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`book_id`) REFERENCES `books`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ratings_book_user_unique` ON `ratings` (`book_id`, `user_id`);
--> statement-breakpoint
CREATE TABLE `comments` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `book_id` integer NOT NULL,
  `user_id` integer NOT NULL,
  `text` text NOT NULL,
  `is_private` integer DEFAULT false NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`book_id`) REFERENCES `books`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE INDEX `comments_book_id_idx` ON `comments` (`book_id`);
