import test from "ava"

import * as cc from "../../lib/cicada/core"
import * as ut from "../../lib/util"

import * as prelude from "../../lib/cicada/prelude"
import { pi_t } from "../../lib/cicada/pi"

test ("bool_t", t => {
  prelude.bool ()
    .game ("bool_t") .info (0)
    .choose (cc.path ([
      cc.step.member ("true_t")
    ])) .info (1)

  t.pass ()
})

test ("f1_t", t => {
  let m = prelude.bool ()

  m.define ("f1_t", new pi_t ({
    "x": m.ref ("bool_t") .deref (),
    "y": m.ref ("bool_t") .deref (),
  }, m.ref ("bool_t") .deref ()))

  m.game ("f1_t") .info (0)
    .choose (cc.path ([
      cc.step.arg ("x"),
      cc.step.member ("true_t"),
    ])) .info (1)
    .choose (cc.path ([
      cc.step.arg ("y"),
      cc.step.member ("false_t"),
    ])) .info (2)
    .choose (cc.path ([
      cc.step.ret (),
      cc.step.member ("false_t")
    ])) .info (3)

  t.pass ()
})
