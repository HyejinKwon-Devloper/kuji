"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

import { CoinIntro } from "./components/CoinIntro";
import { Game } from "./components/Game";
import { RpsResult } from "./util/game.util";
import { VictoryToProductsScreen } from "./components/VictoryToProductsScreen";
import { LoseProductScreen } from "./components/LoseProductScreen";
import { supabase } from "@/lib/supabase";
import { getCookie } from "@/lib/util";
import { PrizeDraw } from "./components/PrizeDraw";

interface ISelectedProducts {
  follower: string;
  product_id: string;
  name: string;
  request_num: number;
}
export default function Home() {
  const [titlePosition, setTitlePosition] = useState<{
    top: string;
    transform: string;
  }>({
    top: "50%",
    transform: "translate(-50%, -50%)",
  });
  const [backgroundOpacity, setBackgroundOpacity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<number>(1);

  const [totalCoin, setCoin] = useState<number>(2);
  const [result, setResult] = useState<RpsResult | null>(null);

  const [threadId, setThreadId] = useState("");

  const handleSubmitThreadId = async () => {
    if (threadId.trim() === "" || threadId === null) {
      alert("스레드아이디를 입력해주세요!");
      return;
    }

    const getFollowerData = async () => {
      const { data } = (await supabase
        .from("prize-own")
        .select("follower")
        .eq("prize_id", 0)) as {
        data: { follower: string }[] | null;
      };
      console.log(data?.filter((item) => item.follower === threadId));
      if (
        (data?.filter((item) => item.follower === threadId).length ?? 0) === 0
      ) {
        alert(
          "nav.jin과 팔로워 관계를 확인해주세요! \n 혹은 폭탄여부를 확인해주세요! \n 문의는 nav.jin에게 부탁드려요!"
        );
        return false;
      } else return true;
    };

    const isFollower = await getFollowerData().then((res) =>
      res === false ? false : true
    );

    if (isFollower === false) {
      return;
    }
    document.cookie = `threadId=${threadId}; path=/; max-age=31536000`;

    // follwer라면 다음 스텝
    setStep((prev) => prev + 1);
  };

  useEffect(() => {
    // Start title animation
    setTimeout(() => {
      setTitlePosition({ top: "1rem", transform: "translateX(-50%)" });
    }, 700); // Start animation after 0.5s

    // Simulate loading time
    const timer = setTimeout(() => {
      // Fade out the background
      setBackgroundOpacity(0.3);
      setIsLoading(false);
      const threadId = getCookie("threadId");
      if (threadId) {
        const getFollowerData = async () => {
          const { data } = (await supabase
            .from("request-prize")
            .select("follower")
            .eq("follower", threadId)) as {
            data: { follower: string }[] | null;
          };

          console.log(
            data?.filter((item) => item.follower === threadId).length
          );
          if (
            (data?.filter((item) => item.follower === threadId).length ?? 0) ===
            0
          ) {
            setStep(3);
            return;
          } else {
            setResult("win");
            setStep(6);
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
  }, []);

  const handleSelectProduct = async (value: ISelectedProducts) => {
    const threadId = getCookie("threadId");
    if (window.confirm(`${value.name}에 응모하시겠습니까?`)) {
      const response = (await supabase
        .from("request-prize")
        .select("follower")
        .eq("follower", threadId)) as {
        data: { follower: string }[] | null;
      };

      if (response.data?.length || 0 > 0) {
        alert("이미 응모되었습니다.⭐");
        setStep((prev) => prev + 1);
        return;
      }

      const { data } = (await supabase.from("request-prize").insert({
        follower: threadId,
        prize_id: value.product_id,
        request_num: value.request_num,
      })) as {
        data: { follower: string }[] | null;
      };

      setStep((prev) => prev + 1);
    }
  };

  const handleCoin = async (value?: number) => {
    const { data } = (await supabase
      .from("request-prize")
      .select("request_num")
      .eq("follower", threadId)) as {
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

    setCoin(value ? value : totalCoin + 1);
  };
  useEffect(() => {
    console.log("step changed to:", step);
  }, [step]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {isLoading && (
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
          handleStep={setStep}
          step={step}
          handleResult={(value) => setResult(value)}
        />
      )}
      {step === 4 && (
        <Game
          handleStep={(value) => setStep(value ? value : step + 1)}
          step={step}
          coin={totalCoin}
          handleResult={(value) => setResult(value)}
          handleCoin={(value) => handleCoin(value ? value : totalCoin + 1)}
        />
      )}
      {step >= 5 && step < 6 && result === "win" && (
        <VictoryToProductsScreen
          follower={threadId}
          request_num={totalCoin}
          onSelectProduct={(values) => handleSelectProduct(values)}
        />
      )}
      {step >= 5 && step < 6 && result === "lose" && (
        <LoseProductScreen
          follower={threadId}
          request_num={totalCoin}
          onSelectProduct={(values) => handleSelectProduct(values)}
        />
      )}
      {step >= 6 && <PrizeDraw />}
    </div>
  );
}
