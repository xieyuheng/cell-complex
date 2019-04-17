import test from "ava"

import * as cx from "../lib/cell-complex"
import { torus_t } from "../lib/torus"
import * as ut from "../lib/util"

test ("cell_complex_t eq", t => {
  let torus = new torus_t ()
  t.true (torus.face ("surf") .dom.eq (new cx.polygon_t (4)))
})

test ("manifold_check", t => {
  {
    let interval = new cx.interval_t ()
    let manifold_evidence = cx.manifold_check (interval)
    if (manifold_evidence === null) {
      t.pass ()
    } else {
      t.fail ()
    }
  }

  {
    let hundred_gon = new cx.polygon_t (100)
    let manifold_evidence = cx.manifold_check (hundred_gon)
    if (manifold_evidence === null) {
      t.fail ()
    } else {
      t.pass ()
    }
  }
})

test ("new chain_t", t => {
  let torus = new torus_t ()
  let chain = cx.chain_t.zeros ("torus edge", 1, torus)

  t.pass ()
})

test ("chain_t.boundary_of_basis", t => {
  let torus = new torus_t ()
  let square = new cx.polygon_t (4)

  cx.chain_t.boundary_of_basis (torus, torus.id ("toro")) .series
  cx.chain_t.boundary_of_basis (square, new cx.id_t (1, 0)) .series

  t.pass ()
})

test ("chain_t.boundary_frame", t => {
  let torus = new torus_t ()
  let square = new cx.polygon_t (4)

  cx.chain_t.boundary_frame (torus, 1)
  cx.chain_t.boundary_frame (square, 1)

  t.pass ()
})

test ("chain_t.add", t => {
  let square = new cx.polygon_t (4)

  let chain0 =
    cx.chain_t.boundary_of_basis (
      square, new cx.id_t (1, 0)
    )

  let chain1 =
    cx.chain_t.boundary_of_basis (
      square, new cx.id_t (1, 1)
    )

  chain0.add (chain1)
    // .series.print ()

  t.pass ()
})
