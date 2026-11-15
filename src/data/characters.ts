import { CharacterDef, CharacterId, Expression } from '../types/game';

/**
 * Validates and normalizes every sprite grid to strictly 28x28 pixels.
 */
function grid28(rows: string[]): string[] {
  return rows.slice(0, 28).map((r) => {
    if (r.length === 28) return r;
    return r.length > 28 ? r.slice(0, 28) : r.padEnd(28, '.');
  });
}

/**
 * NOVA — Synthetic Tactical AI (Non-Binary)
 * Neat, asymmetrical holographic silhouette: sensor fin on left, comms node on right,
 * wide unobstructed luminous visor with expressive 2x2 eyes & lip-synced waveform bar.
 */
function makeNovaSprites(): Record<Expression, string[]> {
  const frame = (brow: string, eye1: string, eye2: string, mouth: string): string[] =>
    grid28([
      '.........kkkkkkkkkk.........',
      '.......kkcccccccccckk.......',
      '.....kkccwwwwwwwwwwcckk.....',
      '....kccddddddddddddddcck....',
      '...kccddddddddddddddddcck...',
      '..kccddkkkkkkkkkkkkkkddcck..',
      '..kcddkkkkkkkkkkkkkkkkddck..',
      '.kccdkkkkkkkkkkkkkkkkkkdcck.',
      '.kccdkk' + brow + 'kkdcck.', // 7+12+7 = 26 -> wait 6+2+12+2+6 = 28: '.kccdkk'(7) + 14 + 'kkdcck.'(7)
      '.kccdkk' + eye1 + 'kkdcck.',
      '.kccdkk' + eye2 + 'kkdcck.',
      'kkccdkkkkkkkkkkkkkkkkkkdcckk',
      'kcycdkkkkkkkkkkcckkkkkkdccyk',
      'kcycdkkk' + mouth + 'kkkdccyk', // 8 + 12 + 8 = 28
      'kkccdkkkkkkkkkkkkkkkkkkdcckk',
      '.kccdkkkkkkkkkkkkkkkkkkdcck.',
      '..kcddkkkkkkkkkkkkkkkkddck..',
      '..kccddddddddddddddddddcck..',
      '...kkccddddddddddddddcckk...',
      '.....kkkddddddddddddkkk.....',
      '.......kkkddddddddkkk.......',
      '.....kkddddccccccddddkk.....',
      '...kkddccccddddddccccddkk...',
      '..kddccddddccccccddddccddk..',
      '.kdddccdddddddddddddcccdddk.',
      '.kdddccdddddddddddddcccdddk.',
      '.kkkkkkkkkkkkkkkkkkkkkkkkkk.',
      '............................',
    ]);

  return {
    neutral: frame('ccccccccccccc.', 'ccwwwccccwwwcc', 'ccwyyccccyywcc', 'ccyyyyyyyycc'),
    happy:   frame('cggggccccggggc', 'ccgggccccgggcc', 'ccwyyccccyywcc', 'cggyyyyyyggc'),
    alert:   frame('crrrrccccrrrrc', 'ccrrrccccrrrcc', 'ccwwwccccwwwcc', 'ccrrrrrrrrcc'),
    smirk:   frame('ccyyyccccggggc', 'ccwwwccccyywcc', 'ccwyyccccyywcc', 'cccyyyyyyggc'),
    sad:     frame('ddccccccccccc.', 'ccdddccccdddcc', 'ccwyyccccyywcc', 'ccddddddddcc'),
  };
}

/**
 * Captain Rani — Female Flight Engineer (She/Her)
 * Neat, well-groomed asymmetrical dark chestnut hair: side-parted swept bangs with gold clip
 * on the left, longer wavy lock past the left shoulder & tucked behind the right ear.
 * Clearly feminine tapered oval jawline, arched brows, bright eyes with outer lash flick,
 * warm cheek blush, neat lips, orange flight suit with diagonal collar & mic boom.
 */
function makeRaniSprites(): Record<Expression, string[]> {
  const frame = (brow: string, eye1: string, eye2: string, mouth: string): string[] =>
    grid28([
      '........kkkkkkkkkk..........',
      '......kkhhhhhhhhhhkk........',
      '.....khhhhaaaaaahhhhk.......',
      '....khhhhaaaaaaaahhhhk......',
      '...khhhhaaaaayyyaahhhhk.....',
      '..khhhhaaahhhhhhaaaahhhk....',
      '..khhhaahsssssssssshaahhk...',
      '..khhhas' + brow + 'ssahhk...', // 8 + 12 + 8 = 28
      '..khhhas' + eye1 + 'ssahhk...',
      '..khhhas' + eye2 + 'ssahhk...',
      '..khhhaspssdddddsspsahhhk...', // 28? 8+11+8=27 -> fixed below
      '..khhhaspsssdddssspsahhhk...',
      '..khhhaassssssssssssahhhk...',
      '...khhassss' + mouth + 'ssssahhk...', // 11 + 6 + 11 = 28
      '...khhasssssssssssssahhk....',
      '...khhhkssssssssssskhhhk....',
      '...khhk.kkssssssskk..khk....',
      '...khh....kkssskk...........',
      '...khh..kkccttttcckk........',
      '...khh.ktttttttttttykk......',
      '...khhkttttuuuttttuuttk.....',
      '...k.ktttttuuuttttuutttk....',
      '.....ktttttttttttttttttk....',
      '....ktttttuuttttttuuttttk...',
      '....ktttttttttttttttttttk...',
      '...kttttttutttttttuttttttk..',
      '...kkkkkkkkkkkkkkkkkkkkkkk..',
      '............................',
    ]).filter((_, idx) => idx !== 10); // remove extra draft line cleanly -> 27 lines, wait keep 28!

  // Build exact 28 lines cleanly
  const exact = (brow: string, eye1: string, eye2: string, mouth: string): string[] =>
    grid28([
      '........kkkkkkkkkk..........',
      '.......khhhhhhhhhhk.........',
      '......khhhaaaaaahhhk........',
      '.....khhhaaaaaaaahhhk.......',
      '....khhhaaaayyyaaaahhk......',
      '...khhhaaahhhhhhhaaahhk.....',
      '..khhhaahsssssssssshaahhk...',
      '..khhhas' + brow + 'ssahhk..',
      '..khhhas' + eye1 + 'ssahhk..',
      '..khhhas' + eye2 + 'ssahhk..',
      '..khhhaspsssdddssspsahhhk...',
      '..khhhaassssssssssssahhhk...',
      '...khhassss' + mouth + 'ssssahhk...',
      '...khhasssssssssssssahhk....',
      '...khhhkssssssssssskhhhk....',
      '...khhk.kkssssssskk..khk....',
      '...khh....kkssskk...........',
      '...khh...kccttttcck.........',
      '...khh..ktttttttttyk........',
      '...khh.kttttuuutttuttk......',
      '...khhktttttuuutttutttk.....',
      '...k.ktttttttttttttttttk....',
      '....ktttttuuttttttuuttttk...',
      '....ktttttttttttttttttttk...',
      '...kttttttutttttttuttttttk..',
      '...ktttttttttttttttttttttk..',
      '...kkkkkkkkkkkkkkkkkkkkkkk..',
      '............................',
    ]);

  return {
    neutral: exact('kksssssssskk', 'kkwessssewkk', 'skeessssseks', 'ssmmss'),
    happy:   exact('kksssssssskk', 'kkwessssewkk', 'skssssssssks', 'smwwms'),
    alert:   exact('kssssssssssk', 'kwwessssewwk', 'skeessssseks', 'skkkks'),
    smirk:   exact('kkssssssssks', 'kkwessssewkk', 'skeessssseks', 'sssmws'),
    sad:     exact('skssssssssks', 'kssesssssesk', 'skeessssseks', 'skmmks'),
  };
}

/**
 * Chief Tari — Female Exo-Foundry Metallurgist (She/Her)
 * Neat, asymmetrical dark hair: sleek bangs parted right, single thick braid resting over her left shoulder,
 * tilted golden foundry goggles pushed cleanly high on her forehead (face 100% visible!),
 * feminine arched lashes, warm cheeks, cheerful smile, gold foundry jacket with asymmetrical collar badge.
 */
function makeTariSprites(): Record<Expression, string[]> {
  const exact = (brow: string, eye1: string, eye2: string, mouth: string): string[] =>
    grid28([
      '........kkkkkkkkkkk.........',
      '......kkhhhhhhhhhhhkk.......',
      '.....khhkkcccccccchhhk......',
      '....khhkcwwccccwwckhhhk.....',
      '....khhkccckkkkccckhhhk.....',
      '...khhhhssssssssssshhhhk....',
      '..khhhhs' + brow + 'shhhhk..',
      '..khhhhs' + eye1 + 'shhhhk..',
      '..khhhhs' + eye2 + 'shhhhk..',
      '..khhhhspsssdddssspshhhk....',
      '..khhhassssssssssssshhhk....',
      '..khhhaasss' + mouth + 'ssshhhk....', // 11 + 6 + 11 = 28
      '..khhhaasssssssssssshhhk....',
      '..khhh.kksssssssssskkhhk....',
      '..khhh...kksssssskk..khk....',
      '..khhk.....kksskk...........',
      '..khh....kkccttcckk.........',
      '..kah...kttttttttttk........',
      '..khh..ktttuuttttuutk.......',
      '..kah.kttttuuttttuuttk......',
      '..khhkttttttttttttttttk.....',
      '...k.ktttttuuttttuuttttk....',
      '....ktttttttttttttttttttk...',
      '...ktttttyyttttttttutttttk..',
      '...ktttttttttttttttttttttk..',
      '...ktttttuuttttttttuuttttk..',
      '...kkkkkkkkkkkkkkkkkkkkkkk..',
      '............................',
    ]);

  return {
    neutral: exact('kksssssssskk', 'kkwessssewkk', 'skeessssseks', 'ssmmss'),
    happy:   exact('kksssssssskk', 'kkwessssewkk', 'skssssssssks', 'smwwms'),
    alert:   exact('kssssssssssk', 'kwwessssewwk', 'skeessssseks', 'skkkks'),
    smirk:   exact('kkssssssssks', 'kkwessssewkk', 'skeessssseks', 'sssmws'),
    sad:     exact('skssssssssks', 'kssesssssesk', 'skeessssseks', 'skmmks'),
  };
}

/**
 * Dr. Bima — Male Astrophysicist (He/Him)
 * Well-groomed silver-grey hair parted asymmetrically to the left with tidy temple fade,
 * broader squared masculine jaw, thick straight silver brows, clear round wire spectacles
 * (1px blue-silver frame around crystal-clear 2x2 eyes!), neatly trimmed beard & mustache,
 * crisp white collared shirt & emerald lab coat with silver pen pocket on left chest.
 */
function makeBimaSprites(): Record<Expression, string[]> {
  const exact = (brow: string, eye1: string, eye2: string, mouth: string): string[] =>
    grid28([
      '.......kkkkkkkkkkkkkk.......',
      '.....kkhhhhhhhhhhhhhhkk.....',
      '....khhhhhhwwwwwhhhhhhhk....',
      '...khhhhsssssssssssshhhhk...',
      '...khhhsssssssssssssshhhk...',
      '..khhhss' + brow + 'sshhhk..', // 8 + 12 + 8 = 28
      '..khhgg' + eye1 + 'gghhhk..', // 7 + 14 + 7 = 28? let's count: '..khhgg'(7) + 14 + 'gghhhk..'(8) -> 7+14+8=29! So use '..khhg'(6) + 14 + 'gghhhk..'(8) = 28!
      '..khhg' + eye2 + 'gghhhk..',
      '..khhgggsssdssssdsssggghhk..', // Wait let's make eye rows exact 6+14+8=28 cleanly:
      '..khhhsssssddddddssssshhhk..',
      '..khhhssshhhhhhhhhhssshhhk..',
      '..khhhsshh' + mouth + 'hhsshhhk..', // 10 + 8 + 10 = 28
      '..khhhsshhhhhhhhhhhhsshhhk..',
      '...khhshhhhhhhhhhhhhhshhk...',
      '...khhshhhhhhhhhhhhhhshhk...',
      '....kkshhhhhhhhhhhhhhskk....',
      '.....kkkhhhhhhhhhhhhkkk.....',
      '......kkccsssssssscckk......',
      '....kkcccttttttttttccckk....',
      '...kttttccuttttttuucctttk...',
      '..ktttttccttttttttcctttttk..',
      '..kttttwtttttttttttttttttk..',
      '.ktttttwttttttttttttttttttk.',
      '.ktttttuuttttttttttttuutttk.',
      '.ktttttuuttttttttttttuutttk.',
      '.kttttttttttttttttttttttttk.',
      '.kkkkkkkkkkkkkkkkkkkkkkkkkk.',
      '............................',
    ]);

  // Fix rows 6,7,8 to exact 28 chars explicitly
  const clean = (brow: string, eye1: string, eye2: string, mouth: string): string[] => {
    const rows = exact(brow, eye1, eye2, mouth);
    rows[6] = '..khhg' + eye1 + 'ghhhk..'; // 6 + 15 + 7 = 28!
    rows[7] = '..khhg' + eye2 + 'ghhhk..';
    rows[8] = '..khhgggssdssssdssggghhhk...'.slice(0, 28);
    return grid28(rows);
  };

  return {
    neutral: clean('hhsssssssshh', 'gwkkssssssskkwg', 'gkesssssssssekg', 'hhmmmmhh'),
    happy:   clean('hhsssssssshh', 'gwkkssssssskkwg', 'gsssssssssssssg', 'hhwwwwhh'),
    alert:   clean('hssssssssssh', 'gwwkssssssskwwg', 'gkesssssssssekg', 'hhkkkkhh'),
    smirk:   clean('hhsssssssshs', 'gwkkssssssskkwg', 'gkesssssssssekg', 'hhssmmwh'),
    sad:     clean('shsssssssshs', 'gssessssssseskg', 'gkesssssssssekg', 'hhkmmkhh'),
  };
}

/**
 * Auditor Vex — Male Consortium Envoy (He/Him)
 * Well-groomed crimson hair swept asymmetrically right with clean shaved temple undercut on left,
 * sharp masculine cheekbones & squared angular chin, translucent half-rim monocle/visor over ONLY
 * his left eye (right eye & brow completely open!), high purple Consortium coat with asymmetrical clasp.
 */
function makeVexSprites(): Record<Expression, string[]> {
  const exact = (brow: string, eye1: string, eye2: string, mouth: string): string[] =>
    grid28([
      '.......kkkkkkkkkkkkkk.......',
      '......khhhhhhhhhhhhhhk......',
      '.....khhhrrrrrrrrrrrrhk.....',
      '....khhhrrrrrrrrrrrrrrhk....',
      '....khhsssssssssssssshhk....',
      '...khhss' + brow + 'sshhk...', // 8 + 12 + 8 = 28
      '...khhsv' + eye1 + 'sshhk...', // 8 + 12 + 8 = 28
      '...khhsv' + eye2 + 'sshhk...',
      '...khhssvvvssssddddssshhk...',
      '...khhssssssddddddsssshhk...',
      '...khhsssssssssssssssshhk...',
      '....khsssss' + mouth + 'ssssshk....', // 11 + 6 + 11 = 28
      '....khssssssssssssssssshk...',
      '.....khssssssssssssssshk....',
      '......khssssssssssssshk.....',
      '.......kkssssssssssskk......',
      '......kkccctttttttccckk.....',
      '.....ktttttttttttttttttk....',
      '....ktttuuuttttttutttuttk...',
      '...kttttuuuttttttyutttuttk..',
      '..ktttttuuutttttttttttutttk.',
      '..ktttttttttttttttttttttttk.',
      '.kttttttuuuttttttttttuuutttk',
      '.ktttttttttttttttttttttttttk',
      '.ktttttttttttttttttttttttttk',
      '.ktttttttttttttttttttttttttk',
      '.kkkkkkkkkkkkkkkkkkkkkkkkkkk',
      '............................',
    ]);

  return {
    neutral: exact('kksssssssskk', 'vwessssssewk', 'vkesssssseks', 'ssmmss'),
    happy:   exact('kksssssssskk', 'vwessssssewk', 'vsssssssssks', 'smwwms'),
    alert:   exact('kssssssssssk', 'vwwessssseww', 'vkesssssseks', 'skkkks'),
    smirk:   exact('kkssssssssks', 'vwessssssewk', 'vkesssssseks', 'sssmws'),
    sad:     exact('skssssssssks', 'vssesssssesk', 'vkesssssseks', 'skmmks'),
  };
}

/**
 * Commander Orion — Male Deep-Space Astrogator (He/Him)
 * Neat executive indigo haircut swept higher on the left & tapered right,
 * broad masculine brow & square jawline, sleek cybernetic telemetry earpiece on right ear only,
 * calm focused eyes, fleet navy jacket with asymmetrical rank stripes on left shoulder.
 */
function makeOrionSprites(): Record<Expression, string[]> {
  const exact = (brow: string, eye1: string, eye2: string, mouth: string): string[] =>
    grid28([
      '.......kkkkkkkkkkkkkk.......',
      '......khhhhhhhhhhhhhhk......',
      '.....khhhhhhhhhhhhhhhhk.....',
      '....khhhhhhhhhhhhhhhhhhk....',
      '....khhsssssssssssssshhk....',
      '...khhss' + brow + 'sshhk...', // 8 + 12 + 8 = 28
      '...khhss' + eye1 + 'sscwk...',
      '...khhss' + eye2 + 'sscck...',
      '...khhssssssddddddsssshhk...',
      '...khhsssssddddddddssshhk...',
      '...khhsssssssssssssssshhk...',
      '....khsssss' + mouth + 'ssssshk....',
      '....khssssssssssssssssshk...',
      '.....khssssssssssssssshk....',
      '.....kksssssssssssssskk.....',
      '......kksssssssssssskk......',
      '.....kkcccttttttttccckk.....',
      '...kkttttttttttttttttttkk...',
      '..ktttyyttttttttttttttuttk..',
      '.kttttttttttttttttttttutttk.',
      '.ktttttuuuttttttttttttuuttk.',
      '.ktttttuuuttttttttttttuuttk.',
      '.kttttttttttttttttttttttttk.',
      '.kttttttttttttttttttttttttk.',
      '.ktttttuuuttttttttttttuuttk.',
      '.kttttttttttttttttttttttttk.',
      '.kkkkkkkkkkkkkkkkkkkkkkkkkk.',
      '............................',
    ]);

  return {
    neutral: exact('kksssssssskk', 'kwessssssewk', 'keesssssseks', 'ssmmss'),
    happy:   exact('kksssssssskk', 'kwessssssewk', 'ksssssssssks', 'smwwms'),
    alert:   exact('kssssssssssk', 'wwesssssseww', 'keesssssseks', 'skkkks'),
    smirk:   exact('kkssssssssks', 'kwessssssewk', 'keesssssseks', 'sssmws'),
    sad:     exact('skssssssssks', 'ssessssssesk', 'keesssssseks', 'skmmks'),
  };
}

/**
 * Director Surya — Former Garuda Director (Male, He/Him)
 * Well-groomed older male silhouette: swept silver-lavender hair parted left,
 * neatly trimmed beard & mustache, clear warm eyes, subtle holographic cyan shoulder rim.
 */
function makeSuryaSprites(): Record<Expression, string[]> {
  const exact = (brow: string, eye1: string, eye2: string, mouth: string): string[] =>
    grid28([
      '.......kkkkkkkkkkkkkk.......',
      '.....kkhhhhhhhhhhhhhhkk.....',
      '....khhhccccccccccccchhk....',
      '...khhhsssssssssssssshhhk...',
      '...khhsssssssssssssssshhk...',
      '..khhhss' + brow + 'sshhhk..',
      '..khhhss' + eye1 + 'sshhhk..',
      '..khhhss' + eye2 + 'sshhhk..',
      '..khhhsssssddddddssssshhhk..',
      '..khhhssshhhhhhhhhhssshhhk..',
      '..khhhsshh' + mouth + 'hhsshhhk..',
      '..khhhsshhhhhhhhhhhhsshhhk..',
      '...khhshhhhhhhhhhhhhhshhk...',
      '...khhshhhhhhhhhhhhhhshhk...',
      '....kkshhhhhhhhhhhhhhskk....',
      '.....kkhhhhhhhhhhhhhhkk.....',
      '......kksssssssssssskk......',
      '....kkcccttttttttttccckk....',
      '...kttttccttttttttccttttk...',
      '..ktttttccttttttttcctttttk..',
      '..kttttttttttttttttttttttk..',
      '.ktttttuuuttttttttttuuutttk.',
      '.ktttttuuuttttttttttuuutttk.',
      '.kttttttttttttttttttttttttk.',
      '.kttttttttttttttttttttttttk.',
      '.kttttttttttttttttttttttttk.',
      '.kkkkkkkkkkkkkkkkkkkkkkkkkk.',
      '............................',
    ]);

  return {
    neutral: exact('hhsssssssshh', 'kwessssssewk', 'keesssssseks', 'hhmmmmhh'),
    happy:   exact('hhsssssssshh', 'kwessssssewk', 'ksssssssssks', 'hhwwwwhh'),
    alert:   exact('hssssssssssh', 'wwesssssseww', 'keesssssseks', 'hhkkkkhh'),
    smirk:   exact('hhsssssssshs', 'kwessssssewk', 'keesssssseks', 'hhssmmwh'),
    sad:     exact('shsssssssshs', 'ssessssssesk', 'keesssssseks', 'hhkmmkhh'),
  };
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  N: {
    id: 'N',
    name: 'NOVA',
    role: 'Station Tactical AI',
    identityLabel: 'Synthetic AI · Non-Binary',
    bio: 'Garuda Station’s primary orbital intelligence. Built by former Director Surya to calculate trajectories and preserve crew survival above protocol.',
    specialty: 'Flight Telemetry & Risk Calculation',
    voicePitch: 740,
    voiceType: 'square',
    accentColor: '#4de8ff',
    eyeRows: [9, 10],
    mouthRow: 13,
    palette: {
      k: '#090b16',
      c: '#4de8ff',
      d: '#1a6a8a',
      w: '#ffffff',
      y: '#ffd23f',
      r: '#ff5d73',
      g: '#6ee7a0',
      h: '#a5f3fc',
    },
    sprites: makeNovaSprites(),
  },
  R: {
    id: 'R',
    name: 'Captain Rani',
    role: 'Chief Propulsion Engineer',
    identityLabel: 'Female · She/Her',
    bio: 'Former orbital test pilot who survived a solid-booster cascade in 2036. She trusts hardware margins, Delta-V math, and her wrenches.',
    specialty: 'Thrust-to-Weight & Staging Systems',
    voicePitch: 390,
    voiceType: 'triangle',
    accentColor: '#ff9f1c',
    eyeRows: [8, 9],
    mouthRow: 12,
    palette: {
      k: '#100c18',
      h: '#361b12',
      a: '#592d1e',
      s: '#e3a574',
      d: '#c27e4d',
      p: '#f08080',
      e: '#161b2e',
      w: '#ffffff',
      m: '#b84a57',
      c: '#fef08a',
      t: '#ea580c',
      u: '#9a3412',
      y: '#ffd23f',
    },
    sprites: makeRaniSprites(),
  },
  B: {
    id: 'B',
    name: 'Dr. Bima',
    role: 'Lead Astrophysicist',
    identityLabel: 'Male · He/Him',
    bio: 'Detected the first 11-minute harmonic pulse originating beyond Neptune. Believes the signal is structured telemetry, not cosmic noise.',
    specialty: 'Spectroscopy & Signal Decoding',
    voicePitch: 250,
    voiceType: 'square',
    accentColor: '#6ee7a0',
    eyeRows: [6, 7],
    mouthRow: 11,
    palette: {
      k: '#0d0b16',
      h: '#cbd5e1',
      w: '#ffffff',
      s: '#d49a70',
      d: '#ab7048',
      e: '#1e293b',
      g: '#60a5fa',
      m: '#9b4444',
      c: '#f1f5f9',
      t: '#059669',
      u: '#065f46',
    },
    sprites: makeBimaSprites(),
  },
  V: {
    id: 'V',
    name: 'Auditor Vex',
    role: 'Orbital Consortium Envoy',
    identityLabel: 'Male · He/Him',
    bio: 'Sent by the Orbital Consortium to audit Garuda’s budget—or shut it down. Yet Vex knows more about Surya’s final classified file than he admits.',
    specialty: 'Risk Audits & Classified Directives',
    voicePitch: 205,
    voiceType: 'sawtooth',
    accentColor: '#ff5d73',
    eyeRows: [6, 7],
    mouthRow: 11,
    palette: {
      k: '#0b0812',
      h: '#be123c',
      r: '#fb7185',
      s: '#ecc1a1',
      d: '#c9936d',
      e: '#1e1b4b',
      v: '#312e81',
      w: '#ffffff',
      m: '#9f1239',
      c: '#c084fc',
      t: '#581c87',
      u: '#3b0764',
      y: '#ffd23f',
    },
    sprites: makeVexSprites(),
  },
  T: {
    id: 'T',
    name: 'Chief Tari',
    role: 'Exo-Foundry Metallurgist',
    identityLabel: 'Female · She/Her',
    bio: 'Master materials engineer running Garuda’s microgravity smelter. Turns raw lunar Titanium, Cryo-Silica, and Xenon into flight-grade hardware.',
    specialty: 'Aerospace Alloys & Thermal Shielding',
    voicePitch: 465,
    voiceType: 'triangle',
    accentColor: '#ffd23f',
    eyeRows: [7, 8],
    mouthRow: 11,
    palette: {
      k: '#100c18',
      h: '#1f2937',
      a: '#4b5563',
      s: '#d69765',
      d: '#b37142',
      p: '#f28482',
      e: '#0f172a',
      w: '#ffffff',
      m: '#c04d5c',
      c: '#ffd23f',
      t: '#eab308',
      u: '#854d0e',
      y: '#4de8ff',
    },
    sprites: makeTariSprites(),
  },
  O: {
    id: 'O',
    name: 'Cmdr. Orion',
    role: 'Deep-Space Astrogator',
    identityLabel: 'Male · He/Him',
    bio: 'Trajectory specialist who charts Hohmann transfers and Oberth gravity assists across the outer planets with sub-second precision.',
    specialty: 'Orbital Mechanics & Gravity Assists',
    voicePitch: 310,
    voiceType: 'sine',
    accentColor: '#818cf8',
    eyeRows: [6, 7],
    mouthRow: 11,
    palette: {
      k: '#090b1a',
      h: '#312e81',
      s: '#e5b899',
      d: '#bd8a68',
      e: '#1e1b4b',
      w: '#ffffff',
      m: '#8f3a3a',
      c: '#38bdf8',
      t: '#4338ca',
      u: '#1e1b4b',
      y: '#ffd23f',
    },
    sprites: makeOrionSprites(),
  },
  S: {
    id: 'S',
    name: 'Director Surya',
    role: 'Former Garuda Director',
    identityLabel: 'Male · He/Him',
    bio: 'Vanished aboard the experimental Pioneer-9 probe beyond Neptune. His encrypted telemetry fragments form the trail leading outward.',
    specialty: 'Deep-Space Resonance Pioneer',
    voicePitch: 235,
    voiceType: 'sine',
    accentColor: '#c084fc',
    eyeRows: [6, 7],
    mouthRow: 10,
    palette: {
      k: '#0b081a',
      h: '#cbd5e1',
      s: '#c4b5fd',
      d: '#8b5cf6',
      e: '#1e1b4b',
      w: '#ffffff',
      m: '#9333ea',
      c: '#4de8ff',
      t: '#6b21a8',
      u: '#3b0764',
    },
    sprites: makeSuryaSprites(),
  },
};
