"use client";

import Image from "next/image";

export interface Product {
  id?: string;
  name?: string;
  image?: string;
}
interface ProductGridProps {
  products: Product[];
  follower: string;
  request_num: number;
  onSelect: (selected: ISelectedProducts) => void;
}
interface ISelectedProducts {
  follower: string;
  product_id: string;
  request_num: number;
  name: string;
}

export function ProductGrid({
  products,
  follower,
  request_num,
  onSelect,
}: ProductGridProps) {
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

          <div style={productNameStyle}>{p.name}</div>
        </button>
      ))}
    </div>
  );
}

/* ===== styles ===== */

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 14,
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

const productNameStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 14,
  fontWeight: 700,
  color: "#111827",
};
