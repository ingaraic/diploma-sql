import React, { useState } from "react";
import { sections, Sections } from "./sections";
import '../styles/timeline.css';


export default function Timeline() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goBack = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goNext = () => {
    if (currentIndex < sections.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const current = sections[currentIndex];

  return (
    <div className="timeline-container">
      <Sections currentIndex={currentIndex} goBack={goBack} goNext={goNext} setCurrentIndex={setCurrentIndex} />
    </div>
  );
}


