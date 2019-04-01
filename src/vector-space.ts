import { set_t } from "./set"
import { field_t } from "./field"
import { eqv } from "./eqv"

export
abstract class vector_space_t <F, V> extends set_t <V> {
  field: field_t <F>

  constructor (field: field_t <F>) {
    super ()
    this.field = field
  }

  abstract add (x: V, y: V): V
  abstract scale (c: F, x: V): V
}
