import test from "ava"

import * as ut from "../lib/util"
import * as int from "../lib/int"
import * as cx from "../lib/cell-complex--direct"
import * as hl from "../lib/homology--direct"

import {
  sphere_t,
  torus_t,
  klein_bottle_t,
  projective_plane_t,
} from "../lib/complexes/four-ways-to-glue-a-square--direct"

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
