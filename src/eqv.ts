// Due to the lack of dependent type,
// [[eqv_t]] is implemented as runtime test generator.

import assert from "assert"

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

  check () {
    assert (this.set.eq (this.lhs, this.rhs))
  }
}

export
function eqv <T> (set: set_t <T>, lhs: T, rhs: T) {
  new eqv_t (set, lhs, rhs) .check ()
}
