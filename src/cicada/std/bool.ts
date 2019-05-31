import * as cc from "../core"

export
let bool = new cc.module_t ("bool")
  .union ("bool_t", [ "true_t", "false_t" ])
  .record ("true_t", {})
  .record ("false_t", {})
  .arrow ("f1", { "x": "bool_t", "y": "bool_t" }, "bool_t")

// bool.game ("bool_t") .info (0)
//   .choose (cc.path ([
//     cc.step.member ("true_t")
//   ])) .info (1)

// bool.game ("f1") .info (0)
//   .choose (cc.path ([
//     cc.step.arg ("x"),
//     cc.step.member ("true_t"),
//   ])) .info (1)
//   .choose (cc.path ([
//     cc.step.arg ("y"),
//     cc.step.member ("false_t"),
//   ])) .info (2)
//   .choose (cc.path ([
//     cc.step.ret (),
//     cc.step.member ("false_t")
//   ])) .info (3)
