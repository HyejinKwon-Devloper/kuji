"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface EventBannerProps {
  onComplete?: () => void;
}

export function EventBanner({ onComplete }: EventBannerProps) {
  const [show, setShow] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // 컴포넌트 마운트 후 표시 시작
    const showTimer = setTimeout(() => {
      setShow(true);
    }, 100);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (show) {
      // 페이드 인
      const fadeInTimer = setTimeout(() => {
        setOpacity(1);
      }, 50);

      // 3초 동안 표시 후 페이드 아웃
      const fadeOutTimer = setTimeout(() => {
        setOpacity(0);
      }, 3000);

      // 페이드 아웃 후 컴포넌트 제거
      const hideTimer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 4000);

      return () => {
        clearTimeout(fadeInTimer);
        clearTimeout(fadeOutTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        opacity: opacity,
        transition: "opacity 1s ease-in-out",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "90%",
          maxWidth: 780,
          aspectRatio: "1",
        }}
      >
        <Image
          src="/event_banner.jpg"
          alt="Event Banner"
          fill
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
    </div>
  );
}
