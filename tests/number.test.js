import test from "ava"

import * as ut from "@cicadoidea/basic/lib/util"
import * as num from "../lib/number"

test ("divmod", t => {
  t.deepEqual (num.divmod (17, 4), [4, 1])
  t.deepEqual (num.divmod (19, 30), [0, 19])
  t.deepEqual (num.divmod (-17, -10), [2, 3])
  t.deepEqual (num.divmod (7, 1), [7, 0])
})

test ("gcd", t => {
  t.true (num.gcd (6, 7) === 1)
  t.true (num.gcd (1, 7) === 1)
  t.true (num.gcd (0, 7) === 7)
  t.true (num.gcd (6, 6) === 6)
  t.true (num.gcd (1071, 462) === 21)
  t.true (num.gcd (1071, -462) === 21)
  t.true (num.gcd (-1071, 462) === 21)
})

test ("array_gcd", t => {
  t.true (num.array_gcd ([6, 7, 1]) === 1)
  t.true (num.array_gcd ([1, 7, 1]) === 1)
  t.true (num.array_gcd ([0, 7, 3]) === 1)
  t.true (num.array_gcd ([6, 6, 2]) === 2)
  t.true (num.array_gcd ([1071, 462, 20]) === 1)
  t.true (num.array_gcd ([1071, 462, 3]) === 3)
  t.true (num.array_gcd ([1071, -462, 15]) === 3)
  t.true (num.array_gcd ([-1071, 462, 11]) === 1)
})

function test_gcd_ext (t, x, y) {
  let res = num.gcd_ext (x, y)
  // ut.log ([x, y, res])
  t.true (num.gcd_ext_p (x, y, res))
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
  let res = num.array_gcd_ext (array)
  t.true (num.array_gcd_ext_p (array, res))
}

test ("array_gcd_ext", t => {
  test_array_gcd_ext (t, [12, 27, 18, 13])
  test_array_gcd_ext (t, [12, 27, 18, -13])
  test_array_gcd_ext (t, [12, 27, 18, -1])
})
