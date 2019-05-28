let cc = require ("../../lib/cicada/simple")

let true_t = cc.record ("true_t", {})
let false_t = cc.record ("false_t", {})
let bool_t = cc.union ("bool_t", [ true_t, false_t ])

bool_t
  .info (0)
  .dot ("true_t") .info (1)

let f1_t = cc.arrow ({
  "x": bool_t, "y": bool_t
}, bool_t)

f1_t
  .info (0)
  .dot ("true_t") .info (1)
  .dot ("false_t") .info (2)
  .dot ("false_t") .info (3)

let bool = new cc.module_t ("bool")
  .union ("bool_t", [ "true_t", "false_t" ])
  .class ("true_t")
  .class ("false_t")

let nat = new cc.module_t ("nat")
  .union ("nat_t", [ "zero_t", "succ_t" ])
  .class ("zero_t")
  .class ("succ_t", { "prev": "nat_t" })

let list = new cc.module_t ("list")
  .union ("list_t", [ "null_t", "cons_t" ], { "t": "type" })
  .class ("null_t", { "t": "type" })
  .class ("cons_t", {
    "t": "type",
    "car": "this.t", // "car": dot ("this", "t"),
    "cdr": apply ("list_t", ["this.t"]),
    "cdr": apply ("list_t", { "t": "this.t" }),
  })
