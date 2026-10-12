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

  const goTo = useCallback(
    (target: SceneId, viaDoor: boolean) => {
      if (target === sceneId) return;
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
      setDoorPhase("engage");
      window.setTimeout(() => setDoorPhase("cross"), 420);
      window.setTimeout(() => {
        setSceneId(target);
        setMobileNavOpen(false);
        setDoorPhase("land");
        contentRef.current?.querySelector<HTMLElement>("h1")?.focus();
      }, 980);
      window.setTimeout(() => setDoorPhase("idle"), 1400);
    },
    [reduceMotion, sceneId],
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
            <span className="secret-door-frame">
              <span className="secret-door-panel">
                <span className="secret-door-knob" />
              </span>
            </span>
            <span className="secret-door-draft" aria-hidden="true" />
            <span className="secret-door-hint">
              {nextId
                ? locale === "zh"
                  ? "推門前行"
                  : "Pass through"
                : locale === "zh"
                  ? "未完 · 且停於此"
                  : "Unfinished · rest here"}
            </span>
          </button>
          <div className="secret-door-tunnel" aria-hidden="true" />
        </div>
      </section>

      <article
        ref={contentRef}
        className="secret-content"
        aria-labelledby={headingId}
      >
        <header className="secret-content-head">
          <p className="secret-folio">{scene.mark}</p>
          <h1 id={headingId} className="secret-title" tabIndex={-1}>
            {pickText(locale, scene.title.zh, scene.title.en)}
          </h1>
        </header>

        <div className="secret-stack">
          {scene.blocks.map((block, i) => {
            const key = `${scene.id}-${i}`;
            if (block.kind === "prose") {
              const primary = locale === "zh" ? block.zh : block.en;
              const facing = locale === "zh" ? block.en : block.zh;
              return (
                <section key={key} className="secret-block secret-prose">
                  {block.locked ? (
                    <p className="secret-locked-tag">
                      {locale === "zh" ? "原文（鎖定）" : "Source (locked)"}
                    </p>
                  ) : null}
                  {primary.split("\n").map((para, pi) => (
                    <p key={pi}>{para}</p>
                  ))}
                  {scene.id === "xu" ? (
                    <div className="secret-facing" lang={locale === "zh" ? "en" : "zh"}>
                      {facing.split("\n").map((para, pi) => (
                        <p key={pi}>{para}</p>
                      ))}
                    </div>
                  ) : null}
                </section>
              );
            }
            if (block.kind === "label") {
              return (
                <p key={key} className="secret-block secret-draft-label">
                  {pickText(locale, block.zh, block.en)}
                </p>
              );
            }
            if (block.kind === "note") {
              return (
                <p key={key} className="secret-block secret-note">
                  {pickText(locale, block.zh, block.en)}
                </p>
              );
            }
            // stage
            const done = Boolean(doneStages[key]);
            return (
              <section key={key} className="secret-block secret-stage">
                <p className="secret-stage-line">
                  {pickText(locale, block.zh, block.en)}
                </p>
                {!done ? (
                  <button
                    type="button"
                    className="secret-stage-btn"
                    disabled={pending}
                    onClick={() => completeStage(block, key)}
                  >
                    {locale === "zh"
                      ? "完成這一幕的舞台指示"
                      : "Carry out this stage direction"}
                  </button>
                ) : (
                  <div className="secret-marginalia">
                    <p className="secret-marginalia-kicker">
                      {locale === "zh" ? "道具已就位 · 旁白" : "Prop in place · Narration"}
                    </p>
                    <p className="secret-marginalia-body">
                      {narration[key] ??
                        (locale === "zh" ? "……" : "…")}
                    </p>
                    <label className="secret-proof">
                      <span>
                        {locale === "zh" ? "可選實證（本機預覽，不上傳帳號）" : "Optional proof (local preview only)"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          // Local object URL only — never hits public Blob/account.
                          const url = URL.createObjectURL(file);
                          const img = e.currentTarget
                            .closest(".secret-marginalia")
                            ?.querySelector<HTMLImageElement>(".secret-proof-img");
                          if (img) {
                            img.src = url;
                            img.hidden = false;
                          }
                        }}
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="secret-proof-img" alt="" hidden />
                    </label>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </article>
    </div>
  );
}

function sceneIndexPassed(current: SceneId, candidate: SceneId): boolean {
  return SCENE_ORDER.indexOf(candidate) < SCENE_ORDER.indexOf(current);
}
