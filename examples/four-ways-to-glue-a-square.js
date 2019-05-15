let cx = require ("cicada-lang/lib/cell-complex")
let hl = require ("cicada-lang/lib/homology")
let ut = require ("cicada-lang/lib/util")

class sphere_t extends cx.cell_complex_t {
  constructor () {
    let builder = new cx.cell_complex_builder_t ()
    let [south, middle, north] = builder.attach_vertexes (3)
    let south_long = builder.attach_edge (south, middle)
    let north_long = builder.attach_edge (middle, north)
    let surf = builder.attach_face ([
      south_long,
      north_long,
      north_long.rev (),
      south_long.rev (),
    ])
    super (builder)
  }
}

class torus_t extends cx.cell_complex_t {
  constructor () {
    let builder = new cx.cell_complex_builder_t ()
    let origin = builder.attach_vertex ()
    let toro = builder.attach_edge (origin, origin)
    let polo = builder.attach_edge (origin, origin)
    let surf = builder.attach_face ([
      toro,
      polo,
      toro.rev (),
      polo.rev (),
    ])
    super (builder)
  }
}

class klein_bottle_t extends cx.cell_complex_t {
  constructor () {
    let builder = new cx.cell_complex_builder_t ()
    let origin = builder.attach_vertex ()
    let toro = builder.attach_edge (origin, origin)
    let cross = builder.attach_edge (origin, origin)
    let surf = builder.attach_face ([
      toro,
      cross,
      toro.rev (),
      cross,
    ])
    super (builder)
  }
}

class projective_plane_t extends cx.cell_complex_t {
  constructor () {
    let builder = new cx.cell_complex_builder_t ()
    let [start, end] = builder.attach_vertexes (2)
    let left_rim = builder.attach_edge (start, end)
    let right_rim = builder.attach_edge (end, start)
    let surf = builder.attach_face ([
      left_rim, right_rim,
      left_rim, right_rim,
    ])
    super (builder)
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
