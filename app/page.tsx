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
    if (
      window.confirm(
        `${value.name}에 응모하시겠습니까?\n변경이 불가하오니 신중하게 골라주세요!`
      )
    ) {
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
        <>
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
          <div>작업중입니다.</div>
        </>
      )}
    </div>
  );
}
