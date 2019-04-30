import test from "ava"

import * as ut from "../lib/util"
import * as int from "../lib/int"

test ("int.divmod", t => {
  t.deepEqual (int.divmod (BigInt (17), BigInt (4)), [BigInt (4), BigInt (1)])
  t.deepEqual (int.divmod (BigInt (19), BigInt (30)), [BigInt (0), BigInt (19)])
  t.deepEqual (int.divmod (BigInt (-17), BigInt (-10)), [BigInt (2), BigInt (3)])
  t.deepEqual (int.divmod (BigInt (7), BigInt (1)), [BigInt (7), BigInt (0)])
})

test ("gcd", t => {
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

test ("gcd_ext", t => {
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
