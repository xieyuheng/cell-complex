import * as cx from "../cell-complex"

export
class torus_t extends cx.cell_complex_t {
  constructor () {
    let bui = new cx.cell_complex_builder_t ()
    let origin = bui.inc_one_point ()
    let toro = bui.attach_edge (origin, origin)
    let polo = bui.attach_edge (origin, origin)
    let surf = bui.attach_face ([
      toro, polo, toro.rev (), polo.rev (),
    ])
    super (bui)
    this
      .define_point ("origin", origin)
      .define_edge ("toro", toro)
      .define_edge ("polo", polo)
      .define_face ("surf", surf)
  }
}
