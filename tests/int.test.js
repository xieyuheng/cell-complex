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
