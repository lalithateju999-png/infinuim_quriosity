# ECHOES — Quantum Search in the Abyssal Ocean

**ECHOES** is an atmospheric underwater exploration game where you search for your lost exploration companion (*Luma*) in the depths of a dark alien ocean.

Rather than a dry tutorial or simulator, the core exploration loop directly emerges from **Grover's Amplitude Amplification Algorithm**.

---

## 🌊 Gameplay

- **SWIM / MOVE** (`W`, `A`, `S`, `D` or `Arrow Keys`): Navigate your exploration submersible through the abyss.
- **CALL** (`Spacebar` or HUD button): Emit a high-energy acoustic sonar pulse. Each CALL executes **one Grover Iteration** (Oracle phase marking + Inversion about the mean).
- **LISTEN / COMMIT** (`E` or HUD button): Trigger **Quantum Measurement**. The state vector collapses according to the live probability distribution $P(i) = |\alpha_i|^2$. If the measured state is the target, locator lock succeeds and Luma is rescued!

### The Core Dilemma
> *"Do I call again to amplify the signal, or do I stop and commit?"*

- **Initial State**: Uniform superposition over $N$ candidate seabed spires.
- **Amplification**: Repeated calls create constructive interference, focusing the signal into harmonic crystal resonance.
- **The Sweet Spot**: Around $R \approx \frac{\pi}{4}\sqrt{N}$ calls, the probability reaches its maximum peak.
- **Overshooting**: Calling beyond the peak causes destructive interference, dispersing the echo wave!

---

## 🔬 Authentic Quantum Engine

Under the hood, `ECHOES` runs a true state-vector quantum simulation:
1. **State Vector**: $|\psi\rangle = \sum_{i=0}^{N-1} \alpha_i |i\rangle$ initialized to uniform superposition $\alpha_i = 1/\sqrt{N}$.
2. **Oracle ($O_f$)**: Phase flips the hidden target state amplitude: $\alpha_{\text{target}} \leftarrow -\alpha_{\text{target}}$.
3. **Diffusion ($D$)**: Inversion about the mean: $\alpha_i \leftarrow 2\cdot\text{mean} - \alpha_i$.
4. **Measurement**: Monte Carlo sampling strictly governed by $P(i) = |\alpha_i|^2$.

---

## 🎮 Campaign Chapters

1. **Chapter I — The First Echo** ($N = 4$): Shallow shelf, discovery of the amplification mechanic.
2. **Chapter II — The Deep** ($N = 8$): Mesopelagic twilight, oxygen depletion and cost of calling.
3. **Chapter III — False Echoes** ($N = 8$–$12$): Thermal vents and drifting pyrosomes.
4. **Chapter IV — The Resonance** ($N = 16$): Bathypelagic trench, critical sweet spot and overshooting dynamics.
5. **Chapter V — The Abyss** ($N = 16$–$32$): Hadal rift, limited life support, predatory stalker attracted to echo noise.
6. **Expedition Mode**: Custom sandbox with adjustable $N \in \{4, 8, 16, 32\}$, oxygen, and hazard density.

---

## 📊 Post-Dive Quantum Replay & Analysis

After any search, open the **Quantum Echo Analysis** debrief to review:
- Iteration-by-iteration amplitude ($\alpha_i$) bar charts showing phase flip & inversion about the mean.
- Live probability distribution $P(i) = |\alpha_i|^2$ across all $N$ locations.
- Quadratic advantage analysis ($O(\sqrt{N})$ vs Classical $O(N)$).

---

## 🛠️ Development & Testing

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run automated quantum engine tests
npm test

# Build for production
npm run build
```
