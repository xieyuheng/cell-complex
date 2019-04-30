import test from "ava"

import * as ut from "../lib/util"
import * as int from "../lib/int"

test ("int.divmod", t => {
  t.deepEqual (int.divmod (BigInt (17), BigInt (4)), [BigInt (4), BigInt (1)])
  t.deepEqual (int.divmod (BigInt (19), BigInt (30)), [BigInt (0), BigInt (19)])
  t.deepEqual (int.divmod (BigInt (-17), BigInt (-10)), [BigInt (2), BigInt (3)])
  t.deepEqual (int.divmod (BigInt (7), BigInt (1)), [BigInt (7), BigInt (0)])
})

test ("int.ring.gcd", t => {
  t.true (int.ring.gcd (BigInt (6), BigInt (7)) === BigInt (1))
  t.true (int.ring.gcd (BigInt (1), BigInt (7)) === BigInt (1))
  t.true (int.ring.gcd (BigInt (0), BigInt (7)) === BigInt (7))
  t.true (int.ring.gcd (BigInt (6), BigInt (6)) === BigInt (6))
  t.true (int.ring.gcd (BigInt (1071), BigInt (462)) === BigInt (21))
  t.true (int.ring.gcd (BigInt (1071), BigInt (-462)) === BigInt (21))
  t.true (int.ring.gcd (BigInt (-1071), BigInt (462)) === BigInt (21))
})

function test_gcd_ext (t, x, y) {
  let res = int.ring.gcd_ext (x, y)
  // ut.log ([x, y, res])
  t.true (int.ring.gcd_ext_p (x, y, res))
}

test ("int.ring.gcd_ext", t => {
  test_gcd_ext (t, BigInt (6), BigInt (7))
  test_gcd_ext (t, BigInt (1), BigInt (7))
  test_gcd_ext (t, BigInt (0), BigInt (7))
  test_gcd_ext (t, BigInt (6), BigInt (6))
  test_gcd_ext (t, BigInt (1071), BigInt (462))
  test_gcd_ext (t, BigInt (-1071), -BigInt (462))
  test_gcd_ext (t, BigInt (-1071), BigInt (462))
  test_gcd_ext (t, BigInt (-1071), BigInt (0))
  test_gcd_ext (t, BigInt (0), BigInt (123))
  test_gcd_ext (t, BigInt (0), -BigInt (123))
})

test ("int.matrix", t => {
  let x = int.matrix ([
    [1, 2, 4],
    [4, 5, 6],
    [7, 8, 9],
  ])
  t.deepEqual (x.shape, [3, 3])
})


test ("int.vector", t => {
  let x = int.vector ([1, 2, 4])
  t.deepEqual (x.size, 3)
})

function test_row_canonical_form (t, A, E) {
  let U = A.row_canonical_form ()
  if (! U.eq (E)) {
    console.log ("test_row_canonical_form fail")
    console.log ("A:"); A.print ()
    console.log ("computed U:"); U.print ()
    console.log ("expected E:"); E.print ()
    t.fail ()
  }
  t.pass ()
}

test ("int.matrix_t.row_canonical_form", t => {
  test_row_canonical_form (
    t,
    int.matrix ([
      [2, 3, 6, 2],
      [5, 6, 1, 6],
      [8, 3, 1, 1],
    ]),
    int.matrix ([
      [1, 0, -11, 2],
      [0, 3, 28, -2],
      [0, 0, 61, -13],
    ]),
  )

  test_row_canonical_form (
    t,
    int.matrix ([
      [3, 3, 1, 4],
      [0, 1, 0, 0],
      [0, 0, 19, 16],
      [0, 0, 0, 3],
    ]),
    int.matrix ([
      [3, 0, 1, 1],
      [0, 1, 0, 0],
      [0, 0, 19, 1],
      [0, 0, 0, 3],
    ]),
  )

  test_row_canonical_form (
    t,
    int.matrix ([
      [9, -36, 30],
      [-36, 192, -180],
      [30, -180, 180],
    ]),
    int.matrix ([
      [3, 0, -30],
      [0, 12, 0],
      [0, 0, -60],
    ]),
  )

  test_row_canonical_form (
    t,
    int.matrix ([
      [0, 0, 5, 0, 1, 4],
      [0, 0, 0, -1, -4, 99],
      [0, 0, 0, 20, 19, 16],
      [0, 0, 0, 0, 2, 1],
      [0, 0, 0, 0, 0, 3],
      [0, 0, 0, 0, 0, 0],
    ]),
    int.matrix ([
      [0, 0, 5, 0, 0, 2],
      [0, 0, 0, -1, 0, 2],
      [0, 0, 0, 0, 1, 2],
      [0, 0, 0, 0, 0, 3],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ]),
  )

  t.pass ()
})

function test_row_canonical_decomposition (t, m) {
  let {
    row_trans,
    row_canonical,
  } = m.row_canonical_decomposition ()
  t.true (
    row_trans.mul (m) .eq (row_canonical)
  )
}

test ("int.matrix_t.row_canonical_decomposition", t => {
  test_row_canonical_decomposition (t, int.matrix ([
    [2, 3, 6, 2],
    [5, 6, 1, 6],
    [8, 3, 1, 1],
  ]))

  test_row_canonical_decomposition (t, int.matrix ([
    [3, 3, 1, 4],
    [0, 1, 0, 0],
    [0, 0, 19, 16],
    [0, 0, 0, 3],
  ]))

  test_row_canonical_decomposition (t, int.matrix ([
    [9, -36, 30],
    [-36, 192, -180],
    [30, -180, 180],
  ]))

  test_row_canonical_decomposition (t, int.matrix ([
    [0, 0, 5, 0, 1, 4],
    [0, 0, 0, -1, -4, 99],
    [0, 0, 0, 20, 19, 16],
    [0, 0, 0, 0, 2, 1],
    [0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0],
  ]))

  t.pass ()
})


function test_diag_canonical_form (t, m) {
  t.true (
    m.diag_canonical_form () .diag_canonical_form_p ()
  )
  t.pass ()
}

let INTEGER_MATRICES = {
  // Examples taken from
  // "INTEGER MATRICES AND ABELIAN GROUPS",
  // by George Havas and Leon S. Sterling.
  R1: [
    [2, 0, -1, 0, -1, 2, 1, -1, 2, -1, -1, 0, -1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 1, -1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, -1, -1, -1, 0, -1, 0, 1, -1, 0, 0, 0, 0, 0, -1],
    [2, 0, -1, 2, -1, 0, -1, 1, 0, 0, 0, 0, -2, 2, 0, 0, 0, 0, 1, -2, 1, 1, -1, 1, -1, 0, 0],
    [1, -1, 1, 0, 0, 0, -1, 0, -1, 1, 0, 0, 0, 1, 1, -1, 0, 0, 0, 0, 2, -1, 0, 1, 2, 0, -1],
    [0, 0, 0, 2, -2, 1, 1, -2, -1, 1, 1, 0, 0, 0, -1, 0, 1, -1, 1, 0, 0, 0, 2, 0, 0, -1, 0],
    [0, 0, 0, 0, 1, 0, 1, -1, 1, -1, -1, -1, -1, -1, 0, 1, 1, 0, 0, 0, 0, -1, 0, -1, -1, 1, 0],
    [0, 0, 0, 1, -2, 0, 2, -2, 0, 1, 2, 0, 1, 0, 2, 0, -2, 1, 1, -1, -1, -1, 1, 1, -1, 0, 0],
    [2, 2, 1, -2, 1, 1, 0, 0, 0, 0, 1, 0, 1, -2, 0, 0, -1, -1, 0, 1, -2, 0, 0, -1, 0, 1, -2],
    [1, 1, 0, 0, -1, 2, -1, 0, 2, -1, -1, -1, -1, -1, 1, -1, 0, 0, 1, 0, 1, 0, -1, 1, 0, 0, -1],
    [1, -2, -1, 1, 1, 0, 1, -1, 0, 0, -2, -1, 0, 1, 0, 0, 1, 1, 1, -2, 1, -1, 0, 1, 0, 1, 1],
    [1, 0, 1, 1, -1, 0, -3, 1, 0, 0, 0, 0, -2, -1, 2, -2, 0, 0, 1, 1, 2, -1, -1, 1, 1, 0, -1],
    [0, 0, 0, 1, -2, 0, -1, 1, 1, 0, 1, 0, 0, 0, 2, 0, -2, 1, 1, -2, 0, 1, -1, 1, -1, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 2, 0, 0, -2, 2, 0, 0, 1, 0, 1, 0, -1, -2, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, -1, -2],
    [1, 0, -1, 0, -1, 1, 0, 1, 1, 0, 0, 0, -2, -1, 1, 0, 0, 0, 1, -1, 1, -1, -1, 2, -1, 0, 0],
    [1, 1, -1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, -1, -1, -1, 0, 0, 0, 1, -1, 0, 0, 0, 0, 0, -1],
    [2, -1, 0, -1, 1, 0, 0, 0, 0, -1, -1, 0, -1, -1, 0, -1, 0, -1, 0, 1, 2, -1, -1, 0, 1, -1, 0],
    [1, 2, 1, -1, 0, 1, -1, 1, 1, 0, 1, 0, -2, -1, 1, 2, 0, -1, 1, 0, 2, 0, 0, -1, 1, 0, -2],
    [2, 1, 0, -1, 0, 1, 0, -1, -1, 0, 0, 0, -2, 0, -1, -1, 1, -1, 0, 2, 2, 0, 0, -1, 1, -2, -1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, -1, 0, 0, 0, 0, -2, 0, 1, 0, -2, -1, 0, -1, 2, -2, 0, 1],
    [0, 0, -1, 0, -1, 1, 2, -2, 0, 0, -1, 0, -1, -1, 2, 0, 0, 2, 1, -2, 2, -2, 0, 2, 0, 0, 0],
    [1, 1, 0, 1, -2, 2, 2, -2, 2, -1, 0, 0, -2, -1, 0, 1, 1, -1, 0, 0, 1, 0, 2, -1, -1, -1, -1],
    [2, -1, 0, 0, 0, 0, 0, 0, 1, -1, 1, 0, -1, -1, -1, 0, 0, -3, 0, 1, 1, 0, 0, -1, 0, 0, 0],
    [1, 0, 0, 0, 0, -1, -2, -1, -3, 2, 1, 1, 0, 2, 1, -2, 0, 0, -1, 2, 1, 0, -1, -2, 2, 0, -1],
    [2, 0, 0, 1, -2, 0, 0, -1, -1, 0, 1, 1, -2, 2, 1, -1, -1, 0, -1, 1, 2, 0, 0, -1, 1, -1, -1],
  ]
}

test ("int.matrix_t.diag_canonical_form", t => {
  test_diag_canonical_form (t, int.matrix ([
    [2, 4, 4],
    [-6, 6, 12],
    [10, -4, -16],
  ]))

  test_diag_canonical_form (t, int.matrix ([
    [2, 3, 6, 2],
    [5, 6, 1, 6],
    [8, 3, 1, 1],
  ]))

  test_diag_canonical_form (t, int.matrix ([
    [3, 3, 1, 4],
    [0, 1, 0, 0],
    [0, 0, 19, 16],
    [0, 0, 0, 3],
  ]))

  test_diag_canonical_form (t, int.matrix ([
    [9, -36, 30],
    [-36, 192, -180],
    [30, -180, 180],
  ]))

  test_diag_canonical_form (t, int.matrix ([
    [0, 0, 5, 0, 1, 4],
    [0, 0, 0, -1, -4, 99],
    [0, 0, 0, 20, 19, 16],
    [0, 0, 0, 0, 2, 1],
    [0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0],
  ]))

  test_diag_canonical_form (t, int.matrix ([
    [1, 0, 0],
    [0, 4, 0],
    [0, 0, 6],
  ]))

  test_diag_canonical_form (t, int.matrix ([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]))

  test_diag_canonical_form (t, int.matrix ([
    [0, 0, 0],
    [0, 4, 3],
    [0, 1, 6],
  ]))

  test_diag_canonical_form (t, int.matrix ([
    [0, 0, 0],
    [0, 4, 0],
    [0, 0, 6],
  ]))

  test_diag_canonical_form (t, int.matrix (INTEGER_MATRICES.R1))

  t.pass ()
})

function test_diag_canonical_decomposition (t, m) {
  let {
    row_trans,
    col_trans,
    diag_canonical,
  } = m.diag_canonical_decomposition ()

  let res = row_trans.mul (m) .mul (col_trans) .eq (diag_canonical)

  if (! res) {
    console.log ("test_diag_canonical_decomposition fail:")
    console.log ("row_trans:")
    row_trans.print ()
    console.log ("col_trans:")
    col_trans.print ()
    console.log ("row_trans.mul (m) .mul (col_trans):")
    row_trans.mul (m) .mul (col_trans) .print ()
    console.log ("diag_canonical:")
    diag_canonical.print ()
  }

  t.true (res)

  t.true (
    diag_canonical.diag_canonical_form_p ()
  )
}

test ("int.matrix_t.diag_canonical_decomposition", t => {
  test_diag_canonical_decomposition (t, int.matrix ([
    [2, 4, 4],
    [-6, 6, 12],
    [10, -4, -16],
  ]))

  test_diag_canonical_decomposition (t, int.matrix ([
    [2, 3, 6, 2],
    [5, 6, 1, 6],
    [8, 3, 1, 1],
  ]))

  test_diag_canonical_decomposition (t, int.matrix ([
    [3, 3, 1, 4],
    [0, 1, 0, 0],
    [0, 0, 19, 16],
    [0, 0, 0, 3],
  ]))

  test_diag_canonical_decomposition (t, int.matrix ([
    [9, -36, 30],
    [-36, 192, -180],
    [30, -180, 180],
  ]))

  test_diag_canonical_decomposition (t, int.matrix ([
    [0, 0, 5, 0, 1, 4],
    [0, 0, 0, -1, -4, 99],
    [0, 0, 0, 20, 19, 16],
    [0, 0, 0, 0, 2, 1],
    [0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0],
  ]))

  test_diag_canonical_decomposition (t, int.matrix ([
    [1, 0, 0],
    [0, 4, 0],
    [0, 0, 6],
  ]))

  test_diag_canonical_decomposition (t, int.matrix ([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]))

  test_diag_canonical_decomposition (t, int.matrix ([
    [0, 0, 0],
    [0, 4, 3],
    [0, 1, 6],
  ]))

  test_diag_canonical_decomposition (t, int.matrix ([
    [0, 0, 0],
    [0, 4, 0],
    [0, 0, 6],
  ]))

  test_diag_canonical_decomposition (t, int.matrix (
    INTEGER_MATRICES.R1
  ))

  t.pass ()
})

function test_kernel (t, m) {
  let kernel = m.kernel ()

  t.true (
    m.mul (kernel) .zero_p ()
  )
}

test ("int.matrix_t.int_kernel", t => {
  let A = int.matrix ([
    [1, 2, 3, 4, 5, 6, 7],
    [1, 0, 1, 0, 1, 0, 1],
    [2, 4, 5, 6, 1, 1, 1],
    [1, 4, 2, 5, 2, 0, 0],
    [0, 0, 1, 1, 2, 2, 3],
  ])

  test_kernel (t, A)
})

function test_solve (t, m, b) {
  let solution = m.solve (b)

  t.true (
    m.act (solution) .sub (b) .zero_p ()
  )
}

function test_solve_non (t, m, b) {
  let solution = m.solve (b)

  t.true (
    solution === null
  )
}

test ("int.matrix_t.solve", t => {
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

  test_solve (t, A, b)

  {
    let A = int.matrix ([
      [1, 0],
      [0, 1],
    ])

    let b = int.vector ([
      2,
      2,
    ])

    test_solve (t, A, b)

    t.true (
      A.solve (b) .eq (
        int.vector ([2, 2])
      )
    )
  }

  {
    let A = int.matrix ([
      [1, 1],
      [1, 1],
      [0, 1],
      [1, 0],
    ])

    let b = int.vector ([
      0,
      0,
      1,
        -1,
    ])

    test_solve (t, A, b)

    t.true (
      A.act (int.vector ([-1, 1])) .eq (b)
    )

    t.true (
      A.solve (b) .eq (
        int.vector ([-1, 1])
      )
    )
  }

  t.pass ()
})
