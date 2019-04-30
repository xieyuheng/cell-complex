import assert from "assert"

import * as ut from "cicada-lang/lib/util"
import * as int from "cicada-lang/lib/int"

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