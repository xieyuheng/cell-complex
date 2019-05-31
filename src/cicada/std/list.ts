import * as cc from "../core"

export
let list = new cc.module_t ("list")
// .union ("list_t", [ "null_t", "cons_t" ], { "t": "type" })
// .record ("null_t", { "t": "type" })
// TODO
//   .record ("cons_t", {
//     "t": "type",
//     "car": dot ("this", "t"),
//     "cdr": apply ("list_t", [ dot ("this", "t") ]),
//     "cdr": apply ("list_t", { "t": dot ("this", "t") }),
//   })
