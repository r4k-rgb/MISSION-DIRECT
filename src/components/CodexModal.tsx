import React, { useState } from 'react';
import { X, Atom, Lock } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { CODEX_ENTRIES } from '../data/codex';
import { CodexEntry } from '../types/game';

interface CodexModalProps {
  unlockedIds: string[];
  onClose: () => void;
}

const CATEGORIES: Array<'ALL' | CodexEntry['category']> = [
  'ALL',
  'Propulsion',
  'Astrophysics',
  'Materials',
  'Signal Mystery',
];

export const CodexModal: React.FC<CodexModalProps> = ({ unlockedIds, onClose }) => {
  const [filter, setFilter] = useState<'ALL' | CodexEntry['category']>('ALL');

  const visibleEntries = CODEX_ENTRIES.filter(
    (entry) => filter === 'ALL' || entry.category === filter
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-[#05040c]/85 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Science and Engineering Codex"
    >
      <div className="pixel-panel-elevated w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b-2 border-[#453ea8] bg-[#14122d]">
          <div className="flex items-center gap-2.5">
            <Atom className="w-5 h-5 text-[#4de8ff]" />
            <h2 className="font-pixel text-xs sm:text-sm text-[#ffd23f]">
              GARUDA SCIENCE & LOGIC CODEX
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.click();
              onClose();
            }}
            className="pixel-btn-secondary px-3 py-1.5 text-[10px] flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>CLOSE</span>
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 px-5 py-3 bg-[#0e0c24] border-b border-[#2a2560]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                sound.click();
                setFilter(cat);
              }}
              className={`px-3 py-1.5 font-mono-tech text-xs border-2 cursor-pointer transition-colors ${
                filter === cat
                  ? 'bg-[#2f2a66] border-[#ffd23f] text-[#ffd23f]'
                  : 'bg-[#14122d] border-[#352f78] text-[#9a94d6] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Entries List */}
        <div className="p-5 overflow-y-auto space-y-4">
          {visibleEntries.map((entry) => {
            const unlocked = unlockedIds.includes(entry.id) || entry.id === 'tsiolkovsky' || entry.id === 'twr';
            return (
              <div
                key={entry.id}
                className={`p-4 border-2 ${
                  unlocked
                    ? 'bg-[#14122d] border-[#453ea8]'
                    : 'bg-[#0e0c24] border-[#25214d] opacity-70'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {!unlocked && <Lock className="w-4 h-4 text-[#9a94d6]" />}
                    <h3 className="font-pixel text-xs text-[#4de8ff]">{entry.title}</h3>
                  </div>
                  <span className="font-mono-tech text-xs text-[#9a94d6]">
                    {entry.category}
                  </span>
                </div>

                {unlocked ? (
                  <div className="space-y-2.5">
                    {entry.formula && (
                      <div className="bg-[#090814] border border-[#352f78] px-3 py-1.5 font-mono-tech text-sm text-[#ffd23f] inline-block">
                        {entry.formula}
                      </div>
                    )}
                    <p className="font-body text-sm text-white font-semibold">
                      {entry.summary}
                    </p>
                    <p className="font-body text-sm text-[#c8c4eb] leading-relaxed">
                      {entry.deepDive}
                    </p>
                    <div className="bg-[#0c1b29] border border-[#1d4e6b] px-3 py-2 font-body text-xs text-[#6ee7a0]">
                      <strong className="font-pixel text-[9px] mr-2">FLIGHT IMPACT:</strong>
                      {entry.inGameImpact}
                    </div>
                  </div>
                ) : (
                  <p className="font-mono-tech text-xs text-[#9a94d6]">
                    Complete outer-system missions to unlock this scientific dossier.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
