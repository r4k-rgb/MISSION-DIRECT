import React, { useState } from 'react';
import {
  Rocket,
  FlaskConical,
  Users,
  BookOpen,
  Star,
  Lock,
  ShieldAlert,
  ArrowUpCircle,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { CHARACTERS } from '../data/characters';
import { MISSIONS } from '../data/missions';
import { MATERIALS, UPGRADES } from '../data/parts';
import { CharacterId, MaterialId, SaveState, UpgradeId } from '../types/game';
import { CharacterPortrait, MaterialIcon } from './PixelWidgets';

interface MissionHubProps {
  save: SaveState;
  onSelectMission: (missionIndex: number) => void;
  onBuyUpgrade: (upgradeId: UpgradeId) => void;
  onOpenCodex: () => void;
  onBackTitle: () => void;
}

type HubTab = 'missions' | 'foundry' | 'crew';

const MATERIAL_ORDER: MaterialId[] = ['ti', 'he3', 'si', 'xe', 'qc'];
const ROSTER_ORDER: CharacterId[] = ['N', 'R', 'B', 'T', 'O', 'V', 'S'];

export const MissionHub: React.FC<MissionHubProps> = ({
  save,
  onSelectMission,
  onBuyUpgrade,
  onOpenCodex,
  onBackTitle,
}) => {
  const [tab, setTab] = useState<HubTab>('missions');
  const totalStars = save.missionStars.reduce((a, b) => a + b, 0);

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Resource & Campaign Telemetry Bar */}
      <div className="pixel-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          <div>
            <div className="font-mono-tech text-[11px] text-[#9a94d6]">CREDITS</div>
            <div className="font-pixel text-sm text-[#ffd23f] tabular-nums">{save.credits} CR</div>
          </div>
          <div className="h-8 w-[2px] bg-[#2a2560] hidden sm:block" />
          <div className="flex flex-wrap items-center gap-4">
            {MATERIAL_ORDER.map((matId) => {
              const mat = MATERIALS[matId];
              return (
                <div
                  key={matId}
                  className="flex items-center gap-2"
                  title={`${mat.name}: ${mat.description}`}
                >
                  <MaterialIcon matId={matId} size={22} />
                  <div>
                    <div className="font-mono-tech text-[10px] text-[#9a94d6] leading-none">
                      {mat.symbol}
                    </div>
                    <div className="font-pixel text-xs text-white tabular-nums">
                      {save.materials[matId] || 0}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 font-mono-tech text-xs">
          <div className="flex items-center gap-1.5 text-[#ffd23f]">
            <Star className="w-4 h-4 fill-[#ffd23f]" />
            <span>
              {totalStars} / {MISSIONS.length * 3} Stars
            </span>
          </div>
          <span aria-hidden="true" className="text-[#453ea8]">
            ·
          </span>
          <div className="text-[#6ee7a0]">Streak: {save.streak}</div>
        </div>
      </div>

      {/* Navigation Tabs + Codex */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sound.click();
              setTab('missions');
            }}
            className={`px-4 py-2.5 font-pixel text-[10px] flex items-center gap-2 border-2 cursor-pointer transition-colors ${
              tab === 'missions'
                ? 'bg-[#2f2a66] border-[#ffd23f] text-[#ffd23f]'
                : 'bg-[#14122d] border-[#453ea8] text-[#c8c4eb] hover:border-[#4de8ff]'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>MISSIONS ({save.missionsCompleted}/8)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.click();
              setTab('foundry');
            }}
            className={`px-4 py-2.5 font-pixel text-[10px] flex items-center gap-2 border-2 cursor-pointer transition-colors ${
              tab === 'foundry'
                ? 'bg-[#2f2a66] border-[#6ee7a0] text-[#6ee7a0]'
                : 'bg-[#14122d] border-[#453ea8] text-[#c8c4eb] hover:border-[#4de8ff]'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>EXO-FOUNDRY LAB</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.click();
              setTab('crew');
            }}
            className={`px-4 py-2.5 font-pixel text-[10px] flex items-center gap-2 border-2 cursor-pointer transition-colors ${
              tab === 'crew'
                ? 'bg-[#2f2a66] border-[#4de8ff] text-[#4de8ff]'
                : 'bg-[#14122d] border-[#453ea8] text-[#c8c4eb] hover:border-[#4de8ff]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>CREW ROSTER</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sound.click();
              onOpenCodex();
            }}
            className="pixel-btn-secondary px-3.5 py-2 text-[10px] flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#4de8ff]" />
            <span>CODEX</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.click();
              onBackTitle();
            }}
            className="pixel-btn-secondary px-3.5 py-2 text-[10px] cursor-pointer"
          >
            TITLE
          </button>
        </div>
      </div>

      {/* TAB 1: SOLAR MISSIONS */}
      {tab === 'missions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MISSIONS.map((m, idx) => {
            const unlocked = idx === 0 || save.missionStars[idx - 1] > 0;
            const stars = save.missionStars[idx] || 0;
            const effectiveBudget = m.budget + save.upgrades.budget * 15;

            return (
              <div
                key={m.id}
                className={`pixel-panel p-5 flex flex-col justify-between gap-4 transition-colors ${
                  unlocked ? 'hover:border-[#4de8ff]' : 'opacity-55'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono-tech text-xs text-[#4de8ff]">
                        {m.code} · {m.destination}
                      </div>
                      <h3 className="font-pixel text-sm text-[#ffd23f] mt-1">
                        {m.name}
                      </h3>
                      <div className="font-body text-sm text-[#c8c4eb]">{m.targetType}</div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0" aria-label={`${stars} of 3 stars`}>
                      {[0, 1, 2].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s < stars ? 'text-[#ffd23f] fill-[#ffd23f]' : 'text-[#352f78]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="font-body text-sm text-[#e2e0f5] leading-snug">
                    {m.scienceBrief}
                  </p>

                  {/* Mission Targets */}
                  <div className="grid grid-cols-4 gap-2 bg-[#0b091c] border border-[#2a2560] p-2.5 font-mono-tech text-xs">
                    <div>
                      <div className="text-[10px] text-[#9a94d6]">BUDGET</div>
                      <div className="text-[#ffd23f]">{effectiveBudget} CR</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#9a94d6]">MIN Δv</div>
                      <div className="text-[#4de8ff]">{m.reqDeltaV}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#9a94d6]">MIN TWR</div>
                      <div className="text-white">{m.reqTWR}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#9a94d6]">SCIENCE</div>
                      <div className="text-[#6ee7a0]">{m.reqScience}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tech">
                    <span className="flex items-center gap-1.5 text-[#ff8fa3]">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {m.hazardLevel}: {m.hazardType}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[#9a94d6]">Drops:</span>
                      {(Object.keys(m.rewards.materials) as MaterialId[]).map((matId) => (
                        <span key={matId} className="inline-flex items-center gap-1 text-white">
                          <MaterialIcon matId={matId} size={14} />
                          {m.rewards.materials[matId]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#2a2560]">
                  <span className="font-mono-tech text-xs text-[#9a94d6]">
                    Synergy: <span className="text-[#4de8ff] uppercase">{m.recommendedTag}</span>
                  </span>

                  {unlocked ? (
                    <button
                      type="button"
                      onClick={() => {
                        sound.click();
                        onSelectMission(idx);
                      }}
                      className="pixel-btn bg-[#ffd23f] text-[#140e29] px-4 py-2 text-[10px] cursor-pointer"
                    >
                      {stars > 0 ? 'REPLAY MISSION' : 'PREPARE LAUNCH'}
                    </button>
                  ) : (
                    <span className="font-pixel text-[10px] text-[#9a94d6] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      CLEAR {MISSIONS[idx - 1].code}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: EXO-FOUNDRY & R&D LAB */}
      {tab === 'foundry' && (
        <div className="space-y-4">
          <div className="pixel-panel p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#121633]">
            <CharacterPortrait charId="T" expression="happy" size={84} />
            <div>
              <div className="font-pixel text-[10px] text-[#ffd23f]">
                CHIEF TARI · EXO-FOUNDRY & MATERIALS LAB
              </div>
              <p className="font-body text-sm text-[#e2e0f5] mt-1">
                Every upgrade fuses Mission Credits with extracted cosmic isotopes. Titanium cuts structural mass, Helium-3 energizes nuclear nozzles, Cryo-Silica hardens avionics, and Xenon/Quantum Cores unlock deep-space telemetry.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {UPGRADES.map((up) => {
              const lv = save.upgrades[up.id] || 0;
              const isMax = lv >= up.maxLevel;
              const creditCost = up.baseCredits * (lv + 1);
              const matReqs = isMax ? {} : up.materialCosts[lv];
              const hasCredits = save.credits >= creditCost;
              const hasMaterials = (Object.keys(matReqs) as MaterialId[]).every(
                (m) => (save.materials[m] || 0) >= (matReqs[m] || 0)
              );
              const canBuy = !isMax && hasCredits && hasMaterials;

              return (
                <div key={up.id} className="pixel-panel p-5 flex flex-col justify-between gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-pixel text-xs text-[#4de8ff]">{up.name}</h3>
                      <span className="font-mono-tech text-xs text-[#ffd23f]">
                        Lv {lv}/{up.maxLevel}
                      </span>
                    </div>

                    {/* Level Bar */}
                    <div className="grid grid-cols-5 gap-1">
                      {[0, 1, 2, 3, 4].map((pip) => (
                        <div
                          key={pip}
                          className={`h-2 border border-[#453ea8] ${
                            pip < lv ? 'bg-[#6ee7a0]' : 'bg-[#090814]'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="font-body text-sm font-semibold text-white">
                      {up.effectSummary}
                    </p>
                    <p className="font-body text-xs text-[#c8c4eb] leading-relaxed">
                      {up.scienceNote}
                    </p>
                  </div>

                  {!isMax ? (
                    <div className="space-y-3 pt-3 border-t border-[#2a2560]">
                      <div className="flex flex-wrap items-center gap-3 font-mono-tech text-xs">
                        <span className={hasCredits ? 'text-[#ffd23f]' : 'text-[#ff5d73]'}>
                          {creditCost} CR
                        </span>
                        {(Object.keys(matReqs) as MaterialId[]).map((matId) => {
                          const req = matReqs[matId] || 0;
                          const owned = save.materials[matId] || 0;
                          const ok = owned >= req;
                          return (
                            <span
                              key={matId}
                              className={`inline-flex items-center gap-1 ${
                                ok ? 'text-[#6ee7a0]' : 'text-[#ff5d73]'
                              }`}
                            >
                              <MaterialIcon matId={matId} size={15} />
                              {owned}/{req} {MATERIALS[matId].symbol}
                            </span>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        disabled={!canBuy}
                        onClick={() => {
                          sound.upgrade();
                          onBuyUpgrade(up.id);
                        }}
                        className="pixel-btn w-full bg-[#6ee7a0] text-[#0b1f16] py-2.5 px-3 text-[10px] flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ArrowUpCircle className="w-3.5 h-3.5" />
                        <span>FORGE LEVEL {lv + 1}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="font-pixel text-[10px] text-[#6ee7a0] pt-3 border-t border-[#2a2560] text-center">
                      MAX RESEARCH LEVEL
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CREW ROSTER */}
      {tab === 'crew' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROSTER_ORDER.map((id) => {
            const c = CHARACTERS[id];
            const suryaHidden = id === 'S' && save.missionStars[3] === 0;
            return (
              <div key={id} className="pixel-panel p-5 flex items-start gap-4">
                <CharacterPortrait
                  charId={id}
                  expression={suryaHidden ? 'sad' : 'neutral'}
                  size={112}
                />
                <div className="space-y-1.5 min-w-0">
                  <div className="font-pixel text-xs" style={{ color: c.accentColor }}>
                    {suryaHidden ? 'CLASSIFIED FILE' : c.name}
                  </div>
                  <div className="font-mono-tech text-xs text-[#9a94d6]">
                    {suryaHidden
                      ? 'Pioneer-9 Telemetry Missing'
                      : `${c.role} · ${c.identityLabel}`}
                  </div>
                  <p className="font-body text-sm text-[#e2e0f5] leading-snug">
                    {suryaHidden
                      ? 'Clear Mission 04 (Ares Dust) to decrypt Pioneer-9’s crew dossier.'
                      : c.bio}
                  </p>
                  {!suryaHidden && (
                    <div className="font-mono-tech text-xs text-[#6ee7a0] pt-1">
                      Specialty: {c.specialty}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
