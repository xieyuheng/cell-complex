import * as _ from "lodash"
import assert from "assert"

import * as ut from "./util"
import * as nd from "./ndarray"

import { permutation_t } from "./permutation"

/**
 * The order matters.
 */
export
class axes_t {
  readonly map: Map <string, axis_t>
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
      throw new Error (`name: ${name} undefined`)
    } else {
      return axis
    }
  }

  array_index (index: index_t): nd.index_t {
    let array_index = new Array ()
    // the order is used here
    for (let [name, axis] of this.map) {
      array_index.push (axis.get (index.get (name)))
    }
    return array_index
  }

  array_index_to_index (array_index: nd.index_t): index_t {
    let map = new Map ()
    for (let k of ut.range (0, array_index.length)) {
      let i = array_index [k]
      let name = this.get_name_by_index (k)
      let axis = this.get_axis_by_index (k)
      map.set (name, axis.arg_label (i))
    }
    return new index_t (map)
  }

  array_proj_index (index: index_t): nd.proj_index_t {
    let array_index = new Array ()
    // the order is used here
    for (let [name, axis] of this.map) {
      if (index.map.has (name)) {
        array_index.push (axis.get (index.get (name)))
      } else {
        array_index.push (null)
      }
    }
    return array_index
  }

  array_proj_index_to_index (
    array_proj_index: nd.proj_index_t
  ): index_t {
    let map = new Map ()
    for (let k of ut.range (0, array_proj_index.length)) {
      let i = array_proj_index [k]
      if (i !== null) {
        let name = this.get_name_by_index (k)
        let axis = this.get_axis_by_index (k)
        map.set (name, axis.arg_label (i))
      }
    }
    return new index_t (map)
  }

  print () {
    for (let [name, axis] of this.map) {
      console.log (name)
      console.table (axis.map)
    }
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

  arg_label (index: number): string {
    for (let [label, i] of this.map) {
      if (i === index) {
        return label
      }
    }
    throw new Error ("label not in key of map")
  }

  get (label: string): number {
    let i = this.map.get (label)
    if (i === undefined) {
      throw new Error ("label undefined")
    } else {
      return i
    }
  }

  eq (that: axis_t): boolean {
    if (this.length !== that.length) {
      return false
    } else {
      return _.isEqual (this.map, that.map)
    }
  }

  print () {
    console.table (this.map)
  }
}

export
function axis (array: Array <string>): axis_t {
  return axis_t.from_array (array)
}

export
class index_t {
  map: Map <string, string>

  constructor (map: Map <string, string>) {
    this.map = map
  }

  get (name: string): string {
    let label = this.map.get (name)
    if (label === undefined) {
      throw new Error (`name: ${name} undefined`)
    } else {
      return label
    }
  }

  static from_array (
    array: Array <[string, string]>
  ): index_t {
    return new index_t (new Map (array))
  }

  to_array (): Array <[string, string]> {
    return Array.from (this.map)
  }
}

export
let index = index_t.from_array

export
class slice_index_t {
  map: Map <string, Array <string>>

  constructor (map: Map <string, Array <string>>) {
    this.map = map
  }

  get (name: string): Array <string> {
    let label_array = this.map.get (name)
    if (label_array === undefined) {
      throw new Error (`name: ${name} undefined`)
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
  array: nd.array_t
  readonly shape: Array <number>
  readonly order: number

  constructor (
    axes: axes_t,
    array: nd.array_t,
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

  get (index: index_t): number {
    let array_index = this.axes.array_index (index)
    return this.array.get (array_index)
  }

  set (index: index_t, x: number): data_t {
    let array_index = this.axes.array_index (index)
    this.array.set (array_index, x)
    return this
  }

  update_at (
    index: index_t,
    f: (v: number) => number,
  ): data_t {
    return this.set (index, f (this.get (index)))
  }

  copy (): data_t {
    return new data_t (
      this.axes.copy (),
      this.array.copy (),
    )
  }

  *entries () {
    for (let [array_index, v] of this.array.entries ()) {
      let index = this.axes.array_index_to_index (array_index)
      yield [index, v] as [index_t, number]
    }
  }

  add (that: data_t): data_t {
    let data = this.copy ()
    for (let [i, v] of that.entries ()) {
      data.update_at (i, x => x + v)
    }
    return data
  }

  print () {
    if (this.order === 1) {
      new series_t (this) .print ()
    } else if (this.order === 2) {
      new frame_t (this) .print ()
    } else {
      let array_proj_index: nd.proj_index_t =
        this.shape.slice () .fill (0)
      array_proj_index.pop ()
      array_proj_index.pop ()
      array_proj_index.push (null)
      array_proj_index.push (null)
      while (true) {
        let index =
          this.axes.array_proj_index_to_index (
            array_proj_index)
        console.log ("data index:", index.to_array ())
        console.log ("array index:", array_proj_index)
        this.proj (index) .print ()
        array_proj_index =
          nd.array_t.proj_index_inc_with_shape (
            array_proj_index,
            this.shape)
        if (
          nd.array_t.proj_index_max_p (
            array_proj_index,
            this.shape)
        ) {
          console.log ("data index:", index.to_array ())
          console.log ("array index:", array_proj_index)
          this.proj (index) .print ()
          return
        }
      }
    }
  }

  proj (index: index_t): data_t {
    let axes_array = new Array ()
    for (let [name, axis] of this.axes.map) {
      if (! index.map.has (name)) {
        axes_array.push ([name, axis])
      }
    }
    return new data_t (
      axes_t.from_array (axes_array),
      this.array.proj (
        this.axes.array_proj_index (index)))
  }

  // TODO
  // slice (index: slice_index_t): data_t {
  // }

  contract (
    that: data_t,
    left_name: string,
    right_name: string,
  ): data_t {
    let left_arg = this.axes.arg (left_name)
    let right_arg = that.axes.arg (right_name)
    let array = this.array.contract (
      that.array, left_arg, right_arg)
    let map = new Map ()
    for (let [name, axis] of this.axes.map) {
      if (name !== left_name) {
        map.set (name, axis)
      }
    }
    for (let [name, axis] of that.axes.map) {
      if (name !== right_name) {
        map.set (name, axis)
      }
    }
    let axes = new axes_t (map)
    return new data_t (axes, array)
  }
}

export
interface series_exp_t {
  [k: string]: number
}

export
class series_t {
  data: data_t
  readonly name: string
  readonly axis: axis_t
  readonly array: nd.array_t

  constructor (
    data: data_t,
  ) {
    assert (data.order === 1)
    this.data = data
    this.name = data.axes.get_name_by_index (0)
    this.axis = data.axes.get_axis_by_index (0)
    this.array = data.array
  }

  copy (): series_t {
    return new series_t (this.data)
  }

  rename (name: string) {
    return new_series (name, this.axis, this.array)
  }

  label_to_index (label: string): index_t {
    return index_t.from_array ([
      [this.name, label],
    ])
  }

  get (label: string): number {
    return this.data.get (this.label_to_index (label))
  }

  add (that: series_t): series_t {
    return new series_t (this.data.add (that.data))
  }

  *entries () {
    for (let label of this.axis.map.keys ()) {
      yield [label, this.get (label)] as [string, number]
    }
  }

  to_exp (): series_exp_t {
    let exp: series_exp_t = {}
    for (let [k, v] of this.entries ()) {
      exp [k] = v
    }
    return exp
  }

  print () {
    console.group (`axis_name: ${this.name}`)
    console.table (this.to_exp ())
    console.groupEnd ()
  }
}

export
function new_series (
  name: string,
  axis: axis_t,
  array: nd.array_t,
): series_t {
  let axes = axes_t.from_array ([
    [name, axis],
  ])
  return new series_t (new data_t (axes, array))
}

export
let series = new_series

export
interface frame_exp_t {
  [k: string]: series_exp_t
}

export
class frame_t {
  data: data_t
  readonly array: nd.array_t
  readonly row_name: string
  readonly row_axis: axis_t
  readonly col_name: string
  readonly col_axis: axis_t

  constructor (
    data: data_t,
    row_col_index: [number, number] = [0, 1],
  ) {
    assert (data.order === 2)
    this.data = data
    this.array = data.array
    let [row_index, col_index] = row_col_index
    this.row_name = data.axes.get_name_by_index (row_index)
    this.row_axis = data.axes.get_axis_by_index (row_index)
    this.col_name = data.axes.get_name_by_index (col_index)
    this.col_axis = data.axes.get_axis_by_index (col_index)
  }

  copy (): frame_t {
    return new frame_t (this.data)
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
    let lower = new Array <nd.array_t> ()
    for (let row of rows) {
      assert (row.axis.eq (col_axis))
      label_array.push (row.name)
      lower.push (row.array)
    }
    let row_axis = axis_t.from_array (label_array)
    return new_frame (
      row_name, row_axis,
      col_name, col_axis,
      nd.array_t.from_lower_order (lower),
    )
  }

  static from_cols (
    row_name: string,
    col_name: string,
    cols: Array <series_t>,
  ): frame_t {
    return frame_t.from_rows (
      col_name,
      row_name,
      cols,
    ) .transpose ()
  }

  transpose (): frame_t {
    return new frame_t (this.data, [1, 0])
  }

  row (label: string): series_t {
    return new series_t (this.data.proj (
      index_t.from_array ([
        [this.row_name, label],
      ])
    ))
  }

  col (label: string): series_t {
    return new series_t (this.data.proj (
      index_t.from_array ([
        [this.col_name, label],
      ])
    ))
  }

  *rows () {
    for (let label of this.row_axis.map.keys ()) {
      yield this.row (label) as series_t
    }
  }

  *row_entries () {
    for (let label of this.row_axis.map.keys ()) {
      yield [label, this.row (label)] as [string, series_t]
    }
  }

  *cols () {
    for (let label of this.col_axis.map.keys ()) {
      yield this.col (label) as series_t
    }
  }

  *col_entries () {
    for (let label of this.col_axis.map.keys ()) {
      yield [label, this.col (label)] as [string, series_t]
    }
  }

  add (that: frame_t): frame_t {
    return new frame_t (this.data.add (that.data))
  }

  mul (that: frame_t): frame_t {
    return new frame_t (
      this.data.contract (
        that.data, this.col_name, that.row_name))
  }

  /**
   * row is always the major.
   */
  to_exp (): frame_exp_t {
    let exp: frame_exp_t = {}
    for (let [label, row] of this.row_entries ()) {
      exp [label] = row.to_exp ()
    }
    return exp
  }

  print () {
    console.log (`row_name: ${this.row_name}`)
    console.log (`col_name: ${this.col_name}`)
    console.group ()
    console.table (this.to_exp ())
    console.groupEnd ()
  }
}

export
function new_frame (
  row_name: string, row_axis: axis_t,
  col_name: string, col_axis: axis_t,
  array: nd.array_t,
): frame_t {
  let axes = axes_t.from_array ([
    [row_name, row_axis],
    [col_name, col_axis],
  ])
  return new frame_t (new data_t (axes, array))
}

export
let frame = new_frame
