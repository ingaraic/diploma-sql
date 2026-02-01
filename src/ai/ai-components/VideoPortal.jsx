// ./VideoPortal.jsx
import React, { useRef, useEffect } from "react";
import { AspectRatio } from "@mantine/core";

export default function VideoPortal({
  src,
  poster,
  alt = "",
  className = "video-portal",
  project,
  index,
  pushEvent
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !pushEvent) return;

    const log = (videoEvent, extra = {}) => {
      pushEvent({
        type: "video_event",
        project,
        index,
        videoEvent,
        ts: new Date().toISOString(),
        ...extra,
      });
    };

    const onPlay = () => log("play", { currentTime: v.currentTime });
    const onPause = () => log("pause", { currentTime: v.currentTime });
    const onEnded = () => log("ended", { currentTime: v.currentTime });

    const onDragging = () => log("dragging", { currentTime: v.currentTime });
    const onDragged = () => log("dragged", { currentTime: v.currentTime });

    const onVolume = () =>
      log("volumechange", { volume: v.volume, muted: v.muted });
    const onSpeed = () =>
      log("speed", { playbackRate: v.playbackRate });

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    v.addEventListener("seeking", onDragging);
    v.addEventListener("seeked", onDragged);
    v.addEventListener("volumechange", onVolume);
    v.addEventListener("ratechange", onSpeed);

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("seeking", onDragging);
      v.removeEventListener("seeked", onDragged);
      v.removeEventListener("volumechange", onVolume);
      v.removeEventListener("ratechange", onSpeed);
    };
  }, [project, index, pushEvent]);

  return (
    <div className={className}>
      <div className="video-portal__inner">
        <AspectRatio ratio={7 / 5}>
          <video
            ref={videoRef}
            key={src}
            className="video-portal__player"
            controls
            playsInline
            preload="metadata"
            poster={poster}
            aria-label={alt}
          >
            <source src={src} type="video/mp4" />
            Vaš brskalnik ne podpira videa.
          </video>
        </AspectRatio>
      </div>
    </div>
  );
}
