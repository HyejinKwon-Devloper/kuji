"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CoinBalance } from "./CoinBalance";
import { RpsStage } from "./RpsStage";

import { RpsResult } from "../util/game.util";

interface GameProps {
  coin: number;
  handleStep?: (step?: number) => void;
  handleResult?: (result: RpsResult) => void;
  handleCoin: (value?: number) => void;
  initialPhase?: number;
}

export const Game = ({
  coin,
  handleStep,
  handleResult,
  handleCoin,
  initialPhase,
}: GameProps) => {
  const [isLoading, setLoading] = useState(true);
  const [phase, setPhase] = useState<number>(initialPhase ?? 1);

  useEffect(() => {
    const start = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => {
      clearTimeout(start);
    };
  }, []);

  useEffect(() => {
    console.log("phase changed to:", phase);
  }, [phase]);

  return (
    <div style={containerStyle}>
      {isLoading && (
        <>
          {/* 헤더 */}
          <div style={headerStyle}>
            <h2 style={titleStyle}>게임을 시작합니다</h2>
          </div>
          <CoinKeyframes />

          {/* 중앙 무대 */}
          <div style={stageStyle}>
            <div style={coinStyle}>
              <Image src="/coin.png" alt="coin" width={80} height={80} />
            </div>
          </div>
        </>
      )}
      {!isLoading && (
        <>
          {/* 확장 슬롯 (말풍선 / 가위바위보 UI) */}
          <RpsStage
            phase={phase}
            coin={coin}
            handlePhase={(value) => setPhase(value)}
            onResult={handleResult}
            handleCoin={handleCoin}
            handleStep={handleStep}
          />
        </>
      )}
      <CoinBalance />
    </div>
  );
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 12px",
};

const titleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
};

const spinKeyframes = `
@keyframes coinSpin {
  0% {
    transform: rotateY(0deg) translateY(0);
  }
  50% {
    transform: rotateY(180deg) translateY(-10px);
  }
  100% {
    transform: rotateY(360deg) translateY(0);
  }
}
`;
function CoinKeyframes() {
  return <style>{spinKeyframes}</style>;
}

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 24,
};

const coinStyle: React.CSSProperties = {
  width: 80,
  height: 80,
  animation: "coinSpin 0.5s ease-in-out",
  transformStyle: "preserve-3d",
  willChange: "transform",
};

const stageStyle: React.CSSProperties = {
  width: 160,
  height: 160,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  perspective: 800, // ⭐ 3D 회전 핵심
};
