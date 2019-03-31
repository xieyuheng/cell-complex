// TODO
// basic interface for eq

export
class eqv_t <T> {
  lhs: T
  rhs: T

  constructor (lhs: T, rhs: T) {
    this.lhs = lhs
    this.rhs = rhs
  }

  check (): boolean {
    // TODO
    // this.lhs.eq (this.rhs)
    return this.lhs === this.rhs
  }
}

export
function eqv <T> (lhs: T, rhs: T): eqv_t <T> {
  return new eqv_t (lhs, rhs)
}

export
abstract class group_t <G> {
  abstract eq (x: G, y: G): boolean

  abstract id: G
  abstract mul (x: G, y: G): G
  abstract inv (x: G): G

  mul_assoc = (x: G, y: G, z: G) => eqv (
    this.mul (this.mul (x, y), z),
    this.mul (x, this.mul (y, z)),
  )

  div (x: G, y: G): G {
    return this.mul (x, this.inv (y))
  }
}

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

  mul_assoc_evident () {
    return [
      this.mul_assoc (1, 2, 3),
      this.mul_assoc (3, 2, 1),
    ]
  }
}

let num = new number_mul_group_t ()

num.mul_assoc_evident ()
