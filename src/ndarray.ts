import * as _ from "lodash"

export type Array1d = Array <number>
export type Array2d = Array <Array <number>>
export type Array3d = Array <Array <Array <number>>>

export type get_index_t = Array <number>
export type proj_index_t = Array <number | null>
export type slice_index_t = Array <[number, number] | null>

/**
 * strides based row-major ndarray of number
 */
export
class ndarray_t {
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
    this.size = ndarray_t.shape_to_size (shape)
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

  get_linear_index (index: Array <number>): number {
    if (index.length !== this.shape.length) {
      throw new Error ("index length mismatch")
    }
    let linear_index = this.offset
    for (let i = 0; i < index.length; i += 1) {
      linear_index += index [i] * this.strides [i]
    }
    return linear_index
  }

  get (index: Array <number>): number {
    return this.buffer [this.get_linear_index (index)]
  }

  set (index: Array <number>, x: number) {
    this.buffer [this.get_linear_index (index)] = x
  }

  protected linear_index_valid_p (i: number): boolean {
    if (i < this.offset) { return false }
    i -= this.offset
    for (let [n, s] of this.strides.entries ()) {
      if (Math.floor (i / s) < this.shape [n]) {
        i = i % s
      } else {
        return false
      }
    }
    return i === 0
  }

  *linear_entries () {
    for (let k of this.buffer.keys ()) {
      if (this.linear_index_valid_p (k)) {
        yield [k, this.buffer [k]] as [number, number]
      }
    }
  }

  *linear_indexes () {
    for (let k of this.buffer.keys ()) {
      if (this.linear_index_valid_p (k)) {
        yield k as number
      }
    }
  }

  *values () {
    for (let k of this.buffer.keys ()) {
      if (this.linear_index_valid_p (k)) {
        yield this.buffer [k] as number
      }
    }
  }

  copy (): ndarray_t {
    let buffer = new Float64Array (this.size)
    let i = 0
    for (let x of this.values ()) {
      buffer [i] = x
      i += 1
    }
    return new ndarray_t (
      buffer, this.shape,
      ndarray_t.init_strides (this.shape))
  }

  proj (index: Array <number | null>): ndarray_t {
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
    return new ndarray_t (this.buffer, shape, strides, offset)
  }

  slice (index: Array <[number, number] | null>): ndarray_t {
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
    return new ndarray_t (this.buffer, shape, this.strides, offset)
  }

  put (index: Array <[number, number] | null>, src: ndarray_t) {
    let tar = this.slice (index)
    let linear_index_array = Array.from (tar.linear_indexes ())
    let value_array = Array.from (src.values ())
    if (linear_index_array.length !== value_array.length) {
      throw new Error ("size mismatch")
    }
    for (let k in linear_index_array) {
      let i = linear_index_array [k]
      let v = value_array [k]
      tar.buffer [i] = v
    }
  }

  static from_1darray (array: Array1d): ndarray_t {
    let buffer = Float64Array.from (array)
    let shape = [array.length]
    let strides = ndarray_t.init_strides (shape)
    return new ndarray_t (buffer, shape, strides)
  }

  to_1darray (): Array1d {
    return Array.from (this.values ())
  }

  static from_2darray (array: Array2d): ndarray_t {
    let y_length = array.length
    let x_length = array[0].length
    for (let a of array) {
      if (a.length !== x_length) {
        throw new Error ("inner array length mismatch")
      }
    }
    let buffer = Float64Array.from (array.flat ())
    let shape = [y_length, x_length]
    let strides = ndarray_t.init_strides (shape)
    return new ndarray_t (buffer, shape, strides)
  }

  to_2darray (): Array2d {
    let array = []
    let [x, _] = this.shape
    for (let i = 0; i < x; i++) {
      array.push (this.proj ([i, null]) .to_1darray ())
    }
    return array
  }

  static from_3darray (array: Array3d): ndarray_t {
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
    let strides = ndarray_t.init_strides (shape)
    return new ndarray_t (buffer, shape, strides)
  }

  static from_buffer (
    shape: Array <number>,
    buffer: Float64Array,
  ): ndarray_t {
    let strides = ndarray_t.init_strides (shape)
    return new ndarray_t (buffer, shape, strides)
  }

  static numbers (n: number, shape: Array <number>): ndarray_t {
    let size = ndarray_t.shape_to_size (shape)
    let buffer = new Float64Array (size)
    buffer.fill (n)
    let strides = ndarray_t.init_strides (shape)
    return new ndarray_t (buffer, shape, strides)
  }

  static zeros (shape: Array <number>): ndarray_t {
    return ndarray_t.numbers (0, shape)
  }

  static ones (shape: Array <number>): ndarray_t {
    return ndarray_t.numbers (1, shape)
  }

  fill (x: number): ndarray_t {
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
    if (ndarray_t.proj_index_max_p (index, shape)) {
      throw new Error ("index out of shape")
    }
    let [i] = index.slice (-1)
    let [s] = shape.slice (-1)
    if (i === null) {
      let new_index = index.slice ()
      let new_shape = shape.slice ()
      new_index.pop ()
      new_shape.pop ()
      new_index = ndarray_t.proj_index_inc_with_shape (
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
      new_index = ndarray_t.proj_index_inc_with_shape (
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
        index = ndarray_t.proj_index_inc_with_shape (
          index, this.shape)
        if (ndarray_t.proj_index_max_p (index, this.shape)) {
          console.log (index)
          this.proj (index) .table ()
          return
        }
      }
    }
  }

  *zip_many (many: Array <ndarray_t>) {
    let iters = many.map (a => a.values ())
    for (let k of this.buffer.keys ()) {
      if (this.linear_index_valid_p (k)) {
        let array = [this.buffer [k]]
        for (let iter of iters) {
          let next = iter.next ()
          if (next.done) {
            return
          } else {
            array.push (next.value)
          }
        }
        yield array
      }
    }
  }

  *zip (a: ndarray_t) {
    for (let many of this.zip_many ([a])) {
      yield many
    }
  }

  eq (that: ndarray_t): boolean {
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

  map (f: (x: number) => number): ndarray_t {
    let buffer = new Float64Array (this.size)
    let i = 0
    for (let x of this.values ()) {
      buffer [i] = f (x)
      i += 1
    }
    return new ndarray_t (
      buffer, this.shape,
      ndarray_t.init_strides (this.shape))
  }

  for_each (f: (x: number) => any) {
    for (let x of this.values ()) {
      f (x)
    }
  }
}
