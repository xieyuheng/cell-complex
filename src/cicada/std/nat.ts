import * as cc from "../core"

export
let nat = new cc.module_t ("nat")
  .union ("nat_t", [ "zero_t", "succ_t" ])
  .record ("zero_t", {})
  .record ("succ_t", { "prev": "nat_t" })

// nat.game ("nat_t") .info (0)
//   .choose (cc.path ([
//     cc.step.member ("succ_t")
//   ])) .info (1)
//   .choose (cc.path ([
//     cc.step.member ("succ_t"),
//     cc.step.field ("prev"),
//   ])) .info (2)
//   .choose (cc.path ([
//     cc.step.member ("succ_t"),
//     cc.step.field ("prev"),
//     cc.step.member ("succ_t"),
//   ])) .info (3)
//   .choose (cc.path ([
//     cc.step.member ("succ_t"),
//     cc.step.field ("prev"),
//     cc.step.member ("succ_t"),
//     cc.step.field ("prev"),
//   ])) .info (4)
//   .choose (cc.path ([
//     cc.step.member ("succ_t"),
//     cc.step.field ("prev"),
//     cc.step.member ("succ_t"),
//     cc.step.field ("prev"),
//     cc.step.member ("zero_t"),
//   ])) .info (5)
