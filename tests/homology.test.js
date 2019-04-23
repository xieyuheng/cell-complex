import test from "ava"

import * as ut from "../lib/util"
import * as cx from "../lib/cell-complex"
import * as hl from "../lib/homology"
import{ torus_t } from "../lib/torus"

test ("new hl.chain_t", t => {
  let torus = new torus_t ()
  let chain = hl.chain_t.zeros (1, torus)

  t.pass ()
})

test ("hl.chain_t.boundary_of_basis", t => {
  let torus = new torus_t ()
  let square = new cx.polygon_t (4)

  hl.chain_t.boundary_of_basis (torus, torus.id ("toro")) .series
  hl.chain_t.boundary_of_basis (square, new cx.id_t (1, 0)) .series

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

  chain0.add (chain1)
  // .print ()

  t.pass ()
})
