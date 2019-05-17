import test from "ava"

import * as ut from "../lib/util"
import * as int from "../lib/int"
import * as cx from "../lib/cell-complex--indirect"
import * as hl from "../lib/homology--indirect"

import {
  sphere_t,
  torus_t,
  klein_bottle_t,
  projective_plane_t,
} from "../lib/complexes/four-ways-to-glue-a-square--indirect"

test ("hl.chain_t.zeros", t => {
  let torus = new torus_t ()
  let chain = hl.chain_t.zeros (1, torus)

  t.pass ()
})

test ("hl.boundary_of_basis", t => {
  let torus = new torus_t ()
  let square = new cx.polygon_t (4)

  t.true (
    hl.boundary_of_basis (torus, torus.id ("toro"))
      .cycle_p ()
  )

  t.true (
    hl.boundary_of_basis (square, new cx.id_t (1, 0))
      .cycle_p ()
  )

  t.pass ()
})

test ("hl.boundary_matrix", t => {
  let torus = new torus_t ()
  let square = new cx.polygon_t (4)

  hl.boundary_matrix (torus, 1)
  // .print ()
  hl.boundary_matrix (square, 1)
  // .print ()

  t.pass ()
})

test ("hl.chain_t.add", t => {
  let square = new cx.polygon_t (4)

  let chain0 =
    hl.boundary_of_basis (
      square, new cx.id_t (1, 0)
    )

  let chain1 =
    hl.boundary_of_basis (
      square, new cx.id_t (1, 1)
    )

  t.true (
    chain0.add (chain1) .cycle_p ()
  )

  t.pass ()
})

test ("hl.chain_t.boundary", t => {
  let torus = new torus_t ()
  let square = new cx.polygon_t (4)

  let chain = new hl.chain_t (square, 1, int.vector ([0, 1, 0, 0]))

  t.true (
    chain.boundary () .cycle_p ()
  )

  t.pass ()
})

class example_graph_t extends cx.cell_complex_t {
  constructor () {
    let builder = new cx.cell_complex_builder_t ()
    let [x, y, z] = builder.attach_vertexes (3)
    let k = builder.attach_vertex ()
    let a = builder.attach_edge (x, y)
    let b = builder.attach_edge (y, z)
    let c = builder.attach_edge (z, x)
    let d = builder.attach_edge (z, x)
    super (builder)
  }
}

test ("example_graph_t", t => {
  let report = hl.report (new example_graph_t ())

  ut.log (report)

  t.pass ()
})

class example_complex_t extends cx.cell_complex_t {
  constructor () {
    let builder = new cx.cell_complex_builder_t ()
    let [x, y, z] = builder.attach_vertexes (3)
    let a = builder.attach_edge (x, y)
    let b = builder.attach_edge (y, z)
    let c = builder.attach_edge (z, x)
    let d = builder.attach_edge (z, x)
    let front = builder.attach_face ([ c, d.rev () ])
    let back = builder.attach_face ([ d.rev (), c ])
    super (builder)
  }
}

test ("example_complex_t", t => {
  let report = hl.report (new example_complex_t ())

  ut.log (report)

  t.pass ()
})

test ("four-ways-to-glue-a-square", t => {
  let report = {
    "sphere": hl.report (new sphere_t ()),
    "torus": hl.report (new torus_t ()),
    "klein_bottle": hl.report (new klein_bottle_t ()),
    "projective_plane": hl.report (new projective_plane_t ()),
  }

  ut.log (report)

  t.pass ()
})
