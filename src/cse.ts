import assert from "assert"

import * as ut from "./util"
import * as num from "./num"

/**
 * Computational Science and Engineering
 * - we will need `sparse_matrix_t`
 * - maybe we need a abstract interface for `matrix_t`
 *   to be able to represent K, C, T, B in even better ways
 */

{
  let K4 = num.matrix ([
    [2, -1, 0, 0],
    [-1, 2, -1, 0],
    [0, -1, 2, -1],
    [0, 0, -1, 2],
  ])

  let {
    lower, upper,
    permu, inver,
  } = K4.lower_upper_decomposition ()

  lower.print ()
  upper.print ()
  permu.print ()
  ut.log (inver)
}

{
  let C4 = num.matrix ([
    [2, -1, 0, -1],
    [-1, 2, -1, 0],
    [0, -1, 2, -1],
    [-1, 0, -1, 2],
  ])

  let {
    lower, upper,
    permu, inver,
  } = C4.lower_upper_decomposition ()

  lower.print ()
  upper.print ()
  permu.print ()
  ut.log (inver)
}

{
  let T4 = num.matrix ([
    [1, -1, 0, 0],
    [-1, 2, -1, 0],
    [0, -1, 2, -1],
    [0, 0, -1, 2],
  ])

  let {
    lower, upper,
    permu, inver,
  } = T4.lower_upper_decomposition ()

  lower.print ()
  upper.print ()
  permu.print ()
  ut.log (inver)
}

{
  let B4 = num.matrix ([
    [1, -1, 0, 0],
    [-1, 2, -1, 0],
    [0, -1, 2, -1],
    [0, 0, -1, 1],
  ])

  let {
    lower, upper,
    permu, inver,
  } = B4.lower_upper_decomposition ()

  lower.print ()
  upper.print ()
  permu.print ()
  ut.log (inver)
}
