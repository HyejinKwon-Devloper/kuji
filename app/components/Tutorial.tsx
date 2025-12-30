"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useState, useEffect } from "react";

interface TutorialProps {
  handleGumble: () => void;
}
export const Tutorial = ({ handleGumble }: TutorialProps) => {
  const [showTutorial, setShowTutorial] = useState(() => {
    const isFirst = window.localStorage.getItem("isFirstWindow");
    return isFirst === null ? true : isFirst === "false" ? true : false;
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [fadeOut, setFadeOut] = useState(false);
  const [threadId, setThreadId] = useState("");

  const messages = [
    "그동안 재밌으셨나요?",
    "별것 아닌 이벤트지만",
    "모두 재미있게 즐겨주셔서 감사해요:)",
    "2025년 모두 수고하셨구",
    "2026년도 건강하고 즐거운일 가득하시길",
    "그 누구보다도 바라겠습니다❤️",
    "그동안 정말 감사했고",
    "앞으로도 잘부탁드려요!",
    "후기는 댓글에 남겨주세요💙",
  ];

  const images = [
    "/Giyu.webp",
    "/Kyojuro.webp",
    "/Mitsuri.webp",
    "/Obanai.webp",
    "/Gyomei.webp",
    "/Tengen.webp",
    "/Sanemi.webp",
    "/Shinobu.webp",
    "/Muichiro.webp",
  ];

  useEffect(() => {
    if (showTutorial && currentStep < messages.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showTutorial, currentStep]);

  // const handleGumbleComponent = () => {
  //   setFadeOut(true);
  //   setTimeout(() => {
  //     setShowTutorial(false);
  //     if (handleGumble) {
  //       handleGumble();
  //       window.localStorage.setItem("isFirstWindow", "true");
  //     }
  //   }, 1000); // fade out duration
  // };

  // const handleSubmitThreadId = async () => {
  //   if (threadId.trim() === "" || threadId === null) {
  //     alert("스레드아이디를 입력해주세요!");
  //     return;
  //   }

  //   const getFollowerData = async () => {
  //     const { data } = (await supabase.from("follower").select("follower")) as {
  //       data: { follower: string }[] | null;
  //     };
  //     console.log(data?.filter((item) => item.follower === threadId));
  //     if (
  //       (data?.filter((item) => item.follower === threadId).length ?? 0) === 0
  //     ) {
  //       alert(
  //         "nav.jin과 팔로워 관계를 확인해주세요! \n 문의는 nav.jin에게 부탁드려요!"
  //       );
  //       return false;
  //     } else return true;
  //   };

  //   const isFollower = await getFollowerData().then((res) =>
  //     res === false ? false : true
  //   );

  //   if (isFollower === false) {
  //     return;
  //   }
  //   document.cookie = `threadId=${threadId}; path=/; max-age=31536000`;
  //   setCurrentStep(9);
  // };
  return (
    <div className="pd-4">
      {showTutorial && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="relative flex flex-col items-center">
            {currentStep <= 9 && (
              <div className="flex flex-col items-center animate-fade-in">
                <div className="bg-white text-black px-4 py-2 rounded-lg shadow-lg mb-4 after:content-[''] after:absolute after:bottom-[-8px] after:left-1/2 after:transform after:-translate-x-1/2 after:border-l-8 after:border-r-8 after:border-t-8 after:border-l-transparent after:border-r-transparent after:border-t-white relative">
                  {messages[currentStep - 1]}
                </div>
                <Image
                  src={images[currentStep - 1]}
                  alt="Character"
                  width={300}
                  height={425}
                  className="rounded-lg mt-2"
                />
              </div>
            )}
            {/* {currentStep === 8 && (
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
                />
              </div>
            )} */}
            {/* {currentStep > images.length && (
              <Image
                src="/kuji.png"
                alt="뽑기 기계"
                width={300}
                height={451}
                className={`cursor-pointer animate-fade-in transition-opacity duration-1000 ${
                  fadeOut ? "opacity-0" : "opacity-100"
                }`}
                onClick={() => handleGumbleComponent()}
              />
            )}
            {currentStep > images.length && (
              <div
                className={`absolute top-[-60px] left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-2 rounded-lg shadow-lg after:content-[''] after:absolute after:top-full after:left-1/2 after:transform after:-translate-x-1/2 after:border-l-8 after:border-r-8 after:border-t-8 after:border-l-transparent after:border-r-transparent after:border-t-white animate-fade-in transition-opacity duration-1000 ${
                  fadeOut ? "opacity-0" : "opacity-100"
                }`}
              >
                {threadId}님! 이제, <br /> 뽑기 기계를 클릭해주세요!
              </div>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
};
