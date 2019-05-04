import * as cx from "../cell-complex"

export
class sphere_t extends cx.cell_complex_t {
  constructor () {
    let builder = new cx.cell_complex_builder_t ()
    let [south, middle, north] = builder.attach_points (3)
    let south_long = builder.attach_edge (south, middle)
    let north_long = builder.attach_edge (middle, north)
    let surf = builder.attach_face ([
      south_long,
      north_long,
      north_long.rev (),
      south_long.rev (),
    ])
    super (builder)
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
    let builder = new cx.cell_complex_builder_t ()
    let origin = builder.attach_point ()
    let toro = builder.attach_edge (origin, origin)
    let polo = builder.attach_edge (origin, origin)
    let surf = builder.attach_face ([
      toro,
      polo,
      toro.rev (),
      polo.rev (),
    ])
    super (builder)
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
    let builder = new cx.cell_complex_builder_t ()
    let origin = builder.attach_point ()
    let toro = builder.attach_edge (origin, origin)
    let cross = builder.attach_edge (origin, origin)
    let surf = builder.attach_face ([
      toro,
      cross,
      toro.rev (),
      cross,
    ])
    super (builder)
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
    let builder = new cx.cell_complex_builder_t ()
    let [start, end] = builder.attach_points (2)
    let left_rim = builder.attach_edge (start, end)
    let right_rim = builder.attach_edge (end, start)
    let surf = builder.attach_face ([
      left_rim, right_rim,
      left_rim, right_rim,
    ])
    super (builder)
    this
      .define_point ("start", start)
      .define_point ("end", end)
      .define_edge ("left_rim", left_rim)
      .define_edge ("right_rim", right_rim)
      .define_face ("surf", surf)
  }
}
