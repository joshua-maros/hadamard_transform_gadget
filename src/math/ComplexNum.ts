export class ComplexNum {
  real: number;
  imaginary: number;

  private constructor(real: number, imaginary: number) {
    this.real = real;
    this.imaginary = imaginary;
  }

  static cartesian(real: number, imaginary: number): ComplexNum {
    return new ComplexNum(real, imaginary);
  }

  static polar(magnitude: number, phase: number): ComplexNum {
    return ComplexNum.cartesian(magnitude * Math.cos(phase), magnitude * Math.sin(phase));
  }

  static zero(): ComplexNum {
    return ComplexNum.cartesian(0, 0);
  }

  magnitude(): number {
    return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary);
  }

  withPhaseFrom(other: ComplexNum): ComplexNum {
    if (other.magnitude() < 1e-5) {
      return this.clone();
    } else {
      return other.scaled(this.magnitude() / other.magnitude())
    }
  }

  scaled(by: number): ComplexNum {
    return new ComplexNum(this.real * by, this.imaginary * by)
  }

  scaledByRatio(target: number, source: number): ComplexNum {
    if (source < 1e-5) {
      if (this.magnitude() < 1e-5) {
        return ComplexNum.polar(target, 0.0);
      } else {
        throw new Error('Cannot scale a non-zero number from scale zero.');
      }
    } else {
      return this.scaled(target / source)
    }
  }

  clone(): ComplexNum {
    return new ComplexNum(this.real, this.imaginary);
  }
}
