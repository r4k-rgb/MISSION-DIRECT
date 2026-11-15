import { CHARACTERS } from '../data/characters';
import { ENGINES, HULLS, INSTRUMENTS, SHIELDS } from '../data/parts';
import {
  CharacterId,
  Expression,
  MaterialId,
  MouthShape,
  RocketConfig,
  SceneBackdropId,
} from '../types/game';

export function drawCharacterPortrait(
  canvas: HTMLCanvasElement,
  charId: CharacterId,
  expression: Expression = 'neutral',
  mouthShape: MouthShape = 'closed',
  isBlinking = false
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const char = CHARACTERS[charId];
  const grid = char.sprites[expression] || char.sprites.neutral;
  const pal = char.palette;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Subtle ambient rim behind bust
  ctx.fillStyle = '#0d0b20';
  ctx.fillRect(0, 0, 28, 28);
  ctx.fillStyle = char.accentColor + '1e';
  ctx.fillRect(1, 1, 26, 26);
  ctx.fillStyle = '#0d0b20';
  ctx.fillRect(2, 2, 24, 24);

  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      let ch = row[x];
      // Blink across both eye rows
      if (
        isBlinking &&
        char.eyeRows.includes(y) &&
        (ch === 'e' || ch === 'w' || ch === 'r' || ch === 'g')
      ) {
        ch = charId === 'N' ? 'd' : 's';
      }

      const color = pal[ch];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });

  // Phoneme-driven lip-sync overlay on mouthRow
  if (mouthShape !== 'closed') {
    const my = char.mouthRow;
    if (charId === 'N') {
      // NOVA animated equalizer waveform bar
      ctx.fillStyle = '#090b16';
      ctx.fillRect(10, my, 8, 1);
      ctx.fillStyle = '#4de8ff';
      if (mouthShape === 'mid') {
        ctx.fillRect(11, my, 6, 1);
      } else if (mouthShape === 'open') {
        ctx.fillRect(10, my - 1, 8, 2);
        ctx.fillStyle = '#ffd23f';
        ctx.fillRect(12, my, 4, 1);
      } else if (mouthShape === 'round') {
        ctx.fillRect(12, my - 1, 4, 2);
      }
    } else {
      // Human lip-sync animation centered around x = 12..15 (center of 28px portrait)
      const lipColor = pal.m || '#b84a57';
      const innerColor = '#2a0e18';
      const teethColor = '#f8fafc';

      if (mouthShape === 'mid') {
        ctx.fillStyle = innerColor;
        ctx.fillRect(12, my, 4, 1);
        ctx.fillStyle = lipColor;
        ctx.fillRect(11, my, 1, 1);
        ctx.fillRect(16, my, 1, 1);
      } else if (mouthShape === 'open') {
        ctx.fillStyle = innerColor;
        ctx.fillRect(12, my, 4, 2);
        ctx.fillStyle = teethColor;
        ctx.fillRect(13, my, 2, 1);
        ctx.fillStyle = lipColor;
        ctx.fillRect(11, my, 1, 2);
        ctx.fillRect(16, my, 1, 2);
      } else if (mouthShape === 'round') {
        ctx.fillStyle = lipColor;
        ctx.fillRect(12, my, 4, 2);
        ctx.fillStyle = innerColor;
        ctx.fillRect(13, my, 2, 2);
      }
    }
  }
}

export function drawMaterialSprite(canvas: HTMLCanvasElement, matId: MaterialId): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, 12, 12);

  const sprites: Record<MaterialId, { pal: Record<string, string>; rows: string[] }> = {
    ti: {
      pal: { k: '#0c0d18', a: '#cbd5e1', b: '#64748b', w: '#f8fafc' },
      rows: [
        '............',
        '....kkkk....',
        '..kkwwwwkk..',
        '.kwwaaaabbk.',
        '.kwaaaaaabk.',
        '.kwaaaaabbk.',
        '.kbaabbbbbk.',
        '.kbbbbbbbbk.',
        '..kkbbbbkk..',
        '....kkkk....',
        '............',
        '............',
      ],
    },
    he3: {
      pal: { k: '#140f08', y: '#ffd23f', o: '#f59e0b', w: '#fef9c3', c: '#475569' },
      rows: [
        '....kkkk....',
        '...kcccck...',
        '..kkwwwwkk..',
        '.kwwyyyyyok.',
        '.kwyyyyyyok.',
        '.koyyyyyook.',
        '.koyyyyyook.',
        '.kkooooookk.',
        '..kkcccckk..',
        '...kkkkkk...',
        '............',
        '............',
      ],
    },
    si: {
      pal: { k: '#081826', c: '#4de8ff', d: '#0284c7', w: '#e0f2fe' },
      rows: [
        '.....kk.....',
        '....kwwk....',
        '...kwccwk...',
        '..kwccccdk..',
        '.kwccccccdk.',
        '.kcccccccck.',
        '.kdccccccdk.',
        '..kdccccdk..',
        '...kddddk...',
        '....kddk....',
        '.....kk.....',
        '............',
      ],
    },
    xe: {
      pal: { k: '#110a24', p: '#a78bfa', d: '#6d28d9', w: '#ede9fe' },
      rows: [
        '...kkkkkk...',
        '..kddddddk..',
        '.kdwppppwdk.',
        '.kdppppppdk.',
        '.kdwppppwdk.',
        '.kdppppppdk.',
        '.kdwppppwdk.',
        '.kddddddddk.',
        '..kkkkkkkk..',
        '............',
        '............',
        '............',
      ],
    },
    qc: {
      pal: { k: '#061a14', g: '#6ee7a0', d: '#059669', w: '#ecfdf5', y: '#ffd23f' },
      rows: [
        '.....kk.....',
        '...kkggkk...',
        '..kgwwwwgk..',
        '.kgwyyyywgk.',
        '.kgwyggywgk.',
        '.kgwyyyywgk.',
        '.kgdwwwwdgk.',
        '..kddddddk..',
        '...kkddkk...',
        '.....kk.....',
        '............',
        '............',
      ],
    },
  };

  const s = sprites[matId];
  s.rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = s.pal[row[x]];
      if (c) {
        ctx.fillStyle = c;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
}

export function drawPixelRocket(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  config: RocketConfig,
  frame: number,
  options?: { thrusting?: boolean; stageSeparated?: boolean; shieldActive?: boolean }
): void {
  const hull = HULLS.find((h) => h.id === config.hullId) || HULLS[0];
  const engine = ENGINES.find((e) => e.id === config.engineId) || ENGINES[0];
  const shield = config.shieldId ? SHIELDS.find((s) => s.id === config.shieldId) : null;
  const tier = hull.visualTier;
  const thrusting = options?.thrusting ?? true;

  const bodyW = 6 + tier * 2;
  const bodyH = 18 + tier * 5;
  const topY = baseY - bodyH;

  if (tier >= 2 && !options?.stageSeparated) {
    const bw = 4;
    const bh = Math.floor(bodyH * 0.68);
    const by = baseY - bh;
    const leftX = Math.floor(cx - bodyW / 2 - bw - 1);
    const rightX = Math.floor(cx + bodyW / 2 + 1);

    [leftX, rightX].forEach((bx) => {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#ff5d73';
      ctx.fillRect(bx, by - 2, bw, 2);
      ctx.fillRect(bx + 1, by - 4, bw - 2, 2);
      ctx.fillStyle = '#475569';
      ctx.fillRect(bx, by + bh - 3, bw, 3);
      if (thrusting) {
        const fl = 4 + ((frame + bx) % 4);
        ctx.fillStyle = engine.flameColor;
        ctx.fillRect(bx + 1, by + bh, 2, fl);
      }
    });
  }

  const x0 = Math.floor(cx - bodyW / 2);
  ctx.fillStyle = tier >= 4 ? '#fde047' : tier === 3 ? '#e2e8f0' : '#f4f1ff';
  ctx.fillRect(x0, topY, bodyW, bodyH);

  ctx.fillStyle = tier >= 4 ? '#ca8a04' : '#94a3b8';
  ctx.fillRect(x0 + bodyW - 2, topY, 2, bodyH);

  const noseColor = tier >= 3 ? '#4de8ff' : '#ff5d73';
  ctx.fillStyle = noseColor;
  ctx.fillRect(x0, topY - 4, bodyW, 4);
  ctx.fillRect(x0 + 1, topY - 7, bodyW - 2, 3);
  ctx.fillRect(Math.floor(cx) - 1, topY - 9, 2, 2);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(Math.floor(cx) - 2, topY + 3, 4, 4);
  ctx.fillStyle = '#4de8ff';
  ctx.fillRect(Math.floor(cx) - 1, topY + 4, 2, 2);

  ctx.fillStyle = '#312e81';
  ctx.fillRect(x0, topY + Math.floor(bodyH * 0.45), bodyW, 2);

  ctx.fillStyle = '#ff5d73';
  ctx.fillRect(x0 - 3, baseY - 6, 3, 6);
  ctx.fillRect(x0 + bodyW, baseY - 6, 3, 6);

  ctx.fillStyle = '#475569';
  ctx.fillRect(Math.floor(cx) - 3, baseY, 6, 3);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(Math.floor(cx) - 2, baseY + 1, 4, 2);

  config.instrumentIds.forEach((id, idx) => {
    const inst = INSTRUMENTS.find((i) => i.id === id);
    if (!inst) return;
    const colorMap: Record<string, string> = {
      optics: '#4de8ff',
      spectro: '#6ee7a0',
      radar: '#ffd23f',
      plasma: '#f472b6',
      quantum: '#e879f9',
    };
    ctx.fillStyle = colorMap[inst.specialtyTag] || '#4de8ff';
    const side = idx % 2 === 0 ? x0 - 2 : x0 + bodyW;
    const iy = topY + 2 + Math.floor(idx / 2) * 4;
    ctx.fillRect(side, iy, 2, 2);
  });

  if (shield) {
    ctx.fillStyle =
      shield.id === 'shd_magneto'
        ? '#6ee7a0'
        : shield.id === 'shd_faraday'
        ? '#4de8ff'
        : '#fbbf24';
    ctx.fillRect(x0, topY - 1, bodyW, 1);
    if (options?.shieldActive) {
      ctx.strokeStyle = '#4de8ff';
      ctx.lineWidth = 1;
      ctx.strokeRect(x0 - 5, topY - 11, bodyW + 10, bodyH + 16);
    }
  }

  if (thrusting) {
    const flicker = frame % 5;
    ctx.fillStyle = engine.flameColor;
    ctx.fillRect(Math.floor(cx) - 2, baseY + 3, 4, 6 + flicker * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.floor(cx) - 1, baseY + 3, 2, 3 + (frame % 3));
  }
}

/**
 * Crisp 200x90 pixel-art cutscene diorama renderer with distinct layered landmarks.
 */
export function drawSceneBackdrop(
  canvas: HTMLCanvasElement,
  backdrop: SceneBackdropId,
  timeMs: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width; // 200 (or 160 if caller uses 160x72)
  const h = canvas.height;
  const sx = w / 200;
  const sy = h / 90;
  const t = Math.floor(timeMs / 110);

  const rx = (v: number) => Math.round(v * sx);
  const ry = (v: number) => Math.round(v * sy);
  const fill = (x: number, y: number, bw: number, bh: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(rx(x), ry(y), Math.max(1, rx(bw)), Math.max(1, ry(bh)));
  };

  // Multi-band sky gradient
  const skyBands: Record<SceneBackdropId, [string, string, string]> = {
    station_bridge: ['#070716', '#0e0c29', '#191645'],
    launchpad_dusk: ['#100b29', '#2b1954', '#581c6b'],
    leo_storm:      ['#040b1c', '#081a3d', '#0f3066'],
    lunar_crater:   ['#05050d', '#0b0b1a', '#16162b'],
    lagrange_sun:   ['#0c0614', '#1f0d1f', '#381422'],
    mars_canyon:    ['#14070a', '#2e1012', '#571c15'],
    asteroid_belt:  ['#080714', '#14112b', '#221b42'],
    europa_ice:     ['#050e1c', '#0b203b', '#143861'],
    titan_haze:     ['#1a0f06', '#38210a', '#633b10'],
    neptune_gate:   ['#04081c', '#081642', '#0f2c75'],
  };

  const [c1, c2, c3] = skyBands[backdrop];
  fill(0, 0, 200, 34, c1);
  fill(0, 34, 200, 30, c2);
  fill(0, 64, 200, 26, c3);

  // Twinkling pixel starfield
  for (let i = 0; i < 48; i++) {
    const px = (i * 43 + 11) % 198;
    const py = (i * 29 + 5) % 62;
    const twinkle = (t + i) % 11 === 0;
    const col = twinkle ? '#4de8ff' : i % 6 === 0 ? '#ffd23f' : '#cbd5e1';
    fill(px, py, i % 13 === 0 ? 2 : 1, 1, col);
  }

  if (backdrop === 'station_bridge') {
    // Observation window Earth curvature
    fill(26, 46, 148, 28, '#0284c7');
    fill(42, 40, 116, 10, '#38bdf8');
    fill(54, 43, 28, 6, '#6ee7a0');
    fill(106, 45, 36, 7, '#6ee7a0');
    fill(68, 38, 22, 3, '#e0f2fe');
    // Bridge frame struts & ceiling
    fill(0, 0, 200, 7, '#1b183d');
    fill(0, 0, 20, 90, '#161333');
    fill(180, 0, 20, 90, '#161333');
    fill(20, 7, 4, 62, '#282257');
    fill(176, 7, 4, 62, '#282257');
    // Bridge console desk & screens
    fill(0, 66, 200, 24, '#14112e');
    fill(0, 66, 200, 2, '#453ea8');
    // Left radar screen with sweeping blip
    fill(28, 70, 44, 15, '#070917');
    fill(30, 72, 40, 11, '#0b1e2e');
    fill(32 + (t % 34), 76, 3, 2, '#4de8ff');
    fill(32 + ((t + 16) % 34), 79, 2, 2, '#6ee7a0');
    // Center hologram waveform (660s Neptune harmonic)
    fill(82, 54, 36, 16, '#091529');
    for (let x = 0; x < 32; x += 2) {
      const amp = Math.round(Math.sin((x + t) * 0.45) * 4) + 5;
      fill(84 + x, 66 - amp, 1, amp, '#4de8ff');
    }
    // Right status monitors
    fill(132, 70, 40, 15, '#070917');
    fill(136, 74, 10, 3, '#ffd23f');
    fill(150, 74, 16, 3, t % 4 < 2 ? '#6ee7a0' : '#334155');
    fill(136, 80, 28, 2, '#ff5d73');
  } else if (backdrop === 'launchpad_dusk') {
    // Distant volcanic mountain ridge
    fill(0, 56, 48, 12, '#241442');
    fill(18, 48, 26, 12, '#2f1a57');
    fill(140, 54, 60, 14, '#241442');
    fill(160, 46, 30, 14, '#2f1a57');
    // Sunset horizon band
    fill(0, 64, 200, 6, '#9a3412');
    fill(0, 68, 200, 22, '#13162b');
    // Launch pad & blast trench
    fill(54, 66, 92, 6, '#334155');
    fill(64, 72, 72, 18, '#1e293b');
    // Lattice gantry tower
    fill(70, 16, 7, 50, '#475569');
    fill(72, 18, 3, 46, '#1e293b');
    fill(77, 24, 15, 2, '#64748b');
    fill(77, 38, 15, 2, '#64748b');
    fill(77, 52, 15, 2, '#64748b');
    // Ready rocket on pad with cryo vapor
    fill(94, 22, 10, 42, '#f8fafc');
    fill(102, 22, 2, 42, '#94a3b8');
    fill(94, 16, 10, 6, '#ff5d73');
    fill(96, 12, 6, 4, '#ff5d73');
    fill(98, 9, 2, 3, '#ffd23f');
    // Cryo vapor drift
    const vx = 104 + (t % 12);
    fill(vx, 34, 6, 3, '#cbd5e1');
    fill(vx + 4, 32, 5, 2, '#94a3b8');
    // Floodlights
    fill(58, 63, 3, 3, '#ffd23f');
    fill(138, 63, 3, 3, '#ffd23f');
  } else if (backdrop === 'leo_storm') {
    // Glowing blue Earth limb + dramatic cyclone spiral
    fill(14, 34, 172, 56, '#0284c7');
    fill(32, 28, 136, 10, '#38bdf8');
    fill(38, 26, 124, 3, '#bae6fd');
    // Cyclone cloud bands
    const cx = 102 + (t % 6 < 3 ? 1 : 0);
    fill(cx - 24, 44, 48, 5, '#e0f2fe');
    fill(cx - 32, 49, 64, 6, '#f8fafc');
    fill(cx - 20, 55, 40, 5, '#cbd5e1');
    fill(cx - 4, 48, 8, 6, '#0369a1');
    if (t % 7 === 0) fill(cx + 8, 50, 4, 3, '#ffd23f'); // lightning flash
    // Merapi-1 weather sat silhouette in foreground
    fill(40, 14, 10, 8, '#ffd23f');
    fill(24, 16, 16, 4, '#4de8ff');
    fill(50, 16, 16, 4, '#4de8ff');
    fill(44, 22, 2, 5, '#cbd5e1');
  } else if (backdrop === 'lunar_crater') {
    // Distant Earth in black lunar sky
    fill(158, 12, 16, 16, '#0284c7');
    fill(162, 15, 7, 5, '#6ee7a0');
    fill(164, 21, 6, 3, '#f8fafc');
    // Jagged lunar mountains & Shackleton crater rim
    fill(0, 56, 200, 34, '#334155');
    fill(0, 48, 56, 12, '#475569');
    fill(136, 44, 64, 16, '#475569');
    fill(52, 58, 92, 20, '#0f172a');
    fill(64, 64, 68, 14, '#070a14');
    // Buried Pioneer-0 transponder glinting cyan
    fill(94, 67, 10, 5, '#94a3b8');
    fill(97, 64, 2, 4, '#cbd5e1');
    if (t % 5 < 3) {
      fill(96, 62, 4, 2, '#4de8ff');
    }
  } else if (backdrop === 'lagrange_sun') {
    // Blazing solar disk + magnetic flare loop
    fill(10, 18, 34, 34, '#ea580c');
    fill(14, 22, 26, 26, '#f59e0b');
    fill(18, 26, 18, 18, '#fef08a');
    // Dynamic flare prominence
    const fl = t % 2 === 0 ? 0 : 2;
    fill(44, 24 - fl, 10, 3, '#fb7185');
    fill(52, 27 - fl, 3, 10, '#ffd23f');
    fill(44, 37, 10, 3, '#fb7185');
    // Dark Earth umbra disc with blue ring
    fill(88, 28, 18, 18, '#38bdf8');
    fill(90, 30, 14, 14, '#090814');
    // L2 Halo Relay Probe
    fill(146, 34, 10, 12, '#ffd23f');
    fill(138, 38, 8, 4, '#4de8ff');
    fill(156, 38, 8, 4, '#4de8ff');
    fill(144, 46, 14, 3, '#cbd5e1');
  } else if (backdrop === 'mars_canyon') {
    // Tiny Phobos moon
    fill(164, 14, 7, 6, '#94a3b8');
    // Towering Martian canyon mesas
    fill(0, 56, 200, 34, '#7c2d12');
    fill(0, 44, 64, 18, '#9a3412');
    fill(124, 40, 76, 22, '#9a3412');
    fill(16, 36, 32, 10, '#c2410c');
    fill(144, 32, 34, 10, '#c2410c');
    // Deep Valles Marineris shadow gorge
    fill(64, 58, 60, 24, '#451a03');
    // Aerobraking probe plasma arc
    fill(86, 22, 16, 3, '#ffd23f');
    fill(102, 23, 6, 4, '#f8fafc');
    // Blowing Martian dust streaks
    fill((t * 6) % 190, 52, 8, 1, '#fb923c');
    fill((t * 9 + 60) % 190, 62, 10, 1, '#fdba74');
  } else if (backdrop === 'asteroid_belt') {
    // Craggy shaded asteroids + Quantum crystal vein
    const drawRock = (ax: number, ay: number, r: number, hasCrystal: boolean) => {
      fill(ax, ay, r, r - 4, '#334155');
      fill(ax + 3, ay - 3, r - 6, r + 2, '#475569');
      fill(ax + 4, ay, r - 10, r - 6, '#64748b');
      fill(ax + 6, ay + 4, 4, 3, '#1e293b');
      if (hasCrystal) {
        const col = t % 2 === 0 ? '#6ee7a0' : '#4de8ff';
        fill(ax + Math.floor(r / 2), ay + 3, 4, 5, col);
        fill(ax + Math.floor(r / 2) + 1, ay + 1, 2, 2, '#ffffff');
      }
    };
    drawRock(26, 28, 22, false);
    drawRock(86, 30, 34, true);
    drawRock(152, 22, 18, false);
  } else if (backdrop === 'europa_ice') {
    // Massive banded Jupiter dominating upper right sky
    fill(116, 4, 68, 52, '#9a3412');
    fill(116, 12, 68, 7, '#fdba74');
    fill(116, 25, 68, 6, '#fed7aa');
    fill(116, 38, 68, 6, '#ea580c');
    // Great Red Spot
    fill(138, 30, 16, 8, '#dc2626');
    fill(141, 32, 10, 4, '#f87171');
    // Europa icy fractured crust
    fill(0, 58, 200, 32, '#bae6fd');
    fill(0, 66, 200, 24, '#7dd3fc');
    fill(18, 64, 44, 3, '#0284c7');
    fill(104, 70, 56, 3, '#0369a1');
    // Towering Cryo-Plume geyser
    const plumeH = 14 + (t % 5) * 3;
    fill(54, 58 - plumeH, 6, plumeH, '#e0f2fe');
    fill(50, 58 - plumeH, 14, 4, '#ffffff');
  } else if (backdrop === 'titan_haze') {
    // Saturn with crisp diagonal rings
    fill(132, 14, 30, 30, '#fde68a');
    fill(132, 24, 30, 5, '#f59e0b');
    // Rings front & back
    fill(112, 27, 70, 4, '#d97706');
    fill(118, 25, 58, 2, '#fef3c7');
    // Thick orange Titan clouds & Kraken Mare lake
    fill(0, 54, 200, 36, '#d97706');
    fill(0, 64, 200, 26, '#92400e');
    fill(28, 72, 118, 12, '#451a03'); // liquid methane sea
    fill(48, 75, 42, 2, '#f59e0b'); // sheen
  } else if (backdrop === 'neptune_gate') {
    // Deep sapphire Neptune with high-altitude methane clouds
    fill(16, 24, 54, 54, '#1d4ed8');
    fill(24, 30, 38, 42, '#2563eb');
    fill(26, 38, 28, 4, '#93c5fd');
    fill(32, 54, 22, 3, '#e0f2fe');
    // Pioneer-9 golden relay probe & expanding prime-harmonic wave rings
    const px = 142;
    const py = 40;
    const pulse = (t % 6) * 4;
    ctx.strokeStyle = t % 2 === 0 ? '#4de8ff' : '#c084fc';
    ctx.lineWidth = 1;
    ctx.strokeRect(rx(px - 8 - pulse), ry(py - 8 - pulse), rx(16 + pulse * 2), ry(16 + pulse * 2));
    fill(px - 5, py - 5, 10, 10, '#ffd23f');
    fill(px - 14, py - 2, 9, 4, '#4de8ff');
    fill(px + 5, py - 2, 9, 4, '#4de8ff');
    fill(px - 2, py - 10, 4, 5, '#e879f9');
  }
}
