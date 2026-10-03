/**
 * Complex number implementation for Quantum State Vector calculations.
 */
export interface Complex {
  readonly real: number;
  readonly imag: number;
}

export function complex(real: number, imag: number = 0): Complex {
  return { real, imag };
}

export function add(a: Complex, b: Complex): Complex {
  return { real: a.real + b.real, imag: a.imag + b.imag };
}

export function subtract(a: Complex, b: Complex): Complex {
  return { real: a.real - b.real, imag: a.imag - b.imag };
}

export function multiply(a: Complex, b: Complex): Complex {
  return {
    real: a.real * b.real - a.imag * b.imag,
    imag: a.real * b.imag + a.imag * b.real,
  };
}

export function scale(a: Complex, scalar: number): Complex {
  return { real: a.real * scalar, imag: a.imag * scalar };
}

export function negate(a: Complex): Complex {
  return { real: -a.real, imag: -a.imag };
}

export function magnitudeSquared(a: Complex): number {
  return a.real * a.real + a.imag * a.imag;
}

export function magnitude(a: Complex): number {
  return Math.sqrt(magnitudeSquared(a));
}

export function phase(a: Complex): number {
  return Math.atan2(a.imag, a.real);
}
