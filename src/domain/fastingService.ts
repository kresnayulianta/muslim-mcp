import { getFastingContext as _getFastingContext } from "../providers/hijri/index.js";
import type { FastingContext } from "../types/fasting.js";

export function getFastingContext(date: string): FastingContext {
  return _getFastingContext(date);
}
