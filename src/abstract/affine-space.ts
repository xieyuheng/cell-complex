import { set_t, eqv } from "./set"
import { abelian_group_t } from "./group"
import { field_t } from "./ring"
import { vector_space_t } from "./module"

export
class affine_space_t <F, V, P> {
  points: set_t <P>
  vectors: vector_space_t <F, V>
  trans: (p: P, v: V) => P
  diff: (p: P, q: P) => V

  constructor (the: {
    points: set_t <P>,
    vectors: vector_space_t <F, V>,
    trans: (p: P, v: V) => P,
    diff: (p: P, q: P) => V,
  }) {
    this.points = the.points
    this.vectors = the.vectors
    this.trans = the.trans
    this.diff = the.diff
  }

  eq = this.vectors.eq
  id = this.vectors.id
  add = this.vectors.add
  neg = this.vectors.neg
  scale = this.vectors.scale

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
      this.vectors,
      this.add (this.diff (c, b), this.diff (b, a)),
      this.diff (c, a))
  }
}
