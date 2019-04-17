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

  index (data_index: data_index_t): nd.index_t {
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
  print () {

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
class frame_t extends data_t {
  readonly row_name: string
  readonly row_axis: axis_t
  readonly col_name: string
  readonly col_axis: axis_t

  constructor (
    data: data_t,
    row_col_index: [number, number] = [0, 1],
  ) {
    assert (data.order === 2)
    super (data.axes, data.array)
    let [row_index, col_index] = row_col_index
    this.row_name = this.axes.get_name_by_index (row_index)
    this.row_axis = this.axes.get_axis_by_index (row_index)
    this.col_name = this.axes.get_name_by_index (col_index)
    this.col_axis = this.axes.get_axis_by_index (col_index)
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
    return new frame_t (this, [1, 0])
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
