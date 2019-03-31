import { set_t } from "./set"

export
class eqv_t <T> {
  set: set_t <T>
  lhs: T
  rhs: T

  constructor (set: set_t <T>, lhs: T, rhs: T) {
    this.set = set
    this.lhs = lhs
    this.rhs = rhs
  }

  check (): boolean {
    return this.set.eq (this.lhs, this.rhs)
  }
}
