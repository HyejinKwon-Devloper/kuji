"use client";

import { ReactNode } from "react";

interface BallProps {
  showBall: boolean;
  ballColor: string;
  ballLetter: ReactNode;
}

export const Ball = ({ showBall, ballColor, ballLetter }: BallProps) => {
  if (!showBall) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-60">
      <div
        className="ball-zoom"
        style={{
          background: `radial-gradient(circle at 30% 30%, white, ${ballColor}, black)`,
          boxShadow: `
            0 0 30px white,
            inset -10px -10px 10px black,
            inset 10px 10px 20px white
          `,
        }}
      >
        <div className="ball-center">{ballLetter}</div>
      </div>
    </div>
  );
};
