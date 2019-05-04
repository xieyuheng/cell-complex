let cx = require ("cicada-lang/lib/cell-complex")
let hl = require ("cicada-lang/lib/homology")
let ut = require ("cicada-lang/lib/util")

class sphere_t extends cx.cell_complex_t {
  constructor () {
    let bui = new cx.cell_complex_builder_t ()
    let [south, middle, north] = bui.attach_points (3)
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
    let origin = bui.attach_point ()
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
    let origin = bui.attach_point ()
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
    let [start, end] = bui.attach_points (2)
    let left_rim = bui.attach_edge (start, end)
    let right_rim = bui.attach_edge (end, start)
    let surf = bui.attach_face ([
      left_rim, right_rim,
      left_rim, right_rim,
    ])
    super (bui)
  }
}

let report = {
  "sphere": hl.report (new sphere_t ()),
  "torus": hl.report (new torus_t ()),
  "klein_bottle": hl.report (new klein_bottle_t ()),
  "projective_plane": hl.report (new projective_plane_t ()),
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
