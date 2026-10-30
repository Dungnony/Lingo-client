"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "./icon";
import styles from "./learning-journey.module.css";

type Stage = {
  letter: string;
  phonetic: string;
  label: string;
  title: string;
  desc: string;
  href: string;
  action: string;
  accent: "red" | "amber";
};

const STAGES: Stage[] = [
  {
    letter: "A",
    phonetic: "/æl.fə.bet/",
    label: "Alphabet & Phonics",
    title: "Làm quen với bảng chữ cái và phiên âm",
    desc: "Bắt đầu từ 26 chữ cái, nguyên âm và phụ âm. Một nền tảng nhỏ để bạn tự tin đọc và phát âm những từ đầu tiên.",
    href: "/vocabulary",
    action: "Khám phá bảng chữ cái",
    accent: "red",
  },
  {
    letter: "P",
    phonetic: "/prəˌnʌn.siˈeɪ.ʃən/",
    label: "Pronunciation",
    title: "Phát âm chuẩn từ đầu",
    desc: "Nghe và luyện phát âm với IPA. Phân biệt các âm khó như /θ/ và /ð/, /ɪ/ và /iː/. Luyện từng âm ngắn để phát âm rõ ngay từ đầu.",
    href: "/pronunciation",
    action: "Luyện phát âm",
    accent: "amber",
  },
  {
    letter: "V",
    phonetic: "/voʊˈkæb.jə.ler.i/",
    label: "Vocabulary",
    title: "Tích lũy những từ đầu tiên",
    desc: "Bắt đầu với chào hỏi, con số và từ dùng hằng ngày. Lật flashcard, nghe phát âm rồi ôn lại đúng lúc.",
    href: "/study",
    action: "Ôn tập từ vựng",
    accent: "red",
  },
  {
    letter: "G",
    phonetic: "/ˈɡræm.ər/",
    label: "Grammar",
    title: "Ghép từ thành câu hoàn chỉnh",
    desc: "Nắm các thì cơ bản, cấu trúc câu và cách dùng giới từ. Từ các mẫu câu đơn giản, tập diễn đạt những điều quen thuộc.",
    href: "/grammar",
    action: "Khám phá ngữ pháp",
    accent: "amber",
  },
  {
    letter: "L",
    phonetic: "/ˈlɪs.ən.ɪŋ/",
    label: "Listening",
    title: "Nghe hiểu tiếng Anh tự nhiên",
    desc: "Nghe từng đoạn ngắn với nhiều giọng nói khác nhau. Quen với nhịp điệu tiếng Anh qua một chút luyện tập mỗi ngày.",
    href: "/listening",
    action: "Bắt đầu luyện nghe",
    accent: "red",
  },
  {
    letter: "S",
    phonetic: "/ˈspiː.kɪŋ/",
    label: "Speaking",
    title: "Tự tin cất lời nói tiếng Anh",
    desc: "Luyện nói theo giọng mẫu, ghi âm và so sánh. Từ những câu đơn giản đến hội thoại thực tế hàng ngày.",
    href: "/pronunciation",
    action: "Luyện nói",
    accent: "amber",
  },
];

export function LearningJourney() {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const stage = STAGES[active];

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % STAGES.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + STAGES.length) % STAGES.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = STAGES.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <section aria-labelledby={`${id}-heading`} className={styles.journey}>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>
            <Icon name="route" size={14} /> NỀN TẢNG TIẾNG ANH
          </p>
          <h2 id={`${id}-heading`}>Sáu chặng, một khởi đầu vững vàng</h2>
        </div>
        <span className={styles.hint}>Chọn một chặng để khám phá</span>
      </div>

      <div
        role="tablist"
        aria-label="Sáu chặng học tiếng Anh"
        className={styles.stages}
      >
        {STAGES.map((item, index) => (
          <button
            key={item.letter}
            ref={(node) => {
              tabs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel-${index}`}
            aria-selected={active === index}
            tabIndex={active === index ? 0 : -1}
            className={styles.stage}
            data-accent={item.accent}
            onClick={() => setActive(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <span className={styles.number}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className={`font-bold text-3xl ${styles.character}`}>
              {item.letter}
            </span>
            <span className={styles.stageLabel}>{item.label}</span>
            <span className={styles.phonetic}>{item.phonetic}</span>
          </button>
        ))}
      </div>

      {STAGES.map((item, index) => (
        <div
          key={item.letter}
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          hidden={active !== index}
          tabIndex={0}
          className={styles.detail}
        >
          <div className={styles.detailCopy}>
            <span className={styles.detailStep}>
              CHẶNG {String(index + 1).padStart(2, "0")}
            </span>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
          <Link href={item.href} className={styles.action}>
            {item.action}
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      ))}
      <span className="sr-only" aria-live="polite">
        Chặng {active + 1}: {stage.label}
      </span>
    </section>
  );
}
