import React, { useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { getCosmeticById } from '../data/cosmetics';
import AnimatedThemeOverlay from './AnimatedThemeOverlay';
import '../styles/themeOverlays.css';

const DEFAULT_THEME = {
  bg: '#0d1117',
  text: '#c9d1d9',
  keyword: '#ff7b72',
  string: '#a5d6ff',
  comment: '#8b949e',
  number: '#79c0ff',
  bracket: '#c9d1d9'
};

export default function ThemedSurface({ children, className = '', style = {} }) {
  const { equippedCosmetics } = useUser();

  const equippedThemeId = equippedCosmetics?.equipped_theme || null;
  const equippedTheme = useMemo(() => {
    if (!equippedThemeId) return null;
    return getCosmeticById(equippedThemeId);
  }, [equippedThemeId]);

  const themeColors = equippedTheme?.colors || DEFAULT_THEME;
  const editorStyles = equippedTheme?.editorStyles || {};
  const overlayType = editorStyles?.overlay?.type;
  const overlayIntensity = editorStyles?.overlay?.intensity;
  const resolvedOverlayIntensity = overlayType ? Number(overlayIntensity ?? 14) : 0;

  return (
    <div
      className={`relative overflow-hidden ${className}`.trim()}
      style={{
        backgroundColor: themeColors.bg,
        color: themeColors.text,
        backgroundImage: editorStyles.backgroundImage || undefined,
        backgroundSize: editorStyles.backgroundSize || undefined,
        backgroundPosition: editorStyles.backgroundPosition || undefined,
        backgroundRepeat: editorStyles.backgroundRepeat || undefined,
        animation: editorStyles.backgroundAnimation || undefined,
        ...style,
      }}
    >
      <AnimatedThemeOverlay kind={overlayType} intensity={resolvedOverlayIntensity} colors={themeColors} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>{children}</div>
    </div>
  );
}
