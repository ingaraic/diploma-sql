import React from "react";

/* all same size */

export default function ImagePortal({ src, alt }) {
  return (
    <div className="image-portal">
      <div className="image-portal__inner">
        <img src={src} alt={alt} />
      </div>
    </div>
  );
}
