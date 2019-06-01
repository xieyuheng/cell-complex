import * as ut from "../../util"
import * as cc from "../core"
import { union_t } from "../union"
import { record_t } from "../record"

export
function nat (): cc.module_t {
  let nat = new cc.module_t ("nat")
  nat.define ("nat_t", new union_t ("nat_t", ut.obj2map ({
    zero_t: nat.ref ("zero_t"),
    succ_t: nat.ref ("succ_t"),
  })))
  nat.define ("zero_t", new record_t ("zero_t", ut.obj2map ({})))
  nat.define ("succ_t", new record_t ("succ_t", ut.obj2map ({
    prev: nat.ref ("nat_t"),
  })))
  return nat

  // return new cc.module_t ("nat")
  //   .union ("nat_t", [ "zero_t", "succ_t" ])
  //   .record ("zero_t", {})
  //   .record ("succ_t", { prev: "nat_t" })
}
