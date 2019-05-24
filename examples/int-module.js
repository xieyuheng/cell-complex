let assert = require ("assert") .strict

let ut = require ("../lib/util")
let int = require ("../lib/int")

{
  /**
   * generic `row_canonical_form`
   *   i.e. `hermite_normal_form` for integers
   */

  let A = int.matrix ([
    [2, 3, 6, 2],
    [5, 6, 1, 6],
    [8, 3, 1, 1],
  ])

  let B = int.matrix ([
    [1, 0, -11, 2],
    [0, 3, 28, -2],
    [0, 0, 61, -13],
  ])

  assert (
    A.row_canonical_form () .eq (B)
  )
}

{
  /**
   * generic `diag_canonical_form`
   *   i.e. `smith_normal_form` for integers
   */

  let A = int.matrix ([
    [2, 4, 4],
    [-6, 6, 12],
    [10, -4, -16],
  ])

  let S = int.matrix ([
    [2, 0, 0],
    [0, 6, 0],
    [0, 0, -12],
  ])

  assert (
    A.diag_canonical_form () .eq (S)
  )
}

{
  /**
   * solve linear diophantine equations
   */

  let A = int.matrix ([
    [1, 2, 3, 4, 5, 6, 7],
    [1, 0, 1, 0, 1, 0, 1],
    [2, 4, 5, 6, 1, 1, 1],
    [1, 4, 2, 5, 2, 0, 0],
    [0, 0, 1, 1, 2, 2, 3],
  ])

  let b = int.vector ([
    28,
    4,
    20,
    14,
    9,
  ])

  let solution = A.solve (b)

  if (solution !== null) {
    solution.print ()

    assert (
      A.act (solution) .eq (b)
    )
  }
}
