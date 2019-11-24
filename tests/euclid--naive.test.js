import test from "ava"

import * as nd from "../lib/ndarray"
import * as eu from "../lib/euclid--naive"
import { permutation_t } from "../lib/permutation"
import { log } from "@cicadoidea/basic"

test ("eu.matrix", t => {
  let x = eu.matrix ([
    [1, 2, 4],
    [4, 5, 6],
    [7, 8, 9],
  ])
  t.deepEqual (x.shape, [3, 3])
})

test ("eu.vector", t => {
  let x = eu.vector ([1, 2, 4])
  t.deepEqual (x.size, 3)
})

test ("eu.matrix_t.row .col", t => {
  let x = eu.matrix ([
    [1, 2, 4],
    [4, 5, 6],
    [7, 8, 9],
  ])
  let r = eu.vector ([1, 2, 4])
  t.true (x.row (0) .eq (r))

  let c = eu.vector ([1, 4, 7])
  t.true (x.col (0) .eq (c))
})

test ("eu.matrix_t.set_row .set_col", t => {
  let x = eu.matrix ([
    [1, 2, 4],
    [4, 5, 6],
    [7, 8, 9],
  ])
  let r = eu.vector ([0, 0, 0])
  x.set_row (0, r)
  t.true (x.row (0) .eq (r))

  let c = eu.vector ([0, 0, 0])
  x.set_col (0, r)
  t.true (x.col (0) .eq (c))
})

test ("eu.matrix_t.from_row .from_col", t => {
  let x = eu.matrix ([
    [1, 2, 4],
    [4, 5, 6],
    [7, 8, 9],
  ])
  // eu.matrix_t.from_row
  let r = eu.vector ([1, 2, 4])
  t.true (x.row (0) .eq (r))

  t.true (
    eu.matrix_t.from_row (x.row (0)) .eq (
      eu.matrix_t.from_row (r)
    )
  )

  t.true (
    eu.matrix_t.from_row (x.row (0)) .eq (
      eu.matrix ([
        [1, 2, 4],
      ])
    )
  )

  let c = eu.vector ([1, 4, 7])
  t.true (x.col (0) .eq (c))

  t.true (
    eu.matrix_t.from_col (x.col (0)) .eq (
      eu.matrix_t.from_col (c)
    )
  )

  t.true (
    eu.matrix_t.from_col (x.col (0)) .eq (
      eu.matrix ([
        [1],
        [4],
        [7],
      ])
    )
  )
})

test ("eu.matrix_t.row_trans", t => {
  let row_trans = eu.matrix ([
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 0],
  ])

  t.true (
    row_trans.eq (
      eu.matrix_t.row_trans (
        new permutation_t ([1, 2, 0])
      )
    )
  )

  let col_trans = eu.matrix ([
    [0, 0, 0, 1],
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
  ])

  t.true (
    col_trans.eq (
      eu.matrix_t.col_trans (
        new permutation_t ([1, 2, 3, 0])
      )
    )
  )

  t.pass ()
})

test ("eu.matrix_t.mul", t => {
  {
    let x = eu.matrix ([
      [0, 1],
      [0, 0],
    ])

    let y = eu.matrix ([
      [0, 0],
      [1, 0],
    ])

    t.true (
      x.mul (y) .eq (eu.matrix ([
        [1, 0],
        [0, 0],
      ]))
    )

    t.true (
      y.mul (x) .eq (eu.matrix ([
        [0, 0],
        [0, 1],
      ]))
    )
  }

  {
    let x = eu.matrix ([
      [0, 0, 0, 0],
      [0, 20, 30, 40],
      [0, 200, 300, 400],
      [0, 2000, 3000, 4000],
    ])

    let row_trans = eu.matrix ([
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
      [1, 0, 0, 0],
    ])

    let col_trans = eu.matrix ([
      [0, 0, 0, 1],
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
    ])

    let y = eu.matrix ([
      [20, 30, 40, 0],
      [200, 300, 400, 0],
      [2000, 3000, 4000, 0],
      [0, 0, 0, 0],
    ])

    t.true (
      row_trans.mul (x) .mul (col_trans) .eq (y)
    )
  }

  {
    let x = eu.matrix ([
      [0, 0, 0, 0],
      [0, 20, 30, 40],
      [0, 200, 300, 400],
    ])

    let row_trans = eu.matrix ([
      [0, 1, 0],
      [0, 0, 1],
      [1, 0, 0],
    ])

    let col_trans = eu.matrix ([
      [0, 0, 0, 1],
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
    ])

    let y = eu.matrix ([
      [20, 30, 40, 0],
      [200, 300, 400, 0],
      [0, 0, 0, 0],
    ])

    t.true (
      row_trans.mul (x) .mul (col_trans) .eq (y)
    )
  }

  {
    let x = eu.matrix ([
      [0, 0, 0, 0],
      [0, 20, 30, 40],
      [0, 200, 300, 400],
    ])

    let row_trans = eu.matrix ([
      [0, 1, 0],
      [0, 0, 1],
      [1, 0, 0],
    ])

    let col_trans = eu.matrix ([
      [0, 0, 1, 0],
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 1],
    ])

    let y = eu.matrix ([
      [20, 30, 0, 40],
      [200, 300, 0, 400],
      [0, 0, 0, 0],
    ])

    t.true (
      row_trans.mul (x) .mul (col_trans) .eq (y)
    )
  }
})

test ("eu.matrix_t.tuck_row .tuck_col", t => {
  let x = eu.matrix ([
    [0, 0, 0, 0],
    [0, 20, 30, 40],
    [0, 200, 300, 400],
  ])

  let y = eu.matrix ([
    [20, 30, 0, 40],
    [200, 300, 0, 400],
    [0, 0, 0, 0],
  ])

  t.true (
    x .tuck_row (0, 2)
      .tuck_col (0, 2)
      .eq (y)
  )
})

test ("eu.matrix_t.transpose", t => {
  {
    let x = eu.matrix ([
      [1, 2],
      [3, 4],
      [5, 6],
    ])

    let y = eu.matrix ([
      [1, 3, 5],
      [2, 4, 6],
    ])

    t.true (
      x.transpose () .eq (y)
    )
  }
})

test ("eu.vector_t.dot", t => {
  let v = eu.vector ([1, 2, 4])
  let w = eu.vector ([1, 2, 4])

  t.true (v.dot (w) === 1 + 4 + 16)
})

test ("eu.vector_t.trans", t => {
  {
    let v = eu.vector ([1, 2])

    let f = eu.matrix ([
      [0, 1],
      [0, 1],
    ])

    t.true (
      v.trans (f)
        .eq (eu.vector ([2, 2]))
    )

    t.true (
      v.trans (f) .eq (f.act (v))
    )
  }

  {
    let m = eu.matrix ([
      [ 2, -1],
      [-1,  2],
    ])
    let b = eu.vector ([0, 3])
    let v = eu.vector ([1, 2])

    t.true (
      v.trans (m) .eq (b)
    )

    t.true (
      v.trans (m) .eq (m.act (v))
    )
  }
})

test ("eu.matrix_t.diag", t => {
  let m = eu.matrix ([
    [1, 3, 1],
    [1, 1, -1],
    [3, 11, 5],
  ])
  let v = eu.vector ([
    1,
    1,
    5,
  ])

  t.true (m.diag () .eq (v))
})

test ("eu.matrix_t.reduced_row_echelon_form", t => {
  let m = eu.matrix ([
    [1, 3, 1, 9],
    [1, 1, -1, 1],
    [3, 11, 5, 35],
  ])

  // console.log (">>>")
  // m.print ()
  // m.row_echelon_form () .print ()
  // m.unit_row_echelon_form () .print ()
  // m.reduced_row_echelon_form () .print ()

  t.true (
    m.reduced_row_echelon_form () .eq (eu.matrix ([
      [1, 0, -2, -3],
      [0, 1, 1, 4],
      [0, 0, 0, 0],
    ]))
  )

  t.true (
    m.row_canonical_form () .eq (eu.matrix ([
      [1, 0, -2, -3],
      [0, 1, 1, 4],
      [0, 0, 0, 0],
    ]))
  )
})

function test_lower_upper_decomposition (t, m) {
  let {
    lower, upper, permu
  } = m.lower_upper_decomposition ()
  t.true (lower.lower_p ())
  t.true (upper.upper_p ())
  t.true (
    permu.mul (m) .eq (lower.mul (upper))
  )
}

test ("eu.matrix_t.lower_upper_decomposition", t => {
  test_lower_upper_decomposition (t, eu.matrix ([
    [1, 3, 1],
    [1, 1, -1],
    [3, 11, 5],
  ]))

  test_lower_upper_decomposition (t, eu.matrix ([
    [1, 3, 1],
    [1, 1, -1],
    [3, 11, 5],
  ]) .transpose ())

  test_lower_upper_decomposition (t, eu.matrix ([
    [1, 3, 1],
    [1, 1, -1],
    [3, 11, 5000],
  ]))

  test_lower_upper_decomposition (t, eu.matrix ([
    [4, 3],
    [6, 3],
  ]))

  test_lower_upper_decomposition (t, eu.matrix ([
    [4, 3],
    [6, 3],
  ]) .inv ())

  test_lower_upper_decomposition (t, eu.matrix ([
    [-2, 3],
    [-1, 3],
  ]))

  test_inv (t, eu.matrix ([
    [2, 2, 100],
    [0, 0, 3],
    [2, 1, 1],
  ]))

  test_lower_upper_decomposition (t, eu.matrix ([
    [2, 2, 100],
    [0, 0, 3],
    [2, 1, 1],
  ]))

  test_lower_upper_decomposition (t, eu.matrix ([
    [-2, 2, -3],
    [-1, 1, 3],
    [2, 0, -1],
  ]))
})

function test_row_canonical_decomposition (t, m) {
  let {
    row_trans, canonical
  } = m.row_canonical_decomposition ()
  t.true (canonical.upper_p ())
  t.true (canonical.row_canonical_form_p ())
  t.true (
    row_trans.mul (m) .sub (canonical) .epsilon_p ()
  )
}

test ("eu.matrix_t.row_canonical_decomposition", t => {
  test_row_canonical_decomposition (t, eu.matrix ([
    [1, 3, 1],
    [1, 1, -1],
    [3, 11, 5],
  ]))

  test_row_canonical_decomposition (t, eu.matrix ([
    [1, 3, 1],
    [1, 1, -1],
    [3, 11, 5],
  ]) .transpose ())

  test_row_canonical_decomposition (t, eu.matrix ([
    [1, 3, 1],
    [1, 1, -1],
    [3, 11, 5000],
  ]))

  test_row_canonical_decomposition (t, eu.matrix ([
    [4, 3],
    [6, 3],
  ]))

  test_row_canonical_decomposition (t, eu.matrix ([
    [4, 3],
    [6, 3],
  ]) .inv ())

  test_row_canonical_decomposition (t, eu.matrix ([
    [-2, 3],
    [-1, 3],
  ]))

  test_inv (t, eu.matrix ([
    [2, 2, 100],
    [0, 0, 3],
    [2, 1, 1],
  ]))

  test_row_canonical_decomposition (t, eu.matrix ([
    [2, 2, 100],
    [0, 0, 3],
    [2, 1, 1],
  ]))

  test_row_canonical_decomposition (t, eu.matrix ([
    [-2, 2, -3],
    [-1, 1, 3],
    [2, 0, -1],
  ]))
})

test ("eu.matrix_t.rank", t => {
  {
    let m = eu.matrix ([
      [1, 3, 1, 9],
      [1, 1, -1, 1],
      [3, 11, 5, 35],
    ])

    t.true (
      m.rank () === 2
    )
  }

  {
    let m = eu.matrix ([
      [1, 3, 1, 9],
      [0, 0, 0, 0],
      [0, 0, 0, 0.00000000001],
    ])

    t.true (
      m.rank () === 1
    )
  }
})

function test_inv (t, m) {
  t.true (m.square_p ())
  let [_n, n] = m.shape
  t.true (
    m.mul (m.inv ()) .sub (
      eu.matrix_t.id (n)
    ) .epsilon_p ()
  )
}

test ("eu.matrix_t.inv", t => {
  {
    let m = eu.matrix ([
      [1, 3, 1],
      [1, 1, -1],
      [3, 11, 5],
    ])
    t.true (m.inv_maybe () === null)
  }

  {
    let m = eu.matrix ([
      [2, -1, 0, 0],
      [-1, 2, -1, 0],
      [0, -1, 2, -1],
      [0, 0, -1, 2],
    ])

    test_inv (t, m)
  }

  {
    let m = eu.matrix ([
      [1, -1, 0, 0],
      [-1, 2, -1, 0],
      [0, -1, 2, -1],
      [0, 0, -1, 2],
    ])

    test_inv (t, m)
  }

  {
    let m = eu.matrix ([
      [2, -1, 0, -1],
      [-1, 2, -1, 0],
      [0, -1, 2, -1],
      [-1, 0, -1, 2],
    ])

    t.true (m.inv_maybe () === null)
  }

  {
    let m = eu.matrix ([
      [1, -1, 0, 0],
      [-1, 2, -1, 0],
      [0, -1, 2, -1],
      [0, 0, -1, 1],
    ])

    t.true (m.inv_maybe () === null)
  }

  {
    let m = eu.matrix ([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ])
    t.true (m.inv_maybe () === null)
  }


  let m = eu.matrix ([
    [2, -1, 0],
    [-1, 2, -1],
    [0, -1, 2],
  ])

  let [_n, n] = m.shape

  // console.log (">>>")
  // m .print ()
  // m.inv () .print ()
  // m.mul (m.inv ()) .print ()

  test_inv (t, eu.matrix ([
    [2, -1, 0],
    [-1, 2, -1],
    [0, -1, 2],
  ]))

  test_inv (t, eu.matrix ([
    [-2, 2, 113],
    [0, 0, 3],
    [2, 0, 1],
  ]))
})

test ("eu.matrix_t.append_cols .append_cols", t => {
  let m = eu.matrix ([
    [1, 3, 1],
    [1, 1, -1],
    [3, 11, 5],
  ])

  let i = eu.matrix ([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ])

  let a = eu.matrix ([
    [1, 3, 1, 1, 0, 0],
    [1, 1, -1, 0, 1, 0],
    [3, 11, 5, 0, 0, 1],
  ])

  let b = eu.matrix ([
    [1, 3, 1],
    [1, 1, -1],
    [3, 11, 5],
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ])

  t.true (
    m.append_cols (i) .eq (a)
  )

  t.true (
    m.append_rows (i) .eq (b)
  )
})

test ("eu.vector_t.reduce", t => {
  let v = eu.vector ([1, 2, 3])

  t.true (
    v.reduce ((acc, cur) => acc * cur) === 6
  )

  t.true (
    v.reduce_with (10, (acc, cur) => acc * cur) === 60
  )
})

test ("eu.matrix_t.id", t => {
  let v = eu.matrix_t.id (3)

  t.true (
    v.eq (eu.matrix ([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]))
  )
})

test ("eu.matrix_t.symmetric_p", t => {
  t.true (eu.matrix ([
    [ 1, -3, 0],
    [-3, 1, 0],
    [ 0, 0, 1],
  ]) .symmetric_p ())

  t.true (! eu.matrix ([
    [ 1, 0, 0],
    [-3, 1, 0],
    [ 0, 0, 1],
  ]) .symmetric_p ())

  let m = eu.matrix ([
    [ 1, 0],
    [-3, 1],
    [ 0, 0],
  ])

  t.true (m.transpose () .mul (m) .symmetric_p ())
  t.true (m.mul (m.transpose ()) .symmetric_p ())
})

test ("eu.matrix_t.upper .lower", t => {
  let m = eu.matrix ([
    [1, 3, 1, 9],
    [1, 1, -1, 1],
    [3, 11, 5, 35],
  ])

  t.true (
    m.upper () .eq (
      eu.matrix ([
        [1, 3, 1, 9],
        [0, 1, -1, 1],
        [0, 0, 5, 35],
      ])
    )
  )

  t.true (
    m.strict_upper () .eq (
      eu.matrix ([
        [0, 3, 1, 9],
        [0, 0, -1, 1],
        [0, 0, 0, 35],
      ])
    )
  )

  t.true (
    m.lower () .eq (
      eu.matrix ([
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [3, 11, 5, 0],
      ])
    )
  )

  t.true (
    m.strict_lower () .eq (
      eu.matrix ([
        [0, 0, 0, 0],
        [1, 0, 0, 0],
        [3, 11, 0, 0],
      ])
    )
  )

  t.pass ()
})

test ("eu.matrix_t.det", t => {
  let m = eu.matrix ([
    [-2, 2, -3],
    [-1, 1, 3],
    [2, 0, -1],
  ])

  t.true (
    m.det () === 18
  )

  t.true (
    m.transpose () .det () === 18
  )

  t.true (
    m.det () * m.inv () .det () === 1
  )
})

test ("eu.matrix_t.row_hermite_normal_form", t => {
  t.true (
    eu.matrix ([
      [2, 3, 6, 2],
      [5, 6, 1, 6],
      [8, 3, 1, 1],
    ]) .row_hermite_normal_form () .eq (
      eu.matrix ([
        [1, 0, 50, -11],
        [0, 3, 28, -2],
        [0, 0, 61, -13],
      ])
    )
  )

  t.true (
    eu.matrix ([
      [3, 3, 1, 4],
      [0, 1, 0, 0],
      [0, 0, 19, 16],
      [0, 0, 0, 3],
    ]) .row_hermite_normal_form () .eq (
      eu.matrix ([
        [3, 0, 1, 1],
        [0, 1, 0, 0],
        [0, 0, 19, 1],
        [0, 0, 0, 3],
      ])
    )
  )

  t.true (
    eu.matrix ([
      [9, -36, 30],
      [-36, 192, -180],
      [30, -180, 180],
    ]) .row_hermite_normal_form () .eq (
      eu.matrix ([
        [3, 0, 30],
        [0, 12, 0],
        [0, 0, 60],
      ])
    )
  )

  t.true (
    eu.matrix ([
      [0, 0, 5, 0, 1, 4],
      [0, 0, 0, -1, -4, 99],
      [0, 0, 0, 20, 19, 16],
      [0, 0, 0, 0, 2, 1],
      [0, 0, 0, 0, 0, 3],
      [0, 0, 0, 0, 0, 0],
    ]) .row_hermite_normal_form () .eq (
      eu.matrix ([
        [0, 0, 5, 0, 0, 2],
        [0, 0, 0, 1, 0, 1],
        [0, 0, 0, 0, 1, 2],
        [0, 0, 0, 0, 0, 3],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ])
    )
  )

  t.pass ()
})

function test_row_hermite_decomposition (t, m) {
  let {
    row_trans, hermite
  } = m.row_hermite_decomposition ()
  t.true (hermite.upper_p ())
  t.true (hermite.row_hermite_form_p ())
  t.true (row_trans.det_abs_one_p ())
  t.true (
    row_trans.mul (m) .sub (hermite) .epsilon_p ()
  )
}

test ("eu.matrix_t.row_hermite_decomposition", t => {
  test_row_hermite_decomposition (t, eu.matrix ([
    [2, 3, 6, 2],
    [5, 6, 1, 6],
    [8, 3, 1, 1],
  ]))

  test_row_hermite_decomposition (t, eu.matrix ([
    [3, 3, 1, 4],
    [0, 1, 0, 0],
    [0, 0, 19, 16],
    [0, 0, 0, 3],
  ]))

  test_row_hermite_decomposition (t, eu.matrix ([
    [9, -36, 30],
    [-36, 192, -180],
    [30, -180, 180],
  ]))

  test_row_hermite_decomposition (t, eu.matrix ([
    [0, 0, 5, 0, 1, 4],
    [0, 0, 0, -1, -4, 99],
    [0, 0, 0, 20, 19, 16],
    [0, 0, 0, 0, 2, 1],
    [0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0],
  ]))

  t.pass ()
})

test ("eu.matrix_t.image", t => {
  t.true (
    eu.matrix ([
      [1, 2, 1],
      [2, 4, 2],
      [3, 0, 3],
    ]) .image () .eq (
      eu.matrix ([
        [1, 0],
        [2, 0],
        [0, 1],
      ])
    )
  )
})

function test_kernel (t, m) {
  t.true (
    m .mul (m .kernel ()) .epsilon_p ()
  )
}

test ("eu.matrix_t.kernel", t => {
  test_kernel (t, eu.matrix ([
    [1, 3, 1, 9],
    [1, 1, -1, 1],
    [3, 11, 5, 35],
  ]))

  test_kernel (t, eu.matrix ([
    [1, 2, 1],
    [2, 4, 2],
    [3, 0, 3],
  ]))

  t.pass ()
})

function test_solve (t, m, b) {
  t.true (
    m.act (m.solve (b)) .sub (b) .epsilon_p ()
  )
}

function test_solve_non (t, m, b) {
  t.true (
    m.solve (b) === null
  )
}

test ("eu.matrix_t.solve", t => {
  test_solve (
    t,
    eu.matrix ([
      [1, 2, 1],
      [2, 4, 2],
      [3, 0, 3],
    ]),
    eu.vector ([1, 2, 3]),
  )

  test_solve (
    t,
    eu.matrix ([
      [1, 2, 1],
      [2, 4, 2],
      [3, 0, 3],
    ]),
    eu.vector ([1, 2, 4]),
  )

  test_solve_non (
    t,
    eu.matrix ([
      [1, 2, 1],
      [2, 4, 2],
      [3, 0, 3],
    ]),
    eu.vector ([1, 3, 3]),
  )

  test_solve (
    t,
    eu.matrix ([
      [1, 2, 1],
      [2, 13, 2],
      [3, -1, 0],
    ]),
    eu.vector ([1, 2, 3]))

  t.pass ()
})

function test_smith_normal_form (t, m) {
  t.true (
    m .smith_normal_form ()
      .smith_normal_form_p ()
  )
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

test ("eu.matrix_t.smith_normal_form", t => {
  test_smith_normal_form (t, eu.matrix ([
    [2, 4, 4],
    [-6, 6, 12],
    [10, -4, -16],
  ]))

  test_smith_normal_form (t, eu.matrix ([
    [2, 3, 6, 2],
    [5, 6, 1, 6],
    [8, 3, 1, 1],
  ]))

  test_smith_normal_form (t, eu.matrix ([
    [3, 3, 1, 4],
    [0, 1, 0, 0],
    [0, 0, 19, 16],
    [0, 0, 0, 3],
  ]))

  test_smith_normal_form (t, eu.matrix ([
    [9, -36, 30],
    [-36, 192, -180],
    [30, -180, 180],
  ]))

  test_smith_normal_form (t, eu.matrix ([
    [0, 0, 5, 0, 1, 4],
    [0, 0, 0, -1, -4, 99],
    [0, 0, 0, 20, 19, 16],
    [0, 0, 0, 0, 2, 1],
    [0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0],
  ]))

  test_smith_normal_form (t, eu.matrix ([
    [1, 0, 0],
    [0, 4, 0],
    [0, 0, 6],
  ]))

  test_smith_normal_form (t, eu.matrix ([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]))

  test_smith_normal_form (t, eu.matrix ([
    [0, 0, 0],
    [0, 4, 3],
    [0, 1, 6],
  ]))

  test_smith_normal_form (t, eu.matrix ([
    [0, 0, 0],
    [0, 4, 0],
    [0, 0, 6],
  ]))

  test_smith_normal_form (t, eu.matrix (INTEGER_MATRICES.R1))

  t.pass ()
})

function test_smith_decomposition (t, m) {
  let {
    row_trans,
    col_trans,
    smith,
  } = m.smith_decomposition ()

  let res = row_trans.mul (m) .mul (col_trans) .eq (smith)

  if (! res) {
    console.log ("smith_decomposition:")
    console.log ("row_trans:")
    row_trans.print ()
    console.log ("col_trans:")
    col_trans.print ()
    console.log ("row_trans.mul (m) .mul (col_trans):")
    row_trans.mul (m) .mul (col_trans) .print ()
    console.log ("smith:")
    smith.print ()
  }

  t.true (res)

  t.true (
    smith.smith_normal_form_p ()
  )
}

test ("eu.matrix_t.smith_decomposition", t => {
  test_smith_decomposition (t, eu.matrix ([
    [2, 4, 4],
    [-6, 6, 12],
    [10, -4, -16],
  ]))

  test_smith_decomposition (t, eu.matrix ([
    [2, 3, 6, 2],
    [5, 6, 1, 6],
    [8, 3, 1, 1],
  ]))

  test_smith_decomposition (t, eu.matrix ([
    [3, 3, 1, 4],
    [0, 1, 0, 0],
    [0, 0, 19, 16],
    [0, 0, 0, 3],
  ]))

  test_smith_decomposition (t, eu.matrix ([
    [9, -36, 30],
    [-36, 192, -180],
    [30, -180, 180],
  ]))

  test_smith_decomposition (t, eu.matrix ([
    [0, 0, 5, 0, 1, 4],
    [0, 0, 0, -1, -4, 99],
    [0, 0, 0, 20, 19, 16],
    [0, 0, 0, 0, 2, 1],
    [0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0],
  ]))

  test_smith_decomposition (t, eu.matrix ([
    [1, 0, 0],
    [0, 4, 0],
    [0, 0, 6],
  ]))

  test_smith_decomposition (t, eu.matrix ([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]))

  test_smith_decomposition (t, eu.matrix ([
    [0, 0, 0],
    [0, 4, 3],
    [0, 1, 6],
  ]))

  test_smith_decomposition (t, eu.matrix ([
    [0, 0, 0],
    [0, 4, 0],
    [0, 0, 6],
  ]))

  // LIMITATION
  //   the integers in `row_trans` and `col_trans`
  //   exceed the upper bound that `number` can encode.
  // test_smith_decomposition (t, eu.matrix (INTEGER_MATRICES.R1))

  t.pass ()
})

function test_int_kernel (t, m) {
  let int_kernel = m.int_kernel ()

  t.true (
    int_kernel.integral_p ()
  )

  t.true (
    m.mul (int_kernel) .epsilon_p ()
  )
}

test ("eu.matrix_t.int_kernel", t => {
  let A = eu.matrix ([
    [1, 2, 3, 4, 5, 6, 7],
    [1, 0, 1, 0, 1, 0, 1],
    [2, 4, 5, 6, 1, 1, 1],
    [1, 4, 2, 5, 2, 0, 0],
    [0, 0, 1, 1, 2, 2, 3],
  ])

  test_int_kernel (t, A)
})

function test_int_solve (t, m, b) {
  t.true (m.integral_p ())
  t.true (b.integral_p ())

  let solution = m.int_solve (b)

  t.true (
    m.act (solution) .sub (b) .epsilon_p ()
  )
}

function test_int_solve_non (t, m, b) {
  t.true (m.integral_p ())
  t.true (b.integral_p ())

  let solution = m.int_solve (b)

  t.true (
    solution === null
  )
}

test ("eu.matrix_t.int_solve", t => {
  let A = eu.matrix ([
    [1, 2, 3, 4, 5, 6, 7],
    [1, 0, 1, 0, 1, 0, 1],
    [2, 4, 5, 6, 1, 1, 1],
    [1, 4, 2, 5, 2, 0, 0],
    [0, 0, 1, 1, 2, 2, 3],
  ])

  let b = eu.vector ([
    28,
    4,
    20,
    14,
    9,
  ])

  test_int_solve (t, A, b)

  {
    let A = eu.matrix ([
      [1, 0],
      [0, 1],
    ])

    let b = eu.vector ([
      2,
      2,
    ])

    test_int_solve (t, A, b)

    t.true (
      A.int_solve (b) .eq (
        eu.vector ([2, 2])
      )
    )
  }

  {
    let A = eu.matrix ([
      [1, 1],
      [1, 1],
      [0, 1],
      [1, 0],
    ])

    let b = eu.vector ([
      0,
      0,
      1,
        -1,
    ])

    test_int_solve (t, A, b)

    t.true (
      A.act (eu.vector ([-1, 1])) .eq (b)
    )

    t.true (
      A.int_solve (b) .eq (
        eu.vector ([-1, 1])
      )
    )
  }

  t.pass ()
})
