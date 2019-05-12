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
let ring = eu.ring <number> ({
  elements: nums,
  zero: 0,
  add: (x: number, y: number) => x + y,
  neg: (x: number) => - x,
  one: 1,
  mul: (x: number, y: number) => x * y,
  degree_lt: (x: number, y: number) => false,
  divmod: (x: number, y: number) => [x / y, 0],
})

export
function argmax (
  lo: number,
  hi: number,
  f: (i: number) => number,
): number {
  let arg = lo
  let cur = f (lo)
  for (let i = lo; i < hi; i++) {
    let next = f (i)
    if (cur < next) {
      arg = i
      cur = next
    }
  }
  return arg
}

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

  copy (): matrix_t {
    return new matrix_t (super.copy ())
  }

  static constant (
    n: number,
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

  append_cols (that: matrix_t): matrix_t {
    return new matrix_t (
      this.append_cols (that)
    )
  }

  row_echelon_form (): matrix_t {
    let matrix = this.copy ()
    let [m, n] = this.shape
    let h = 0 // init pivot row
    let k = 0 // init pivot column
    while (h < m && k < n) {
      // find the next pivot
      let piv = argmax (h, m, (i) => Math.abs (matrix.get (i, k)))
      if (epsilon_p (matrix.get (piv, k))) {
        // no pivot in this column, pass to next column
        k += 1
      } else {
        if (h !== piv) {
          matrix.update_swap_rows (h, piv)
        }
        // for all rows below pivot
        for (let i = h + 1; i < m; i++) {
          let f = matrix.get (i, k) / matrix.get (h, k)
          matrix.set (i, k, 0)
          // for all remaining elements in current row
          for (let j = k + 1; j < n; j++) {
            let v = matrix.get (i, j) - matrix.get (h, j) * f
            matrix.set (i, j, v)
          }
        }
        h += 1
        k += 1
      }
    }
    return matrix
  }

  /**
   * with all pivots equal to 1.
   */
  unit_row_echelon_form (): matrix_t {
    let matrix = this.row_echelon_form ()
    matrix.for_each_row_index ((row, i) => {
      let pivot = row.first (x => ! epsilon_p (x))
      if (pivot !== null) {
        row.update_scale (1 / pivot)
      }
    })
    return matrix
  }

  /**
   * unit row echelon form + back substitution

   * The reduced row echelon form of a matrix is unique
   * i.e. does not depend on the algorithm used to compute it.
   */
  reduced_row_echelon_form (): matrix_t {
    let matrix = this.unit_row_echelon_form ()
    for (let [i, row] of matrix.row_entries ()) {
      for (let [j, sub] of matrix.row_entries ()) {
        if (j > i) {
          let arg = sub.argfirst (x => x === 1)
          if (arg !== null) {
            let x = matrix.get (i, arg)
            if (! epsilon_p (x)) {
              row.update_add (sub.scale (-x))
            }
          }
        }
      }
    }
    return matrix
  }

  /**
   * P * A = L * U,
   * `permu.mul (this) .eq (lower.mul (upper))`,
   * (singular matrixes allowed)
   */
  lower_upper_decomposition (): {
    lower: matrix_t,
    upper: matrix_t,
    permu: matrix_t,
    inver: number,
  } {
    let matrix = this.copy ()
    let [m, n] = this.shape
    assert (m === n)
    let record = matrix_t.zeros (m, n)
    let permu = matrix_t.id (n)
    let h = 0 // init pivot row
    let k = 0 // init pivot column
    let inver = 0
    while (h < m && k < n) {
      // find the next pivot
      let piv = argmax (h, m, (i) => Math.abs (matrix.get (i, k)))
      if (epsilon_p (matrix.get (piv, k))) {
        // no pivot in this column, pass to next column
        k += 1
      } else {
        if (h !== piv) {
          matrix.update_swap_rows (h, piv)
          record.update_swap_rows (h, piv)
          permu.update_swap_rows (h, piv)
          inver += 1
        }
        // for all rows below pivot
        for (let i = h + 1; i < m; i++) {
          let f = matrix.get (i, k) / matrix.get (h, k)
          matrix.set (i, k, 0)
          record.update_at (i, k, v => v + f)
          // for all remaining elements in current row
          for (let j = k + 1; j < n; j++) {
            let v = matrix.get (i, j) - matrix.get (h, j) * f
            matrix.set (i, j, v)
          }
        }
        h += 1
        k += 1
      }
    }
    return {
      lower: new matrix_t (
        record.update_add (matrix_t.id (n))
      ),
      upper: matrix,
      permu,
      inver,
    }
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
  return new matrix_t (
    eu.matrix_t.from_ring_Array2d (ring, new_array)
  )
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

  copy (): vector_t {
    return new vector_t (super.copy ())
  }

  static constant (
    n: number,
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
    eu.vector_t.from_ring_Array (ring, array.map (Number))
  )
}
