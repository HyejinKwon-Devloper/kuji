"use client";

import React, { useEffect, useMemo, useReducer, useState } from "react";
import Image from "next/image";
import { PHASE_CONTENT, RPS_IMAGE_MAP } from "../constant/common";
import { RpsCardRow } from "./RpsCardRow";
import {
  getRandomRps,
  judgeRps,
  RpsResult,
  RpsValue,
  whoWithGame,
} from "../util/game.util";
import { supabase } from "@/lib/supabase";

interface RpsStageProps {
  /** 외부에서 phase를 들고 싶으면 유지, 아니면 내부에서만 써도 됨 */
  phase: number;
  coin: number;
  handlePhase: (phase: number) => void;

  onResult?: (result: RpsResult) => void;
  handleCoin: (value?: number) => void;
  handleStep?: (step?: number) => void;
}

/**
 * 요구사항:
 * 1,2는 준비(자동 진행)
 * 3-4를 한 묶음으로: 3(소개) 자동 -> 4(stage)에서 멈춤(사용자 액션)
 * 5-6을 한 묶음으로: 5 자동 -> 6에서 멈춤
 * 7-8을 한 묶음으로: 7 자동 -> 8에서 멈춤
 *
 * 즉, (intro -> action) 3세트로 진행하고,
 * action(4/6/8)에서는 사용자가 게임하고 win이면 GO/STOP으로 끊는다.
 */

const STAGE_GROUPS = [
  { intro: 3, action: 4 },
  { intro: 5, action: 6 },
  { intro: 7, action: 8 },
] as const;

type GroupIndex = 0 | 1 | 2;

type GameState = {
  groupIndex: GroupIndex;
  phase: number;

  selected: RpsValue | null;
  opponent: RpsValue | null;
  result: RpsResult | null;

  showButtons: boolean;
};

type GameAction =
  | { type: "SYNC_PHASE_FROM_PARENT"; phase: number }
  | { type: "AUTO_NEXT_PHASE" }
  | { type: "ENTER_GROUP"; groupIndex: GroupIndex }
  | { type: "ROUND_RESET" }
  | { type: "ROUND_SET_SELECTION"; selected: RpsValue }
  | { type: "ROUND_SET_RESULT"; opponent: RpsValue; result: RpsResult }
  | { type: "SHOW_BUTTONS" }
  | { type: "HIDE_BUTTONS" }
  | { type: "NEXT_GROUP" };

const initialState: GameState = {
  groupIndex: 0,
  phase: 1,
  selected: null,
  opponent: null,
  result: null,
  showButtons: false,
};

function resolveGroupIndexFromPhase(p: number): GroupIndex {
  // 1~4 => 0, 5~6 => 1, 7~8 => 2 (의도에 맞춘 단순 매핑)
  if (p >= 7) return 2;
  if (p >= 5) return 1;
  return 0;
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SYNC_PHASE_FROM_PARENT": {
      const nextPhase = action.phase;
      const nextGroup = resolveGroupIndexFromPhase(nextPhase);
      return {
        ...state,
        phase: nextPhase,
        groupIndex: nextGroup,
      };
    }

    case "AUTO_NEXT_PHASE":
      return { ...state, phase: state.phase + 1 };

    case "ENTER_GROUP": {
      const g = action.groupIndex;
      return {
        ...state,
        groupIndex: g,
        phase: STAGE_GROUPS[g].intro,
        selected: null,
        opponent: null,
        result: null,
        showButtons: false,
      };
    }

    case "ROUND_RESET":
      return {
        ...state,
        selected: null,
        opponent: null,
        result: null,
        showButtons: false,
      };

    case "ROUND_SET_SELECTION":
      return { ...state, selected: action.selected };

    case "ROUND_SET_RESULT":
      return { ...state, opponent: action.opponent, result: action.result };

    case "SHOW_BUTTONS":
      return { ...state, showButtons: true };

    case "HIDE_BUTTONS":
      return { ...state, showButtons: false };

    case "NEXT_GROUP": {
      const nextIndex = (state.groupIndex + 1) as GroupIndex | 3;
      if (nextIndex === 3) {
        // 다음 그룹 없음(전승 처리 등은 컴포넌트에서)
        return state;
      }
      return {
        ...state,
        groupIndex: nextIndex,
        phase: STAGE_GROUPS[nextIndex].intro,
        selected: null,
        opponent: null,
        result: null,
        showButtons: false,
      };
    }

    default:
      return state;
  }
}

export const RpsStage = ({
  phase: parentPhase,
  coin,
  handlePhase,
  onResult,
  handleStep,
  handleCoin,
}: RpsStageProps) => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    phase: parentPhase ?? 1,
    groupIndex: resolveGroupIndexFromPhase(parentPhase ?? 1),
  });

  const [winCount, setCount] = useState<number>(0);
  const [lock, setLock] = useState<boolean>(false);
  // 부모 phase와 동기화(부모가 phase를 소유하는 구조를 유지하려면 필요)
  useEffect(() => {
    if (typeof parentPhase !== "number") return;
    if (parentPhase === state.phase) return;
    dispatch({ type: "SYNC_PHASE_FROM_PARENT", phase: parentPhase });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentPhase]);

  // 현재 phase에 해당하는 콘텐츠
  const content = PHASE_CONTENT[state.phase];

  // 현재 그룹 정보
  const group = STAGE_GROUPS[state.groupIndex];
  const isStageLabel = content?.label === "stage";
  const isActionPhase = state.phase === group.action && isStageLabel; // 4/6/8만 true
  const isIntroPhase = state.phase === group.intro; // 3/5/7

  const who = useMemo(() => whoWithGame(state.phase), [state.phase]);

  /**
   * 자동 진행 규칙:
   * - phase 1 -> 2 -> 3: 2초마다 자동
   * - intro(3/5/7)에서는 2초 후 action(4/6/8)으로 자동
   * - action(4/6/8)에서는 멈춤 (유저 선택/GO로 진행)
   */
  useEffect(() => {
    if (!PHASE_CONTENT[state.phase]) return;

    // action에서는 자동 진행 금지
    if (isActionPhase) return;

    const t = setTimeout(() => {
      // 준비 단계(1,2)는 그냥 +1
      if (state.phase === 1 || state.phase === 2) {
        const next = state.phase + 1;
        dispatch({ type: "AUTO_NEXT_PHASE" });
        handlePhase(next);
        return;
      }

      // intro(3/5/7) -> action(4/6/8)
      if (isIntroPhase) {
        const next = state.phase + 1;
        dispatch({ type: "AUTO_NEXT_PHASE" });
        handlePhase(next);
        return;
      }

      // 기타는 기본적으로 +1 (안전장치)
      const next = state.phase + 1;
      dispatch({ type: "AUTO_NEXT_PHASE" });
      handlePhase(next);
    }, 2000);

    return () => clearTimeout(t);
  }, [state.phase, isActionPhase, isIntroPhase, handlePhase]);

  const handleSelect = async (value: string, label: string) => {
    setLock(true);
    const curruntCoin = coin;
    if (!isActionPhase) return;

    if (
      !window.confirm(`${label}를 선택하셨습니다.\n선택을 확정하시겠습니까?`)
    ) {
      return;
    }

    const userChoice = value as RpsValue;
    const opponentChoice = getRandomRps();
    const gameResult = judgeRps(userChoice, opponentChoice);

    dispatch({ type: "ROUND_SET_SELECTION", selected: userChoice });
    dispatch({
      type: "ROUND_SET_RESULT",
      opponent: opponentChoice,
      result: gameResult,
    });

    if (gameResult === "draw") {
      alert("무승부 입니다. 다시 도전하세요!");
      setLock(false);
      dispatch({ type: "ROUND_RESET" });
      return;
    }

    if (gameResult === "lose") {
      alert("아쉽게도 패배입니다.ㅠㅠ");
      onResult?.("lose");
      handleCoin(1);
      handleStep?.();
      return;
    }

    // win
    if (state.phase < 8) {
      handleCoin(curruntCoin + 1);
      dispatch({ type: "SHOW_BUTTONS" });
      alert("축하합니다! 이기셨습니다~! 아래 GO / STOP 버튼을 선택해주세요.");
      setCount((prev) => prev + 1);
      return;
    }

    // 마지막 action(8)에서 승리 => 전승
    alert("축하합니다!!! 전승입니다!!");

    handleCoin(curruntCoin + 1);
    onResult?.("win");
    handleStep?.();
  };

  const handleGo = async () => {
    // 다음 묶음으로 이동
    dispatch({ type: "HIDE_BUTTONS" });
    dispatch({ type: "ROUND_RESET" });

    const nextIndex = state.groupIndex + 1;

    // 다음 그룹이 없으면(즉 3판 끝) 여기서는 win 처리 혹은 종료
    if (nextIndex >= STAGE_GROUPS.length) {
      onResult?.("win");
      handleStep?.();
      return;
    }

    const nextGroup = nextIndex as GroupIndex;
    dispatch({ type: "ENTER_GROUP", groupIndex: nextGroup });
    handlePhase(STAGE_GROUPS[nextGroup].intro);
    setLock(false);
  };

  const handleStop = async () => {
    // “이 시점에서 종료(승리로 종료)”로 처리
    onResult?.("win");

    handleStep?.();
  };

  if (!content) return null;

  const { selected, opponent, result, showButtons } = state;

  return (
    <div style={rpsContainerStyle}>
      {/* 인물 / 이미지 */}
      <div style={characterStyle}>
        <Image
          src={content.image}
          alt={content.label}
          width={160}
          height={160}
        />
      </div>

      {/* 말풍선 */}
      <div style={bubbleStyle}>
        {content.message}
        <span style={bubbleTailStyle} />
      </div>

      {/* action(4/6/8)에서만 카드 표시 */}
      {isActionPhase && (
        <>
          <RpsCardRow
            selected={selected}
            disabled={lock}
            onSelect={handleSelect}
          />

          {/* 상대 선택 결과 */}
          {opponent && result && (
            <div style={resultBoxStyle}>
              <div style={resultItemStyle}>
                <span style={resultLabelStyle}>{who}</span>
                <Image
                  src={RPS_IMAGE_MAP[opponent]}
                  alt={opponent}
                  width={120}
                  height={120}
                />
              </div>

              <div style={resultTextStyle}>
                결과:{" "}
                <strong>
                  {result === "win"
                    ? "승리 🎉"
                    : result === "lose"
                    ? "패배 😢"
                    : "무승부 😐"}
                </strong>
              </div>

              {/* 승리 + action phase에서만 GO/STOP 노출 */}
              {showButtons && result === "win" && (
                <div style={actionButtonRowStyle}>
                  <button style={goButtonStyle} onClick={handleGo}>
                    GO
                  </button>
                  <button style={stopButtonStyle} onClick={handleStop}>
                    STOP
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ===================== STYLE ===================== */

const rpsContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
  zIndex: 3,
  padding: "0 12px",
};

const characterStyle: React.CSSProperties = {
  width: 160,
  height: 160,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const bubbleStyle: React.CSSProperties = {
  position: "relative",
  padding: "10px 16px",
  backgroundColor: "#ffffff",
  borderRadius: 9999,
  fontSize: 14,
  fontWeight: 500,
  color: "#111827",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const bubbleTailStyle: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: "50%",
  transform: "translateX(-50%)",
  width: 0,
  height: 0,
  borderLeft: "6px solid transparent",
  borderRight: "6px solid transparent",
  borderTop: "6px solid #ffffff",
};

const resultBoxStyle: React.CSSProperties = {
  marginTop: 16,
  padding: "12px 16px",
  backgroundColor: "#f9fafb",
  borderRadius: 12,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  width: "100%",
  maxWidth: 360,
  boxSizing: "border-box",
};

const resultItemStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
};

const resultLabelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#000",
  fontWeight: 600,
};

const resultTextStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "#111827",
};

const actionButtonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  width: "100%",
  marginTop: 12,
};

const goButtonStyle: React.CSSProperties = {
  flex: 1,
  height: 44,
  borderRadius: 12,
  backgroundColor: "#22c55e",
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
};

const stopButtonStyle: React.CSSProperties = {
  flex: 1,
  height: 44,
  borderRadius: 12,
  backgroundColor: "#f3f4f6",
  color: "#374151",
  fontSize: 14,
  fontWeight: 600,
  border: "1px solid #e5e7eb",
  cursor: "pointer",
};
