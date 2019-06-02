import * as ut from "../../util"
import * as cc from "../core"
import { ref_t } from "../ref"
import { union_t } from "../union"
import { record_t } from "../record"

export
function bool (): cc.module_t {
  let m = new cc.module_t ("bool")
  m.define ("bool_t", new union_t ("bool_t", [
    new ref_t (m, "true_t"),
    new ref_t (m, "false_t"),
  ]))
  m.define ("true_t", new record_t ("true_t", {}))
  m.define ("false_t", new record_t ("false_t", {}))
  return m
}
