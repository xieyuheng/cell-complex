import { abelian_group_t } from "./group.cs"
import { monoid_t } from "./monoid.cs"

class ring_t {
  element_t: type

  addition: abelian_group_t (
    element_t = this.element_t
  )

  multiplication: monoid_t (
    element_t = this.element_t
  )

  zero = this.addition.id
  add = this.addition.add
  neg = this.addition.neg
  sub = this.addition.sub

  one = this.multiplication.id
  mul = this.multiplication.mul

  left_distr (
    x: this.element_t,
    y: this.element_t,
    z: this.element_t,
  ): eqv_t (
    this.mul (x, this.add (y, z)),
    this.add (this.mul (x, y), this.mul (x, z)),
  )

  right_distr(
    x: this.element_t,
    y: this.element_t,
    z: this.element_t,
  ): eqv_t (
    this.mul (this.add (y, z), x),
    this.add (this.mul (y, x), this.mul (z, x)),
  )
}
