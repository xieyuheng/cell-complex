import * as cc from "../core"

export
let nat = new cc.module_t ("nat")
  .union ("nat_t", [ "zero_t", "succ_t" ])
  .record ("zero_t", {})
  .record ("succ_t", { "prev": "nat_t" })
