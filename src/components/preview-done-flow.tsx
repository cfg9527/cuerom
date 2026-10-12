"use client";

import { useState } from "react";
import { pickEncouragement } from "@/lib/encouragements";
import type { Locale } from "@/lib/i18n/messages";
import { messages } from "@/lib/i18n/messages";

/** Demo-only done UX — no DB writes, no uploads, no AI Gateway. */
export function PreviewDoneFlow({
  locale,
  actionLabel,
}: {
  locale: Locale;
  actionLabel: string;
}) {
  const m = messages[locale];
  const [encouragement, setEncouragement] = useState<string | null>(null);

  if (encouragement) {
    return (
      <div className="encourage" role="status">
        <p className="encourage-kicker">{m.encouragementTitle}</p>
        <p className="encourage-body">{encouragement}</p>
        <button type="button" className="btn btn-ghost" onClick={() => setEncouragement(null)}>
          {m.continue}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-primary"
      onClick={() => setEncouragement(pickEncouragement(locale))}
      title={actionLabel}
    >
      {m.markDone}
    </button>
  );
}
