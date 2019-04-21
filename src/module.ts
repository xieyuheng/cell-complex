import { set_t, eqv, not_eqv } from "./set"
import { abelian_group_t } from "./group"
import { ring_t } from "./ring"

export
class module_t <R, V> {
  readonly ring: ring_t <R>
  readonly vector: abelian_group_t <V>
  readonly scale: (a: R, x: V) => V

  constructor (the: {
    ring: ring_t <R>,
    vector: abelian_group_t <V>,
    scale: (a: R, x: V) => V,
  }) {
    this.ring = the.ring
    this.vector = the.vector
    this.scale = the.scale
  }

  add = this.vector.add
  eq = this.vector.elements.eq
  id = this.vector.id
  neg = this.vector.neg

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
