import test, { ExecutionContext } from "ava"

import {
  permutation_t,
  symmetric_group_t,
} from "../src/permutation"

import * as ut from "../src/util"

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
      .eq (permutation_t.identity (x.sequence.length))
  )
})

test ("order", t => {
  let x = new permutation_t ([0, 2, 3, 1])
  let y = new permutation_t ([0, 2, 1, 3])

  t.true (
    x.gt (y)
  )

  t.true (
    x.gteq (y)
  )

  t.true (
    x.gteq (x)
  )
})

test ("symmetric_group_t", t => {
  let s3 = new symmetric_group_t (3)
  s3.assoc (new permutation_t ([0, 2, 1]),
            new permutation_t ([1, 2, 0]),
            new permutation_t ([1, 0, 2]))
  s3.id_left (new permutation_t ([0, 2, 1]))
  s3.id_inv (new permutation_t ([0, 2, 1]))
  t.pass ()
})