import test from "ava"

import * as ut from "../lib/util"
import * as cx from "../lib/cell-complex"
import * as eu from "../lib/euclid"
import * as hl from "../lib/homology"

import {
  sphere_t,
  torus_t,
  klein_bottle_t,
  projective_plane_t,
} from "../lib/complexes/four-ways-to-glue-a-square"

test ("hl.chain_t.zeros", t => {
  let torus = new torus_t ()
  let chain = hl.chain_t.zeros (1, torus)

  t.pass ()
})

test ("hl.chain_t.boundary_of_basis", t => {
  let torus = new torus_t ()
  let square = new cx.polygon_t (4)

  t.true (
    hl.chain_t.boundary_of_basis (torus, torus.id ("toro"))
      .cycle_p ()
  )

  t.true (
    hl.chain_t.boundary_of_basis (square, new cx.id_t (1, 0))
      .cycle_p ()
  )

  t.pass ()
})

test ("hl.chain_t.boundary_matrix", t => {
  let torus = new torus_t ()
  let square = new cx.polygon_t (4)

  hl.chain_t.boundary_matrix (torus, 1)
  // .print ()
  hl.chain_t.boundary_matrix (square, 1)
  // .print ()

  t.pass ()
})

test ("hl.chain_t.add", t => {
  let square = new cx.polygon_t (4)

  let chain0 =
    hl.chain_t.boundary_of_basis (
      square, new cx.id_t (1, 0)
    )

  let chain1 =
    hl.chain_t.boundary_of_basis (
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

  let chain = new hl.chain_t (square, 1, eu.vector ([0, 1, 0, 0]))

  t.true (
    chain.boundary () .cycle_p ()
  )

  t.pass ()
})

class example_graph_t extends cx.cell_complex_t {
  constructor () {
    let bui = new cx.cell_complex_builder_t ()
    let [x, y, z] = bui.inc_points (3)
    let a = bui.attach_edge (x, y)
    let b = bui.attach_edge (y, z)
    let c = bui.attach_edge (z, x)
    let d = bui.attach_edge (z, x)
    let f = bui.attach_face ([ c, d.rev () ])
    let g = bui.attach_face ([ a, b, c ])

    super (bui)
    this
      .define_point ("x", x)
      .define_point ("y", y)
      .define_point ("z", z)
      .define_edge ("a", a)
      .define_edge ("b", b)
      .define_edge ("c", c)
      .define_edge ("d", d)
      .define_face ("f", f)
      .define_face ("g", g)
  }
}

test ("example_graph_t", t => {
  let com = new example_graph_t ()
  let b0 = hl.chain_t.boundary_matrix (com, 0)
  let b1 = hl.chain_t.boundary_matrix (com, 1)
  let b2 = hl.chain_t.boundary_matrix (com, 2)

  // {
  //   b2.print ()
  //   b2.int_image () .print ()
  //   b1.int_kernel () .print ()
  // }

  t.pass ()
})

test ("four-ways-to-glue-a-square", t => {
  {
    let com = new sphere_t ()
    let b0 = hl.chain_t.boundary_matrix (com, 0)
    let b1 = hl.chain_t.boundary_matrix (com, 1)
    let b2 = hl.chain_t.boundary_matrix (com, 2)

    // b1.print ()
    // b1.int_kernel () .print ()
    // b2.int_image () .print ()
  }

  {
    let com = new torus_t ()
    let b0 = hl.chain_t.boundary_matrix (com, 0)
    let b1 = hl.chain_t.boundary_matrix (com, 1)
    let b2 = hl.chain_t.boundary_matrix (com, 2)

    // b1.print ()
    // b1.int_kernel () .print ()
    // b2.int_image () .print ()
  }

  {
    let com = new klein_bottle_t ()
    let b0 = hl.chain_t.boundary_matrix (com, 0)
    let b1 = hl.chain_t.boundary_matrix (com, 1)
    let b2 = hl.chain_t.boundary_matrix (com, 2)

    // b1.print ()
    // b1.int_kernel () .print ()
    // b2.int_image () .print ()
  }

  {
    let com = new projective_plane_t ()
    let b0 = hl.chain_t.boundary_matrix (com, 0)
    let b1 = hl.chain_t.boundary_matrix (com, 1)
    let b2 = hl.chain_t.boundary_matrix (com, 2)

    // b1.print ()
    // b1.int_kernel () .print ()
    // b2.int_image () .print ()
  }

  t.pass ()
})
