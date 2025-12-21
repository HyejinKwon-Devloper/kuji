"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Tutorial } from "./components/Tutorial";
import { Ball } from "./components/Ball";
import { Fireworks } from "./components/Fireworks";
import { supabase } from "../lib/supabase";
import { appendMissItems } from "@/lib/util";

interface PrizeRow {
  id?: number;
  rank?: string;
  name?: string;
  sale_yn?: string;
  // Add other fields as needed
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [backgroundOpacity, setBackgroundOpacity] = useState(1);
  const [isGumballVisible, setIsGumballVisible] = useState(false);
  const [titlePosition, setTitlePosition] = useState({
    top: "50%",
    transform: "translate(-50%, -50%)",
  });
  const [showBall, setShowBall] = useState(false);
  const [ballColor, setBallColor] = useState("red");
  const [ballLetter, setBallLetter] = useState("A");
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoOpacity, setVideoOpacity] = useState(0);
  const [letters, setLetters] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const isFirstWindow = window.localStorage.getItem("isFirstWindow");
    if (isFirstWindow === "true") {
      alert(
        "이미 뽑기를 진행하셨습니다! \n 만약 뽑기를 뽑지 못하셨다면, nav.jin에게 문의주세요!"
      );
      return;
    }
    const fetchPrizes = async () => {
      const { data } = (await supabase
        .from("prize")
        .select("id , rank, name, sale_yn")
        .eq("sale_yn", "Y")) as {
        data: PrizeRow[] | null;
      };
      const refined: PrizeRow[] = (data as PrizeRow[]).map((row) => ({
        id: row.id,
        rank: row.rank ?? "",
        name: row.name ?? "",
        sale_yn: row.sale_yn ?? "Y",
      }));

      // Assuming each row has a 'prize' field or 'name' field
      setLetters([
        ...appendMissItems(
          refined?.map((row) => {
            return row.rank + " " + row.name;
          }) ?? [],
          "다음기회에",
          50
        ),
      ]);
    };
    fetchPrizes();

    // Start title animation
    setTimeout(() => {
      setTitlePosition({ top: "1rem", transform: "translateX(-50%)" });
    }, 700); // Start animation after 0.5s

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Fade out the background
      setBackgroundOpacity(0.3);
      // After fade, hide background
    }, 2000); // 2 seconds loading

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isGumballVisible && videoRef.current) {
      videoRef.current.play();
      setTimeout(() => setVideoOpacity(1), 100); // slight delay for fade in
      const video = videoRef.current;
      const handleLoadedMetadata = () => setVideoDuration(video.duration);
      const handleTimeUpdate = () => {
        if (video.currentTime > videoDuration - 1 && !showBall) {
          const colors = [
            "blue",
            "red",
            "white",
            "yellow",
            "skyblue",
            "green",
            "pink",
            "orange",
          ];
          setBallColor(colors[Math.floor(Math.random() * colors.length)]);
          console.log(letters);
          setBallLetter(letters[Math.floor(Math.random() * letters.length)]);
          setShowBall(true);
        }
      };
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("timeupdate", handleTimeUpdate);
      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [isGumballVisible, videoDuration, showBall]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {isLoading && (
        <h1
          className="bg-transparent fixed left-1/2 text-lg sm:text-2xl font-bold text-black dark:text-white z-50 text-center transition-all duration-1000 ease-out"
          style={{ top: titlePosition.top, transform: titlePosition.transform }}
        >
          <span className="block sm:inline">Jin의 뽑기 World에</span>{" "}
          <span className="block sm:inline">오신걸 환영합니다!</span>
        </h1>
      )}
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start"></main>
      {!isLoading && (
        <Tutorial handleGumble={() => setIsGumballVisible(true)} />
      )}

      <div
        className="fixed inset-0 z-40 transition-opacity duration-1000"
        style={{ opacity: backgroundOpacity }}
      >
        <Image
          src="/hashira.webp"
          alt="Loading background"
          fill
          className="object-cover"
        />
      </div>
      {/* {isGumballVisible && <GumballMachine />} */}
      {isGumballVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <video
            ref={videoRef}
            preload="auto"
            style={{
              opacity: videoOpacity,
              width: "300px",
              height: "451px",
              objectFit: "cover",
              transition: "opacity 1s ease-in-out",
            }}
          >
            <source src="/gumble.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      {showBall && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Ball
            showBall={showBall}
            ballColor={ballColor}
            ballLetter={ballLetter}
          />
          <Fireworks />
        </div>
      )}
    </div>
  );
}
