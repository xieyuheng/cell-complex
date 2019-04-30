import * as ut from "./util"
import * as int from "./int"

/**
 * Representation theory of finitely generated abelian group.
 */

export
class integral_module_t {
  readonly smith_normal_form: () => int.matrix_t

  constructor (the: {
    smith_normal_form: int.matrix_t,
  }) {
    this.smith_normal_form = () => the.smith_normal_form
  }

  static from_smith_normal_form (
    smith_normal_form: int.matrix_t
  ): integral_module_t {
    return new integral_module_t ({
      smith_normal_form
    })
  }

  invariant_factors (): int.vector_t {
    return this.smith_normal_form () .diag ()
  }

  rank (): number {
    let [m, n] = this.smith_normal_form () .shape
    let r = this.smith_normal_form () .rank ()
    return m - r
  }

  torsion_coefficients (): Array <number> {
    let array = new Array ()
    let invariant_factors = this.invariant_factors ()
    for (let v of invariant_factors.values ()) {
      if (v !== 0n && v !== 1n) {
        array.push (Number (int.abs (v)))
      }
    }
    return array
  }

  report () {
    return {
      rank: this.rank (),
      torsion_coefficients: this.torsion_coefficients (),
    }
  }
}
