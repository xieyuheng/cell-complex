import { set_t, eqv } from "./set"

export
class group_t <G> {
  readonly elements: set_t <G>
  readonly id: G
  readonly mul: (x: G, y: G) => G
  readonly inv: (x: G) => G

  constructor (the: {
    elements: set_t <G>,
    id: G,
    mul: (x: G, y: G) => G,
    inv: (x: G) => G,
  }) {
    this.elements = the.elements
    this.id = the.id
    this.mul = the.mul
    this.inv = the.inv
  }

  div (x: G, y: G): G {
    return this.mul (x, this.inv (y))
  }

  assoc (x: G, y: G, z: G) {
    eqv (
      this.elements,
      this.mul (this.mul (x, y), z),
      this.mul (x, this.mul (y, z)),
    )
  }

  id_left (x: G) {
    eqv (
      this.elements,
      this.mul (this.id, x),
      x,
    )
  }

  id_right (x: G) {
    eqv (
      this.elements,
      this.mul (x, this.id),
      x,
    )
  }

  id_inv (x: G) {
    eqv (
      this.elements,
      this.mul (x, this.inv (x)),
      this.id,
    )
  }
}

export
class abelian_group_t <G> {
  readonly elements: set_t <G>
  readonly group: group_t <G>

  constructor (the: {
    group: group_t <G>,
  }) {
    this.group = the.group
    this.elements = the.group.elements
  }

  commu (x: G, y: G) {
    eqv (
      this.elements,
      this.group.mul (x, y),
      this.group.mul (y, x),
    )
  }

  id = this.group.id
  mul = this.group.mul
  inv = this.group.inv
  div = this.group.div

  add = this.group.mul
  sub = this.group.div
  neg = this.group.inv
  id_neg = this.group.id_inv
}
