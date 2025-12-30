"use client";

import Image from "next/image";

export interface Product {
  id?: string;
  name?: string;
  image?: string;
  description?: string;
}
interface ProductGridProps {
  products: Product[];
  randomProducts: Product[];
  follower: string;
  request_num: number;
  onSelect: (selected: ISelectedProducts) => void;
}
interface ISelectedProducts {
  follower: string;
  product_id: string;
  request_num: number;
  name: string;
  isRandom?: boolean;
}

export function ProductGrid({
  products,
  randomProducts,
  follower,
  request_num,
  onSelect,
}: ProductGridProps) {
  const handleRandomSelect = () => {
    if (randomProducts.length === 0) return;

    const randomIndex = Math.floor(Math.random() * randomProducts.length);
    const randomProduct = randomProducts[randomIndex];

    onSelect({
      follower,
      product_id: randomProduct.id ?? "0",
      request_num,
      name: randomProduct.name ?? "",
      isRandom: true,
    });
  };

  return (
    <div style={gridStyle}>
      {products.map((p) => (
        <button
          key={p.id}
          style={productCardStyle}
          onClick={() =>
            onSelect({
              follower,
              product_id: p.id ?? "0",
              request_num,
              name: p.name ?? "",
            })
          }
        >
          <div style={imageWrapStyle}>
            <Image
              src={p.image ?? ""}
              alt={p.name ?? ""}
              width={240}
              height={180}
              style={imageStyle}
            />
          </div>

          <div style={productInfoStyle}>
            <div style={productNameStyle}>{p.name}</div>
            {p.description && (
              <div style={productDescStyle}>{p.description}</div>
            )}
          </div>
        </button>
      ))}

      {/* 랜덤 선택 카드 */}
      <button style={randomCardStyle} onClick={handleRandomSelect}>
        <div style={randomImageWrapStyle}>
          <div style={randomIconStyle}>🎲</div>
          <div style={randomTextStyle}>랜덤 선택</div>
        </div>
        <div style={randomNameStyle}>모든 상품 중 랜덤으로!</div>
      </button>
    </div>
  );
}

/* ===== styles ===== */

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 14,
  width: "100%",
  maxWidth: 420,
  boxSizing: "border-box",
};

const productCardStyle: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  overflow: "hidden",
  padding: 0,
  cursor: "pointer",
  textAlign: "left",
};

const imageWrapStyle: React.CSSProperties = {
  width: "100%",
  aspectRatio: "4 / 3",
  backgroundColor: "#f3f4f6",
};

const imageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const productInfoStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: "10px 12px",
};

const productNameStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#111827",
};

const productDescStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 400,
  color: "#6b7280",
  lineHeight: 1.4,
};

const randomCardStyle: React.CSSProperties = {
  borderRadius: 16,
  border: "2px dashed #8b5cf6",
  backgroundColor: "#f5f3ff",
  overflow: "hidden",
  padding: 0,
  cursor: "pointer",
  textAlign: "center",
  gridColumn: "1 / -1", // 전체 너비 사용
};

const randomImageWrapStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px 12px",
  backgroundColor: "#ede9fe",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

const randomIconStyle: React.CSSProperties = {
  fontSize: 32,
};

const randomTextStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#7c3aed",
};

const randomNameStyle: React.CSSProperties = {
  padding: "8px 12px",
  fontSize: 13,
  fontWeight: 700,
  color: "#6d28d9",
};
