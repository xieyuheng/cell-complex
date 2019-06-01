import * as cc from "../core"

export
function nat (): cc.module_t {
  return new cc.module_t ("nat")
    .union ("nat_t", [ "zero_t", "succ_t" ])
    .record ("zero_t", {})
    .record ("succ_t", { "prev": "nat_t" })
}
