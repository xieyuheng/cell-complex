import test from "ava"

import * as cx from "../src/cell-complex"
import { torus_t } from "../src/torus"

import { log } from "./util"

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
