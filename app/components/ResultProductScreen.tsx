"use client";

import { useEffect, useState } from "react";
import {
  PRODUCT_LIST,
  BOMB_PRODUCTS,
  LUCKY_PRODUCTS,
} from "../constant/common";
import { CoinBalance } from "./CoinBalance";
import { ProductGrid } from "./ProductGrid";
import { supabase } from "@/lib/supabase";

type Product = {
  id?: string;
  name?: string;
  image?: string;
  description?: string;
};

interface ISelectedProducts {
  follower: string;
  product_id: string;
  name: string;
  request_num: number;
}

interface ResultProductScreenProps {
  result: "win" | "lose" | "draw";
  follower: string;
  request_num: number;
  onSelectProduct: (selected: ISelectedProducts) => void;
  revealDelayMs?: number;
}

export function ResultProductScreen({
  result,
  follower,
  request_num,
  onSelectProduct,
  revealDelayMs = 3000,
}: ResultProductScreenProps) {
  const [view, setView] = useState<"result" | "products">(
    result === "win" ? "result" : "products"
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);

  useEffect(() => {
    const getProd = async () => {
      const { data } = (await supabase
        .from("prize")
        .select("id, name")
        .eq("sale_yn", "Y")) as {
        data: { id: string; name: string }[] | null;
      };

      if (data) {
        const result = data
          .filter((item1) => item1.id !== "0") // prize_id 0인 웃음벨 상품 제외
          .map((item1) => {
            const info = PRODUCT_LIST.find((item2) => item1.id == item2.id);
            return {
              ...info,
            };
          })
          .filter((item) => item.id !== "0" && item.id !== undefined); // 웃음벨 다시 한번 제외 및 undefined 제거
        setProducts(result);

        // 랜덤용 목록: 일반 상품 + 웃음벨 10개 + 꽝 10개 + 행운 2개
        const allProducts = data.map((item1) => {
          const info = PRODUCT_LIST.find((item2) => item1.id == item2.id);
          return { ...info };
        });

        // 웃음벨을 10개로 복제
        const victoryProducts = Array.from({ length: 10 }, (_, i) => ({
          id: "0",
          name: "웃음벨",
          image: "/victory.jpg",
        }));

        setRandomProducts([
          ...allProducts.filter((p) => p.id !== "0"), // 일반 상품 (웃음벨 제외)
          ...victoryProducts, // 웃음벨 10개
          ...BOMB_PRODUCTS, // 꽝 10개
          ...LUCKY_PRODUCTS, // 행운 2개
        ]);
      }

      // request-prize 데이터 조회만 수행 (insert는 draw API에서 처리)
      const response = (await supabase
        .from("request-prize")
        .select("request_num, ticket")
        .eq("follower", follower)
        .eq("phase", 3)
        .order("request_num", { ascending: false })) as {
        data: { request_num: number; ticket: number }[] | null;
      };

      let finalTicket = request_num;
      if (response.data && response.data.length > 0) {
        const maxTicket = response.data[0];
        finalTicket = maxTicket.request_num ?? 0;
      }

      if (finalTicket <= 0 && request_num <= 0) {
        alert("유효한 응모권이 없습니다.");
        window.location.href = "/";
        return;
      }
    };

    getProd();
  }, []);

  useEffect(() => {
    if (result === "lose" || view !== "result") return;

    const t = setTimeout(() => {
      setView("products");
    }, revealDelayMs);

    return () => clearTimeout(t);
  }, [view, revealDelayMs, result]);

  const isWin = result === "win";

  return (
    <div style={pageStyle}>
      {/* 상단 잔액 */}
      <div style={topBarStyle}>
        <CoinBalance />
      </div>

      {isWin && view === "result" ? (
        <div style={centerWrapStyle}>
          <div style={cardStyle}>
            <h2 style={titleStyle}>축하합니다!</h2>
            <p style={descStyle}>보상으로 코인이 지급되었습니다.</p>
            <div style={hintStyle}>3초 후 상품 리스트로 이동합니다.</div>
          </div>
        </div>
      ) : (
        <>
          {isWin && view === "products" && (
            <div style={contentStyle}>
              <h2 style={winTitleStyle}>축하합니다!</h2>
              <p style={descStyle}>보상으로 코인이 지급되었습니다.</p>
            </div>
          )}
          {!isWin && (
            <div style={contentStyle}>
              <h2 style={loseTitleStyle}>아쉽게도 이번 게임은 패배했어요</h2>
              <p style={descStyle}>
                그래도 보유한 코인으로
                <br />
                원하는 상품에 응모할 수 있어요.
              </p>
            </div>
          )}
          <div
            style={{ width: "100%", maxWidth: 420, boxSizing: "border-box" }}
          >
            <ProductGrid
              products={products}
              randomProducts={randomProducts}
              follower={follower}
              request_num={request_num}
              onSelect={onSelectProduct}
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ===================== STYLES ===================== */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px 16px 40px 16px",
  boxSizing: "border-box",
  gap: 20,
  zIndex: 3,
};

const topBarStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  display: "flex",
  justifyContent: "flex-end",
};

const centerWrapStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#ffffff",
  borderRadius: 16,
  padding: "22px 20px",
  boxShadow: "0 10px 26px rgba(0,0,0,0.10)",
  boxSizing: "border-box",
  textAlign: "center",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 800,
  color: "#111827",
};

const contentStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  display: "flex",
  flexDirection: "column",
  gap: 16,
  boxSizing: "border-box",
};

const winTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 800,
  color: "#111827",
};

const loseTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
  color: "#111827",
};

const descStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.6,
  color: "#374151",
};

const hintStyle: React.CSSProperties = {
  marginTop: 16,
  fontSize: 13,
  color: "#6b7280",
};
