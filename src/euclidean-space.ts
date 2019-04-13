import assert from "assert"

import * as ut from "./util"

import { set_t } from "./set"
import { field_t } from "./field"
import { abelian_group_t } from "./group"
import { vector_space_t } from "./vector-space"
import { affine_space_t } from "./affine-space"
import { eqv } from "./eqv"
import { number_field_t } from "./number"
import * as nd from "./ndarray"

/**
 * We can not define matrix_t as subclass of nd.array_t,
 * because methods such as `proj` and `slice` on nd.array_t
 * return nd.array_t instead of matrix_t,
 * such methods can not be generic over nd.array_t's subclasses.

 * Due to the lack of dependent type,
 * dimension is checked at runtime.
 */

/**
 * Find the first max index,
 * in left close, right open integer interval.
 */
export
function argmax (
  lo: number,
  hi: number,
  f: (i: number) => number,
): number {
  assert (hi - lo >= 1)
  let max = lo
  let cur = f (lo)
  for (let i = lo; i < hi; i++) {
    let next = f (i)
    if (cur < next) {
      max = i
      cur = next
    }
  }
  return max
}

export
function argfirst (
  lo: number,
  hi: number,
  p: (i: number) => boolean,
): number | null {
  assert (hi - lo >= 1)
  for (let i = lo; i < hi; i++) {
    if (p (i)) {
      return i
    }
  }
  return null
}

export
class matrix_t {
  array: nd.array_t
  readonly shape: Array <number>

  constructor (array: nd.array_t) {
    if (array.order !== 2) {
      throw new Error ("array order should be 2")
    }
    this.array = array
    this.shape = array.shape
  }

  static from_array (array: nd.Array2d): matrix_t {
    return new matrix_t (nd.array_t.from_2darray (array))
  }

  get (x: number, y: number): number {
    return this.array.get ([x, y])
  }

  set (x: number, y: number, v: number) {
    this.array.set ([x, y], v)
  }

  table () {
    console.log ("matrix:")
    this.array.table ()
  }

  slice (
    x: [number, number] | null,
    y: [number, number] | null,
  ): matrix_t {
    return new matrix_t (this.array.slice ([x, y]))
  }

  copy (): matrix_t {
    return new matrix_t (this.array.copy ())
  }

  row (i: number): vector_t {
    return new vector_t (this.array.proj ([i, null]))
  }

  set_row (i: number, src: vector_t): matrix_t {
    this.array.put ([[i, i+1], null], src.array)
    return this
  }

  *index_rows () {
    let [m, _n] = this.shape
    for (let i = 0; i < m; i++) {
      yield [i, this.row (i)] as [number, vector_t]
    }
  }

  *rows () {
    let [m, _n] = this.shape
    for (let i = 0; i < m; i++) {
      yield this.row (i) as vector_t
    }
  }

  for_each_row_index (
    f: (row: vector_t, i: number) => any
  ): matrix_t {
    for (let [i, row] of this.index_rows ()) {
      f (row, i)
    }
    return this
  }

  for_each_row (
    f: (row: vector_t) => any
  ): matrix_t {
    for (let row of this.rows ()) {
      f (row)
    }
    return this
  }

  col (i: number): vector_t {
    return new vector_t (this.array.proj ([null, i]))
  }

  set_col (i: number, src: vector_t): matrix_t {
    this.array.put ([null, [i, i+1]], src.array)
    return this
  }

  *index_cols () {
    let [_m, n] = this.shape
    for (let i = 0; i < n; i++) {
      yield [i, this.col (i)] as [number, vector_t]
    }
  }

  *cols () {
    let [_m, n] = this.shape
    for (let i = 0; i < n; i++) {
      yield this.col (i) as vector_t
    }
  }

  for_each_col_index (
    f: (col: vector_t, i: number) => any
  ): matrix_t {
    for (let [i, col] of this.index_cols ()) {
      f (col, i)
    }
    return this
  }

  for_each_col (
    f: (col: vector_t) => any
  ): matrix_t {
    for (let col of this.cols ()) {
      f (col)
    }
    return this
  }

  eq (that: matrix_t): boolean {
    return this.array.eq (that.array.copy ())
  }

  mul (that: matrix_t): matrix_t {
    return new matrix_t (this.array.contract (that.array, 1, 0))
  }

  act (v: vector_t): vector_t {
    return v.trans (this)
  }

  transpose (): matrix_t {
    return new matrix_t (this.array.reshape ([1, 0]))
  }

  square_p (): boolean {
    let [x, y] = this.shape
    return x === y
  }

  update_swap_rows (i: number, j: number): matrix_t {
    let x = this.row (i)
    let y = this.row (j)
    this.set_row (i, y)
    this.set_row (j, x)
    return this
  }

  row_echelon_form (): matrix_t {
    let matrix = this.copy ()
    let [m, n] = this.shape
    let h = 0 // init pivot row
    let k = 0 // init pivot column
    while (h < m && k < n) {
      // find the k-th pivot
      let max = argmax (h, m, (i) => Math.abs (matrix.get (i, k)))
      if (matrix.get (max, k) === 0) {
        // no pivot in this column, pass to next column
        k += 1
      } else {
        matrix.update_swap_rows (h, max)
        // for all rows below pivot
        for (let i = h + 1; i < m; i++) {
          let f = matrix.get (i, k) / matrix.get (h, k)
          matrix.set (i, k, 0)
          // for all remaining elements in current row
          for (let j = k + 1; j < n; j++) {
            let c = matrix.get (i, j)
            let v = c - matrix.get (h, j) * f
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
      let pivot = row.first (x => x !== 0)
      if (pivot !== null) {
        matrix.set_row (i, row.scale (1 / pivot))
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
    for (let [i, row] of matrix.index_rows ()) {
      for (let [j, sub] of matrix.index_rows ()) {
        if (j > i) {
          let arg = sub.argfirst (x => x === 1)
          if (arg !== null) {
            let pivot = sub.get (arg)
            let x = matrix.get (i, j)
            if (x !== 0) {
              row.update_add (sub.scale (-x))
            }
          }
        }
      }
    }
    return matrix
  }

  append_cols (that: matrix_t): matrix_t {
    return new matrix_t (this.array.append (1, that.array))
  }

  append_rows (that: matrix_t): matrix_t {
    return new matrix_t (this.array.append (0, that.array))
  }

  /**
   * Singular matrixes can also have LU decomposition.
   */
  // lower_upper_decomposition (): [matrix_t, matrix_t] {
  //   let [m, n] = this.shape
  //   let augmented = this.append_cols (matrix_t.identity (m))
  //   let echelon = augmented.row_echelon_form ()
  //   augmented.table ()
  //   let lower = echelon.slice (null, [n, n + m])
  //   let upper = echelon.slice (null, [0, n])
  //   return [lower, upper]
  // }

  rank (): number {
    let echelon = this.row_echelon_form ()
    let rank = 0
    for (let row of echelon.rows ()) {
      if (row.some (v => v !== 0)) {
        rank += 1
      }
    }
    return rank
  }

  // solve (b: vector_t): vector_t | null {
  // // TODO
  // }

  inv_maybe (): matrix_t | null {
    assert (this.square_p ())
    let [_m, n] = this.shape
    let augmented = this.append_cols (matrix_t.identity (n))
    let echelon = augmented.reduced_row_echelon_form ()
    let inv = echelon.slice (null, [n, n + n])
    if (inv.rank () === n) {
      return inv
    } else {
      return null
    }
  }

  inv (): matrix_t {
    let inv = this.inv_maybe ()
    if (inv === null) {
      throw new Error ("not invertible")
    } else {
      return inv
    }
  }

  diag (): vector_t {
    assert (this.square_p ())
    let [_n, n] = this.shape
    let vector = vector_t.zeros (n)
    for (let i of ut.range (0, n)) {
      vector.set (i, this.get (i, i))
    }
    return vector
  }

  //   det (): number {
  //     assert (this.square_p ())
  //     // TODO
  //   }

  static numbers (n: number, shape: [number, number]): matrix_t {
    return new matrix_t (nd.array_t.numbers (n, shape))
  }

  static zeros (shape: [number, number]): matrix_t {
    return matrix_t.numbers (0, shape)
  }

  static ones (shape: [number, number]): matrix_t {
    return matrix_t.numbers (1, shape)
  }

  static identity (n: number): matrix_t {
    let matrix = matrix_t.zeros ([n, n])
    for (let i of ut.range (0, n)) {
      matrix.set (i, i, 1)
    }
    return matrix
  }
}

export
function matrix (array: nd.Array2d): matrix_t {
  return matrix_t.from_array (array)
}

/**
 * Although `Array` in js is written as a row,
 * `vector_t` should be viewed as column vector.
 * (respecting the tradition of mathematics)
 *
 * `A x` is a combination of the columns of `A`.
 */

export
class vector_t {
  array: nd.array_t
  readonly shape: Array <number>
  readonly dim: number

  constructor (array: nd.array_t) {
    if (array.order !== 1) {
      throw new Error ("array order should be 1")
    }
    this.array = array
    this.shape = array.shape
    this.dim = array.size
  }

  static from_array (array: nd.Array1d): vector_t {
    return new vector_t (nd.array_t.from_1darray (array))
  }

  get (i: number): number {
    return this.array.get ([i])
  }

  set (i: number, v: number): vector_t {
    this.array.set ([i], v)
    return this
  }

  *indexes () {
    for (let i of ut.range (0, this.dim)) {
      yield i
    }
  }

  update_at (i: number, f: (v: number) => number): vector_t {
    return this.set (i, f (this.get (i)))
  }

  update (f: (v: number) => number): vector_t {
    for (let i of this.indexes ()) {
      this.set (i, f (this.get (i)))
    }
    return this
  }

  table () {
    console.log ("vector:")
    this.array.table ()
  }

  slice (i: [number, number]): vector_t {
    return new vector_t (this.array.slice ([i]))
  }

  copy (): vector_t {
    return new vector_t (this.array.copy ())
  }

  eq (that: vector_t): boolean {
    return this.array.eq (that.array.copy ())
  }

  *values () {
    for (let x of this.array.values ()) {
      yield x
    }
  }

  *entries () {
    for (let [k, v] of this.array.entries ()) {
      let [i] = k
      yield [i, v]
    }
  }

  dot (that: vector_t): number {
    assert (this.dim === that.dim)
    let product = 0
    for (let [i, y] of that.entries ()) {
      product += this.get (i) * y
    }
    return product
  }

  map (f: (n: number) => number): vector_t {
    return new vector_t (this.array.map (f))
  }

  scale (a: number): vector_t {
    return this.map (n => n * a)
  }

  update_scale (a: number): vector_t {
    return this.update (n => n * a)
  }

  argmax (f: (x: number) => number): number {
    let lo = 0
    let hi = this.dim
    return argmax (lo, hi, i => f (this.get (i)))
  }

  argfirst (p: (x: number) => boolean): number | null {
    let lo = 0
    let hi = this.dim
    return argfirst (lo, hi, i => p (this.get (i)))
  }

  first (p: (x: number) => boolean): number | null {
    let arg = this.argfirst (p)
    if (arg === null) {
      return null
    } else {
      return this.get (arg)
    }
  }

  update_add (that: vector_t): vector_t {
    assert (this.dim === that.dim)
    for (let [i, x] of that.entries ()) {
      this.update_at (i, v => v + x)
    }
    return this
  }

  add (that: vector_t): vector_t {
    assert (this.dim === that.dim)
    let vector = this.copy ()
    for (let [i, x] of that.entries ()) {
      vector.update_at (i, v => v + x)
    }
    return vector
  }

  update_sub (that: vector_t): vector_t {
    assert (this.dim === that.dim)
    for (let [i, x] of that.entries ()) {
      this.update_at (i, v => v - x)
    }
    return this
  }

  sub (that: vector_t): vector_t {
    assert (this.dim === that.dim)
    let vector = this.copy ()
    for (let [i, x] of that.entries ()) {
      vector.update_at (i, v => v - x)
    }
    return vector
  }

  trans (matrix: matrix_t): vector_t {
    return new vector_t (
      this.array.contract (matrix.array, 0, 1))
  }

  act (p: point_t): point_t {
    return p.trans (this)
  }

  static numbers (n: number, dim: number): vector_t {
    return new vector_t (nd.array_t.numbers (n, [dim]))
  }

  static zeros (dim: number): vector_t {
    return vector_t.numbers (0, dim)
  }

  static ones (dim: number): vector_t {
    return vector_t.numbers (0, dim)
  }

  reduce_with (
    init: number,
    f: (acc: number, cur: number) => number,
  ): number {
    let acc = init
    for (let i of ut.range (0, this.dim)) {
      acc = f (acc, this.get (i))
    }
    return acc
  }

  reduce (
    f: (acc: number, cur: number) => number,
  ): number {
    assert (this.dim > 0)
    if (this.dim === 1) {
      return this.get (0)
    } else {
      let acc = this.get (0)
      for (let i of ut.range (1, this.dim)) {
        acc = f (acc, this.get (i))
      }
      return acc
    }
  }

  some (p: (v: number) => boolean): boolean {
    for (let v of this.values ()) {
      if (p (v)) {
        return true
      }
    }
    return false
  }

  every (p: (v: number) => boolean): boolean {
    for (let v of this.values ()) {
      if (! p (v)) {
        return false
      }
    }
    return true
  }

  as_point (): point_t {
    return new point_t (this.array)
  }
}

export
function vector (array: nd.Array1d): vector_t {
  return vector_t.from_array (array)
}

export
class point_t {
  array: nd.array_t
  readonly shape: Array <number>
  readonly dim: number

  constructor (array: nd.array_t) {
    if (array.order !== 1) {
      throw new Error ("array order should be 1")
    }
    this.array = array
    this.shape = array.shape
    this.dim = array.size
  }

  static from_array (array: nd.Array1d): point_t {
    return new point_t (nd.array_t.from_1darray (array))
  }

  get (i: number): number {
    return this.array.get ([i])
  }

  set (i: number, v: number) {
    this.array.set ([i], v)
  }

  table () {
    console.log ("point:")
    this.array.table ()
  }

  slice (i: [number, number]): point_t {
    return new point_t (this.array.slice ([i]))
  }

  copy (): point_t {
    return new point_t (this.array.copy ())
  }

  eq (that: point_t): boolean {
    return this.array.eq (that.array.copy ())
  }

  *values () {
    for (let x of this.array.values ()) {
      yield x
    }
  }

  *entries () {
    let i = 0
    for (let x of this.array.values ()) {
      yield [i, x]
      i += 1
    }
  }

  trans (v: vector_t): point_t {
    let p = this.copy ()
    for (let [i, y] of v.entries ()) {
      p.set (i, p.get (i) + y)
    }
    return p
  }

  diff (that: point_t): vector_t {
    return this.as_vector () .sub (that.as_vector ())
  }

  map (f: (n: number) => number): point_t {
    return new point_t (this.array.map (f))
  }

  as_vector (): vector_t {
    return new vector_t (this.array)
  }
}

export
function point (array: nd.Array1d): point_t {
  return point_t.from_array (array)
}

/**
 * I do not define abstract inner product space yet.
 * because the axioms involves conjugation of complex structure,
 * which I do not yet fully understand.

 * There is only one Euclidean space of each dimension,
 * and since dimension is handled at runtime,
 * I define euclidean_space_t as concrete class.
 */

export
class vec_t extends vector_space_t <number, vector_t> {
  dim: number

  constructor (dim: number) {
    super (new number_field_t ())
    this.dim = dim
  }

  eq (x: vector_t, y: vector_t): boolean {
    return x.eq (y)
  }

  id = new vector_t (nd.array_t.zeros ([this.dim]))

  add (v: vector_t, w: vector_t): vector_t {
    return v.add (w)
  }

  neg (x: vector_t): vector_t {
    return x.map (n => -n)
  }

  scale (a: number, x: vector_t): vector_t {
    return x.scale (a)
  }
}

export
class point_set_t extends set_t <point_t> {
  dim: number

  constructor (dim: number) {
    super ()
    this.dim = dim
  }

  eq (x: point_t, y: point_t): boolean {
    return x.eq (y)
  }
}

export
class euclidean_space_t
extends affine_space_t <number, vector_t, point_t> {
  dim: number

  constructor (dim: number) {
    let vec = new vec_t (dim)
    let points = new point_set_t (dim)
    super (vec, points)
    this.dim = dim
  }

  trans (p: point_t, v: vector_t): point_t {
    return p.trans (v)
  }

  diff (p: point_t, q: point_t): vector_t {
    return p.diff (q)
  }
}
