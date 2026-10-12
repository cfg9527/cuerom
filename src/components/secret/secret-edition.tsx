"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import { setPublicLocaleAction } from "@/lib/actions/locale-actions";
import { secretNarrationAction } from "@/lib/actions/secret-actions";
import type { Locale } from "@/lib/i18n/messages";
import {
  NOVEL_SCENES,
  SCENE_ORDER,
  nextSceneId,
  pickText,
  type ContentBlock,
  type SceneId,
} from "@/lib/preview/novel";

type Props = { locale: Locale };

export function SecretEdition({ locale }: Props) {
  const [sceneId, setSceneId] = useState<SceneId>("xu");
  const [doorPhase, setDoorPhase] = useState<"idle" | "engage" | "cross" | "land">(
    "idle",
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [doneStages, setDoneStages] = useState<Record<string, boolean>>({});
  const [narration, setNarration] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const headingId = useId();
  const contentRef = useRef<HTMLElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const scene = NOVEL_SCENES.find((s) => s.id === sceneId)!;
  const nextId = nextSceneId(sceneId);
  const nextScene = nextId ? NOVEL_SCENES.find((s) => s.id === nextId) : null;
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const goTo = useCallback(
    (target: SceneId, viaDoor: boolean) => {
      if (target === sceneId) return;
      clearTimers();
      if (!viaDoor || reduceMotion) {
        setDoorPhase("land");
        setSceneId(target);
        setMobileNavOpen(false);
        requestAnimationFrame(() => {
          contentRef.current?.querySelector<HTMLElement>("h1")?.focus();
          setDoorPhase("idle");
        });
        return;
      }
      // Zoomquilt-class continuous nest zoom:
      // engage → ease toward aperture · cross → scale through nested doors · land
      setDoorPhase("engage");
      timersRef.current.push(
        window.setTimeout(() => setDoorPhase("cross"), 680),
        window.setTimeout(() => {
          setSceneId(target);
          setMobileNavOpen(false);
          setDoorPhase("land");
          contentRef.current?.querySelector<HTMLElement>("h1")?.focus();
        }, 2100),
        window.setTimeout(() => setDoorPhase("idle"), 2680),
      );
    },
    [clearTimers, reduceMotion, sceneId],
  );

  const openDoor = useCallback(() => {
    if (!nextId || doorPhase !== "idle") return;
    goTo(nextId, true);
  }, [doorPhase, goTo, nextId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
          return;
        }
        if (e.key === "Enter" && t?.closest("button, a, form")) return;
        openDoor();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openDoor]);

  function completeStage(block: Extract<ContentBlock, { kind: "stage" }>, key: string) {
    setDoneStages((d) => ({ ...d, [key]: true }));
    startTransition(async () => {
      const result = await secretNarrationAction({
        locale,
        action: locale === "zh" ? block.action : block.en.replace(/^Stage direction:\s*/i, ""),
        habit: block.habit,
        room: block.room,
      });
      setNarration((n) => ({ ...n, [key]: result.text }));
    });
  }

  return (
    <div
      className={`secret-root secret-atm-${scene.atmosphere} door-${doorPhase}`}
      lang={locale}
      data-scene={sceneId}
    >
      <button
        type="button"
        className="secret-mobile-toc-btn"
        onClick={() => setMobileNavOpen((v) => !v)}
        aria-expanded={mobileNavOpen}
      >
        {locale === "zh" ? "目錄 · 序一二" : "Contents"}
      </button>

      <aside
        className={`secret-nav${mobileNavOpen ? " is-open" : ""}`}
        aria-label={locale === "zh" ? "章節" : "Chapters"}
      >
        <p className="secret-edition-mark">
          {locale === "zh" ? "隱藏版" : "Secret"}
        </p>
        <nav className="secret-toc">
          {SCENE_ORDER.map((id) => {
            const s = NOVEL_SCENES.find((x) => x.id === id)!;
            const active = id === sceneId;
            const passed = sceneIndexPassed(sceneId, id);
            return (
              <button
                key={id}
                type="button"
                className={`secret-toc-item${active ? " is-active" : ""}${passed ? " is-passed" : ""}`}
                onClick={() => goTo(id, false)}
                aria-current={active ? "page" : undefined}
              >
                <span className="secret-toc-mark">{s.mark}</span>
                <span className="secret-toc-box" aria-hidden="true" />
              </button>
            );
          })}
        </nav>

        <form action={setPublicLocaleAction} className="secret-locale">
          <button
            type="submit"
            name="locale"
            value="en"
            className={locale === "en" ? "is-active" : undefined}
            aria-pressed={locale === "en"}
          >
            EN
          </button>
          <button
            type="submit"
            name="locale"
            value="zh"
            className={locale === "zh" ? "is-active" : undefined}
            aria-pressed={locale === "zh"}
          >
            中文
          </button>
        </form>
      </aside>

      {mobileNavOpen ? (
        <button
          type="button"
          className="secret-nav-scrim"
          aria-label="Close"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <section className="secret-door-col" aria-label={locale === "zh" ? "門" : "Door"}>
        <div className="secret-door-stage">
          <button
            type="button"
            className="secret-door"
            onClick={openDoor}
            disabled={!nextId || doorPhase !== "idle"}
            aria-label={
              nextId
                ? locale === "zh"
                  ? "開門 · 進入下一幕"
                  : "Open the door · next scene"
                : locale === "zh"
                  ? "此為目前最深一幕"
                  : "End of the current descent"
            }
          >
            {/* Nested apertures: next world already inside (Zoomquilt DNA) */}
            <span className="secret-door-frame secret-zq-frame" data-depth="0">
              <span className="secret-door-panel">
                <span className="secret-door-knob" />
                <span className="secret-zq-aperture" aria-hidden="true">
                  <span className="secret-zq-frame" data-depth="1">
                    <span className="secret-door-panel secret-zq-inner-panel">
                      <span className="secret-door-knob secret-zq-knob-sm" />
                      <span className="secret-zq-aperture">
                        <span
                          className={`secret-zq-frame secret-zq-next secret-atm-${nextScene?.atmosphere ?? scene.atmosphere}`}
                          data-depth="2"
                        >
                          <span className="secret-zq-next-glow" />
                          <span className="secret-zq-next-mark">
                            {nextScene?.mark ?? "·"}
                          </span>
                        </span>
                      </span>
                    </span>
                  </span>
          
/* SIZE_PROBE_8K */
