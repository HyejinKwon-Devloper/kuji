"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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
  const handleSubmitThreadId = async () => {
    if (threadId.trim() === "" || threadId === null) {
      alert("스레드아이디를 입력해주세요!");
      return;
    }

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
        await supabase.from("coin-own").insert({
          follower: threadId,
          coin: 2,
          first: "N",
          second: "N",
          third: "N",
          go_phase: 0,
        });

        setCoin(2);
        setBalance(2);
        setResult(null);
      } else {
        // 기존 데이터가 있으면 상태 설정
        setCoin(coinData.coin ?? 2);
        setBalance(coinData.coin ?? 2);
      }

      // 쿠키에 threadId 저장
      document.cookie = `threadId=${threadId}; path=/; max-age=31536000`;

      // 다음 스텝으로
      setStep((prev) => prev + 1);
    } catch (error) {
      console.error("Error:", error);
      alert("사용자 정보 확인 중 오류가 발생했습니다.");
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
      const tId = getCookie("threadId");
      if (tId) {
        setThreadId(tId);
        const getFollowerData = async () => {
          const { data } = (await supabase
            .from("follower")
            .select(
              `follower
              `
            )
            .eq("follower", tId)) as {
            data: { follower: string }[] | null;
          };

          // follower 면
          const isFollower =
            data?.filter((item) => item.follower === tId).length ?? 0;
          if (isFollower) {
            // coin-own에서 최신 코인 데이터 조회
            const { data: coinData } = (await supabase
              .from("coin-own")
              .select("coin, go_phase, first, second, third")
              .eq("follower", tId)
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

            // coin-own 데이터가 없으면 기본 코인 2개로 생성 후 step 3으로 이동
            if (!coinData) {
              await supabase.from("coin-own").insert({
                follower: tId,
                coin: 2,
                first: "N",
                second: "N",
                third: "N",
                go_phase: 0,
              });

              setCoin(2);
              setBalance(2);
              setInitialPhase(1);
              setStep(3);
              setResult(null);
              return;
            }

            const coinValue = coinData.coin ?? 0;

            if (coinValue <= 0) {
              // 코인이 0이면 오미쿠지로 이동
              setCoin(0);
              setBalance(0);
              setStep(6);
              return;
            }

            // 코인 보유 시 상태 설정
            setCoin(coinValue);
            setBalance(coinValue);

            // go_phase에 따른 분기
            if (coinData.go_phase === 0) {
              // 상품 선택 단계로 바로 이동
              setResult("win");
              setStep(5);
              setInitialPhase(1);
              return;
            }

            let resumePhase = 1;
            let targetStep = 3;

            // 이미 진행한 단계가 있다면 게임 화면으로 이동
            if ((coinData.go_phase ?? 0) > 0) {
              targetStep = 4;

              if (
                (coinData.go_phase ?? 0) >= 3 &&
                coinData.first === "Y" &&
                coinData.second === "N"
              ) {
                // 세 번째 가위바위보 세트부터 시작 (intro 7)
                resumePhase = 7;
              } else if (
                (coinData.go_phase ?? 0) >= 2 &&
                coinData.first === "Y" &&
                coinData.second === "N"
              ) {
                // 두 번째 가위바위보 세트부터 시작 (intro 5)
                resumePhase = 5;
              }
            }

            setInitialPhase(resumePhase);
            setStep(targetStep);
            return;
          } else {
            alert(
              "팔로우신가요? 팔로우 관계를 확인해주세요!\n문제가 있으시다면 언제나 nav.jin에게 문의주세요!"
            );
            return;
          }
        };
        getFollowerData();
      } else setStep(2);

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

  const handleSelectProduct = async (value: ISelectedProducts) => {
    const confirmMessage = value.isRandom
      ? "랜덤 상품에 응모하시겠습니까?"
      : `${value.name}에 응모하시겠습니까?`;

    if (window.confirm(confirmMessage)) {
      setSelectedProduct(value);
      if (totalCoin <= 0) {
        alert("코인이 없습니다ㅠㅠ");
        return;
      }
      setOpened(true);
    }
  };

  const handleClosePrizeDrawModal = () => {
    setOpened(false);
  };

  const handleCoin = async (value?: number) => {
    const { data } = (await supabase
      .from("request-prize")
      .select("request_num")
      .eq("follower", threadId)
      .eq("phase", 3)) as {
      data: { request_num: number }[] | null;
    };

    if (
      value !== 1 &&
      data &&
      data.filter((item) => item.request_num > 5).length > 0
    ) {
      alert("coin은 5개를 넘길 수 없습니다.");
      return;
    }
    if (totalCoin >= 5) {
      alert("coin은 5개를 넘길 수 없습니다.");
      return;
    }

    const newCoin = value ? value : totalCoin + 1;
    setCoin(newCoin);
    setBalance(newCoin);
  };

  useEffect(() => {
    console.log("step changed to:", step);
  }, [step]);

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
            >
              <span className="block sm:inline">Jin의 뽑기 World에</span>{" "}
              <span className="block sm:inline">오신걸 환영합니다!</span>
            </h1>
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
          onClose={handleClosePrizeDrawModal}
        />
      )}
    </div>
  );
}
