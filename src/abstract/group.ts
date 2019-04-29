import { set_t, eqv } from "./set"

export
class monoid_t <G> {
  elements: set_t <G>
  id: G
  mul: (x: G, y: G) => G

  constructor (the: {
    elements: set_t <G>,
    id: G,
    mul: (x: G, y: G) => G,
  }) {
    this.elements = the.elements
    this.id = the.id
    this.mul = the.mul
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
}

export
class group_t <G> extends monoid_t <G> {
  inv: (x: G) => G

  constructor (the: {
    elements: set_t <G>,
    id: G,
    mul: (x: G, y: G) => G,
    inv: (x: G) => G,
  }) {
    super (the)
    this.inv = the.inv
  }

  div (x: G, y: G): G {
    return this.mul (x, this.inv (y))
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
class abelian_group_t <G> extends group_t <G> {
  add: (x: G, y: G) => G
  neg: (x: G) => G

  constructor (the: {
    elements: set_t <G>,
    id: G,
    add: (x: G, y: G) => G,
    neg: (x: G) => G,
  }) {
    super ({
      ...the,
      mul: the.add,
      inv: the.neg,
    })
    this.add = the.add
    this.neg = the.neg
  }

  sub (x: G, y: G): G { return this.div (x, y) }

  commu (x: G, y: G) {
    eqv (
      this.elements,
      this.add (x, y),
      this.add (y, x),
    )
  }
}
