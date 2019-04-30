import assert from "assert"

import * as ut from "./util"
import * as eu from "./euclid-tobe"
import { set_t, eqv, not_eqv } from "./abstract/set"
import { euclidean_ring_t } from "./abstract/ring"

export
let nums = new set_t <number> ({
  eq: (x, y) => x === y
})

export
function abs_lt (x: number, y: number): boolean {
  return Math.abs (x) < Math.abs (y)
}

export
let ring = eu.ring <number> ({
  elements: nums,
  zero: 0,
  add: (x: number, y: number) => x + y,
  neg: (x: number) => - x,
  one: 1,
  mul: (x: number, y: number) => x * y,
  degree_lt: abs_lt,
  divmod: (x: number, y: number) => [x / y, 0],
})

// TODO
// about epsilon


/** TODO
 * notes about numerical stability
 */

/**
 * We have to re-implement `row_echelon_form` again for `num.matrix_t`
 *   because `float` is not precisely a ring.

 * We also have to re-implement the core algorithm again for the ring of polynomial,
 *   because there exist more efficient algorithm than the generic algorithm.

 * It is ironic that, after the abstraction,
 *   to reach useful API, we still have to re-implement the core algorithm.
 */

export
class matrix_t extends eu.matrix_t <number> {
  constructor (the: {
    buffer: Array <number>,
    shape: [number, number],
    strides: [number, number],
    offset?: number,
  }) {
    super ({
      ...the,
      ring,
    })
  }

  static numbers (
    n: number,
    x: number,
    y: number,
  ): matrix_t {
    let shape: [number, number] = [x, y]
    let size = eu.matrix_t.shape_to_size (shape)
    let buffer = new Array (size)
    buffer.fill (n)
    return eu.matrix_t.from_ring_buffer (ring, buffer, shape)
  }

  static zeros (
    x: number,
    y: number,
  ): matrix_t {
    return matrix_t.numbers (ring.zero, x, y)
  }

  static ones (
    x: number,
    y: number,
  ): matrix_t {
    return matrix_t.numbers (ring.one, x, y)
  }
}
