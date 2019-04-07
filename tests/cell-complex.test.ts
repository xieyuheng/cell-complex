import test from "ava"

import * as cx from "../dist/cell-complex"
import { torus_t } from "../dist/torus"

import { log } from "./util"

test ("cell_complex_t eq", t => {
  let torus = new torus_t ()
  t.true (torus.face ("surf") .dom.eq (new cx.polygon_t (4)))
})
