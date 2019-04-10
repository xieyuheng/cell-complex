import test from "ava"

import * as cx from "../src/cell-complex"
import { torus_t } from "../src/torus"
import { log } from "../src/util"

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

test ("boundary_dic_of_basis", t => {
  let torus = new torus_t ()
  let square = new cx.polygon_t (4)

  log (
    cx.boundary_dic_of_basis (torus, torus.id ("toro"))
  )

  log (
    cx.boundary_dic_of_basis (square, new cx.id_t (1, 0))
  )

  t.pass ()
})
