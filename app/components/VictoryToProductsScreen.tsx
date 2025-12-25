"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CoinBalance } from "./CoinBalance";
import { ProductGrid } from "./ProductGrid";
import { PRODUCT_LIST } from "../constant/common";
import { supabase } from "@/lib/supabase";

type Product = {
  id?: string;
  name?: string;
  image?: string; // e.g. "/products/p1.png"
  description?: string;
};

interface ISelectedProducts {
  follower: string;
  product_id: string;
  name: string;
  request_num: number;
}
interface VictoryToProductsScreenProps {
  // 필요하면 외부에서 상품 리스트를 주입
  products?: Product[];
  // 3초 뒤 전환 시간을 바꾸고 싶을 때
  revealDelayMs?: number;
  // 상품 클릭 핸들러 (선택)
  follower: string;
  request_num: number;
  onSelectProduct: (selected: ISelectedProducts) => void;
}

export function VictoryToProductsScreen({
  revealDelayMs = 3000,
  follower,
  request_num,

  onSelectProduct,
}: VictoryToProductsScreenProps) {
  const [view, setView] = useState<"victory" | "products">("victory");
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    const getProd = async () => {
      const { data } = (await supabase
        .from("prize")
        .select("id, name")
        .eq("sale_yn", "Y")) as {
        data: { id: string; name: string }[] | null;
      };

      if (data) {
        const result = data.map((item1) => {
          const info = PRODUCT_LIST.find((item2) => item1.id === item2.id);

          return {
            ...info,
          };
        });
        setProducts(result);
      }
    };
    getProd();
  }, []);
  useEffect(() => {
    if (view !== "victory") return;

    const t = setTimeout(() => {
      setView("products");
    }, revealDelayMs);

    return () => clearTimeout(t);
  }, [view, revealDelayMs]);

  return (
    <div style={pageStyle}>
      {/* 상단 잔액 */}
      <div style={topBarStyle}>
        <CoinBalance balance={request_num} />
      </div>

      {view === "victory" ? (
        <div style={centerWrapStyle}>
          <div style={cardStyle}>
            <h2 style={titleStyle}>축하합니다!</h2>
            <p style={descStyle}>보상으로 코인이 지급되었습니다.</p>

            <div style={hintStyle}>3초 후 상품 리스트로 이동합니다.</div>
          </div>
        </div>
      ) : (
        <ProductGrid
          products={PRODUCT_LIST}
          follower={follower}
          request_num={request_num}
          onSelect={onSelectProduct}
        />
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
  padding: "20px 16px",
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

const descStyle: React.CSSProperties = {
  margin: "10px 0 0 0",
  fontSize: 14,
  lineHeight: 1.6,
  color: "#374151",
};

const hintStyle: React.CSSProperties = {
  marginTop: 16,
  fontSize: 13,
  color: "#6b7280",
};
