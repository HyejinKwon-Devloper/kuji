import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
     * 1️⃣ 아직 판매중(sale_yn = 'Y')인 상품인지 확인
     */
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

    /**
     * 2️⃣ 응모권 조회
     */
    const { data: ticketRow, error: ticketErr } = await supabase
      .from("request-prize")
      .select("request_num")
      .eq("follower", threadId)
      .maybeSingle();

    if (ticketErr || !ticketRow || ticketRow.request_num <= 0) {
      return NextResponse.json({
        ok: false,
        message: "응모권이 부족합니다.",
      });
    }

    /**
     * 3️⃣ 확률 계산 (1 / 50)
     */
    const win = Math.floor(Math.random() * 30) === 0;

    /**
     * 4️⃣ 응모권 차감
     */
    const remainingTickets = ticketRow.request_num - 1;

    await supabase
      .from("request-prize")
      .update({ request_num: remainingTickets })
      .eq("follower", threadId);

    /**
     * 5️⃣ 결과 처리
     */
    if (win) {
      // 🔥 당첨 처리
      await supabase.from("prize-own").insert({
        follower: threadId,
        prize_id: prizeId,
      });

      // 🔥 해당 상품 판매 종료
      await supabase.from("prize").update({ sale_yn: "N" }).eq("id", prizeId);
    } else {
      // 꽝 기록 (선택)
      await supabase.from("prize-own").insert({
        follower: threadId,
        prize_id: null,
      });
    }

    return NextResponse.json({
      ok: true,
      win,
      remainingTickets,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: "서버 오류" },
      { status: 500 }
    );
  }
}
