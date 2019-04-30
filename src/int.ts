import assert from "assert"

import * as ut from "./util"
import * as eu from "./euclid-tobe"
import { set_t, eqv, not_eqv } from "./abstract/set"
import { euclidean_ring_t } from "./abstract/ring"

export
let ints = new set_t <bigint> ({
  eq: (x, y) => x === y
})

export
function abs (x: bigint) {
  return x < 0n ? -x : x
}

export
function mod (
  x: bigint,
  y: bigint,
): bigint {
  let r: bigint = x % y
  return r < 0 ? r + abs (y) : r
}

export
function divmod (
  x: bigint,
  y: bigint,
): [bigint, bigint] {
  let r: bigint = mod (x, y)
  let q: bigint = (x - r) / y
  return [q, r]
}

export
function div (
  x: bigint,
  y: bigint,
): bigint {
  let r: bigint = mod (x, y)
  return (x - r) / y
}

export
function abs_lt (x: bigint, y: bigint): boolean {
  return abs (x) < abs (y)
}

export
let ring = eu.ring <bigint> ({
  elements: ints,
  zero: 0n,
  add: (x: bigint, y: bigint) => x + y,
  neg: (x: bigint) => - x,
  one: 1n,
  mul: (x: bigint, y: bigint) => x * y,
  degree_lt: abs_lt,
  divmod: divmod,
})

export
class matrix_t extends eu.matrix_t <bigint> {
  constructor (the: {
    buffer: Array <bigint>,
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
    n: bigint,
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

export
function matrix (
  array: eu.Array2d <bigint | number | string>
): matrix_t {
  let bigint_array = new Array <Array <bigint>> ()
  for (let row of array) {
    let bigint_row = new Array <bigint> ()
    for (let x of row) {
      bigint_row.push (BigInt (x))
    }
    bigint_array.push (bigint_row)
  }
  return eu.matrix_t.from_ring_Array2d (ring, bigint_array)
}


// export
// function vector (array: Array1d): vector_t {
//   return vector_t.fromArray (array)
// }
