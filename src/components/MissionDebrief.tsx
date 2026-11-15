import React from 'react';
import { Star, ArrowRight, RotateCcw, Award } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { CODEX_ENTRIES } from '../data/codex';
import { MATERIALS } from '../data/parts';
import { MaterialId, MissionDef } from '../types/game';
import { MaterialIcon } from './PixelWidgets';

interface MissionDebriefProps {
  mission: MissionDef;
  success: boolean;
  starsEarned: number;
  scienceCollected: number;
  creditsEarned: number;
  materialsEarned: Partial<Record<MaterialId, number>>;
  streakCount: number;
  budgetEfficiencyMet: boolean;
  newlyUnlockedCodexIds: string[];
  onContinue: () => void;
  onRetryHangar: () => void;
}

export const MissionDebrief: React.FC<MissionDebriefProps> = ({
  mission,
  success,
  starsEarned,
  scienceCollected,
  creditsEarned,
  materialsEarned,
  streakCount,
  budgetEfficiencyMet,
  newlyUnlockedCodexIds,
  onContinue,
  onRetryHangar,
}) => {
  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
      <div className="pixel-panel-elevated p-6 sm:p-8 space-y-6 text-center">
        <div>
          <div className="font-mono-tech text-xs text-[#4de8ff]">
            {mission.code} · {mission.destination}
          </div>
          <h2
            className={`font-pixel text-xl sm:text-2xl mt-2 ${
              success ? 'text-[#6ee7a0]' : 'text-[#ff5d73]'
            }`}
          >
            {success ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED'}
          </h2>
        </div>

        {/* Animated Stars */}
        <div className="flex items-center justify-center gap-3 py-2">
          {[0, 1, 2].map((s) => (
            <Star
              key={s}
              className={`w-10 h-10 ${
                s < starsEarned
                  ? 'text-[#ffd23f] fill-[#ffd23f] drop-shadow-[0_3px_0_#8a5c00]'
                  : 'text-[#352f78]'
              }`}
            />
          ))}
        </div>

        {/* Star Criteria Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left font-mono-tech text-xs">
          <div className="bg-[#0e0c24] border border-[#352f78] p-3">
            <div className="text-[#9a94d6]">STAR 1 · ORBITAL INSERTION</div>
            <div className={success ? 'text-[#6ee7a0] mt-1' : 'text-[#ff5d73] mt-1'}>
              {success ? 'ACHIEVED' : 'FAILED'}
            </div>
          </div>
          <div className="bg-[#0e0c24] border border-[#352f78] p-3">
            <div className="text-[#9a94d6]">STAR 2 · SCIENCE TARGET</div>
            <div
              className={
                success && scienceCollected >= mission.reqScience
                  ? 'text-[#6ee7a0] mt-1'
                  : 'text-[#ffd23f] mt-1'
              }
            >
              {scienceCollected} / {mission.reqScience} pts
            </div>
          </div>
          <div className="bg-[#0e0c24] border border-[#352f78] p-3">
            <div className="text-[#9a94d6]">STAR 3 · BUDGET ≤ 85%</div>
            <div
              className={
                success && budgetEfficiencyMet ? 'text-[#6ee7a0] mt-1' : 'text-[#9a94d6] mt-1'
              }
            >
              {success && budgetEfficiencyMet ? 'ACHIEVED' : 'OVER 85%'}
            </div>
          </div>
        </div>

        {/* Credits & Material Loot */}
        <div className="pixel-panel p-5 bg-[#0e0c24] space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div>
              <div className="font-mono-tech text-xs text-[#9a94d6]">CREDITS AWARDED</div>
              <div className="font-pixel text-lg text-[#ffd23f] mt-1">+{creditsEarned} CR</div>
              {success && streakCount > 1 && (
                <div className="font-mono-tech text-[11px] text-[#6ee7a0]">
                  Includes Streak ×{streakCount} bonus
                </div>
              )}
            </div>

            {Object.keys(materialsEarned).length > 0 && (
              <div className="border-l border-[#2a2560] pl-6">
                <div className="font-mono-tech text-xs text-[#9a94d6] mb-1.5">
                  EXTRACTED MATERIALS
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {(Object.keys(materialsEarned) as MaterialId[]).map((matId) => (
                    <div
                      key={matId}
                      className="flex items-center gap-1.5 bg-[#14122d] border border-[#453ea8] px-2.5 py-1"
                    >
                      <MaterialIcon matId={matId} size={18} />
                      <span className="font-pixel text-[10px] text-white">
                        +{materialsEarned[matId]} {MATERIALS[matId].symbol}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {newlyUnlockedCodexIds.length > 0 && (
            <div className="border-t border-[#2a2560] pt-3 text-left flex items-center gap-2 font-body text-sm text-[#4de8ff]">
              <Award className="w-4 h-4 shrink-0 text-[#ffd23f]" />
              <span>
                New Science Codex unlocked:{' '}
                {newlyUnlockedCodexIds
                  .map((id) => CODEX_ENTRIES.find((c) => c.id === id)?.title)
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {!success && (
            <button
              type="button"
              onClick={() => {
                sound.click();
                onRetryHangar();
              }}
              className="pixel-btn-secondary px-5 py-3 text-xs flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#4de8ff]" />
              <span>REBUILD IN HANGAR</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              sound.click();
              onContinue();
            }}
            className="pixel-btn bg-[#ffd23f] text-[#140e29] px-6 py-3 text-xs flex items-center gap-2 cursor-pointer"
          >
            <span>{success ? 'TRANSMISSION LOG' : 'RETURN TO HUB'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
