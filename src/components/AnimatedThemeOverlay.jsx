import React, { useMemo } from 'react';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const hexToRgba = (hex, alpha) => {
  if (!hex || typeof hex !== 'string') return `rgba(255,255,255,${alpha})`;
  let h = hex.trim();
  if (h.startsWith('#')) h = h.slice(1);

  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  if (h.length >= 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return `rgba(255,255,255,${alpha})`;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  return `rgba(255,255,255,${alpha})`;
};

// Deterministic PRNG for stable particle positions
const xfnv1a = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const mulberry32 = (a) => {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

function AnimatedThemeOverlay({ kind, intensity = 14, colors, className = '' }) {
  const safeKind = typeof kind === 'string' ? kind : '';
  const safeIntensity = clamp(Number(intensity || 0), 0, 40);

  const palette = useMemo(() => {
    const keyword = colors?.keyword || '#ff7b72';
    const string = colors?.string || '#a5d6ff';
    const number = colors?.number || '#79c0ff';

    return {
      primary: hexToRgba(keyword, 0.35),
      secondary: hexToRgba(string, 0.25),
      accent: hexToRgba(number, 0.25),
      solidPrimary: hexToRgba(keyword, 0.65),
      solidSecondary: hexToRgba(string, 0.55),
      solidAccent: hexToRgba(number, 0.55),
    };
  }, [colors]);

  const particles = useMemo(() => {
    if (!safeKind || safeIntensity <= 0) return [];

    const rng = mulberry32(xfnv1a(`${safeKind}:${safeIntensity}`));

    return Array.from({ length: safeIntensity }, (_, i) => {
      const left = Math.round(rng() * 10000) / 100; // 0..100 with 2 decimals
      const size = 8 + rng() * 14;
      const drift = (rng() - 0.5) * 90; // px
      const fall = 7 + rng() * 10;
      const delay = -rng() * fall;
      const spin = 6 + rng() * 12;
      const blur = rng() * 0.8;
      const opacity = 0.55 + rng() * 0.45;

      return {
        key: `${safeKind}-${i}`,
        left,
        size,
        drift,
        fall,
        delay,
        spin,
        blur,
        opacity,
      };
    });
  }, [safeKind, safeIntensity]);

  if (!safeKind || safeIntensity <= 0) return null;

  const baseStyle = {
    '--cq-overlay-primary': palette.primary,
    '--cq-overlay-secondary': palette.secondary,
    '--cq-overlay-accent': palette.accent,
    '--cq-overlay-solid-primary': palette.solidPrimary,
    '--cq-overlay-solid-secondary': palette.solidSecondary,
    '--cq-overlay-solid-accent': palette.solidAccent,
  };

  if (safeKind === 'sakura') {
    return (
      <div className={`cq-theme-overlay cq-overlay-sakura ${className}`.trim()} style={baseStyle} aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.key}
            className="cq-overlay-particle cq-sakura-particle"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              filter: p.blur ? `blur(${p.blur}px)` : undefined,
              animationDuration: `${p.fall}s`,
              animationDelay: `${p.delay}s`,
              '--cq-drift': `${p.drift}px`,
              '--cq-spin': `${p.spin}s`,
            }}
          >
            <span className="cq-sakura-petal" />
          </span>
        ))}
      </div>
    );
  }

  if (safeKind === 'embers') {
    return (
      <div className={`cq-theme-overlay cq-overlay-embers ${className}`.trim()} style={baseStyle} aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.key}
            className="cq-overlay-particle cq-ember-particle"
            style={{
              left: `${p.left}%`,
              width: `${Math.max(2, p.size * 0.28)}px`,
              height: `${Math.max(2, p.size * 0.28)}px`,
              opacity: p.opacity,
              filter: p.blur ? `blur(${p.blur}px)` : undefined,
              animationDuration: `${Math.max(5, p.fall * 0.9)}s`,
              animationDelay: `${p.delay}s`,
              '--cq-drift': `${p.drift * 0.6}px`,
            }}
          />
        ))}
      </div>
    );
  }

  if (safeKind === 'orbs') {
    return (
      <div className={`cq-theme-overlay cq-overlay-orbs ${className}`.trim()} style={baseStyle} aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.key}
            className="cq-overlay-particle cq-orb-particle"
            style={{
              left: `${p.left}%`,
              width: `${p.size * 1.6}px`,
              height: `${p.size * 1.6}px`,
              opacity: p.opacity,
              filter: `blur(${2.2 + p.blur * 2}px)`,
              animationDuration: `${9 + (p.fall % 8)}s`,
              animationDelay: `${p.delay}s`,
              '--cq-drift': `${p.drift * 0.4}px`,
            }}
          />
        ))}
      </div>
    );
  }

  if (safeKind === 'aurora') {
    // Aurora uses a few large animated ribbons; intensity controls subtle extra shimmer particles.
    const shimmerCount = clamp(Math.floor((safeIntensity || 0) / 10), 0, 4);
    const rng = mulberry32(xfnv1a(`aurora-shimmer:${shimmerCount}`));
    const shimmers = Array.from({ length: shimmerCount }, (_, i) => ({
      key: `aurora-shimmer-${i}`,
      left: Math.round(rng() * 10000) / 100,
      size: 6 + rng() * 10,
      drift: (rng() - 0.5) * 60,
      fall: 10 + rng() * 8,
      delay: -rng() * 14,
      opacity: 0.25 + rng() * 0.35,
    }));

    return (
      <div className={`cq-theme-overlay cq-overlay-aurora ${className}`.trim()} style={baseStyle} aria-hidden="true">
        <span className="cq-aurora-ribbon" />
        <span className="cq-aurora-ribbon" />
        {shimmers.map((p) => (
          <span
            key={p.key}
            className="cq-overlay-particle cq-orb-particle"
            style={{
              left: `${p.left}%`,
              width: `${p.size * 1.2}px`,
              height: `${p.size * 1.2}px`,
              opacity: p.opacity,
              animationDuration: `${p.fall}s`,
              animationDelay: `${p.delay}s`,
              '--cq-drift': `${p.drift}px`,
            }}
          />
        ))}
      </div>
    );
  }

  if (safeKind === 'kawaii' || safeKind === 'anime') {
    const symbols = ['✦', '★', '♡', '♪', '✧'];

    return (
      <div className={`cq-theme-overlay cq-overlay-kawaii ${className}`.trim()} style={baseStyle} aria-hidden="true">
        {particles.map((p, i) => (
          <span
            key={p.key}
            className="cq-overlay-particle cq-kawaii-particle"
            style={{
              left: `${p.left}%`,
              fontSize: `${Math.max(10, p.size * 0.9)}px`,
              opacity: p.opacity,
              filter: p.blur ? `blur(${p.blur}px)` : undefined,
              animationDuration: `${Math.max(6, p.fall)}s`,
              animationDelay: `${p.delay}s`,
              '--cq-drift': `${p.drift * 0.5}px`,
            }}
          >
            {symbols[i % symbols.length]}
          </span>
        ))}
      </div>
    );
  }

  return null;
}

export default React.memo(AnimatedThemeOverlay);
