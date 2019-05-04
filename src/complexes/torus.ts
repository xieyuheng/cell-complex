import * as cx from "../cell-complex"

export
class torus_t extends cx.cell_complex_t {
  constructor () {
    let builder = new cx.cell_complex_builder_t ()
    let origin = builder.attach_point ()
    let polo = builder.attach_edge (origin, origin)
    let toro = builder.attach_edge (origin, origin)
    let surf = builder.attach_face ([
      // toro, polo, toro.rev (), polo.rev (),
      polo, toro, polo.rev (), toro.rev (),
    ])
    super (builder)
    this
      .define_point ("origin", origin)
      .define_edge ("toro", toro)
      .define_edge ("polo", polo)
      .define_face ("surf", surf)
  }
}
