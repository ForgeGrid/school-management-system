/**
 * Plus Jakarta Sans Font Loader
 *
 * Shared utility that injects the Google Fonts stylesheet for
 * "Plus Jakarta Sans" exactly once into <head>, along with base
 * reset styles scoped to a given root class.
 *
 * Usage:
 *   import { FontLoader } from "../../fonts/plusJakartaSans";
 *   // then render <FontLoader /> somewhere in your component tree.
 *
 *   import { injectFontStyles } from "../../fonts/plusJakartaSans";
 *   // call injectFontStyles("my-root-class") inside a useEffect.
 */
import { useEffect } from "react";

const FONT_LINK_ID = "pjs-font-link";
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";

/**
 * Appends the Google Fonts <link> to <head> if it doesn't already exist.
 */
export function loadPlusJakartaSans() {
  if (!document.getElementById(FONT_LINK_ID)) {
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);
  }
}

/**
 * Injects a <style> block that applies Plus Jakarta Sans to every element
 * inside the given `rootClass` selector, plus common resets (box-sizing,
 * appearance, focus outline, cursor).
 *
 * @param {string} rootClass - CSS class used as the scoping selector
 *                              (e.g. "afs" → ".afs * { … }").
 * @returns {HTMLStyleElement} the injected <style> node (for cleanup).
 */
export function injectFontStyles(rootClass) {
  const style = document.createElement("style");
  style.textContent = `
    .${rootClass} * {
      font-family: 'Plus Jakarta Sans', sans-serif !important;
      box-sizing: border-box;
    }
    .${rootClass} select {
      appearance: none;
      -webkit-appearance: none;
    }
    .${rootClass} input:focus,
    .${rootClass} select:focus {
      outline: none;
    }
    .${rootClass} button {
      cursor: pointer;
      font-family: 'Plus Jakarta Sans', sans-serif !important;
    }
  `;
  document.head.appendChild(style);
  return style;
}

/**
 * React component that loads the font link + injects scoped styles.
 * Accepts an optional `rootClass` prop (defaults to "afs").
 */
export const FontLoader = ({ rootClass = "afs" }) => {
  useEffect(() => {
    loadPlusJakartaSans();
    const style = injectFontStyles(rootClass);
    return () => {
      style.remove();
    };
  }, [rootClass]);

  return null;
};
