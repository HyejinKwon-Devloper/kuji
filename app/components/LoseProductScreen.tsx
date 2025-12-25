"use client";

import { useEffect, useState } from "react";
import { PRODUCT_LIST } from "../constant/common";
import { CoinBalance } from "./CoinBalance";
import { ProductGrid } from "./ProductGrid";
import { supabase } from "@/lib/supabase";

interface LoseProductScreenProps {
  follower: string;
  request_num: number;
  onSelectProduct: (selected: ISelectedProducts) => void;
}

interface ISelectedProducts {
  follower: string;
  product_id: string;
  request_num: number;
  name: string;
}

interface IProduct {
  id?: string;
  name?: string;
  image?: string;
  description?: string;
}

export function LoseProductScreen({
  follower,
  request_num,
  onSelectProduct,
}: LoseProductScreenProps) {
  const [products, setProducts] = useState<IProduct[]>([]);
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
          console.log(PRODUCT_LIST.find((item2) => item1.id == item2.id));
          const info = PRODUCT_LIST.find((item2) => item1.id == item2.id);
          return {
            ...info,
          };
        });
        setProducts(result);
      }
    };
    getProd();
  }, []);
  return (
    <div style={pageStyle}>
      {/* 상단 잔액 */}
      <div style={topBarStyle}>
        <CoinBalance balance={request_num} />
      </div>

      <div style={contentStyle}>
        <h2 style={titleStyle}>아쉽게도 이번 게임은 패배했어요</h2>
        <p style={descStyle}>
          그래도 보유한 코인으로
          <br />
          원하는 상품에 응모할 수 있어요.
        </p>

        <ProductGrid
          products={products}
          follower={follower}
          request_num={request_num}
          onSelect={onSelectProduct}
        />
      </div>
    </div>
  );
}
const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px 16px",
  gap: 20,
  zIndex: 3,
};

const topBarStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  display: "flex",
  justifyContent: "flex-end",
};

const contentStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const titleStyle: React.CSSProperties = {
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
