import * as cx from "./cell-complex"

export
class torus_t extends cx.cell_complex_t {
  constructor () {
    let bui = new cx.cell_complex_builder_t ()
    let origin = bui.inc_one_point ()
    let polo = bui.attach_edge (origin, origin)
    let toro = bui.attach_edge (origin, origin)
    let surf = bui.attach_face ([
      polo, toro, polo.rev (), toro.rev (),
    ])
    super (bui)
    this
      .define_point ("origin", origin)
      .define_edge ("polo", polo)
      .define_edge ("toro", toro)
      .define_face ("surf", surf)
  }
}
