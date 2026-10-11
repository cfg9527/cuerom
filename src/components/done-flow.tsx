"use client";

import { useState, useTransition } from "react";
import { markLeverDoneAction } from "@/lib/actions/app-actions";
import type { Locale } from "@/lib/i18n/messages";
import { messages } from "@/lib/i18n/messages";

type Props = {
  leverId: string;
  locale: Locale;
  actionLabel: string;
};

export function DoneFlow({ leverId, locale, actionLabel }: Props) {
  const m = messages[locale];
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [reflectionSource, setReflectionSource] = useState<"ai" | "static" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function finish(withPhoto: boolean) {
    setError(null);
    let blobUrl = "";
    if (withPhoto && file) {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Upload failed — you can still mark done without a photo.");
      } else {
        const data = (await res.json()) as { url: string };
        blobUrl = data.url;
      }
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.set("leverId", leverId);
      if (blobUrl) fd.set("blobUrl", blobUrl);
      const result = await markLeverDoneAction(fd);
      setEncouragement(result.encouragement);
      setReflectionSource(result.reflectionSource);
      setOpen(false);
    });
  }

  if (encouragement) {
    return (
      <div className="encourage" role="status">
        <p className="encourage-kicker">
          {reflectionSource === "ai" ? m.reflectionTitle : m.encouragementTitle}
        </p>
        <p className="encourage-body">{encouragement}</p>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setEncouragement(null);
            setReflectionSource(null);
          }}
        >
          {m.continue}
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        {m.markDone}
      </button>
    );
  }

  return (
    <div className="done-panel">
      <p className="done-action">{actionLabel}</p>
      <p className="muted">{m.proofPrompt}</p>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      {error ? <p className="form-error">{error}</p> : null}
      <div className="btn-row">
        <button
          type="button"
          className="btn btn-primary"
          disabled={pending}
          onClick={() => finish(true)}
        >
          {file ? m.uploadProof : m.markDone}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={pending}
          onClick={() => finish(false)}
        >
          {m.proofSkip}
        </button>
      </div>
    </div>
  );
}
