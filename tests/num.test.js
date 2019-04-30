import test from "ava"

import * as ut from "../lib/util"
import * as num from "../lib/num"

test ("num.matrix", t => {
  let x = num.matrix ([
    [1, 2, 4],
    [4, 5, 6],
    [7, 8, 9],
  ])
  t.deepEqual (x.shape, [3, 3])
})


test ("num.vector", t => {
  let x = num.vector ([1, 2, 4])
  t.deepEqual (x.size, 3)
})
