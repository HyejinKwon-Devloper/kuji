import React from "react";

// Props 타입 정의
interface BettingComponentProps {
  showNotice: boolean;
}

export const BettingComponent = ({ showNotice }: BettingComponentProps) => {
  return (
    <div
      style={{
        ...bettingSlotStyle,
        opacity: showNotice ? 1 : 0,
        transform: showNotice ? "scale(1)" : "scale(1.04)",
      }}
    >
      <p style={bettingInfoTitleStyle}>
        당신은 현재 <strong>2개의 코인</strong>을 가지고 있습니다.
        <br />
        배팅을 하시겠습니까?
      </p>

      <ul style={bettingInfoListStyle}>
        <li style={bettingInfoListItemStyle}>
          <span style={bettingInfoListDotStyle} />
          <span>1개의 코인을 소모하여 배팅에 도전합니다.</span>
        </li>
        <li style={bettingInfoListItemStyle}>
          <span style={bettingInfoListDotStyle} />
          <span>
            가위바위보에서 이기면 <strong>최대 3개의 코인</strong>을 더 얻을 수
            있습니다.
          </span>
        </li>
        <li style={bettingInfoListItemStyle}>
          <span style={bettingInfoListDotStyle} />
          <span>
            지면 배팅에 걸었던 코인과 얻었던 코인
            <strong> 모두를 잃습니다.</strong>
          </span>
        </li>
        <li style={bettingInfoListItemStyle}>
          <span style={bettingInfoListDotStyle} />
          <span>보유한 코인은 하나의 상품에 응모할 수 있습니다.</span>
        </li>
        <li style={bettingInfoListItemStyle}>
          <span style={bettingInfoListDotStyle} />
          <span>이벤트 종료 후 추첨을 통해 당첨자가 발표됩니다.</span>
        </li>{" "}
        <li style={bettingInfoListItemStyle}>
          <span style={bettingInfoListDotStyle} />
          <span>
            <strong>옵션사항: </strong>당첨 화면을 캡쳐해주세요!
          </span>
        </li>
      </ul>
    </div>
  );
};

const bettingSlotStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  padding: "18px 20px",
  backgroundColor: "#fff",
  backdropFilter: "none",
  WebkitBackdropFilter: "none",
  borderRadius: 16,
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  transition: "opacity 0.5s ease, transform 0.5s ease",
};

/* ===== 기타 ===== */

const bettingInfoTitleStyle = {
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 12,
};

const bettingInfoListStyle = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column" as const,
  gap: 10,
};

const bettingInfoListItemStyle = {
  display: "flex",
  gap: 8,
  fontSize: 13,
};

const bettingInfoListDotStyle = {
  width: 4,
  height: 4,
  marginTop: 7,
  borderRadius: "50%",
  backgroundColor: "#9ca3af",
};
