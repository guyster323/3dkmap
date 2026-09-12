import type { FactionId, RegionId } from "@/lib/types";

export const TREE_IDS = ["book", "region", "event", "people"] as const;
export type TreeId = (typeof TREE_IDS)[number];

export const TREE_LABEL: Record<TreeId, string> = {
  book: "전략 삼국지 책",
  region: "주요 지역",
  event: "주요 사건",
  people: "주요 인물",
};

/** Display grouping for the region tree. Does not invent borders. */
export const REGION_TREE_ORDER: { id: RegionId; label: string }[] = [
  { id: "zhongyuan", label: "중원" },
  { id: "hebei", label: "하북" },
  { id: "xiliang", label: "서량" },
  { id: "shu", label: "익주" },
  { id: "jiangdong", label: "강동" },
  { id: "naman", label: "남만" },
  { id: "korea", label: "한반도" },
  { id: "other", label: "그 밖" },
];

export const FACTION_TREE_ORDER: { id: FactionId; label: string }[] = [
  { id: "liu", label: "유비 · 촉" },
  { id: "cao", label: "조조 · 위" },
  { id: "sun", label: "손 · 오" },
  { id: "han", label: "한실" },
  { id: "dong", label: "동탁" },
  { id: "lu-bu", label: "여포" },
  { id: "yuan-shao", label: "원소" },
  { id: "yuan-shu", label: "원술" },
  { id: "yellow", label: "황건" },
  { id: "gongsun", label: "공손" },
  { id: "goguryeo", label: "고구려" },
  { id: "mahan", label: "마한" },
  { id: "jinhan", label: "진한" },
  { id: "byeonhan", label: "변한" },
  { id: "lelange", label: "낙랑" },
  { id: "tao", label: "도겸" },
  { id: "other", label: "그 밖" },
];
