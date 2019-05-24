let assert = require ("assert") .strict

let ut = require ("../lib/util")
let num = require ("../lib/num")

{
  let A = num.matrix ([
    [-1, 1, 0, 0],
    [0, -1, 1, 0],
    [0, 0, -1, 1],
  ])

  A.mul (A.transpose ()) .print ()
}

{
  let A = num.matrix ([
    [0, 1, 0, 0],
    [0, -1, 1, 0],
    [0, 0, -1, 1],
  ])

  A.mul (A.transpose ()) .print ()
}

{
  let A = num.matrix ([
    [0, 1, 0, 0],
    [0, -1, 1, 0],
    [0, 0, -1, 0],
  ])

  A.mul (A.transpose ()) .print ()
}
