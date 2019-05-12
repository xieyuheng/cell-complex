import * as _ from "lodash"
import assert from "assert"

import * as ut from "./util"

import { permutation_t } from "./permutation"

export type Array1d = Array <number>
export type Array2d = Array <Array <number>>
export type Array3d = Array <Array <Array <number>>>

export type index_t = Array <number>
export type proj_index_t = Array <number | null>
export type slice_index_t = Array <[number, number] | null>

/**
 * strides based row-major ndarray of number
 */
export
class array_t {
  readonly size: number
  readonly order: number

  /**
   * I keep the basic constructor low level,
   * and mainly use specific constructors in client modules.
   */
  constructor (
    protected buffer: Float64Array,
    readonly shape: Array <number>,
    readonly strides: Array <number>,
    readonly offset: number = 0,
  ) {
    this.order = shape.length
    this.size = array_t.shape_to_size (shape)
    if (strides.length !== shape.length) {
      throw new Error ("strides shape length mismatch")
    }
    if (buffer.length < this.size + offset) {
      throw new Error ("buffer not large enough")
    }
  }

  static shape_to_size (shape: Array <number>): number {
    return shape.reduce ((acc, cur) => acc * cur)
  }

  static shape_to_strides (
    shape: Array <number>
  ): Array <number> {
    let strides: Array <number> = []
    let acc = 1
    shape.slice () .reverse () .forEach ((x) => {
      strides.push (acc)
      acc *= x
    })
    return strides.reverse ()
  }

  get_linear_index (index: index_t): number {
    if (index.length !== this.shape.length) {
      throw new Error ("index length mismatch")
    }
    let linear_index = this.offset
    for (let i = 0; i < index.length; i += 1) {
      linear_index += index [i] * this.strides [i]
    }
    return linear_index
  }

  linear_get (i: number): number {
    return this.buffer [i]
  }

  linear_set (i: number, v: number): array_t {
    this.buffer [i] = v
    return this
  }

  get (index: index_t): number {
    let i = this.get_linear_index (index)
    return this.linear_get (i)
  }

  set (index: index_t, x: number): array_t {
    let i = this.get_linear_index (index)
    this.linear_set (i, x)
    return this
  }

  update_at (
    index: index_t,
    f: (v: number) => number,
  ): array_t {
    return this.set (index, f (this.get (index)))
  }

  *values () {
    for (let index of indexes_of_shape (this.shape)) {
      yield this.get (index) as number
    }
  }

  *entries () {
    for (let index of indexes_of_shape (this.shape)) {
      yield [
        index.slice (),
        this.get (index),
      ] as [ index_t, number ]
    }
  }

  *indexes () {
    for (let index of indexes_of_shape (this.shape)) {
      yield index.slice () as index_t
    }
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

  copy (): array_t {
    let buffer = new Float64Array (this.size)
    let array = new array_t (
      buffer, this.shape,
      array_t.shape_to_strides (this.shape))
    for (let [i, x] of this.entries ()) {
      array.set (i, x)
    }
    return array
  }

  proj (index: proj_index_t): array_t {
    if (index.length !== this.shape.length) {
      throw new Error ("index length mismatch")
    }
    let shape = new Array <number> ()
    let strides = new Array <number> ()
    let offset = this.offset
    for (let [k, v] of index.entries ()) {
      if (v === null) {
        shape.push (this.shape [k])
        strides.push (this.strides [k])
      } else {
        offset += v * this.strides [k]
      }
    }
    return new array_t (this.buffer, shape, strides, offset)
  }

  slice (index: slice_index_t): array_t {
    if (index.length !== this.shape.length) {
      throw new Error ("index length mismatch")
    }
    let shape = this.shape.slice ()
    let offset = this.offset
    for (let [k, v] of index.entries ()) {
      if (v !== null) {
        let [start, end] = v
        shape [k] = end - start
        offset += start * this.strides [k]
      }
    }
    return new array_t (this.buffer, shape, this.strides, offset)
  }

  /**
   * the order of `src` array can be higher or lower,
   * as long as its `.values` match `tar.indexes`.
   */
  put (
    index: slice_index_t,
    src: array_t,
  ): array_t {
    let tar = this.slice (index)
    let index_array = Array.from (tar.indexes ())
    let value_array = Array.from (src.values ())
    if (index_array.length !== value_array.length) {
      throw new Error ("size mismatch")
    }
    for (let k in index_array) {
      let i = index_array [k]
      let v = value_array [k]
      tar.set (i, v)
    }
    return this
  }

  put_porj (
    index: proj_index_t,
    src: array_t,
  ): array_t {
    let slice_index = index.map (i => {
      if (i === null) {
        return null
      } else {
        return [i, i+1]
      }
    }) as slice_index_t
    return this.put (slice_index, src)
  }

  add (that: array_t): array_t {
    let array = this.copy ()
    for (let [i, v] of that.entries ()) {
      array.update_at (i, x => x + v)
    }
    return array
  }

  static from_1darray (array: Array1d): array_t {
    let buffer = Float64Array.from (array)
    let shape = [array.length]
    let strides = array_t.shape_to_strides (shape)
    return new array_t (buffer, shape, strides)
  }

  to_1darray (): Array1d {
    return Array.from (this.values ())
  }

  static from_2darray (array: Array2d): array_t {
    let y_length = array.length
    let x_length = array[0].length
    for (let a of array) {
      if (a.length !== x_length) {
        throw new Error ("inner array length mismatch")
      }
    }
    let buffer = Float64Array.from (array.flat ())
    let shape = [y_length, x_length]
    let strides = array_t.shape_to_strides (shape)
    return new array_t (buffer, shape, strides)
  }

  to_2darray (): Array2d {
    let array = []
    let [x, _] = this.shape
    for (let i = 0; i < x; i++) {
      array.push (this.proj ([i, null]) .to_1darray ())
    }
    return array
  }

  static from_3darray (array: Array3d): array_t {
    let z_length = array.length
    let y_length = array[0].length
    let x_length = array[0][0].length
    for (let a of array) {
      if (a.length !== y_length) {
        throw new Error ("inner array length mismatch")
      } else {
        for (let b of a) {
          if (b.length !== x_length) {
            throw new Error ("inner inner array length mismatch")
          }
        }
      }
    }
    let buffer = Float64Array.from (array.flat (2))
    let shape = [z_length, y_length, x_length]
    let strides = array_t.shape_to_strides (shape)
    return new array_t (buffer, shape, strides)
  }

  static from_buffer (
    buffer: Float64Array,
    shape: Array <number>,
  ): array_t {
    let strides = array_t.shape_to_strides (shape)
    return new array_t (buffer, shape, strides)
  }

  static constant (n: number, shape: Array <number>): array_t {
    let size = array_t.shape_to_size (shape)
    let buffer = new Float64Array (size)
    buffer.fill (n)
    let strides = array_t.shape_to_strides (shape)
    return new array_t (buffer, shape, strides)
  }

  static zeros (shape: Array <number>): array_t {
    return array_t.constant (0, shape)
  }

  static ones (shape: Array <number>): array_t {
    return array_t.constant (1, shape)
  }

  fill (x: number): array_t {
    this.buffer.fill (x)
    return this
  }

  static proj_index_max_p (
    index: proj_index_t,
    shape: Array <number>,
  ): boolean {
    if (index.length !== shape.length) {
      throw new Error ("index length mismatch")
    }
    let flag = true
    for (let k in index) {
      let i = index [k]
      let s = shape [k]
      if (i !== null && i < (s - 1)) {
        flag = false
      }
    }
    return flag
  }

  static proj_index_inc_with_shape (
    index: proj_index_t,
    shape: Array <number>,
  ): proj_index_t {
    if (index.length !== shape.length) {
      throw new Error ("index length mismatch")
    }
    if (array_t.proj_index_max_p (index, shape)) {
      throw new Error ("index out of shape")
    }
    let [i] = index.slice (-1)
    let [s] = shape.slice (-1)
    if (i === null) {
      let new_index = index.slice ()
      let new_shape = shape.slice ()
      new_index.pop ()
      new_shape.pop ()
      new_index = array_t.proj_index_inc_with_shape (
        new_index,
        new_shape,
      )
      new_index.push (null)
      return new_index
    } else if (i >= s - 1) {
      let new_index = index.slice ()
      let new_shape = shape.slice ()
      new_index.pop ()
      new_shape.pop ()
      new_index = array_t.proj_index_inc_with_shape (
        new_index,
        new_shape,
      )
      new_index.push (0)
      return new_index
    } else {
      let new_index = index.slice ()
      new_index.pop ()
      new_index.push (i + 1)
      return new_index
    }
  }

  print () {
    if (this.order === 1) {
      console.table (this.to_1darray ())
    } else if (this.order === 2) {
      console.table (this.to_2darray ())
    } else {
      let index: proj_index_t = this.shape.slice () .fill (0)
      index.pop ()
      index.pop ()
      index.push (null)
      index.push (null)
      while (true) {
        console.log ("array index:", index)
        this.proj (index) .print ()
        index =
          array_t.proj_index_inc_with_shape (
            index,
            this.shape)
        if (array_t.proj_index_max_p (index, this.shape)) {
          console.log ("array index:", index)
          this.proj (index) .print ()
          return
        }
      }
    }
  }

  *zip (that: array_t) {
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

  eq (that: array_t): boolean {
    if (this.size !== that.size) { return false }
    if (this.order !== that.order) { return false }
    if (! _.isEqual (this.shape, that.shape)) { return false }
    for (let [x, y] of this.zip (that)) {
      if (x !== y) {
        return false
      }
    }
    return true
  }

  map (f: (x: number) => number): array_t {
    let buffer = new Float64Array (this.size)
    let array = new array_t (
      buffer, this.shape,
      array_t.shape_to_strides (this.shape))
    for (let [i, x] of this.entries ()) {
      array.set (i, f (x))
    }
    return array
  }

  for_each (f: (x: number) => any): array_t {
    for (let x of this.values ()) {
      f (x)
    }
    return this
  }

  append (k: number, that: array_t): array_t {
    assert (this.order === that.order)
    for (let j of ut.range (0, this.order)) {
      if (j !== k) {
        assert (this.shape [j] === that.shape [j])
      }
    }
    let shape = this.shape.slice ()
    shape [k] = this.shape [k] + that.shape [k]
    let buffer = new Float64Array (array_t.shape_to_size (shape))
    let strides = array_t.shape_to_strides (shape)
    let array = new array_t (buffer, shape, strides)
    let offset = this.shape [k]
    for (let i of array.indexes ()) {
      if (i [k] < offset) {
        array.set (i, this.get (i))
      } else {
        let j = i.slice ()
        j [k] = j [k] - offset
        array.set (i, that.get (j))
      }
    }
    return array
  }

  reshape (
    permutation: permutation_t
  ): array_t {
    let shape = new Array ()
    let strides = new Array ()
    for (let i of permutation) {
      shape.push (this.shape [i])
      strides.push (this.strides [i])
    }
    return new array_t (
      this.buffer, shape, strides,
      this.offset)
  }

  permute (
    k: number,
    permutation: permutation_t,
  ): array_t {
    assert (permutation.size === this.shape [k])
    let array = this.copy ()
    for (let i of this.indexes ()) {
      let j = i.slice ()
      j [k] = permutation.get (j [k])
      array.set (j, this.get (i))
    }
    return array
  }

  // [1, 2, <3>, 4]
  //    [2, <3>, 4, 5]
  // => [1, 2, 4, 2, 4, 5]
  contract (
    that: array_t,
    i: number,
    j: number,
  ): array_t {
    let this_size = this.shape [i]
    let that_size = that.shape [j]
    if (this_size !== that_size) {
      throw new Error ("size mismatch")
    }
    let shape = new Array ()
    this.shape.forEach ((s, k) => {
      if (k !== i) {
        shape.push (s)
      }
    })
    that.shape.forEach ((s, k) => {
      if (k !== j) {
        shape.push (s)
      }
    })
    let size = array_t.shape_to_size (shape)
    let buffer = new Float64Array (size)
    let strides = array_t.shape_to_strides (shape)
    let array = new array_t (buffer, shape, strides)
    let split_index = (
      index: index_t
    ): [proj_index_t, proj_index_t] => {
      let left = index.slice (0, this.order - 1) as proj_index_t
      left.splice (i, 0, null)
      let right = index.slice (this.order - 1) as proj_index_t
      right.splice (j, 0, null)
      return [left, right]
    }
    for (let index of array.indexes ()) {
      let [left, right] = split_index (index)
      let sum = 0
      let zip = this.proj (left) .zip (that.proj (right))
      for (let [x, y] of zip) {
        sum += x * y
      }
      array.set (index, sum)
    }
    return array
  }

  static from_lower_order (lower: Array <array_t>): array_t {
    assert (lower.length !== 0)
    let first_array = lower [0]
    let first_shape = first_array.shape
    let shape = [lower.length] .concat (first_array.shape)
    let size = array_t.shape_to_size (shape)
    let buffer = new Float64Array (size)
    let higher = new array_t (
      buffer, shape,
      array_t.shape_to_strides (shape))
    for (let i of ut.range (0, lower.length)) {
      let array = lower [i]
      assert (_.isEqual (array.shape, first_shape))
      let index: proj_index_t = [i]
      index = index.concat (ut.repeats (null, shape.length-1))
      higher.put_porj (index, array)
    }
    return higher
  }
}

export
function array1d_p (array: Array <any>): boolean {
  if (array.length === 0) {
    return true
  } else {
    return typeof array [0] === 'number'
  }
}

export
function array2d_p (array: Array <any>): boolean {
  if (array.length === 0) {
    return true
  } else {
    return array1d_p (array [0])
  }
}

export
function array3d_p (array: Array <any>): boolean {
  if (array.length === 0) {
    return true
  } else {
    return array2d_p (array [0])
  }
}

export
function array (array: Array1d | Array2d | Array3d): array_t {
  if (array1d_p (array)) {
    return array_t.from_1darray (array as Array1d)
  } else if (array2d_p (array)) {
    return array_t.from_2darray (array as Array2d)
  } else if (array3d_p (array)) {
    return array_t.from_3darray (array as Array3d)
  } else {
    throw new Error ("can only handle Array1d | Array2d | Array3d")
  }
}

export
function index_max_p (
  index: index_t,
  shape: Array <number>,
): boolean {
  for (let k in index) {
    let i = index [k]
    let s = shape [k]
    if (i < s - 1) {
      return false
    }
  }
  return true
}

/**
 * recursive side-effect over index
 */
export
function index_step (
  index: index_t,
  shape: Array <number>,
  cursor: number,
): index_t {
  let i = index [cursor]
  let s = shape [cursor]
  if (i < s - 1) {
    index [cursor] = i + 1
    return index
  } else {
    index [cursor] = 0
    return index_step (index, shape, cursor - 1)
  }
}

export
function* indexes_of_shape (shape: Array <number>) {
  let size = shape.length
  let index = new Array (size) .fill (0)
  yield index
  while (true) {
    if (index_max_p (index, shape)) {
      return
    } else {
      yield index_step (index, shape, size - 1)
    }
  }
}
