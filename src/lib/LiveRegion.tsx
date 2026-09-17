import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

/**
 * One pair of live regions for the whole app, mounted once, always present.
 *
 * Why a provider instead of ad-hoc aria-live divs: live regions only announce
 * reliably when they exist in the DOM *before* their content changes. A region
 * that mounts with its message already inside is silent in most screen readers.
 * So we mount empty regions at app start and push text into them on demand.
 *
 * Polite is for "the count went up"; assertive is for "you are about to lose
 * your form data". Use assertive rarely.
 */

type Politeness = "polite" | "assertive";

type AnnouncerContextValue = {
  announce: (message: string, politeness?: Politeness) => void;
};

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);

export function LiveRegionProvider({ children }: { children: React.ReactNode }) {
  const [polite, setPolite] = useState("");
  const [assertive, setAssertive] = useState("");
  const timer = useRef<number | undefined>(undefined);

  const announce = useCallback((message: string, politeness: Politeness = "polite") => {
    const set = politeness === "assertive" ? setAssertive : setPolite;
    // Clear first so an identical message announces again, then set on the
    // next frame so the DOM mutation is observed as a change.
    set("");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => set(message), 30);
  }, []);

  const value = useMemo(() => ({ announce }), [announce]);

  return (
    <AnnouncerContext.Provider value={value}>
      {children}
      <div className="cui-visually-hidden" aria-live="polite" aria-atomic="true">
        {polite}
      </div>
      <div className="cui-visually-hidden" aria-live="assertive" aria-atomic="true">
        {assertive}
      </div>
    </AnnouncerContext.Provider>
  );
}

export function useAnnouncer(): AnnouncerContextValue {
  const ctx = useContext(AnnouncerContext);
  if (!ctx) {
    throw new Error("useAnnouncer must be used inside <LiveRegionProvider>.");
  }
  return ctx;
}
