import assert from "assert"

export
class morphism_t {
  dom: cell_complex_t
  cod: cell_complex_t
  map: Map <cell_t, { cell: cell_t, orientation: cell_t }>

  constructor (
    dom: cell_complex_t,
    cod: cell_complex_t,
    map: Map <cell_t, { cell: cell_t, orientation: cell_t }>,
  ) {
    this.dom = dom
    this.cod = cod
    this.map = map
  }
}

export
class cell_t extends morphism_t {

}

export
class cell_complex_t {
  /**
   * `cell.dom == new spherical_t (...)`
   * `cell.cod == this.skeleton (id.dim - 1)`
   */
  cell_array: Array <cell_t>
  name_map: Map <string, cell_t>

  constructor (
  ) {
    this.cell_array = new Array ()
    this.name_map = new Map ()
  }
}
