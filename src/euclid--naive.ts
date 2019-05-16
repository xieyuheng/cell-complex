import * as _ from "lodash"
import assert from "assert"

import * as ut from "./util"
import * as num from "./number"
import { permutation_t } from "./permutation"

export type Array1d = Array <number>
export type Array2d = Array <Array <number>>
export type Array3d = Array <Array <Array <number>>>

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
function argmax_guard (
  lo: number,
  hi: number,
  f: (i: number) => number,
  p: (i: number) => boolean,
): number {
  let arg = argfirst (lo, hi, p)
  if (arg === null) {
    throw new Error ("no such arg")
  }
  let cur = f (lo)
  for (let i = arg + 1; i < hi; i++) {
    if (p (i)) {
      let next = f (i)
      if (cur < next) {
        arg = i
        cur = next
      }
    }
  }
  return arg
}

export
function argmin (
  lo: number,
  hi: number,
  f: (i: number) => number,
): number {
  let arg = lo
  let cur = f (lo)
  for (let i = lo; i < hi; i++) {
    let next = f (i)
    if (cur > next) {
      arg = i
      cur = next
    }
  }
  return arg
}

export
function argmin_guard (
  lo: number,
  hi: number,
  f: (i: number) => number,
  p: (i: number) => boolean,
): number {
  let arg = argfirst (lo, hi, p)
  if (arg === null) {
    throw new Error ("no such arg")
  }
  let cur = f (lo)
  for (let i = arg + 1; i < hi; i++) {
    if (p (i)) {
      let next = f (i)
      if (cur > next) {
        arg = i
        cur = next
      }
    }
  }
  return arg
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
function argall (
  lo: number,
  hi: number,
  p: (i: number) => boolean,
): boolean {
  for (let i = lo; i < hi; i++) {
    if (! p (i)) {
      return false
    }
  }
  return true
}

export
function argsome (
  lo: number,
  hi: number,
  p: (i: number) => boolean,
): boolean {
  for (let i = lo; i < hi; i++) {
    if (p (i)) {
      return true
    }
  }
  return false
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
function non_epsilon_p (x: number): boolean {
  return Math.abs (x) >= config.epsilon
}

export
class matrix_t {
  readonly buffer: Float64Array
  readonly shape: [number, number]
  readonly strides: [number, number]
  readonly offset: number
  readonly size: number

  constructor (
    buffer: Float64Array,
    shape: [number, number],
    strides: [number, number],
    offset: number = 0,
  ) {
    this.buffer = buffer
    this.shape = shape
    this.strides = strides
    this.offset = offset
    this.size = matrix_t.shape_to_size (shape)
  }

  static shape_to_size ([x, y]: [number, number]): number {
    return x * y
  }

  static shape_to_strides (
    [x, y]: [number, number]
  ): [number, number] {
    return [y, 1]
  }

  static from_buffer (
    buffer: Float64Array,
    shape: [number, number],
  ): matrix_t {
    let strides = matrix_t.shape_to_strides (shape)
    return new matrix_t (buffer, shape, strides)
  }

  static fromArray2d (array: Array2d): matrix_t {
    let y_length = array.length
    let x_length = array[0].length
    for (let a of array) {
      if (a.length !== x_length) {
        throw new Error ("inner array length mismatch")
      }
    }
    let buffer = Float64Array.from (array.flat ())
    return matrix_t.from_buffer (buffer, [y_length, x_length])
  }

  static from_row (row: vector_t): matrix_t {
    let [s] = row.strides
    return new matrix_t (
      row.buffer, [1, row.size], [0, s], row.offset)
  }

  static from_col (col: vector_t): matrix_t {
    let [t] = col.strides
    return new matrix_t (
      col.buffer, [col.size, 1], [t, 0], col.offset)
  }

  get_linear_index (x: number, y: number): number {
    return (this.offset +
            x * this.strides [0] +
            y * this.strides [1])
  }

  get (x: number, y: number): number {
    return this.buffer [this.get_linear_index (x, y)]
  }

  set (x: number, y: number, v: number): matrix_t {
    this.buffer [this.get_linear_index (x, y)] = v
    return this
  }

  update_at (
    i: number,
    j: number,
    f: (v: number) => number,
  ): matrix_t {
    this.set (i, j, f (this.get (i, j)))
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

  same_shape_p (that: matrix_t): boolean {
    return ((this.shape [0] === that.shape [0]) &&
            (this.shape [1] === that.shape [1]))
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

  slice (
    x: [number, number] | null,
    y: [number, number] | null,
  ): matrix_t {
    let [m, n] = this.shape
    let offset = this.offset
    if (x !== null) {
      let [start, end] = x
      m = end - start
      offset += start * this.strides [0]
    }
    if (y !== null) {
      let [start, end] = y
      n = end - start
      offset += start * this.strides [1]
    }
    return new matrix_t (this.buffer, [m, n], this.strides, offset)
  }

  copy (): matrix_t {
    let buffer = new Float64Array (this.size)
    let matrix = matrix_t.from_buffer (buffer, this.shape)
    for (let [i, j, x] of this.entries ()) {
      matrix.set (i, j, x)
    }
    return matrix
  }

  update_copy (that: matrix_t): matrix_t {
    let [m, n] = this.shape
    for (let i of ut.range (0, m)) {
      for (let j of ut.range (0, n)) {
        this.set (i, j, that.get (i, j))
      }
    }
    return this
  }

  row (i: number): vector_t {
    let [m, n] = this.shape
    let [s, t] = this.strides
    let offset = this.offset + i * s
    return new vector_t (
      this.buffer, [n], [t], offset)
  }

  set_row (i: number, src: vector_t): matrix_t {
    let [m, n] = this.shape
    for (let j of ut.range (0, n)) {
      this.set (i, j, src.get (j))
    }
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

  col (j: number): vector_t {
    let [m, n] = this.shape
    let [s, t] = this.strides
    let offset = this.offset + j * t
    return new vector_t (
      this.buffer, [m], [s], offset)
  }

  set_col (j: number, src: vector_t): matrix_t {
    let [m, n] = this.shape
    for (let i of ut.range (0, m)) {
      this.set (i, j, src.get (i))
    }
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
    let acc = init
    for (let v of this.values ()) {
      acc = f (acc, v)
    }
    return acc
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

  *zip (that: matrix_t) {
    let this_iter = this.values ()
    let that_iter = that.values ()
    while (true) {
      let this_next = this_iter.next ()
      let that_next = that_iter.next ()
      if (this_next.done || that_next.done) {
        return
      } else {
        yield [this_next.value, that_next.value]
      }
    }
  }

  eq (that: matrix_t): boolean {
    if (this.size !== that.size) { return false }
    if (! _.isEqual (this.shape, that.shape)) { return false }
    for (let [x, y] of this.zip (that)) {
      if (x !== y) {
        return false
      }
    }
    return true
  }

  toArray2d (): Array2d {
    let array = []
    let [x, _] = this.shape
    for (let i = 0; i < x; i++) {
      array.push (this.row (i) .toArray ())
    }
    return array
  }

  print () {
    console.log ("matrix:")
    console.table (this.toArray2d ())
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
    let [m, n] = this.shape
    let [p, q] = that.shape
    assert (n === p)
    let shape: [number, number] = [m, q]
    let size = matrix_t.shape_to_size (shape)
    let buffer = new Float64Array (size)
    let matrix = matrix_t.from_buffer (buffer, shape)
    for (let i of ut.range (0, m)) {
      for (let j of ut.range (0, q)) {
        let v = this.row (i) .dot (that.col (j))
        matrix.set (i, j, v)
      }
    }
    return matrix
  }

  act (v: vector_t): vector_t {
    return v.trans (this)
  }

  transpose (): matrix_t {
    let [m, n] = this.shape
    let [s, t] = this.strides
    return new matrix_t (
      this.buffer, [n, m], [t, s], this.offset)
  }

  symmetric_p (): boolean {
    return this.eq (this.transpose ())
  }

  square_p (): boolean {
    let [x, y] = this.shape
    return x === y
  }

  update_swap_rows (i: number, j: number): matrix_t {
    let [m, n] = this.shape
    for (let k of ut.range (0, n)) {
      let x = this.get (i, k)
      let y = this.get (j, k)
      this.set (i, k, y)
      this.set (j, k, x)
    }
    return this
  }

  update_swap_cols (i: number, j: number): matrix_t {
    let [m, n] = this.shape
    for (let k of ut.range (0, m)) {
      let x = this.get (k, i)
      let y = this.get (k, j)
      this.set (k, i, y)
      this.set (k, j, x)
    }
    return this
  }

  append_cols (that: matrix_t): matrix_t {
    let [m, n] = this.shape
    let [p, q] = that.shape
    assert (m === p)
    let shape: [number, number] = [m, n + q]
    let size = matrix_t.shape_to_size (shape)
    let buffer = new Float64Array (size)
    let matrix = matrix_t.from_buffer (buffer, shape)
    for (let i of ut.range (0, m)) {
      let row = this.row (i) .append (that.row (i))
      matrix.set_row (i, row)
    }
    return matrix
  }

  append_rows (that: matrix_t): matrix_t {
    let [m, n] = this.shape
    let [p, q] = that.shape
    assert (n === q)
    let shape: [number, number] = [m + p, n]
    let size = matrix_t.shape_to_size (shape)
    let buffer = new Float64Array (size)
    let matrix = matrix_t.from_buffer (buffer, shape)
    for (let i of ut.range (0, n)) {
      let col = this.col (i) .append (that.col (i))
      matrix.set_col (i, col)
    }
    return matrix
  }

  /**
   * The main diag.
   */
  diag (): vector_t {
    let [m, n] = this.shape
    n = Math.min (m, n)
    let vector = vector_t.zeros (n)
    for (let i of ut.range (0, n)) {
      vector.set (i, this.get (i, i))
    }
    return vector
  }

  static constant (n: number, x: number, y: number): matrix_t {
    let shape: [number, number] = [x, y]
    let size = matrix_t.shape_to_size (shape)
    let buffer = new Float64Array (size)
    buffer.fill (n)
    return matrix_t.from_buffer (buffer, shape)
  }

  static zeros (x: number, y: number): matrix_t {
    return matrix_t.constant (0, x, y)
  }

  static ones (x: number, y: number): matrix_t {
    return matrix_t.constant (1, x, y)
  }

  static id (n: number): matrix_t {
    let matrix = matrix_t.zeros (n, n)
    for (let i of ut.range (0, n)) {
      matrix.set (i, i, 1)
    }
    return matrix
  }

  static row_trans (
    permutation: permutation_t
  ): matrix_t {
    let n = permutation.size
    let matrix = matrix_t.zeros (n, n)
    for (let [i, v] of permutation.pairs ()) {
      matrix.set (i, v, 1)
    }
    return matrix
  }

  static col_trans (
    permutation: permutation_t
  ): matrix_t {
    let n = permutation.size
    let matrix = matrix_t.zeros (n, n)
    for (let [i, v] of permutation.pairs ()) {
      matrix.set (v, i, 1)
    }
    return matrix
  }

  tuck_row (i: number, j: number): matrix_t {
    let [m, n] = this.shape
    let row_trans = matrix_t.row_trans (
      permutation_t.id (m) .tuck (i, j)
    )
    return row_trans.mul (this)
  }

  tuck_col (i: number, j: number): matrix_t {
    let [m, n] = this.shape
    let col_trans = matrix_t.col_trans (
      permutation_t.id (n) .tuck (i, j)
    )
    return this.mul (col_trans)
  }

  update_tuck_row (i: number, j: number): matrix_t {
    this.update_copy (this.tuck_row (i, j))
    return this
  }

  update_tuck_col (i: number, j: number): matrix_t {
    this.update_copy (this.tuck_col (i, j))
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
      lower: record.update_add (matrix_t.id (n)),
      upper: matrix,
      permu,
      inver,
    }
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

  non_singular_p (): boolean {
    return ! this.singular_p ()
  }

  invertible_p (): boolean {
    return this.non_singular_p ()
  }

  inv_maybe (): matrix_t | null {
    assert (this.square_p ())
    let [_m, n] = this.shape
    let augmented = this.append_cols (matrix_t.id (n))
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

  det (): number {
    assert (this.square_p ())
    let {
      lower, upper, permu, inver
    } = this.lower_upper_decomposition ()
    let sign: number
    if (inver % 2 === 0) {
      sign = +1
    } else {
      sign = -1
    }
    return sign * upper.diag () .reduce ((acc, cur) => acc * cur)
  }

  epsilon_p (): boolean {
    return this.every (epsilon_p)
  }

  /**
   * The same as `reduced_row_echelon_form`.
   */
  row_canonical_form (): matrix_t {
    let matrix = this.copy ()
    let [m, n] = this.shape
    let i = 0
    let j = 0
    while (i < m && j < n) {
      let k = argmax (i, m, (k) => Math.abs (matrix.get (k, j)))
      if (epsilon_p (matrix.get (k, j))) {
        j += 1
      } else {
        if (k !== i) {
          matrix.update_swap_rows (i, k)
        }
        matrix.row (i) .update_scale (1 / matrix.get (i, j))
        for (let k of ut.ranges ([[0, i], [i + 1, m]])) {
          let v = matrix.get (k, j)
          if (v !== 0) {
            matrix.row (k) .update_sub (matrix.row (i) .scale (v))
          }
        }
        i += 1
        j += 1
      }
    }
    return matrix
  }

  /**
   * `row_trans.mul (this) .eq (canonical)`
   */
  row_canonical_decomposition (): {
    row_trans: matrix_t,
    canonical: matrix_t,
  } {
    let [m, n] = this.shape
    let augmented = this.append_cols (matrix_t.id (m))
    let echelon = augmented.row_canonical_form ()
    return {
      row_trans: echelon.slice (null, [n, n + m]),
      canonical: echelon.slice (null, [0, n]),
    }
  }

  zeros_rows_at_bottom_p (r: number): boolean {
    let [m, n] = this.shape
    for (let i of ut.range (r, m)) {
      let row = this.row (i)
      if (! row.every (epsilon_p)) {
        return false
      }
    }
    return true
  }

  has_row_pivots_p (): boolean {
    let r = this.rank ()
    if (! this.zeros_rows_at_bottom_p (r)) { return false }
    let j = 0
    for (let i of ut.range (0, r)) {
      let arg = this.row (i) .argfirst (non_epsilon_p)
      if (arg === null) {
        return false
      } else if (arg >= j) {
        j = arg
      } else {
        return false
      }
    }
    return true
  }

  *row_pivot_indexes () {
    assert (this.has_row_pivots_p ())
    let r = this.rank ()
    for (let i of ut.range (0, r)) {
      let arg = this.row (i) .argfirst (non_epsilon_p)
      if (arg === null) {
        assert (false)
      } else {
        yield [i, arg] as [number, number]
      }
    }
  }

  /**
   * (1) zeros rows at bottom
   * (2) non zeros has leading pivots from left to right
   * (3) in pivot columns all other elements are zeros
   */
  row_canonical_form_p (): boolean {
    if (! this.has_row_pivots_p ()) { return false }
    for (let [i, j] of this.row_pivot_indexes ()) {
      for (let k of ut.range (0, i)) {
        if (! epsilon_p (this.get (k, j))) {
          return false
        }
      }
    }
    return true
  }

  /**
   * Bases of column space, represented by columns of matrix.
   */
  image (): matrix_t {
    return this.transpose ()
      .row_canonical_form ()
      .transpose ()
      .slice (null, [0, this.rank ()])
  }

  /**
   * Bases of null space, represented by columns of matrix.
   */
  kernel (): matrix_t {
    let [m, n] = this.shape
    let r = this.rank ()
    let { row_trans } = this.transpose ()
      .row_canonical_decomposition ()
    return row_trans.transpose () .slice (null, [r, n])
  }

  solve (b: vector_t): null | vector_t {
    let [m, n] = this.shape
    let r = this.rank ()
    let augmented = this.append_cols (matrix_t.from_col (b))
      .row_canonical_form ()
    for (let i of ut.range (r, m)) {
      if (non_epsilon_p (augmented.get (i, n))) {
        return null
      }
    }
    let vector = vector_t.zeros (n)
    for (let [i, j] of augmented.row_pivot_indexes ()) {
      vector.set (j, augmented.get (i, n))
    }
    return vector
  }

  row_hermite_normal_form (): matrix_t {
    let matrix = this.copy ()
    let [m, n] = this.shape
    let i = 0
    let j = 0
    while (i < m && j < n) {
      if (argall (i, m, (k) => matrix.get (k, j) === 0)) {
        j += 1
      } else {
        while (! (
          (argall (i + 1, m, (k) => matrix.get (k, j) === 0) &&
           argall (0, i, (k) =>
                   0 <= matrix.get (k, j) &&
                   matrix.get (k, j) < matrix.get (i, j)))
        )) {
          let k = argmin_guard (
            i, m,
            (k) => Math.abs (matrix.get (k, j)),
            (k) => matrix.get (k, j) !== 0,
          )
          if (k !== i) {
            matrix.update_swap_rows (i, k)
          }
          if (matrix.get (i, j) < 0) {
            matrix.row (i) .update_scale (-1)
          }
          for (let k of ut.ranges ([[0, i], [i + 1, m]])) {
            let q = num.div (
              matrix.get (k, j),
              matrix.get (i, j))
            if (q !== 0) {
              matrix.row (k)
                .update_sub (matrix.row (i) .scale (q))
            }
          }
        }
        i += 1
        j += 1
      }
    }
    return matrix
  }

  integral_p (): boolean {
    return this.every (Number.isInteger)
  }

  /**
   * (1) zeros rows at bottom
   * (2) non zeros has leading pivots from left to right
   * (3) in pivot columns all other elements are less than pivot
   */
  row_hermite_form_p () {
    if (! this.integral_p ()) { return false }
    if (! this.has_row_pivots_p ()) { return false }
    for (let [i, j] of this.row_pivot_indexes ()) {
      for (let k of ut.range (0, i)) {
        if (! (this.get (k, j) < this.get (i, j))) {
          return false
        }
      }
    }
    return true
  }

  det_abs_one_p () {
    if (! this.integral_p ()) { return false }
    if (! this.invertible_p ()) { return false }
    if (! epsilon_p (Math.abs (this.det ()) - 1)) {
      return false
    }
    return true
  }

  /**
   * `row_trans.mul (this) .eq (hermite)`
   */
  row_hermite_decomposition (): {
    row_trans: matrix_t,
    hermite: matrix_t,
  } {
    let [m, n] = this.shape
    let augmented = this.append_cols (matrix_t.id (m))
    let echelon = augmented.row_hermite_normal_form ()
    return {
      row_trans: echelon.slice (null, [n, n + m]),
      hermite: echelon.slice (null, [0, n]),
    }
  }

  int_image (): matrix_t {
    return this.transpose ()
      .row_hermite_normal_form ()
      .transpose ()
      .slice (null, [0, this.rank ()])
  }

  int_kernel (): matrix_t {
    let [m, n] = this.shape
    let r = this.rank ()
    let { col_trans } = this.smith_decomposition ()
    return col_trans.slice (null, [r, n])
  }

  int_solve (b: vector_t): null | vector_t {
    let [m, n] = this.shape
    assert (b.size === m)
    let r = this.rank ()
    let {
      row_trans,
      col_trans,
      smith,
    } = this.smith_decomposition ()
    let c = b.trans (row_trans)
    let vector = vector_t.zeros (n)
    for (let i of ut.range (0, c.size)) {
      let x = c.get (i)
      let y = i < r ? smith.get (i, i) : 0
      if (y === 0) {
        if (x !== 0) {
          return null
        }
      } else {
        if (x % y === 0) {
          vector.set (i, num.div (x, y))
        } else {
          return null
        }
      }
    }
    return vector.trans (col_trans)
  }

  int_solve_matrix (matrix: matrix_t): null | matrix_t {
    assert (this.integral_p)
    assert (matrix.integral_p)
    let [m, n] = this.shape
    let [p, q] = matrix.shape
    assert (p === m)
    let solution = matrix_t.zeros (n, q)
    for (let [i, col] of matrix.col_entries ()) {
      let x = this.int_solve (col)
      if (x === null) {
        return null
      } else {
        solution.set_col (i, x)
      }
    }
    return solution
  }

  smith_update (): matrix_t {
    let matrix = this
    let [m, n] = this.shape
    let i = 0
    let j = 0
    while (i < m && j < n) {
      if (
        (argall (i, m, (k) => matrix.get (k, j) === 0) &&
         argall (j, n, (k) => matrix.get (i, k) === 0))
      ) {
        i += 1
        j += 1
      } else {
        while (! (
          (argall (i + 1, m, (k) => matrix.get (k, j) === 0) &&
           argall (j + 1, n, (k) => matrix.get (i, k) === 0))
        )) {
          // { // debug
          //   console.log ("main loop")
          //   matrix.print ()
          // }
          // It is amazing that this loop converges.
          // It is like kneading dough.
          while (
            ! argall (i + 1, m, (k) => matrix.get (k, j) === 0)
          ) {
            // { // debug
            //   console.log ("row elimination loop")
            // }
            let k = argmin_guard (
              i, m,
              (k) => Math.abs (matrix.get (k, j)),
              (k) => matrix.get (k, j) !== 0,
            )
            if (k !== i) {
              matrix.update_swap_rows (i, k)
            }
            if (matrix.get (i, j) < 0) {
              matrix.row (i) .update_scale (-1)
            }
            for (let k of ut.range (i + 1, m)) {
              let q = num.div (
                matrix.get (k, j),
                matrix.get (i, j))
              if (q !== 0) {
                matrix.row (k)
                  .update_sub (matrix.row (i) .scale (q))
              }
            }
          }
          while (
            ! argall (j + 1, n, (k) => matrix.get (i, k) === 0)
          ) {
            // { // debug
            //   console.log ("col elimination loop")
            // }
            let k = argmin_guard (
              j, n,
              (k) => Math.abs (matrix.get (i, k)),
              (k) => matrix.get (i, k) !== 0,
            )
            if (k !== j) {
              matrix.update_swap_cols (j, k)
            }
            if (matrix.get (i, j) < 0) {
              matrix.col (j) .update_scale (-1)
            }
            for (let k of ut.range (j + 1, n)) {
              let q = num.div (
                matrix.get (i, k),
                matrix.get (i, j))
              if (q !== 0) {
                matrix.col (k)
                  .update_sub (matrix.col (j) .scale (q))
              }
            }
          }
        }
        i += 1
        j += 1
      }
    }
    return matrix
  }

  invariant_factor_update (): matrix_t {
    let matrix = this
    let [m, n] = this.shape
    m = Math.min (m, n)
    let i = 0
    while (i < m) {
      if (matrix.get (i, i) === 0) {
        for (let k of ut.range (i, m)) {
          matrix.set (k, k, matrix.get (k+1, k+1))
        }
        matrix.set (m-1, m-1, 0)
        m -= 1
      } else {
        let x = matrix.get (i, i)
        for (let k of ut.range (i+1, m)) {
          let y = matrix.get (k, k)
          if (y % x !== 0) {
            matrix.set (k, i, matrix.get (k, k))
            matrix.smith_update ()
          }
        }
        i += 1
      }
    }
    return matrix
  }

  diag_abs_update (): matrix_t {
    let matrix = this
    let [m, n] = this.shape
    m = Math.min (m, n)
    for (let i of ut.range (0, m)) {
      matrix.update_at (i, i, x => Math.abs (x))
    }
    return matrix
  }

  diagonal_p (): boolean {
    let [m, n] = this.shape
    for (let i of ut.range (0, m)) {
      for (let j of ut.range (0, n)) {
        if (i !== j) {
          if (non_epsilon_p (this.get (i, j))) {
            return false
          }
        }
      }
    }
    return true
  }

  smith_normal_form_p (): boolean {
    if (! this.diagonal_p ()) { return false }
    if (! this.every (x => x >= 0)) { return false }
    if (! this.diag () .invariant_factors_p ()) { return false }
    return true
  }

  smith_normal_form (): matrix_t {
    return this.copy ()
      .smith_update ()
      .invariant_factor_update ()
      .diag_abs_update ()
  }

  smith_update_ext (the: {
    row_trans: matrix_t,
    col_trans: matrix_t,
  }) {
    let matrix = this
    let [m, n] = this.shape
    let row_trans = the.row_trans
    let col_trans = the.col_trans
    let i = 0
    let j = 0
    while (i < m && j < n) {
      if (
        (argall (i, m, (k) => matrix.get (k, j) === 0) &&
         argall (j, n, (k) => matrix.get (i, k) === 0))
      ) {
        i += 1
        j += 1
      } else {
        while (! (
          (argall (i + 1, m, (k) => matrix.get (k, j) === 0) &&
           argall (j + 1, n, (k) => matrix.get (i, k) === 0))
        )) {
          // row_trans
          while (
            ! argall (i + 1, m, (k) => matrix.get (k, j) === 0)
          ) {
            let k = argmin_guard (
              i, m,
              (k) => Math.abs (matrix.get (k, j)),
              (k) => matrix.get (k, j) !== 0,
            )
            if (k !== i) {
              matrix.update_swap_rows (i, k)
              row_trans.update_swap_rows (i, k)
            }
            if (matrix.get (i, j) < 0) {
              matrix.row (i) .update_scale (-1)
              row_trans.row (i) .update_scale (-1)
            }
            for (let k of ut.range (i + 1, m)) {
              let q = num.div (
                matrix.get (k, j),
                matrix.get (i, j))
              if (q !== 0) {
                matrix.row (k)
                  .update_sub (matrix.row (i) .scale (q))
                row_trans.row (k)
                  .update_sub (row_trans.row (i) .scale (q))
              }
            }
          }
          // col_trans
          while (
            ! argall (j + 1, n, (k) => matrix.get (i, k) === 0)
          ) {
            let k = argmin_guard (
              j, n,
              (k) => Math.abs (matrix.get (i, k)),
              (k) => matrix.get (i, k) !== 0,
            )
            if (k !== j) {
              matrix.update_swap_cols (j, k)
              col_trans.update_swap_cols (j, k)
            }
            if (matrix.get (i, j) < 0) {
              matrix.col (j) .update_scale (-1)
              col_trans.col (j) .update_scale (-1)
            }
            for (let k of ut.range (j + 1, n)) {
              let q = num.div (
                matrix.get (i, k),
                matrix.get (i, j))
              if (q !== 0) {
                matrix.col (k)
                  .update_sub (matrix.col (j) .scale (q))
                col_trans.col (k)
                  .update_sub (col_trans.col (j) .scale (q))
              }
            }
          }
        }
        i += 1
        j += 1
      }
    }
  }

  invariant_factor_update_ext (the: {
    row_trans: matrix_t,
    col_trans: matrix_t,
  }) {
    let [m, n] = this.shape
    m = Math.min (m, n)
    let i = 0
    while (i < m) {
      if (this.get (i, i) === 0) {
        this.update_tuck_row (i, m-1)
        this.update_tuck_col (i, m-1)
        the.row_trans.update_tuck_row (i, m-1)
        the.col_trans.update_tuck_col (i, m-1)
        m -= 1
      } else {
        let x = this.get (i, i)
        for (let k of ut.range (i+1, m)) {
          let y = this.get (k, k)
          if (y % x !== 0) {
            this.col (i)
              .update_add (this.col (k))
            the.col_trans.col (i)
              .update_add (the.col_trans.col (k))
            this.smith_update_ext (the)
          }
        }
        i += 1
      }
    }
  }

  diag_abs_update_ext (the: {
    row_trans: matrix_t,
  }) {
    let [m, n] = this.shape
    m = Math.min (m, n)
    for (let i of ut.range (0, m)) {
      if (this.get (i, i) < 0) {
        this.set (i, i, - this.get (i, i))
        the.row_trans.row (i) .update_scale (-1)
      }
    }
  }

  /**
   * `row_trans.mul (this) .mul (col_trans) .eq (smith)`
   */
  smith_decomposition (): {
    row_trans: matrix_t,
    col_trans: matrix_t,
    smith: matrix_t,
  } {
    let [m, n] = this.shape
    let smith = this.copy ()
    let the = {
      row_trans: matrix_t.id (m),
      col_trans: matrix_t.id (n),
    }
    smith.smith_update_ext (the)
    assert (the.row_trans.invertible_p ())
    assert (the.col_trans.invertible_p ())
    smith.invariant_factor_update_ext (the)
    assert (the.row_trans.invertible_p ())
    assert (the.col_trans.invertible_p ())
    smith.diag_abs_update_ext (the)
    assert (the.row_trans.invertible_p ())
    assert (the.col_trans.invertible_p ())
    return { ...the, smith }
  }
}

export
function matrix (array: Array2d): matrix_t {
  return matrix_t.fromArray2d (array)
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
  readonly buffer: Float64Array
  readonly shape: [number]
  readonly strides: [number]
  readonly offset: number
  readonly size: number

  constructor (
    buffer: Float64Array,
    shape: [number],
    strides: [number],
    offset: number = 0,
  ) {
    this.buffer = buffer
    this.shape = shape
    this.strides = strides
    this.offset = offset
    this.size = shape [0]
  }

  static from_buffer (
    buffer: Float64Array,
  ): vector_t {
    return new vector_t (buffer, [buffer.length], [1])
  }

  static fromArray (array: Array1d): vector_t {
    return vector_t.from_buffer (new Float64Array (array))
  }

  get_linear_index (x: number): number {
    return (this.offset +
            x * this.strides [0])
  }

  get (i: number): number {
    return this.buffer [this.get_linear_index (i)]
  }

  set (i: number, v: number): vector_t {
    this.buffer [this.get_linear_index (i)] = v
    return this
  }

  toArray (): Array <number> {
    let array = []
    for (let i of ut.range (0, this.size)) {
      array.push (this.get (i))
    }
    return array
  }

  print () {
    console.log ("vector:")
    console.table (this.toArray ())
  }

  *indexes () {
    for (let i of ut.range (0, this.size)) {
      yield i as number
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

  *values () {
    for (let i of ut.range (0, this.size)) {
      let v = this.buffer [this.get_linear_index (i)]
      yield v as number
    }
  }

  *entries () {
    for (let i of ut.range (0, this.size)) {
      let v = this.buffer [this.get_linear_index (i)]
      yield [i, v] as [number, number]
    }
  }

  copy (): vector_t {
    let buffer = new Float64Array (this.size)
    let vector = vector_t.from_buffer (buffer)
    for (let [i, x] of this.entries ()) {
      vector.set (i, x)
    }
    return vector
  }

  *zip (that: vector_t) {
    let this_iter = this.values ()
    let that_iter = that.values ()
    while (true) {
      let this_next = this_iter.next ()
      let that_next = that_iter.next ()
      if (this_next.done || that_next.done) {
        return
      } else {
        yield [this_next.value, that_next.value]
      }
    }
  }

  eq (that: vector_t): boolean {
    if (this.size !== that.size) { return false }
    for (let [x, y] of this.zip (that)) {
      if (x !== y) {
        return false
      }
    }
    return true
  }

  dot (that: vector_t): number {
    assert (this.size === that.size)
    let product = 0
    for (let [i, y] of that.entries ()) {
      product += this.get (i) * y
    }
    return product
  }

  map (f: (v: number) => number): vector_t {
    let vector = this.copy ()
    for (let [i, v] of this.entries ()) {
      vector.update_at (i, f)
    }
    return vector
  }

  scale (a: number): vector_t {
    return this.map (n => n * a)
  }

  update_scale (a: number): vector_t {
    return this.update (n => n * a)
  }

  static constant (n: number, size: number): vector_t {
    let buffer = new Float64Array (size) .fill (n)
    return vector_t.from_buffer (buffer)
  }

  static zeros (size: number): vector_t {
    return vector_t.constant (0, size)
  }

  static ones (size: number): vector_t {
    return vector_t.constant (1, size)
  }

  trans (matrix: matrix_t): vector_t {
    let [m, n] = matrix.shape
    assert (n === this.size)
    let vector = vector_t.zeros (m)
    for (let i of ut.range (0, m)) {
      vector.set (i, this.dot (matrix.row (i)))
    }
    return vector
  }

  append (that: vector_t): vector_t {
    let buffer = new Float64Array (this.size + that.size)
    let vector = vector_t.from_buffer (buffer)
    for (let [i, x] of this.entries ()) {
      vector.set (i, x)
    }
    for (let [i, x] of that.entries ()) {
      vector.set (i + this.size, x)
    }
    return vector
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

  update_add (that: vector_t): vector_t {
    assert (this.size === that.size)
    for (let [i, x] of that.entries ()) {
      this.update_at (i, v => v + x)
    }
    return this
  }

  add (that: vector_t): vector_t {
    assert (this.size === that.size)
    let vector = this.copy ()
    for (let [i, x] of that.entries ()) {
      vector.update_at (i, v => v + x)
    }
    return vector
  }

  update_sub (that: vector_t): vector_t {
    assert (this.size === that.size)
    for (let [i, x] of that.entries ()) {
      this.update_at (i, v => v - x)
    }
    return this
  }

  sub (that: vector_t): vector_t {
    assert (this.size === that.size)
    let vector = this.copy ()
    for (let [i, x] of that.entries ()) {
      vector.update_at (i, v => v - x)
    }
    return vector
  }

  reduce_with (
    init: number,
    f: (acc: number, cur: number) => number,
  ): number {
    let acc = init
    for (let v of this.values ()) {
      acc = f (acc, v)
    }
    return acc
  }

  reduce (
    f: (acc: number, cur: number) => number,
  ): number {
    assert (this.size > 0)
    if (this.size === 1) {
      return this.get (0)
    } else {
      let acc = this.get (0)
      for (let i of ut.range (1, this.size)) {
        acc = f (acc, this.get (i))
      }
      return acc
    }
  }

  argfirst (p: (x: number) => boolean): number | null {
    let lo = 0
    let hi = this.size
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

  argmax (f: (x: number) => number): number {
    let lo = 0
    let hi = this.size
    return argmax (lo, hi, i => f (this.get (i)))
  }

  invariant_factors_p (): boolean {
    for (let i of ut.range (0, this.size)) {
      let x = this.get (i)
      if (x !== 0) {
        for (let k of ut.range (i+1, this.size)) {
          let y = this.get (k)
          if (y % x !== 0) {
            return false
          }
        }
      }
    }
    return true
  }

  zero_p (): boolean {
    return this.every (x => x === 0)
  }

  one_p (): boolean {
    return this.every (x => x === 1)
  }

  epsilon_p (): boolean {
    return this.every (epsilon_p)
  }

  integral_p (): boolean {
    return this.every (Number.isInteger)
  }
}

export
function vector (array: Array1d): vector_t {
  return vector_t.fromArray (array)
}
