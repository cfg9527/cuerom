import type { Locale } from "@/lib/i18n/messages";

export type SceneId = "xu" | "yi" | "er";

export type ContentBlock =
  | { kind: "prose"; zh: string; en: string; locked?: boolean }
  | { kind: "label"; zh: string; en: string }
  | { kind: "stage"; zh: string; en: string; action: string; habit: string; room: string }
  | { kind: "note"; zh: string; en: string };

export type NovelScene = {
  id: SceneId;
  mark: string;
  title: { zh: string; en: string };
  atmosphere: string;
  blocks: ContentBlock[];
};

/** Locked 序 — user prose, 2026-10-12. Do not paraphrase. */
export const XU_PROSE_ZH =
  "當孩子歷經情感的幽暗後，終須踏上自我療癒的旅程。步步深入內心，在反覆進出的省察與沉澱中前行。\n也許終究沒有所謂的釋懷，有的只是不斷地走入、走出。然而，這般進退往復終究是一種流動與探索，哪怕只是前移半步，也遠勝於困在樓梯轉角處懸空駐足、進退維谷。";

/** Careful EN facing translation of locked 序 (not marketing copy). */
export const XU_PROSE_EN =
  "When a child has passed through emotional darkness, they must at last set out on the journey of self-healing—stepping deeper into the inner self, advancing through repeated passages of reflection and settling.\nPerhaps there is no such thing as final release; only the continual walking in and walking out. Yet this back-and-forth is itself a flow and an exploration. Even half a step forward is far better than hanging suspended on a stair landing, unable to go up or down.";

export const NOVEL_SCENES: NovelScene[] = [
  {
    id: "xu",
    mark: "序",
    title: { zh: "序", en: "Preface" },
    atmosphere: "ink-dawn",
    blocks: [
      {
        kind: "prose",
        locked: true,
        zh: XU_PROSE_ZH,
        en: XU_PROSE_EN,
      },
      {
        kind: "note",
        zh: "中門是門檻。推開它，進入第一幕。",
        en: "The door is the threshold. Open it to enter scene one.",
      },
    ],
  },
  {
    id: "yi",
    mark: "一",
    title: { zh: "一 · 水", en: "I · Water" },
    atmosphere: "desk-light",
    blocks: [
      {
        kind: "label",
        zh: "〔草稿場景 · 取材自起步習慣「飲水」〕",
        en: "[Draft scene · from starter habit “Drink water”]",
      },
      {
        kind: "prose",
        zh: "書桌先於意志醒來。若杯中空空，喉嚨便學會等待；若水已在眼前，飲下只是伸手的距離。這一幕不談堅持，只談把滿的那一瓶，放回視線裡。",
        en: "The desk wakes before willpower. An empty cup teaches the throat to wait; a filled bottle within sight makes drinking only a reach away. This scene is not about grit—only about returning water to the line of sight.",
      },
      {
        kind: "stage",
        zh: "舞台指示：在書桌上放一瓶／一杯已裝滿的水。",
        en: "Stage direction: Keep a filled bottle or cup on the desk.",
        action: "在書桌上放一瓶／一杯已裝滿的水",
        habit: "飲水",
        room: "書桌",
      },
      {
        kind: "note",
        zh: "道具就位後，可選上傳一張實證，並收下一句旁白。",
        en: "Once the prop is in place, you may add a proof photo and receive a line of narration.",
      },
    ],
  },
  {
    id: "er",
    mark: "二",
    title: { zh: "二 · 遠距", en: "II · Distance" },
    atmosphere: "night-room",
    blocks: [
      {
        kind: "label",
        zh: "〔草稿場景 · 取材自起步習慣「少滑手機」〕",
        en: "[Draft scene · from starter habit “Less phone scroll”]",
      },
      {
        kind: "prose",
        zh: "睡房原可安靜，卻常被枕邊一點藍光截走整晚。把充電線移到另一間房，不是懲罰自己，而是給夜一個較遠的邊界——讓醒來時，先遇見窗，而不是螢幕。",
        en: "A bedroom can be quiet, yet a blue glow by the pillow often takes the whole night. Moving the charger to another room is not punishment—it is giving night a farther border, so waking meets a window before a screen.",
      },
      {
        kind: "stage",
        zh: "舞台指示：晚上把手機拿到另一間房充電。",
        en: "Stage direction: Charge the phone in another room overnight.",
        action: "晚上把手機拿到另一間房充電",
        habit: "少滑手機",
        room: "睡房／手機",
      },
      {
        kind: "note",
        zh: "門仍在前方。走過這一幕，便是更深一層的房間。",
        en: "The door remains ahead. Past this scene lies a deeper room.",
      },
    ],
  },
];

export const SCENE_ORDER: SceneId[] = ["xu", "yi", "er"];

export function sceneIndex(id: SceneId): number {
  return SCENE_ORDER.indexOf(id);
}

export function nextSceneId(id: SceneId): SceneId | null {
  const i = sceneIndex(id);
  if (i < 0 || i >= SCENE_ORDER.length - 1) return null;
  return SCENE_ORDER[i + 1]!;
}

export function pickText(locale: Locale, zh: string, en: string): string {
  return locale === "zh" ? zh : en;
}
