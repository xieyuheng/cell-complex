import assert from "assert"

import { set_t, eqv } from "./set"
import { abelian_group_t, monoid_t } from "./group"

export
class ring_t <R> {
  readonly elements: set_t <R>
  readonly addition: abelian_group_t <R>
  readonly multiplication: monoid_t <R>

  constructor (the: {
    addition: abelian_group_t <R>,
    multiplication: monoid_t <R>,
  }) {
    this.addition = the.addition
    this.multiplication = the.multiplication
    this.elements = the.addition.elements
  }

  add_id = this.addition.id
  add = this.addition.add
  neg = this.addition.neg
  sub = this.addition.sub

  mul_id = this.multiplication.id
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
class commutative_ring_t <R> {
  readonly elements: set_t <R>
  readonly ring: ring_t <R>
  readonly addition: abelian_group_t <R>
  readonly multiplication: monoid_t <R>

  constructor (the: {
    ring: ring_t <R>
  }) {
    this.ring = the.ring
    this.elements = the.ring.elements
    this.addition = the.ring.addition
    this.multiplication = the.ring.multiplication
  }

  add_id = this.addition.id
  add = this.addition.add
  neg = this.addition.neg
  sub = this.addition.sub

  mul_id = this.multiplication.id
  mul = this.multiplication.mul

  commu (x: R, y: R) {
    eqv (
      this.elements,
      this.mul (x, y),
      this.mul (y, x),
    )
  }

  distr = this.ring.left_distr
}
