import assert from "assert"

import * as ut from "cicada-lang/lib/util"
import * as num from "cicada-lang/lib/num"

{
  /**
   * `reduced_row_echelon_form` is like `row_canonical_form`
   *   it reduce pivot to one
   *   while respecting `epsilon` for numerical stability
   */

  let A = num.matrix ([
    [1, 3, 1, 9],
    [1, 1, -1, 1],
    [3, 11, 5, 35],
  ])

  let B = num.matrix ([
    [1, 0, -2, -3],
    [0, 1, 1, 4],
    [0, 0, 0, 0],
  ])

  A.reduced_row_echelon_form () .print ()

  assert (
    A.reduced_row_echelon_form () .eq (B)
  )
}
