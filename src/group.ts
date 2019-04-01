import { set_t } from "./set"
import { eqv } from "./eqv"

export
abstract class group_t <G> extends set_t <G> {
  abstract id: G
  abstract mul (x: G, y: G): G
  abstract inv (x: G): G

  div (x: G, y: G): G {
    return this.mul (x, this.inv (y))
  }

  assoc (x: G, y: G, z: G) {
    eqv (
      this,
      this.mul (this.mul (x, y), z),
      this.mul (x, this.mul (y, z)),
    )
  }

  id_left (x: G) {
    eqv (
      this,
      this.mul (this.id, x),
      x,
    )
  }

  id_right (x: G) {
    eqv (
      this,
      this.mul (x, this.id),
      x,
    )
  }

  id_inv (x: G) {
    eqv (
      this,
      this.mul (x, this.inv (x)),
      this.id,
    )
  }
}

export
abstract class abelian_group_t <A> extends group_t <A> {
  abstract add (x: A, y: A): A
  abstract neg (x: A): A

  sub (x: A, y: A): A {
    return this.add (x, this.neg (y))
  }

  commu (x: A, y: A) {
    eqv (
      this,
      this.add (x, y),
      this.add (y, x),
    )
  }

  // changing name

  id_neg = this.id_inv
  mul = this.add
  inv = this.neg
}
