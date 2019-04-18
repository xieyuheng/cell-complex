import assert from "assert"

import { dic_t } from "./dic"
import * as nd from "./ndarray"
import * as pd from "./panel-data"
import * as cx from "./cell-complex"

export
class chain_t {
  readonly dim: number
  readonly com: cx.cell_complex_t
  series: pd.series_t
  readonly name: string

  constructor (
    dim: number,
    com: cx.cell_complex_t,
    series: pd.series_t,
  ) {
    this.dim = dim
    this.com = com
    this.series = series
    this.name = series.name
  }

  static zeros (
    name: string,
    dim: number,
    com: cx.cell_complex_t,
  ): chain_t {
    let axis = pd.axis (
      Array.from (com.id_in_dim (dim))
        .map (cx.id_to_str)
    )
    let array = nd.array_t.zeros ([com.size_of_dim (dim)])
    return new chain_t (
      dim, com,
      pd.series (name, axis, array))
  }

  update_at (
    id: cx.id_t,
    f: (v: number) => number,
  ): chain_t {
    let index = pd.index ([
      [this.name, id.to_str ()]
    ])
    this.series.data.update_at (index, f)
    return this
  }

  static boundary_of_basis (
    com: cx.cell_complex_t,
    id: cx.id_t,
  ): chain_t {
    let name = id.to_str ()
    let boundary = chain_t.zeros (name, id.dim - 1, com)
    if (id.dim === 0) {
      return boundary
    } else if (id.dim === 1) {
      let edge = com.get_edge (id)
      boundary.update_at (edge.start, n => n - 1)
      boundary.update_at (edge.end, n => n + 1)
      return boundary
    } else if (id.dim === 2) {
      let face = com.get_face (id)
      for (let e of face.circuit) {
        if (e instanceof cx.rev_id_t) {
          boundary.update_at (e.rev (), n => n - 1)
        } else {
          boundary.update_at (e, n => n + 1)
        }
      }
      return boundary
    } else {
      throw new Error ("can only calculate dim 0, 1, 2 yet")
    }
  }

  static boundary_frame (
    com: cx.cell_complex_t,
    dim: number,
  ): pd.frame_t {
    let array = new Array ()
    for (let id of com.id_in_dim (dim)) {
      let boundary = chain_t.boundary_of_basis (com, id)
      array.push (boundary.series)
    }
    let row_name = dim.toString ()
    let col_name = (dim - 1) .toString ()
    return pd.frame_t.from_cols (
      row_name,
      col_name,
      array,
    )
  }

  // TODO
  // boundary (): chain_t {
  // }

  /**
   * maintain `this.name`
   */
  add (that: chain_t): chain_t {
    assert (this.dim === that.dim)
    let series = that.series.rename (this.name)
    return new chain_t (
      this.dim,
      this.com,
      this.series.add (series))
  }

  print () {
    console.log (`dim: ${this.dim}`)
    this.series.print ()
  }
}
