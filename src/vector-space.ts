import { set_t, eqv } from "./set"
import { field_t } from "./field"
import { abelian_group_t } from "./group"

export
class vector_space_t <F, V> {
  readonly field: field_t <F>
  readonly vector: abelian_group_t <V>
  readonly scale: (a: F, x: V) => V

  constructor (the: {
    field: field_t <F>,
    vector: abelian_group_t <V>,
    scale: (a: F, x: V) => V,
  }) {
    this.field = the.field
    this.vector = the.vector
    this.scale = the.scale
  }

  add = this.vector.add
  eq = this.vector.elements.eq
  id = this.vector.id
  neg = this.vector.neg  

  field_id_action (x: V) {
    eqv (
      this.vector.elements,
      this.scale (this.field.mul_id, x),
      x,
    )
  }

  field_action (a: F, b: F, x: V) {
    eqv (
      this.vector.elements,
      this.scale (a, this.scale (b, x)),
      this.scale (this.field.mul (a, b), x),
    )
  }

  scale_vector_add_distr (a: F, x: V, y: V) {
    eqv (
      this.vector.elements,
      this.scale (a, this.add (x, y)),
      this.add (
        this.scale (a, x),
        this.scale (a, y),
      ),
    )
  }

  scale_field_add_distr (a: F, b: F, x: V) {
    eqv (
      this.vector.elements,
      this.scale (this.field.add (a, b), x),
      this.add (
        this.scale (a, x),
        this.scale (b, x),
      ),
    )
  }
}
