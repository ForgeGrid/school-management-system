import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Font Catalogue ────────────────────────────────────────────────────────────
export const FONT_OPTIONS = [
  { name: "Poppins",           category: "Sans Serif", weights: [300, 400, 500, 600, 700, 800, 900] },
  { name: "Inter",             category: "Sans Serif", weights: [300, 400, 500, 600, 700, 800, 900] },
  { name: "Plus Jakarta Sans", category: "Sans Serif", weights: [400, 500, 600, 700, 800] },
  { name: "Outfit",            category: "Sans Serif", weights: [300, 400, 500, 600, 700, 800] },
  { name: "DM Sans",           category: "Sans Serif", weights: [400, 500, 600, 700] },
  { name: "Nunito",            category: "Sans Serif", weights: [300, 400, 500, 600, 700, 800] },
  { name: "Raleway",           category: "Sans Serif", weights: [300, 400, 500, 600, 700, 800] },
  { name: "Open Sans",         category: "Sans Serif", weights: [300, 400, 500, 600, 700, 800] },
  { name: "Roboto",            category: "Sans Serif", weights: [300, 400, 500, 700, 900] },
  { name: "Lato",              category: "Sans Serif", weights: [300, 400, 700, 900] },
  { name: "Montserrat",        category: "Sans Serif", weights: [300, 400, 500, 600, 700, 800] },
  { name: "Manrope",           category: "Sans Serif", weights: [300, 400, 500, 600, 700, 800] },
  { name: "Space Grotesk",     category: "Sans Serif", weights: [300, 400, 500, 600, 700] },
  { name: "Sora",              category: "Sans Serif", weights: [300, 400, 500, 600, 700, 800] },
  { name: "Lora",              category: "Serif",      weights: [400, 500, 600, 700] },
  { name: "Merriweather",      category: "Serif",      weights: [300, 400, 700, 900] },
  { name: "Playfair Display",  category: "Serif",      weights: [400, 500, 600, 700, 800, 900] },
  { name: "Source Code Pro",   category: "Monospace",   weights: [300, 400, 500, 600, 700] },
  { name: "JetBrains Mono",    category: "Monospace",   weights: [400, 500, 600, 700, 800] },
];

const STORAGE_KEY = "scool-dashboard-font";
const DEFAULT_FONT = "Poppins";

// Build Google Fonts URL
function buildGoogleFontUrl(fontName, weights) {
  const family = fontName.replace(/ /g, "+");
  const wghtAxis = weights.join(";");
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${wghtAxis}&display=swap`;
}

// Inject <link> tag for a font
function loadFontStylesheet(fontName, weights) {
  const linkId = `font-link-${fontName.replace(/ /g, "-").toLowerCase()}`;
  if (document.getElementById(linkId)) return;

  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = buildGoogleFontUrl(fontName, weights);
  document.head.appendChild(link);
}

// ─── Context ────────────────────────────────────────────────────────────────────
const FontContext = createContext(undefined);

export function FontProvider({ children }) {
  const [currentFont, setCurrentFont] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_FONT;
    } catch {
      return DEFAULT_FONT;
    }
  });

  // Apply font to the document whenever it changes
  useEffect(() => {
    const fontEntry = FONT_OPTIONS.find(f => f.name === currentFont);
    if (fontEntry) {
      loadFontStylesheet(fontEntry.name, fontEntry.weights);
    }

    // Apply globally
    document.documentElement.style.setProperty("--app-font-family", `"${currentFont}", sans-serif`);
    document.body.style.fontFamily = `"${currentFont}", sans-serif`;

    const root = document.getElementById("root");
    if (root) {
      root.style.fontFamily = `"${currentFont}", sans-serif`;
    }

    // Persist
    try {
      localStorage.setItem(STORAGE_KEY, currentFont);
    } catch {
      // ignore quota errors
    }
  }, [currentFont]);

  const changeFont = useCallback((fontName) => {
    const exists = FONT_OPTIONS.find(f => f.name === fontName);
    if (exists) {
      setCurrentFont(fontName);
    }
  }, []);

  const resetFont = useCallback(() => {
    setCurrentFont(DEFAULT_FONT);
  }, []);

  return (
    <FontContext.Provider value={{ currentFont, changeFont, resetFont, fonts: FONT_OPTIONS }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const ctx = useContext(FontContext);
  if (!ctx) {
    throw new Error("useFont must be used within a <FontProvider>");
  }
  return ctx;
}

export default FontContext;
