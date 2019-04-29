import assert from "assert"

import * as ut from "./util"
import * as eu from "./euclid-tobe"
import { set_t, eqv, not_eqv } from "./abstract/set"
import { euclidean_domain_t } from "./abstract/ring"

let ints = new set_t <bigint> ({
  eq: (x, y) => x === y
})

export
function abs (x: bigint) {
  return x < 0n ? -x : x
}

export
function mod (
  x: bigint,
  y: bigint,
): bigint {
  let r: bigint = x % y
  return r < 0 ? r + abs (y) : r
}

export
function divmod (
  x: bigint,
  y: bigint,
): [bigint, bigint] {
  let r: bigint = mod (x, y)
  let q: bigint = (x - r) / y
  return [q, r]
}

export
function div (
  x: bigint,
  y: bigint,
): bigint {
  let r: bigint = mod (x, y)
  return (x - r) / y
}

export
function abs_lt (x: bigint, y: bigint): boolean {
  return abs (x) < abs (y)
}

let domain = eu.domain <bigint> ({
  elements: ints,
  zero: 0n,
  add: (x: bigint, y: bigint) => x + y,
  neg: (x: bigint) => - x,
  one: 1n,
  mul: (x: bigint, y: bigint) => x * y,
  degree_lt: abs_lt,
  divmod: divmod,
})
