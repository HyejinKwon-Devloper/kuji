// app/api/draw/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type DrawRequest = {
  threadId: string; // 쿠키 threadId 또는 사용자 식별자
  prizeId: string; // 응모 상품 id (uuid/string 가정)
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as DrawRequest;
    const { threadId, prizeId } = body;

    if (!threadId || !prizeId) {
      return NextResponse.json(
        { ok: false, message: "threadId/prizeId가 필요합니다." },
        { status: 400 }
      );
    }

    // 1) 현재 티켓 조회
    const { data: ticketRow, error: tErr } = await supabase
      .from("request-prize") // 당신 테이블명
      .select("request_num")
      .eq("follower", threadId)
      .maybeSingle<{ request_num: number }>();

    if (tErr) {
      return NextResponse.json(
        { ok: false, message: tErr.message },
        { status: 500 }
      );
    }

    const currentTickets = ticketRow?.request_num ?? 0;
    if (currentTickets <= 0) {
      return NextResponse.json(
        { ok: false, message: "응모권이 없습니다.", remainingTickets: 0 },
        { status: 200 }
      );
    }

    // 2) 1/50 확률 판정 (서버에서만)
    const win = Math.floor(Math.random() * 30) === 0;

    // 3) 티켓 1 차감 (DB에 저장)
    //    ⚠️ 여기서 "조건부 업데이트"를 강하게 하고 싶으면:
    //    - 가장 좋은 방법은 DB 트랜잭션/락인데, RPC 없이 가려면 아래처럼 업데이트 후 재조회로 최소 보정
    const { error: uErr } = await supabase
      .from("request-prize")
      .update({ request_num: currentTickets - 1 })
      .eq("follower", threadId);

    if (uErr) {
      return NextResponse.json(
        { ok: false, message: uErr.message },
        { status: 500 }
      );
    }

    // 4) 로그 저장 (추천: 중복/검증에 유용)
    await supabase.from("prize_draw_log").insert({
      follower: threadId,
      prize_id: prizeId,
      win,
    });

    // 5) 결과 저장 (당첨이면 prize-own에 prize_id, 꽝이면 null)
    //    FK 때문에 0 넣지 말고 null
    await supabase.from("prize-own").insert({
      follower: threadId,
      prize_id: win ? prizeId : null,
    });

    // 6) 남은 티켓 재조회해서 반환
    const { data: afterRow } = await supabase
      .from("request-prize")
      .select("request_num")
      .eq("follower", threadId)
      .maybeSingle<{ request_num: number }>();

    const remainingTickets = afterRow?.request_num ?? currentTickets - 1;

    return NextResponse.json({
      ok: true,
      win,
      remainingTickets,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message ?? "unknown error" },
      { status: 500 }
    );
  }
}
