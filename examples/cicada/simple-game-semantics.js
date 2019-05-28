let cc = require ("../../lib/cicada/simple")

let bool_t = () => cc.union ("bool_t", [
  true_t, false_t
])

let true_t = () => cc.record ("true_t", {})

let false_t = () => cc.record ("false_t", {})

bool_t ()
  .info (0)
  .dot ("true_t") .info (1)

let f1_t = cc.arrow (
  {
    "x": bool_t (),
    "y": bool_t (),
  },
  bool_t (),
)

f1_t
  .info (0)
  .dot ("true_t") .info (1)
  .dot ("false_t") .info (2)
  .dot ("false_t") .info (3)

let nat_t = () => cc.union ("nat_t", [
  zero_t, succ_t
])

let zero_t = () => cc.record ("zero_t", {})

let succ_t = () => cc.record ("succ_t", {
  "prev": nat_t
})

console.log (nat_t () .eq (nat_t ()))

nat_t ()
  .info (0)
  .dot ("succ_t") .info (1)
  .dot ("prev") .info (2)
  .dot ("succ_t") .info (3)
  .dot ("prev") .info (4)
  .dot ("zero_t") .info (5)

let list_t = () => cc.union ("list_t", [
  null_t, cons_t
])

let null_t = () => cc.record ("null_t", { "t": cc.type })

let cons_t = () => cc.record ("cons_t", {
  "t": cc.type,
  "car": dot (self, "t"),
  "cdr": apply (list_t, [dot (self, "t")]),
  "cdr": apply (list_t, { "t": dot (self, "t") }),
})

// let list = new cc.module_t ("list")
//   .union ("list_t", [ "null_t", "cons_t" ], { "t": "type" })
//   .class ("null_t", { "t": "type" })
//   .class ("cons_t", {
//     "t": "type",
//     "car": "this.t", // "car": dot ("this", "t"),
//     "cdr": apply ("list_t", ["this.t"]),
//     "cdr": apply ("list_t", { "t": "this.t" }),
//   })
