"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getCookie } from "@/lib/util";
import { PRODUCT_LIST } from "../constant/common";

type Prize = {
  id: string;
  name: string;
  image?: string; // 실제 prize 테이블에 image가 있으면 string으로
};

type TicketRow = {
  follower: string;
  prize_id: string | null;
  request_num: number;
  prize: Prize | null;
};

type ViewState = {
  tickets: number;
  prizeId: string | null;
  prize: Prize | null;
  message: string;
  loading: boolean;
};

export function PrizeDraw() {
  const [drawing, setDrawing] = useState(false);

  // ✅ 여러 setState 대신 상태를 한 덩어리로 관리 (cascading 방지)
  const [view, setView] = useState<ViewState>({
    tickets: 0,
    prizeId: null,
    prize: null,
    message: "",
    loading: true,
  });

  const threadId = getCookie("threadId");

  const canDraw = useMemo(() => {
    return (
      !view.loading &&
      !drawing &&
      view.tickets > 0 &&
      view.prizeId !== null &&
      view.prize !== null
    );
  }, [view.loading, drawing, view.tickets, view.prizeId, view.prize]);

  // ✅ fetchState를 useCallback으로 고정
  const fetchState = useCallback(async () => {
    // effect가 실행될 때 동기 setState는 1회로 최소화
    setView((prev) => ({ ...prev, loading: true, message: "" }));

    if (!threadId) {
      setView((prev) => ({
        ...prev,
        loading: false,
        message: "threadId 쿠키가 없습니다.",
      }));
      return;
    }

    const { data, error } = await supabase
      .from("request-prize")
      .select(
        `
    follower,
    prize_id,
    request_num,
    prize:prize_id (
      id,
      name,
      sale_yn
    )
  `
      )
      .eq("follower", threadId)
      .eq("prize.sale_yn", "Y") // sale_yn 타입이 boolean이면 true로
      .maybeSingle<TicketRow>();

    if (error) {
      setView((prev) => ({
        ...prev,
        loading: false,
        message: `응모권 조회 실패: ${error.message}`,
      }));
      return;
    }

    if (!data) {
      setView((prev) => ({
        ...prev,
        loading: false,
        tickets: 0,
        prizeId: null,
        prize: null,
        message: "응모 데이터가 없습니다.",
      }));
      return;
    }

    // ✅ 결과를 한 번에 반영

    setView((prev) => ({
      ...prev,
      loading: false,
      tickets: data.request_num ?? 0,
      prizeId: data.prize_id ?? null,
      prize: data.prize ?? null,
      message: data.prize ? "" : "아직 응모할 상품이 선택되지 않았습니다.",
    }));
  }, [threadId]);

  // ✅ 의존성을 명확히(StrictMode에서도 안전)
  useEffect(() => {
    fetchState();
  }, []);

  const handleDraw = useCallback(async () => {
    if (!canDraw || view.prizeId === null) return;

    setDrawing(true);
    setView((prev) => ({ ...prev, message: "" }));

    const res = await fetch("/api/draw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId,
        prizeId: view.prizeId,
      }),
    });

    const json = await res.json();

    if (!json.ok) {
      setView((prev) => ({
        ...prev,
        message: json.message ?? "응모 처리 실패",
      }));
      return;
    }

    const remainingTickets =
      typeof json?.remainingTickets === "number" ? json.remainingTickets : null;

    // ✅ tickets도 한 번에
    setView((prev) => ({
      ...prev,
      tickets:
        remainingTickets !== null
          ? remainingTickets
          : Math.max(0, prev.tickets - 1),
      message: json.win
        ? "축하합니다! 당첨되었습니다."
        : "아쉽게도 꽝입니다. 다시 도전해보세요.",
    }));

    // ⚠️ FK 때문에 prize_id=0 금지 (null로)
    if (json.win) {
      await supabase.from("prize-own").insert({
        follower: threadId,
        prize_id: view.prizeId,
      });
    } else {
      await supabase.from("prize-own").insert({
        follower: threadId,
        prize_id: 0,
      });
    }

    setDrawing(false);
  }, [canDraw, view.prizeId, threadId]);

  return (
    <div style={containerStyle}>
      <div style={topRowStyle}>
        <div style={ticketPillStyle}>
          남은 응모권: <strong>{view.tickets}</strong>
        </div>
        <button
          style={refreshButtonStyle}
          onClick={fetchState}
          disabled={view.loading || drawing}
        >
          새로고침
        </button>
      </div>

      <div style={cardStyle}>
        <h2 style={titleStyle}>상품 추첨</h2>

        {view.loading ? (
          <div style={mutedStyle}>불러오는 중...</div>
        ) : !view.prize ? (
          <div style={mutedStyle}>
            {view.message || "표시할 상품이 없습니다."}
          </div>
        ) : (
          <>
            <div style={prizeRowStyle}>
              <div style={prizeImageWrapStyle}>
                <Image
                  src={
                    view.prizeId
                      ? `${
                          PRODUCT_LIST.find((item) => item.id == view.prizeId)
                            ?.image
                        }`
                      : "/default.jpg"
                  }
                  alt={view.prize.name}
                  width={320}
                  height={240}
                  style={prizeImageStyle}
                />
              </div>

              <div style={prizeInfoStyle}>
                <div style={prizeNameStyle}>{view.prize.name}</div>
                <div style={mutedStyle}>응모권 1장당 1회 시도 가능</div>
              </div>
            </div>

            <button
              style={{
                ...drawButtonStyle,
                ...(canDraw ? {} : disabledButtonStyle),
              }}
              onClick={handleDraw}
              disabled={!canDraw}
            >
              {drawing ? "추첨 중..." : "응모하기"}
            </button>

            {view.message && <div style={messageStyle}>{view.message}</div>}
          </>
        )}
      </div>
    </div>
  );
}

/* ===== styles (사용자 코드 그대로) ===== */

const containerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  zIndex: 3,
  padding: "0 12px",
};

const topRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const ticketPillStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 9999,
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  fontSize: 14,
  color: "#111827",
};

const refreshButtonStyle: React.CSSProperties = {
  height: 36,
  padding: "0 12px",
  borderRadius: 10,
  backgroundColor: "#f3f4f6",
  border: "1px solid #e5e7eb",
  cursor: "pointer",
  fontWeight: 600,
  zIndex: 3,
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  padding: "16px 14px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
  color: "#111827",
};

const prizeRowStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const prizeImageWrapStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 14,
  overflow: "hidden",
  backgroundColor: "#f3f4f6",
  aspectRatio: "4 / 3",
};

const prizeImageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const prizeInfoStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const prizeNameStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  color: "#111827",
};

const mutedStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#6b7280",
  lineHeight: 1.5,
};

const drawButtonStyle: React.CSSProperties = {
  height: 44,
  borderRadius: 12,
  border: "none",
  backgroundColor: "#f59e0b",
  color: "#ffffff",
  fontWeight: 800,
  fontSize: 15,
  cursor: "pointer",
};

const disabledButtonStyle: React.CSSProperties = {
  opacity: 0.5,
  cursor: "not-allowed",
};

const messageStyle: React.CSSProperties = {
  marginTop: 4,
  fontSize: 14,
  fontWeight: 700,
  color: "#111827",
};
