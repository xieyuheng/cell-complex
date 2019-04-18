import assert from "assert"

import { dic_t } from "./dic"
import * as cx from "./cell-complex"

export
class path_t extends cx.cell_complex_t {

}

export
class solid_polygon_t extends cx.cell_complex_t {

}

export
class glob_t extends cx.morphism_t {

}

export
class globular_t extends cx.cell_complex_t {

}

/**
 * `glob_t` is the basic object of higher algebra.
 * But, to get homological chain after abelianization,
 * we need array of glob, instead of one glob.
 */
export
class chain_t {
  dim: number
  com: cx.cell_complex_t
  glob_array: Array <glob_t>

  constructor (
    dim: number,
    com: cx.cell_complex_t,
  ) {
    this.dim = dim
    this.com = com
    this.glob_array = new Array ()
  }
}
