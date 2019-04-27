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

  zero = this.addition.id
  add = this.addition.add
  neg = this.addition.neg
  sub = this.addition.sub

  one = this.multiplication.id
  mul = this.multiplication.mul

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

  distr = this.left_distr
}

export
class integral_domain_t <R> extends commutative_ring_t <R> {
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
class euclidean_domain_t <R> extends integral_domain_t <R> {
  degree: (x: R) => number

  constructor (the: {
    addition: abelian_group_t <R>,
    multiplication: monoid_t <R>,
    degree: (x: R) => number,
  }) {
    super (the)
    this.degree = the.degree
  }
}

export
class field_t <R> extends integral_domain_t <R> {
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
