import test from "ava"

import * as ut from "../lib/util"
import * as cx from "../lib/cell-complex"
import * as eu from "../lib/euclidean-space"
import * as hl from "../lib/homology"
import{ torus_t } from "../lib/torus"

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
  chain.boundary ()

  t.pass ()
})
