import assert from "assert"

import { set_t, eqv, not_eqv } from "./set"
import { abelian_group_t, monoid_t } from "./group"

export
class ring_t <R> {
  elements: set_t <R>
  addition: abelian_group_t <R>
  multiplication: monoid_t <R>

  constructor (the: {
    addition: abelian_group_t <R>,
    multiplication: monoid_t <R>,
  }) {
    this.addition = the.addition
    this.multiplication = the.multiplication
    this.elements = the.addition.elements
  }

  get zero (): R { return this.addition.id }
  add (x: R, y: R): R { return this.addition.add (x, y) }
  neg (x: R): R { return this.addition.neg (x) }
  sub (x: R, y: R): R { return this.addition.sub (x, y) }

  get one (): R { return this.multiplication.id }
  mul (x: R, y: R): R { return this.multiplication.mul (x, y) }

  eq (x: R, y: R): boolean { return this.elements.eq (x, y) }

  zero_p (x: R): boolean {
    return this.eq (x, this.zero)
  }

  one_p (x: R): boolean {
    return this.eq (x, this.one)
  }

  left_distr (x: R, y: R, z: R) {
    eqv (
      this.elements,
      this.mul (x, this.add (y, z)),
      this.add (this.mul (x, y), this.mul (x, z)),
    )
  }

  right_distr (x: R, y: R, z: R) {
    eqv (
      this.elements,
      this.mul (this.add (y, z), x),
      this.add (this.mul (y, x), this.mul (z, x)),
    )
  }
}

export
class commutative_ring_t <R> extends ring_t <R> {
  commu (x: R, y: R) {
    eqv (
      this.elements,
      this.mul (x, y),
      this.mul (y, x),
    )
  }

  distr (x: R, y: R, z: R) {
    this.left_distr (x, y, z)
    this.right_distr (x, y, z)
  }
}

export
class integral_ring_t <R> extends commutative_ring_t <R> {
  nonzero_product (x: R, y: R) {
    not_eqv (this.elements, x, this.zero)
    not_eqv (this.elements, y, this.zero)
    not_eqv (
      this.elements,
      this.mul (x, y),
      this.zero,
    )
  }
}

export
class euclidean_ring_t <R> extends integral_ring_t <R> {
  degree_lt: (x: R, y: R) => boolean
  divmod: (x: R, y: R) => [R, R]

  constructor (the: {
    addition: abelian_group_t <R>,
    multiplication: monoid_t <R>,
    degree_lt: (x: R, y: R) => boolean,
    divmod: (x: R, y: R) => [R, R],
  }) {
    super (the)
    this.degree_lt = the.degree_lt
    this.divmod = the.divmod
  }

  degree_lte (x: R, y: R): boolean {
    return this.eq (x, y) || this.degree_lt (x, y)
  }

  degree_gt (x: R, y: R): boolean {
    return this.degree_lt (y, x)
  }

  degree_gte (x: R, y: R): boolean {
    return this.eq (x, y) || this.degree_gt (x, y)
  }

  euclidean_divmod (x: R, y: R) {
    not_eqv (this.elements, y, this.zero)
    let [q, r] = this.divmod (x, y)
    eqv (this.elements, x, this.add (this.mul (y, q), r))
    assert (this.eq (r, this.zero) ||
            this.degree_lt (r, y))
  }

  div (x: R, y: R): R {
    let [q, r] = this.divmod (x, y)
    return q
  }

  mod (x: R, y: R): R {
    let [q, r] = this.divmod (x, y)
    return r
  }

  gcd (x: R, y: R): R {
    while (! this.eq (y, this.zero)) {
      if (this.degree_lt (x, y)) {
        [x, y] = [y, x];
      } else {
        let r = this.mod (x, y);
        [x, y] = [y, r];
      }
    }
    return x
  }

  gcd_ext (x: R, y: R): [R, [R, R]] {
    let old_s = this.one
    let old_t = this.zero
    let old_r = x

    let s = this.zero
    let t = this.one
    let r = y

    while (! this.zero_p (r)) {
      if (this.degree_lt (old_r, r)) {
        [
          s, t, r,
          old_s, old_t, old_r,
        ] = [
          old_s, old_t, old_r,
          s, t, r,
        ]
      } else {
        let q = this.div (old_r, r);
        [old_r, r] = [r, this.sub (old_r, this.mul (q, r))];
        [old_s, s] = [s, this.sub (old_s, this.mul (q, s))];
        [old_t, t] = [t, this.sub (old_t, this.mul (q, t))];
      }
    }

    return [old_r, [old_s, old_t]]
  }

  gcd_ext_p (x: R, y: R, res: [R, [R, R]]): boolean {
    let [d, [s, t]] = res
    return (this.eq (d, this.gcd (x, y)) &&
            this.eq (d, this.add (
              this.mul (s, x),
              this.mul (t, y))))
  }
}

export
class field_t <R> extends integral_ring_t <R> {
  inv: (x: R) => R

  constructor (the: {
    addition: abelian_group_t <R>,
    multiplication: monoid_t <R>,
    inv: (x: R) => R,
  }) {
    super (the)
    this.inv = (x) => {
      not_eqv (this.elements, x, this.zero)
      return the.inv (x)
    }
  }

  div (x: R, y: R): R {
    return this.mul (x, this.inv (y))
  }
}
