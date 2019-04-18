import { set_t, eqv } from "./set"
import { field_t } from "./field"
import { abelian_group_t } from "./group"
import { vector_space_t } from "./vector-space"
import { affine_space_t } from "./affine-space"
import { number_field_t } from "./number"

/**
 * I do not define abstract inner product space yet.
 * because the axioms involves conjugation of complex structure,
 * which I do not yet fully understand.

 * There is only one Euclidean space of each dimension,
 * and since dimension is handled at runtime,
 * I define euclidean_space_t as concrete class.
 */

export
class vec_t extends vector_space_t <number, vector_t> {
  dim: number

  constructor (dim: number) {
    super (new number_field_t ())
    this.dim = dim
  }

  eq (x: vector_t, y: vector_t): boolean {
    return x.eq (y)
  }

  id = new vector_t (nd.array_t.zeros ([this.dim]))

  add (v: vector_t, w: vector_t): vector_t {
    return v.add (w)
  }

  neg (x: vector_t): vector_t {
    return x.map (n => -n)
  }

  scale (a: number, x: vector_t): vector_t {
    return x.scale (a)
  }
}

export
class point_set_t extends set_t <point_t> {
  dim: number

  constructor (dim: number) {
    super ()
    this.dim = dim
  }

  eq (x: point_t, y: point_t): boolean {
    return x.eq (y)
  }
}

export
class euclidean_space_t
extends affine_space_t <number, vector_t, point_t> {
  dim: number

  constructor (dim: number) {
    let vec = new vec_t (dim)
    let points = new point_set_t (dim)
    super (vec, points)
    this.dim = dim
  }

  trans (p: point_t, v: vector_t): point_t {
    return p.trans (v)
  }

  diff (p: point_t, q: point_t): vector_t {
    return p.diff (q)
  }
}
