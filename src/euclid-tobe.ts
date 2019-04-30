import * as _ from "lodash"
import assert from "assert"

import * as ut from "./util"
import * as num from "./number"
import { permutation_t } from "./permutation"

import { set_t } from "./abstract/set"
import { monoid_t, abelian_group_t } from "./abstract/group"
import { euclidean_ring_t } from "./abstract/ring"

export type Array1d <R> = Array <R>
export type Array2d <R> = Array <Array <R>>
export type Array3d <R> = Array <Array <Array <R>>>

export
function ring <R> (the: {
  elements: set_t <R>,
  zero: R,
  add: (x: R, y: R) => R,
  neg: (x: R) => R,
  one: R,
  mul: (x: R, y: R) => R,
  degree_lt: (x: R, y: R) => boolean,
  divmod: (x: R, y: R) => [R, R],
}): euclidean_ring_t <R> {
  return new euclidean_ring_t ({
    addition: new abelian_group_t ({
      elements: the.elements,
      id: the.zero,
      add: the.add,
      neg: the.neg,
    }),
    multiplication: new monoid_t ({
      elements: the.elements,
      id: the.one,
      mul: the.mul,
    }),
    degree_lt: the.degree_lt,
    divmod: the.divmod,
  })
}

export
class matrix_t <R> {
  readonly ring: euclidean_ring_t <R>
  readonly buffer: Array <R>
  readonly shape: [number, number]
  readonly strides: [number, number]
  readonly offset: number
  readonly size: number

  constructor (the: {
    ring: euclidean_ring_t <R>,
    buffer: Array <R>,
    shape: [number, number],
    strides: [number, number],
    offset?: number,
  }) {
    this.ring = the.ring
    this.buffer = the.buffer
    this.shape = the.shape
    this.strides = the.strides
    this.offset = the.offset === undefined ? 0 : the.offset
    this.size = matrix_t.shape_to_size (the.shape)
  }

  static shape_to_size ([x, y]: [number, number]): number {
    return x * y
  }

  static shape_to_strides (
    [x, y]: [number, number]
  ): [number, number] {
    return [y, 1]
  }

  static from_buffer <R> (
    ring: euclidean_ring_t <R>,
    buffer: Array <R>,
    shape: [number, number],
  ): matrix_t <R> {
    let strides = matrix_t.shape_to_strides (shape)
    return new matrix_t ({ ring, buffer, shape, strides })
  }

  static fromArray2d <R> (
    ring: euclidean_ring_t <R>,
    array: Array2d <R>,
  ): matrix_t <R> {
    let y_length = array.length
    let x_length = array[0].length
    for (let a of array) {
      if (a.length !== x_length) {
        throw new Error ("inner array length mismatch")
      }
    }
    return matrix_t.from_buffer (
      ring,
      Array.from (array.flat ()),
      [y_length, x_length],
    )
  }

  static from_row <R> (
    ring: euclidean_ring_t <R>,
    row: vector_t <R>,
  ): matrix_t <R> {
    let [s] = row.strides
    return new matrix_t ({
      ring,
      buffer: row.buffer,
      shape: [1, row.size],
      strides: [0, s],
      offset: row.offset,
    })
  }

  static from_col <R> (
    ring: euclidean_ring_t <R>,
    col: vector_t <R>,
  ): matrix_t <R> {
    let [t] = col.strides
    return new matrix_t ({
      ring,
      buffer: col.buffer,
      shape: [col.size, 1],
      strides: [t, 0],
      offset: col.offset,
    })
  }

  get_linear_index (x: number, y: number): number {
    return (this.offset +
            x * this.strides [0] +
            y * this.strides [1])
  }

  get (x: number, y: number): R {
    return this.buffer [this.get_linear_index (x, y)]
  }

  set (x: number, y: number, v: R): matrix_t <R> {
    this.buffer [this.get_linear_index (x, y)] = v
    return this
  }

  update_at (
    i: number,
    j: number,
    f: (v: R) => R,
  ): matrix_t <R> {
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
      yield [i, j, v] as [number, number, R]
    }
  }

  *values () {
    for (let [i, j] of this.indexes ()) {
      let v = this.get (i, j)
      yield v as R
    }
  }

  update_op1 (
    op: (x: R) => R,
  ): matrix_t <R> {
    let [m, n] = this.shape
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        let v = op (this.get (i, j))
        this.set (i, j, v)
      }
    }
    return this
  }

  same_shape_p (that: matrix_t <R>): boolean {
    return ((this.shape [0] === that.shape [0]) &&
            (this.shape [1] === that.shape [1]))
  }

  update_op2 (
    that: matrix_t <R>,
    op: (x: R, y: R) => R,
  ): matrix_t <R> {
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
  ): matrix_t <R> {
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
    return new matrix_t ({
      ring: this.ring,
      buffer: this.buffer,
      shape: [m, n],
      strides: this.strides,
      offset,
    })
  }

  copy (): matrix_t <R> {
    let matrix = matrix_t.from_buffer (
      this.ring,
      new Array (this.size),
      this.shape,
    )
    for (let [i, j, x] of this.entries ()) {
      matrix.set (i, j, x)
    }
    return matrix
  }

  update_copy (that: matrix_t <R>): matrix_t <R> {
    let [m, n] = this.shape
    for (let i of ut.range (0, m)) {
      for (let j of ut.range (0, n)) {
        this.set (i, j, that.get (i, j))
      }
    }
    return this
  }

  // TODO
  // row
}

export
class vector_t <R> {
  readonly ring: euclidean_ring_t <R>
  readonly buffer: Array <R>
  readonly shape: [number]
  readonly strides: [number]
  readonly offset: number
  readonly size: number

  constructor (the: {
    ring: euclidean_ring_t <R>,
    buffer: Array <R>,
    shape: [number],
    strides: [number],
    offset?: number,
  }) {
    this.ring = the.ring
    this.buffer = the.buffer
    this.shape = the.shape
    this.strides = the.strides
    this.offset = the.offset === undefined ? 0 : the.offset
    this.size = the.shape [0]
  }
}
