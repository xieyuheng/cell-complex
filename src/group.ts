import { set_t } from "./set"
import { eqv_t } from "./eqv"

export
abstract class group_t <G> extends set_t <G> {
  abstract id: G
  abstract mul (x: G, y: G): G
  abstract inv (x: G): G

  div (x: G, y: G): G {
    return this.mul (x, this.inv (y))
  }

  mul_assoc (x: G, y: G, z: G): eqv_t <G> {
    return new eqv_t (
      this,
      this.mul (this.mul (x, y), z),
      this.mul (x, this.mul (y, z)),
    )
  }

  id_left (x: G): eqv_t <G> {
    return new eqv_t (
      this, this.mul (this.id, x), x,
    )
  }

  id_right (x: G): eqv_t <G> {
    return new eqv_t (
      this, this.mul (x, this.id), x,
    )
  }
}

//// example

class number_mul_group_t extends group_t <number> {
  constructor () {
    super ()
  }

  eq (x: number, y: number): boolean {
    return x === y
  }

  id = 1

  mul (x: number, y: number): number {
    return x * y
  }

  inv (x: number): number {
    return 1 / x
  }

  mul_assoc_check () {
    this.mul_assoc (1, 2, 3) .check ()
    this.mul_assoc (3, 2, 1) .check ()
  }
}

new number_mul_group_t () .mul_assoc_check ()
