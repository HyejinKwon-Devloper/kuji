import React, { useRef, useEffect, useState } from "react";
import "./Fireworks.css";

export const Fireworks: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  // 폭죽 한 번 터뜨리는 함수
  const launchFirework = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const scale = Math.max(0.5, Math.min(1, width / 1200));

    // 폭죽 발사 위치 (랜덤 상단)
    const startX = Math.random() * width;
    const startY = height + 50; // 화면 아래에서 올라오게
    const targetY = height * 0.3 + Math.random() * 100; // 중간쯤에서 터짐

    // 발사체 (불꽃)
    const rocket = {
      x: startX,
      y: startY,
      vy: -8 - Math.random() * 4, // 위로 올라가는 속도
      color: `hsl(${Math.random() * 360}, 100%, 60%)`,
      exploded: false,
    };

    // 터진 후 파티클들
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      size: number;
    }> = [];

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // 로켓 이동
      if (!rocket.exploded) {
        rocket.y += rocket.vy;
        rocket.vy += 0.1; // 약간의 중력

        // 로켓 그리기 (꼬리 불꽃)
        ctx.fillStyle = rocket.color;
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // 꼬리 이펙트
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y + 10, 4, 0, Math.PI * 2);
        ctx.fill();

        // 목표 지점 도달 시 폭발
        if (rocket.y <= targetY) {
          rocket.exploded = true;
          // 40~60개의 파티클 생성
          for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            particles.push({
              x: rocket.x,
              y: rocket.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: `hsl(${Math.random() * 360}, 100%, 60%)`,
              alpha: 1,
              size: (4 + Math.random() * 6) * scale,
            });
          }
        }
      }

      // 파티클 애니메이션
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // 중력
        p.alpha -= 0.015;
        p.size *= 0.98; // 점점 작아짐

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 남은 파티클이 있으면 계속 애니메이션
      if (particles.some((p) => p.alpha > 0) || !rocket.exploded) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };
  const startFireworks = () => {
    const interval = setInterval(() => {
      launchFirework();
    }, 800); // 0.8초마다 하나씩 터짐

    // 10초 후 자동 멈춤 (원하면 제거 가능)
    setTimeout(() => {
      clearInterval(interval);
      setIsAnimating(false);
    }, 10000);
  };
  useEffect(() => {
    // 페이지 로드 시 자동으로 폭죽 시작
    // 여러 번 터뜨리기 (연속 폭죽)

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);

    startFireworks();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fireworks-container">
      <canvas ref={canvasRef} className="fireworks-canvas" />
      <button
        onClick={() => {
          setIsAnimating(true);
          startFireworks();
        }}
        disabled={isAnimating}
      ></button>
    </div>
  );
};
