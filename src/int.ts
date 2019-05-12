import assert from "assert"

import * as ut from "./util"
import * as eu from "./euclid"
import { set_t } from "./abstract/set"

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

  copy (): matrix_t {
    return new matrix_t (super.copy ())
  }

  static constant (
    n: bigint,
    x: number,
    y: number,
  ): matrix_t {
    return new matrix_t (
      eu.matrix_t.ring_constant (ring, n, x, y)
    )
  }

  static zeros (
    x: number,
    y: number,
  ): matrix_t {
    return new matrix_t (
      eu.matrix_t.ring_zeros (ring, x, y)
    )
  }

  static ones (
    x: number,
    y: number,
  ): matrix_t {
    return new matrix_t (
      eu.matrix_t.ring_ones (ring, x, y)
    )
  }

  static id (
    n: number,
  ): matrix_t {
    return new matrix_t (
      eu.matrix_t.ring_id (ring, n)
    )
  }

  transpose (): matrix_t {
    return new matrix_t (
      super.transpose ()
    )
  }
}

export
function matrix (
  array: eu.Array2d <bigint | number | string>
): matrix_t {
  let new_array = new Array <Array <bigint>> ()
  for (let row of array) {
    let new_row = new Array <bigint> ()
    for (let x of row) {
      new_row.push (BigInt (x))
    }
    new_array.push (new_row)
  }
  return new matrix_t (
    eu.matrix_t.from_ring_Array2d (ring, new_array)
  )
}

export
class vector_t extends eu.vector_t <bigint> {
  constructor (the: {
    buffer: Array <bigint>,
    shape: [number],
    strides: [number],
    offset?: number,
  }) {
    super ({
      ...the,
      ring,
    })
  }

  copy (): vector_t {
    return new vector_t (super.copy ())
  }

  static constant (
    n: bigint,
    size: number,
  ): vector_t {
    return new vector_t (
      eu.vector_t.ring_constant (ring, n, size)
    )
  }

  static zeros (
    size: number,
  ): vector_t {
    return new vector_t (
      eu.vector_t.ring_zeros (ring, size)
    )
  }

  static ones (
    size: number,
  ): vector_t {
    return new vector_t (
      eu.vector_t.ring_ones (ring, size)
    )
  }
}

export
function vector (
  array: eu.Array1d <bigint | number | string>
): vector_t {
  return new vector_t (
    eu.vector_t.from_ring_Array (ring, array.map (BigInt))
  )
}
