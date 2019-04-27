import * as eu from "./euclid"

/**
 * Representation theory of finitely generated abelian group.
 */

export
class integral_module_t {
  // readonly invariant_factors: eu.vector_t
  readonly smith_normal_form: eu.matrix_t

  constructor (the: {
    smith_normal_form: eu.matrix_t,
  }) {
    this.smith_normal_form = the.smith_normal_form
  }

  static from_smith_normal_form (
    smith_normal_form: eu.matrix_t
  ): integral_module_t {
    return new integral_module_t ({
      smith_normal_form
    })
  }

  // static from_invariant_factors (
  //   invariant_factors: eu.vector_t
  // ): integral_module_t {
  //   return new integral_module_t ({
  //     invariant_factors
  //   })
  // }

  print () {
    this.smith_normal_form.print ()
  }
}
