"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Tutorial } from "./Tutorial";

interface OmikujiResult {
  grade: string;
  title: string;
  body: string;
}

export function Omikuji() {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [result, setResult] = useState<OmikujiResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  // Fallback 오미쿠지 데이터
  const fallbackOmikuji: OmikujiResult[] = [
    {
      grade: "대길",
      title: "모든 일이 순조롭게 풀립니다",
      body: "오늘은 특별히 좋은 날입니다.\n하는 일마다 순조롭게 진행될 것이며,\n예상치 못한 행운이 찾아올 수 있습니다.\n긍정적인 마음가짐을 유지하세요.",
    },
    {
      grade: "중길",
      title: "평온한 하루가 될 것입니다",
      body: "큰 변화는 없지만 안정적인 하루입니다.\n주변 사람들과의 관계가 좋아지고,\n작은 기쁨들을 발견할 수 있을 것입니다.\n감사하는 마음을 가지세요.",
    },
    {
      grade: "소길",
      title: "작은 행운이 있을 것입니다",
      body: "사소한 일에서 기쁨을 찾을 수 있습니다.\n평범한 일상 속에서도\n의미 있는 순간들이 기다리고 있습니다.\n주변을 세심하게 살펴보세요.",
    },
    {
      grade: "길",
      title: "좋은 일이 생길 징조입니다",
      body: "긍정적인 에너지가 가득한 하루입니다.\n새로운 시도를 해보기 좋은 때이며,\n주변 사람들의 도움을 받을 수 있습니다.\n적극적으로 행동하세요.",
    },
  ];

  // 반응형 처리
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  const handleNumberClick = async (num: number) => {
    if (isLoading || result) return;

    setSelectedNumber(num);
    setIsLoading(true);

    try {
      // omikuji 테이블에서 모든 데이터 가져오기
      console.log("Fetching from omikuji table...");

      const { data, error } = await supabase
        .from("omikuji")
        .select("grade, title, body");

      if (error) {
        // RLS 정책 문제일 수 있으므로 fallback 데이터 사용
        console.log("Using fallback data due to error");
        const randomIndex = Math.floor(Math.random() * fallbackOmikuji.length);
        const selectedOmikuji = fallbackOmikuji[randomIndex];

        setTimeout(() => {
          setResult(selectedOmikuji);
          setIsLoading(false);
        }, 500);
        return;
      }

      // 데이터가 있으면 DB에서, 없으면 fallback 데이터 사용
      const omikujiData = data && data.length > 0 ? data : fallbackOmikuji;

      console.log(
        "Using data source:",
        data && data.length > 0 ? "Database" : "Fallback"
      );

      // 랜덤으로 하나 선택
      const randomIndex = Math.floor(Math.random() * omikujiData.length);
      const selectedOmikuji = omikujiData[randomIndex];

      console.log("Selected omikuji:", selectedOmikuji);

      // 약간의 지연 후 결과 표시
      setTimeout(() => {
        setResult(selectedOmikuji);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("오미쿠지 조회 실패:", error);

      // 에러 발생 시에도 fallback 데이터 사용
      const randomIndex = Math.floor(Math.random() * fallbackOmikuji.length);
      const selectedOmikuji = fallbackOmikuji[randomIndex];

      setTimeout(() => {
        setResult(selectedOmikuji);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleReset = () => {
    setShowTutorial(true);
  };

  const handleClose = () => {
    setResult(null);
    setSelectedNumber(null);
  };

  if (showTutorial) {
    return <Tutorial handleGumble={() => setShowTutorial(false)} />;
  }

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>오미쿠지 - 운세를 뽑아보세요!</h2>

      {!result && (
        <div style={gridContainerStyle}>
          <div
            style={{
              ...gridStyle,
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : "repeat(6, 1fr)",
            }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                style={{
                  ...numberButtonStyle,
                  opacity: selectedNumber && selectedNumber !== num ? 0.3 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
                onClick={() => handleNumberClick(num)}
                disabled={isLoading}
              >
                <Image
                  src={`/${num}.png`}
                  alt={`${num}`}
                  width={isMobile ? 120 : 240}
                  height={isMobile ? 120 : 240}
                  style={{ objectFit: "contain" }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && <div style={loadingStyle}>운세를 확인하는 중...</div>}

      {result && (
        <div style={resultContainerStyle}>
          <div style={paperStyle}>
            <button style={closeButtonStyle} onClick={handleClose}>
              ✕
            </button>
            <h3 style={gradeStyle}>{result.grade}</h3>
            <div style={titleTextStyle}>{result.title}</div>
            <div style={bodyStyle}>{result.body}</div>
            <button style={resetButtonStyle} onClick={handleReset}>
              인사 보러 가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== STYLES ==================== */

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px 16px",
  boxSizing: "border-box",
  gap: 24,
  zIndex: 3,
};

const titleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  color: "#111827",
  textAlign: "center",
  margin: 0,
};

const gridContainerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 600,
  display: "flex",
  justifyContent: "center",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)", // 모바일: 4열
  gap: 16,
  width: "100%",
  maxWidth: 600,
};

const numberButtonStyle: React.CSSProperties = {
  padding: 0,
  border: "2px solid #e5e7eb",
  borderRadius: 12,
  backgroundColor: "#ffffff",
  cursor: "pointer",
  transition: "all 0.2s",
  aspectRatio: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const numberImageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
};

const loadingStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  color: "#6b7280",
  marginTop: 20,
};

const resultContainerStyle: React.CSSProperties = {
  animation: "fadeIn 0.8s ease-in-out",
  width: "100%",
  maxWidth: 500,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const paperStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "3px solid #92400e",
  borderRadius: 8,
  padding: "32px 24px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
  display: "flex",
  flexDirection: "column",
  gap: 20,
  position: "relative",
};

const closeButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: 12,
  right: 12,
  width: 32,
  height: 32,
  border: "none",
  borderRadius: "50%",
  backgroundColor: "#f3f4f6",
  color: "#374151",
  fontSize: 18,
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
};

const gradeStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 900,
  color: "#dc2626",
  textAlign: "center",
  margin: 0,
  textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
};

const titleTextStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#92400e",
  textAlign: "center",
  borderTop: "2px solid #d97706",
  borderBottom: "2px solid #d97706",
  padding: "12px 0",
};

const bodyStyle: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.8,
  color: "#292524",
  whiteSpace: "pre-wrap",
  textAlign: "left",
  padding: "0 8px",
};

const resetButtonStyle: React.CSSProperties = {
  marginTop: 16,
  padding: "12px 24px",
  backgroundColor: "#7c3aed",
  color: "#ffffff",
  border: "none",
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  alignSelf: "center",
};
