import test from "ava"

import * as nd from "../src/ndarray"
import { point_t, vector_t, matrix_t } from "../src/euclidean-space"

test ("new matrix_t", t => {
  let x = new matrix_t (nd.array_t.from_2darray ([
    [1, 2, 4],
    [4, 5, 6],
    [7, 8, 9],
  ]))
  t.deepEqual (x.shape, [3, 3])
})

test ("new vector_t", t => {
  let x = new vector_t (nd.array_t.from_1darray ([1, 2, 4]))
  t.deepEqual (x.dim, 3)
})

test ("matrix_t row & col", t => {
  let x = new matrix_t (nd.array_t.from_2darray ([
    [1, 2, 4],
    [4, 5, 6],
    [7, 8, 9],
  ]))
  let r = new vector_t (nd.array_t.from_1darray ([1, 2, 4]))
  t.true (x.row (0) .eq (r))

  let c = new vector_t (nd.array_t.from_1darray ([1, 4, 7]))
  t.true (x.col (0) .eq (c))
})

test ("point_t trans", t => {
  let p = new point_t (nd.array_t.from_1darray ([1, 1, 1]))
  let v = new vector_t (nd.array_t.from_1darray ([1, 2, 4]))
  let q = new point_t (nd.array_t.from_1darray ([2, 3, 5]))

  t.true (p.trans (v) .eq (q))
})

test ("vector_t dot", t => {
  let v = new vector_t (nd.array_t.from_1darray ([1, 2, 4]))
  let w = new vector_t (nd.array_t.from_1darray ([1, 2, 4]))

  t.true (v.dot (w) === 1 + 4 + 16)
})
