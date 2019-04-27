import * as cx from "../cell-complex"

export
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
    this
      .define_point ("south", south)
      .define_point ("north", north)
      .define_edge ("south_long", south_long)
      .define_edge ("north_long", north_long)
      .define_face ("surf", surf)
  }
}

export
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
    this
      .define_point ("origin", origin)
      .define_edge ("toro", toro)
      .define_edge ("polo", polo)
      .define_face ("surf", surf)
  }
}

export
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
    this
      .define_point ("origin", origin)
      .define_edge ("toro", toro)
      .define_edge ("cross", cross)
      .define_face ("surf", surf)
  }
}

export
class projective_plane_t extends cx.cell_complex_t {
  constructor () {
    let bui = new cx.cell_complex_builder_t ()
    let origin = bui.inc_one_point ()
    let left_rim = bui.attach_edge (origin, origin)
    let right_rim = bui.attach_edge (origin, origin)
    let surf = bui.attach_face ([
      left_rim, right_rim,
      left_rim, right_rim,
    ])
    super (bui)
    this
      .define_point ("origin", origin)
      .define_edge ("left_rim", left_rim)
      .define_edge ("right_rim", right_rim)
      .define_face ("surf", surf)
  }
}
