/** Dependency-free so `node --test` can import it. */

const MIN_LATIN_WORDS = 2;
/** Letters that only occur in Vietnamese (not in plain English text). */
const VIETNAMESE_LETTERS =
  /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i;

/**
 * Whether a chat message is probably English, so the "Dịch" (translate)
 * button is worth showing. Vietnamese typed without diacritics can still pass;
 * translating it is harmless.
 */
export function looksEnglish(text: string): boolean {
  if (VIETNAMESE_LETTERS.test(text)) return false;
  const words = text.match(/[a-z]+(?:'[a-z]+)?/gi) ?? [];
  return words.length >= MIN_LATIN_WORDS;
}
