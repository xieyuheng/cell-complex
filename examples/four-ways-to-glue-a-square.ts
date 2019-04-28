import * as cx from "cicada-lang/lib/cell-complex"
import * as hl from "cicada-lang/lib/homology"
import * as ut from "cicada-lang/lib/util"

class sphere_t extends cx.cell_complex_t {
  constructor () {
    let bui = new cx.cell_complex_builder_t ()
    let [south, middle, north] = bui.inc_points (3)
    let south_long = bui.attach_edge (south, middle)
    let north_long = bui.attach_edge (middle, north)
    let surf = bui.attach_face ([
      south_long,
      north_long,
      north_long.rev (),
      south_long.rev (),
    ])
    super (bui)
  }
}

class torus_t extends cx.cell_complex_t {
  constructor () {
    let bui = new cx.cell_complex_builder_t ()
    let origin = bui.inc_one_point ()
    let toro = bui.attach_edge (origin, origin)
    let polo = bui.attach_edge (origin, origin)
    let surf = bui.attach_face ([
      toro,
      polo,
      toro.rev (),
      polo.rev (),
    ])
    super (bui)
  }
}

class klein_bottle_t extends cx.cell_complex_t {
  constructor () {
    let bui = new cx.cell_complex_builder_t ()
    let origin = bui.inc_one_point ()
    let toro = bui.attach_edge (origin, origin)
    let cross = bui.attach_edge (origin, origin)
    let surf = bui.attach_face ([
      toro,
      cross,
      toro.rev (),
      cross,
    ])
    super (bui)
  }
}

class projective_plane_t extends cx.cell_complex_t {
  constructor () {
    let bui = new cx.cell_complex_builder_t ()
    let [start, end] = bui.inc_points (2)
    let left_rim = bui.attach_edge (start, end)
    let right_rim = bui.attach_edge (end, start)
    let surf = bui.attach_face ([
      left_rim, right_rim,
      left_rim, right_rim,
    ])
    super (bui)
  }
}

let report: any = {
  "sphere": hl.homology_group_report (new sphere_t ()),
  "torus": hl.homology_group_report (new torus_t ()),
  "klein_bottle": hl.homology_group_report (new klein_bottle_t ()),
  "projective_plane": hl.homology_group_report (new projective_plane_t ()),
}

ut.log (report)

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
