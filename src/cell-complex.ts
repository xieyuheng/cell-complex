import assert from "assert"
import nanoid from "nanoid"

import * as ut from "./util"

export
class figure_t {
  array: Array <{ src: cell_t, tar: cell_t, cfg: cell_t }>

  constructor (
    array?: Array <{ src: cell_t, tar: cell_t, cfg: cell_t }>
  ) {
    this.array = array || new Array ()
  }

  vertex (
    src: vertex_t,
    tar: vertex_t,
  ) {
    if (! this.has_src (src)) {
      this.array.push ({ src, tar, cfg: new vertex_t () })
    } else {
      throw new Error (`src already defined`)
    }
  }

  edge (
    src: edge_t,
    tar: edge_t,
  ) {
    let cfg = new cell_t ({
      dom: src.endpoints,
      cod: tar.endpoints,
    })
    cfg.fig.vertex (
      src.endpoints.vertex ("start"),
      tar.endpoints.vertex ("start"),
    )
    cfg.fig.vertex (
      src.endpoints.vertex ("end"),
      tar.endpoints.vertex ("end"),
    )
    if (! this.has_src (src)) {
      this.array.push ({ src, tar, cfg })
    } else {
      throw new Error (`src already defined`)
    }
  }

  edge_rev (
    src: edge_t,
    tar: edge_t,
  ) {
    let cfg = new cell_t ({
      dom: src.endpoints,
      cod: tar.endpoints,
    })
    cfg.fig.vertex (
      src.endpoints.vertex ("start"),
      tar.endpoints.vertex ("end"),
    )
    cfg.fig.vertex (
      src.endpoints.vertex ("end"),
      tar.endpoints.vertex ("start"),
    )
    if (! this.has_src (src)) {
      this.array.push ({ src, tar, cfg })
    } else {
      throw new Error (`src already defined`)
    }
  }

  has_src (
    cell: cell_t,
  ): boolean {
    for (let {src} of this.array) {
      if (cell.eq (src)) {
        return true
      }
    }
    return false
  }

  has_tar (
    cell: cell_t,
  ): boolean {
    for (let {tar} of this.array) {
      if (cell.eq (tar)) {
        return true
      }
    }
    return false
  }

  repr (): any {
    let repr: any = []
    for (let {src, tar, cfg} of this.array) {
      repr.push ({
        src: src.uuid,
        tar: tar.uuid,
        cfg: cfg.repr (),
      })
    }
    return repr
  }

  static from_polygon_and_circuit (
    polygon: polygon_t,
    cod: cell_complex_t,
    circuit: circuit_t,
  ): figure_t {
    let size = polygon.size
    let fig = new figure_t ()
    for (let i = 0; i < size; i++) {
      let src = polygon.edge_array [i]
      let edge = circuit [i]
      if (edge instanceof edge_t) {
        let tar = edge
        fig.vertex (src.end, tar.end)
        fig.edge (src, tar)
      } else {
        let tar = edge.rev
        fig.vertex (src.end, tar.start)
        fig.edge_rev (src, tar)
      }
    }
    return fig
  }

  eq (that: figure_t): boolean {
    return ut.array_eq (
      this.array,
      that.array,
      (x, y) => x.src.eq (y.src) &&
        x.tar.eq (y.tar) &&
        x.cfg.eq (y.cfg),
    )
  }
}

export
class morphism_t {
  dom: cell_complex_t
  cod: cell_complex_t
  fig: figure_t
  uuid: string

  constructor (the: {
    dom: cell_complex_t,
    cod: cell_complex_t,
    fig?: figure_t,
    uuid?: string,
  }) {
    this.dom = the.dom
    this.cod = the.cod
    this.fig = the.fig || new figure_t ()
    this.uuid = the.uuid || nanoid (10)
  }

  eq (that: morphism_t): boolean {
    return (this.uuid === that.uuid) &&
      this.dom.eq (that.dom) &&
      this.cod.eq (that.cod) &&
      this.fig.eq (that.fig)
  }

  repr (): any {
    let repr: any = {}
    repr ["uuid"] = this.uuid
    repr ["dom"] = this.dom.repr ()
    repr ["cod"] = this.cod.repr ()
    repr ["fig"] = this.fig.repr ()
    return repr
  }
}

export
class cell_t extends morphism_t {
  dom: spherical_t

  constructor (the: {
    dom: cell_complex_t,
    cod: cell_complex_t,
    fig?: figure_t,
    spherical_evidence?: spherical_evidence_t,
  }) {
    super (the)
    this.dom = new spherical_t (
      the.dom,
      the.spherical_evidence,
    )
  }

  get dim (): number {
    return this.dom.dim + 1
  }

  ser (com: cell_complex_t): number {
    for (let [i, cell] of com.cell_array (this.dim) .entries ()) {
      if (this.eq (cell)) {
        return i
      }
    }
    throw new Error (`fail to find cell in com`)
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

  eq (that: cell_complex_t): boolean {
    return (this.dim === that.dim) &&
      ut.map_eq (
        this.cell_map,
        that.cell_map,
        (x, y) => ut.array_eq (x, y, (v, w) => v.eq (w)),
      ) &&
      ut.map_eq (
        this.name_map,
        that.name_map,
        (x, y) => x.eq (y),
      )
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

  cell_array (dim: number): Array <cell_t> {
    let cell_array = this.cell_map.get (dim)
    if (cell_array !== undefined) {
      return cell_array
    } else {
      return new Array ()
    }
  }

  dim_size (dim: number): number {
    return this.cell_array (dim) .length
  }

  *cells (): IterableIterator <cell_t> {
    for (let d of ut.range (0, this.dim + 1)) {
      for (let cell of this.cell_array (d)) {
        yield cell
      }
    }
  }

  get vertex_array (): Array <vertex_t> {
    return this.cell_array (0) .map (cell => cell as vertex_t)
  }

  get edge_array (): Array <edge_t> {
    return this.cell_array (1) .map (cell => cell as edge_t)
  }

  has_name (name: string): boolean {
    return this.name_map.has (name)
  }

  has_cell (x: cell_t): boolean {
    for (let y of this.cells ()) {
      if (x.eq (y)) {
        return true
      }
    }
    return false
  }

  attach (name: string, cell: cell_t) {
    this.cell_array (cell.dim) .push (cell)
    this.name_map.set (name, cell)
  }


  attach_vertex (name: string) {
    this.attach (name, new vertex_t ())
  }

  attach_vertexes (names: Array <string>) {
    for (let name of names) {
      this.attach_vertex (name)
    }
  }

  attach_edge (name: string, [start, end]: [string, string]) {
    this.attach (name, new edge_t (
      this,
      this.vertex (start),
      this.vertex (end),
    ))
  }

  attach_face (name: string, circuit_exp: Array <edge_exp_t>) {
    this.attach (name, new face_t (
      this,
      circuit_exp.map (exp => edge_exp_eval (this, exp)),
    ))
  }

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

  edge (name: string): edge_t {
    let cell = this.cell (name)
    if (cell instanceof edge_t) {
      return cell
    } else {
      throw new Error (`cell_t not edge_t: ${name}`)
    }
  }

  face (name: string): face_t {
    let cell = this.cell (name)
    if (cell instanceof face_t) {
      return cell
    } else {
      throw new Error (`cell_t not edge_t: ${name}`)
    }
  }

  empty_p (): boolean {
    return this.dim === -1
  }

  repr (): any {
    if (this.empty_p ()) {
      return null
    }
    let repr: any = {}
    repr ["dim"] = this.dim
    for (let [d, cell_array] of this.cell_map) {
      repr [d] = cell_array.map (cell => cell.repr ())
    }
    repr ["name_map"] = {}
    for (let [name, cell] of this.name_map) {
      repr ["name_map"] [name] = cell.uuid
    }
    return repr
  }
}

export
class isomorphism_t extends morphism_t {
  constructor (the: {
    dom: cell_complex_t,
    cod: cell_complex_t,
    fig?: figure_t,
  }) {
    super (the)
    if (! epimorphism_p (this)) {
      ut.log (this.repr ())
      throw new Error ("not epimorphism")
    }
    if (! monomorphism_p (this)) {
      ut.log (this.repr ())
      throw new Error ("not monomorphism")
    }
  }

  static endpoints (
    com: cell_complex_t
  ): isomorphism_t | undefined {
    if (com.dim !== 0) {
      return undefined
    }
    let size = com.vertex_array.length
    if (size !== 2) {
      return undefined
    }
    let [start, end] = com.vertex_array
    let endpoints = new endpoints_t ()
    let fig = new figure_t ()
    fig.vertex (endpoints.vertex ("start"), start)
    fig.vertex (endpoints.vertex ("end"), end)
    return new isomorphism_t ({
      dom: endpoints,
      cod: com,
      fig,
    })
  }

  static polygon (
    com: cell_complex_t
  ): isomorphism_t | undefined {
    if (com.dim !== 1) {
      return undefined
    }
    let size = com.edge_array.length
    if (size !== com.vertex_array.length) {
      return undefined
    }
    if (size === 0) {
      return undefined
    }
    let circuit: circuit_t = new Array ()
    let vertex = com.vertex_array [0]
    let edge_uuid_set = new Set ()
    for (let i = 0; i < size; i++) {
      for (let edge of com.edge_array) {
        if (! edge_uuid_set.has (edge.uuid)) {
          if (edge.start.eq (vertex)) {
            edge_uuid_set.add (edge.uuid)
            circuit.push (edge)
            vertex = edge.end
            break
          } else if (edge.end.eq (vertex)) {
            edge_uuid_set.add (edge.uuid)
            circuit.push (edge)
            vertex = edge.start
            break
          }
        }
      }
    }
    if (circuit.length !== size) {
      return undefined
    }
    let polygon = new polygon_t (size)
    let fig = figure_t
      .from_polygon_and_circuit (polygon, com, circuit)
    return new isomorphism_t ({
      dom: polygon,
      cod: com,
      fig,
    })
  }
}

export
class epimorphism_t extends morphism_t {
  constructor (the: {
    dom: cell_complex_t,
    cod: cell_complex_t,
    fig?: figure_t,
  }) {
    super (the)
    if (! epimorphism_p (this)) {
      throw new Error ("not epimorphism")
    }
  }
}

export
class monomorphism_t extends morphism_t {
  constructor (the: {
    dom: cell_complex_t,
    cod: cell_complex_t,
    fig?: figure_t,
  }) {
    super (the)
    if (! monomorphism_p (this)) {
      throw new Error ("not monomorphism")
    }
  }
}

export
function isomorphism_p (the: {
  dom: cell_complex_t,
  cod: cell_complex_t,
  fig: figure_t,
}): boolean {
  return epimorphism_p (the) && monomorphism_p (the)
}

export
function epimorphism_p (the: {
  dom: cell_complex_t,
  cod: cell_complex_t,
  fig: figure_t,
}): boolean {
  for (let cell of the.cod.cells ()) {
    if (! the.fig.has_tar (cell)) {
      return false
    }
  }
  return true
}

export
function monomorphism_p (the: {
  dom: cell_complex_t,
  cod: cell_complex_t,
  fig: figure_t,
}): boolean {
  let used_uuid_set = new Set <string> ()
  for (let {src, tar} of the.fig.array) {
    if (used_uuid_set.has (tar.uuid)) {
      return false
    } else {
      used_uuid_set.add (tar.uuid)
    }
  }
  return true
}

export
function spherical_check (
  evid: spherical_evidence_t,
  com: cell_complex_t,
): boolean {
  return evid.iso.cod.eq (com)
}

export
class spherical_t extends cell_complex_t {
  spherical_evidence: spherical_evidence_t

  constructor (
    com: cell_complex_t,
    evid?: spherical_evidence_t,
  ) {
    super (com)
    this.spherical_evidence = evid ||
      spherical_evidence_t.generate (this) ||
      ut.panic ("spherical_evidence_t.generate fail")
    assert (
      spherical_check (this.spherical_evidence, com)
    )
  }
}

export
class spherical_evidence_t {
  iso: isomorphism_t

  constructor (
    iso: isomorphism_t,
  ) {
    this.iso = iso
  }

  get dim (): number {
    return this.iso.dom.dim
  }

  static from_iso (
    iso: isomorphism_t | undefined
  ): spherical_evidence_t | undefined {
    if (iso !== undefined) {
      return new spherical_evidence_t (iso)
    } else {
      return undefined
    }
  }

  static generate (
    com: cell_complex_t
  ): spherical_evidence_t | undefined {
    if (com.empty_p ()) {
      return new spherical_evidence_t (
        new isomorphism_t (
          new empty_morphism_t ()
        )
      )
    } else if (com.dim === 0) {
      return spherical_evidence_t.from_iso (
        isomorphism_t.endpoints (com)
      )
    } else if (com.dim === 1) {
      return spherical_evidence_t.from_iso (
        isomorphism_t.polygon (com)
      )
    } else {
      console.log ("[warning] can not check dim 2 yet")
      return undefined
    }
  }
}

// export
// class manifold_t extends cell_complex_t {
//   manifold_evidence: manifold_evidence_t

//   constructor (
//     com: cell_complex_t,
//     evid?: manifold_evidence_t,
//   ) {
//     super (com)
//     if (evid !== undefined) {
//       if (evid.iso.cod.eq (this)) {
//         this.manifold_evidence = evid
//       } else {
//         throw new Error ("manifold_check fail")
//       }
//     } else {
//       evid = manifold_evidence_t.generate (this)
//       if (evid !== undefined) {
//         this.manifold_evidence = evid
//       } else {
//         throw new Error ("manifold_evidence_t.generate fail")
//       }
//     }
//   }
// }

/**
 * A n-dim manifold, is a topological space,
 * each vertex of which has a n-ball as close neighbourhood.

 * For cell-complex, it is sufficient to check that,
 * each vertexes of it has a (n-1)-sphere as [[vertex_figure_t]].
 */
export
class manifold_evidence_t {
  dim: number
  // iso_map: Map <cell_t, isomorphism_t>

  constructor (dim: number) {
    this.dim = dim
    // this.iso_map = new Map ()
  }
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
class empty_morphism_t extends morphism_t {
  constructor () {
    super ({
      dom: new empty_complex_t (),
      cod: new empty_complex_t (),
    })
  }
}

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
    let fig = new figure_t ()
    fig.vertex (dom.vertex ("start"), start)
    fig.vertex (dom.vertex ("end"), end)
    super ({dom, cod, fig})
    this.start = start
    this.end = end
    this.endpoints = dom
  }

  get rev (): edge_rev_t {
    return new edge_rev_t (this)
  }
}

export
class polygon_t extends cell_complex_t {
  size: number

  constructor (size: number) {
    super ({ dim: 1 })
    this.size = size
    for (let i = 0; i < size; i++) {
      this.attach_vertex (`0:${i}`)
    }
    for (let i = 0; i < size - 1; i++) {
      this.attach_edge (`1:${i}`, [ `0:${i}`, `0:${i+1}` ])
    }
    this.attach_edge (`1:${size-1}`, [ `0:${size-1}`, `0:0` ])
  }
}

/**
 * not recursive type like sexp.
 */
export
type edge_exp_t = string | Array <string>;

//// 2 dimension

export
class edge_rev_t {
  rev: edge_t

  constructor (rev: edge_t) {
    this.rev = rev
  }
}

export
function edge_exp_eval (
  com: cell_complex_t,
  exp: edge_exp_t,
): edge_t | edge_rev_t {
  if (typeof exp === "string") {
    let name = exp
    return com.edge (name)
  } else if (exp.length === 2 && exp [1] === "rev") {
    let name = exp [0]
    return new edge_rev_t (com.edge (name))
  } else {
    throw new Error (`unknown exp: ${exp}`)
  }
}

type circuit_t = Array <edge_t | edge_rev_t>

export
class face_t extends cell_t {
  circuit: circuit_t
  polygon: polygon_t

  constructor (
    com: cell_complex_t,
    circuit: circuit_t,
  ) {
    let dom = new polygon_t (circuit.length)
    let cod = com.skeleton (1)
    let fig = figure_t
      .from_polygon_and_circuit (dom, cod, circuit)
    super ({dom, cod, fig})
    this.circuit = circuit
    this.polygon = dom
  }
}
