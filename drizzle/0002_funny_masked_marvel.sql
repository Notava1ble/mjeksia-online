PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_test_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`time_left` integer,
	`score` integer DEFAULT 0 NOT NULL,
	`total_questions` integer NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_test_sessions`("id", "created_at", "time_left", "score", "total_questions", "is_completed") SELECT "id", "created_at", "time_left", "score", "total_questions", "is_completed" FROM `test_sessions`;--> statement-breakpoint
DROP TABLE `test_sessions`;--> statement-breakpoint
ALTER TABLE `__new_test_sessions` RENAME TO `test_sessions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;