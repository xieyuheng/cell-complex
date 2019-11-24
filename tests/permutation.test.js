import test from "ava"

import {
  permutation_t,
} from "../lib/permutation"

import * as ut from "@cicadoidea/basic/lib/util"

test ("new", t => {
  let x = new permutation_t ([0, 2, 3, 1])
  t.pass ()
})


test ("rev", t => {
  let x = new permutation_t ([0, 2, 3, 1])
  t.true (
    x.inv () .inv () .eq (x)
  )
})

test ("mul", t => {
  let x = new permutation_t ([0, 2, 3, 1])
  t.true (
    x.mul (x.inv ())
      .eq (permutation_t.id (x.sequence.length))
  )
})

test ("order", t => {
  let x = new permutation_t ([0, 2, 3, 1])
  let y = new permutation_t ([0, 2, 1, 3])

  t.true (
    x.gt (y)
  )

  t.true (
    x.gte (y)
  )

  t.true (
    x.gte (x)
  )
})

test ("tuck", t => {
  let x = permutation_t.id (4)

  t.true (
    x.tuck (0, 2) .eq (
      new permutation_t ([1, 2, 0, 3])
    )
  )
})
