import {
  boolean,
  date,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const dailyProgress = pgTable(
  "daily_progress",
  {
    userId: text().notNull(),
    // the user's LOCAL calendar date, stored as 'YYYY-MM-DD'
    day: date({ mode: "string" }).notNull(),
    hasanatEarned: integer().notNull().default(0),
    goalSnapshot: integer().notNull(),
    completed: boolean().notNull().default(false),
    completedAt: timestamp({ withTimezone: true }),

    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })]
);

export const userStreaks = pgTable("user_streaks", {
  userId: text().primaryKey(),
  currentStreak: integer().notNull().default(0),
  longestStreak: integer().notNull().default(0),
  lastCompletedDay: date({ mode: "string" }), // null = never
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
