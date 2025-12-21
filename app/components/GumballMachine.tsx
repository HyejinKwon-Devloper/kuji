import React, { useRef, useEffect } from "react";

const GumballMachine = () => {
  const ballsRef = useRef<(HTMLDivElement | null | undefined)[]>([]);

  const dispense = () => {
    ballsRef.current.forEach((ball) => {
      if (ball) {
        ball.style.animation = "none";
        ball.offsetHeight; // reflow 트리거
        ball.style.animation = "spin 3s ease-out forwards";
      }
    });

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * ballsRef.current.length);
      const randomBall = ballsRef.current[randomIndex];
      if (randomBall) {
        randomBall.classList.add("fall");
      }
    }, 3000);
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 자동으로 한 번 뽑기
    dispense();
  }, []);

  return (
    <div
      style={{
        margin: 0,
        height: "100vh",
        background: "#f0f0f0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      <div className="gumball-machine">
        <div className="base" />
        <div className="glass" />
        <div className="exit" />
        <div className="lever" onClick={dispense} />

        {/* 8개의 공 */}
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className={`ball colors ${index + 1}`}
            ref={(el) => {
              ballsRef.current[index] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default GumballMachine;
