import * as ut from "../../util"
import * as cc from "../core"
import { union_t } from "../union"
import { record_t } from "../record"
import { ref_t } from "../ref"

export
function nat (): cc.module_t {
  let m = new cc.module_t ("nat")
  m.define ("nat_t", new union_t ("nat_t", [
    new ref_t (m, "zero_t"),
    new ref_t (m, "succ_t"),
  ]))
  m.define ("zero_t", new record_t ("zero_t", {}))
  m.define ("succ_t", new record_t ("succ_t", {
    prev: new ref_t (m, "nat_t"),
  }))
  return m
}
