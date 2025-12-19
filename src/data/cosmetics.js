/**
 * Cosmetics Catalog - Editor Themes, Profile Items
 */

export const COSMETICS = {
  // ============================================
  // EDITOR THEMES (SSR - Super Super Rare)
  // ============================================
  themes: [
    // Theme metadata
    // - `colors`: CSS-driven token colors used by both highlight.js and Shiki (via cq-* token classes)
    // - `editorStyles` (optional):
    //   - fontFamily, letterSpacing, textShadow
    //   - caretColor
    //   - backgroundImage, backgroundSize, backgroundPosition, backgroundRepeat
    //   - backgroundAnimation (expects keyframes: cq-gradient-shift, cq-flicker)
    //   - overlay (optional):
    //     - type: 'sakura' | 'embers' | 'orbs'
    //     - intensity: number (0..40)
    {
      id: 'default',
      name: 'Default',
      description: 'The classic CodeQuarry theme',
      rarity: 'default',
      cost: 0,
      colors: {
        bg: '#0d1117',
        text: '#c9d1d9',
        keyword: '#ff7b72',
        string: '#a5d6ff',
        comment: '#8b949e',
        number: '#79c0ff',
        bracket: '#c9d1d9'
      }
    },
    {
      id: 'cyberpunk-neon',
      name: 'Cyberpunk Neon',
      description: 'Glowing text with dark purple background. Maximum vibes.',
      rarity: 'ssr',
      cost: 150,
      colors: {
        bg: '#0a0e27',
        text: '#00ff88',
        keyword: '#ff006e',
        string: '#00f0ff',
        comment: '#7209b7',
        number: '#f72585',
        bracket: '#00ff88'
      },
      editorStyles: {
        textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
        letterSpacing: '0.5px',
        backgroundImage: 'linear-gradient(135deg, #0a0e27, #0a0e27, #ff006e22, #00ff8822)',
        backgroundSize: '400% 400%',
        backgroundPosition: '0% 50%',
        backgroundRepeat: 'no-repeat',
        backgroundAnimation: 'cq-gradient-shift 14s ease infinite',
        caretColor: '#00ff88'
      }
    },
    {
      id: 'retro-terminal',
      name: 'Retro Terminal',
      description: 'Green CRT monitor with flicker effect. Vintage computing vibes.',
      rarity: 'ssr',
      cost: 150,
      colors: {
        bg: '#1a1a1a',
        text: '#00dd00',
        keyword: '#00ff00',
        string: '#00cc00',
        comment: '#008800',
        number: '#00ff00',
        bracket: '#00dd00'
      },
      editorStyles: {
        fontFamily: '"Courier New", monospace',
        textShadow: '0 0 8px rgba(0, 221, 0, 0.8)',
        backgroundImage: 'radial-gradient(circle at 50% 50%, #00dd0010 0%, transparent 55%), linear-gradient(#1a1a1a, #1a1a1a)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAnimation: 'cq-flicker 0.15s infinite',
        caretColor: '#00ff00'
      }
    },
    {
      id: 'synthwave',
      name: 'Synthwave',
      description: 'Neon pink and blue retro-futuristic aesthetic.',
      rarity: 'ssr',
      cost: 150,
      colors: {
        bg: '#0d0221',
        text: '#ff006e',
        keyword: '#ff006e',
        string: '#00f5ff',
        comment: '#8338ec',
        number: '#ffbe0b',
        bracket: '#00f5ff'
      },
      editorStyles: {
        textShadow: '0 0 15px rgba(255, 0, 110, 0.6)',
        letterSpacing: '1px'
      }
    },
    {
      id: 'dracula',
      name: 'Dracula',
      description: 'Dark elegant theme with vibrant colors.',
      rarity: 'ssr',
      cost: 150,
      colors: {
        bg: '#282a36',
        text: '#f8f8f2',
        keyword: '#ff79c6',
        string: '#f1fa8c',
        comment: '#6272a4',
        number: '#bd93f9',
        bracket: '#f8f8f2'
      }
    },
    {
      id: 'anime-sakura-night',
      name: 'Sakura Night',
      description: 'Falling petals over a drifting night-sky gradient.',
      rarity: 'ssr',
      cost: 150,
      colors: {
        bg: '#0b1020',
        text: '#f8f7ff',
        keyword: '#ff4fd8',
        string: '#7dd3fc',
        comment: '#a78bfa',
        number: '#fbbf24',
        bracket: '#f8f7ff'
      },
      editorStyles: {
        textShadow: '0 0 12px rgba(255, 79, 216, 0.25)',
        letterSpacing: '0.6px',
        backgroundImage:
          'radial-gradient(circle at 18% 22%, rgba(255, 79, 216, 0.18) 0%, transparent 35%), radial-gradient(circle at 82% 18%, rgba(125, 211, 252, 0.16) 0%, transparent 38%), radial-gradient(circle at 70% 78%, rgba(167, 139, 250, 0.14) 0%, transparent 40%), linear-gradient(135deg, #0b1020, #141a3a, #2a155a, #0b1020)',
        backgroundSize: '400% 400%',
        backgroundPosition: '0% 50%',
        backgroundRepeat: 'no-repeat',
        backgroundAnimation: 'cq-gradient-shift 18s ease infinite',
        caretColor: '#ffb3e6',
        overlay: {
          type: 'sakura',
          intensity: 18
        }
      }
    },
    {
      id: 'aurora-zen',
      name: 'Aurora Zen',
      description: 'Calm aurora gradients with clean, readable tokens.',
      rarity: 'ssr',
      cost: 150,
      colors: {
        bg: '#06161b',
        text: '#e6fffb',
        keyword: '#34d399',
        string: '#22d3ee',
        comment: '#5eead4',
        number: '#a3e635',
        bracket: '#e6fffb'
      },
      editorStyles: {
        textShadow: '0 0 10px rgba(34, 211, 238, 0.18)',
        backgroundImage:
          'radial-gradient(circle at 10% 20%, rgba(34, 211, 238, 0.20) 0%, transparent 45%), radial-gradient(circle at 90% 35%, rgba(52, 211, 153, 0.18) 0%, transparent 48%), linear-gradient(135deg, #06161b, #062c30, #0a3d2b, #06161b)',
        backgroundSize: '400% 400%',
        backgroundPosition: '0% 50%',
        backgroundRepeat: 'no-repeat',
        backgroundAnimation: 'cq-gradient-shift 22s ease infinite',
        caretColor: '#22d3ee',
        overlay: {
          type: 'aurora',
          intensity: 18
        }
      }
    },
    {
      id: 'anime-neon-signs',
      name: 'Anime Neon Signs',
      description: 'Kawaii neon sparkles and signs — pure anime opener energy.',
      rarity: 'ssr',
      cost: 150,
      colors: {
        bg: '#070b1a',
        text: '#e9e9ff',
        keyword: '#ff3df2',
        string: '#00e5ff',
        comment: '#9b8cff',
        number: '#ffe66d',
        bracket: '#e9e9ff'
      },
      editorStyles: {
        textShadow: '0 0 14px rgba(255, 61, 242, 0.22)',
        letterSpacing: '0.7px',
        backgroundImage:
          'radial-gradient(circle at 18% 30%, rgba(255, 61, 242, 0.18) 0%, transparent 38%), radial-gradient(circle at 84% 18%, rgba(0, 229, 255, 0.15) 0%, transparent 40%), linear-gradient(135deg, #070b1a, #140a33, #090f2b, #070b1a)',
        backgroundSize: '400% 400%',
        backgroundPosition: '0% 50%',
        backgroundRepeat: 'no-repeat',
        backgroundAnimation: 'cq-gradient-shift 16s ease infinite',
        caretColor: '#00e5ff',
        overlay: {
          type: 'kawaii',
          intensity: 20
        }
      }
    },
    {
      id: 'ember-forge',
      name: 'Ember Forge',
      description: 'Molten glow and subtle flicker — like coding by the forge.',
      rarity: 'ssr',
      cost: 150,
      colors: {
        bg: '#0f0a07',
        text: '#fff7ed',
        keyword: '#fb7185',
        string: '#fdba74',
        comment: '#a78bfa',
        number: '#fbbf24',
        bracket: '#fff7ed'
      },
      editorStyles: {
        textShadow: '0 0 10px rgba(253, 186, 116, 0.25)',
        backgroundImage:
          'radial-gradient(circle at 30% 25%, rgba(251, 113, 133, 0.22) 0%, transparent 45%), radial-gradient(circle at 75% 70%, rgba(253, 186, 116, 0.18) 0%, transparent 50%), linear-gradient(135deg, #0f0a07, #1b0f0a, #24110a, #0f0a07)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAnimation: 'cq-flicker 0.22s infinite',
        caretColor: '#fdba74',
        overlay: {
          type: 'embers',
          intensity: 16
        }
      }
    }
  ],

  // ============================================
  // PROFILE TITLES (SR - Super Rare)
  // ============================================
  titles: [
    {
      id: 'null-pointer-survivor',
      name: 'Null Pointer Survivor',
      description: 'You survived the dreaded NullPointerException',
      rarity: 'sr',
      cost: 75,
      display: 'Null Pointer Survivor'
    },
    {
      id: 'recursion-king',
      name: 'Recursion King',
      description: 'Master of recursive algorithms',
      rarity: 'sr',
      cost: 75,
      display: 'Recursion King'
    },
    {
      id: 'o1-god',
      name: 'O(1) God',
      description: 'Your algorithms are optimized perfection',
      rarity: 'sr',
      cost: 75,
      display: 'O(1) God'
    },
    {
      id: 'bug-buster',
      name: 'Bug Buster',
      description: 'Legendary debugger extraordinaire',
      rarity: 'sr',
      cost: 75,
      display: 'Bug Buster'
    },
    {
      id: 'loop-master',
      name: 'Loop Master',
      description: 'Expert in control flow and iterations',
      rarity: 'sr',
      cost: 75,
      display: 'Loop Master'
    },
    {
      id: 'array-architect',
      name: 'Array Architect',
      description: 'Builder of complex data structures',
      rarity: 'sr',
      cost: 75,
      display: 'Array Architect'
    }
  ],

  // ============================================
  // NAME COLORS (R - Rare)
  // ============================================
  nameColors: [
    {
      id: 'gold',
      name: 'Gold',
      description: 'Prestigious golden glow',
      rarity: 'r',
      cost: 50,
      color: '#ffd700',
      textShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      description: 'Prismatic multi-color effect',
      rarity: 'r',
      cost: 50,
      gradient: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)'
    },
    {
      id: 'glitched',
      name: 'Glitched',
      description: 'Corrupted digital aesthetic',
      rarity: 'r',
      cost: 50,
      color: '#00ff88',
      textShadow: '2px 2px 0 #ff006e, -2px -2px 0 #00f5ff'
    },
    {
      id: 'neon-pink',
      name: 'Neon Pink',
      description: 'Vibrant hot pink with glow',
      rarity: 'r',
      cost: 50,
      color: '#ff006e',
      textShadow: '0 0 10px rgba(255, 0, 110, 0.8)'
    },
    {
      id: 'ice-blue',
      name: 'Ice Blue',
      description: 'Cool crystalline blue',
      rarity: 'r',
      cost: 50,
      color: '#00f5ff',
      textShadow: '0 0 10px rgba(0, 245, 255, 0.6)'
    },
    {
      id: 'matrix-green',
      name: 'Matrix Green',
      description: 'That classic hacker aesthetic',
      rarity: 'r',
      cost: 50,
      color: '#00dd00',
      textShadow: '0 0 10px rgba(0, 221, 0, 0.8)'
    }
  ]
};

// Helper to get all cosmetics flattened
export const getAllCosmetics = () => [
  ...COSMETICS.themes,
  ...COSMETICS.titles,
  ...COSMETICS.nameColors
];

// Helper to get cosmetic by ID
export const getCosmeticById = (id) => {
  return getAllCosmetics().find(c => c.id === id);
};

// Helper to get rarity display
export const getRarityInfo = (rarity) => {
  const rarityMap = {
    default: { emoji: '📦', color: '#8b949e', label: 'Default' },
    ssr: { emoji: '⭐⭐⭐', color: '#ff006e', label: 'Super Super Rare' },
    sr: { emoji: '⭐⭐', color: '#ffbe0b', label: 'Super Rare' },
    r: { emoji: '⭐', color: '#79c0ff', label: 'Rare' }
  };
  return rarityMap[rarity] || rarityMap.default;
};
