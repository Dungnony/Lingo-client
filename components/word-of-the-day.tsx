"use client";

import Link from "next/link";
import useSWR from "swr";
import { AudioButton } from "./audio-button";
import { Icon } from "./icon";
import { Card } from "./ui";
import { apiFetch } from "@/lib/api";
import type { Word } from "@/lib/types";
import styles from "./word-of-the-day.module.css";

const fetcher = (path: string) => apiFetch<Word>(path);

/** Thẻ "Từ vựng hôm nay" trên dashboard — 1 từ cố định theo ngày, giống
 * nhau cho mọi user (xem `WordsService.ofTheDay()`), tạo cảm giác mới mẻ
 * mỗi lần ghé dù không vào học. Im lặng ẩn đi nếu lỗi/chưa tải xong — đây
 * là nội dung phụ, không đáng để hiện lỗi làm rối dashboard. */
export function WordOfTheDayCard() {
  const { data } = useSWR<Word>("/words/of-the-day", fetcher);
  if (!data) return null;

  return (
    <Card className={styles.card}>
      <div className={styles.topline}>
        <span className={styles.label}><Icon name="spark" size={14} /> Từ vựng hôm nay</span>
        <span className={styles.level}>Level {data.level}</span>
      </div>
      <div className={styles.word}>
        <span
          className={styles.character}
          data-long={data.word.length > 8 || undefined}
        >
          <span className="text-3xl font-bold">{data.word}</span>
        </span>
        <div className={styles.definition}>
          <p className={styles.phonetic}>
            <span>{data.pronunciation}</span>
            <AudioButton src={data.audioUrl} text={data.word} size={15} />
          </p>
          <p className={styles.meaning}>{data.meaningVi}</p>
        </div>
      </div>
      <Link
        href={`/vocabulary?level=${data.level}`}
        className={styles.action}
      >
        Khám phá thêm <span><Icon name="arrow" size={15} /></span>
      </Link>
    </Card>
  );
}
