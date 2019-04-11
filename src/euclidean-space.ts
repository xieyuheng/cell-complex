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

  row (i: number): vector_t {
    return new vector_t (this.array.proj ([i, null]))
  }

  col (i: number): vector_t {
    return new vector_t (this.array.proj ([null, i]))
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

  // TODO
  // det (): number {}
  // inv (): matrix_t {}
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
