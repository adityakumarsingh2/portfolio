import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an ISO date string to a human-readable date */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Smoothly scrolls the window to the nearest upper heading element (h1, h2, h3, h4)
 * currently at or above the viewport scroll position.
 */
export function scrollToNearestUpperHeading(navbarOffset: number = 90) {
  if (typeof window === "undefined") return;

  const headings = Array.from(
    document.querySelectorAll<HTMLElement>(
      "article h1, article h2, article h3, article h4, [data-article-content] h1, [data-article-content] h2, [data-article-content] h3, [data-article-content] h4, main h1, main h2, main h3, main h4"
    )
  );

  if (headings.length === 0) return;

  const currentScrollY = window.scrollY;

  // Filter headings that are on the upper side (absolute top <= currentScrollY + navbarOffset + 30)
  const upperHeadings = headings.filter((el) => {
    const rect = el.getBoundingClientRect();
    const absTop = rect.top + currentScrollY;
    return absTop <= currentScrollY + navbarOffset + 30;
  });

  let targetElement: HTMLElement | null = null;

  if (upperHeadings.length > 0) {
    // Find the upper heading with the HIGHEST absolute top (nearest to current viewport position)
    targetElement = upperHeadings.reduce((prev, curr) => {
      const prevTop = prev.getBoundingClientRect().top + currentScrollY;
      const currTop = curr.getBoundingClientRect().top + currentScrollY;
      return currTop > prevTop ? curr : prev;
    });
  } else {
    // If no heading is above (e.g. near top of page), target the first heading
    targetElement = headings[0];
  }

  if (targetElement) {
    const targetTop = targetElement.getBoundingClientRect().top + currentScrollY - navbarOffset;
    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });
  }
}

