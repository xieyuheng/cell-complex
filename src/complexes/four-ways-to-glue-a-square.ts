import * as ut from "../util"
import * as cx from "../cell-complex"

export
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

export
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

export
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

export
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
