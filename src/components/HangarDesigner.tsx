import React, { useEffect, useRef, useState } from 'react';
import {
  Rocket,
  ArrowLeft,
  Info,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';
import {
  ENGINES,
  HULLS,
  INSTRUMENTS,
  SHIELDS,
  computeRocketStats,
} from '../data/parts';
import { MissionDef, RocketConfig, SaveState } from '../types/game';
import { drawPixelRocket } from '../utils/pixelArt';
import { CharacterPortrait } from './PixelWidgets';

interface HangarDesignerProps {
  mission: MissionDef;
  save: SaveState;
  config: RocketConfig;
  onChangeConfig: (next: RocketConfig) => void;
  onLaunch: () => void;
  onBack: () => void;
}

export const HangarDesigner: React.FC<HangarDesignerProps> = ({
  mission,
  save,
  config,
  onChangeConfig,
  onLaunch,
  onBack,
}) => {
  const [showScienceInfo, setShowScienceInfo] = useState(false);
  const previewRef = useRef<HTMLCanvasElement | null>(null);

  const stats = computeRocketStats(config, mission, save.upgrades);
  const selectedHull = HULLS.find((h) => h.id === config.hullId) || HULLS[0];
  const selectedEngine = ENGINES.find((e) => e.id === config.engineId) || ENGINES[0];

  const isPartUnlocked = (part: {
    unlockMission?: number;
    unlockUpgrade?: { id: keyof SaveState['upgrades']; level: number };
  }) => {
    if (part.unlockMission !== undefined && save.missionStars[part.unlockMission - 1] === 0 && part.unlockMission > 0) {
      // Unlock mission N means clearing mission N-1 or reaching mission N
      // Allow unlocked if player has unlocked mission index `part.unlockMission`
      const unlockedMission = save.missionStars[part.unlockMission - 1] > 0;
      if (!unlockedMission) return false;
    }
    if (part.unlockUpgrade) {
      if ((save.upgrades[part.unlockUpgrade.id] || 0) < part.unlockUpgrade.level) {
        return false;
      }
    }
    return true;
  };

  // Animated Live Rocket Blueprint Canvas
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let rafId = 0;

    const render = () => {
      frame++;
      ctx.fillStyle = '#070818';
      ctx.fillRect(0, 0, 96, 96);

      // Blueprint pixel grid
      ctx.fillStyle = '#14193d';
      for (let x = 0; x < 96; x += 8) ctx.fillRect(x, 0, 1, 96);
      for (let y = 0; y < 96; y += 8) ctx.fillRect(0, y, 96, 1);

      // Launchpad gantry silhouette
      ctx.fillStyle = '#2d3561';
      ctx.fillRect(24, 24, 4, 58);
      ctx.fillRect(28, 36, 10, 2);
      ctx.fillRect(28, 56, 10, 2);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(10, 82, 76, 14);

      drawPixelRocket(ctx, 50, 74, config, frame, {
        thrusting: stats.canLaunch,
        shieldActive: Boolean(config.shieldId) && frame % 36 < 16,
      });

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [config, stats.canLaunch]);

  const toggleInstrument = (id: string) => {
    const exists = config.instrumentIds.includes(id);
    if (exists) {
      sound.unequip();
      onChangeConfig({
        ...config,
        instrumentIds: config.instrumentIds.filter((x) => x !== id),
      });
    } else {
      if (config.instrumentIds.length >= selectedHull.maxInstruments) {
        sound.alertBeep();
        return;
      }
      sound.equip();
      onChangeConfig({
        ...config,
        instrumentIds: [...config.instrumentIds, id],
      });
    }
  };

  const renderGauge = (
    label: string,
    value: number,
    target: number,
    unit: string,
    invertCheck = false
  ) => {
    const ok = invertCheck ? value <= target : value >= target;
    const pct = Math.min(100, Math.max(4, (value / Math.max(0.1, target)) * 100));
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between font-mono-tech text-xs">
          <span className="text-[#c8c4eb]">{label}</span>
          <span className={ok ? 'text-[#6ee7a0]' : 'text-[#ff5d73]'}>
            {value} / {target} {unit}
          </span>
        </div>
        <div className="h-2.5 bg-[#090814] border border-[#352f78]">
          <div
            className={`h-full transition-all duration-200 ${
              ok ? 'bg-[#6ee7a0]' : 'bg-[#ff5d73]'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Top Mission Header */}
      <div className="pixel-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-mono-tech text-xs text-[#4de8ff]">
            ASSEMBLY HANGAR · {mission.code} · {mission.destination}
          </div>
          <h2 className="font-pixel text-sm sm:text-base text-[#ffd23f] mt-1">
            {mission.name}: {mission.targetType}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sound.click();
              setShowScienceInfo((s) => !s);
            }}
            className={`pixel-btn-secondary px-3.5 py-2 text-[10px] flex items-center gap-1.5 cursor-pointer ${
              showScienceInfo ? 'border-[#ffd23f] text-[#ffd23f]' : ''
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showScienceInfo ? 'HIDE PHYSICS' : 'PHYSICS LOGIC'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.click();
              onBack();
            }}
            className="pixel-btn-secondary px-3.5 py-2 text-[10px] flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>HUB</span>
          </button>
        </div>
      </div>

      {/* Collapsible Scientific Logic Panel */}
      {showScienceInfo && (
        <div className="pixel-panel p-5 bg-[#101836] border-[#4de8ff] grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="font-pixel text-[10px] text-[#ffd23f] mb-1">TSIOLKOVSKY DELTA-V</div>
            <p className="font-mono-tech text-xs text-[#4de8ff] mb-1">
              Δv = Isp × 9.81 × ln(WetMass / DryMass)
            </p>
            <p className="font-body text-xs text-[#e2e0f5]">
              Current ratio: {stats.wetMass}t / {stats.dryMass}t ={' '}
              {(stats.wetMass / Math.max(1, stats.dryMass)).toFixed(2)}. Adding heavy sensors lowers Δv; higher Isp engines or lighter Exo-Foundry hulls raise it!
            </p>
          </div>
          <div>
            <div className="font-pixel text-[10px] text-[#6ee7a0] mb-1">THRUST-TO-WEIGHT (TWR)</div>
            <p className="font-mono-tech text-xs text-[#4de8ff] mb-1">
              TWR = {selectedEngine.thrustKN} kN / ({stats.wetMass}t × 9.81) = {stats.twr}
            </p>
            <p className="font-body text-xs text-[#e2e0f5]">
              You need TWR ≥ {mission.reqTWR} to clear gravity drag at liftoff. Heavy hulls demand stronger engines.
            </p>
          </div>
          <div>
            <div className="font-pixel text-[10px] text-[#c084fc] mb-1">ORBITAL BRIEFING</div>
            <p className="font-body text-xs text-[#e2e0f5]">{mission.orbitalLogic}</p>
          </div>
        </div>
      )}

      {/* Main Two-Column Assembly Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Blueprint Preview, Telemetry & Launch CTA */}
        <div className="lg:col-span-5 space-y-4">
          <div className="pixel-panel-elevated p-4 flex flex-col sm:flex-row lg:flex-col items-center gap-4">
            <canvas
              ref={previewRef}
              width={96}
              height={96}
              className="w-52 h-52 pixelated border-2 border-[#453ea8] bg-[#070818] shrink-0"
            />
            <div className="w-full space-y-3">
              {renderGauge('BUDGET', stats.totalCost, stats.budgetLimit, 'CR', true)}
              {renderGauge('DELTA-V (Δv)', stats.deltaV, mission.reqDeltaV, 'km/s')}
              {renderGauge('TWR (LIFTOFF)', stats.twr, mission.reqTWR, '')}
              {renderGauge('SCIENCE YIELD', stats.scienceOutput, mission.reqScience, 'pts')}

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#2a2560] font-mono-tech text-xs text-center">
                <div className="bg-[#0b091c] p-2 border border-[#2a2560]">
                  <div className="text-[10px] text-[#9a94d6]">POWER</div>
                  <div className={stats.powerNet >= 0 ? 'text-[#6ee7a0]' : 'text-[#ff5d73]'}>
                    {stats.powerNet >= 0 ? `+${stats.powerNet}W` : `${stats.powerNet}W`}
                  </div>
                </div>
                <div className="bg-[#0b091c] p-2 border border-[#2a2560]">
                  <div className="text-[10px] text-[#9a94d6]">SURVIVAL</div>
                  <div className="text-[#4de8ff]">{Math.round(stats.reliability * 100)}%</div>
                </div>
                <div className="bg-[#0b091c] p-2 border border-[#2a2560]">
                  <div className="text-[10px] text-[#9a94d6]">SHIELDS</div>
                  <div className="text-[#ffd23f]">{stats.shieldCharges} chg</div>
                </div>
              </div>
            </div>
          </div>

          {/* NOVA Advisor Strip */}
          <div className="pixel-panel p-4 flex items-start gap-3">
            <CharacterPortrait
              charId="N"
              expression={stats.canLaunch ? 'happy' : 'alert'}
              size={54}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-pixel text-[10px] text-[#4de8ff]">
                {stats.canLaunch ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6ee7a0]" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-[#ff5d73]" />
                )}
                <span>NOVA ENGINEERING CHECK</span>
              </div>
              <p className="font-body text-sm text-[#e2e0f5] leading-snug">{stats.novaTip}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={!stats.canLaunch}
            onClick={() => {
              sound.unlock();
              sound.click();
              onLaunch();
            }}
            className="pixel-btn w-full bg-[#ffd23f] text-[#140e29] py-4 px-6 text-xs sm:text-sm flex items-center justify-center gap-3 cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            <span>INITIATE LAUNCH SEQUENCE</span>
          </button>
        </div>

        {/* Right Column: Hardware Selection */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. HULL FRAME */}
          <div className="pixel-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-pixel text-xs text-[#4de8ff]">1. AIRFRAME & FUEL TANKAGE</h3>
              <span className="font-mono-tech text-xs text-[#9a94d6]">
                Slots: {config.instrumentIds.length}/{selectedHull.maxInstruments} Instruments
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {HULLS.map((hull) => {
                const unlocked = isPartUnlocked(hull);
                const active = config.hullId === hull.id;
                return (
                  <button
                    key={hull.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => {
                      sound.equip();
                      const trimmed = config.instrumentIds.slice(0, hull.maxInstruments);
                      onChangeConfig({ ...config, hullId: hull.id, instrumentIds: trimmed });
                    }}
                    className={`text-left p-3 border-2 transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#2b2563] border-[#ffd23f]'
                        : unlocked
                        ? 'bg-[#0e0c24] border-[#352f78] hover:border-[#4de8ff]'
                        : 'bg-[#090814] border-[#25214d] opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-pixel text-[10px] text-white">{hull.name}</span>
                      <span className="font-mono-tech text-xs text-[#ffd23f]">{hull.cost} CR</span>
                    </div>
                    <div className="font-mono-tech text-[11px] text-[#4de8ff] mt-1">
                      Fuel {hull.fuelCapacity}t · Dry {hull.massTons}t · +{hull.powerGen}W · {hull.maxInstruments} slots
                    </div>
                    <div className="font-body text-xs text-[#c8c4eb] mt-1">
                      {unlocked
                        ? hull.scienceNote
                        : hull.unlockUpgrade
                        ? `Requires Foundry ${hull.unlockUpgrade.id} Lv${hull.unlockUpgrade.level}`
                        : `Unlocks after Mission 0${hull.unlockMission}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. ENGINE */}
          <div className="pixel-panel p-4 space-y-3">
            <h3 className="font-pixel text-xs text-[#4de8ff]">2. PROPULSION STAGE</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ENGINES.map((eng) => {
                const unlocked = isPartUnlocked(eng);
                const active = config.engineId === eng.id;
                return (
                  <button
                    key={eng.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => {
                      sound.equip();
                      onChangeConfig({ ...config, engineId: eng.id });
                    }}
                    className={`text-left p-3 border-2 transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#2b2563] border-[#ffd23f]'
                        : unlocked
                        ? 'bg-[#0e0c24] border-[#352f78] hover:border-[#4de8ff]'
                        : 'bg-[#090814] border-[#25214d] opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-pixel text-[10px] text-white">{eng.name}</span>
                      <span className="font-mono-tech text-xs text-[#ffd23f]">{eng.cost} CR</span>
                    </div>
                    <div className="font-mono-tech text-[11px] text-[#6ee7a0] mt-1">
                      {eng.thrustKN} kN · Isp {eng.isp}s · -{eng.powerDraw}W · {eng.massTons}t
                    </div>
                    <div className="font-body text-xs text-[#c8c4eb] mt-1">
                      {unlocked
                        ? eng.scienceNote
                        : eng.unlockUpgrade
                        ? `Requires Foundry ${eng.unlockUpgrade.id} Lv${eng.unlockUpgrade.level}`
                        : `Unlocks after Mission 0${eng.unlockMission}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. SCIENCE INSTRUMENTS */}
          <div className="pixel-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-pixel text-xs text-[#4de8ff]">3. SCIENTIFIC PAYLOADS</h3>
              <span className="font-mono-tech text-xs text-[#6ee7a0]">
                Recommended: {mission.recommendedTag.toUpperCase()} (+25% bonus)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INSTRUMENTS.map((inst) => {
                const unlocked = isPartUnlocked(inst);
                const active = config.instrumentIds.includes(inst.id);
                const isSynergy = inst.specialtyTag === mission.recommendedTag;
                return (
                  <button
                    key={inst.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => toggleInstrument(inst.id)}
                    className={`text-left p-3 border-2 transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#193347] border-[#6ee7a0]'
                        : unlocked
                        ? 'bg-[#0e0c24] border-[#352f78] hover:border-[#4de8ff]'
                        : 'bg-[#090814] border-[#25214d] opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-pixel text-[10px] text-white flex items-center gap-1.5">
                        {!unlocked && <Lock className="w-3 h-3" />}
                        {inst.name}
                      </span>
                      <span className="font-mono-tech text-xs text-[#ffd23f]">{inst.cost} CR</span>
                    </div>
                    <div className="font-mono-tech text-[11px] text-[#4de8ff] mt-1">
                      +{inst.scienceBase} Sci {isSynergy ? '(+25% Synergy!)' : ''} · -{inst.powerDraw}W · {inst.massTons}t
                    </div>
                    <div className="font-body text-xs text-[#c8c4eb] mt-1">
                      {unlocked
                        ? inst.scienceNote
                        : inst.unlockUpgrade
                        ? `Requires Foundry ${inst.unlockUpgrade.id} Lv${inst.unlockUpgrade.level}`
                        : `Unlocks after Mission 0${inst.unlockMission}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. SHIELDING */}
          <div className="pixel-panel p-4 space-y-3">
            <h3 className="font-pixel text-xs text-[#4de8ff]">4. RADIATION & THERMAL SHIELDING</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SHIELDS.map((shd) => {
                const unlocked = isPartUnlocked(shd);
                const active = config.shieldId === shd.id;
                return (
                  <button
                    key={shd.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => {
                      if (active) {
                        sound.unequip();
                        onChangeConfig({ ...config, shieldId: null });
                      } else {
                        sound.equip();
                        onChangeConfig({ ...config, shieldId: shd.id });
                      }
                    }}
                    className={`text-left p-3 border-2 transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#20304d] border-[#4de8ff]'
                        : unlocked
                        ? 'bg-[#0e0c24] border-[#352f78] hover:border-[#4de8ff]'
                        : 'bg-[#090814] border-[#25214d] opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-pixel text-[9px] text-white">{shd.name}</span>
                      <span className="font-mono-tech text-xs text-[#ffd23f]">{shd.cost} CR</span>
                    </div>
                    <div className="font-mono-tech text-[11px] text-[#6ee7a0] mt-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      +{Math.round(shd.hazardResist * 100)}% Rel · {shd.shieldCharges} Flight Shields
                    </div>
                    <div className="font-body text-xs text-[#c8c4eb] mt-1">
                      {unlocked
                        ? shd.description
                        : `Requires Foundry ${shd.unlockUpgrade?.id} Lv${shd.unlockUpgrade?.level}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
