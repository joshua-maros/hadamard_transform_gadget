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

  phase(): number {
    return Math.atan2(this.imaginary, this.real);
  }

  withPhaseFrom(other: ComplexNum): ComplexNum {
    if (other.magnitude() < 1e-5) {
      return this.clone();
    } else {
      return other.scaled(this.magnitude() / other.magnitude())
    }
  }

  sum(other: ComplexNum): ComplexNum {
    return new ComplexNum(this.real + other.real, this.imaginary + other.imaginary);
  }

  difference(other: ComplexNum): ComplexNum {
    return new ComplexNum(this.real - other.real, this.imaginary - other.imaginary);
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

export function hadamardTransform(x: Array<ComplexNum>): Array<ComplexNum> {
  let prev_result = Array.from(x);
  let next_result = Array.from(x);
  const dims = Math.log2(x.length);

  for (let dim = 0; dim < dims; dim++) {
    const stride = Math.pow(2, dim);
    for (let groupStart = 0; groupStart < x.length; groupStart += 2 * stride) {
      for (let element = 0; element < stride; element++) {
        const ia = groupStart + element;
        const ib = groupStart + element + stride;
        next_result[ia] = prev_result[ia].sum(prev_result[ib]).scaled(Math.SQRT1_2);
        next_result[ib] = prev_result[ia].difference(prev_result[ib]).scaled(Math.SQRT1_2);
      }
    }
    prev_result = Array.from(next_result);
  }

  return prev_result;
}
