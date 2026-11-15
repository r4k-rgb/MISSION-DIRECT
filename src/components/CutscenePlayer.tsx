import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FastForward, Play, ChevronRight } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { CHARACTERS } from '../data/characters';
import { DialogueLine, MouthShape, SceneBackdropId } from '../types/game';
import { drawSceneBackdrop } from '../utils/pixelArt';
import { CharacterPortrait } from './PixelWidgets';

interface CutscenePlayerProps {
  lines: DialogueLine[];
  title?: string;
  onComplete: () => void;
}

function getPhonemeMouthShape(text: string, charCount: number, isTyping: boolean): MouthShape {
  if (!isTyping || charCount <= 0) return 'closed';
  const ch = (text[charCount - 1] || '').toLowerCase();
  if (!ch || /[\s.,!?;:—\-'"()]/.test(ch)) return 'closed';
  if (ch === 'o' || ch === 'u' || ch === 'w' || ch === 'q') return 'round';
  if (ch === 'a' || ch === 'e' || ch === 'i') return 'open';
  return charCount % 2 === 0 ? 'mid' : 'open';
}

export const CutscenePlayer: React.FC<CutscenePlayerProps> = ({
  lines,
  title,
  onComplete,
}) => {
  const [index, setIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  const sceneCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentLine = lines[index] || lines[0];
  const fullText = currentLine?.text || '';
  const isTyping = charCount < fullText.length;

  // Determine active & listening opposite-side speaker for richer staging
  const previousOtherLine = useMemo(() => {
    if (!currentLine?.speaker) return null;
    for (let i = index - 1; i >= 0; i--) {
      const candidate = lines[i];
      if (candidate.speaker && candidate.speaker !== currentLine.speaker) {
        return candidate;
      }
    }
    return null;
  }, [lines, index, currentLine?.speaker]);

  // Trigger scene SFX when line changes
  useEffect(() => {
    setCharCount(0);
    if (!currentLine) return;
    if (currentLine.sfx === 'signal') sound.signalPulse();
    else if (currentLine.sfx === 'chime') sound.collect();
    else if (currentLine.sfx === 'alert') sound.alertBeep();
    else if (currentLine.sfx === 'boom') sound.explode();
  }, [index, currentLine]);

  // Typewriter reveal with character-specific voice blips (begins immediately on line mount)
  useEffect(() => {
    if (!isTyping) return;
    const timer = window.setInterval(() => {
      setCharCount((prev) => {
        const next = prev + 1;
        const ch = fullText[next - 1] || '';
        if (next % 3 === 1 && !/[\s.,!?;:—]/.test(ch)) {
          sound.voiceBlip(currentLine.speaker);
        }
        return next;
      });
    }, 22);
    return () => window.clearInterval(timer);
  }, [isTyping, currentLine, fullText]);

  // Optional auto-advance when line finishes typing
  useEffect(() => {
    if (!autoPlay || isTyping) return;
    const timer = window.setTimeout(() => {
      if (index + 1 >= lines.length) {
        onComplete();
      } else {
        setIndex((i) => i + 1);
      }
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [autoPlay, isTyping, index, lines.length, onComplete]);

  // Animated 200x90 Pixel Scene Backdrop
  useEffect(() => {
    const canvas = sceneCanvasRef.current;
    if (!canvas) return;
    const backdrop: SceneBackdropId = currentLine?.backdrop || 'station_bridge';
    let rafId = 0;
    const render = (time: number) => {
      drawSceneBackdrop(canvas, backdrop, time);
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [currentLine?.backdrop]);

  const handleAdvance = () => {
    sound.unlock();
    if (isTyping) {
      setCharCount(fullText.length);
      return;
    }
    sound.click();
    if (index + 1 >= lines.length) {
      onComplete();
    } else {
      setIndex((i) => i + 1);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const speakerDef = currentLine.speaker ? CHARACTERS[currentLine.speaker] : null;
  const listenerDef = previousOtherLine?.speaker ? CHARACTERS[previousOtherLine.speaker] : null;
  const side = currentLine.side || 'left';
  const mouthShape = getPhonemeMouthShape(fullText, charCount, isTyping);

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 min-h-[calc(100vh-80px)] flex flex-col justify-center gap-4">
      {/* Top Scene Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="font-pixel text-xs text-[#4de8ff] tracking-wide truncate">
          {title || 'GARUDA TRANSMISSION LOG'}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono-tech text-xs text-[#9a94d6] mr-2">
            {index + 1} / {lines.length}
          </span>
          <button
            type="button"
            onClick={() => {
              sound.click();
              setAutoPlay((a) => !a);
            }}
            className={`pixel-btn-secondary px-3 py-1.5 text-[10px] flex items-center gap-1.5 cursor-pointer ${
              autoPlay ? 'border-[#6ee7a0] text-[#6ee7a0]' : ''
            }`}
          >
            <Play className="w-3 h-3" />
            <span>{autoPlay ? 'AUTO ON' : 'AUTO'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.click();
              onComplete();
            }}
            className="pixel-btn-secondary px-3 py-1.5 text-[10px] flex items-center gap-1.5 cursor-pointer"
          >
            <FastForward className="w-3 h-3" />
            <span>SKIP</span>
          </button>
        </div>
      </div>

      {/* High-Clarity 200x90 Pixel Art Cutscene Canvas */}
      <div className="pixel-panel-elevated p-2 relative overflow-hidden">
        <canvas
          ref={sceneCanvasRef}
          width={200}
          height={90}
          className="w-full h-56 sm:h-72 md:h-[340px] pixelated block bg-[#07051a]"
        />
        {currentLine.caption && (
          <div className="bg-[#090814]/95 border-t-2 border-[#453ea8] px-4 py-2 font-mono-tech text-xs text-[#ffd23f] tracking-wider">
            {currentLine.caption}
          </div>
        )}
      </div>

      {/* Crisp Dialogue Box with Phoneme Lip-Sync & Dual-Speaker Staging */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleAdvance}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleAdvance();
        }}
        className="pixel-panel p-5 cursor-pointer hover:border-[#4de8ff] transition-colors focus-visible:outline-2 focus-visible:outline-[#4de8ff]"
      >
        <div
          className={`flex flex-col sm:flex-row gap-5 items-start ${
            side === 'right' ? 'sm:flex-row-reverse' : ''
          }`}
        >
          {speakerDef && (
            <div className="flex sm:flex-col items-center gap-3 sm:gap-1.5 shrink-0">
              <CharacterPortrait
                charId={speakerDef.id}
                expression={currentLine.expression || 'neutral'}
                mouthShape={mouthShape}
                size={112}
                className="border-[#ffd23f]"
              />
              <div className="text-left sm:text-center">
                <div
                  className="font-pixel text-[10px] leading-snug"
                  style={{ color: speakerDef.accentColor }}
                >
                  {speakerDef.name}
                </div>
                <div className="font-mono-tech text-[11px] text-[#9a94d6]">
                  {speakerDef.role}
                </div>
                <div className="font-mono-tech text-[10px] text-[#6e68a8]">
                  {speakerDef.identityLabel}
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[126px]">
            <p className="font-body text-base sm:text-lg leading-relaxed text-[#f4f1ff] font-medium">
              {fullText.slice(0, charCount)}
              {isTyping && (
                <span className="inline-block w-2 h-4 bg-[#ffd23f] ml-1 animate-pulse" />
              )}
            </p>
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#2a2560]">
              <span className="font-mono-tech text-xs text-[#9a94d6]">
                {isTyping ? 'Click or Space to reveal' : 'Click or press Space to continue'}
              </span>
              <span className="font-pixel text-[10px] text-[#ffd23f] flex items-center gap-1">
                {index + 1 >= lines.length ? 'BEGIN MISSION' : 'NEXT'}
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {speakerDef && listenerDef && (
            <div className="hidden md:flex flex-col items-center gap-1 shrink-0 opacity-45">
              <CharacterPortrait
                charId={listenerDef.id}
                expression={previousOtherLine?.expression || 'neutral'}
                mouthShape="closed"
                size={84}
              />
              <span className="font-mono-tech text-[10px] text-[#9a94d6]">
                {listenerDef.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
