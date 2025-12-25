import { RpsValue } from "../util/game.util";

const PHASE_CONTENT: Record<
  number,
  { label: string; image: string; message: string }
> = {
  1: {
    label: "ready",
    image: "/ready.jpg",
    message: "가위바위보를 시작할게요!",
  },
  2: {
    label: "ready",
    image: "/ready.jpg",
    message: "준비되셨나요?",
  },
  3: {
    label: "첫 도전",
    image: "/tan.png",
    message: "탄지로와 한판!",
  },
  4: {
    label: "stage",
    image: "/tan.png",
    message: "가위바위보!",
  },
  5: {
    label: "두번째 도전",
    image: "/ino.png",
    message: "이노스케와 한판!",
  },
  6: {
    label: "stage",
    image: "/ino.png",
    message: "가위바위보!",
  },
  7: {
    label: "세번째 도전",
    image: "/jen.png",
    message: "젠이츠와 한판!",
  },
  8: {
    label: "stage",
    image: "/jen.png",
    message: "가위바위보!",
  },
};

const RPS_OPTIONS = [
  {
    value: "scissors",
    label: "가위",
    image: "/scissor.png",
  },
  {
    value: "rock",
    label: "바위",
    image: "/rock.png",
  },
  {
    value: "paper",
    label: "보",
    image: "/paper.jpg",
  },
];

const RPS_IMAGE_MAP: Record<RpsValue, string> = {
  scissor: "/scissor.png",
  rock: "/rock.png",
  paper: "/paper.jpg",
};

const PRODUCT_LIST = [
  {
    id: "1",
    name: "상품 S",
    image: "/hashira.jpg",
    description: "비공굿 하시라전 홀로그램 포스트",
  },
  {
    id: "3",
    name: "상품 B",
    image: "/mui.jpg",
    description: "무이치로 아크릴 코롯토",
  },
  {
    id: "18",
    name: "상품 B",
    image: "/uzui.jpg",
    description: "우즈아 아크릴스탠드",
  },
  {
    id: "5",
    name: "상품 D",
    image: "/mui_doll.jpg",
    description: "무이치로 인형",
  },
  {
    id: "15",
    name: "상품 E",
    image: "/tan_ga.jpg",
    description: "탄지로 가챠+코등이 세트",
  },
  {
    id: "16",
    name: "상품 E",
    image: "/mui_ori.jpg",
    description: "무이치로 원화키링",
  },
  {
    id: "8",
    name: "상품 F",
    image: "/oba.jpg",
    description: "오바나이 카드",
  },
  {
    id: "9",
    name: "상품 F",
    image: "/shino.jpg",
    description: "시노부 이치반쿠지 포스터",
  },
  {
    id: "14",
    name: "상품 F",
    image: "/kyo.jpg",
    description: "쿄쥬로 뽑기 가챠",
  },
];

export { PHASE_CONTENT, RPS_OPTIONS, RPS_IMAGE_MAP, PRODUCT_LIST };
