export type QuoteType = "quran" | "hadith";
export type QuoteTopic =
  | "sabar"
  | "syukur"
  | "tawakkal"
  | "ibadah"
  | "dhuha"
  | "tahajjud"
  | "sedekah"
  | "ilmu"
  | "akhlak"
  | "taubat"
  | "rezeki"
  | "motivasi";

export type IslamicQuote = {
  id: number;
  type: QuoteType;
  arabic: string;
  indonesian: string;
  source: string;
  topics: QuoteTopic[];
};

export const ISLAMIC_QUOTES: IslamicQuote[] = [
  // ── Al-Quran ──────────────────────────────────────────────────────────────
  {
    id: 1,
    type: "quran",
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    indonesian: "Sesungguhnya bersama kesulitan pasti ada kemudahan.",
    source: "QS. Al-Insyirah: 6",
    topics: ["sabar", "motivasi"],
  },
  {
    id: 2,
    type: "quran",
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    indonesian: "Dan barang siapa bertawakal kepada Allah, niscaya Allah akan mencukupkan (keperluan)nya.",
    source: "QS. At-Talaq: 3",
    topics: ["tawakkal", "rezeki"],
  },
  {
    id: 3,
    type: "quran",
    arabic: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
    indonesian: "Dan mohonlah pertolongan (kepada Allah) dengan sabar dan shalat.",
    source: "QS. Al-Baqarah: 45",
    topics: ["sabar", "ibadah"],
  },
  {
    id: 4,
    type: "quran",
    arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    indonesian: "Sesungguhnya jika kamu bersyukur, pasti Kami akan menambah (nikmat) kepadamu.",
    source: "QS. Ibrahim: 7",
    topics: ["syukur", "rezeki"],
  },
  {
    id: 5,
    type: "quran",
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    indonesian: "Ketahuilah, hanya dengan mengingat Allah hati menjadi tenteram.",
    source: "QS. Ar-Ra'd: 28",
    topics: ["ibadah", "motivasi"],
  },
  {
    id: 6,
    type: "quran",
    arabic: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ",
    indonesian: "Dan Tuhanmu berfirman: Berdoalah kepada-Ku, niscaya akan Aku perkenankan bagimu.",
    source: "QS. Ghafir: 60",
    topics: ["ibadah", "tawakkal"],
  },
  {
    id: 7,
    type: "quran",
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    indonesian: "Sesungguhnya Allah beserta orang-orang yang sabar.",
    source: "QS. Al-Baqarah: 153",
    topics: ["sabar"],
  },
  {
    id: 8,
    type: "quran",
    arabic: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ",
    indonesian: "Dan Aku tidak menciptakan jin dan manusia melainkan supaya mereka menyembah-Ku.",
    source: "QS. Adz-Dzariyat: 56",
    topics: ["ibadah"],
  },
  {
    id: 9,
    type: "quran",
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    indonesian: "Maka sesungguhnya bersama kesulitan ada kemudahan.",
    source: "QS. Al-Insyirah: 5",
    topics: ["sabar", "motivasi"],
  },
  {
    id: 10,
    type: "quran",
    arabic: "وَتَزَوَّدُوا فَإِنَّ خَيْرَ الزَّادِ التَّقْوَىٰ",
    indonesian: "Berbekallah, dan sesungguhnya sebaik-baik bekal adalah takwa.",
    source: "QS. Al-Baqarah: 197",
    topics: ["ibadah", "akhlak"],
  },
  {
    id: 11,
    type: "quran",
    arabic: "يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ",
    indonesian: "Allah menghendaki kemudahan bagimu, dan tidak menghendaki kesukaran bagimu.",
    source: "QS. Al-Baqarah: 185",
    topics: ["motivasi", "tawakkal"],
  },
  {
    id: 12,
    type: "quran",
    arabic: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ",
    indonesian: "Dan dirikanlah shalat serta tunaikanlah zakat.",
    source: "QS. Al-Baqarah: 43",
    topics: ["ibadah", "sedekah"],
  },
  {
    id: 13,
    type: "quran",
    arabic: "وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ",
    indonesian: "Dan barang siapa mengerjakan kebaikan seberat zarrah pun, niscaya dia akan melihat (balasan)nya.",
    source: "QS. Az-Zalzalah: 7",
    topics: ["akhlak", "sedekah"],
  },
  {
    id: 14,
    type: "quran",
    arabic: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ",
    indonesian: "Dan Kami lebih dekat kepadanya daripada urat lehernya sendiri.",
    source: "QS. Qaf: 16",
    topics: ["tawakkal", "ibadah"],
  },
  {
    id: 15,
    type: "quran",
    arabic: "هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ",
    indonesian: "Tidak ada balasan kebaikan kecuali kebaikan (pula).",
    source: "QS. Ar-Rahman: 60",
    topics: ["akhlak", "syukur"],
  },

  // ── Hadith ────────────────────────────────────────────────────────────────
  {
    id: 16,
    type: "hadith",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
    indonesian: "Sesungguhnya setiap amal tergantung pada niatnya.",
    source: "HR. Bukhari no. 1 & Muslim no. 1907",
    topics: ["ibadah", "akhlak"],
  },
  {
    id: 17,
    type: "hadith",
    arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ",
    indonesian: "Bersuci adalah sebagian dari iman.",
    source: "HR. Muslim no. 223",
    topics: ["ibadah"],
  },
  {
    id: 18,
    type: "hadith",
    arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    indonesian: "Amalan yang paling dicintai Allah adalah yang paling konsisten dilakukan meskipun sedikit.",
    source: "HR. Bukhari no. 6464 & Muslim no. 783",
    topics: ["ibadah", "motivasi"],
  },
  {
    id: 19,
    type: "hadith",
    arabic: "مَنْ صَلَّى الضُّحَى اثْنَتَيْ عَشْرَةَ رَكْعَةً بَنَى اللهُ لَهُ بَيْتًا فِي الجَنَّةِ",
    indonesian: "Barang siapa shalat Dhuha 12 rakaat, Allah akan membangunkan untuknya rumah di surga.",
    source: "HR. Tirmidzi no. 473",
    topics: ["dhuha", "ibadah"],
  },
  {
    id: 20,
    type: "hadith",
    arabic: "أَفْضَلُ الصَّلَاةِ بَعْدَ الْفَرِيضَةِ صَلَاةُ اللَّيْلِ",
    indonesian: "Shalat yang paling utama setelah shalat wajib adalah shalat malam.",
    source: "HR. Muslim no. 1163",
    topics: ["tahajjud", "ibadah"],
  },
  {
    id: 21,
    type: "hadith",
    arabic: "يَنْزِلُ رَبُّنَا تَبَارَكَ وَتَعَالَى كُلَّ لَيْلَةٍ إِلَى السَّمَاءِ الدُّنْيَا",
    indonesian: "Tuhan kita turun ke langit dunia setiap malam (sepertiga malam terakhir) dan berfirman: Siapa yang berdoa kepada-Ku maka Aku akan mengabulkannya.",
    source: "HR. Bukhari no. 1145 & Muslim no. 758",
    topics: ["tahajjud", "ibadah"],
  },
  {
    id: 22,
    type: "hadith",
    arabic: "الصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ",
    indonesian: "Sedekah dapat menghapus dosa sebagaimana air memadamkan api.",
    source: "HR. Tirmidzi no. 2616",
    topics: ["sedekah", "taubat"],
  },
  {
    id: 23,
    type: "hadith",
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللهُ لَهُ طَرِيقًا إِلَى الجَنَّةِ",
    indonesian: "Barang siapa menempuh jalan untuk mencari ilmu, Allah akan mudahkan baginya jalan menuju surga.",
    source: "HR. Muslim no. 2699",
    topics: ["ilmu"],
  },
  {
    id: 24,
    type: "hadith",
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    indonesian: "Sebaik-baik kalian adalah yang mempelajari Al-Quran dan mengajarkannya.",
    source: "HR. Bukhari no. 5027",
    topics: ["ilmu", "ibadah"],
  },
  {
    id: 25,
    type: "hadith",
    arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
    indonesian: "Muslim (yang sejati) adalah orang yang kaum muslimin selamat dari lisan dan tangannya.",
    source: "HR. Bukhari no. 10 & Muslim no. 41",
    topics: ["akhlak"],
  },
  {
    id: 26,
    type: "hadith",
    arabic: "اتَّقِ اللهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا",
    indonesian: "Bertakwalah kepada Allah di mana pun kamu berada, dan ikutilah keburukan dengan kebaikan yang akan menghapusnya.",
    source: "HR. Tirmidzi no. 1987",
    topics: ["taubat", "akhlak"],
  },
  {
    id: 27,
    type: "hadith",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    indonesian: "Barang siapa beriman kepada Allah dan hari akhir, hendaklah ia berkata baik atau diam.",
    source: "HR. Bukhari no. 6018 & Muslim no. 47",
    topics: ["akhlak"],
  },
  {
    id: 28,
    type: "hadith",
    arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
    indonesian: "Orang kuat bukanlah yang pandai bergulat, melainkan orang yang mampu menahan diri ketika marah.",
    source: "HR. Bukhari no. 6114 & Muslim no. 2609",
    topics: ["akhlak", "sabar"],
  },
  {
    id: 29,
    type: "hadith",
    arabic: "إِنَّ اللهَ كَتَبَ الإِحْسَانَ عَلَى كُلِّ شَيْءٍ",
    indonesian: "Sesungguhnya Allah mewajibkan ihsan (berbuat baik) dalam segala hal.",
    source: "HR. Muslim no. 1955",
    topics: ["akhlak"],
  },
  {
    id: 30,
    type: "hadith",
    arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ",
    indonesian: "Senyummu kepada saudaramu adalah sedekah.",
    source: "HR. Tirmidzi no. 1956",
    topics: ["sedekah", "akhlak"],
  },
  {
    id: 31,
    type: "hadith",
    arabic: "أَرْبَعُ رَكَعَاتٍ مِنْ قَبْلِ الظُّهْرِ تَعْدِلُ صَلَاةَ السَّحَرِ",
    indonesian: "Empat rakaat sebelum Zuhur (shalat Dhuha di akhir waktunya) menyamai (keutamaan) shalat di waktu sahur.",
    source: "HR. Abu Dawud no. 1270",
    topics: ["dhuha", "ibadah"],
  },
  {
    id: 32,
    type: "hadith",
    arabic: "عَلَيْكُمْ بِصِدْقِ الْحَدِيثِ فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ",
    indonesian: "Hendaklah kalian selalu jujur, karena kejujuran membawa kepada kebaikan.",
    source: "HR. Bukhari no. 6094 & Muslim no. 2607",
    topics: ["akhlak"],
  },
  {
    id: 33,
    type: "hadith",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    indonesian: "Sedekah tidak akan mengurangi harta.",
    source: "HR. Muslim no. 2588",
    topics: ["sedekah", "rezeki"],
  },
  {
    id: 34,
    type: "hadith",
    arabic: "مَنْ أَحَبَّ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ... فَلْيَصِلْ رَحِمَهُ",
    indonesian: "Barang siapa ingin diluaskan rezekinya, hendaklah ia menyambung silaturahmi.",
    source: "HR. Bukhari no. 5986 & Muslim no. 2557",
    topics: ["rezeki", "akhlak"],
  },
  {
    id: 35,
    type: "hadith",
    arabic: "إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ",
    indonesian: "Jika manusia meninggal, terputuslah amalnya kecuali tiga hal: sedekah jariyah, ilmu yang bermanfaat, dan doa anak yang shalih.",
    source: "HR. Muslim no. 1631",
    topics: ["sedekah", "ilmu", "ibadah"],
  },
  {
    id: 36,
    type: "hadith",
    arabic: "مَنْ تَوَضَّأَ فَأَحْسَنَ الْوُضُوءَ ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُسَهِّي فِيهِمَا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    indonesian: "Barang siapa berwudhu dengan baik kemudian shalat dua rakaat dengan khusyuk, maka dosanya yang telah lalu diampuni.",
    source: "HR. Bukhari no. 159 & Muslim no. 226",
    topics: ["taubat", "ibadah"],
  },
  {
    id: 37,
    type: "hadith",
    arabic: "الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ",
    indonesian: "Dunia adalah penjara bagi orang mukmin dan surga bagi orang kafir.",
    source: "HR. Muslim no. 2956",
    topics: ["motivasi", "sabar"],
  },
  {
    id: 38,
    type: "hadith",
    arabic: "خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ",
    indonesian: "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.",
    source: "HR. Ahmad, dinilai hasan oleh Al-Albani",
    topics: ["akhlak", "motivasi"],
  },
  {
    id: 39,
    type: "hadith",
    arabic: "الصَّلَاةُ عِمَادُ الدِّينِ",
    indonesian: "Shalat adalah tiang agama.",
    source: "HR. Al-Baihaqi, dinilai hasan",
    topics: ["ibadah"],
  },
  {
    id: 40,
    type: "hadith",
    arabic: "مَنْ قَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    indonesian: "Barang siapa mendirikan shalat malam di bulan Ramadan karena iman dan mengharap pahala, akan diampuni dosa-dosanya yang telah lalu.",
    source: "HR. Bukhari no. 2008 & Muslim no. 760",
    topics: ["tahajjud", "taubat", "ibadah"],
  },
];

/**
 * Get a quote for today (deterministic based on date string YYYY-MM-DD),
 * or a random one if no date given.
 */
export function getDailyQuote(dateStr?: string): IslamicQuote {
  if (!dateStr) {
    return ISLAMIC_QUOTES[Math.floor(Math.random() * ISLAMIC_QUOTES.length)]!;
  }
  // Simple hash: sum of char codes mod total quotes
  const hash = dateStr.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ISLAMIC_QUOTES[hash % ISLAMIC_QUOTES.length]!;
}

/**
 * Get quotes filtered by topic.
 */
export function getQuotesByTopic(topic: QuoteTopic, limit = 5): IslamicQuote[] {
  const filtered = ISLAMIC_QUOTES.filter((q) => q.topics.includes(topic));
  return filtered.slice(0, limit);
}
