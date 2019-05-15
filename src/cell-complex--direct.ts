import assert from "assert"

export
class morphism_t {
  dom: cell_complex_t
  cod: cell_complex_t
  map: Map <cell_t, { cell: cell_t, inci: cell_t }>

  constructor (the: {
    dom: cell_complex_t,
    cod: cell_complex_t,
    map?: Map <cell_t, { cell: cell_t, inci: cell_t }>,
  }) {
    this.dom = the.dom
    this.cod = the.cod
    this.map = the.map || new Map ()
  }
}

export
class cell_t extends morphism_t {
  dom: spherical_t

  constructor (the: {
    dom: cell_complex_t,
    cod: cell_complex_t,
    map?: Map <cell_t, { cell: cell_t, inci: cell_t }>,
  }) {
    super (the)
    this.dom = the.dom.as_spherical ()
  }
}

export
class cell_complex_t {
  dim: number
  cell_array: Array <cell_t>
  name_map: Map <string, cell_t>

  constructor (the: {
    dim?: number,
    cell_array?: Array <cell_t>,
    name_map?: Map <string, cell_t>,
  }) {
    this.dim = the.dim || -1
    this.cell_array = the.cell_array || new Array ()
    this.name_map = the.name_map || new Map ()
  }

  as_spherical (): spherical_t {
    return new spherical_t (this)
  }
}

export
class spherical_t extends cell_complex_t {
  spherical_evidence : spherical_evidence_t

  constructor (the: {
    dim?: number,
    cell_array?: Array <cell_t>,
    name_map?: Map <string, cell_t>,
  }) {
    super (the)
    this.spherical_evidence = new spherical_evidence_t ()
  }
}

export
class spherical_evidence_t {

}
