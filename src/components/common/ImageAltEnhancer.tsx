"use client";

import { useEffect } from "react";

const TEXT_SELECTORS =
  "figcaption,h1,h2,h3,h4,h5,h6,p,div,span,[class*='title'],[class*='caption'],[class*='name']";

const GENERIC_CLASS_NAMES = new Set([
  "img",
  "image",
  "fluid",
  "responsive",
  "lazy",
  "loaded",
  "active",
  "card",
  "content",
  "fade",
  "grid",
  "icon",
  "item",
  "list",
  "up",
  "down",
  "left",
  "right",
  "section",
  "thumbnail",
  "thumb",
  "wrapper",
  "block",
]);

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 160);
}

function getNearbyText(image: HTMLImageElement): string | undefined {
  const figureCaption = image.closest("figure")?.querySelector("figcaption");
  if (figureCaption) {
    const caption = normalizeText(figureCaption.textContent ?? "");
    if (caption) return caption;
  }

  for (
    let container = image.parentElement, depth = 0;
    container && depth < 4;
    container = container.parentElement, depth++
  ) {
    const candidates = Array.from(
      container.querySelectorAll<HTMLElement>(TEXT_SELECTORS),
    ).filter((candidate) => {
      if (candidate.contains(image)) return false;
      return normalizeText(candidate.textContent ?? "").length > 0;
    });

    const preceding = candidates.filter(
      (candidate) =>
        candidate.compareDocumentPosition(image) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    );
    const nearestPreceding = preceding.at(-1);
    if (nearestPreceding) {
      return normalizeText(nearestPreceding.textContent ?? "");
    }

    const following = candidates[0];
    if (following) return normalizeText(following.textContent ?? "");
  }

  return undefined;
}

function getDescriptiveClass(image: HTMLImageElement): string | undefined {
  const words: string[] = [];

  for (
    let element: HTMLElement | null = image;
    element && element !== document.body && words.length < 6;
    element = element.parentElement
  ) {
    for (const className of element.classList) {
      const parts = className
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .split(/[^a-zA-Z0-9]+/)
        .filter(
          (part) =>
            part.length > 2 &&
            !GENERIC_CLASS_NAMES.has(part.toLowerCase()) &&
            !/^(?:col|row|container|d|w|h|p|m|mt|mb|pt|pb)-?\d*/i.test(part),
        );

      for (const part of parts) {
        const word = part.toLowerCase();
        if (!words.includes(word)) words.push(word);
        if (words.length >= 6) break;
      }
    }

    if (element === image.parentElement?.parentElement) break;
  }

  return words.length ? words.join(" ") : undefined;
}

function getFilename(image: HTMLImageElement): string | undefined {
  try {
    const filename = new URL(image.currentSrc || image.src, document.baseURI)
      .pathname.split("/")
      .pop()
      ?.replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ");
    const normalized = normalizeText(filename ?? "");
    return normalized || undefined;
  } catch {
    return undefined;
  }
}

function addAltText(image: HTMLImageElement): void {
  if (image.hasAttribute("alt")) return;

  if (
    image.getAttribute("aria-hidden") === "true" ||
    image.getAttribute("role") === "presentation"
  ) {
    image.alt = "";
    return;
  }

  image.alt =
    image.getAttribute("aria-label") ||
    image.getAttribute("title") ||
    getNearbyText(image) ||
    getDescriptiveClass(image) ||
    getFilename(image) ||
    "Image";
}

export default function ImageAltEnhancer() {
  useEffect(() => {
    document.querySelectorAll<HTMLImageElement>("img:not([alt])").forEach(addAltText);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node instanceof HTMLImageElement) addAltText(node);
          node
            .querySelectorAll<HTMLImageElement>("img:not([alt])")
            .forEach(addAltText);
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
