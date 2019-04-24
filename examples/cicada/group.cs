import { category_t } from "./category.cs"

class group_t {
  element_t: type

  id: this.element_t
  mul (x: this.element_t, y: this.element_t): this.element_t
  inv (x: this.element_t): this.element_t

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

class abelian_group_t {
  group: group_t

  element_t = this.group.element_t

  id = this.group.id
  mul = this.group.mul
  inv = this.group.inv
  div = this.group.div

  add = this.group.mul
  sub = this.group.div
  neg = this.group.inv

  commu (
    x: this.element_t,
    y: this.element_t,
  ): eqv_t (
    this.element_t,
    this.mul (x, y),
    this.mul (y, x),
  )
}

class isomorphic_t {
  // TODO
}

let group_cat = category_t (
  object_t = group_t
  arrow_t = isomorphic_t
  // TODO
  dom
  cod
  id
  compose
  id_left
  id_right
  assoc
)
