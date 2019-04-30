import assert from "assert"

import * as ut from "./util"
import * as eu from "./euclid"
import { set_t } from "./abstract/set"

export
interface config_t {
  /** for almost degenerated matrix */
  epsilon: number
}

export
let config: config_t = {
  epsilon: 0.000000001
}

export
function epsilon_p (x: number): boolean {
  return Math.abs (x) < config.epsilon
}

export
function non_epsilon_p (x: number): boolean {
  return Math.abs (x) >= config.epsilon
}

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
}

export
function matrix (
  array: eu.Array2d <bigint | number | string>
): matrix_t {
  let new_array = new Array <Array <number>> ()
  for (let row of array) {
    let new_row = new Array <number> ()
    for (let x of row) {
      new_row.push (Number (x))
    }
    new_array.push (new_row)
  }
  return eu.matrix_t.from_ring_Array2d (ring, new_array)
}

export
class vector_t extends eu.vector_t <number> {
  constructor (the: {
    buffer: Array <number>,
    shape: [number],
    strides: [number],
    offset?: number,
  }) {
    super ({
      ...the,
      ring,
    })
  }

  static numbers (
    n: number,
    size: number,
  ): vector_t {
    return eu.vector_t.ring_numbers (ring, n, size)
  }

  static zeros (
    size: number,
  ): vector_t {
    return eu.vector_t.ring_zeros (ring, size)
  }

  static ones (
    size: number,
  ): vector_t {
    return eu.vector_t.ring_ones (ring, size)
  }
}

export
function vector (
  array: eu.Array1d <bigint | number | string>
): vector_t {
  return eu.vector_t.from_ring_Array (ring, array.map (Number))
}
