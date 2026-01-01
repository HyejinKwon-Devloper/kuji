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
    image: "/rock_usui.png",
    message: "우즈이와 한판!",
  },
  4: {
    label: "stage",
    image: "/rock_usui.png",
    message: "가위바위보!",
  },
  5: {
    label: "두번째 도전",
    image: "/scissor_obanai.png",
    message: "오바나이와 한판!",
  },
  6: {
    label: "stage",
    image: "/scissor_obanai.png",
    message: "가위바위보!",
  },
  7: {
    label: "세번째 도전",
    image: "/paper_kyo.png",
    message: "렌고쿠와 한판!",
  },
  8: {
    label: "stage",
    image: "/paper_kyo.png",
    message: "가위바위보!",
  },
};

const RPS_OPTIONS = [
  {
    value: "scissor",
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
    id: "38",
    name: "상품 S",
    image: "/sanemi.jpg",
    description: "사네미 큐포스켓 세트",
  },
  {
    id: "23",
    name: "상품 A",
    image: "/A.jpg",
    description: "유이치로 클리어파일",
  },
  {
    id: "24",
    name: "상품 A",
    image: "/A-2.jpg",
    description: "챠챠마루 피규어",
  },
  {
    id: "25",
    name: "상품 B",
    image: "/B-1.jpg",
    description: "애드버지 이노스케",
  },
  {
    id: "15",
    name: "상품 B",
    image: "/B-2.jpg",
    description: "애드버지 탄지로",
  },
  {
    id: "27",
    name: "상품 C",
    image: "/C-1.jpg",
    description: "이치방쿠지 탄지로 키링 - mui_atelier❤️",
  },
  {
    id: "28",
    name: "상품 C",
    image: "/C-2.jpg",
    description: "시노부 뱃지 - mui_atelier❤️",
  },
  {
    id: "29",
    name: "상품 C",
    image: "/C-3.jpg",
    description: "시노부 밀키 캔디 케이스 - mui_atelier❤️",
  },
  {
    id: "30",
    name: "상품 D",
    image: "/D.jpg",
    description: "젠이츠 뽑기 인형",
  },
  {
    id: "31",
    name: "상품 E",
    image: "/E.jpg",
    description: "미츠리 투명 카드 - coaal❤️",
  },
  {
    id: "16",
    name: "상품 E",
    image: "/mui_ori.jpg",
    description: "무이치로 원화 키링",
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
  {
    id: "32",
    name: "상품 F",
    image: "/F-1.jpg",
    description: "무이치로 뱃지 - coaal❤️",
  },
  {
    id: "33",
    name: "상품 F",
    image: "/F-2.jpg",
    description: "랜덤 핀뱃지1 (2개) - coaal❤️",
  },

  {
    id: "34",
    name: "상품 F",
    image: "/F-2.jpg",
    description: "랜덤 핀뱃지1 (2개) - coaal❤️",
  },

  {
    id: "35",
    name: "상품 F",
    image: "/F-3.jpg",
    description: "시노부 뱃지",
  },

  {
    id: "22",
    name: "상품 F",
    image: "/F-4.jpg",
    description: "이노스케 이즐 태피스트리 - coaal❤️",
  },

  {
    id: "36",
    name: "상품 F",
    image: "/F-5.jpg",
    description: "교메이 쿠션 키링",
  },

  {
    id: "37",
    name: "상품 F",
    image: "/F-6.jpg",
    description: "사네미 오하기 뱃지",
  },
  {
    id: "39",
    name: "상품 F",
    image: "/F-4.jpg",
    description: "이노스케 이즐 태피스트리 - coaal❤️",
  },
];

// 꽝 상품 10개
const BOMB_PRODUCTS = Array.from({ length: 10 }, (_, i) => ({
  id: `bomb-${i + 1}`,
  name: "꽝",
  image: `/bomb${i + 1}.jpg`,
  description: "아쉽지만 꽝입니다",
}));

// 행운 상품 2개
const LUCKY_PRODUCTS = Array.from({ length: 2 }, (_, i) => ({
  id: `lucky-${i + 1}`,
  name: "행운",
  image: `/lucky${i + 1}.jpg`,
  description: "행운의 당첨!",
}));

export {
  PHASE_CONTENT,
  RPS_OPTIONS,
  RPS_IMAGE_MAP,
  PRODUCT_LIST,
  BOMB_PRODUCTS,
  LUCKY_PRODUCTS,
};
