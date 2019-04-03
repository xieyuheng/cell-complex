import { set_t } from "./set"
import { field_t } from "./field"
import { abelian_group_t } from "./group"
import { vector_space_t } from "./vector-space"
import { eqv } from "./eqv"

export
abstract class affine_space_t <F, V, P> extends vector_space_t <F, V> {
  points: set_t <P>
  vec: vector_space_t <F, V>

  constructor (vec: vector_space_t <F, V>, points: set_t <P>) {
    super (vec.field)
    this.points = points
    this.vec = vec
  }

  eq = this.vec.eq
  id = this.vec.id
  add = this.vec.add
  neg = this.vec.neg
  scale = this.vec.scale

  abstract trans (p: P, v: V): P
  abstract diff (p: P, q: P): V

  vector_id_action (p: P) {
    eqv (
      this.points,
      this.trans (p, this.id),
      p)
  }

  vector_action (p: P, v: V, w: V) {
    eqv (
      this.points,
      this.trans (this.trans (p, v), w),
      this.trans (p, this.add (v, w)))
  }

  weyl_s_axiom (a: P, b: P, c: P) {
    eqv (
      this,
      this.add (this.diff (c, b), this.diff (b, a)),
      this.diff (c, a))
  }
}
