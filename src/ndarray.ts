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

  static init_strides (
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

  get (index: index_t): number {
    return this.buffer [this.get_linear_index (index)]
  }

  set (index: index_t, x: number): array_t {
    this.buffer [this.get_linear_index (index)] = x
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
      array_t.init_strides (this.shape))
    for (let [i, x] of this.entries ()) {
      array.set (i, x)
    }
    return array
  }

  proj (index: Array <number | null>): array_t {
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
      if (v === null) {
      } else {
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
    let slice_index: slice_index_t = index.map (i => {
      if (i === null) {
        return null
      } else {
        return [i, i+1]
      }
    })
    return this.put (slice_index, src)
  }

  // TODO
  // add

  static from_1darray (array: Array1d): array_t {
    let buffer = Float64Array.from (array)
    let shape = [array.length]
    let strides = array_t.init_strides (shape)
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
    let strides = array_t.init_strides (shape)
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
    let strides = array_t.init_strides (shape)
    return new array_t (buffer, shape, strides)
  }

  static from_buffer (
    shape: Array <number>,
    buffer: Float64Array,
  ): array_t {
    let strides = array_t.init_strides (shape)
    return new array_t (buffer, shape, strides)
  }

  static numbers (n: number, shape: Array <number>): array_t {
    let size = array_t.shape_to_size (shape)
    let buffer = new Float64Array (size)
    buffer.fill (n)
    let strides = array_t.init_strides (shape)
    return new array_t (buffer, shape, strides)
  }

  static zeros (shape: Array <number>): array_t {
    return array_t.numbers (0, shape)
  }

  static ones (shape: Array <number>): array_t {
    return array_t.numbers (1, shape)
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

  table () {
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
        console.log (index)
        this.proj (index) .table ()
        index = array_t.proj_index_inc_with_shape (
          index, this.shape)
        if (array_t.proj_index_max_p (index, this.shape)) {
          console.log (index)
          this.proj (index) .table ()
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
      array_t.init_strides (this.shape))
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
    let strides = array_t.init_strides (shape)
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
    let strides = array_t.init_strides (shape)
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
      array_t.init_strides (shape))
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

/**
 * The order matters.
 */
export
class axes_t {
  map: Map <string, axis_t>
  readonly length: number
  readonly shape: Array <number>
  readonly order: number

  constructor (
    map: Map <string, axis_t>
  ) {
    this.map = map
    this.length = map.size
    let shape = new Array ()
    for (let axis of map.values ()) {
      shape.push (axis.length)
    }
    this.shape = shape
    this.order = shape.length
  }

  static from_array (
    array: Array <[string, axis_t]>
  ): axes_t {
    return new axes_t (new Map (array))
  }

  copy (): axes_t {
    return new axes_t (new Map (this.map))
  }

  arg (name: string): number {
    let i = 0
    for (let k of this.map.keys ()) {
      if (k === name) {
        return i
      }
      i += 1
    }
    throw new Error ("name not in key of map")
  }

  name_array (): Array <string> {
    return Array.from (this.map.keys ())
  }

  axis_array (): Array <axis_t> {
    return Array.from (this.map.values ())
  }

  get_name_by_index (i: number): string {
    return this.name_array () [i]
  }

  get_axis_by_index (i: number): axis_t {
    return this.axis_array () [i]
  }

  get (name: string): axis_t {
    let axis = this.map.get (name)
    if (axis === undefined) {
      throw new Error ("name undefined")
    } else {
      return axis
    }
  }

  *[Symbol.iterator] () {
    for (let [k, v] of this.map) {
      yield [k, v] as [string, axis_t]
    }
  }

  index (data_index: data_index_t): index_t {
    let index = new Array ()
    // the order is used here
    for (let [name, axis] of this) {
      index.push (axis.get (data_index.get (name)))
    }
    return index
  }
}

export
let axes = axes_t.from_array

export
class axis_t {
  readonly map: Map <string, number>
  readonly length: number

  constructor (
    map: Map <string, number> = new Map (),
  ) {
    this.map = map
    this.length = map.size
  }

  static from_array (array: Array <string>): axis_t {
    let map = new Map ()
    for (let i of ut.range (0, array.length)) {
      let v = array [i]
      map.set (v, i)
    }
    return new axis_t (map)
  }

  copy (): axis_t {
    return new axis_t (new Map (this.map))
  }

  arg (name: string): number {
    let i = 0
    for (let k of this.map.keys ()) {
      if (k === name) {
        return i
      }
      i += 1
    }
    throw new Error ("name not in key of map")
  }

  get (label: string): number {
    let i = this.map.get (label)
    if (i === undefined) {
      throw new Error ("label undefined")
    } else {
      return i
    }
  }

  *[Symbol.iterator] () {
    for (let [k, v] of this.map) {
      yield [k, v] as [string, number]
    }
  }

  eq (that: axis_t): boolean {
    if (this.length !== that.length) {
      return false
    } else {
      return _.isEqual (this.map, that.map)
    }
  }
}

export
function axis (array: Array <string>): axis_t {
  return axis_t.from_array (array)
}

export
class data_index_t {
  map: Map <string, string>

  constructor (map: Map <string, string>) {
    this.map = map
  }

  get (name: string): string {
    let label = this.map.get (name)
    if (label === undefined) {
      throw new Error ("name undefined")
    } else {
      return label
    }
  }

  static from_array (
    array: Array <[string, string]>
  ): data_index_t {
    return new data_index_t (new Map (array))
  }
}

export
let data_index = data_index_t.from_array

export
class data_slice_index_t {
  map: Map <string, Array <string>>

  constructor (map: Map <string, Array <string>>) {
    this.map = map
  }

  get (name: string): Array <string> {
    let label_array = this.map.get (name)
    if (label_array === undefined) {
      throw new Error ("name undefined")
    } else {
      return label_array
    }
  }
}

/**
 * ndarray + named axes,
 * where an axis maps labels to indexes.

 * Do not implicitly generate data when there are missing data.
 * Missing data should be handled explicitly.
 */
export
class data_t {
  axes: axes_t
  array: array_t
  readonly shape: Array <number>
  readonly order: number

  constructor (
    axes: axes_t,
    array: array_t,
  ) {
    if (! _.isEqual (axes.shape, array.shape)) {
      console.log ("axes.shape:", axes.shape)
      console.log ("array.shape:", array.shape)
      throw new Error ("shape mismatch")
    }
    this.axes = axes
    this.array = array
    this.shape = axes.shape
    this.order = axes.order
  }

  get (data_index: data_index_t): number {
    let index = this.axes.index (data_index)
    return this.array.get (index)
  }

  set (data_index: data_index_t, x: number): data_t {
    let index = this.axes.index (data_index)
    this.array.set (index, x)
    return this
  }

  update_at (
    data_index: data_index_t,
    f: (v: number) => number,
  ): data_t {
    return this.set (data_index, f (this.get (data_index)))
  }

  copy (): data_t {
    return new data_t (
      this.axes.copy (),
      this.array.copy (),
    )
  }

  // TODO
  // proj

  // TODO
  // slice

  // TODO
  // contract

  // TODO
  // add
}

export
class series_t extends data_t {
  readonly name: string
  readonly axis: axis_t

  constructor (
    data: data_t,
  ) {
    assert (data.order === 1)
    super (data.axes, data.array)
    this.name = this.axes.get_name_by_index (0)
    this.axis = this.axes.get_axis_by_index (0)
  }
}

export
function new_series (
  name: string,
  axis: axis_t,
  array: array_t,
): series_t {
  let axes = axes_t.from_array ([
    [name, axis],
  ])
  return new series_t (new data_t (axes, array))
}

export
let series = new_series

export
class frame_t extends data_t {
  readonly row_name: string
  readonly row_axis: axis_t
  readonly col_name: string
  readonly col_axis: axis_t

  constructor (
    data: data_t,
  ) {
    assert (data.order === 2)
    super (data.axes, data.array)
    this.row_name = this.axes.get_name_by_index (0)
    this.row_axis = this.axes.get_axis_by_index (0)
    this.col_name = this.axes.get_name_by_index (1)
    this.col_axis = this.axes.get_axis_by_index (1)
  }

  static from_rows (
    row_name: string,
    col_name: string,
    rows: Array <series_t>,
  ): frame_t {
    assert (rows.length !== 0)
    let first_row = rows [0]
    let label_array = new Array ()
    let col_axis = first_row.axis
    let lower = new Array <array_t> ()
    for (let row of rows) {
      assert (row.axis.eq (col_axis))
      label_array.push (row.name)
      lower.push (row.array)
    }
    let row_axis = axis_t.from_array (label_array)
    return new_frame (
      row_name, row_axis,
      col_name, col_axis,
      array_t.from_lower_order (lower),
    )
  }
}

export
function new_frame (
  row_name: string, row_axis: axis_t,
  col_name: string, col_axis: axis_t,
  array: array_t,
): frame_t {
  let axes = axes_t.from_array ([
    [row_name, row_axis],
    [col_name, col_axis],
  ])
  return new frame_t (new data_t (axes, array))
}

export
let frame = new_frame
