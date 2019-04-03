import { set_t } from "./set"
import { field_t } from "./field"
import { abelian_group_t } from "./group"
import { eqv } from "./eqv"

export
abstract class vector_space_t <F, V> extends abelian_group_t <V> {
  field: field_t <F>

  constructor (field: field_t <F>) {
    super ()
    this.field = field
  }

  abstract scale (a: F, x: V): V

  field_id_action (x: V) {
    eqv (
      this,
      this.scale (this.field.mul_id, x),
      x,
    )
  }

  field_action (a: F, b: F, x: V) {
    eqv (
      this,
      this.scale (a, this.scale (b, x)),
      this.scale (this.field.mul (a, b), x),
    )
  }

  scale_vector_add_distr (a: F, x: V, y: V) {
    eqv (
      this,
      this.scale (a, this.add (x, y)),
      this.add (
        this.scale (a, x),
        this.scale (a, y),
      ),
    )
  }

  scale_field_add_distr (a: F, b: F, x: V) {
    eqv (
      this,
      this.scale (this.field.add (a, b), x),
      this.add (
        this.scale (a, x),
        this.scale (b, x),
      ),
    )
  }
}
