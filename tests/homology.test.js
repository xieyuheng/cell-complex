import test from "ava"

import * as ut from "../lib/util"
import * as int from "../lib/int"
import * as cx from "../lib/cell-complex"
import * as hl from "../lib/homology"

import {
  sphere_t,
  torus_t,
  klein_bottle_t,
  projective_plane_t,
} from "../lib/complexes/four-ways-to-glue-a-square"

test ("four-ways-to-glue-a-square", t => {
  let report = {
    "sphere": hl.report (new sphere_t ()),
    "torus": hl.report (new torus_t ()),
    "klein_bottle": hl.report (new klein_bottle_t ()),
    "projective_plane": hl.report (new projective_plane_t ()),
  }

  let expected_report = {
    sphere:
    { '0': { betti_number: 1, torsion_coefficients: [] },
      '1': { betti_number: 0, torsion_coefficients: [] },
      '2': { betti_number: 1, torsion_coefficients: [] },
      euler_characteristic: 2 },
    torus:
    { '0': { betti_number: 1, torsion_coefficients: [] },
      '1': { betti_number: 2, torsion_coefficients: [] },
      '2': { betti_number: 1, torsion_coefficients: [] },
      euler_characteristic: 0 },
    klein_bottle:
    { '0': { betti_number: 1, torsion_coefficients: [] },
      '1': { betti_number: 1, torsion_coefficients: [ 2 ] },
      '2': { betti_number: 0, torsion_coefficients: [] },
      euler_characteristic: 0 },
    projective_plane:
    { '0': { betti_number: 1, torsion_coefficients: [] },
      '1': { betti_number: 0, torsion_coefficients: [ 2 ] },
      '2': { betti_number: 0, torsion_coefficients: [] },
      euler_characteristic: 1 }
  }

  t.deepEqual (report, expected_report)

  t.pass ()
})
