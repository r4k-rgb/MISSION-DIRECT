import {
  ComputedRocketStats,
  EnginePart,
  HullPart,
  InstrumentPart,
  MaterialDef,
  MaterialId,
  MissionDef,
  RocketConfig,
  ShieldPart,
  UpgradeDef,
  UpgradeId,
} from '../types/game';

export const MATERIALS: Record<MaterialId, MaterialDef> = {
  ti: {
    id: 'ti',
    symbol: 'Ti',
    name: 'Titanium Alloy',
    color: '#94a3b8',
    description: 'High-strength, low-density aerospace framing alloy.',
    scienceNote: 'Alpha-beta titanium resists cryogenic embrittlement while keeping dry mass minimal.',
  },
  he3: {
    id: 'he3',
    symbol: '³He',
    name: 'Helium-3',
    color: '#ffd23f',
    description: 'Rare lunar isotope used in clean high-energy propulsion catalysis.',
    scienceNote: 'Aneutronic ³He fusion reactions yield extreme exhaust velocity with minimal structural radiation.',
  },
  si: {
    id: 'si',
    symbol: 'SiO₂',
    name: 'Cryo-Silica',
    color: '#4de8ff',
    description: 'Aerogel-reinforced thermal and radiation-hardened silica.',
    scienceNote: 'Low thermal conductivity protects delicate electronics during aerobraking and deep-space cold.',
  },
  xe: {
    id: 'xe',
    symbol: 'Xe',
    name: 'Xenon Pellets',
    color: '#a78bfa',
    description: 'Dense noble gas propellant optimized for Hall-effect ion thrusters.',
    scienceNote: 'Xenon’s high atomic mass (131.3 u) and low ionization energy maximize momentum per watt.',
  },
  qc: {
    id: 'qc',
    symbol: 'Qc',
    name: 'Quantum Core',
    color: '#6ee7a0',
    description: 'Superconducting photonic resonator recovered from outer-system anomalies.',
    scienceNote: 'Entangled interferometer cavities filter cosmic noise out of faint deep-space telemetry.',
  },
};

export const HULLS: HullPart[] = [
  {
    id: 'hull_kestrel',
    name: 'Kestrel Light Bus',
    cost: 20,
    massTons: 6,
    fuelCapacity: 14,
    reliability: 0.84,
    powerGen: 140,
    maxInstruments: 2,
    visualTier: 0,
    description: 'Compact aluminum-lithium sounding airframe for orbital weather probes.',
    scienceNote: 'Lightweight single-stage tankage limits fuel mass ratio (m₀/mf), capping maximum Δv.',
  },
  {
    id: 'hull_garuda',
    name: 'Garuda-II Medium',
    cost: 42,
    massTons: 12,
    fuelCapacity: 32,
    reliability: 0.9,
    powerGen: 320,
    maxInstruments: 3,
    unlockMission: 1,
    visualTier: 1,
    description: 'Two-stage orbital launcher with dual deployable solar wings.',
    scienceNote: 'Dropping an empty first stage mid-flight sheds dead dry mass, boosting upper-stage Δv.',
  },
  {
    id: 'hull_valkyrie',
    name: 'Valkyrie Heavy',
    cost: 70,
    massTons: 20,
    fuelCapacity: 62,
    reliability: 0.94,
    powerGen: 420,
    maxInstruments: 3,
    unlockMission: 3,
    visualTier: 2,
    description: 'Tri-core heavy launcher built for interplanetary Hohmann transfers.',
    scienceNote: 'Strap-on side boosters lift heavy propellant loads clear of Earth’s dense lower atmosphere.',
  },
  {
    id: 'hull_aegis',
    name: 'Aegis Deep-Hull',
    cost: 105,
    massTons: 26,
    fuelCapacity: 94,
    reliability: 0.96,
    powerGen: 620,
    maxInstruments: 4,
    unlockMission: 5,
    visualTier: 3,
    description: 'RTG-powered interplanetary frame reinforced with Titanium-Silica ribs.',
    scienceNote: 'Radioisotope Thermoelectric Generators supply constant power far from the Sun where solar fails.',
  },
  {
    id: 'hull_archon',
    name: 'Archon Titan Frame',
    cost: 140,
    massTons: 32,
    fuelCapacity: 135,
    reliability: 0.98,
    powerGen: 900,
    maxInstruments: 4,
    unlockUpgrade: { id: 'metallurgy', level: 3 },
    visualTier: 4,
    description: 'Experimental Exo-Foundry lattice hull forged for Kuiper-edge expeditions.',
    scienceNote: 'Isogrid titanium-composite walls cut structural dry mass by 18%, dramatically raising mass ratio.',
  },
];

export const ENGINES: EnginePart[] = [
  {
    id: 'eng_kerolox',
    name: 'Kerolox-1A',
    cost: 14,
    massTons: 3,
    thrustKN: 280,
    isp: 310,
    powerDraw: 10,
    flameColor: '#ffd23f',
    description: 'Reliable RP-1 kerosene & liquid oxygen booster engine.',
    scienceNote: 'High thrust density lifts heavy stages off the pad, though moderate Isp (310s) burns fuel fast.',
  },
  {
    id: 'eng_hydrolox',
    name: 'Hydrolox Cryo',
    cost: 28,
    massTons: 4,
    thrustKN: 620,
    isp: 450,
    powerDraw: 30,
    unlockMission: 1,
    flameColor: '#4de8ff',
    description: 'Liquid hydrogen cryogenic engine with clean, high-velocity exhaust.',
    scienceNote: 'Light H₂ exhaust molecules exit faster (Isp 450s), yielding superior Δv per ton of fuel.',
  },
  {
    id: 'eng_hall',
    name: 'Xenon Hall Drive',
    cost: 45,
    massTons: 5,
    thrustKN: 1120,
    isp: 680,
    powerDraw: 140,
    unlockMission: 2,
    flameColor: '#818cf8',
    description: 'Hybrid booster paired with a Xenon Hall-effect electrostatic thruster.',
    scienceNote: 'Accelerates ionized Xenon via electric fields, trading 140W of bus power for huge Specific Impulse.',
  },
  {
    id: 'eng_ntr',
    name: '³He Nuclear Thermal',
    cost: 70,
    massTons: 7,
    thrustKN: 1680,
    isp: 900,
    powerDraw: 90,
    unlockMission: 4,
    flameColor: '#6ee7a0',
    description: 'Helium-3 catalyzed fission core superheating hydrogen propellant.',
    scienceNote: 'Delivers both high thrust and ~900s Isp without combustion limits—ideal for outer-planet transfers.',
  },
  {
    id: 'eng_mpd',
    name: 'MPD Plasma Spike',
    cost: 95,
    massTons: 7,
    thrustKN: 2350,
    isp: 1200,
    powerDraw: 260,
    unlockUpgrade: { id: 'propulsion', level: 3 },
    flameColor: '#e879f9',
    description: 'Magnetoplasmadynamic aerospike forged in Garuda’s propulsion lab.',
    scienceNote: 'Lorentz forces (J × B) accelerate plasma across all atmospheric pressures for unmatched Δv.',
  },
];

export const INSTRUMENTS: InstrumentPart[] = [
  {
    id: 'inst_cam',
    name: 'Multispectral Cam',
    cost: 10,
    massTons: 1.5,
    powerDraw: 35,
    scienceBase: 2.5,
    specialtyTag: 'optics',
    description: 'Crisp visible & infrared imaging telescope.',
    scienceNote: 'Captures cloud albedo, surface craters, and thermal plumes across multiple wavelength bands.',
  },
  {
    id: 'inst_spectro',
    name: 'Mass Spectrometer',
    cost: 20,
    massTons: 2.5,
    powerDraw: 65,
    scienceBase: 4.5,
    specialtyTag: 'spectro',
    unlockMission: 1,
    description: 'Ionizes atmospheric gases and plume droplets to identify isotopes.',
    scienceNote: 'Separates ions by mass-to-charge ratio, revealing organic compounds and water salinity.',
  },
  {
    id: 'inst_radar',
    name: 'Ice-Penetrating Radar',
    cost: 30,
    massTons: 3.5,
    powerDraw: 95,
    scienceBase: 6.0,
    specialtyTag: 'radar',
    unlockMission: 1,
    description: 'Synthetic-aperture radar mapping subsurface oceans and buried ruins.',
    scienceNote: 'Low-frequency radio pulses reflect off density boundaries kilometers beneath dust or ice.',
  },
  {
    id: 'inst_plasma',
    name: 'Magneto-Plasma Array',
    cost: 42,
    massTons: 4.0,
    powerDraw: 120,
    scienceBase: 8.0,
    specialtyTag: 'plasma',
    unlockMission: 3,
    description: 'Tri-axial fluxgate magnetometer & solar wind particle analyzer.',
    scienceNote: 'Measures magnetic field distortions caused by conductive subsurface oceans or active beacons.',
  },
  {
    id: 'inst_quantum',
    name: 'Quantum Interferometer',
    cost: 60,
    massTons: 4.5,
    powerDraw: 190,
    scienceBase: 12.0,
    specialtyTag: 'quantum',
    unlockUpgrade: { id: 'quantum', level: 2 },
    description: 'Cryo-cooled photonic receiver locked onto the 11-minute harmonic.',
    scienceNote: 'Squeezed-light interferometry beats the standard quantum shot-noise limit for faint deep-space signals.',
  },
];

export const SHIELDS: ShieldPart[] = [
  {
    id: 'shd_ablative',
    name: 'Cryo-Silica Tiles',
    cost: 14,
    massTons: 2,
    powerDraw: 10,
    hazardResist: 0.06,
    shieldCharges: 1,
    description: 'Lightweight ceramic heat & micrometeorite plating.',
    scienceNote: 'Absorbs peak reentry heating by controlled ablation while deflecting orbital debris.',
  },
  {
    id: 'shd_faraday',
    name: 'Faraday Rad-Mesh',
    cost: 26,
    massTons: 3,
    powerDraw: 55,
    hazardResist: 0.1,
    shieldCharges: 2,
    unlockMission: 2,
    description: 'Active electromagnetic mesh protecting avionics from solar flares.',
    scienceNote: 'Generates a localized magnetic buffer that diverts charged solar protons around sensitive chips.',
  },
  {
    id: 'shd_magneto',
    name: 'Jovian Deflector',
    cost: 44,
    massTons: 4,
    powerDraw: 110,
    hazardResist: 0.14,
    shieldCharges: 3,
    unlockUpgrade: { id: 'shielding', level: 2 },
    description: 'Superconducting plasma shield rated for Jupiter & Kuiper radiation.',
    scienceNote: 'Creates an artificial mini-magnetosphere capable of repelling high-energy cosmic rays.',
  },
];

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'budget',
    name: 'Consortium Grant',
    maxLevel: 5,
    baseCredits: 35,
    materialCosts: [
      { ti: 1 },
      { ti: 2 },
      { ti: 3, si: 1 },
      { ti: 4, he3: 1 },
      { ti: 5, qc: 1 },
    ],
    effectSummary: '+15 Mission Budget per level',
    scienceNote: 'Demonstrated telemetry accuracy persuades Consortium auditors to expand flight allocations.',
  },
  {
    id: 'propulsion',
    name: 'Nozzle & Isp Lab',
    maxLevel: 5,
    baseCredits: 45,
    materialCosts: [
      { ti: 1 },
      { he3: 1, ti: 1 },
      { he3: 2, xe: 1 },
      { he3: 2, xe: 2 },
      { he3: 3, qc: 1 },
    ],
    effectSummary: '+8% Δv & +8% Thrust per level (Lv3 unlocks MPD Plasma)',
    scienceNote: 'Bell-nozzle contouring and ³He injection increase effective exhaust velocity.',
  },
  {
    id: 'telemetry',
    name: 'Telemetry Compression',
    maxLevel: 5,
    baseCredits: 40,
    materialCosts: [
      { si: 1 },
      { si: 2 },
      { si: 2, xe: 1 },
      { si: 3, qc: 1 },
      { si: 4, qc: 2 },
    ],
    effectSummary: '+12% Science Return per level',
    scienceNote: 'Error-correcting Reed-Solomon & LDPC coding triples science bandwidth over deep-space links.',
  },
  {
    id: 'metallurgy',
    name: 'Exo-Foundry Alloys',
    maxLevel: 5,
    baseCredits: 45,
    materialCosts: [
      { ti: 2 },
      { ti: 3 },
      { ti: 3, si: 2 },
      { ti: 4, si: 2 },
      { ti: 5, he3: 2 },
    ],
    effectSummary: '-6% Dry Mass & +4% Reliability (Lv3 unlocks Archon Hull)',
    scienceNote: 'Zero-G titanium sintering produces defect-free crystal lattices lighter than Earth-cast hulls.',
  },
  {
    id: 'shielding',
    name: 'Rad-Hardening Lab',
    maxLevel: 5,
    baseCredits: 40,
    materialCosts: [
      { si: 1 },
      { si: 2, ti: 1 },
      { si: 2, xe: 1 },
      { si: 3, he3: 1 },
      { si: 4, qc: 1 },
    ],
    effectSummary: '+10% Hazard Resist & +1 Flight Shield (Lv2 unlocks Jovian Deflector)',
    scienceNote: 'Cryo-Silica substrates and superconducting coils harden processors against particle cascades.',
  },
  {
    id: 'quantum',
    name: 'Signal Decoder Array',
    maxLevel: 5,
    baseCredits: 55,
    materialCosts: [
      { xe: 1 },
      { xe: 2, qc: 1 },
      { qc: 2, si: 2 },
      { qc: 3, he3: 2 },
      { qc: 4, xe: 3 },
    ],
    effectSummary: '+40W Bus Power & +10% Anomaly Luck (Lv2 unlocks Quantum Interferometer)',
    scienceNote: 'Photonic phase-locked loops extract coherent data out of sub-noise deep-space carrier waves.',
  },
];

export function computeRocketStats(
  config: RocketConfig,
  mission: MissionDef,
  upgrades: Record<UpgradeId, number>
): ComputedRocketStats {
  const hull = HULLS.find((h) => h.id === config.hullId) || HULLS[0];
  const engine = ENGINES.find((e) => e.id === config.engineId) || ENGINES[0];
  const instruments = config.instrumentIds
    .map((id) => INSTRUMENTS.find((i) => i.id === id))
    .filter((x): x is InstrumentPart => Boolean(x));
  const shield = config.shieldId ? SHIELDS.find((s) => s.id === config.shieldId) || null : null;

  const budgetLimit = mission.budget + upgrades.budget * 15;
  const totalCost =
    hull.cost +
    engine.cost +
    instruments.reduce((acc, i) => acc + i.cost, 0) +
    (shield ? shield.cost : 0);

  const massMult = Math.max(0.65, 1 - upgrades.metallurgy * 0.06);
  const rawDryMass =
    hull.massTons +
    engine.massTons +
    instruments.reduce((acc, i) => acc + i.massTons, 0) +
    (shield ? shield.massTons : 0);

  const dryMass = Number((rawDryMass * massMult).toFixed(1));
  const wetMass = Number((dryMass + hull.fuelCapacity).toFixed(1));

  // TWR = Thrust (kN) / (WetMass (t) * 9.81 m/s^2)
  const thrustBonus = 1 + upgrades.propulsion * 0.08;
  const twr = Number(((engine.thrustKN * thrustBonus) / (wetMass * 9.81)).toFixed(2));

  // Tsiolkovsky: dv (km/s) = Isp * 9.81 * ln(m0 / mf) / 1000 * stagingFactor
  const ispEffective = engine.isp * (1 + upgrades.propulsion * 0.08);
  const stagingBoost = 1 + hull.visualTier * 0.14;
  const deltaV = Number(
    (((ispEffective * 9.81 * Math.log(wetMass / Math.max(1, dryMass))) / 1000) * stagingBoost).toFixed(2)
  );

  const powerGen = hull.powerGen + upgrades.quantum * 40;
  const powerDraw =
    engine.powerDraw +
    instruments.reduce((acc, i) => acc + i.powerDraw, 0) +
    (shield ? shield.powerDraw : 0);
  const powerNet = powerGen - powerDraw;

  // Science output with mission-matching synergy bonus (+25% if recommended specialty mounted)
  let rawSci = instruments.reduce((acc, inst) => {
    const synergy = inst.specialtyTag === mission.recommendedTag ? 1.25 : 1.0;
    return acc + inst.scienceBase * synergy;
  }, 0);
  rawSci *= 1 + upgrades.telemetry * 0.12;
  const scienceOutput = Number(rawSci.toFixed(1));

  const hazardPenalty: Record<MissionDef['hazardLevel'], number> = {
    Low: 0,
    Moderate: 0.04,
    High: 0.09,
    Severe: 0.14,
    Extreme: 0.2,
  };
  const rel = Math.min(
    0.99,
    Math.max(
      0.35,
      hull.reliability +
        upgrades.metallurgy * 0.02 +
        upgrades.shielding * 0.02 +
        (shield ? shield.hazardResist : 0) -
        hazardPenalty[mission.hazardLevel]
    )
  );
  const reliability = Number(rel.toFixed(2));
  const shieldCharges = (shield ? shield.shieldCharges : 0) + (upgrades.shielding >= 2 ? 1 : 0);

  const issues: string[] = [];
  if (totalCost > budgetLimit) issues.push(`Over budget by ${totalCost - budgetLimit} CR`);
  if (twr < mission.reqTWR) issues.push(`TWR too low (${twr} < ${mission.reqTWR} min)`);
  if (deltaV < mission.reqDeltaV) issues.push(`Delta-V short (${deltaV} < ${mission.reqDeltaV} km/s)`);
  if (powerNet < 0) issues.push(`Power deficit (${powerNet}W)`);
  if (instruments.length === 0) issues.push('Mount at least 1 science instrument');
  if (instruments.length > hull.maxInstruments)
    issues.push(`Too many instruments (${instruments.length}/${hull.maxInstruments})`);

  let novaTip = 'All telemetry nominal. Cleared for orbital ignition!';
  if (issues.length > 0) {
    novaTip = issues[0] + '. Adjust your staging or upgrade in the Exo-Foundry.';
  } else if (scienceOutput < mission.reqScience) {
    novaTip = `Cleared for flight, but Science (${scienceOutput}) is below ${mission.reqScience} needed for Star 2.`;
  } else if (!shield && mission.hazardLevel !== 'Low') {
    novaTip = `Warning: ${mission.hazardLevel} radiation/debris zone. Consider mounting Shielding.`;
  } else if (totalCost <= budgetLimit * 0.85) {
    novaTip = 'Optimal build! Under 85% budget qualifies for the Efficiency Star.';
  }

  return {
    totalCost,
    budgetLimit,
    dryMass,
    wetMass,
    twr,
    deltaV,
    powerNet,
    powerGen,
    powerDraw,
    scienceOutput,
    reliability,
    shieldCharges,
    canLaunch: issues.length === 0,
    issues,
    novaTip,
  };
}
