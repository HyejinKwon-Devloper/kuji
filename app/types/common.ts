type Prize = {
  id: string;
  name: string;
  image?: string;
};

type TicketRow = {
  follower: string;
  prize_id: string | null;
  request_num: number;
  prize: (Prize & { sale_yn?: string | boolean }) | null;
};

export type { Prize, TicketRow };
