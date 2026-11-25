import { BASE_URL } from "@/config/config";

// lib/extractFirstImage.ts
type Sections = Record<string, string> | undefined | null;

// "g" flag so matchAll finds every <img> in a section, not just the first
const IMG_SRC_REGEX = /<img[^>]+src=["']([^"']+)["']/gi;

function normalizeSrc(raw: string, baseUrl: string): string | null {
  let src = raw.trim();
  if (!src || src.startsWith("data:")) return null; // skip base64 / empty

  // OG tags need absolute URLs
  if (src.startsWith("//")) src = `https:${src}`;
  else if (src.startsWith("/")) src = `${baseUrl}${src}`;

  return src;
}

/**
 * Returns the Nth image (1-based) found across all sections, in order.
 * getFirstImageFromSections(sections)     -> 1st image
 * getFirstImageFromSections(sections, 2)  -> 2nd image
 * Returns null if there are fewer than N images.
 */
export function getFirstImageFromSections(
  sections: Sections,
  position: number = 1,
  baseUrl: string = BASE_URL || ""
): string | null {
  if (!sections || position < 1) return null;

  let count = 0;

  for (const html of Object.values(sections)) {
    if (typeof html !== "string") continue;

    for (const match of html.matchAll(IMG_SRC_REGEX)) {
      const src = normalizeSrc(match[1], baseUrl);
      if (!src) continue;

      count++;
      if (count === position) return src;
    }
  }

  return null;
}