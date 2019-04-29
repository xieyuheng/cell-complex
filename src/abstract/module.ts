import { set_t, eqv, not_eqv } from "./set"
import { abelian_group_t } from "./group"
import { field_t, ring_t } from "./ring"

export
class module_t <R, V> {
  ring: ring_t <R>
  vector: abelian_group_t <V>
  scale: (a: R, x: V) => V

  constructor (the: {
    ring: ring_t <R>,
    vector: abelian_group_t <V>,
    scale: (a: R, x: V) => V,
  }) {
    this.ring = the.ring
    this.vector = the.vector
    this.scale = the.scale
  }

  add (x: V, y: V): V { return this.vector.add (x, y) }
  eq (x: V, y: V): boolean { return this.vector.elements.eq (x, y) }
  get id (): V { return this.vector.id }
  neg (x: V): V { return this.vector.neg (x) }

  ring_id_action (x: V) {
    eqv (
      this.vector.elements,
      this.scale (this.ring.one, x),
      x,
    )
  }

  ring_action (a: R, b: R, x: V) {
    eqv (
      this.vector.elements,
      this.scale (a, this.scale (b, x)),
      this.scale (this.ring.mul (a, b), x),
    )
  }

  vector_add_distr (a: R, x: V, y: V) {
    eqv (
      this.vector.elements,
      this.scale (a, this.add (x, y)),
      this.add (
        this.scale (a, x),
        this.scale (a, y),
      ),
    )
  }

  ring_add_distr (a: R, b: R, x: V) {
    eqv (
      this.vector.elements,
      this.scale (this.ring.add (a, b), x),
      this.add (
        this.scale (a, x),
        this.scale (b, x),
      ),
    )
  }
}

export
class vector_space_t <R, V> extends module_t <R, V> {
  field: field_t <R>

  constructor (the: {
    field: field_t <R>,
    vector: abelian_group_t <V>,
    scale: (a: R, x: V) => V,
  }) {
    super ({
      ...the,
      ring: the.field,
    })
    this.field = the.field
  }
}
