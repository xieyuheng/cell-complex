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
  .dot ("true_t") .info (1)

bool.game ("f1") .info (0)
  .dot ("true_t") .info (1)
  .dot ("false_t") .info (2)
  .dot ("false_t") .info (3)

// let zero_t = () => cc.record ("zero_t", {})

// let succ_t = () => cc.record ("succ_t", {
//   "prev": cc.pause (nat_t)
// })

// let nat_t = () => cc.union ("nat_t", [
//   zero_t (), succ_t ()
// ])

// nat_t ()
//   .info (0)
//   .dot ("succ_t") .info (1)
//   .dot ("prev") .info (2)
//   .dot ("succ_t") .info (3)
//   .dot ("prev") .info (4)
//   .dot ("zero_t") .info (5)

// let list_t = () => cc.union ("list_t", [
//   null_t, cons_t
// ])

// let null_t = () => cc.record ("null_t", { "t": cc.type })

// let cons_t = () => cc.record ("cons_t", {
//   "t": cc.type,
//   // TODO `self` `dot` `apply`
//   "car": dot (self, "t"),
//   "cdr": apply (list_t, [ dot (self, "t") ]),
//   "cdr": apply (list_t, { "t": dot (self, "t") }),
// })

// let list = new cc.module_t ("list")
//   .union ("list_t", [ "null_t", "cons_t" ], { "t": "type" })
//   .record ("null_t", { "t": "type" })
//   .record ("cons_t", {
//     "t": "type",
//     "car": "this.t", // "car": dot ("this", "t"),
//     "cdr": apply ("list_t", ["this.t"]),
//     "cdr": apply ("list_t", { "t": "this.t" }),
//   })
