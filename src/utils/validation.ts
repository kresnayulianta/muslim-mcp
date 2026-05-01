import { z } from "zod";

export const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");
export const TimeSchema = z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM");
