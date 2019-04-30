import assert from "assert"

import * as eu from "cicada-lang/lib/euclid"
import { set_t } from "cicada-lang/lib/abstract/set"

let ints = new set_t <bigint> ({
  eq: (x, y) => x === y
})

function abs (x: bigint) {
  return x < 0n ? -x : x
}

let ring = eu.ring <bigint> ({
  elements: ints,
  zero: 0n,
  add: (x: bigint, y: bigint) => x + y,
  neg: (x: bigint) => - x,
  one: 1n,
  mul: (x: bigint, y: bigint) => x * y,
  degree_lt: (x, y) => abs (x) < abs (y),
  divmod: (x, y) => {
    let r: bigint = x % y
    r = r < 0 ? r + abs (y) : r
    let q: bigint = (x - r) / y
    return [q, r]
  },
})

export
class matrix_t extends eu.matrix_t <bigint> {}

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

{
  /**
   * generic `diag_canonical_form`
   *   i.e. `smith_normal_form` for integers
   */

  let A = matrix ([
    [2, 4, 4],
    [-6, 6, 12],
    [10, -4, -16],
  ])

  let S = matrix ([
    [2, 0, 0],
    [0, 6, 0],
    [0, 0, -12],
  ])

  assert (
    A.diag_canonical_form () .eq (S)
  )
}
