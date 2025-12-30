import { create } from "zustand";
import { RpsResult } from "../util/game.util";

export interface ISelectedProducts {
  follower: string;
  product_id: string;
  name: string;
  request_num: number;
  isRandom?: boolean;
}

interface GameStore {
  // UI State
  titlePosition: { top: string; transform: string };
  setTitlePosition: (position: { top: string; transform: string }) => void;

  backgroundOpacity: number;
  setBackgroundOpacity: (opacity: number) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Game State
  step: number;
  setStep: (step: number | ((prev: number) => number)) => void;

  totalCoin: number;
  setCoin: (coin: number | ((prev: number) => number)) => void;
  balance: number;
  setBalance: (balance: number) => void;

  result: RpsResult | null;
  setResult: (result: RpsResult | null) => void;

  // User State
  threadId: string;
  setThreadId: (id: string) => void;

  // Modal State
  opened: boolean;
  setOpened: (opened: boolean) => void;

  selectedProduct?: ISelectedProducts;
  setSelectedProduct: (product: ISelectedProducts | undefined) => void;

  // Reset function
  reset: () => void;
}

const initialState = {
  titlePosition: { top: "50%", transform: "translate(-50%, -50%)" },
  backgroundOpacity: 1,
  isLoading: true,
  step: 1,
  totalCoin: 2,
  balance: 2,
  result: null,
  threadId: "",
  opened: false,
  selectedProduct: undefined,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setTitlePosition: (position) => set({ titlePosition: position }),
  setBackgroundOpacity: (opacity) => set({ backgroundOpacity: opacity }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  setStep: (step) =>
    set((state) =>
      typeof step === "function" ? { step: step(state.step) } : { step }
    ),

  setCoin: (coin) =>
    set((state) =>
      typeof coin === "function"
        ? { totalCoin: coin(state.totalCoin) }
        : { totalCoin: coin }
    ),

  setBalance: (balance) => set({ balance }),

  setResult: (result) => set({ result }),
  setThreadId: (id) => set({ threadId: id }),
  setOpened: (opened) => set({ opened }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),

  reset: () => set(initialState),
}));
