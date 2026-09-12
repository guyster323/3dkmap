/** Per-character kao compositor parameters. Do not edit characters.ts; join on id. */

export const KAO_FACE = ["oval", "square", "round", "gaunt"] as const;
export const KAO_SKIN = ["#e8c9a0", "#d4a878", "#c23b22"] as const;
export const KAO_BROW = ["straight", "angled", "thick", "thin"] as const;
export const KAO_EYE = ["calm", "fierce", "narrow", "wide"] as const;
export const KAO_BEARD = ["none", "short", "long", "full", "forked"] as const;
export const KAO_HAIR = ["topknot", "loose", "braid"] as const;
export const KAO_HEADGEAR = ["crown", "jinxian", "helm", "plume", "tiger", "turban", "wings", "cloth"] as const;
export const KAO_ARMOR = ["scale", "lamellar", "robe", "cloak"] as const;

export type KaoParams = {
  face: (typeof KAO_FACE)[number];
  skin: (typeof KAO_SKIN)[number];
  brow: (typeof KAO_BROW)[number];
  eye: (typeof KAO_EYE)[number];
  beard: (typeof KAO_BEARD)[number];
  hair: (typeof KAO_HAIR)[number];
  headgear: (typeof KAO_HEADGEAR)[number];
  armor: (typeof KAO_ARMOR)[number];
};

export const KAO_PARAMS: Record<string, KaoParams> = {
  "liu-bei": { face: "oval", skin: "#e8c9a0", brow: "straight", eye: "calm", beard: "short", hair: "topknot", headgear: "turban", armor: "scale" },
  "guan-yu": { face: "gaunt", skin: "#c23b22", brow: "angled", eye: "fierce", beard: "long", hair: "topknot", headgear: "helm", armor: "lamellar" },
  "zhang-fei": { face: "square", skin: "#d4a878", brow: "thick", eye: "fierce", beard: "full", hair: "loose", headgear: "helm", armor: "lamellar" },
  "cao-cao": { face: "gaunt", skin: "#e8c9a0", brow: "thin", eye: "narrow", beard: "short", hair: "topknot", headgear: "jinxian", armor: "scale" },
  "dong-zhuo": { face: "round", skin: "#d4a878", brow: "thick", eye: "narrow", beard: "full", hair: "topknot", headgear: "cloth", armor: "cloak" },
  "lu-bu": { face: "oval", skin: "#e8c9a0", brow: "angled", eye: "fierce", beard: "none", hair: "topknot", headgear: "plume", armor: "lamellar" },
  "sun-jian": { face: "square", skin: "#d4a878", brow: "thick", eye: "fierce", beard: "short", hair: "topknot", headgear: "tiger", armor: "scale" },
  "sun-ce": { face: "oval", skin: "#e8c9a0", brow: "angled", eye: "wide", beard: "none", hair: "loose", headgear: "helm", armor: "scale" },
  "yuan-shao": { face: "oval", skin: "#e8c9a0", brow: "straight", eye: "calm", beard: "forked", hair: "topknot", headgear: "crown", armor: "cloak" },
  "yuan-shu": { face: "round", skin: "#e8c9a0", brow: "angled", eye: "narrow", beard: "short", hair: "topknot", headgear: "jinxian", armor: "scale" },
  "he-jin": { face: "square", skin: "#d4a878", brow: "thick", eye: "wide", beard: "short", hair: "topknot", headgear: "helm", armor: "scale" },
  "emperor-ling": { face: "round", skin: "#e8c9a0", brow: "thin", eye: "wide", beard: "none", hair: "topknot", headgear: "crown", armor: "robe" },
  "emperor-shao": { face: "round", skin: "#e8c9a0", brow: "thin", eye: "wide", beard: "none", hair: "loose", headgear: "crown", armor: "robe" },
  "emperor-xian": { face: "oval", skin: "#e8c9a0", brow: "thin", eye: "calm", beard: "none", hair: "loose", headgear: "crown", armor: "robe" },
  "zhang-jiao": { face: "gaunt", skin: "#d4a878", brow: "thick", eye: "wide", beard: "forked", hair: "loose", headgear: "turban", armor: "robe" },
  "liu-yan": { face: "oval", skin: "#e8c9a0", brow: "straight", eye: "calm", beard: "short", hair: "topknot", headgear: "jinxian", armor: "robe" },
  "liu-biao": { face: "square", skin: "#e8c9a0", brow: "straight", eye: "calm", beard: "long", hair: "topknot", headgear: "jinxian", armor: "robe" },
  "tao-qian": { face: "round", skin: "#d4a878", brow: "thin", eye: "calm", beard: "full", hair: "topknot", headgear: "cloth", armor: "robe" },
  "wang-yun": { face: "gaunt", skin: "#e8c9a0", brow: "straight", eye: "calm", beard: "short", hair: "topknot", headgear: "jinxian", armor: "robe" },
  "diaochan": { face: "oval", skin: "#e8c9a0", brow: "thin", eye: "wide", beard: "none", hair: "loose", headgear: "cloth", armor: "robe" },
  "gongsun-zan": { face: "oval", skin: "#e8c9a0", brow: "angled", eye: "fierce", beard: "short", hair: "topknot", headgear: "helm", armor: "scale" },
  "chen-gong": { face: "gaunt", skin: "#e8c9a0", brow: "straight", eye: "narrow", beard: "none", hair: "topknot", headgear: "jinxian", armor: "robe" },
  "hua-xiong": { face: "square", skin: "#d4a878", brow: "thick", eye: "fierce", beard: "short", hair: "topknot", headgear: "helm", armor: "lamellar" },
  "gogukcheon": { face: "oval", skin: "#d4a878", brow: "straight", eye: "calm", beard: "none", hair: "topknot", headgear: "wings", armor: "scale" },
  "eulpaso": { face: "gaunt", skin: "#d4a878", brow: "thin", eye: "calm", beard: "short", hair: "topknot", headgear: "cloth", armor: "robe" },
  "onjo-line": { face: "oval", skin: "#d4a878", brow: "straight", eye: "calm", beard: "none", hair: "topknot", headgear: "wings", armor: "scale" },
  "sun-quan": { face: "oval", skin: "#e8c9a0", brow: "angled", eye: "calm", beard: "short", hair: "topknot", headgear: "crown", armor: "scale" },
  "zhou-yu": { face: "oval", skin: "#e8c9a0", brow: "straight", eye: "calm", beard: "none", hair: "topknot", headgear: "jinxian", armor: "scale" },
  "zhang-zhao": { face: "square", skin: "#d4a878", brow: "thin", eye: "calm", beard: "full", hair: "topknot", headgear: "jinxian", armor: "robe" },
  "lu-su": { face: "round", skin: "#e8c9a0", brow: "straight", eye: "calm", beard: "short", hair: "topknot", headgear: "cloth", armor: "robe" },
  "zhuge-liang": { face: "gaunt", skin: "#e8c9a0", brow: "thin", eye: "calm", beard: "none", hair: "topknot", headgear: "cloth", armor: "robe" },
  "zhao-yun": { face: "oval", skin: "#e8c9a0", brow: "straight", eye: "calm", beard: "none", hair: "topknot", headgear: "helm", armor: "scale" },
  "pang-tong": { face: "square", skin: "#d4a878", brow: "thick", eye: "narrow", beard: "short", hair: "loose", headgear: "cloth", armor: "robe" },
  "xu-shu": { face: "oval", skin: "#e8c9a0", brow: "straight", eye: "calm", beard: "none", hair: "topknot", headgear: "jinxian", armor: "robe" },
  "xun-yu": { face: "gaunt", skin: "#e8c9a0", brow: "thin", eye: "calm", beard: "none", hair: "topknot", headgear: "jinxian", armor: "robe" },
  "yan-liang": { face: "square", skin: "#d4a878", brow: "thick", eye: "fierce", beard: "short", hair: "topknot", headgear: "helm", armor: "lamellar" },
  "cao-ren": { face: "square", skin: "#e8c9a0", brow: "straight", eye: "fierce", beard: "short", hair: "topknot", headgear: "helm", armor: "scale" },
  "ma-chao": { face: "oval", skin: "#e8c9a0", brow: "angled", eye: "fierce", beard: "none", hair: "loose", headgear: "helm", armor: "lamellar" },
  "han-sui": { face: "gaunt", skin: "#d4a878", brow: "thick", eye: "narrow", beard: "full", hair: "topknot", headgear: "helm", armor: "cloak" },
  "zhang-lu": { face: "round", skin: "#d4a878", brow: "straight", eye: "calm", beard: "forked", hair: "loose", headgear: "turban", armor: "robe" },
  "liu-zhang": { face: "round", skin: "#e8c9a0", brow: "thin", eye: "wide", beard: "short", hair: "topknot", headgear: "jinxian", armor: "robe" },
  "zhang-liao": { face: "oval", skin: "#e8c9a0", brow: "angled", eye: "fierce", beard: "short", hair: "topknot", headgear: "helm", armor: "lamellar" },
  "gan-ning": { face: "square", skin: "#d4a878", brow: "thick", eye: "fierce", beard: "none", hair: "loose", headgear: "cloth", armor: "scale" },
  "lu-meng": { face: "square", skin: "#d4a878", brow: "thick", eye: "narrow", beard: "short", hair: "topknot", headgear: "helm", armor: "scale" },
  "lu-xun": { face: "oval", skin: "#e8c9a0", brow: "thin", eye: "calm", beard: "none", hair: "topknot", headgear: "jinxian", armor: "robe" },
  "huang-zhong": { face: "gaunt", skin: "#d4a878", brow: "thick", eye: "fierce", beard: "full", hair: "topknot", headgear: "helm", armor: "lamellar" },
  "wei-yan": { face: "square", skin: "#d4a878", brow: "angled", eye: "fierce", beard: "short", hair: "topknot", headgear: "helm", armor: "lamellar" },
  "fa-zheng": { face: "gaunt", skin: "#e8c9a0", brow: "thin", eye: "narrow", beard: "none", hair: "topknot", headgear: "jinxian", armor: "robe" },
  "sima-yi": { face: "gaunt", skin: "#e8c9a0", brow: "thin", eye: "narrow", beard: "short", hair: "topknot", headgear: "jinxian", armor: "robe" },
  "jiang-wei": { face: "oval", skin: "#e8c9a0", brow: "angled", eye: "fierce", beard: "none", hair: "topknot", headgear: "helm", armor: "scale" },
  "ma-su": { face: "oval", skin: "#e8c9a0", brow: "straight", eye: "wide", beard: "none", hair: "topknot", headgear: "jinxian", armor: "robe" },
  "meng-huo": { face: "square", skin: "#d4a878", brow: "thick", eye: "fierce", beard: "none", hair: "braid", headgear: "cloth", armor: "cloak" },
  "cao-pi": { face: "oval", skin: "#e8c9a0", brow: "thin", eye: "calm", beard: "none", hair: "topknot", headgear: "crown", armor: "robe" },
  "liu-shan": { face: "round", skin: "#e8c9a0", brow: "thin", eye: "wide", beard: "none", hair: "loose", headgear: "crown", armor: "robe" },
  "zhang-he": { face: "oval", skin: "#e8c9a0", brow: "straight", eye: "fierce", beard: "short", hair: "topknot", headgear: "helm", armor: "scale" },
  "xiahou-yuan": { face: "square", skin: "#d4a878", brow: "thick", eye: "fierce", beard: "short", hair: "topknot", headgear: "helm", armor: "scale" },
  "lady-sun": { face: "oval", skin: "#e8c9a0", brow: "angled", eye: "fierce", beard: "none", hair: "loose", headgear: "cloth", armor: "scale" },
  "hao-zhao": { face: "square", skin: "#d4a878", brow: "straight", eye: "calm", beard: "short", hair: "topknot", headgear: "helm", armor: "lamellar" },
  "deng-ai": { face: "gaunt", skin: "#d4a878", brow: "thin", eye: "narrow", beard: "short", hair: "topknot", headgear: "helm", armor: "scale" },
  "yan-yan": { face: "square", skin: "#d4a878", brow: "thick", eye: "fierce", beard: "full", hair: "topknot", headgear: "helm", armor: "lamellar" },
  "huang-gai": { face: "gaunt", skin: "#d4a878", brow: "thick", eye: "fierce", beard: "full", hair: "topknot", headgear: "helm", armor: "scale" },
  "taishi-ci": { face: "oval", skin: "#e8c9a0", brow: "angled", eye: "fierce", beard: "none", hair: "topknot", headgear: "helm", armor: "lamellar" },
  "liu-yao": { face: "oval", skin: "#e8c9a0", brow: "straight", eye: "calm", beard: "short", hair: "topknot", headgear: "jinxian", armor: "robe" },
  "sansang": { face: "oval", skin: "#d4a878", brow: "straight", eye: "calm", beard: "none", hair: "topknot", headgear: "wings", armor: "scale" },
  "dongcheon": { face: "square", skin: "#d4a878", brow: "angled", eye: "fierce", beard: "none", hair: "topknot", headgear: "wings", armor: "lamellar" },
  "gongsun-kang": { face: "square", skin: "#e8c9a0", brow: "thick", eye: "fierce", beard: "short", hair: "topknot", headgear: "helm", armor: "scale" },
  "guan-qiu-jian": { face: "gaunt", skin: "#e8c9a0", brow: "angled", eye: "fierce", beard: "short", hair: "topknot", headgear: "helm", armor: "scale" },
};
