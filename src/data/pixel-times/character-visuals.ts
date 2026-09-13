/** Visual metadata sidecar. Do not edit characters.ts; join on characterId. */

export type BeardStyle =
  | "none"
  | "stubble"
  | "short"
  | "long-goatee"
  | "full"
  | "forked"
  | "guan-yu-long";

export type CharacterLodAssets = {
  master?: string;
  portrait?: string;
  mapSprite?: string;
  sceneActor?: string;
};

export type CharacterVisual = {
  characterId: string;
  canonicalDescription: string;
  ageRange: "youth" | "prime" | "elder";
  faceShape: "oval" | "square" | "round" | "gaunt";
  eyebrows: "straight" | "angled" | "thick" | "thin";
  eyes: "calm" | "fierce" | "narrow" | "wide";
  facialHair: BeardStyle;
  hair: "topknot" | "loose" | "braid" | "silk-cap";
  headgear: string;
  armor: "scale" | "lamellar" | "robe" | "cloak";
  primaryColor: string;
  secondaryColor: string;
  factionAccent: string;
  silhouetteNotes: string;
  referenceAssets: CharacterLodAssets;
};

export const CHARACTER_VISUALS: Record<string, CharacterVisual> = {
  "liu-bei": {
    characterId: "liu-bei",
    canonicalDescription:
      "Kind oval face, calm eyes, short neat beard, pale-gold skin, tall wrapped turban, 蜀 green scale with cream lining. Twin short swords at the hip.",
    ageRange: "prime",
    faceShape: "oval",
    eyebrows: "straight",
    eyes: "calm",
    facialHair: "short",
    hair: "topknot",
    headgear: "wrapped turban over topknot",
    armor: "scale",
    primaryColor: "#3D6B3A",
    secondaryColor: "#E8E0C8",
    factionAccent: "#4A8B4A",
    silhouetteNotes: "Tall soft turban, rounded shoulders, no spear.",
    referenceAssets: {
      master: "/assets/pixel-times/masters/liu-bei.png",
      portrait: "/assets/pixel-times/portraits/liu-bei.png",
      mapSprite: "/assets/pixel-times/map-sprites/liu-bei.png",
      sceneActor: "/assets/pixel-times/scene-actors/liu-bei-f0.png",
    },
  },
  "guan-yu": {
    characterId: "guan-yu",
    canonicalDescription:
      "Gaunt long face, red-brown skin, fierce phoenix eyes, very long black beard, dark helm, green-crimson lamellar. Green-dragon crescent blade taller than the body.",
    ageRange: "prime",
    faceShape: "gaunt",
    eyebrows: "angled",
    eyes: "fierce",
    facialHair: "guan-yu-long",
    hair: "topknot",
    headgear: "dark helm with green plume",
    armor: "lamellar",
    primaryColor: "#3D6B3A",
    secondaryColor: "#C23B22",
    factionAccent: "#4A8B4A",
    silhouetteNotes: "Vertical beard + oversized guandao; unmistakable at map scale.",
    referenceAssets: {
      master: "/assets/pixel-times/masters/guan-yu.png",
      portrait: "/assets/pixel-times/portraits/guan-yu.png",
      mapSprite: "/assets/pixel-times/map-sprites/guan-yu.png",
      sceneActor: "/assets/pixel-times/scene-actors/guan-yu-f0.png",
    },
  },
  "zhang-fei": {
    characterId: "zhang-fei",
    canonicalDescription:
      "Square jaw, thick brows, fierce wide eyes, full bristling beard, dark helm, heavy lamellar. Extra-long serpent spear.",
    ageRange: "prime",
    faceShape: "square",
    eyebrows: "thick",
    eyes: "fierce",
    facialHair: "full",
    hair: "loose",
    headgear: "dark iron helm",
    armor: "lamellar",
    primaryColor: "#3D6B3A",
    secondaryColor: "#6A4428",
    factionAccent: "#4A8B4A",
    silhouetteNotes: "Widest head of the three brothers; spear longer than Guan Yu's blade.",
    referenceAssets: {
      master: "/assets/pixel-times/masters/zhang-fei.png",
      portrait: "/assets/pixel-times/portraits/zhang-fei.png",
      mapSprite: "/assets/pixel-times/map-sprites/zhang-fei.png",
      sceneActor: "/assets/pixel-times/scene-actors/zhang-fei-f0.png",
    },
  },
  "cao-cao": {
    characterId: "cao-cao",
    canonicalDescription:
      "Gaunt clever face, thin brows, narrow eyes, short pointed beard, black jinxian cap, 魏 crimson scale with gold trim. Compact, slightly stooped authority.",
    ageRange: "prime",
    faceShape: "gaunt",
    eyebrows: "thin",
    eyes: "narrow",
    facialHair: "short",
    hair: "topknot",
    headgear: "black jinxian cap",
    armor: "scale",
    primaryColor: "#6B2A2A",
    secondaryColor: "#C9A227",
    factionAccent: "#8B1A1A",
    silhouetteNotes: "Low cap, no turban, no huge weapon; the smallest major lord silhouette.",
    referenceAssets: {
      master: "/assets/pixel-times/masters/cao-cao.png",
      portrait: "/assets/pixel-times/portraits/cao-cao.png",
      mapSprite: "/assets/pixel-times/map-sprites/cao-cao.png",
      sceneActor: "/assets/pixel-times/scene-actors/cao-cao-f0.png",
    },
  },
  "sun-quan": {
    characterId: "sun-quan",
    canonicalDescription:
      "Oval face, angled brows, calm eyes, short beard, royal cap with 吳 amber jewel, navy scale, purple-amber sash.",
    ageRange: "prime",
    faceShape: "oval",
    eyebrows: "angled",
    eyes: "calm",
    facialHair: "short",
    hair: "topknot",
    headgear: "royal cap with amber jewel",
    armor: "scale",
    primaryColor: "#2A4A6B",
    secondaryColor: "#C47820",
    factionAccent: "#C47820",
    silhouetteNotes: "Navy body, amber accent; younger than Cao Cao, no red face.",
    referenceAssets: {
      master: "/assets/pixel-times/masters/sun-quan.png",
      portrait: "/assets/pixel-times/portraits/sun-quan.png",
      mapSprite: "/assets/pixel-times/map-sprites/sun-quan.png",
      sceneActor: "/assets/pixel-times/scene-actors/sun-quan-f0.png",
    },
  },
  "zhuge-liang": {
    characterId: "zhuge-liang",
    canonicalDescription:
      "Gaunt scholarly face, thin brows, calm eyes, no beard, pale silk cap with trailing bands, cream-grey robe, crane-feather fan in the right hand.",
    ageRange: "prime",
    faceShape: "gaunt",
    eyebrows: "thin",
    eyes: "calm",
    facialHair: "none",
    hair: "silk-cap",
    headgear: "pale silk cap with two trailing bands",
    armor: "robe",
    primaryColor: "#C8C0A8",
    secondaryColor: "#3D6B3A",
    factionAccent: "#4A8B4A",
    silhouetteNotes: "No armor, fan, trailing cap ribbons — the only unarmed master.",
    referenceAssets: {
      master: "/assets/pixel-times/masters/zhuge-liang.png",
      portrait: "/assets/pixel-times/portraits/zhuge-liang.png",
      mapSprite: "/assets/pixel-times/map-sprites/zhuge-liang.png",
      sceneActor: "/assets/pixel-times/scene-actors/zhuge-liang-f0.png",
    },
  },
  "lu-bu": {
    characterId: "lu-bu",
    canonicalDescription:
      "Oval fierce face, no beard, tall plumed helm, magenta-desat lamellar, halberd. Tallest map silhouette.",
    ageRange: "youth",
    faceShape: "oval",
    eyebrows: "angled",
    eyes: "fierce",
    facialHair: "none",
    hair: "topknot",
    headgear: "tall plume helm",
    armor: "lamellar",
    primaryColor: "#8A2A4A",
    secondaryColor: "#C9A227",
    factionAccent: "#8A2A4A",
    silhouetteNotes: "Plume taller than any other helm; no beard.",
    referenceAssets: {},
  },
  "zhou-yu": {
    characterId: "zhou-yu",
    canonicalDescription:
      "Oval refined face, straight brows, calm eyes, no beard, jinxian cap, 吳 navy scale with gold piping. Younger and slimmer than Sun Quan.",
    ageRange: "youth",
    faceShape: "oval",
    eyebrows: "straight",
    eyes: "calm",
    facialHair: "none",
    hair: "topknot",
    headgear: "jinxian cap",
    armor: "scale",
    primaryColor: "#2A4A6B",
    secondaryColor: "#C9A227",
    factionAccent: "#C47820",
    silhouetteNotes: "Beardless Wu commander; slimmer than Sun Quan, no fan.",
    referenceAssets: {},
  },
  "sima-yi": {
    characterId: "sima-yi",
    canonicalDescription:
      "Gaunt older face, thin brows, narrow eyes, short greying beard, jinxian cap, dark 魏 robe over muted crimson. Watchful, not martial.",
    ageRange: "elder",
    faceShape: "gaunt",
    eyebrows: "thin",
    eyes: "narrow",
    facialHair: "short",
    hair: "topknot",
    headgear: "jinxian cap",
    armor: "robe",
    primaryColor: "#4A3038",
    secondaryColor: "#6B2A2A",
    factionAccent: "#8B1A1A",
    silhouetteNotes: "Robe, not armor; greyer and more stooped than Cao Cao.",
    referenceAssets: {},
  },
};

export function getCharacterVisual(characterId: string): CharacterVisual | undefined {
  return CHARACTER_VISUALS[characterId];
}
