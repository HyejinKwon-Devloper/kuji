"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  PRODUCT_LIST,
  BOMB_PRODUCTS,
  LUCKY_PRODUCTS,
} from "../constant/common";

type Prize = {
  id: string;
  name: string;
  image?: string;
};

interface ISelectedProducts {
  follower: string;
  product_id: string;
  name: string;
  request_num: number;
  isRandom?: boolean;
}

// TicketRow 타입은 현재 사용하지 않아 제거되었습니다.

type ViewState = {
  tickets: number;
  prizeId: string | null;
  prize: Prize | null;
  message: string;
  loading: boolean;
};

interface PrizeDrawModalProps {
  open: boolean;
  threadId: string;
  product?: ISelectedProducts;
  coin: number;
  onClose: () => void;
  onCoinUpdate?: () => Promise<void>;

  /** 선택: 모달 열릴 때마다 새로고침할지 */
  refetchOnOpen?: boolean;
}

/**
 * PrizeDraw를 "모달" 형태로 감싼 버전
 * - open=false면 렌더하지 않음(포탈 없이도 동작)
 * - 바깥(overlay) 클릭 또는 X 버튼으로 닫기
 * - ESC로 닫기
 * - 스크롤 잠금(body overflow hidden)
 */
export function PrizeDrawModal({
  open,
  product,
  threadId,
  coin,
  onClose,
  onCoinUpdate,
  refetchOnOpen = true,
}: PrizeDrawModalProps) {
  const [drawing, setDrawing] = useState(false);
  const drawingRef = useRef(false); // 진행 중 플래그

  const [view, setView] = useState<ViewState>({
    tickets: 0,
    prizeId: null,
    prize: null,
    message: "",
    loading: true,
  });

  const dialogRef = useRef<HTMLDivElement | null>(null);

  const canDraw = useMemo(() => {
    return (
      open &&
      !view.loading &&
      !drawing &&
      coin > 0 &&
      view.prizeId !== null &&
      view.prize !== null
    );
  }, [open, view.loading, drawing, coin, view.prizeId, view.prize]);

  const fetchState = useCallback(async () => {
    setView((prev) => ({ ...prev, loading: true }));

    if (!threadId) {
      setView((prev) => ({
        ...prev,
        loading: false,
        message: "threadId가 없습니다.",
      }));
      return;
    }

    console.log(product);

    // ✅ 모달로 받은 product가 없으면 어떤 상품을 보여줄지 결정 불가
    if (!product?.product_id) {
      setView((prev) => ({
        ...prev,
        loading: false,
        tickets: 0,
        prizeId: null,
        prize: null,
        message: "상품 정보가 없습니다.",
      }));
      return;
    }

    // ✅ props로 전달받은 코인 값 사용
    const tickets = coin ?? 0;

    setView((prev) => ({
      ...prev,
      loading: false,
      tickets,
      prizeId: product.product_id,
      prize: { id: product.product_id, name: product.name },
      // 기존 메시지가 있으면 유지, 없으면 코인 체크 메시지 표시
      message: prev.message || (tickets > 0 ? "" : "응모권이 없습니다."),
    }));
  }, [threadId, product, coin]);

  // open 시점에만 fetch (StrictMode에서도 중복 호출 방지)
  useEffect(() => {
    if (!open) return;
    if (!refetchOnOpen) return;

    let canceled = false;
    (async () => {
      if (canceled) return;
      await fetchState();
    })();

    return () => {
      canceled = true;
    };
  }, [open, refetchOnOpen, fetchState]);

  // ESC 닫기 + 스크롤 잠금
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);

    // 열릴 때 포커스 이동(접근성/키보드 조작)
    setTimeout(() => dialogRef.current?.focus(), 0);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const handleDraw = useCallback(async () => {
    // 이미 진행 중이면 무시
    if (drawingRef.current) {
      console.log("Already drawing, ignoring duplicate call");
      return;
    }

    if (!canDraw || !product?.product_id) return;

    // 즉시 플래그 설정 (중복 호출 방지)
    drawingRef.current = true;
    setDrawing(true);
    setView((prev) => ({ ...prev, message: "" }));

    try {
      const res = await fetch("/api/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          prizeId: product.product_id,
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
        typeof json?.remainingTickets === "number"
          ? json.remainingTickets
          : null;

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

      // 부모 컴포넌트의 코인 상태 업데이트
      if (onCoinUpdate) {
        await onCoinUpdate();
      }
    } finally {
      // 항상 플래그와 상태 해제
      drawingRef.current = false;
      setDrawing(false);
    }
  }, [canDraw, product, threadId, onCoinUpdate]);

  if (!open) return null;

  // 모든 상품 목록 (일반 + 꽝 + 행운)
  const allProducts = [...PRODUCT_LIST, ...BOMB_PRODUCTS, ...LUCKY_PRODUCTS];

  const imageSrc =
    view.prizeId && allProducts.find((item) => item.id == view.prizeId)?.image
      ? `${allProducts.find((item) => item.id == view.prizeId)!.image}`
      : "/victory.jpg";

  return (
    <div
      style={overlayStyle}
      onMouseDown={(e) => {
        // overlay 클릭 시 닫기 (내부 클릭은 무시)
        if (e.target === e.currentTarget) onClose();
      }}
      aria-hidden={!open}
    >
      <div
        ref={dialogRef}
        style={modalStyle}
        role="dialog"
        aria-modal="true"
        aria-label="상품 추첨"
        tabIndex={-1}
      >
        {/* 헤더 */}
        <div style={modalHeaderStyle}>
          <div style={modalTitleStyle}>상품 추첨</div>
          <button
            type="button"
            onClick={onClose}
            style={closeButtonStyle}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 바디 */}
        <div style={containerStyle}>
          <div style={topRowStyle}>
            <div style={ticketPillStyle}>
              남은 응모권: <strong>{coin}</strong>
            </div>
            <button
              style={refreshButtonStyle}
              onClick={fetchState}
              disabled={view.loading || drawing}
              type="button"
            >
              새로고침
            </button>
          </div>

          <div style={cardStyle}>
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
                      src={imageSrc}
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
                  type="button"
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
      </div>
    </div>
  );
}

/* ===================== MODAL STYLES ===================== */

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 9999,
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 480,
  backgroundColor: "#ffffff",
  borderRadius: 18,
  border: "1px solid #e5e7eb",
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  overflow: "hidden",
};

const modalHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 14px 10px 14px",
  borderBottom: "1px solid #e5e7eb",
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 900,
  color: "#111827",
};

const closeButtonStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb",
  cursor: "pointer",
  fontWeight: 900,
  lineHeight: 1,
};

/* ===================== ORIGINAL STYLES (약간 정리) ===================== */

const containerStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: "12px 12px 14px 12px",
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
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  padding: "14px 14px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
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
