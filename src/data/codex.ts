import { CodexEntry } from '../types/game';

export const CODEX_ENTRIES: CodexEntry[] = [
  {
    id: 'tsiolkovsky',
    title: 'The Tsiolkovsky Rocket Equation',
    category: 'Propulsion',
    formula: 'Δv = Isp × g₀ × ln(m₀ / mf)',
    summary: 'Every kilogram of payload you add exponentially increases the fuel required to reach orbit.',
    deepDive:
      'Konstantin Tsiolkovsky proved in 1903 that a rocket’s maximum velocity change (Delta-V) depends on two factors: how fast propellant exits the nozzle (Specific Impulse, Isp) and the ratio of full wet mass (m₀) to empty dry mass (mf). Because mass is inside a natural logarithm, piling on heavy sensors without upgrading fuel capacity or Isp sharply drops your Δv.',
    inGameImpact: 'Adding instruments or heavy shields lowers Δv. Pair heavy payloads with larger fuel tanks or higher-Isp Ion/Nuclear engines.',
  },
  {
    id: 'twr',
    title: 'Thrust-to-Weight Ratio (TWR)',
    category: 'Propulsion',
    formula: 'TWR = Thrust / (Mass × 9.81 m/s²)',
    summary: 'Efficiency means nothing if your engine cannot overcome gravity at liftoff.',
    deepDive:
      'An Ion thruster has extraordinary fuel efficiency (Isp > 3000s), yet produces only millinewtons of thrust—it could never lift a rocket off Earth’s pad. Chemical and Aerospike engines provide high TWR (> 1.2) to punch through Earth’s atmosphere before upper stages switch to high-efficiency propulsion.',
    inGameImpact: 'Each mission requires a minimum TWR to clear the launch window. Heavy hulls require high-thrust engines.',
  },
  {
    id: 'hohmann',
    title: 'Hohmann Transfer & Oberth Effect',
    category: 'Astrophysics',
    formula: 'ΔEk = ½m(v + Δv)² - ½mv²',
    summary: 'Firing engines deepest inside a planet’s gravity well yields the highest kinetic energy gain.',
    deepDive:
      'A Hohmann transfer uses two elliptical engine burns to bridge two circular orbits with minimal fuel. Combined with the Oberth Effect—firing engines at periapsis when the spacecraft is moving fastest—engineers squeeze extra velocity from every drop of propellant.',
    inGameImpact: 'Hitting the Stage Separation / Max-Q timing window during launch simulates an optimal ascent burn, granting bonus Δv.',
  },
  {
    id: 'helium3',
    title: 'Lunar Helium-3 (³He) Catalysis',
    category: 'Materials',
    formula: '²H + ³He → ⁴He (3.6 MeV) + p (14.7 MeV)',
    summary: 'A rare solar-wind isotope embedded in lunar regolith that enables clean thermal propulsion.',
    deepDive:
      'Earth’s magnetic field deflects Helium-3 from the solar wind, making it scarce on Earth. The Moon lacks a global magnetosphere, so ³He accumulates in lunar craters over billions of years. In fusion-assisted nuclear thermal engines, ³He produces high energy with minimal neutron radiation.',
    inGameImpact: 'Harvested from Lunar and outer-system missions; required in the Exo-Foundry to upgrade Propulsion & Nuclear cores.',
  },
  {
    id: 'radiation',
    title: 'Magnetospheric Radiation Hardening',
    category: 'Materials',
    formula: 'Dose ∝ Φ_particles × Z² / Shield_Density',
    summary: 'Jupiter’s magnetosphere traps charged particles lethal to unshielded silicon microchips.',
    deepDive:
      'Solar coronal mass ejections and planetary radiation belts (especially around Jupiter and Europa) induce single-event upsets in avionics. Cryo-Silica ceramic layers and active magnetic deflectors absorb or redirect ionizing flux before telemetry corrupts.',
    inGameImpact: 'Equipping Shields prevents fatal launch/transit failures and grants active Shield Pulse charges during orbital flight.',
  },
  {
    id: 'lagrange',
    title: 'Lagrange Point Halo Orbits',
    category: 'Astrophysics',
    formula: '∇U_eff(L1..L5) = 0',
    summary: 'Gravitational balance points where a spacecraft can park with minimal station-keeping fuel.',
    deepDive:
      'At Sun-Earth L2 (~1.5 million km behind Earth), solar gravity and Earth’s gravity combine so a probe orbits the Sun at the exact same period as Earth. This provides an unobstructed deep-space view ideal for infrared interferometry and faint-signal relays.',
    inGameImpact: 'Unlocks deep-space relay context in Mission 3 (Lagrange Echo) and explains power/thermal balance.',
  },
  {
    id: 'cryovolcanism',
    title: 'Tidal Heating & Cryovolcanism',
    category: 'Astrophysics',
    formula: 'E_tidal ∝ (R⁵ × e²) / a⁶',
    summary: 'Jupiter’s immense tidal flexing keeps Europa’s subsurface ocean liquid beneath kilometers of ice.',
    deepDive:
      'As Europa follows an eccentric orbit around Jupiter, gravitational kneading heats its rocky mantle and sustains a global saltwater ocean. Fractures in the ice shell occasionally vent massive water-vapor plumes into space—allowing flyby spectrometers to sample the ocean without drilling.',
    inGameImpact: 'Explains Europa’s Cryo-Plume hazards and why Cryo-Silica & Spectrometers yield massive science returns there.',
  },
  {
    id: 'resonance',
    title: '11-Minute Harmonic Resonance',
    category: 'Signal Mystery',
    formula: 'f_n = n × 1.515 mHz (Prime Modulated)',
    summary: 'A structured non-natural carrier wave detected beyond Neptune by Pioneer-9.',
    deepDive:
      'Natural pulsars emit regular radio sweeps driven by spin inertia. The Neptune signal, however, shifts phase in prime-number intervals every 660 seconds—an unmistakable signature of deliberate error-corrected telemetry echoing from Kuiper-edge space.',
    inGameImpact: 'The core narrative mystery connecting Director Surya, the Orbital Consortium, and Mission 8.',
  },
];
