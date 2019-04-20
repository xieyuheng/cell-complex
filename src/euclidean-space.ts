import assert from "assert"

import * as ut from "./util"
import * as nd from "./ndarray"
import * as int from "./integer"
import { permutation_t } from "./permutation"

/**
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
  for (let i = lo; i < hi; i++) {
    if (p (i)) {
      return i
    }
  }
  return null
}

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
class matrix_t {
  readonly array: nd.array_t
  readonly shape: [number, number]
  readonly size: number

  // TODO
  // matrix_t should not copy nd.array_t
  constructor (array: nd.array_t) {
    if (array.order !== 2) {
      throw new Error ("array order should be 2")
    }
    this.array = array.copy ()
    this.shape = array.shape.slice () as [number, number]
    this.size = array.size
  }

  static from_array (array: nd.Array2d): matrix_t {
    return new matrix_t (nd.array_t.from_2darray (array))
  }

  get_linear_index (x: number, y: number): number {
    return (this.array.offset +
            x * this.array.strides [0] +
            y * this.array.strides [1])
  }

  get (x: number, y: number): number {
    let i = this.get_linear_index (x, y)
    return this.array.linear_get (i)
  }

  set (x: number, y: number, v: number): matrix_t {
    let i = this.get_linear_index (x, y)
    this.array.linear_set (i, v)
    return this
  }

  static *indexes_of_shape ([m, n]: [number, number]) {
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        yield [i, j] as [number, number]
      }
    }
  }

  *indexes () {
    for (let [i, j] of matrix_t.indexes_of_shape (this.shape)) {
      yield [i, j] as [number, number]
    }
  }

  *entries () {
    for (let [i, j] of this.indexes ()) {
      let v = this.get (i, j)
      yield [i, j, v] as [number, number, number]
    }
  }

  *values () {
    for (let [i, j] of this.indexes ()) {
      let v = this.get (i, j)
      yield v as number
    }
  }

  update_op1 (
    op: (x: number) => number,
  ): matrix_t {
    let [m, n] = this.shape
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        let v = op (this.get (i, j))
        this.set (i, j, v)
      }
    }
    return this
  }

  update_op2 (
    that: matrix_t,
    op: (x: number, y: number) => number,
  ): matrix_t {
    assert (this.same_shape_p (that))
    let [m, n] = this.shape
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        let v = op (this.get (i, j), that.get (i, j))
        this.set (i, j, v)
      }
    }
    return this
  }

  update_at (
    i: number,
    j: number,
    f: (v: number) => number,
  ): matrix_t {
    return this.set (i, j, f (this.get (i, j)))
  }

  print () {
    console.log ("matrix:")
    this.array.print ()
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
    this.array.put_porj ([i, null], src.array)
    return this
  }

  *row_entries () {
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
    for (let [i, row] of this.row_entries ()) {
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
    this.array.put_porj ([null, i], src.array)
    return this
  }

  *col_entries () {
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
    for (let [i, col] of this.col_entries ()) {
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

  reduce_with (
    init: number,
    f: (acc: number, cur: number) => number,
  ): number {
    return this.array.reduce_with (init, f)
  }

  every (p: (v: number) => boolean): boolean {
    for (let v of this.values ()) {
      if (! p (v)) {
        return false
      }
    }
    return true
  }

  some (p: (v: number) => boolean): boolean {
    for (let v of this.values ()) {
      if (p (v)) {
        return true
      }
    }
    return false
  }

  eq (that: matrix_t): boolean {
    return this.array.eq (that.array.copy ())
  }

  same_shape_p (that: matrix_t): boolean {
    return ((this.shape [0] === that.shape [0]) &&
            (this.shape [1] === that.shape [1]))
  }

  update_add (that: matrix_t): matrix_t {
    return this.update_op2 (that, (x, y) => x + y)
  }

  add (that: matrix_t): matrix_t {
    return this.copy () .update_add (that)
  }

  update_sub (that: matrix_t): matrix_t {
    return this.update_op2 (that, (x, y) => x - y)
  }

  sub (that: matrix_t): matrix_t {
    return this.copy () .update_sub (that)
  }

  map (f: (v: number) => number): matrix_t {
    let matrix = this.copy ()
    for (let [i, j, v] of this.entries ()) {
      matrix.update_at (i, j, f)
    }
    return matrix
  }

  update_scale (a: number): matrix_t {
    return this.update_op1 (x => x * a)
  }

  scale (a: number): matrix_t {
    return this.map (n => n * a)
  }

  mul (that: matrix_t): matrix_t {
    return new matrix_t (this.array.contract (that.array, 1, 0))
  }

  act (v: vector_t): vector_t {
    return v.trans (this)
  }

  transpose (): matrix_t {
    return new matrix_t (
      this.array.reshape (
        new permutation_t ([1, 0])))
  }

  square_p (): boolean {
    let [x, y] = this.shape
    return x === y
  }

  update_swap_rows (i: number, j: number): matrix_t {
    let x = this.row (i) .copy ()
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

  append_cols (that: matrix_t): matrix_t {
    return new matrix_t (this.array.append (1, that.array))
  }

  append_rows (that: matrix_t): matrix_t {
    return new matrix_t (this.array.append (0, that.array))
  }

  upper_p (): boolean {
    for (let [i, j, v] of this.entries ()) {
      if (i > j) {
        if (! epsilon_p (v)) {
          return false
        }
      }
    }
    return true
  }

  lower_p (): boolean {
    for (let [i, j, v] of this.entries ()) {
      if (i < j) {
        if (! epsilon_p (v)) {
          return false
        }
      }
    }
    return true
  }

  upper (): matrix_t {
    let matrix = this.copy ()
    for (let [i, j] of this.indexes ()) {
      if (i > j) {
        matrix.set (i, j, 0)
      }
    }
    return matrix
  }

  strict_upper (): matrix_t {
    let matrix = this.copy ()
    for (let [i, j] of this.indexes ()) {
      if (i >= j) {
        matrix.set (i, j, 0)
      }
    }
    return matrix
  }

  lower (): matrix_t {
    let matrix = this.copy ()
    for (let [i, j] of this.indexes ()) {
      if (i < j) {
        matrix.set (i, j, 0)
      }
    }
    return matrix
  }

  strict_lower (): matrix_t {
    let matrix = this.copy ()
    for (let [i, j] of this.indexes ()) {
      if (i <= j) {
        matrix.set (i, j, 0)
      }
    }
    return matrix
  }

  /**
   * Returns [L, U, P], where P * A = L * U.
   * (singular matrixes allowed)
   */
  lower_upper_permu_decomposition (
  ): [matrix_t, matrix_t, matrix_t] {
    let [
      lower,
      upper,
      permu,
      inver,
    ] = this.lower_upper_permu_inver_decomposition ()
    return [
      lower,
      upper,
      permu,
    ]
  }

  lower_upper_permu_inver_decomposition (
  ): [matrix_t, matrix_t, matrix_t, number] {
    let matrix = this.copy ()
    let [m, n] = this.shape
    assert (m === n)
    let record = matrix_t.zeros (m, n)
    let permu = matrix_t.identity (n)
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
    return [
      record.update_add (matrix_t.identity (n)),
      matrix,
      permu,
      inver,
    ]
  }

  rank (): number {
    let echelon = this.row_echelon_form ()
    let rank = 0
    for (let row of echelon.rows ()) {
      if (row.some (v => ! epsilon_p (v))) {
        rank += 1
      }
    }
    return rank
  }

  singular_p () {
    assert (this.square_p ())
    let [_m, n] = this.shape
    for (let row of this.rows ()) {
      if (row.every (x => epsilon_p (x))) {
        return true
      }
    }
    for (let col of this.cols ()) {
      if (col.every (x => epsilon_p (x))) {
        return true
      }
    }
    return this.rank () < n
  }

  inv_maybe (): matrix_t | null {
    assert (this.square_p ())
    let [_m, n] = this.shape
    let augmented = this.append_cols (matrix_t.identity (n))
    let echelon = augmented.reduced_row_echelon_form ()
    let upper = echelon.slice (null, [0, n])
    let inv = echelon.slice (null, [n, n + n])
    if (upper.singular_p ()) {
      return null
    } else {
      return inv
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

  det (): number {
    assert (this.square_p ())
    let [
      lower, upper, permu, inver
    ] = this.lower_upper_permu_inver_decomposition ()
    let sign: number
    console.log ("inver:", inver)
    permu.print ()
    if (inver % 2 === 0) {
      sign = +1
    } else {
      sign = -1
    }
    return sign * upper.diag () .reduce ((acc, cur) => acc * cur)
  }

  static numbers (n: number, x: number, y: number): matrix_t {
    let shape = [x, y]
    return new matrix_t (nd.array_t.numbers (n, shape))
  }

  static zeros (x: number, y: number): matrix_t {
    return matrix_t.numbers (0, x, y)
  }

  static ones (x: number, y: number): matrix_t {
    return matrix_t.numbers (1, x, y)
  }

  static identity (n: number): matrix_t {
    let matrix = matrix_t.zeros (n, n)
    for (let i of ut.range (0, n)) {
      matrix.set (i, i, 1)
    }
    return matrix
  }

  symmetric_p (): boolean {
    return this.eq (this.transpose ())
  }

  epsilon_p (): boolean {
    return this.every (epsilon_p)
  }

  /**
   * The Hermite form is an analogue
   * of echelon form for matrices over integers.
   */
  hermite_form (): matrix_t {
    let matrix = this.copy ()
    let [m, n] = this.shape
    let h = 0 // init pivot row
    let k = 0 // init pivot column
    while (h < m && k < n) {
      // find the next pivot
      let max = argmax (h, m, (i) => Math.abs (matrix.get (i, k)))
      if (epsilon_p (matrix.get (max, k))) {
        // no pivot in this column, pass to next column
        k += 1
      } else {
        let array = new Array ()
        for (let i of ut.range (0, m)) {
          if (i < h) {
            array.push (0)
          } else {
            array.push (matrix.get (i, k))
          }
        }
        let [d, ext] = int.array_gcd_ext (array)

        let ext_row_matrix = matrix_t.from_array ([ext])
        let gcd_row_matrix = ext_row_matrix.mul (matrix)
        let gcd_row = gcd_row_matrix.row (0)

        matrix.print ()
        console.log (d, ext, array)
        gcd_row.print ()

        if (ext.reduce ((acc, cur) => acc + cur) === 1) {
          let piv = argfirst (
            0, ext.length, (i) => ext [i] === 1
          ) as number
          matrix.update_swap_rows (h, piv)
        } else {
          matrix.set_row (h, gcd_row)
        }

        for (let i of ut.range (h + 1, m)) {
          let f = matrix.get (i, k) / d
          let new_row = matrix.row (i) .sub (gcd_row.scale (f))
          matrix.set_row (i, new_row)
        }
        h += 1
        k += 1
      }
    }
    let i = Math.min (m, n) - 1
    let d = int.array_gcd (
      Array.from (matrix.row (i) .values ())
    )
    matrix.set_row (i, matrix.row (i) .scale (1/d))
    return matrix
  }

  hermite_normal_form (): matrix_t {
    let matrix = this.hermite_form ()
    for (let [i, row] of matrix.row_entries ()) {
      for (let [j, sub] of matrix.row_entries ()) {
        if (j > i) {
          let arg = sub.argfirst (x => ! epsilon_p (x))
          if (arg !== null) {
            let pivot = sub.get (arg)
            let x = matrix.get (i, arg)
            row.update_sub (sub.scale (int.pos_div (x, pivot)))
          }
        }
      }
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
  readonly array: nd.array_t
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

  print () {
    console.log ("vector:")
    this.array.print ()
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
    return this.array.reduce_with (init, f)
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

  print () {
    console.log ("point:")
    this.array.print ()
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
