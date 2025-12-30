import Image from "next/image";
import { useGameStore } from "../store/gameStore";

export const CoinBalance = () => {
  const { balance } = useGameStore();
  return (
    <>
      {/* 코인 보유량 표시 */}
      <div style={coinBalanceWrapperStyle}>
        <div style={coinBalanceLabelStyle}>현재 보유 코인</div>
        <div style={coinBalanceBoxStyle}>
          <Image src="/coin.png" alt="coin" width={24} height={24} />
          <div style={coinBalanceCountStyle}>{balance}</div>
        </div>
      </div>
    </>
  );
};
const coinBalanceWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  zIndex: 3,
};

const coinBalanceLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#6b7280", // gray-500
  marginBottom: 6,
};

const coinBalanceBoxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  backgroundColor: "#ffffff",
  borderRadius: 9999,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
};

const coinBalanceCountStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#111827",
};
