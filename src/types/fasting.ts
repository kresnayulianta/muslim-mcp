export type FastingType = "senin" | "kamis" | "ayyamul_bidh" | "arafah" | "asyura" | "tasu_a" | "ramadan";

export type FastingContext = {
  date: string;
  is_recommended_fasting_day: boolean;
  fasting_types: FastingType[];
  notes: string[];
};
