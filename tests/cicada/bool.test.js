import test from "ava"

import * as cc from "../../lib/cicada/core"
import * as ut from "../../lib/util"

import * as prelude from "../../lib/cicada/prelude"

test ("bool_t", t => {
  prelude.bool
    .game ("bool_t") .info (0)
    .choose (cc.path ([
      cc.step.member ("true_t")
    ])) .info (1)

  t.pass ()
})

test ("arraw_t", t => {
  prelude.bool
    .game ("f1") .info (0)
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
