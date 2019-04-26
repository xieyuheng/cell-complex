import assert from "assert"

export
class set_t <T> {
  readonly eq: (x: T, y: T) => boolean

  constructor (the: {
    eq: (x: T, y: T) => boolean
  }) {
    this.eq = the.eq
  }
}

/**
 * Due to the lack of dependent type,
 * [[eqv_t]] is implemented as runtime test generator.
 */
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

export
class not_eqv_t <T> {
  set: set_t <T>
  lhs: T
  rhs: T

  constructor (set: set_t <T>, lhs: T, rhs: T) {
    this.set = set
    this.lhs = lhs
    this.rhs = rhs
  }

  check () {
    assert (! this.set.eq (this.lhs, this.rhs))
  }
}

export
function not_eqv <T> (set: set_t <T>, lhs: T, rhs: T) {
  new not_eqv_t (set, lhs, rhs) .check ()
}

// TODO
// the following definition is not useful.
// maybe we can not formalize sub object relation in ts.

export
class subset_t <T> {
  readonly set: set_t <T>
  readonly in: (x: T) => boolean

  constructor (the: {
    set: set_t <T>,
    in: (x: T) => boolean,
  }) {
    this.set = the.set
    this.in = the.in
  }
}
