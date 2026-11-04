"use client";

import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";

export function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const blueprint = useSelector((state: RootState) => state.blueprint.payload);

  const cssVariables = useMemo(() => {
    if (!blueprint?.public_theme) return "";

    const { colors, typography } = blueprint.public_theme;
    if (!colors) return "";

    // Generate @font-face for custom fonts if any
    const fontFaces = typography?.customFonts
      ?.map(
        (font: any) => `
      @font-face {
        font-family: '${font.name}';
        src: url('${font.url}');
        font-weight: ${font.weight};
        font-style: ${font.style};
        font-display: swap;
      }
    `,
      )
      .join("\n") || "";

    return `
      ${fontFaces}

      :root {
        /* UI Core Variables */
        --primary: ${colors.primary || "#D9547A"};
        --primary-light: ${colors.primaryLight || colors.primary || "#E8899F"};
        --primary-dark: ${colors.primaryDark || colors.primary || "#B83A60"};
        --primary-hover: ${colors.primaryHover || colors.primary || "#C04A6E"};
        
        --secondary: ${colors.secondary || "#5A8C54"};
        --accent: ${colors.accent || "#C4B5D4"};
        --accent-hover: ${colors.accentHover || colors.accent || "#B09CC4"};
        --accent-soft: ${colors.accentSoft || "#FDF7EF"};
        
        --background: ${colors.background || "#FDF7EF"};
        --surface: ${colors.surface || "#FFFFFF"};
        --card: ${colors.card || "#FFFFFF"};
        
        --text: ${colors.text || "#3D2E2E"};
        --text-secondary: ${colors.textSecondary || colors.text || "#6B5555"};
        --text-muted: ${colors.textMuted || colors.text || "#A49090"};
        
        --border: ${colors.border || "#F5EDE0"};
        --border-hover: ${colors.borderHover || colors.border || "#E0D8EC"};
        
        --success: ${colors.success || "#5A8C54"};
        --warning: ${colors.warning || "#E8899F"};
        --error: ${colors.danger || colors.error || "#D9547A"};
        --info: ${colors.info || "#C4B5D4"};
        --overlay: ${colors.overlay || "rgba(61,46,46,0.65)"};

        /* Typography */
        --font-body: ${typography?.bodyFont || "'Nunito', sans-serif"};
        --font-heading: ${typography?.headingFont || "'DM Serif Display', Georgia, serif"};
      }

      /* Global Application Overrides */
      ${colors.background ? `body { background-color: var(--background); }` : ""}
      ${colors.text ? `body { color: var(--text); }` : ""}
      ${typography?.bodyFont ? `body { font-family: var(--font-body), sans-serif; }` : ""}
      ${typography?.headingFont ? `h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading), serif; }` : ""}
    `;
  }, [blueprint]);

  useEffect(() => {
    if (!cssVariables) return;

    let styleTag = document.getElementById("dynamic-theme-overrides");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "dynamic-theme-overrides";
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = cssVariables;
  }, [cssVariables]);

  return <>{children}</>;
}
