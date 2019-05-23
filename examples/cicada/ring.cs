import {
  abelian_group_t,
  monoid_t,
} from "./group.cs"

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

export
class commutative_ring_t extends ring_t {
  commu (
    x: this.element_t,
    y: this.element_t,
  ): eqv_t (
    this.mul (x, y),
    this.mul (y, x),
  )

  distr = this.left_distr
}

class integral_ring_t extends commutative_ring_t {
  nonzero_product (
    x: this.element_t, not_eqv_t (x, this.zero),
    y: this.element_t, not_eqv_t (y, this.zero),
  ): not_eqv_t (this.mul (x, y), this.zero)
}

class euclidean_ring_t extends integral_ring_t {
  degree: (x: this.element_t) => number

  // TODO
}

class field_t extends integral_ring_t {
  inv (x: this.element_t): this.element_t

  div (
    x: this.element_t,
    y: this.element_t,
  ): this.element_t = this.mul (x, this.inv (y))

}
