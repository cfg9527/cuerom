import {
  date,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const environmentKindEnum = pgEnum("environment_kind", [
  "physical",
  "digital",
  "mixed",
]);

export const habitPolarityEnum = pgEnum("habit_polarity", ["build", "break"]);

export const habitEnvironmentRoleEnum = pgEnum("habit_environment_role", [
  "primary",
  "secondary",
]);

export const cueTypeEnum = pgEnum("cue_type", [
  "visual",
  "time",
  "social",
  "emotional",
  "other",
]);

export const cueDesirabilityEnum = pgEnum("cue_desirability", [
  "want",
  "avoid",
]);

export const frictionDirectionEnum = pgEnum("friction_direction", [
  "lower",
  "raise",
]);

export const frictionStatusEnum = pgEnum("friction_status", [
  "planned",
  "done",
  "abandoned",
]);

export const checkInResultEnum = pgEnum("check_in_result", [
  "yes",
  "no",
  "skip",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  timezone: text("timezone").notNull().default("UTC"),
  locale: text("locale").notNull().default("en"),
  authProviderId: text("auth_provider_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const environments = pgTable("environments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  kind: environmentKindEnum("kind").notNull().default("physical"),
  notes: text("notes"),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const habits = pgTable("habits", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  polarity: habitPolarityEnum("polarity").notNull().default("build"),
  description: text("description"),
  targetFrequency: text("target_frequency").notNull().default("daily"),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const habitEnvironments = pgTable(
  "habit_environments",
  {
    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    environmentId: uuid("environment_id")
      .notNull()
      .references(() => environments.id, { onDelete: "cascade" }),
    role: habitEnvironmentRoleEnum("role").notNull().default("primary"),
  },
  (t) => [primaryKey({ columns: [t.habitId, t.environmentId] })],
);

export const cues = pgTable("cues", {
  id: uuid("id").defaultRandom().primaryKey(),
  habitId: uuid("habit_id")
    .notNull()
    .references(() => habits.id, { onDelete: "cascade" }),
  environmentId: uuid("environment_id")
    .notNull()
    .references(() => environments.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  cueType: cueTypeEnum("cue_type").notNull().default("visual"),
  desirability: cueDesirabilityEnum("desirability").notNull().default("want"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const frictionLevers = pgTable("friction_levers", {
  id: uuid("id").defaultRandom().primaryKey(),
  habitId: uuid("habit_id")
    .notNull()
    .references(() => habits.id, { onDelete: "cascade" }),
  environmentId: uuid("environment_id")
    .notNull()
    .references(() => environments.id, { onDelete: "cascade" }),
  direction: frictionDirectionEnum("direction").notNull(),
  action: text("action").notNull(),
  status: frictionStatusEnum("status").notNull().default("planned"),
  implementedAt: timestamp("implemented_at", { withTimezone: true }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const checkIns = pgTable(
  "check_ins",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    environmentId: uuid("environment_id").references(() => environments.id, {
      onDelete: "set null",
    }),
    occurredOn: date("occurred_on").notNull(),
    result: checkInResultEnum("result").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("check_ins_habit_day").on(t.habitId, t.occurredOn)],
);

export const proofPhotos = pgTable("proof_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  frictionLeverId: uuid("friction_lever_id").references(() => frictionLevers.id, {
    onDelete: "set null",
  }),
  checkInId: uuid("check_in_id").references(() => checkIns.id, {
    onDelete: "set null",
  }),
  blobUrl: text("blob_url").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const weeklyReviews = pgTable("weekly_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  weekStart: date("week_start").notNull(),
  wins: text("wins"),
  blockers: text("blockers"),
  nextLeverIds: text("next_lever_ids"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
