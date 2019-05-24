let cx = require ("../lib/cell-complex")
let hl = require ("../lib/homology")
let ut = require ("../lib/util")

class sphere_t extends cx.cell_complex_t {
  constructor () {
    super ({ dim: 2 })
    this.attach_vertexes (["south", "middle", "north"])
    this.attach_edge ("south_long", ["south", "middle"])
    this.attach_edge ("north_long", ["middle", "north"])
    this.attach_face ("surf", [
      "south_long",
      "north_long",
      ["north_long", "rev"],
      ["south_long", "rev"],
    ])
  }
}

class torus_t extends cx.cell_complex_t {
  constructor () {
    super ({ dim: 2 })
    this.attach_vertex ("origin")
    this.attach_edge ("toro", ["origin", "origin"])
    this.attach_edge ("polo", ["origin", "origin"])
    this.attach_face ("surf", [
      "toro",
      "polo",
      ["toro", "rev"],
      ["polo", "rev"],
    ])
  }
}

class klein_bottle_t extends cx.cell_complex_t {
  constructor () {
    super ({ dim: 2 })
    this.attach_vertex ("origin")
    this.attach_edge ("toro", ["origin", "origin"])
    this.attach_edge ("cross", ["origin", "origin"])
    this.attach_face ("surf", [
      "toro",
      "cross",
      ["toro", "rev"],
      "cross",
    ])
  }
}

class projective_plane_t extends cx.cell_complex_t {
  constructor () {
    super ({ dim: 2 })
    this.attach_vertexes (["start", "end"])
    this.attach_edge ("left_rim", ["start", "end"])
    this.attach_edge ("right_rim", ["end", "start"])
    this.attach_face ("surf", [
      "left_rim", "right_rim",
      "left_rim", "right_rim",
    ])
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
