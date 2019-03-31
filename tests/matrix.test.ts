import test from "ava"

import { ndarray_t } from "../dist/ndarray"
import { matrix_t } from "../dist/matrix"

test ("new matrix_t", t => {
  let x = new matrix_t (ndarray_t.from_2darray ([
    [1, 2, 4],
    [4, 5, 6],
    [7, 8, 9],
  ]))
  t.deepEqual (x.shape, [3, 3])
})
