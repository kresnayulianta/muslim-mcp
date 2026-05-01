export type ReminderType = "pre_prayer" | "post_prayer_followup" | "habit_followup" | "fasting_prep";
export type ReminderPriority = "low" | "medium" | "high";

export type ReminderNeed = {
  type: ReminderType;
  target: string;
  priority: ReminderPriority;
  message: string;
};
