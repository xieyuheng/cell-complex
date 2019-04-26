import assert from "assert"

import { set_t, eqv, not_eqv } from "./set"
import { abelian_group_t } from "./group"

export
class field_t <F> {
  readonly elements: set_t <F>
  readonly addition: abelian_group_t <F>
  readonly multiplication: abelian_group_t <F>

  constructor (the: {
    addition: abelian_group_t <F>,
    multiplication: abelian_group_t <F>,
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

  inv (x: F): F {
    not_eqv (this.elements, x, this.zero)
    return this.multiplication.inv (x)
  }

  div (x: F, y: F): F {
    return this.mul (x, this.inv (y))
  }

  distr (x: F, y: F, z: F) {
    eqv (
      this.elements,
      this.mul (x, this.add (y, z)),
      this.add (this.mul (x, y), this.mul (x, z)),
    )
  }
}
