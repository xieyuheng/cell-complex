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
  let bool = prelude.bool ()

  bool
    .pi ("f1_t", { "x": "bool_t", "y": "bool_t" }, "bool_t")

  // bool
  //   .define ("f1_t", new pi_t (ut.obj2map ({
  //     "x": bool.ref ("bool_t") .deref (),
  //     "y": bool.ref ("bool_t") .deref (),
  //   }), bool.ref ("bool_t") .deref ()))

  bool
    .game ("f1_t") .info (0)
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
