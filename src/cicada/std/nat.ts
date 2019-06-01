import * as ut from "../../util"
import * as cc from "../core"
import { union_t } from "../union"
import { record_t } from "../record"

export
function nat (): cc.module_t {
  let m = new cc.module_t ("nat")
  m.define ("nat_t", new union_t ("nat_t", {
    zero_t: m.ref ("zero_t"),
    succ_t: m.ref ("succ_t"),
  }))
  m.define ("zero_t", new record_t ("zero_t", {}))
  m.define ("succ_t", new record_t ("succ_t", {
    prev: m.ref ("nat_t"),
  }))
  return m

  // return new cc.module_t ("nat")
  //   .union ("nat_t", [ "zero_t", "succ_t" ])
  //   .record ("zero_t", {})
  //   .record ("succ_t", { prev: "nat_t" })
}
