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

// TODO need a module for recursive definitions

let bool = new module_t ("bool")
  .define_union ("bool_t", [ "true_t", "false_t" ])
  .define_class ("true_t")
  .define_class ("false_t")

let nat = new module_t ("nat")
  .define_union ("nat_t", [ "zero_t", "succ_t" ])
  .define_class ("zero_t")
  .define_class ("succ_t", { "prev": "nat_t" })

let list = new module_t ("list")
  .define_union ("list_t", [ "null_t", "cons_t" ], { "t": "type" })
  .define_class ("null_t", { "t": "type" })
  .define_class ("cons_t", {
    "t": "type",
    "car": "this.t",
    "cdr": ["list_t", "this.t"],
  })

let list = new module_t ("list")
  .define_union ("list_t", [ "null_t", "cons_t" ], { "t": "type" })
  .define_class ("null_t", { "t": "type" })
  .define_class ("cons_t", {
    "t": "type",
    "car": ["dot" "this", "t"],
    "cdr": ["type_cons", "list_t", ["dot" "this", "t"]],
    "cdr": ["list_t", ["dot" "this", "t"]],
  })
