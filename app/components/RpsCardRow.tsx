"use client";

import Image from "next/image";
import { RPS_OPTIONS } from "../constant/common";

interface RpsCardRowProps {
  selected: string | null;
  disabled?: boolean;
  onSelect: (value: string, label: string) => void;
}

export const RpsCardRow = ({
  selected,
  disabled = false,
  onSelect,
}: RpsCardRowProps) => {
  return (
    <div style={cardRowStyle}>
      {RPS_OPTIONS.map((option) => {
        const isSelected = selected === option.value;

        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            style={{
              ...cardStyle,
              ...(disabled ? disabledCardStyle : {}),
              ...(isSelected ? selectedCardStyle : {}),
            }}
            onClick={() => onSelect(option.value, option.label)}
          >
            <Image
              src={option.image}
              alt={option.label}
              width={64}
              height={64}
            />
            <span style={cardLabelStyle}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const cardRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 16,
  marginTop: 12,
};

const cardStyle: React.CSSProperties = {
  width: 96,
  height: 120,
  borderRadius: 16,

  // ⚠️ border shorthand + borderColor 혼용 경고 방지: 분해해서 사용
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "#e5e7eb",

  backgroundColor: "#ffffff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,

  cursor: "pointer",
  transition: "transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease",
};

const selectedCardStyle: React.CSSProperties = {
  transform: "translateY(-4px)",
  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  borderColor: "#f59e0b",
};

const disabledCardStyle: React.CSSProperties = {
  opacity: 0.45,
  cursor: "not-allowed",
  transform: "none",
  boxShadow: "none",
};

const cardLabelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#111827",
};
