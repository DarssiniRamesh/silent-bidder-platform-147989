export type UUID = string;

export type DBEvent = {
  id: UUID;
  name: string;
  host_email: string;
  created_at: string;
};

export type DBItem = {
  id: UUID;
  event_id: UUID;
  name: string;
  description: string | null;
  image_url: string | null;
  starting_bid: number;
  created_at: string;
};

export type DBBid = {
  id: UUID;
  item_id: UUID;
  amount: number;
  anonymous_id: UUID;
  created_at: string;
};
