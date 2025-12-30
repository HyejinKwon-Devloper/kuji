type RpsValue = "scissor" | "rock" | "paper";

const RPS_VALUES: RpsValue[] = ["scissor", "rock", "paper"];

function getRandomRps(): RpsValue {
  const randomIndex = Math.floor(Math.random() * RPS_VALUES.length);
  return RPS_VALUES[randomIndex];
}

type RpsResult = "win" | "lose" | "draw";

function judgeRps(user: RpsValue, opponent: RpsValue): RpsResult {
  if (user === opponent) return "draw";

  if (
    (user === "scissor" && opponent === "paper") ||
    (user === "rock" && opponent === "scissor") ||
    (user === "paper" && opponent === "rock")
  ) {
    return "win";
  }

  return "lose";
}

function whoWithGame(phase: number) {
  if (phase < 6) return "우즈이";
  else if (phase < 8) return "오바나이";
  else if (phase < 10) return "렌고쿠";
  else return "";
}

export { getRandomRps, judgeRps, whoWithGame };
export type { RpsValue, RpsResult };
