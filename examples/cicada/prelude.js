let cc = require ("../../lib/cicada/core")

let bool = new cc.module_t ("bool")
  .union ("bool_t", [ "true_t", "false_t" ])
  .record ("true_t", {})
  .record ("false_t", {})
  // .arrow ("f1", { "x": "bool_t", "y": "bool_t" }, "bool_t")

bool.game ("bool_t") .info (0)
  .choose (cc.path ([
    cc.step.member ("true_t")
  ])) .info (1)

// bool.game ("f1")
//   .choose (cc.path ([
//     cc.step.ante ("x"),
//     cc.step.member ("true_t"),
//   ]))
//   .choose (cc.path ([
//     cc.step.ante ("y"),
//     cc.step.member ("false_t"),
//   ]))
//   .choose (cc.path ([
//     cc.step.succ (),
//     cc.step.member ("false_t")
//   ]))

let nat = new cc.module_t ("nat")
  .union ("nat_t", [ "zero_t", "succ_t" ])
  .record ("zero_t", {})
  .record ("succ_t", { "prev": "nat_t" })

nat.game ("nat_t") .info (0)
  .choose (cc.path ([
    cc.step.member ("succ_t")
  ])) .info (1)
  .choose (cc.path ([
    cc.step.member ("succ_t"),
    cc.step.field ("prev"),
  ])) .info (2)
  .choose (cc.path ([
    cc.step.member ("succ_t"),
    cc.step.field ("prev"),
    cc.step.member ("succ_t"),
  ])) .info (3)
  .choose (cc.path ([
    cc.step.member ("succ_t"),
    cc.step.field ("prev"),
    cc.step.member ("succ_t"),
    cc.step.field ("prev"),
  ])) .info (4)
  .choose (cc.path ([
    cc.step.member ("succ_t"),
    cc.step.field ("prev"),
    cc.step.member ("succ_t"),
    cc.step.field ("prev"),
    cc.step.member ("zero_t"),
  ])) .info (5)

// let list = new cc.module_t ("list")
//   .union ("list_t", [ "null_t", "cons_t" ], { "t": "type" })
//   .record ("null_t", { "t": "type" })
//   .record ("cons_t", {
//     "t": "type",
//     "car": dot ("this", "t"),
//     "cdr": apply ("list_t", [ dot ("this", "t") ]),
//     "cdr": apply ("list_t", { "t": dot ("this", "t") }),
//   })
