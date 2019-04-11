import test from "ava"

import * as nd from "../src/ndarray"
import {
  point_t,
  vector_t,
  matrix_t,
} from "../src/euclidean-space"
import { log } from "../src/util"

test ("new matrix_t", t => {
  let x = matrix_t.from_array ([
    [1, 2, 4],
    [4, 5, 6],
    [7, 8, 9],
  ])
  t.deepEqual (x.shape, [3, 3])
})

test ("new vector_t", t => {
  let x = vector_t.from_array ([1, 2, 4])
  t.deepEqual (x.dim, 3)
})

test ("matrix_t row & col", t => {
  let x = matrix_t.from_array ([
    [1, 2, 4],
    [4, 5, 6],
    [7, 8, 9],
  ])
  let r = vector_t.from_array ([1, 2, 4])
  t.true (x.row (0) .eq (r))

  let c = vector_t.from_array ([1, 4, 7])
  t.true (x.col (0) .eq (c))
})

test ("matrix_t mul", t => {
  {
    let x = matrix_t.from_array ([
      [0, 1],
      [0, 0],
    ])

    let y = matrix_t.from_array ([
      [0, 0],
      [1, 0],
    ])

    t.true (
      x.mul (y) .eq (matrix_t.from_array ([
        [1, 0],
        [0, 0],
      ]))
    )

    t.true (
      y.mul (x) .eq (matrix_t.from_array ([
        [0, 0],
        [0, 1],
      ]))
    )
  }
})

test ("matrix_t transpose", t => {
  {
    let x = matrix_t.from_array ([
      [1, 2],
      [3, 4],
      [5, 6],
    ])

    let y = matrix_t.from_array ([
      [1, 3, 5],
      [2, 4, 6],
    ])

    t.true (
      x.transpose () .eq (y)
    )
  }
})

test ("point_t trans", t => {
  let p = point_t.from_array ([1, 1, 1])
  let v = vector_t.from_array ([1, 2, 4])
  let q = point_t.from_array ([2, 3, 5])

  t.true (p.trans (v) .eq (q))
  t.true (p.trans (v) .eq (v.act (p)))
})

test ("vector_t dot", t => {
  let v = vector_t.from_array ([1, 2, 4])
  let w = vector_t.from_array ([1, 2, 4])

  t.true (v.dot (w) === 1 + 4 + 16)
})

test ("vector_t trans", t => {
  {
    let v = vector_t.from_array ([1, 2])

    let f = matrix_t.from_array ([
      [0, 1],
      [0, 1],
    ])

    t.true (
      v.trans (f)
        .eq (vector_t.from_array ([2, 2]))
    )

    t.true (
      v.trans (f) .eq (f.act (v))
    )
  }

  {
    let m = matrix_t.from_array ([
      [ 2, -1],
      [-1,  2],
    ])
    let b = vector_t.from_array ([0, 3])
    let v = vector_t.from_array ([1, 2])

    t.true (
      v.trans (m) .eq (b)
    )

    t.true (
      v.trans (m) .eq (m.act (v))
    )
  }
})
