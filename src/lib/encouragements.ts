import type { Locale } from "./i18n/messages";

const ENCOURAGEMENTS: Record<Locale, string[]> = {
  en: [
    "The room just got a little kinder to you.",
    "That’s real change — you moved the cue, not just the intention.",
    "Friction shifted. Future-you will feel it.",
    "Setup done. The easy path is now the better path.",
    "Small rearrange, quieter willpower bill.",
    "You designed the default. That’s the whole game.",
  ],
  zh: [
    "這個空間對你溫柔了一點點。",
    "這是真的改變——你動的是提示，不是空口意志。",
    "阻力已經挪動了，未來的你會感覺到。",
    "環境設好了。輕鬆的路，現在也是更好的路。",
    "小小重整，省下很多硬撐。",
    "你設計了預設選項——這才是重點。",
  ],
};

export function pickEncouragement(locale: Locale): string {
  const list = ENCOURAGEMENTS[locale] ?? ENCOURAGEMENTS.en;
  return list[Math.floor(Math.random() * list.length)]!;
}
