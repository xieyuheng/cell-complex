import { category_t } from "./category.cs"

class monoid_t {
  element_t: type

  id: this.element_t
  mul (x: this.element_t, y: this.element_t): this.element_t

  assoc (
    x: this.element_t,
    y: this.element_t,
    z: this.element_t,
  ): eqv_t (
    this.mul (this.mul (x, y), z),
    this.mul (x, this.mul (y, z)),
  )

  id_left (
    x: this.element_t,
  ): eqv_t (this.mul (this.id, x), x)

  id_right (
    x: this.element_t,
  ): eqv_t (this.mul (x, this.id), x)
}

class group_t extends monoid_t {
  inv (x: this.element_t): this.element_t

  id_inv (
    x: this.element_t,
  ): eqv_t (this.mul (x, this.inv (x)), this.id)

  div (
    x: this.element_t,
    y: this.element_t,
  ): this.element_t {
    return this.mul (x, this.inv (y))
  }
}

class group_isomorphic_t {
  // TODO
}

let group_cat = category_t (
  object_t = group_t
  arrow_t = group_isomorphic_t
  // TODO
  dom
  cod
  id
  compose
  id_left
  id_right
  assoc
)

class abelian_group_t extends group_t {
  add = this.mul
  sub = this.div
  neg = this.inv

  commu (
    x: this.element_t,
    y: this.element_t,
  ): eqv_t (
    this.add (x, y),
    this.add (y, x),
  )
}
