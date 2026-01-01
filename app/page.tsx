"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";

import { CoinIntro } from "./components/CoinIntro";
import { Game } from "./components/Game";
import { ResultProductScreen } from "./components/ResultProductScreen";
import { Omikuji } from "./components/Omikuji";
import { EventBanner } from "./components/EventBanner";
import { supabase } from "@/lib/supabase";
import { getCookie } from "@/lib/util";
import { PrizeDrawModal } from "./components/PrizeDraw";
import { useGameStore, ISelectedProducts } from "./store/gameStore";
export default function Home() {
  const {
    titlePosition,
    setTitlePosition,
    backgroundOpacity,
    setBackgroundOpacity,
    isLoading,
    setIsLoading,
    step,
    setStep,
    totalCoin,
    setCoin,
    setBalance,
    result,
    setResult,
    threadId,
    setThreadId,
    opened,
    setOpened,
    selectedProduct,
    setSelectedProduct,
  } = useGameStore();
  const [initialPhase, setInitialPhase] = useState<number>(1);
  const [bannerComplete, setBannerComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // 중복 실행 방지

  const handleSubmitThreadId = async () => {
    if (isSubmitting) return; // 이미 실행 중이면 무시

    if (threadId.trim() === "" || threadId === null) {
      alert("스레드아이디를 입력해주세요!");
      return;
    }

    setIsSubmitting(true); // 실행 플래그 설정

    try {
      // follower 확인
      const { data } = (await supabase
        .from("follower")
        .select("follower")
        .eq("follower", threadId)) as {
        data: { follower: string }[] | null;
      };

      const isFollower =
        data?.filter((item) => item.follower === threadId).length ?? 0;

      if (!isFollower) {
        alert(
          "팔로우신가요? 팔로우 관계를 확인해주세요!\n문제가 있으시다면 언제나 nav.jin에게 문의주세요!"
        );
        return;
      }

      // coin-own에서 기존 데이터 조회
      const { data: coinData } = (await supabase
        .from("coin-own")
        .select("coin, go_phase, first, second, third")
        .eq("follower", threadId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()) as {
        data: {
          coin: number;
          go_phase: number | null;
          first: string | null;
          second: string | null;
          third: string | null;
        } | null;
      };

      // coin-own 데이터가 없으면 새로 생성
      if (!coinData) {
        // upsert를 사용하여 중복 insert 방지
        const { error: upsertError } = await supabase.from("coin-own").upsert(
          {
            follower: threadId,
            coin: 2,
            first: "N",
            second: "N",
            third: "N",
            go_phase: 0,
          },
          {
            onConflict: "follower",
            ignoreDuplicates: false,
          }
        );

        if (upsertError) {
          console.error("coin-own upsert error:", upsertError);
        }

        setCoin(2);
        setBalance(2);
        setResult(null);
        setStep(3); // 코인 소개 화면으로
      } else {
        // 기존 데이터가 있을 때
        const coinValue = coinData.coin ?? 0;
        setCoin(coinValue);
        setBalance(coinValue);

        // 코인이 0이면 오미쿠지로
        if (coinValue <= 0) {
          setStep(6);
          return;
        }

        // go_phase가 0이면 가위바위보 완료 → ProductGrid로
        if (coinData.go_phase === 0) {
          setResult("win");
          setStep(5);
          return;
        }

        // go_phase가 0보다 크면 가위바위보 진행 중 → 게임 화면으로 복귀
        if ((coinData.go_phase ?? 0) > 0) {
          let resumePhase = 1;

          if (
            (coinData.go_phase ?? 0) >= 3 &&
            coinData.first === "Y" &&
            coinData.second === "Y"
          ) {
            // 세 번째 가위바위보 세트부터 시작 (intro 7)
            resumePhase = 7;
          } else if ((coinData.go_phase ?? 0) >= 2 && coinData.first === "Y") {
            // 두 번째 가위바위보 세트부터 시작 (intro 5)
            resumePhase = 5;
          } else if ((coinData.go_phase ?? 0) >= 1) {
            // 첫 번째 가위바위보 세트부터 시작 (intro 3)
            resumePhase = 3;
          }

          setInitialPhase(resumePhase);
          setStep(4); // 게임 화면으로
          return;
        }

        // 기본값: 코인 소개 화면
        setStep(3);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("사용자 정보 확인 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false); // 실행 완료 후 플래그 해제
    }
  };

  useEffect(() => {
    if (!bannerComplete) return;

    // Start title animation
    setTimeout(() => {
      setTitlePosition({ top: "1rem", transform: "translateX(-50%)" });
    }, 700); // Start animation after 0.5s

    // Simulate loading time
    const timer = setTimeout(() => {
      // Fade out the background
      setBackgroundOpacity(0.3);
      setIsLoading(false);
      setStep(2);

      // After fade, hide background
    }, 2000); // 2 seconds loading

    return () => {
      clearTimeout(timer);
    };
  }, [
    bannerComplete,
    setBackgroundOpacity,
    setIsLoading,
    setThreadId,
    setStep,
    setCoin,
    setBalance,
    setResult,
    setTitlePosition,
  ]);

  const handleSelectProduct = useCallback(
    async (value: ISelectedProducts) => {
      const confirmMessage = value.isRandom
        ? "랜덤 상품에 응모하시겠습니까?"
        : `${value.name}에 응모하시겠습니까?`;

      if (window.confirm(confirmMessage)) {
        if (totalCoin <= 0) {
          alert("코인이 없습니다ㅠㅠ");
          return;
        }
        setSelectedProduct(value);
        setOpened(true);
      }
    },
    [totalCoin, setSelectedProduct, setOpened]
  );

  const handleClosePrizeDrawModal = useCallback(() => {
    setOpened(false);
  }, [setOpened]);

  // 코인이 0이 되면 1.5초 후 자동으로 오미쿠지로 이동
  useEffect(() => {
    if (totalCoin === 0 && step === 5) {
      const timer = setTimeout(() => {
        setOpened(false);
        setStep(6);
      }, 1500); // 1.5초 후 이동

      return () => clearTimeout(timer);
    }
  }, [totalCoin, step, setStep, setOpened]);

  const handleCoin = useCallback(
    async (value?: number) => {
      // DB에서 최신 코인 값 조회
      const { data: coinData } = await supabase
        .from("coin-own")
        .select("coin")
        .eq("follower", threadId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const latestCoin = coinData?.coin ?? 0;

      // value가 전달되면 그 값 사용, 아니면 DB에서 조회한 값 사용
      const newCoin = value !== undefined ? value : latestCoin;

      // 5개 제한 체크
      if (newCoin > 5) {
        alert("coin은 5개를 넘길 수 없습니다.");
        return;
      }

      setCoin(newCoin);
      setBalance(newCoin);
    },
    [threadId, setCoin, setBalance]
  );

  return (
    <div
      className={`flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black ${
        step >= 5 ? "items-start" : "items-center"
      }`}
    >
      <EventBanner onComplete={() => setBannerComplete(true)} />
      {bannerComplete && isLoading && (
        <div className="flex h-120px">
          <h1
            className="bg-transparent fixed left-1/2 text-lg sm:text-2xl font-bold text-black dark:text-white z-50 text-center transition-all duration-1000 ease-out"
            style={{
              top: titlePosition.top,
              transform: titlePosition.transform,
            }}
          >
            <span className="block sm:inline">Jin의 뽑기 World에</span>{" "}
            <span className="block sm:inline">오신걸 환영합니다!</span>
          </h1>
        </div>
      )}
      <div className="" style={{ opacity: backgroundOpacity }}>
        <Image
          src="/hashira.webp"
          alt="Loading background"
          fill
          className="object-cover"
        />
      </div>
      {!isLoading && step === 2 && (
        <div className="flex flex-col items-center animate-fade-in">
          <div className="bg-white text-black px-4 py-2 rounded-lg shadow-lg mb-4 after:content-[''] after:absolute after:bottom-[-8px] after:left-1/2 after:transform after:-translate-x-1/2 after:border-l-8 after:border-r-8 after:border-t-8 after:border-l-transparent after:border-r-transparent after:border-t-white relative flex justify-center items-center">
            <input
              type="text"
              placeholder="본인의 스레드아이디를 입력해주세요"
              value={threadId}
              onChange={(e) => setThreadId(e.target.value)}
              className="border p-2 rounded text-sm"
            />
            <button
              type="button"
              onClick={() => {
                handleSubmitThreadId();
              }}
              className="ml-2 !bg-[#6FAEB7] text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              확인
            </button>
          </div>
          <Image
            src="/Muichiro.webp"
            alt="Muichiro"
            width={300}
            height={425}
            className="rounded-lg mt-2"
            style={{ zIndex: 3 }}
          />
        </div>
      )}
      {!isLoading && step === 3 && (
        <CoinIntro
          coin={totalCoin}
          handleStep={setStep}
          step={step}
          handleResult={(value) => setResult(value)}
        />
      )}
      {step === 4 && (
        <Game
          key={initialPhase}
          handleStep={(value) => setStep(value ? value : step + 1)}
          coin={totalCoin}
          handleResult={(value) => setResult(value)}
          handleCoin={(value) => handleCoin(value ? value : totalCoin + 1)}
          initialPhase={initialPhase}
        />
      )}
      {step >= 5 && step < 6 && result && (
        <ResultProductScreen
          result={result}
          follower={threadId}
          request_num={totalCoin}
          onSelectProduct={(values) => handleSelectProduct(values)}
        />
      )}
      {step >= 6 && <Omikuji />}
      {opened && (
        <PrizeDrawModal
          product={selectedProduct}
          open={opened}
          threadId={threadId}
          coin={totalCoin}
          onClose={handleClosePrizeDrawModal}
          onCoinUpdate={handleCoin}
        />
      )}
    </div>
  );
}
