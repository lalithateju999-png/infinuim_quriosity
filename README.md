# ONE SHOT: THE ORACLE
> **Quriosity Quantum Game Development Hackathon (Infinium 2026)**  
> **Organized by ISAQC (IIIT Society for Applied Quantum Computing), IIIT Hyderabad**  
> **Track:** Option 2 — Deutsch–Jozsa: The Parity Oracle  
> **Repository:** [https://github.com/lalithateju999-png/infinuim_quriosity.git](https://github.com/lalithateju999-png/infinuim_quriosity.git)

---

## 🎮 Playable Game Overview

**ONE SHOT: THE ORACLE** is an interactive, browser-playable quantum game where players discover and operate the **Deutsch–Jozsa quantum algorithm** through direct gameplay mechanics rather than lectures.

A mysterious security vault is protected by unknown boolean oracles $f(x) \to \{0, 1\}$. Every oracle is promised to be either:
1. **CONSTANT**: All inputs produce the exact same output ($f(x) = 0$ for all $x$, or $f(x) = 1$ for all $x$).
2. **BALANCED**: Exactly half of all possible inputs produce $0$, and the other half produce $1$.

The vault security protocol grants you **strictly 1 query ticket**. A classical computer querying one input at a time is guaranteed to fail or guess blindly (requiring up to $2^{n-1} + 1$ queries in the worst case). Using your **Quantum Probe**, you prepare superpositions, exploit **Phase Kickback** to encode the function into wave phase signs, recombine the waves via **Interference**, and determine the oracle's global parity in a single shot with 100% mathematical certainty.

---

## 🧠 Core Quantum Concepts & Gameplay Mechanics

The game explicitly refutes the common myth that *"a quantum computer simply checks all inputs at the same time and reads all answers."* Instead, the game faithfully models the authentic 5-stage quantum pipeline:

```
[1. PREPARE] ─────────► [2. SUPERPOSITION] ─────────► [3. ORACLE QUERY] ─────────► [4. INTERFERENCE] ─────────► [5. MEASUREMENT]
|0...0⟩ inputs           H^(⊗n) on inputs              Reversible U_f              Final H^(⊗n) on inputs         |0...0⟩ = CONSTANT
|1⟩ ancilla target       H on ancilla target           Phase Kickback (-1)^f(x)    Wave Recombination             |x≠0⟩   = BALANCED
```

### 1. Superposition & Phase (Level 1)
- The player interacts with single qubits in $|0\rangle$ and $|1\rangle$.
- Applying the **Hadamard gate ($H$)** on $|0\rangle$ creates the in-phase superposition $|+\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}}$ where both amplitudes are $+1/\sqrt{2}$ ($0^\circ$ phase).
- Applying $H$ on $|1\rangle$ creates the out-of-phase superposition $|-\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}}$ where the $|1\rangle$ amplitude has a negative sign $-1/\sqrt{2}$ ($180^\circ$ phase).

### 2. The Classical Bottleneck (Level 2)
- Players meet the Black-Box Oracle machine $f(x)$.
- A classical terminal demonstrates that checking individual inputs ($x=0$, $x=1$) consumes multiple sequential queries ($2^{n-1} + 1$ worst case). With only 1 query allowed, classical probing is trapped in ambiguity.

### 3. Phase Kickback (Level 3)
- The core secret: The reversible oracle computes $U_f |x, y\rangle = |x, y \oplus f(x)\rangle$.
- When the target ancilla qubit $y$ is set to $|-\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}}$:
  $$\begin{aligned}
  U_f(|x\rangle |-\rangle) &= |x\rangle \frac{|0 \oplus f(x)\rangle - |1 \oplus f(x)\rangle}{\sqrt{2}} \\
  &= (-1)^{f(x)} |x\rangle |-\rangle
  \end{aligned}$$
- **Visual Representation:** Visual phase dials and glowing wave packets show that the oracle leaves the target qubit in $|-\rangle$ while *kicking back* a phase flip $(-1)^{f(x)}$ ($180^\circ$ inversion) directly into the input state $|x\rangle$!

### 4. Wave Interference (Level 4)
- Quantum measurement cannot directly observe phase signs because $|+1|^2 = |-1|^2 = 1$.
- Applying the final Hadamard $H^{\otimes n}$ transforms relative phases into measurable constructive and destructive interference:
  $$\alpha_0 = \frac{1}{2^n} \sum_{x \in \{0,1\}^n} (-1)^{f(x)}$$
  - **Constant Oracles:** All terms have identical phase signs $(+1 \dots +1 \text{ or } -1 \dots -1)$. Constructive interference yields amplitude $\pm 1$ on $|0\dots0\rangle$ (100% probability), with total destructive cancellation on all other states.
  - **Balanced Oracles:** Exactly half the terms are $+1$ and half are $-1$. The sum cancels completely to $\alpha_0 = 0$ on $|0\dots0\rangle$. Constructive interference concentrates on non-zero states $|x \neq 0\rangle$.

### 5. The One-Shot Vault Protocol (Level 5)
- The player breaches multi-tier vault sectors (1-qubit, 2-qubit, 3-qubit oracles).
- Using only **1 Oracle Query Ticket**, the player executes the 4-step quantum pipeline and enters the diagnostic verdict with 100% mathematical precision.

### 6. Quantum Oracle Laboratory (Sandbox Mode)
- Design arbitrary truth tables for 1-qubit, 2-qubit, and 3-qubit boolean functions.
- Real-time validity analyzer, full $(n+1)$-qubit Dirac state vector inspect, phase dials, and step-by-step state evolution debugger.

---

## ⚡ Quick Start & How to Run

### Prerequisites
- **Node.js** (v18 or newer recommended, tested on Node v25.8.1)
- **npm** (v9+ or newer)

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Local Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173/` (or the port shown in terminal).

### 3. Run Automated Physics & Quantum Unit Tests
```bash
npm test
```
Executes the Vitest suite verifying complex arithmetic, unitary gate operations, phase kickback, and Deutsch-Jozsa classification across 1-qubit, 2-qubit, and 3-qubit oracles.

### 4. Build for Production Deployment
```bash
npm run build
npm run preview
```
Creates a zero-dependency static production build in `dist/` ready to deploy to GitHub Pages, Vercel, or Netlify.

---

## 🔬 Mathematical Implementation Architecture

The quantum physics engine is isolated in `src/quantum/` and operates as a pure, mathematically rigorous state-vector simulator:

- **`src/quantum/complex.ts`**: Exact complex arithmetic ($a + bi$, magnitude, modulus squared, phase angle in radians and degrees, normalization).
- **`src/quantum/stateVector.ts`**: Pure $N$-qubit state vector simulation ($2^N$ complex amplitudes), Kronecker tensor products, basis projections, probability extraction, and Dirac notation formatting.
- **`src/quantum/gates.ts`**: Single-qubit unitary operators ($H, X, Z, Y, I$) and arbitrary target-qubit gate application on $N$-qubit state vectors.
- **`src/quantum/oracle.ts`**: Exact reversible oracle operator $U_f |x, y\rangle = |x, y \oplus f(x)\rangle$, truth table generator, and predefined oracle libraries ($n=1, 2, 3$).
- **`src/quantum/deutschJozsa.ts`**: Step-by-step state snapshot recorder tracking wave amplitudes, real-time phase angles, ancilla decomposition, and measurement probabilities across the 5 algorithm stages.
- **`src/quantum/quantum.test.ts`**: 9 comprehensive unit tests verifying gate reversibility, phase kickback mathematics, and 100% deterministic Deutsch-Jozsa classification.

---

## 🎥 Recommended 60–90 Second Video Demo Flow

1. **0:00 - 0:15 (The Hook & Level 1)**: Show Level 1 with the single qubit. Flip to $|1\rangle$, hit Hadamard ($H$), and highlight the amber $-1$ phase dial ($180^\circ$ inversion) on $|1\rangle$.
2. **0:15 - 0:30 (The Dilemma & Level 2)**: Switch to Level 2. Send classical probes to the black-box oracle. Show that 1 query leaves you unable to distinguish constant from balanced, requiring multiple queries.
3. **0:30 - 0:45 (The Phase Kickback Aha! & Level 3)**: Switch to Level 3. Toggle target qubit to $|-\rangle$. Click **Execute Oracle Query**. Show the input qubit wave packet flipping its phase sign without changing the target qubit.
4. **0:45 - 1:05 (Interference & Level 4)**: Switch to Level 4. Compare Constant vs Balanced. Hit **Pulse Waves** to show constructive amplification on $|00\rangle$ (Constant) vs complete destructive cancellation on $|00\rangle$ (Balanced).
5. **1:05 - 1:25 (The One-Shot Vault Challenge & Level 5)**: Execute the 4-step pipeline on an unknown oracle in Level 5. Spend the 1 query ticket, measure non-zero, submit **BALANCED**, and watch the vault unlock with victory fanfare!
6. **1:25 - 1:30 (Comparison Modal & Wrap-up)**: Open the **Classical vs Quantum Speedup** modal to show the exponential query gap ($2^{n-1}+1$ vs $1$).

---

## 🛠️ Project Structure

```
infinuim_quriosity/
├── index.html                     # HTML5 Entry Point with dark sci-fi typography
├── package.json                   # Scripts, dependencies (React 19, Tailwind v4, Lucide, Vitest)
├── tsconfig.json                  # Strict TypeScript configuration
├── vite.config.ts                 # Vite bundler & Tailwind CSS plugin configuration
├── src/
│   ├── main.tsx                   # React root mount
│   ├── App.tsx                    # Main game container, level router & modal manager
│   ├── index.css                  # Custom quantum glowing aesthetics & animations
│   ├── audio/
│   │   └── sound.ts               # Zero-dependency procedural Web Audio quantum synthesizer
│   ├── quantum/
│   │   ├── complex.ts             # Complex number arithmetic & phase operations
│   │   ├── stateVector.ts         # N-qubit state vector simulation & Dirac notation
│   │   ├── gates.ts               # Unitary matrix operations (H, X, Z, I)
│   │   ├── oracle.ts              # U_f oracle engine & predefined oracle libraries
│   │   ├── deutschJozsa.ts        # 5-stage step snapshot engine & classical query calculator
│   │   └── quantum.test.ts        # Vitest suite for quantum physics verification
│   ├── levels/
│   │   └── levelsData.ts          # Progressive storyline, level rules & learning objectives
│   └── components/
│       ├── Navbar.tsx             # Level navigation, sound toggle, modal triggers
│       ├── PhaseDial.tsx          # Real-time phase arrow & sign indicator
│       ├── WaveformDisplay.tsx    # Wave packet, amplitude, probability & f(x) visualizer
│       ├── StepProgressTracker.tsx# 5-step visual pipeline progress indicator
│       ├── Level1ProbeDiscover.tsx# Level 1: Superposition & phase exploration
│       ├── Level2OracleIntro.tsx  # Level 2: Black box & classical query limits
│       ├── Level3PhaseKickback.tsx# Level 3: Phase Kickback discovery laboratory
│       ├── Level4Interference.tsx # Level 4: Wave recombination & interference analyzer
│       ├── Level5VaultChallenge.tsx# Level 5: 1-Shot randomized vault security challenge
│       ├── OracleSandbox.tsx      # Level 6: Custom truth table designer & quantum debugger
│       ├── ClassicalComparisonModal.tsx # Interactive query race & misconception buster
│       └── GlossaryModal.tsx      # High school explanations + Dirac math formulary
└── README.md                      # Comprehensive documentation & hackathon submission report
```

---

## 📜 Team Learnings & Key Takeaways

1. **Why Phase Kickback is the Beating Heart**: Beginners often wonder how an oracle that operates on a target qubit can convey information about $f(x)$ without measurement. Discovering that $U_f(|x\rangle|-\rangle) = (-1)^{f(x)} |x\rangle|-\rangle$ was our core "aha!" moment and became the central visual mechanic of the game.
2. **Interference Converts Phase to Reality**: Phase differences cannot be measured directly ($|e^{i\theta}|^2 = 1$). The final Hadamard gate performs a Fourier-like transform that translates phase parity into destructive cancellation on the ground state $|0\dots0\rangle$ for all balanced oracles.
3. **No Lectures, Only Physics**: Designing the game so that pulling the quantum mechanics out causes the game to stop making sense ensures authentic learning through play.

---

## ⚖️ License
Developed for the **Quriosity Hackathon 2026** by the Quantum Game Development Team under the MIT License.
