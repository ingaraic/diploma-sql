import React, { useMemo, useState, useRef } from "react";
import { sections } from "./sections";
import "../ai-styles/timeline.css";

export default function BottomTimeline({ currentIndex, onSelectSection, project, pushEvent }) {
  const items = useMemo(
    () =>
      sections.slice(1, 10).map((s, i) => ({
        idx: i + 1,
        label: s.era || s.title,
        img: s.image || null,
      })),
    []
  );

  // convert to local 0–8 za lažje računanje
  const activeLocal = Math.max(0, Math.min(items.length - 1, currentIndex - 1));

  // 0 → first, 100 → last
  const progressPct =
    items.length > 1 ? (activeLocal / (items.length - 1)) * 100 : 0;

  const [preview, setPreview] = useState(null); // { img:string, x:number } | null

  //track hover start times for analytics
  const hoverStartsRef = useRef({});
const showPreview = (e, img, isActive, itemIdx, label) => {
  if (!img || isActive) return;

  const r = e.currentTarget.getBoundingClientRect();
  setPreview({ img, x: r.left + r.width / 2 });

  if (pushEvent) {
    hoverStartsRef.current[itemIdx] = performance.now();
    pushEvent({
      type: "timeline_hover",
      phase: "enter",
      project,
      dotIndex: itemIdx,    // 1–9
      label,
      sectionIndex: currentIndex, // currently active section
      ts: new Date().toISOString(),
    });
  }
};

const hidePreview = (itemIdx, label) => {
  setPreview(null);

  if (pushEvent) {
    const start = hoverStartsRef.current[itemIdx];
    const durationMs =
      typeof start === "number" ? performance.now() - start : undefined;
    delete hoverStartsRef.current[itemIdx];

    pushEvent({
      type: "timeline_hover",
      phase: "leave",
      project,
      dotIndex: itemIdx,
      label,
      sectionIndex: currentIndex,
      durationMs,
      ts: new Date().toISOString(),
    });
  }
};


  const onKeyNav = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = Math.min(items.length - 1, activeLocal + 1);
      onSelectSection(items[next].idx);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = Math.max(0, activeLocal - 1);
      onSelectSection(items[prev].idx);
    }
  };

  return (
    <nav className="bottom-timeline" aria-label="Časovnica">
     <div
  className="bottom-timeline__viewport"
  style={{ "--progress": `${progressPct}%`, "--milestones": items.length }}
>

        <div className="bottom-timeline__track" aria-hidden="true" />

        <ul
  className="bottom-timeline__list"
  role="listbox"
  aria-activedescendant={`milestone-${activeLocal}`}
  onKeyDown={onKeyNav}
>

          {items.map((item, i) => {
            const isActive = i === activeLocal;
            const isDone = i < activeLocal;

            return (
              <li key={item.idx} className="bottom-timeline__cell">
                <button
                  id={`milestone-${i}`}
                  className="bottom-timeline__btn"
                  aria-selected={isActive}
                  //pass index and label for analytics
                onMouseEnter={(e) => showPreview(e, item.img, isActive, item.idx, item.label)}
                onMouseLeave={() => hidePreview(item.idx, item.label)}
                onFocus={(e) => showPreview(e, item.img, isActive, item.idx, item.label)}
                onBlur={() => hidePreview(item.idx, item.label)}
                  onClick={() => onSelectSection(item.idx)}
                  type="button"
                >
                  <span
                    className={[
                      "bottom-timeline__dot",
                      isActive ? "bottom-timeline__dot--active" : "",
                      isDone ? "bottom-timeline__dot--done" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden="true"
                  />
                  <span className="bottom-timeline__label">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>


      {preview?.img && (
        <div
          className="bottom-timeline__preview-portal"
          style={{ left: `${preview.x}px` }}
          aria-hidden="true"
        >
          <img src={preview.img} alt="" />
        </div>
      )}
    </nav>
  );
}
