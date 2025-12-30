import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Phetsarath } from "next/font/google";

export async function POST(req: Request) {
  try {
    const { threadId, prizeId } = await req.json();

    if (!threadId || !prizeId) {
      return NextResponse.json(
        { ok: false, message: "파파파팡-!웃음을 드립니다!" },
        { status: 400 }
      );
    }

    /**
     * 특수 상품 처리 (꽝, 행운)
     */
    const isBomb = prizeId.startsWith("bomb-");
    const isLucky = prizeId.startsWith("lucky-");

    /**
     * 1️⃣ 특수 상품이 아닌 경우에만 판매중(sale_yn = 'Y')인 상품인지 확인
     */
    if (!isBomb && !isLucky) {
      const { data: prize, error: prizeErr } = await supabase
        .from("prize")
        .select("id, sale_yn")
        .eq("id", prizeId)
        .eq("sale_yn", "Y")
        .maybeSingle();

      if (prizeErr) {
        return NextResponse.json(
          { ok: false, message: prizeErr.message },
          { status: 500 }
        );
      }

      if (!prize) {
        return NextResponse.json({
          ok: false,
          message: "이미 추첨이 완료된 상품입니다.",
        });
      }
    }

    /**
     * 2️⃣ coin-own에서 현재 코인 조회
     */
    const { data: coinData, error: coinErr } = await supabase
      .from("coin-own")
      .select("coin")
      .eq("follower", threadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const currentCoin = coinData?.coin ?? 0;

    if (coinErr || !coinData || currentCoin <= 0) {
      return NextResponse.json({
        ok: false,
        message: "코인이 부족합니다.",
      });
    }

    /**
     * 3️⃣ 확률 계산
     * - 꽝: 무조건 실패 (win = false)
     * - 행운: 무조건 성공 (win = true)
     * - 일반 상품: 1/30 확률
     */
    let win: boolean;
    if (isBomb) {
      win = false; // 꽝은 무조건 실패
    } else if (isLucky) {
      win = true; // 행운은 무조건 성공
    } else {
      win = Math.floor(Math.random() * 30) === 0; // 일반 상품은 1/30 확률
    }

    /**
     * 4️⃣ 코인 차감 및 request-prize 응모 이력 기록
     */
    const remainingCoin = currentCoin - 1;

    // coin-own 업데이트
    const { error: updateErr } = await supabase
      .from("coin-own")
      .update({ coin: remainingCoin })
      .eq("follower", threadId);
    if (updateErr) {
      return NextResponse.json(
        { ok: false, message: `coin-own 업데이트 실패: ${updateErr.message}` },
        { status: 500 }
      );
    }

    // request-prize에 응모 이력 기록 (기존 레코드가 있으면 UPDATE, 없으면 INSERT)
    // 특수 상품(꽝, 행운)은 실제 prizeId가 아니므로 0으로 저장
    const recordPrizeId = isBomb ? 0 : isLucky ? 9999 : prizeId;

    const { data: existingRequest } = await supabase
      .from("request-prize")
      .select("request_num")
      .eq("follower", threadId)
      .eq("prize_id", recordPrizeId)
      .eq("phase", 3)
      .maybeSingle();

    if (existingRequest) {
      // 기존 응모 기록이 있으면 request_num 증가
      const { error: updateRequestErr } = await supabase
        .from("request-prize")
        .update({ request_num: existingRequest.request_num + 1 })
        .eq("follower", threadId)
        .eq("prize_id", recordPrizeId)
        .eq("phase", 3);

      if (updateRequestErr) {
        return NextResponse.json(
          {
            ok: false,
            message: `응모 횟수 업데이트 실패: ${updateRequestErr.message}`,
          },
          { status: 500 }
        );
      }
    } else {
      // 첫 응모라면 새로운 레코드 생성
      const { error: insertErr } = await supabase.from("request-prize").insert({
        follower: threadId,
        prize_id: recordPrizeId,
        request_num: 1,
        phase: 3,
      });

      if (insertErr) {
        return NextResponse.json(
          { ok: false, message: `응모 이력 기록 실패: ${insertErr.message}` },
          { status: 500 }
        );
      }
    }

    /**
     * 5️⃣ 결과 처리
     */
    if (win) {
      // 🔥 당첨 처리
      // 행운 상품은 실제 prizeId가 없으므로 0으로 저장
      const winPrizeId = isLucky ? "0" : prizeId;

      await supabase.from("prize-own").insert({
        follower: threadId,
        prize_id: winPrizeId,
      });

      // 🔥 일반 상품만 판매 종료 (행운 상품은 제외)
      if (!isLucky) {
        await supabase.from("prize").update({ sale_yn: "N" }).eq("id", prizeId);
      }
    } else {
      // 꽝 기록
      await supabase.from("prize-own").insert({
        follower: threadId,
        prize_id: 0,
      });
    }

    return NextResponse.json({
      ok: true,
      win,
      remainingTickets: remainingCoin,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: "서버 오류" },
      { status: 500 }
    );
  }
}
