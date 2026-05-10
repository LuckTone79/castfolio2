import { anchorClean } from "./anchor-clean";
import { prestigeBlack } from "./prestige-black";
import { luxeMarble } from "./luxe-marble";
import { freshSky } from "./fresh-sky";
import { softBlush } from "./soft-blush";
import { naturalGreen } from "./natural-green";
import { warmCoral } from "./warm-coral";
import { warmPink } from "./warm-pink";
import { skyBlue } from "./sky-blue";
import { ThemeConfig } from "@/types/theme";

export const ALL_THEMES: ThemeConfig[] = [
  anchorClean, prestigeBlack, luxeMarble, freshSky, softBlush, naturalGreen, warmCoral,
  warmPink, skyBlue,
];

export const getTheme = (id: string): ThemeConfig => {
  const t = ALL_THEMES.find(t => t.id === id);
  if (!t) throw new Error(`Unknown theme: ${id}`);
  return t;
};

export { anchorClean, prestigeBlack, luxeMarble, freshSky, softBlush, naturalGreen, warmCoral, warmPink, skyBlue };
