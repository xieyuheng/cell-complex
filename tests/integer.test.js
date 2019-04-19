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

test ("gcd_of_array", t => {
  t.true (int.gcd_of_array ([6, 7, 1]) === 1)
  t.true (int.gcd_of_array ([1, 7, 1]) === 1)
  t.true (int.gcd_of_array ([0, 7, 3]) === 1)
  t.true (int.gcd_of_array ([6, 6, 2]) === 2)
  t.true (int.gcd_of_array ([1071, 462, 20]) === 1)
  t.true (int.gcd_of_array ([1071, 462, 3]) === 3)
  t.true (int.gcd_of_array ([1071, -462, 15]) === 3)
  t.true (int.gcd_of_array ([-1071, 462, 11]) === 1)
})

function test_extended_gcd (t, x, y) {
  let res = int.extended_gcd (x, y)
  // ut.log ([x, y, res])
  t.true (int.extended_gcd_p (x, y, res))
}

test ("extended_gcd", t => {
  test_extended_gcd (t, 6, 7)
  test_extended_gcd (t, 1, 7)
  test_extended_gcd (t, 0, 7)
  test_extended_gcd (t, 6, 6)
  test_extended_gcd (t, 1071, 462)
  test_extended_gcd (t, -1071, -462)
  test_extended_gcd (t, -1071, 462)
  test_extended_gcd (t, -1071, 0)
  test_extended_gcd (t, 0, 123)
  test_extended_gcd (t, 0, -123)
})
