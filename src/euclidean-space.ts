import assert from "assert"

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

  put_row (i: number, src: vector_t): matrix_t {
    this.array.put ([[i, i+1], null], src.array)
    return this
  }

  col (i: number): vector_t {
    return new vector_t (this.array.proj ([null, i]))
  }

  put_col (i: number, src: vector_t): matrix_t {
    this.array.put ([null, [i, i+1]], src.array)
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

  swap_rows (i: number, j: number): matrix_t {
    let x = this.row (i)
    let y = this.row (j)
    this.put_row (i, y)
    this.put_row (j, x)
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
        matrix.swap_rows (h, max)
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
   * row echelon form + back substitution

   * The reduced row echelon form of a matrix is unique
   * i.e. does not depend on the algorithm used to compute it.
   */

  // reduced_row_echelon_form (): matrix_t {
  //   return this.copy ()
  // }

  // lower_upper_decomposition (): [matrix_t, matrix_t] {
  // // TODO
  // }

  // solve (b: vector_t): vector_t | null {
  // // TODO
  // }

  // rank

  // inv_able_p (): boolean {
  // // TODO
  // }

  inv (): matrix_t | null {
    if (! this.square_p ()) {
      throw new Error ("non square matrix")
    }
    // TODO
    return this
  }

  // det (): number {
  // TODO
  // }
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

  set (i: number, v: number) {
    this.array.set ([i], v)
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


  trans (matrix: matrix_t): vector_t {
    return new vector_t (
      this.array.contract (matrix.array, 0, 1))
  }

  act (p: point_t): point_t {
    return p.trans (this)
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
    let array = nd.array_t.zeros ([this.dim])
    let i = 0
    for (let [x, y] of this.array.zip (that.array)) {
      array.set ([i], x - y)
      i += 1
    }
    return new vector_t (array)
  }

  map (f: (n: number) => number): point_t {
    return new point_t (this.array.map (f))
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
    let vector = this.id.copy ()
    let i = 0
    for (let [x, y] of v.array.zip (w.array)) {
      vector.set (i, x + y)
      i += i
    }
    return vector
  }

  neg (x: vector_t): vector_t {
    return x.map (n => -n)
  }

  scale (a: number, x: vector_t): vector_t {
    return x.map (n => n * a)
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
