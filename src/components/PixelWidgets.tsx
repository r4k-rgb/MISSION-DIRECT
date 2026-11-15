import React, { useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { MATERIALS } from '../data/parts';
import { CharacterId, Expression, MaterialId, MouthShape } from '../types/game';
import { drawCharacterPortrait, drawMaterialSprite } from '../utils/pixelArt';

interface CharacterPortraitProps {
  charId: CharacterId;
  expression?: Expression;
  isTalking?: boolean;
  mouthShape?: MouthShape;
  size?: number;
  className?: string;
}

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  charId,
  expression = 'neutral',
  isTalking = false,
  mouthShape,
  size = 112,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const render = () => {
      const frame = frameRef.current++;
      const blink = frame % 24 === 0;
      let activeMouth: MouthShape = 'closed';
      if (mouthShape) {
        activeMouth = mouthShape;
      } else if (isTalking) {
        const cycle: MouthShape[] = ['mid', 'open', 'round', 'closed'];
        activeMouth = cycle[frame % cycle.length];
      }
      drawCharacterPortrait(canvas, charId, expression, activeMouth, blink);
    };
    render();
    const timer = window.setInterval(render, 120);
    return () => window.clearInterval(timer);
  }, [charId, expression, isTalking, mouthShape]);

  return (
    <canvas
      ref={canvasRef}
      width={28}
      height={28}
      style={{ width: size, height: size }}
      className={`pixelated border-[3px] border-[#5e56cf] bg-[#0d0b20] shrink-0 ${className}`}
    />
  );
};

interface MaterialIconProps {
  matId: MaterialId;
  size?: number;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({ matId, size = 20 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawMaterialSprite(canvasRef.current, matId);
    }
  }, [matId]);

  return (
    <canvas
      ref={canvasRef}
      width={12}
      height={12}
      style={{ width: size, height: size }}
      title={`${MATERIALS[matId].name} (${MATERIALS[matId].symbol})`}
      className="pixelated shrink-0"
    />
  );
};

interface AudioControlsProps {
  bgmMuted: boolean;
  sfxMuted: boolean;
  onToggleBgm: () => void;
  onToggleSfx: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  bgmMuted,
  sfxMuted,
  onToggleBgm,
  onToggleSfx,
}) => {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={() => {
          sound.unlock();
          sound.click();
          onToggleBgm();
        }}
        className={`pixel-btn-secondary px-2.5 py-1.5 text-[10px] flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          bgmMuted ? 'opacity-60' : 'border-[#4de8ff]'
        }`}
        aria-label={bgmMuted ? 'Unmute music' : 'Mute music'}
        title={bgmMuted ? 'Music Off' : 'Music On'}
      >
        <Music className="w-3.5 h-3.5 text-[#4de8ff]" />
        <span>{bgmMuted ? 'BGM OFF' : 'BGM ON'}</span>
      </button>
      <button
        type="button"
        onClick={() => {
          sound.unlock();
          onToggleSfx();
          if (sfxMuted) sound.click();
        }}
        className={`pixel-btn-secondary px-2.5 py-1.5 text-[10px] flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          sfxMuted ? 'opacity-60' : 'border-[#ffd23f]'
        }`}
        aria-label={sfxMuted ? 'Unmute sound effects' : 'Mute sound effects'}
        title={sfxMuted ? 'SFX Off' : 'SFX On'}
      >
        {sfxMuted ? (
          <VolumeX className="w-3.5 h-3.5 text-[#ff5d73]" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-[#ffd23f]" />
        )}
        <span>{sfxMuted ? 'SFX OFF' : 'SFX ON'}</span>
      </button>
    </div>
  );
};
