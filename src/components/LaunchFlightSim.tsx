import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Shield,
  Sparkles,
  Bot,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { CHARACTERS } from '../data/characters';
import { MATERIALS, computeRocketStats } from '../data/parts';
import {
  MaterialId,
  MissionDef,
  RocketConfig,
  SaveState,
} from '../types/game';
import { drawPixelRocket } from '../utils/pixelArt';
import { CharacterPortrait, MaterialIcon } from './PixelWidgets';

export interface FlightOutcome {
  success: boolean;
  scienceMultiplier: number;
  collectedPackets: number;
  bonusMaterials: Partial<Record<MaterialId, number>>;
  stageBonus: boolean;
  anomalyNarrative: string;
  anomalyScienceLogic: string;
}

interface LaunchFlightSimProps {
  mission: MissionDef;
  config: RocketConfig;
  save: SaveState;
  onFinish: (outcome: FlightOutcome) => void;
}

type FlightPhase = 'ASCENT' | 'TRANSIT' | 'ANOMALY' | 'ANOMALY_RESULT' | 'CRASHED';

interface SpaceEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  kind: 'hazard' | 'science' | 'material';
  matId?: MaterialId;
  size: number;
}

export const LaunchFlightSim: React.FC<LaunchFlightSimProps> = ({
  mission,
  config,
  save,
  onFinish,
}) => {
  const stats = computeRocketStats(config, mission, save.upgrades);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [phase, setPhase] = useState<FlightPhase>('ASCENT');
  const [countdownText, setCountdownText] = useState('T-3');
  const [timingCursor, setTimingCursor] = useState(0); // 0..100
  const [stageTriggered, setStageTriggered] = useState(false);
  const [stageBonus, setStageBonus] = useState(false);

  // Transit interactive state
  const [hullHp, setHullHp] = useState(3);
  const [shieldsLeft, setShieldsLeft] = useState(stats.shieldCharges);
  const [shieldActiveFrames, setShieldActiveFrames] = useState(0);
  const [packetsCollected, setPacketsCollected] = useState(0);
  const [bonusMats, setBonusMats] = useState<Partial<Record<MaterialId, number>>>({});
  const [transitProgress, setTransitProgress] = useState(0); // 0..100
  const [autoPilot, setAutoPilot] = useState(false);

  // Anomaly resolution state
  const [anomalyResult, setAnomalyResult] = useState<{
    ok: boolean;
    mult: number;
    narrative: string;
    logic: string;
  } | null>(null);

  // Mutable refs for smooth 60fps canvas loop
  const keysRef = useRef<{ up: boolean; down: boolean }>({ up: false, down: false });
  const rocketYRef = useRef(60); // 16..104 in 200x120 canvas
  const hpRef = useRef(3);
  const shieldsRef = useRef(stats.shieldCharges);
  const shieldTimerRef = useRef(0);
  const packetsRef = useRef(0);
  const bonusMatsRef = useRef<Partial<Record<MaterialId, number>>>({});
  const autoPilotRef = useRef(false);
  const stageBonusRef = useRef(false);

  useEffect(() => {
    autoPilotRef.current = autoPilot;
  }, [autoPilot]);

  // Keyboard listeners for Space (Stage Sep), W/S / Arrows (Flight), E (Shield)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keysRef.current.up = true;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keysRef.current.down = true;
      } else if (e.key === ' ' && phase === 'ASCENT' && !stageTriggered) {
        e.preventDefault();
        triggerStageSep();
      } else if ((e.key === 'e' || e.key === 'E' || e.key === ' ') && phase === 'TRANSIT') {
        e.preventDefault();
        triggerShieldPulse();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keysRef.current.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keysRef.current.down = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  });

  const triggerStageSep = () => {
    if (stageTriggered || phase !== 'ASCENT') return;
    setStageTriggered(true);
    const perfect = timingCursor >= 60 && timingCursor <= 86;
    sound.stageSep();
    sound.timingHit(perfect);
    if (perfect) {
      setStageBonus(true);
      stageBonusRef.current = true;
      shieldsRef.current += 1;
      setShieldsLeft(shieldsRef.current);
    }
  };

  const triggerShieldPulse = () => {
    if (phase !== 'TRANSIT') return;
    if (shieldsRef.current <= 0 || shieldTimerRef.current > 0) return;
    shieldsRef.current -= 1;
    setShieldsLeft(shieldsRef.current);
    shieldTimerRef.current = 75;
    setShieldActiveFrames(75);
    sound.shield();
  };

  // PHASE 1: ASCENT CANVAS LOOP
  useEffect(() => {
    if (phase !== 'ASCENT') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 200;
    const H = 120;
    let frame = 0;
    let rafId = 0;
    const smoke: Array<{ x: number; y: number; vx: number; vy: number; life: number }> = [];
    const stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      s: 0.5 + Math.random() * 1.5,
    }));

    // Deterministic reliability roll at Max-Q if unshielded and low reliability
    const catastrophicPadFail = Math.random() > stats.reliability + 0.08;

    const step = () => {
      frame++;
      // Countdown progression
      if (frame === 1) {
        setCountdownText('T-3');
        sound.countdown(false);
      } else if (frame === 30) {
        setCountdownText('T-2');
        sound.countdown(false);
      } else if (frame === 60) {
        setCountdownText('T-1');
        sound.countdown(false);
      } else if (frame === 90) {
        setCountdownText('IGNITION · MAX-Q');
        sound.countdown(true);
        sound.thrusterPulse();
      }

      if (frame >= 90 && frame <= 260) {
        const cursor = Math.min(100, ((frame - 90) / 170) * 100);
        setTimingCursor(cursor);
      }

      // Render sky gradient transition
      const altitude = Math.max(0, frame - 90);
      ctx.fillStyle = altitude > 80 ? '#070614' : '#0f1638';
      ctx.fillRect(0, 0, W, H);

      // Stars scroll down during climb
      ctx.fillStyle = '#e2e8f0';
      stars.forEach((st) => {
        if (frame >= 90) st.y = (st.y + st.s * 1.6) % H;
        ctx.fillRect(Math.floor(st.x), Math.floor(st.y), 1, 1);
      });

      // Launchpad scrolling away
      const padY = 98 + altitude * 1.3;
      if (padY < H + 20) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, Math.floor(padY), W, 30);
        ctx.fillStyle = '#475569';
        ctx.fillRect(72, Math.floor(padY) - 36, 4, 36);
      }

      const rocketY = frame < 90 ? 94 : Math.max(54, 94 - altitude * 0.35);

      // Pad smoke
      if (frame >= 80 && frame < 190) {
        for (let k = 0; k < 2; k++) {
          smoke.push({
            x: 100 + (Math.random() - 0.5) * 10,
            y: rocketY + 4,
            vx: (Math.random() - 0.5) * 1.4,
            vy: 0.6 + Math.random() * 0.8,
            life: 24,
          });
        }
      }
      smoke.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life > 0) {
          ctx.fillStyle = p.life > 12 ? '#e2e8f0' : '#64748b';
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 3, 3);
        }
      });

      if (catastrophicPadFail && frame === 175) {
        sound.explode();
        setPhase('CRASHED');
        return;
      }

      if (frame % 22 === 0 && frame >= 90) sound.thrusterPulse();

      drawPixelRocket(ctx, 100, Math.floor(rocketY), config, frame, {
        thrusting: frame >= 88,
        stageSeparated: stageBonusRef.current || frame > 235,
      });

      if (frame < 275) {
        rafId = requestAnimationFrame(step);
      } else {
        setPhase('TRANSIT');
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [phase, config, stats.reliability]);

  // PHASE 2: INTERACTIVE ORBITAL TRANSIT PILOTING LOOP
  useEffect(() => {
    if (phase !== 'TRANSIT') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 200;
    const H = 120;
    let frame = 0;
    const totalFrames = 620; // ~10.3 seconds of thrilling orbital transit
    let rafId = 0;
    let nextId = 1;

    const entities: SpaceEntity[] = [];
    const stars = Array.from({ length: 48 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      sp: 0.8 + Math.random() * 2.1,
    }));
    const sparks: Array<{ x: number; y: number; vx: number; vy: number; c: string; life: number }> = [];

    const rewardMatKeys = Object.keys(mission.rewards.materials) as MaterialId[];
    const hazardDensity: Record<MissionDef['hazardLevel'], number> = {
      Low: 34,
      Moderate: 27,
      High: 22,
      Severe: 18,
      Extreme: 15,
    };
    const spawnInterval = hazardDensity[mission.hazardLevel];

    const step = () => {
      frame++;
      setTransitProgress(Math.min(100, Math.round((frame / totalFrames) * 100)));

      if (shieldTimerRef.current > 0) {
        shieldTimerRef.current -= 1;
        setShieldActiveFrames(shieldTimerRef.current);
      }

      // Rocket steering
      if (autoPilotRef.current) {
        // Smart AI autopilot dodges nearest hazard & chases nearest science packet
        const nearestHazard = entities
          .filter((e) => e.kind === 'hazard' && e.x > 25 && e.x < 120)
          .sort((a, b) => a.x - b.x)[0];
        const nearestPacket = entities
          .filter((e) => e.kind !== 'hazard' && e.x > 25 && e.x < 140)
          .sort((a, b) => a.x - b.x)[0];

        if (nearestHazard && Math.abs(nearestHazard.y - rocketYRef.current) < 18) {
          rocketYRef.current += nearestHazard.y > rocketYRef.current ? -1.8 : 1.8;
        } else if (nearestPacket) {
          rocketYRef.current += nearestPacket.y > rocketYRef.current ? 1.3 : -1.3;
        }
      } else {
        if (keysRef.current.up) rocketYRef.current -= 1.9;
        if (keysRef.current.down) rocketYRef.current += 1.9;
      }
      rocketYRef.current = Math.max(18, Math.min(H - 16, rocketYRef.current));

      // Spawn hazards & collectibles
      if (frame % spawnInterval === 0 && frame < totalFrames - 60) {
        entities.push({
          id: nextId++,
          x: W + 10,
          y: 16 + Math.random() * (H - 32),
          vx: -(1.9 + Math.random() * 1.3 + mission.id * 0.14),
          kind: 'hazard',
          size: 7,
        });
      }
      if (frame % 48 === 20 && frame < totalFrames - 50) {
        const isMat = Math.random() < 0.35 && rewardMatKeys.length > 0;
        entities.push({
          id: nextId++,
          x: W + 10,
          y: 18 + Math.random() * (H - 36),
          vx: -1.7,
          kind: isMat ? 'material' : 'science',
          matId: isMat ? rewardMatKeys[Math.floor(Math.random() * rewardMatKeys.length)] : undefined,
          size: 6,
        });
      }

      // Draw deep space canvas
      ctx.fillStyle = '#070616';
      ctx.fillRect(0, 0, W, H);

      stars.forEach((st) => {
        st.x -= st.sp;
        if (st.x < 0) {
          st.x = W;
          st.y = Math.random() * H;
        }
        ctx.fillStyle = st.sp > 2 ? '#4de8ff' : '#94a3b8';
        ctx.fillRect(Math.floor(st.x), Math.floor(st.y), st.sp > 2.4 ? 2 : 1, 1);
      });

      // Draw Rocket rotated sideways (horizontal flight representation)
      ctx.save();
      ctx.translate(36, Math.floor(rocketYRef.current));
      ctx.rotate(Math.PI / 2);
      drawPixelRocket(ctx, 0, 6, config, frame, {
        thrusting: true,
        stageSeparated: true,
        shieldActive: shieldTimerRef.current > 0,
      });
      ctx.restore();

      // Update & collide entities
      for (let i = entities.length - 1; i >= 0; i--) {
        const e = entities[i];
        e.x += e.vx;

        if (e.kind === 'hazard') {
          ctx.fillStyle = '#ff5d73';
          ctx.fillRect(Math.floor(e.x - 3), Math.floor(e.y - 3), 7, 7);
          ctx.fillStyle = '#ffd23f';
          ctx.fillRect(Math.floor(e.x - 1), Math.floor(e.y - 1), 3, 3);
        } else if (e.kind === 'science') {
          ctx.fillStyle = '#4de8ff';
          ctx.fillRect(Math.floor(e.x - 3), Math.floor(e.y - 3), 6, 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(Math.floor(e.x - 1), Math.floor(e.y - 1), 2, 2);
        } else {
          ctx.fillStyle = '#6ee7a0';
          ctx.fillRect(Math.floor(e.x - 3), Math.floor(e.y - 3), 7, 7);
          ctx.fillStyle = '#ffd23f';
          ctx.fillRect(Math.floor(e.x - 1), Math.floor(e.y - 1), 3, 3);
        }

        // Collision box with rocket at x=36, y=rocketYRef
        const hit = Math.abs(e.x - 36) < 11 && Math.abs(e.y - rocketYRef.current) < 10;
        if (hit) {
          if (e.kind === 'hazard') {
            if (shieldTimerRef.current > 0) {
              sound.shield();
              for (let s = 0; s < 10; s++) {
                sparks.push({
                  x: e.x,
                  y: e.y,
                  vx: (Math.random() - 0.5) * 3,
                  vy: (Math.random() - 0.5) * 3,
                  c: '#4de8ff',
                  life: 16,
                });
              }
            } else if (shieldsRef.current > 0) {
              // Auto-consume 1 shield charge as protective buffer!
              shieldsRef.current -= 1;
              setShieldsLeft(shieldsRef.current);
              shieldTimerRef.current = 40;
              setShieldActiveFrames(40);
              sound.shield();
            } else {
              hpRef.current -= 1;
              setHullHp(hpRef.current);
              sound.hit();
              for (let s = 0; s < 14; s++) {
                sparks.push({
                  x: 36,
                  y: rocketYRef.current,
                  vx: (Math.random() - 0.5) * 3.2,
                  vy: (Math.random() - 0.5) * 3.2,
                  c: '#ff5d73',
                  life: 20,
                });
              }
              if (hpRef.current <= 0) {
                sound.explode();
                setPhase('CRASHED');
                return;
              }
            }
          } else if (e.kind === 'science') {
            packetsRef.current += 1;
            setPacketsCollected(packetsRef.current);
            sound.collect();
            for (let s = 0; s < 8; s++) {
              sparks.push({
                x: e.x,
                y: e.y,
                vx: (Math.random() - 0.5) * 2.5,
                vy: (Math.random() - 0.5) * 2.5,
                c: '#4de8ff',
                life: 14,
              });
            }
          } else if (e.kind === 'material' && e.matId) {
            const mId = e.matId;
            bonusMatsRef.current = {
              ...bonusMatsRef.current,
              [mId]: (bonusMatsRef.current[mId] || 0) + 1,
            };
            setBonusMats({ ...bonusMatsRef.current });
            sound.collect();
          }
          entities.splice(i, 1);
          continue;
        }

        if (e.x < -12) entities.splice(i, 1);
      }

      // Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life--;
        if (sp.life <= 0) {
          sparks.splice(i, 1);
        } else {
          ctx.fillStyle = sp.c;
          ctx.fillRect(Math.floor(sp.x), Math.floor(sp.y), 2, 2);
        }
      }

      if (frame < totalFrames) {
        rafId = requestAnimationFrame(step);
      } else {
        sound.alertBeep();
        setPhase('ANOMALY');
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [phase, config, mission]);

  const computeChoiceProb = (choiceIdx: 0 | 1) => {
    const c = mission.anomaly.choices[choiceIdx];
    if (c.safeMode) return 1;
    let p = c.baseSuccessProb + save.upgrades.quantum * 0.04;
    if (c.bonusSource === 'shield' && config.shieldId) p += 0.18;
    if (c.bonusSource === 'power' && stats.powerNet >= 80) p += 0.16;
    if (c.bonusSource === 'dv' && stats.deltaV >= mission.reqDeltaV + 1.2) p += 0.16;
    if (c.bonusSource === 'radar' && config.instrumentIds.includes('inst_radar')) p += 0.18;
    return Math.min(0.95, p);
  };

  const resolveAnomaly = (choiceIdx: 0 | 1) => {
    sound.click();
    const choice = mission.anomaly.choices[choiceIdx];
    const prob = computeChoiceProb(choiceIdx);
    const ok = Math.random() <= prob;
    const baseMult = ok ? choice.successSciMult : choice.failSciMult;
    const packetBonus = Math.min(0.45, packetsRef.current * 0.08);
    const sepBonus = stageBonusRef.current ? 0.15 : 0;
    const finalMult = Number((baseMult + packetBonus + sepBonus).toFixed(2));

    if (ok) sound.collect();
    else sound.hit();

    setAnomalyResult({
      ok,
      mult: finalMult,
      narrative: ok ? choice.successNarrative : choice.failNarrative,
      logic: choice.scienceLogic,
    });
    setPhase('ANOMALY_RESULT');
  };

  const speakerChar = CHARACTERS[mission.anomaly.speaker];

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 space-y-5">
      {/* Flight Header */}
      <div className="pixel-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-mono-tech text-xs text-[#4de8ff]">
            ACTIVE MISSION · {mission.code} · {mission.destination}
          </div>
          <h2 className="font-pixel text-sm text-[#ffd23f] mt-1">
            {phase === 'ASCENT' && `LAUNCH PAD ALPHA — ${countdownText}`}
            {phase === 'TRANSIT' && `ORBITAL TRANSIT — ${transitProgress}%`}
            {(phase === 'ANOMALY' || phase === 'ANOMALY_RESULT') && `ORBITAL ANOMALY — ${mission.anomaly.title}`}
            {phase === 'CRASHED' && 'CRITICAL STRUCTURAL FAILURE'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4 font-mono-tech text-xs">
          <span className="text-[#6ee7a0]">Hull HP: {hullHp}/3</span>
          <span className="text-[#4de8ff]">Shields: {shieldsLeft}</span>
          <span className="text-[#ffd23f]">Data Packets: +{packetsCollected}</span>
        </div>
      </div>

      {/* PHASE 1 & 2 CANVAS */}
      {(phase === 'ASCENT' || phase === 'TRANSIT') && (
        <div className="pixel-panel-elevated p-4 space-y-4">
          <canvas
            ref={canvasRef}
            width={200}
            height={120}
            className="w-full h-72 sm:h-96 pixelated block bg-[#070616] border-2 border-[#453ea8]"
          />

          {/* Ascent Stage Separation Minigame */}
          {phase === 'ASCENT' && (
            <div className="bg-[#0e0c24] border-2 border-[#352f78] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-pixel text-[10px] text-[#ffd23f]">
                    MAX-Q STAGE SEPARATION WINDOW
                  </div>
                  <p className="font-body text-xs text-[#c8c4eb] mt-0.5">
                    Press SPACE or click SEPARATE inside the green zone (60–86%) for +15% Science & +1 Shield!
                  </p>
                </div>
                <button
                  type="button"
                  disabled={stageTriggered || timingCursor === 0}
                  onClick={triggerStageSep}
                  className="pixel-btn bg-[#6ee7a0] text-[#091c13] px-5 py-2.5 text-[10px] flex items-center gap-2 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>
                    {stageTriggered
                      ? stageBonus
                        ? 'PERFECT SEPARATION!'
                        : 'SEPARATED'
                      : 'SEPARATE STAGE'}
                  </span>
                </button>
              </div>

              <div className="relative h-6 bg-[#07051a] border-2 border-[#453ea8] overflow-hidden">
                {/* Green sweet spot 60%..86% */}
                <div
                  className="absolute top-0 bottom-0 bg-[#6ee7a0]/35 border-x-2 border-[#6ee7a0]"
                  style={{ left: '60%', width: '26%' }}
                />
                {/* Moving cursor */}
                <div
                  className="absolute top-0 bottom-0 w-2 bg-[#ffd23f]"
                  style={{ left: `${timingCursor}%` }}
                />
              </div>
            </div>
          )}

          {/* Transit Piloting Controls */}
          {phase === 'TRANSIT' && (
            <div className="bg-[#0e0c24] border-2 border-[#352f78] p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onMouseDown={() => (keysRef.current.up = true)}
                  onMouseUp={() => (keysRef.current.up = false)}
                  onMouseLeave={() => (keysRef.current.up = false)}
                  onTouchStart={() => (keysRef.current.up = true)}
                  onTouchEnd={() => (keysRef.current.up = false)}
                  className="pixel-btn-secondary px-4 py-2.5 text-[10px] flex items-center gap-1.5 cursor-pointer select-none"
                >
                  <ArrowUp className="w-4 h-4 text-[#4de8ff]" />
                  <span>THRUST UP (W)</span>
                </button>
                <button
                  type="button"
                  onMouseDown={() => (keysRef.current.down = true)}
                  onMouseUp={() => (keysRef.current.down = false)}
                  onMouseLeave={() => (keysRef.current.down = false)}
                  onTouchStart={() => (keysRef.current.down = true)}
                  onTouchEnd={() => (keysRef.current.down = false)}
                  className="pixel-btn-secondary px-4 py-2.5 text-[10px] flex items-center gap-1.5 cursor-pointer select-none"
                >
                  <ArrowDown className="w-4 h-4 text-[#4de8ff]" />
                  <span>THRUST DOWN (S)</span>
                </button>
                <button
                  type="button"
                  disabled={shieldsLeft <= 0 || shieldActiveFrames > 0}
                  onClick={triggerShieldPulse}
                  className="pixel-btn bg-[#4de8ff] text-[#071626] px-4 py-2.5 text-[10px] flex items-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>SHIELD PULSE (E)</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {Object.keys(bonusMats).length > 0 && (
                  <div className="flex items-center gap-2 font-mono-tech text-xs text-[#6ee7a0]">
                    <span>Salvaged:</span>
                    {(Object.keys(bonusMats) as MaterialId[]).map((m) => (
                      <span key={m} className="inline-flex items-center gap-1">
                        <MaterialIcon matId={m} size={14} />+{bonusMats[m]}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    sound.click();
                    setAutoPilot((a) => !a);
                  }}
                  className={`pixel-btn-secondary px-3 py-2 text-[10px] flex items-center gap-1.5 cursor-pointer ${
                    autoPilot ? 'border-[#6ee7a0] text-[#6ee7a0]' : ''
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{autoPilot ? 'AUTOPILOT ON' : 'AUTOPILOT'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHASE 3: ANOMALY ENCOUNTER */}
      {phase === 'ANOMALY' && (
        <div className="pixel-panel-elevated p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <CharacterPortrait charId={speakerChar.id} expression="alert" isTalking size={84} />
            <div className="space-y-2">
              <div className="font-pixel text-xs" style={{ color: speakerChar.accentColor }}>
                {speakerChar.name} · TACTICAL ALERT
              </div>
              <p className="font-body text-base sm:text-lg text-white leading-relaxed">
                {mission.anomaly.prompt}
              </p>
              <div className="bg-[#0b132b] border border-[#2a3f78] px-3 py-2 font-body text-xs text-[#4de8ff]">
                <strong>Orbital Logic:</strong> {mission.anomaly.scienceContext}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mission.anomaly.choices.map((ch, idx) => {
              const probPct = Math.round(computeChoiceProb(idx as 0 | 1) * 100);
              return (
                <button
                  key={ch.label}
                  type="button"
                  onClick={() => resolveAnomaly(idx as 0 | 1)}
                  className={`text-left p-4 border-2 cursor-pointer transition-colors ${
                    ch.safeMode
                      ? 'bg-[#12263a] border-[#4de8ff] hover:bg-[#18344f]'
                      : 'bg-[#2a1936] border-[#ffd23f] hover:bg-[#3b224d]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-pixel text-xs text-white">{ch.label}</span>
                    <span
                      className={`font-mono-tech text-xs ${
                        ch.safeMode ? 'text-[#6ee7a0]' : 'text-[#ffd23f]'
                      }`}
                    >
                      {probPct}% Odds
                    </span>
                  </div>
                  <p className="font-mono-tech text-xs text-[#c8c4eb] mt-2">{ch.sublabel}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ANOMALY RESULT */}
      {phase === 'ANOMALY_RESULT' && anomalyResult && (
        <div className="pixel-panel-elevated p-6 space-y-4">
          <div className="flex items-center gap-2 font-pixel text-xs text-[#ffd23f]">
            <Sparkles className="w-4 h-4 text-[#6ee7a0]" />
            <span>{anomalyResult.ok ? 'MANEUVER SUCCEEDED' : 'MANEUVER DEGRADED'}</span>
          </div>
          <p className="font-body text-base text-white">{anomalyResult.narrative}</p>
          <div className="bg-[#0e152d] border border-[#354c8c] p-3 font-body text-sm text-[#4de8ff]">
            <strong>Science Debrief:</strong> {anomalyResult.logic}
          </div>
          <div className="font-mono-tech text-xs text-[#6ee7a0]">
            Final Science Multiplier: ×{anomalyResult.mult} (Includes +{packetsCollected} Data Packets
            {stageBonus ? ' & +15% Stage Separation Bonus' : ''})
          </div>
          <button
            type="button"
            onClick={() => {
              sound.click();
              onFinish({
                success: true,
                scienceMultiplier: anomalyResult.mult,
                collectedPackets: packetsCollected,
                bonusMaterials: bonusMats,
                stageBonus,
                anomalyNarrative: anomalyResult.narrative,
                anomalyScienceLogic: anomalyResult.logic,
              });
            }}
            className="pixel-btn bg-[#ffd23f] text-[#140e29] px-6 py-3 text-xs cursor-pointer"
          >
            PROCEED TO MISSION DEBRIEF
          </button>
        </div>
      )}

      {/* CRASHED STATE */}
      {phase === 'CRASHED' && (
        <div className="pixel-panel-elevated p-6 border-[#ff5d73] space-y-4">
          <div className="flex items-center gap-2 font-pixel text-sm text-[#ff5d73]">
            <AlertTriangle className="w-5 h-5" />
            <span>MISSION LOST IN TRANSIT</span>
          </div>
          <p className="font-body text-base text-[#e2e0f5]">
            Hull integrity collapsed under orbital stress. Garuda recovery drones salvaged emergency scrap telemetry. Equip stronger Shielding or upgrade Exo-Foundry Metallurgy before retrying!
          </p>
          <button
            type="button"
            onClick={() => {
              sound.click();
              onFinish({
                success: false,
                scienceMultiplier: 0,
                collectedPackets: packetsCollected,
                bonusMaterials: bonusMats,
                stageBonus,
                anomalyNarrative: 'Vessel lost during orbital hazard transit.',
                anomalyScienceLogic:
                  'Cryo-Silica and Faraday Shielding absorb micrometeorite kinetic energy and deflect solar ion bursts.',
              });
            }}
            className="pixel-btn bg-[#ff5d73] text-white px-6 py-3 text-xs cursor-pointer"
          >
            VIEW FAILURE REPORT
          </button>
        </div>
      )}
    </div>
  );
};
