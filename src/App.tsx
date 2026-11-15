import { useEffect, useState } from 'react';
import { sound } from './audio/soundEngine';
import { CodexModal } from './components/CodexModal';
import { CutscenePlayer } from './components/CutscenePlayer';
import { HangarDesigner } from './components/HangarDesigner';
import { FlightOutcome, LaunchFlightSim } from './components/LaunchFlightSim';
import { MissionDebrief } from './components/MissionDebrief';
import { MissionHub } from './components/MissionHub';
import { AudioControls } from './components/PixelWidgets';
import { StarfieldCanvas } from './components/StarfieldCanvas';
import { TitleScreen } from './components/TitleScreen';
import { MISSIONS } from './data/missions';
import { UPGRADES, computeRocketStats } from './data/parts';
import { FINALE_CUTSCENE, PROLOGUE_CUTSCENE } from './data/story';
import {
  DialogueLine,
  MaterialId,
  RocketConfig,
  SaveState,
  SceneBackdropId,
  ScreenMode,
  UpgradeId,
} from './types/game';

const SAVE_KEY = 'mission_director_pixel_v2';

const DEFAULT_SAVE: SaveState = {
  credits: 50,
  materials: { ti: 1, he3: 0, si: 0, xe: 0, qc: 0 },
  missionStars: [0, 0, 0, 0, 0, 0, 0, 0],
  upgrades: {
    budget: 0,
    propulsion: 0,
    telemetry: 0,
    metallurgy: 0,
    shielding: 0,
    quantum: 0,
  },
  streak: 0,
  seenIntro: false,
  unlockedCodex: ['tsiolkovsky', 'twr'],
  totalScienceCollected: 0,
  missionsCompleted: 0,
};

function loadSave(): SaveState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return DEFAULT_SAVE;
    const parsed = JSON.parse(raw) as Partial<SaveState>;
    return {
      ...DEFAULT_SAVE,
      ...parsed,
      materials: { ...DEFAULT_SAVE.materials, ...(parsed.materials || {}) },
      upgrades: { ...DEFAULT_SAVE.upgrades, ...(parsed.upgrades || {}) },
      missionStars:
        Array.isArray(parsed.missionStars) && parsed.missionStars.length === 8
          ? parsed.missionStars
          : DEFAULT_SAVE.missionStars,
      unlockedCodex: Array.isArray(parsed.unlockedCodex)
        ? parsed.unlockedCodex
        : DEFAULT_SAVE.unlockedCodex,
    };
  } catch {
    return DEFAULT_SAVE;
  }
}

export default function App() {
  const [save, setSave] = useState<SaveState>(loadSave);
  const [screen, setScreen] = useState<ScreenMode>('TITLE');
  const [missionIdx, setMissionIdx] = useState(0);
  const [config, setConfig] = useState<RocketConfig>({
    hullId: 'hull_kestrel',
    engineId: 'eng_kerolox',
    instrumentIds: ['inst_cam'],
    shieldId: null,
  });

  const [cutsceneData, setCutsceneData] = useState<{
    lines: DialogueLine[];
    title: string;
    isFinale?: boolean;
    onDone: () => void;
  } | null>(null);

  const [debriefState, setDebriefState] = useState<{
    success: boolean;
    starsEarned: number;
    scienceCollected: number;
    creditsEarned: number;
    materialsEarned: Partial<Record<MaterialId, number>>;
    streakCount: number;
    budgetEfficiencyMet: boolean;
    newlyUnlockedCodexIds: string[];
  } | null>(null);

  const [codexOpen, setCodexOpen] = useState(false);
  const [bgmMuted, setBgmMuted] = useState(false);
  const [sfxMuted, setSfxMuted] = useState(false);

  // Persist save state
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch {
      // ignore storage quota errors
    }
  }, [save]);

  // Dynamic Music Mood Orchestration
  useEffect(() => {
    if (screen === 'TITLE') sound.setMusicMood('title');
    else if (screen === 'CUTSCENE')
      sound.setMusicMood(cutsceneData?.isFinale ? 'finale' : 'cutscene');
    else if (screen === 'LAUNCH_FLIGHT') sound.setMusicMood('launch');
    else if (screen === 'HUB' || screen === 'HANGAR' || screen === 'DEBRIEF')
      sound.setMusicMood('hangar');
  }, [screen, cutsceneData?.isFinale]);

  const activeMission = MISSIONS[missionIdx] || MISSIONS[0];

  const backdropTheme: SceneBackdropId =
    screen === 'TITLE'
      ? 'launchpad_dusk'
      : screen === 'HUB'
      ? 'station_bridge'
      : activeMission.backdrop;

  const handleStartNew = () => {
    const fresh: SaveState = {
      ...DEFAULT_SAVE,
      materials: { ...DEFAULT_SAVE.materials },
      upgrades: { ...DEFAULT_SAVE.upgrades },
      missionStars: [...DEFAULT_SAVE.missionStars],
      seenIntro: true,
    };
    setSave(fresh);
    setCutsceneData({
      lines: PROLOGUE_CUTSCENE,
      title: 'PROLOGUE · GARUDA STATION',
      onDone: () => setScreen('HUB'),
    });
    setScreen('CUTSCENE');
  };

  const handleContinue = () => {
    setScreen('HUB');
  };

  const handleSelectMission = (idx: number) => {
    setMissionIdx(idx);
    const m = MISSIONS[idx];
    // Suggest sensible default hull/engine if unlocked
    const defaultHull =
      idx >= 5
        ? 'hull_aegis'
        : idx >= 3
        ? 'hull_valkyrie'
        : idx >= 1
        ? 'hull_garuda'
        : 'hull_kestrel';
    const defaultEngine =
      idx >= 4
        ? 'eng_ntr'
        : idx >= 2
        ? 'eng_hall'
        : idx >= 1
        ? 'eng_hydrolox'
        : 'eng_kerolox';

    setConfig({
      hullId: defaultHull,
      engineId: defaultEngine,
      instrumentIds: ['inst_cam'],
      shieldId: idx >= 2 ? 'shd_ablative' : null,
    });

    setCutsceneData({
      lines: m.preCutscene,
      title: `${m.code} · MISSION BRIEFING`,
      onDone: () => setScreen('HANGAR'),
    });
    setScreen('CUTSCENE');
  };

  const handleBuyUpgrade = (upgradeId: UpgradeId) => {
    const up = UPGRADES.find((u) => u.id === upgradeId);
    if (!up) return;
    const lv = save.upgrades[upgradeId] || 0;
    if (lv >= up.maxLevel) return;

    const creditCost = up.baseCredits * (lv + 1);
    const matReqs = up.materialCosts[lv];
    if (save.credits < creditCost) return;

    const hasMats = (Object.keys(matReqs) as MaterialId[]).every(
      (m) => (save.materials[m] || 0) >= (matReqs[m] || 0)
    );
    if (!hasMats) return;

    const nextMats = { ...save.materials };
    (Object.keys(matReqs) as MaterialId[]).forEach((m) => {
      nextMats[m] = (nextMats[m] || 0) - (matReqs[m] || 0);
    });

    setSave((prev) => ({
      ...prev,
      credits: prev.credits - creditCost,
      materials: nextMats,
      upgrades: {
        ...prev.upgrades,
        [upgradeId]: lv + 1,
      },
    }));
  };

  const handleFlightFinish = (outcome: FlightOutcome) => {
    const stats = computeRocketStats(config, activeMission, save.upgrades);
    const scienceCollected = outcome.success
      ? Number((stats.scienceOutput * outcome.scienceMultiplier).toFixed(1))
      : 0;
    const budgetEfficiencyMet = stats.totalCost <= stats.budgetLimit * 0.85;

    let starsEarned = 0;
    if (outcome.success) {
      starsEarned =
        1 +
        (scienceCollected >= activeMission.reqScience ? 1 : 0) +
        (budgetEfficiencyMet ? 1 : 0);
    }

    const newStreak = outcome.success ? save.streak + 1 : 0;
    const creditsEarned = outcome.success
      ? Math.round(activeMission.rewards.credits * (0.6 + starsEarned * 0.25) + newStreak * 8)
      : 18;

    // Combine mission material drops + salvaged bonus materials during flight
    const materialsEarned: Partial<Record<MaterialId, number>> = {};
    if (outcome.success) {
      (Object.keys(activeMission.rewards.materials) as MaterialId[]).forEach((m) => {
        materialsEarned[m] = activeMission.rewards.materials[m] || 0;
      });
    }
    (Object.keys(outcome.bonusMaterials) as MaterialId[]).forEach((m) => {
      materialsEarned[m] = (materialsEarned[m] || 0) + (outcome.bonusMaterials[m] || 0);
    });

    const newlyUnlockedCodexIds = outcome.success
      ? activeMission.unlocksCodex.filter((id) => !save.unlockedCodex.includes(id))
      : [];

    if (outcome.success) sound.victory();
    else sound.defeat();

    setSave((prev) => {
      const nextStars = [...prev.missionStars];
      if (starsEarned > nextStars[missionIdx]) {
        nextStars[missionIdx] = starsEarned;
      }
      const nextMats = { ...prev.materials };
      (Object.keys(materialsEarned) as MaterialId[]).forEach((m) => {
        nextMats[m] = (nextMats[m] || 0) + (materialsEarned[m] || 0);
      });

      return {
        ...prev,
        credits: prev.credits + creditsEarned,
        materials: nextMats,
        missionStars: nextStars,
        streak: newStreak,
        seenIntro: true,
        unlockedCodex: [...prev.unlockedCodex, ...newlyUnlockedCodexIds],
        totalScienceCollected: Number((prev.totalScienceCollected + scienceCollected).toFixed(1)),
        missionsCompleted: nextStars.filter((s) => s > 0).length,
      };
    });

    setDebriefState({
      success: outcome.success,
      starsEarned,
      scienceCollected,
      creditsEarned,
      materialsEarned,
      streakCount: newStreak,
      budgetEfficiencyMet,
      newlyUnlockedCodexIds,
    });
    setScreen('DEBRIEF');
  };

  const handleDebriefContinue = () => {
    if (!debriefState) {
      setScreen('HUB');
      return;
    }

    if (debriefState.success) {
      const isFinalMission = missionIdx === MISSIONS.length - 1;
      setCutsceneData({
        lines: activeMission.postCutscene,
        title: `${activeMission.code} · TRANSMISSION RECEIVED`,
        onDone: () => {
          if (isFinalMission) {
            setCutsceneData({
              lines: FINALE_CUTSCENE,
              title: 'FINALE · NEPTUNE RESONANCE',
              isFinale: true,
              onDone: () => setScreen('HUB'),
            });
            setScreen('CUTSCENE');
          } else {
            setScreen('HUB');
          }
        },
      });
      setScreen('CUTSCENE');
    } else {
      setScreen('HUB');
    }
  };

  return (
    <div className="min-h-screen relative text-[#f2f0ff] flex flex-col">
      <StarfieldCanvas theme={backdropTheme} />

      {/* Clean Single-Row Top Bar */}
      <header className="relative z-20 border-b-2 border-[#352f78] bg-[#090814]/90 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => {
              sound.unlock();
              sound.click();
              setScreen('TITLE');
            }}
            className="font-pixel text-xs sm:text-sm text-[#ffd23f] whitespace-nowrap shrink-0 cursor-pointer hover:text-[#4de8ff] transition-colors"
          >
            MISSION DIRECTOR
          </button>

          <div className="hidden md:flex items-center gap-4 font-mono-tech text-xs text-[#9a94d6] whitespace-nowrap">
            <span>Garuda Station · 2041</span>
            <span aria-hidden="true">·</span>
            <span>{save.credits} CR</span>
            <span aria-hidden="true">·</span>
            <span>{save.missionsCompleted}/8 Orbits</span>
          </div>

          <AudioControls
            bgmMuted={bgmMuted}
            sfxMuted={sfxMuted}
            onToggleBgm={() => {
              const next = !bgmMuted;
              setBgmMuted(next);
              sound.setBgmMuted(next);
            }}
            onToggleSfx={() => {
              const next = !sfxMuted;
              setSfxMuted(next);
              sound.setSfxMuted(next);
            }}
          />
        </div>
      </header>

      {/* Active Game Screen */}
      <main className="flex-1 relative z-10">
        {screen === 'TITLE' && (
          <TitleScreen
            save={save}
            onStartNew={handleStartNew}
            onContinue={handleContinue}
            onOpenCodex={() => setCodexOpen(true)}
          />
        )}

        {screen === 'CUTSCENE' && cutsceneData && (
          <CutscenePlayer
            lines={cutsceneData.lines}
            title={cutsceneData.title}
            onComplete={cutsceneData.onDone}
          />
        )}

        {screen === 'HUB' && (
          <MissionHub
            save={save}
            onSelectMission={handleSelectMission}
            onBuyUpgrade={handleBuyUpgrade}
            onOpenCodex={() => setCodexOpen(true)}
            onBackTitle={() => setScreen('TITLE')}
          />
        )}

        {screen === 'HANGAR' && (
          <HangarDesigner
            mission={activeMission}
            save={save}
            config={config}
            onChangeConfig={setConfig}
            onLaunch={() => setScreen('LAUNCH_FLIGHT')}
            onBack={() => setScreen('HUB')}
          />
        )}

        {screen === 'LAUNCH_FLIGHT' && (
          <LaunchFlightSim
            mission={activeMission}
            config={config}
            save={save}
            onFinish={handleFlightFinish}
          />
        )}

        {screen === 'DEBRIEF' && debriefState && (
          <MissionDebrief
            mission={activeMission}
            success={debriefState.success}
            starsEarned={debriefState.starsEarned}
            scienceCollected={debriefState.scienceCollected}
            creditsEarned={debriefState.creditsEarned}
            materialsEarned={debriefState.materialsEarned}
            streakCount={debriefState.streakCount}
            budgetEfficiencyMet={debriefState.budgetEfficiencyMet}
            newlyUnlockedCodexIds={debriefState.newlyUnlockedCodexIds}
            onContinue={handleDebriefContinue}
            onRetryHangar={() => setScreen('HANGAR')}
          />
        )}
      </main>

      {codexOpen && (
        <CodexModal
          unlockedIds={save.unlockedCodex}
          onClose={() => setCodexOpen(false)}
        />
      )}
    </div>
  );
}
