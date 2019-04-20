import test from "ava"

import * as ut from "../lib/util"
import * as int from "../lib/integer"

test ("divmod", t => {
  t.deepEqual (int.divmod (17, 4), [4, 1])
  t.deepEqual (int.divmod (19, 30), [0, 19])
})

test ("gcd", t => {
  t.true (int.gcd (6, 7) === 1)
  t.true (int.gcd (1, 7) === 1)
  t.true (int.gcd (0, 7) === 7)
  t.true (int.gcd (6, 6) === 6)
  t.true (int.gcd (1071, 462) === 21)
  t.true (int.gcd (1071, -462) === 21)
  t.true (int.gcd (-1071, 462) === 21)
})

test ("array_gcd", t => {
  t.true (int.array_gcd ([6, 7, 1]) === 1)
  t.true (int.array_gcd ([1, 7, 1]) === 1)
  t.true (int.array_gcd ([0, 7, 3]) === 1)
  t.true (int.array_gcd ([6, 6, 2]) === 2)
  t.true (int.array_gcd ([1071, 462, 20]) === 1)
  t.true (int.array_gcd ([1071, 462, 3]) === 3)
  t.true (int.array_gcd ([1071, -462, 15]) === 3)
  t.true (int.array_gcd ([-1071, 462, 11]) === 1)
})

function test_gcd_ext (t, x, y) {
  let res = int.gcd_ext (x, y)
  // ut.log ([x, y, res])
  t.true (int.gcd_ext_p (x, y, res))
}

test ("gcd_ext", t => {
  test_gcd_ext (t, 6, 7)
  test_gcd_ext (t, 1, 7)
  test_gcd_ext (t, 0, 7)
  test_gcd_ext (t, 6, 6)
  test_gcd_ext (t, 1071, 462)
  test_gcd_ext (t, -1071, -462)
  test_gcd_ext (t, -1071, 462)
  test_gcd_ext (t, -1071, 0)
  test_gcd_ext (t, 0, 123)
  test_gcd_ext (t, 0, -123)
})

function test_array_gcd_ext (t, array) {
  let res = int.array_gcd_ext (array)
  t.true (int.array_gcd_ext_p (array, res))
}

test ("array_gcd_ext", t => {
  test_array_gcd_ext (t, [12, 27, 18, 13])
  test_array_gcd_ext (t, [12, 27, 18, -13])
  test_array_gcd_ext (t, [12, 27, 18, -1])
})
