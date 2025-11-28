CREATE TABLE `albums` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`couple_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`cover_url` text,
	`photo_count` integer DEFAULT 0,
	`create_time` text NOT NULL,
	`update_time` text NOT NULL,
	FOREIGN KEY (`couple_id`) REFERENCES `couples`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `anniversaries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`couple_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`date` text NOT NULL,
	`type` text DEFAULT 'custom',
	`icon` text DEFAULT '❤️',
	`color` text DEFAULT '#FFE4E9',
	`images` text,
	`is_repeat` integer DEFAULT 1,
	`remind_days` text DEFAULT '[1,7]',
	`is_active` integer DEFAULT 1,
	`create_time` text NOT NULL,
	`update_time` text NOT NULL,
	FOREIGN KEY (`couple_id`) REFERENCES `couples`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`target_type` text NOT NULL,
	`target_id` integer NOT NULL,
	`couple_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`content` text NOT NULL,
	`parent_id` integer,
	`create_time` text NOT NULL,
	FOREIGN KEY (`couple_id`) REFERENCES `couples`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `couples` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`partner_id` integer,
	`status` integer DEFAULT 0,
	`love_start_date` text,
	`relationship_type` integer DEFAULT 0,
	`couple_nickname_1` text,
	`couple_nickname_2` text,
	`couple_avatar` text,
	`signature` text,
	`theme` text DEFAULT 'romantic-pink',
	`create_time` text NOT NULL,
	`update_time` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`partner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `daily_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`couple_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`task_date` text NOT NULL,
	`check_in` integer DEFAULT 0,
	`check_in_time` text,
	`good_morning` integer DEFAULT 0,
	`good_morning_time` text,
	`good_night` integer DEFAULT 0,
	`good_night_time` text,
	`mood` text,
	`points` integer DEFAULT 0,
	`create_time` text NOT NULL,
	`update_time` text NOT NULL,
	FOREIGN KEY (`couple_id`) REFERENCES `couples`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `diaries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`couple_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`title` text,
	`content` text NOT NULL,
	`mood` text,
	`weather` text,
	`location` text,
	`latitude` real,
	`longitude` real,
	`images` text,
	`videos` text,
	`is_private` integer DEFAULT 0,
	`like_count` integer DEFAULT 0,
	`comment_count` integer DEFAULT 0,
	`diary_date` text NOT NULL,
	`create_time` text NOT NULL,
	`update_time` text NOT NULL,
	FOREIGN KEY (`couple_id`) REFERENCES `couples`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`couple_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`code` text NOT NULL,
	`status` integer DEFAULT 0,
	`expire_time` text NOT NULL,
	`create_time` text NOT NULL,
	FOREIGN KEY (`couple_id`) REFERENCES `couples`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`target_type` text NOT NULL,
	`target_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`create_time` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `love_quotes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`author` text,
	`source` text,
	`category` text,
	`is_system` integer DEFAULT 1,
	`create_time` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`couple_id` integer NOT NULL,
	`sender_id` integer NOT NULL,
	`receiver_id` integer NOT NULL,
	`type` text DEFAULT 'text',
	`content` text,
	`media_url` text,
	`special_type` text,
	`is_read` integer DEFAULT 0,
	`read_time` text,
	`create_time` text NOT NULL,
	FOREIGN KEY (`couple_id`) REFERENCES `couples`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`album_id` integer NOT NULL,
	`couple_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`url` text NOT NULL,
	`thumbnail_url` text,
	`width` integer,
	`height` integer,
	`description` text,
	`location` text,
	`latitude` real,
	`longitude` real,
	`taken_at` text,
	`like_count` integer DEFAULT 0,
	`create_time` text NOT NULL,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`couple_id`) REFERENCES `couples`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`couple_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text DEFAULT 'other',
	`start_time` text NOT NULL,
	`end_time` text,
	`is_all_day` integer DEFAULT 0,
	`location` text,
	`latitude` real,
	`longitude` real,
	`repeat_type` text DEFAULT 'none',
	`color` text DEFAULT '#FF6B9D',
	`status` integer DEFAULT 0,
	`create_time` text NOT NULL,
	`update_time` text NOT NULL,
	FOREIGN KEY (`couple_id`) REFERENCES `couples`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone` text NOT NULL,
	`password` text,
	`nick_name` text NOT NULL,
	`avatar_url` text,
	`gender` integer DEFAULT 0,
	`birthday` text,
	`constellation` text,
	`hobby` text,
	`create_time` text NOT NULL,
	`update_time` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invites_code_unique` ON `invites` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);