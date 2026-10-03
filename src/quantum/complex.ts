/**
 * Exact Complex Number Arithmetic for Quantum State Vector Simulation
 */

export interface Complex {
  readonly re: number;
  readonly im: number;
}

export const C = {
  zero: { re: 0, im: 0 } as Complex,
  one: { re: 1, im: 0 } as Complex,
  negOne: { re: -1, im: 0 } as Complex,
  i: { re: 0, im: 1 } as Complex,
  negI: { re: 0, im: -1 } as Complex,

  new(re: number, im: number = 0): Complex {
    return { re, im };
  },

  add(a: Complex, b: Complex): Complex {
    return { re: a.re + b.re, im: a.im + b.im };
  },

  sub(a: Complex, b: Complex): Complex {
    return { re: a.re - b.re, im: a.im - b.im };
  },

  mul(a: Complex, b: Complex): Complex {
    return {
      re: a.re * b.re - a.im * b.im,
      im: a.re * b.im + a.im * b.re,
    };
  },

  scale(a: Complex, s: number): Complex {
    return { re: a.re * s, im: a.im * s };
  },

  conj(a: Complex): Complex {
    return { re: a.re, im: -a.im };
  },

  absSq(a: Complex): number {
    return a.re * a.re + a.im * a.im;
  },

  abs(a: Complex): number {
    return Math.sqrt(C.absSq(a));
  },

  /**
   * Phase angle in radians [-PI, PI]
   */
  phase(a: Complex): number {
    if (Math.abs(a.re) < 1e-12 && Math.abs(a.im) < 1e-12) return 0;
    return Math.atan2(a.im, a.re);
  },

  /**
   * Phase angle in degrees [0, 360)
   */
  phaseDeg(a: Complex): number {
    const p = C.phase(a);
    const deg = (p * 180) / Math.PI;
    return (deg + 360) % 360;
  },

  isReal(a: Complex, tol = 1e-9): boolean {
    return Math.abs(a.im) < tol;
  },

  isZero(a: Complex, tol = 1e-9): boolean {
    return Math.abs(a.re) < tol && Math.abs(a.im) < tol;
  },

  format(a: Complex, precision = 3): string {
    const r = Math.abs(a.re) < 1e-9 ? 0 : Number(a.re.toFixed(precision));
    const i = Math.abs(a.im) < 1e-9 ? 0 : Number(a.im.toFixed(precision));

    if (i === 0) return `${r}`;
    if (r === 0) {
      if (i === 1) return "i";
      if (i === -1) return "-i";
      return `${i}i`;
    }
    const sign = i > 0 ? "+" : "-";
    const absI = Math.abs(i) === 1 ? "" : `${Math.abs(i)}`;
    return `${r} ${sign} ${absI}i`;
  },
};
