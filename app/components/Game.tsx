"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CoinBalance } from "./CoinBalance";
import { RpsStage } from "./RpsStage";

import { RpsResult } from "../util/game.util";
import { supabase } from "@/lib/supabase";

interface GameProps {
  step?: number;
  coin: number;
  handleStep?: (step?: number) => void;
  handleResult?: (result: RpsResult) => void;
  handleCoin: (value?: number) => void;
}

interface Apply {
  first: string;
  second: string;
  third: string;
  go_yn: string;
  coin: number;
}

export const Game = ({
  step,
  coin,
  handleStep,
  handleResult,
  handleCoin,
}: GameProps) => {
  const [isLoading, setLoading] = useState(true);
  const [phase, setPhase] = useState<number>(1);

  useEffect(() => {
    const start = setTimeout(() => {
      setLoading(false);
    }, 1500);

    const getData = async () => {
      const { data } = await supabase
        .from("coin-own")
        .select("*")
        .maybeSingle<Apply>();
      return data;
    };

    const data = getData().then((res) => {
      handleCoin(res?.coin ?? 2);
      if (res?.go_yn === "Y") {
        setPhase(
          res?.first === "Y"
            ? 5
            : res?.second === "Y"
            ? 7
            : res?.third === "Y"
            ? 8
            : 1
        );
      }
    });

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
      <CoinBalance balance={coin} />
    </div>
  );
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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

const futureSlotStyle: React.CSSProperties = {
  minHeight: 80,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
