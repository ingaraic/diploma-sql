//component
import React, { useState, useRef } from "react";
import "../ai-styles/timeline.css"; 

export default function KeywordTooltip({ word, description, icon, project, sectionIndex, pushEvent }) {
  const [visible, setVisible] = useState(false);

  const hoverStartRef = useRef(null);

  const log = (tooltipEvent, extra={}) => {
    if (pushEvent) {
      pushEvent({ 
        type: "tooltip_event", 
        tooltipEvent, //hover_enter, hover_leave
        project,
        sectionIndex,
        word,
        ts: new Date().toISOString(),
        ...extra });
    }
  };  

  const handleMouseEnter = () => {
    hoverStartRef.current = performance.now();
    setVisible(true);
    log("hover_enter");
  }


  const handleMouseLeave = () => {
    const hoverDuration = performance.now() - hoverStartRef.current;
    setVisible(false);
    log("hover_leave", { hoverDurationMs: hoverDuration });
  }

  return (
    <span
      className="tooltip-container"
      onClick={() => setVisible(!visible)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <strong className="tooltip-word">{word}</strong>
      {visible && (
        <div className="tooltip-box">
          {icon && <img src={icon} alt="" className="tooltip-icon" />}
          <span>{description}</span>
        </div>
      )}
    </span>
  );
}
