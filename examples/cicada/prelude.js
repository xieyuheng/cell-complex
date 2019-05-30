let cc = require ("../../lib/cicada/core")

let bool = new cc.module_t ("bool")
  .union ("bool_t", [ "true_t", "false_t" ])
  .record ("true_t", {})
  .record ("false_t", {})
  .arrow ("f1", {
    "x": "bool_t",
    "y": "bool_t",
  }, "bool_t")

bool.game ("bool_t") .info (0)
  .choose (cc.dot ("true_t")) .info (1)

bool.game ("f1") .info (0)
  .choose (cc.dot ("true_t")) .info (1)
  .choose (cc.dot ("false_t")) .info (2)
  .choose (cc.dot ("false_t")) .info (3)

let nat = new cc.module_t ("nat")
  .union ("nat_t", [ "zero_t", "succ_t" ])
  .record ("zero_t", {})
  .record ("succ_t", { "prev": "nat_t" })

nat.game ("nat_t") .info (0)
  .choose (cc.dot ("succ_t")) .info (1)
  .choose (cc.dot ("prev")) .info (2)
  .choose (cc.dot ("succ_t")) .info (3)
  .choose (cc.dot ("prev")) .info (4)
  .choose (cc.dot ("zero_t")) .info (5)

// let list = new cc.module_t ("list")
//   .union ("list_t", [ "null_t", "cons_t" ], { "t": "type" })
//   .record ("null_t", { "t": "type" })
//   .record ("cons_t", {
//     "t": "type",
//     "car": "this.t", // "car": dot ("this", "t"),
//     "cdr": apply ("list_t", ["this.t"]),
//     "cdr": apply ("list_t", { "t": "this.t" }),
//   })
