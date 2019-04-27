import assert from "assert"

import { dic_t } from "./dic"

/**
 * In the context of a [[cell_complex_t]],
 * The dimension and a serial number can identify a cell.
 */
export
class id_t {
  constructor (
    readonly dim: number,
    readonly ser: number,
  ) {}

  eq (that: id_t): boolean {
    return ((this.dim === that.dim) &&
            (this.ser === that.ser))
  }

  to_str (): string {
    return `${this.dim}:${this.ser}`
  }

  static valid_id_str (str: string): boolean {
    let words = str.split (":")
    if (words.length !== 2) { return false }
    let dim = Number.parseInt (words [0])
    let ser = Number.parseInt (words [1])
    if (Number.isNaN (dim)) { return false }
    if (Number.isNaN (ser)) { return false }
    return true
  }

  static parse (str: string): id_t {
    assert (this.valid_id_str (str))
    let words = str.split (":")
    let dim = Number.parseInt (words [0])
    let ser = Number.parseInt (words [1])
    return new id_t (dim, ser)
  }

  rev (): rev_id_t {
    return new rev_id_t (this)
  }
}

export
function id_to_str (id: id_t): string {
  return id.to_str ()
}

export
class im_t {
  constructor (
    public id: id_t,
    public cell: cell_t,
  ) {}

  to_exp (): im_exp_t {
    return {
      id: this.id.to_str (),
      cell: this.cell.to_exp (),
    }
  }

  eq (that: im_t): boolean {
    return this.id.eq (that.id) && this.cell.eq (that.cell)
  }
}

function im_dic_dim_compatible_p (
  dom: cell_complex_t,
  cod: cell_complex_t,
  dic: im_dic_t,
  dim: number,
): boolean {
  for (let [id, im] of dic) {
    if (id.dim === dim) {
      for (let [id1, im1] of im.cell.dic) {
        let x = dom.get (id) .dic.get (id1) .id
        let y = cod.get (im.id) .dic.get (im1.id) .id
        if (! dic.get (x) .id.eq (y)) {
          return false
        }
      }
    }
  }
  return true
}

function im_dic_compatible_p (
  dom: cell_complex_t,
  cod: cell_complex_t,
  dic: im_dic_t,
): boolean {
  if (dom.cell_dic.size !== dic.size) {
    return false
  }
  let dim = dom.dim
  while (dim > 0) {
    if (im_dic_dim_compatible_p (dom, cod, dic, dim)) {
      dim -= 1
    } else {
      return false
    }
  }
  return true
}

function im_dic_has_value_id (
  dic: im_dic_t,
  id: id_t,
): boolean {
  for (let im of dic.values ()) {
    if (id.eq (im.id)) {
      return true
    }
  }
  return false
}

export
class im_dic_t extends dic_t <id_t, im_t> {
  constructor () {
    super (id_to_str)
  }
}

/**
 * Note that,
 * The category induced by this `morphism_t`
 * is intended to capture the category of topological spaces.

 * But, for example,
 * An edge can not be mapped to a path of two edges,
 * if we allow such map,
 * the inverse of a morphism would be problematic,
 * and the definition of [[im_t]] would be much more complicated.

 * Thus to capture the category of topological spaces,
 * we also need to use subdivision.
 */
export
class morphism_t {
  constructor (
    readonly dom: cell_complex_t,
    readonly cod: cell_complex_t,
    readonly dic: im_dic_t,
  ) {
    if (! im_dic_compatible_p (dom, cod, dic)) {
      throw new Error ("im_dic not compatible")
    }
  }

  get dim (): number {
    return this.dom.dim + 1
  }

  to_exp (): morphism_exp_t {
    return {
      dom: this.dom.to_exp (),
      cod: this.cod.to_exp (),
      dic: im_dic_to_exp (this.dic),
    }
  }

  static from_exp (exp: morphism_exp_t): morphism_t {
    let dom = cell_complex_t.from_exp (exp.dom)
    let cod = cell_complex_t.from_exp (exp.cod)
    let dic = new im_dic_t ()
    let iter = Object.entries (exp.dic)
    for (let [k, v] of iter) {
      let id = id_t.parse (k)
      let im = new im_t (
        id_t.parse (v.id),
        cell_t.from_exp (v.cell))
      dic.set (id, im)
    }
    return new morphism_t (dom, cod, dic)
  }

  eq (that: morphism_t): boolean {
    if (! this.dom.eq (that.dom)) {
      return false
    } else if (! this.cod.lteq (that.cod)) {
      return false
    } else if (! this.dic.key_eq (that.dic)) {
      return false
    } else {
      for (let [k, [x, y]] of this.dic.zip (that.dic)) {
        if (! x.eq (y)) {
          return false
        }
      }
      return true
    }
  }
}

export
class morphism_builder_t {
  dom: cell_complex_t
  cod: cell_complex_t
  dic: im_dic_t

  constructor (
    dom: cell_complex_t,
    cod: cell_complex_t,
  ) {
    this.dom = dom
    this.cod = cod
    this.dic = new im_dic_t ()
  }

  point (x: id_t, y: id_t): morphism_builder_t {
    let im = new im_t (y, empty_cell)
    this.dic.set (x, im)
    return this
  }

  point_ser (x: number, y: number): morphism_builder_t {
    return this.point (new id_t (0, x), new id_t (0, y))
  }

  edge (x: id_t, y: id_t): morphism_builder_t {
    let cell = new cell_t (
      new endpoints_t (),
      this.cod.skeleton (1),
      new im_dic_t () .merge_array ([
        [new id_t (0, 0), new im_t (new id_t (0, 0), empty_cell)],
        [new id_t (0, 1), new im_t (new id_t (0, 1), empty_cell)],
      ]))
    let im = new im_t (y, cell)
    this.dic.set (x, im)
    return this
  }

  edge_ser (x: number, y: number): morphism_builder_t {
    return this.edge (new id_t (1, x), new id_t (1, y))
  }

  edge_rev (x: id_t, y: id_t): morphism_builder_t {
    let cell = new cell_t (
      new endpoints_t (),
      this.cod.skeleton (1),
      new im_dic_t () .merge_array ([
        [new id_t (0, 0), new im_t (new id_t (0, 1), empty_cell)],
        [new id_t (0, 1), new im_t (new id_t (0, 0), empty_cell)],
      ]))
    let im = new im_t (y, cell)
    this.dic.set (x, im)
    return this
  }

  edge_ser_rev (x: number, y: number): morphism_builder_t {
    return this.edge_rev (new id_t (1, x), new id_t (1, y))
  }

  build_morphism (): morphism_t {
    return new morphism_t (this.dom, this.cod, this.dic)
  }

  build_isomorphism (): isomorphism_t {
    return new isomorphism_t (this.dom, this.cod, this.dic)
  }

  build_cell (): cell_t {
    return new cell_t (this.dom, this.cod, this.dic)
  }

  build_im_dic (): im_dic_t {
    return this.dic
  }
}

export
class cell_t extends morphism_t {
  readonly dom: spherical_t

  constructor (
    dom: cell_complex_t,
    cod: cell_complex_t,
    dic: im_dic_t,
  ) {
    super (dom, cod, dic)
    this.dom = dom.as_spherical ()
  }

  static from_exp (exp: morphism_exp_t): cell_t {
    let dom = cell_complex_t.from_exp (exp.dom)
    let cod = cell_complex_t.from_exp (exp.cod)
    let dic = new im_dic_t ()
    let iter = Object.entries (exp.dic)
    for (let [k, v] of iter) {
      let id = id_t.parse (k)
      let im = new im_t (
        id_t.parse (v.id),
        cell_t.from_exp (v.cell))
      dic.set (id, im)
    }
    return new cell_t (dom, cod, dic)
  }
}

export
function im_dic_to_exp (
  dic: im_dic_t
): {
  [id: string]: im_exp_t
} {
  let exp: {
    [id: string]: im_exp_t
  } = {}
  for (let [id, im] of dic) {
    exp [id.to_str ()] = im.to_exp ()
  }
  return exp
}

interface cell_complex_exp_t {
  [id: string] : morphism_exp_t
}

interface im_exp_t {
  id: string,
  cell: morphism_exp_t,
}

interface morphism_exp_t {
  dom: cell_complex_exp_t,
  cod: cell_complex_exp_t,
  dic: {
    [id: string]: im_exp_t
  }
}

export
class cell_complex_t {
  readonly cell_dic: dic_t <id_t, cell_t>
  protected name_dic: dic_t <string, id_t>

  constructor (
    bui: cell_complex_builder_t =
      new cell_complex_builder_t ()
  ) {
    this.cell_dic = bui.cell_dic.copy ()
    this.name_dic = bui.name_dic.copy ()
  }

  get dim (): number {
    let array = this.cell_dic.key_array () .map (id => id.dim)
    return Math.max (-1, ...array)
  }

  dim_of (id: id_t): number {
    return this.get (id) .dim
  }

  size_of_dim (dim: number): number {
    return Array.from (this.in_dim (dim)) .length
  }

  skeleton (dim: number): cell_complex_t {
    let com = new cell_complex_t ()
    for (let [id, cell] of this.cell_dic.to_array ()) {
      if (id.dim <= dim) {
        com.cell_dic.set (id, cell)
      }
    }
    return com
  }

  *id_in_dim (dim: number) {
    for (let id of this.cell_dic.keys ()) {
      if (id.dim === dim) {
        yield id as id_t
      }
    }
  }

  *in_dim (dim: number) {
    for (let [id, cell] of this.cell_dic) {
      if (id.dim === dim) {
        yield [id, cell] as [id_t, cell_t]
      }
    }
  }

  *points () {
    for (let [id, _cell] of this.in_dim (0)) {
      yield id
    }
  }

  point_id_array (): Array <id_t> {
    return Array.from (this.points ())
  }

  has (id: id_t): boolean {
    return this.cell_dic.has (id)
  }

  get (id: id_t): cell_t {
    return this.cell_dic.get (id)
  }

  as_spherical (): spherical_t {
    return new spherical_t (this)
  }

  get_edge (id: id_t): edge_t {
    return this.as_builder () .get_edge (id)
  }

  get_face (id: id_t): face_t {
    return this.as_builder () .get_face (id)
  }

  as_builder (): cell_complex_builder_t {
    let bui = new cell_complex_builder_t ()
    bui.cell_dic = this.cell_dic.copy ()
    return bui
  }

  copy (): cell_complex_t {
    return new cell_complex_t (this.as_builder ())
  }

  to_exp (): cell_complex_exp_t {
    let exp: cell_complex_exp_t = {}
    for (let [id, cell] of this.cell_dic) {
      exp [id.to_str ()] = cell.to_exp ()
    }
    return exp
  }

  static from_exp (exp: cell_complex_exp_t): cell_complex_t {
    let bui = new cell_complex_builder_t ()
    let iter = Object.entries (exp)
      .filter (([k, _]) => id_t.valid_id_str (k))
    for (let [k, v] of iter) {
      let id = id_t.parse (k)
      let cell = cell_t.from_exp (v)
      bui.set (id, cell)
    }
    return bui.build ()
  }

  eq (that: cell_complex_t): boolean {
    if (! this.cell_dic.key_eq (that.cell_dic)) {
      return false
    }
    for (let [k, [x, y]] of this.cell_dic.zip (that.cell_dic)) {
      if (! x.eq (y)) {
        return false
      }
    }
    return true
  }

  lt (that: cell_complex_t): boolean {
    if (! this.cell_dic.key_lt (that.cell_dic)) {
      return false
    }
    for (let [k, [x, y]] of this.cell_dic.zip (that.cell_dic)) {
      if (! x.eq (y)) {
        return false
      }
    }
    return true
  }

  lteq (that: cell_complex_t): boolean {
    if (! this.cell_dic.key_lteq (that.cell_dic)) {
      return false
    }
    for (let [k, [x, y]] of this.cell_dic.zip (that.cell_dic)) {
      if (! x.eq (y)) {
        return false
      }
    }
    return true
  }

  gt (that: cell_complex_t): boolean {
    return that.lt (this)
  }

  gteq (that: cell_complex_t): boolean {
    return that.lteq (this)
  }

  define_point (name: string, id: id_t): cell_complex_t {
    assert (id.dim === 0)
    this.name_dic.set (name, id)
    return this
  }

  define_edge (name: string, id: id_t): cell_complex_t {
    assert (id.dim === 1)
    this.name_dic.set (name, id)
    return this
  }

  define_face (name: string, id: id_t): cell_complex_t {
    assert (id.dim === 2)
    this.name_dic.set (name, id)
    return this
  }

  id (name: string): id_t {
    return this.name_dic.get (name)
  }

  cell (name: string): cell_t {
    return this.get (this.id (name))
  }

  edge (name: string): edge_t {
    return this.get_edge (this.id (name))
  }

  face (name: string): face_t {
    return this.get_face (this.id (name))
  }

  // chain_from_array (
  //   dim: number,
  //   array: Array <[id_t, number]>,
  // ): chain_t {
  //   let chain = new chain_t (dim, this)
  //   for (let [id, n] of array) {
  //     chain.dic.update_at (id, m => m + n)
  //   }
  //   return chain
  // }
}

export
class cell_complex_builder_t {
  cell_dic: dic_t <id_t, cell_t>
  name_dic: dic_t <string, id_t>

  constructor () {
    this.cell_dic = new dic_t (id_to_str)
    this.name_dic = new dic_t ()
  }

  get dim (): number {
    let array = this.cell_dic.key_array () .map (id => id.dim)
    return Math.max (0, ...array)
  }

  set (id: id_t, cell: cell_t) {
    this.cell_dic.set (id, cell)
  }

  has (id: id_t): boolean {
    return this.cell_dic.has (id)
  }

  get (id: id_t): cell_t {
    return this.cell_dic.get (id)
  }

  gen_id (dim: number): id_t {
    let ser = 0
    for (let id of this.cell_dic.key_array ()) {
      if (id.dim === dim) {
        ser = Math.max (ser, id.ser) + 1
      }
    }
    return new id_t (dim, ser)
  }

  inc_one_point (): id_t {
    let id = this.gen_id (0)
    this.set (id, empty_cell)
    return id
  }

  inc_points (n: number): Array <id_t> {
    let array = new Array <id_t> ()
    for (let i = 0; i < n; i += 1) {
      array.push (this.inc_one_point ())
    }
    return array
  }

  attach (cell: cell_t): id_t {
    let id = this.gen_id (cell.dim)
    this.cell_dic.set (id, cell)
    return id
  }

  attach_edge (start: id_t, end: id_t): id_t {
    return this.attach (new edge_t (this, start, end))
  }

  attach_face (circuit: circuit_t): id_t {
    return this.attach (new face_t (this, circuit))
  }

  get_edge (id: id_t): edge_t {
    if (id.dim !== 1) {
      throw new Error ("dimension mismatch")
    } else {
      let cell = this.get (id)
      let endpoints = new endpoints_t ()
      let start = cell.dic.get (endpoints.id ("start")) .id
      let end = cell.dic.get (endpoints.id ("end")) .id
      return new edge_t (this, start, end)
    }
  }

  get_face (id: id_t): face_t {
    if (id.dim !== 2) {
      throw new Error ("dimension mismatch")
    } else {
      let cell = this.get (id)
      let circuit = new Array <id_t | rev_id_t> ()
      let size = cell.dom.size_of_dim (1)
      let polygon = new polygon_t (size)
      for (let side_id of polygon.side_id_array) {
        let im = cell.dic.get (side_id)
        let endpoints = new endpoints_t ()
        let start = endpoints.id ("start")
        let end = endpoints.id ("end")
        let dic = im.cell.dic
        if ((dic.get (start) .id.eq (start)) &&
            (dic.get (end) .id.eq (end))) {
          circuit.push (im.id)
        } else if ((dic.get (start) .id.eq (end)) &&
                   (dic.get (end) .id.eq (start))) {
          circuit.push (im.id.rev ())
        } else {
          throw new Error ("endpoints mismatch")
        }
      }
      return new face_t (this, circuit)
    }
  }

  build (): cell_complex_t {
    return new cell_complex_t (this)
  }

  skeleton (dim: number): cell_complex_t {
    return this.build () .skeleton (dim)
  }
}

function epimorphism_p (
  dom: cell_complex_t,
  cod: cell_complex_t,
  dic: im_dic_t,
): boolean {
  for (let id of cod.cell_dic.keys ()) {
    if (! im_dic_has_value_id (dic, id)) {
      return false
    }
  }
  return true
}

export
class epimorphism_t extends morphism_t {
  constructor (
    dom: cell_complex_t,
    cod: cell_complex_t,
    dic: im_dic_t,
  ) {
    if (! epimorphism_p (dom, cod, dic)) {
      throw new Error ("not epimorphism")
    }
    super (dom, cod, dic)
  }
}

function monomorphism_p (
  dom: cell_complex_t,
  cod: cell_complex_t,
  dic: im_dic_t,
): boolean {
  let id_str_set = new Set <string> ()
  for (let im of dic.values ()) {
    let str = im.id.to_str ()
    if (id_str_set.has (str)) {
      return false
    } else {
      id_str_set.add (str)
    }
  }
  return true
}

export
class monomorphism_t extends morphism_t {
  constructor (
    dom: cell_complex_t,
    cod: cell_complex_t,
    dic: im_dic_t,
  ) {
    if (! monomorphism_p (dom, cod, dic)) {
      throw new Error ("not monomorphism")
    }
    super (dom, cod, dic)
  }
}

function isomorphism_p (
  dom: cell_complex_t,
  cod: cell_complex_t,
  dic: im_dic_t,
): boolean {
  return epimorphism_p (dom, cod, dic) && monomorphism_p (dom, cod, dic)
}

/**
 * When generating the new cell-complex,
 * such as [[vertex_figure_t]] and [[product_complex_t]],
 * it does not matter how we specify the dic.
 * `isomorphism_t` handles the non uniqueness of dic.
 */
export
class isomorphism_t extends morphism_t {
  constructor (
    dom: cell_complex_t,
    cod: cell_complex_t,
    dic: im_dic_t,
  ) {
    if (! isomorphism_p (dom, cod, dic)) {
      throw new Error ("not isomorphism")
    }
    super (dom, cod, dic)
  }
}

export
function isomorphic_to_endpoints (
  com: cell_complex_t
): isomorphism_t | null {
  if (com.dim !== 0) {
    return null
  }
  let size = com.size_of_dim (0)
  if (size !== 2) {
    return null
  }
  let [start, end] = com.point_id_array ()
  let endpoints = new endpoints_t ()
  let dic = new morphism_builder_t (
    endpoints, com
  ) .point (endpoints.id ("start"), start)
    .point (endpoints.id ("end"), end)
    .build_im_dic ()
  return new isomorphism_t (endpoints, com, dic)
}

function find_next_edge_id (
  com: cell_complex_t,
  point: id_t,
  edge_id_set: Set <id_t | rev_id_t>,
): [id_t, id_t | rev_id_t] | null {
  for (let id of com.id_in_dim (1)) {
    if (! edge_id_set.has (id)) {
      let edge = com.get_edge (id)
      if (edge.start.eq (point)) {
        point = edge.end
        edge_id_set.add (id)
        return [point, id]
      } else if (edge.end.eq (point)) {
        point = edge.start
        edge_id_set.add (id)
        return [point, id.rev ()]
      }
    }
  }
  return null
}

export
function isomorphic_to_polygon (
  com: cell_complex_t
): isomorphism_t | null {
  if (com.dim !== 1) {
    return null
  }
  let size = com.size_of_dim (0)
  if (size !== com.size_of_dim (1)) {
    return null
  }
  if (size < 1) {
    return null
  }
  let circuit = new Array ()
  let { value: point } = com.id_in_dim (0) .next ()
  let edge_id_set = new Set ()
  for (let i = 0; i < size; i++) {
    let found = find_next_edge_id (com, point, edge_id_set)
    if (found === null) {
      return null
    } else {
      let [next_point, id] = found
      circuit.push (id)
      point = next_point
    }
  }
  let polygon = new polygon_t (size)
  let dic = polygon_zip_circuit (polygon, com, circuit)
  if (isomorphism_p (polygon, com, dic)) {
    return new isomorphism_t (polygon, com, dic)
  } else {
    return null
  }
}

/**
 * A n-dim manifold, is a topological space,
 * each point of which has a n-ball as close neighbourhood.

 * For cell-complex, it is sufficient to check that,
 * each points of it has a (n-1)-sphere as [[vertex_figure_t]].
 */
export
class manifold_evidence_t {
  dim: number
  iso_dic: dic_t <id_t, isomorphism_t>

  constructor (dim: number) {
    this.dim = dim
    this.iso_dic = new dic_t (id_to_str)
  }
}

export
function manifold_check (
  com: cell_complex_t
): manifold_evidence_t | null {
  if (com.eq (empty_complex)) {
    return new manifold_evidence_t (com.dim)
  } else if (com.dim === 0) {
    return new manifold_evidence_t (com.dim)
  } else if (com.dim === 1) {
    let evidence = new manifold_evidence_t (com.dim)
    for (let vertex of com.points ()) {
      let verf = new vertex_figure_t (com, vertex)
      let iso = isomorphic_to_endpoints (verf)
      if (iso === null) {
        return null
      } else {
        evidence.iso_dic.set (vertex, iso)
      }
    }
    return evidence
  } else if (com.dim === 2) {
    let evidence = new manifold_evidence_t (com.dim)
    for (let vertex of com.points ()) {
      let verf = new vertex_figure_t (com, vertex)
      let iso = isomorphic_to_polygon (verf)
      if (iso === null) {
        return null
      } else {
        evidence.iso_dic.set (vertex, iso)
      }
    }
    return evidence
  } else {
    console.log ("[warning] can not check dim 3 yet")
    return null
  }
}

export
class manifold_t extends cell_complex_t {
  readonly manifold_evidence
  : manifold_evidence_t

  constructor (com: cell_complex_t) {
    super (com.as_builder ())
    let manifold_evidence = manifold_check (this)
    if (manifold_evidence === null) {
      throw new Error ("manifold_check fail")
    } else {
      this.manifold_evidence = manifold_evidence
    }
  }
}

/**
 * `vertex_figure` commute with sub_complex relation.
 * (respecting the vertex)
 */
export
class vertex_figure_t extends cell_complex_t {
  readonly com: cell_complex_t
  readonly vertex: id_t
  readonly idx_dic: dic_t <[id_t, id_t], id_t>

  constructor (
    com: cell_complex_t,
    vertex: id_t,
  ) {
    let index_to_str = ([c, p]: [id_t, id_t]): string => {
      return c.to_str () + ", " + p.to_str ()
    }
    let idx_dic = new dic_t <[id_t, id_t], id_t> (index_to_str)
    let bui = new cell_complex_builder_t ()

    for (let [id, cell] of com.in_dim (1)) {
      for (let p of cell.dom.points ()) {
        if (cell.dic.get (p) .id.eq (vertex)) {
          idx_dic.set ([id, p], bui.inc_one_point ())
        }
      }
    }

    for (let [id, cell] of com.in_dim (2)) {
      for (let p of cell.dom.points ()) {
        if (cell.dic.get (p) .id.eq (vertex)) {
          let verf = new vertex_figure_t (cell.dom, p)
          let [[e1, p1], [e2, p2]] = verf.idx_dic.key_array ()
          let im1 = cell.dic.get (e1)
          let im2 = cell.dic.get (e2)
          let start = idx_dic.get ([
            im1.id,
            im1.cell.dic.get (p1) .id,
          ])
          let end = idx_dic.get ([
            im2.id,
            im2.cell.dic.get (p2) .id,
          ])
          idx_dic.set ([id, p], bui.attach_edge (start, end))
        }
      }
    }

    for (let [id, cell] of com.in_dim (3)) {
      for (let p of cell.dom.points ()) {
        if (cell.dic.get (p) .id.eq (vertex)) {
          // TODO
        }
      }
    }

    super (bui)
    this.com = com
    this.vertex = vertex
    this.idx_dic = idx_dic
  }

  /**
   * use `cell` in `this.com`, and `point` in `cell.dom`,
   * to index a point or cell in vertex_figure
   */
  idx (c: id_t, p: id_t): id_t {
    return this.idx_dic.get ([c, p])
  }
}

export
class spherical_evidence_t {
  constructor (
    readonly dim: number,
    readonly iso: isomorphism_t,
  ) {}
}

function spherical_check (
  com: cell_complex_t
): spherical_evidence_t | null {
  if (com.eq (empty_complex)) {
    return new spherical_evidence_t (com.dim, empty_isomorphism)
  } else if (com.dim === 0) {
    let iso = isomorphic_to_endpoints (com)
    if (iso === null) {
      return null
    } else {
      return new spherical_evidence_t (com.dim, iso)
    }
  } else if (com.dim === 1) {
    let iso = isomorphic_to_polygon (com)
    if (iso === null) {
      return null
    } else {
      return new spherical_evidence_t (com.dim, iso)
    }
  } else {
    console.log ("[warning] can not check dim 2 yet")
    return null
  }
}

export
class spherical_t extends cell_complex_t {
  readonly spherical_evidence : spherical_evidence_t

  constructor (com: cell_complex_t) {
    super (com.as_builder ())
    let spherical_evidence = spherical_check (this)
    if (spherical_evidence === null) {
      throw new Error ("spherical_check fail")
    } else {
      this.spherical_evidence = spherical_evidence
    }
  }
}

//// -1 dimension

export
class empty_complex_t extends cell_complex_t {
  constructor () {
    super ()
  }
}

const empty_complex = new empty_complex_t ()

export
class empty_morphism_t extends morphism_t {
  constructor () {
    super (
      empty_complex,
      empty_complex,
      new im_dic_t (),
    )
  }
}

export
const empty_morphism = new empty_morphism_t ()

export
const empty_isomorphism = new isomorphism_t (
  empty_morphism.dom,
  empty_morphism.cod,
  empty_morphism.dic)

export
class empty_cell_t extends cell_t {
  constructor () {
    super (
      empty_complex,
      empty_complex,
      new im_dic_t (),
    )
  }
}

export
const empty_cell = new empty_cell_t ()

//// 0 dimension

export
class discrete_complex_t extends cell_complex_t {
  readonly size: number

  constructor (size: number) {
    let bui = new cell_complex_builder_t ()
    bui.inc_points (size)
    super (bui)
    this.size = size
  }

  idx (i: number): id_t {
    return new id_t (0, i)
  }
}

export
class singleton_t extends discrete_complex_t {
  constructor () {
    super (1)
    this
      .define_point ("point", this.idx (0))
  }
}

export
class endpoints_t extends discrete_complex_t {
  constructor () {
    super (2)
    this
      .define_point ("start", this.idx (0))
      .define_point ("end", this.idx (1))
  }
}

//// 1 dimension

/**
 * Although cell-complex is recursively defined,
 * but each dimension has its own special features.
 * For example, the only ssible 1-cell is [[edge_t]].
 */
export
class edge_t extends cell_t {
  start: id_t
  end: id_t
  endpoints: endpoints_t

  constructor (
    bui: cell_complex_builder_t,
    start: id_t,
    end: id_t,
  ) {
    let endpoints = new endpoints_t ()
    let cod = bui.skeleton (0)
    let dic = new morphism_builder_t (
      endpoints, cod
    ) .point (endpoints.id ("start"), start)
      .point (endpoints.id ("end"), end)
      .build_im_dic ()
    super (endpoints, cod, dic)
    this.start = start
    this.end = end
    this.endpoints = endpoints
  }
}

export
class interval_t extends cell_complex_t {
  constructor () {
    let endpoints = new endpoints_t ()
    let bui = endpoints.as_builder ()
    let start = endpoints.id ("start")
    let end = endpoints.id ("end")
    let inter = bui.attach_edge (start, end)
    super (bui)
    this
      .define_point ("start", start)
      .define_point ("end", end)
      .define_edge ("inter", inter)
  }
}

export
class polygon_t extends cell_complex_t {
  readonly size: number
  readonly vertex_id_array: Array <id_t>
  readonly side_id_array: Array <id_t>

  constructor (size: number) {
    let bui = new cell_complex_builder_t ()
    let side_id_array = []
    let vertex_id_array = bui.inc_points (size)
    let i = 0
    while (i < size - 1) {
      side_id_array.push (
        bui.attach_edge (
          vertex_id_array [i],
          vertex_id_array [i + 1]))
      i += 1
    }
    side_id_array.push (
      bui.attach_edge (
        vertex_id_array [size - 1],
        vertex_id_array [0]))
    super (bui)
    this.size = size
    this.vertex_id_array = vertex_id_array
    this.side_id_array = side_id_array
  }
}

//// 2 dimension

export
class rev_id_t {
  constructor (
    readonly id: id_t,
  ) {}

  eq (that: rev_id_t): boolean {
    return this.id.eq (that.id)
  }

  rev (): id_t {
    return this.id
  }
}

type circuit_t = Array <id_t | rev_id_t>

function polygon_zip_circuit (
  polygon: polygon_t,
  cod: cell_complex_t,
  circuit: circuit_t,
): im_dic_t {
  let size = polygon.size
  let bui = new morphism_builder_t (polygon, cod)
  for (let i = 0; i < size; i += 1) {
    let src_id = polygon.side_id_array [i]
    let tar_id = circuit [i]
    let src = polygon.get_edge (src_id)
    if (tar_id instanceof rev_id_t) {
      tar_id = tar_id.rev ()
      let tar = cod.get_edge (tar_id)
      bui.point (src.start, tar.end)
      bui.point (src.end, tar.start)
      bui.edge_rev (src_id, tar_id)
    } else {
      let tar = cod.get_edge (tar_id)
      bui.point (src.start, tar.start)
      bui.point (src.end, tar.end)
      bui.edge (src_id, tar_id)
    }
  }
  return bui.build_im_dic ()
}

export
class face_t extends cell_t {
  circuit: circuit_t
  polygon: polygon_t

  constructor (
    bui: cell_complex_builder_t,
    circuit: circuit_t,
  ) {
    let size = circuit.length
    let polygon = new polygon_t (size)
    let cod = bui.skeleton (1)
    let dic = polygon_zip_circuit (polygon, cod, circuit)
    super (polygon, cod, dic)
    this.circuit = circuit
    this.polygon = polygon
  }
}

//// 3 dimension

// TODO
