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

test ("num.matrix_t.reduced_row_echelon_form", t => {
  let m = num.matrix ([
    [1, 3, 1, 9],
    [1, 1, -1, 1],
    [3, 11, 5, 35],
  ])

  t.true (
    m.reduced_row_echelon_form () .eq (num.matrix ([
      [1, 0, -2, -3],
      [0, 1, 1, 4],
      [0, 0, 0, 0],
    ]))
  )
  t.pass ()
})

function test_lower_upper_decomposition (t, m) {
  console.log (m.lower_upper_decomposition)

  t.pass ()

  // let {
  //   lower, upper, permu
  // } = m.lower_upper_decomposition ()
  // t.true (
  //   permu.mul (m) .eq (lower.mul (upper))
  // )
}

test ("num.matrix_t.lower_upper_decomposition", t => {
  test_lower_upper_decomposition (t, num.matrix ([
    [1, 3, 1],
    [1, 1, -1],
    [3, 11, 5],
  ]))

  // test_lower_upper_decomposition (t, num.matrix ([
  //   [1, 3, 1],
  //   [1, 1, -1],
  //   [3, 11, 5],
  // ]) .transpose ())

  test_lower_upper_decomposition (t, num.matrix ([
    [1, 3, 1],
    [1, 1, -1],
    [3, 11, 5000],
  ]))

  test_lower_upper_decomposition (t, num.matrix ([
    [4, 3],
    [6, 3],
  ]))

  test_lower_upper_decomposition (t, num.matrix ([
    [-2, 3],
    [-1, 3],
  ]))

  test_lower_upper_decomposition (t, num.matrix ([
    [2, 2, 100],
    [0, 0, 3],
    [2, 1, 1],
  ]))

  test_lower_upper_decomposition (t, num.matrix ([
    [-2, 2, -3],
    [-1, 1, 3],
    [2, 0, -1],
  ]))
})
