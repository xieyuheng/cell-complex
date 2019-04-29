import assert from "assert"

import * as ut from "./util"
import * as eu from "./euclid-tobe"
import { set_t, eqv, not_eqv } from "./abstract/set"
import { euclidean_domain_t } from "./abstract/ring"

export
let nums = new set_t <number> ({
  eq: (x, y) => x === y
})

export
let domain = eu.domain <number> ({
  elements: nums,
  zero: 0,
  add: (x: number, y: number) => x + y,
  neg: (x: number) => - x,
  one: 1,
  mul: (x: number, y: number) => x * y,
  degree_lt: (x: number, y: number) => false,
  divmod: (x: number, y: number) => [x / y, 0],
})
