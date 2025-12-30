"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CoinBalance } from "./CoinBalance";
import { BettingComponent } from "./BettingComponent";
import { supabase } from "@/lib/supabase";

interface ICoinIntroProps {
  step?: number;
  coin: number;
  handleStep?: (step: number) => void;
  handleResult: (value: "win" | "lose" | "draw") => void;
}

export function CoinIntro({
  step,
  coin,
  handleStep,
  handleResult,
}: ICoinIntroProps) {
  const [animateUp, setAnimateUp] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const coinTimer = setTimeout(() => {
      setAnimateUp(true);
    }, 800);

    const switchTimer = setTimeout(() => {
      setShowNotice(true);
      handleStep?.(3);
    }, 2000); // ⭐ 애니메이션 끝난 후 교체

    return () => {
      clearTimeout(coinTimer);
      clearTimeout(switchTimer);
    };
  }, [handleStep]);

  const handleBettingClick = async () => {
    console.log("배팅 도전 클릭됨");
    if (window.confirm("배팅에 도전하시겠습니까?")) {
      handleStep?.(4);
      console.log("배팅에 도전합니다.");
      return;
    } else {
      alert("배팅이 취소되었습니다.");
    }
  };

  const handleCancleClick = async () => {
    alert("배팅이 취소되었습니다.");
    handleStep?.(5);
    handleResult("win");
  };

  return (
    <div style={containerStyle}>
      {/* ===== 지갑 무대 ===== */}
      <div style={stageStyle}>
        <div style={walletWrapperStyle}>
          {/* 말풍선 */}
          <div
            style={{
              ...bubbleStyle,
              opacity: animateUp ? 1 : 0,
              transform: animateUp
                ? "translate(-50%, 80px)"
                : "translate(-50%, 0px)",
            }}
          >
            코인이 지급되었습니다.
            <span style={bubbleTailStyle} />
          </div>

          {/* 코인 */}
          <div style={coinWrapperStyle}>
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  ...coinStyle,
                  transform: animateUp
                    ? `translate(${i === 0 ? -60 : -20}px, 80px)`
                    : `translate(${i === 0 ? -60 : -20}px, 200px) scale(0.3)`,
                }}
              >
                <Image src="/coin.png" alt="coin" width={72} height={72} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 교체 슬롯 (지갑 ↔ 주의사항) ===== */}
      <div style={slotWrapperStyle}>
        {/* 지갑 */}
        <div
          style={{
            ...walletSlotStyle,
            opacity: showNotice ? 0 : 1,
            transform: showNotice ? "scale(0.96)" : "scale(1)",
            display: showNotice ? "none" : "flex",
          }}
        >
          <Image src="/wallet.png" alt="wallet" width={360} height={280} />
        </div>

        {/* 주의사항 */}
        <BettingComponent showNotice={showNotice} />
      </div>

      {/* 버튼 */}
      {showNotice && (
        <div style={bettingButtonWrapperStyle}>
          <button
            style={challengeButtonStyle}
            onClick={() => handleBettingClick()}
          >
            배팅 도전
          </button>
          <button style={skipButtonStyle} onClick={() => handleCancleClick()}>
            건너뛰기
          </button>
        </div>
      )}

      <CoinBalance />
    </div>
  );
}

/* ===================== STYLE ===================== */

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 20,
};

const stageStyle: React.CSSProperties = {
  position: "relative",
};

const walletWrapperStyle: React.CSSProperties = {
  position: "relative",
  width: 360,
  height: 140,
};

const coinWrapperStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
};

const coinStyle: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  top: -12,
  transition: "transform 0.8s cubic-bezier(0.22,1,0.36,1)",
};

const bubbleStyle: React.CSSProperties = {
  position: "absolute",
  top: -52,
  left: "50%",
  padding: "10px 16px",
  backgroundColor: "#fff",
  borderRadius: 9999,
  fontSize: 14,
  fontWeight: 500,
  zIndex: 3,
  transition: "opacity 0.4s ease, transform 0.4s ease",
};

const bubbleTailStyle: React.CSSProperties = {
  position: "absolute",
  bottom: -6,
  left: "50%",
  transform: "translateX(-50%)",
  borderLeft: "6px solid transparent",
  borderRight: "6px solid transparent",
  borderTop: "6px solid #fff",
};

/* ===== 교체 슬롯 ===== */

const slotWrapperStyle: React.CSSProperties = {
  position: "relative",
  width: 360,
  minHeight: 280,
};

const walletSlotStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  transition: "opacity 0.4s ease, transform 0.4s ease",
};

const bettingButtonWrapperStyle = {
  display: "flex",
  gap: 20,
  width: 360,
  zIndex: 33,
};

const challengeButtonStyle = {
  flex: 1,
  height: 44,
  borderRadius: 12,
  backgroundColor: "#f59e0b",
  color: "#fff",
  border: "none",
};

const skipButtonStyle = {
  flex: 1,
  height: 44,
  borderRadius: 12,
  backgroundColor: "#f3f4f6",
  border: "1px solid #e5e7eb",
};
