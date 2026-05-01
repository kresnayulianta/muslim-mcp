export type DailyChecklist = {
  subuh_done: boolean;
  zuhur_done: boolean;
  asar_done: boolean;
  maghrib_done: boolean;
  isya_done: boolean;
  dhuha_done: boolean;
  quran_done: boolean;
  dzikir_pagi_done: boolean;
  dzikir_petang_done: boolean;
  fasting_today: boolean;
  fasting_type: string | null;
};
