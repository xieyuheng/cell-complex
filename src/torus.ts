import { dic_t } from "./dic"
import * as cx from "./cell-complex"

export
class torus_t extends cx.cell_complex_t {
  readonly origin: cx.id_t
  readonly polo: cx.id_t
  readonly toro: cx.id_t
  readonly surf: cx.id_t

  constructor () {
    let bui = new cx.cell_complex_builder_t ()
    let origin = bui.inc_one_point ()
    let polo = bui.attach_edge (origin, origin)
    let toro = bui.attach_edge (origin, origin)
    let surf = bui.attach_face ([
      polo, toro, polo.rev (), toro.rev (),
    ])
    super (bui)
    this.origin = origin
    this.polo = polo
    this.toro = toro
    this.surf = surf
  }
}

// let torus = new torus_t ()
// console.dir (torus.to_exp (), { depth: null })
