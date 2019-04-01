import assert from "assert"

import { set_t } from "./set"
import { eqv } from "./eqv"

export
abstract class field_t <F> extends set_t <F> {
  abstract add_id: F
  abstract add (x: F, y: F): F
  abstract neg (x: F): F

  sub (x: F, y: F): F {
    return this.add (x, this.neg (y))
  }

  add_assoc (x: F, y: F, z: F) {
    return eqv (
      this,
      this.add (this.add (x, y), z),
      this.add (x, this.add (y, z)),
    )
  }

  add_commu (x: F, y: F) {
    return eqv (
      this,
      this.add (x, y),
      this.add (y, x),
    )
  }

  add_id_left (x: F) {
    return eqv (
      this,
      this.add (this.add_id, x),
      x,
    )
  }

  add_id_right (x: F) {
    return eqv (
      this,
      this.add (x, this.add_id),
      x,
    )
  }

  add_id_neg (x: F) {
    return eqv (
      this,
      this.add (x, this.neg (x)),
      this.add_id,
    )
  }

  abstract mul_id: F
  abstract mul (x: F, y: F): F
  abstract pure_inv (x: F): F

  inv (x: F): F {
    assert (! this.eq (x, this.add_id))
    return this.pure_inv (x)
  }

  div (x: F, y: F): F {
    return this.mul (x, this.inv (y))
  }

  mul_assoc (x: F, y: F, z: F) {
    return eqv (
      this,
      this.mul (this.mul (x, y), z),
      this.mul (x, this.mul (y, z)),
    )
  }

  mul_commu (x: F, y: F) {
    return eqv (
      this,
      this.mul (x, y),
      this.mul (y, x),
    )
  }

  mul_id_left (x: F) {
    return eqv (
      this,
      this.mul (this.mul_id, x),
      x,
    )
  }

  mul_id_right (x: F) {
    return eqv (
      this,
      this.mul (x, this.mul_id),
      x,
    )
  }

  mul_id_inv (x: F) {
    return eqv (
      this,
      this.mul (x, this.inv (x)),
      this.mul_id,
    )
  }

  distr (x: F, y: F, z: F) {
    return eqv (
      this,
      this.mul (x, this.add (y, z)),
      this.add (this.mul (x, y), this.mul (x, z)),
    )
  }
}
