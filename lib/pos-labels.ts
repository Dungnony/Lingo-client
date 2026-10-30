/** Vietnamese labels for the server's `WordPos` enum. */
const POS_LABELS: Readonly<Record<string, string>> = {
  NOUN: "Danh từ",
  VERB: "Động từ",
  ADJECTIVE: "Tính từ",
  ADVERB: "Trạng từ",
  PRONOUN: "Đại từ",
  NUMERAL: "Số từ",
  CONJUNCTION: "Liên từ",
  PREPOSITION: "Giới từ",
  ARTICLE: "Mạo từ",
  DETERMINER: "Từ hạn định",
  INTERJECTION: "Thán từ",
  PHRASAL_VERB: "Cụm động từ",
  IDIOM: "Thành ngữ",
  PHRASE: "Cụm từ",
  EXPRESSION: "Cách diễn đạt",
};

/** "Danh từ · Động từ"; OTHER and unknown values are left out. */
export function posLabel(pos: readonly string[]): string {
  return pos
    .map((p) => POS_LABELS[p.toUpperCase()])
    .filter(Boolean)
    .join(" · ");
}
