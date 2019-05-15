import assert from "assert"

import * as ut from "./util"

// maybe uuid
export
class id_t {
  // TODO
}

export
class morphism_t {
  dom: cell_complex_t
  cod: cell_complex_t
  map: Map <cell_t, { cell: cell_t, incident: cell_t }>

  constructor (the: {
    dom: cell_complex_t,
    cod: cell_complex_t,
    map?: Map <cell_t, { cell: cell_t, incident: cell_t }>,
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
    map?: Map <cell_t, { cell: cell_t, incident: cell_t }>,
  }) {
    super (the)
    this.dom = the.dom.as_spherical ()
  }

  get dim (): number {
    return this.dom.dim + 1
  }
}

export
class cell_complex_t {
  dim: number
  cell_map: Map <number, Array <cell_t>>
  name_map: Map <string, cell_t>

  constructor (the: {
    dim: number,
    cell_map?: Map <number, Array <cell_t>>,
    name_map?: Map <string, cell_t>,
  }) {
    this.dim = the.dim
    this.cell_map = the.cell_map || new Map ()
    for (let d of ut.range (0, this.dim + 1)) {
      if (! this.cell_map.has (d)) {
        this.cell_map.set (d, new Array ())
      }
    }
    this.name_map = the.name_map || new Map ()
  }

  as_spherical (): spherical_t {
    return new spherical_t (this)
  }

  skeleton (dim: number): cell_complex_t {
    let com = new cell_complex_t ({ dim })
    for (let [d, cell_array] of this.cell_map) {
      if (d <= dim) {
        com.cell_map.set (d, cell_array)
      }
    }
    for (let [name, cell] of this.name_map) {
      if (cell.dim <= dim) {
        com.name_map.set (name, cell)
      }
    }
    return com
  }

  get_cell_array (dim: number): Array <cell_t> {
    let cell_array = this.cell_map.get (dim)
    if (cell_array !== undefined) {
      return cell_array
    } else {
      throw new Error (`no cell_array at dim: ${dim}`)
    }
  }

  // has_name
  // has_cell

  attach (name: string, cell: cell_t) {
    this.get_cell_array (cell.dim) .push (cell)
    this.name_map.set (name, cell)
  }

  attach_vertexes (names: Array <string>) {
    for (let name of names) {
      this.attach (name, new vertex_t ())
    }
  }

  attach_edge (name: string, [start, end]: [string, string]) {
    // TODO
  }

  // attach_face (name: string, circuit: Array <???>) {
  // // TODO
  // }


  cell (name: string): cell_t {
    let cell = this.name_map.get (name)
    if (cell !== undefined) {
      return cell
    } else {
      throw new Error (`can not find cell: ${name}`)
    }
  }

  vertex (name: string): vertex_t {
    let cell = this.cell (name)
    if (cell instanceof vertex_t) {
      return cell
    } else {
      throw new Error (`cell_t not vertex_t: ${name}`)
    }
  }

  // edge (name: string): edge_t {
  //   let cell = this.cell (name)
  //   if (cell instanceof edge_t) {
  //     return cell
  //   } else {
  //     throw new Error (`cell_t not edge_t: ${name}`)
  //   }
  // }


  // face
}

export
class spherical_t extends cell_complex_t {
  spherical_evidence : spherical_evidence_t

  constructor (the: {
    dim: number,
    cell_map?: Map <number, Array <cell_t>>,
    name_map?: Map <string, cell_t>,
  }) {
    super (the)
    // TODO
    this.spherical_evidence = new spherical_evidence_t ()
  }
}

export
class spherical_evidence_t {
  // TODO
}

//// -1 dimension

export
class empty_complex_t extends cell_complex_t {
  constructor () {
    super ({ dim: -1 })
  }
}

//// 0 dimension

export
class vertex_t extends cell_t {
  constructor () {
    super ({
      dom: new empty_complex_t (),
      cod: new empty_complex_t (),
    })
  }
}

export
class endpoints_t extends cell_complex_t {
  constructor () {
    super ({ dim: 0 })
    this.attach_vertexes (["start", "end"])
  }
}

//// 1 dimension

export
function set_vertex_incident (
  map: Map <cell_t, { cell: cell_t, incident: cell_t }>,
  x: vertex_t,
  y: vertex_t,
) {
  map.set (x, {
    cell: y,
    incident: new vertex_t (),
  })
}

export
class edge_t extends cell_t {
  start: vertex_t
  end: vertex_t
  endpoints: endpoints_t

  constructor (
    com: cell_complex_t,
    start: vertex_t,
    end: vertex_t,
  ) {
    let dom = new endpoints_t ()
    let cod = com.skeleton (0)
    let map = new Map ()
    set_vertex_incident (map, dom.vertex ("start"), start)
    set_vertex_incident (map, dom.vertex ("end"), end)
    super ({dom, cod, map})
    this.start = start
    this.end = end
    this.endpoints = dom
  }
}
