import test from "ava"

import * as cx from "../dist/cell-complex"
import { torus_t } from "../dist/torus"

function log (x) {
  console.dir (x, { depth: null })
}

test ("cell_complex_t eq", t => {
  let torus = new torus_t ()
  // log (torus.to_exp ())
  t.true (torus.get (torus.surf) .dom.eq (new cx.polygon_t (4)))
})
