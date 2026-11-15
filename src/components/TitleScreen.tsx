import React, { useEffect, useRef } from 'react';
import { Rocket, BookOpen, RotateCcw } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { CHARACTERS } from '../data/characters';
import { CharacterId, SaveState } from '../types/game';
import { drawPixelRocket, drawSceneBackdrop } from '../utils/pixelArt';
import { CharacterPortrait } from './PixelWidgets';

interface TitleScreenProps {
  save: SaveState;
  onStartNew: () => void;
  onContinue: () => void;
  onOpenCodex: () => void;
}

const CREW_IDS: CharacterId[] = ['N', 'R', 'B', 'V', 'T', 'O'];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  save,
  onStartNew,
  onContinue,
  onOpenCodex,
}) => {
  const heroCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let rafId = 0;

    const render = (time: number) => {
      frame++;
      drawSceneBackdrop(canvas, 'launchpad_dusk', time);
      // Draw hovering ascending test rocket on the right side
      const hoverY = 46 + Math.sin(time / 400) * 3;
      drawPixelRocket(
        ctx,
        122,
        Math.round(hoverY),
        {
          hullId: 'hull_valkyrie',
          engineId: 'eng_hydrolox',
          instrumentIds: ['inst_cam', 'inst_radar'],
          shieldId: 'shd_faraday',
        },
        frame,
        { thrusting: true, shieldActive: frame % 40 < 12 }
      );
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const totalStars = save.missionStars.reduce((a, b) => a + b, 0);

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 min-h-[calc(100vh-64px)] flex flex-col justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Hero Title, Narrative Hook & Actions */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6 pixel-panel-elevated p-6 sm:p-8">
          <div className="space-y-4">
            <div className="font-mono-tech text-xs text-[#4de8ff] tracking-widest">
              GARUDA ORBITAL STATION · CAMPAIGN EDITION
            </div>

            <h1 className="font-pixel text-3xl sm:text-5xl leading-tight text-[#ffd23f] drop-shadow-[4px_4px_0_#9a3412] text-balance">
              MISSION DIRECTOR
            </h1>

            <p className="font-body text-base sm:text-lg text-[#e2e0f5] leading-relaxed max-w-xl">
              Engineer multi-stage rockets with real Tsiolkovsky physics, harvest cosmic isotopes across eight Solar System orbits, pilot past solar hazards, and decode the 660-second signal echoing beyond Neptune.
            </p>
          </div>

          {/* Crew Showcase Strip */}
          <div className="space-y-2.5 pt-2">
            <div className="font-mono-tech text-xs text-[#9a94d6]">
              COMMAND STAFF & SPECIALISTS
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {CREW_IDS.map((id) => {
                const c = CHARACTERS[id];
                return (
                  <div
                    key={id}
                    className="bg-[#0e0c24] border-2 border-[#352f78] p-2 flex flex-col items-center text-center gap-1.5"
                    title={`${c.name} — ${c.role} (${c.identityLabel})`}
                  >
                    <CharacterPortrait charId={id} expression="neutral" size={56} />
                    <span
                      className="font-pixel text-[8px] truncate w-full"
                      style={{ color: c.accentColor }}
                    >
                      {c.name.split(' ').pop()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {save.seenIntro ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    sound.unlock();
                    sound.click();
                    onContinue();
                  }}
                  className="pixel-btn bg-[#ffd23f] text-[#140e29] px-6 py-3.5 text-xs flex items-center gap-2.5 cursor-pointer"
                >
                  <Rocket className="w-4 h-4" />
                  <span>RESUME CAMPAIGN</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.unlock();
                    sound.click();
                    onStartNew();
                  }}
                  className="pixel-btn-secondary px-5 py-3.5 text-xs flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-[#ff5d73]" />
                  <span>NEW CAMPAIGN</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sound.unlock();
                  sound.click();
                  onStartNew();
                }}
                className="pixel-btn bg-[#ffd23f] text-[#140e29] px-7 py-4 text-xs sm:text-sm flex items-center gap-3 cursor-pointer"
              >
                <Rocket className="w-4 h-4" />
                <span>START CAMPAIGN</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sound.unlock();
                sound.click();
                onOpenCodex();
              }}
              className="pixel-btn-secondary px-4 py-3.5 text-xs flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#4de8ff]" />
              <span>SCIENCE CODEX</span>
            </button>
          </div>

          {save.seenIntro && (
            <div className="font-mono-tech text-xs text-[#9a94d6] flex flex-wrap gap-3 border-t border-[#2a2560] pt-3">
              <span>Credits: {save.credits} CR</span>
              <span aria-hidden="true">·</span>
              <span>Campaign Stars: {totalStars} / 24</span>
              <span aria-hidden="true">·</span>
              <span>Missions Cleared: {save.missionsCompleted} / 8</span>
            </div>
          )}
        </div>

        {/* Right: Live Pixel Art Launchpad Diorama & Feature Pillars */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="pixel-panel p-2 flex-1 flex flex-col">
            <canvas
              ref={heroCanvasRef}
              width={160}
              height={72}
              className="w-full h-56 sm:h-64 lg:h-full min-h-[220px] pixelated block bg-[#07051a]"
            />
          </div>

          <div className="pixel-panel p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="font-pixel text-[10px] text-[#4de8ff] mb-1">REAL ORBITAL MATH</div>
              <p className="font-body text-sm text-[#c8c4eb]">
                Balance Thrust-to-Weight, Wattage, and Tsiolkovsky Δv across multi-stage designs.
              </p>
            </div>
            <div>
              <div className="font-pixel text-[10px] text-[#6ee7a0] mb-1">EXO-FOUNDRY CRAFTING</div>
              <p className="font-body text-sm text-[#c8c4eb]">
                Extract Titanium, Helium-3, Cryo-Silica, Xenon, and Quantum Cores to forge upgrades.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
