import * as ut from "../../util"
import * as cc from "../core"
import { union_t } from "../union"
import { record_t } from "../record"
import { type_t } from "../type-of-type"
import { ref_t } from "../ref"

export
function list (): cc.module_t {
  let m = new cc.module_t ("list")
  m.define ("list_t", new union_t ("list_t", [
    new ref_t (m, "null_t"),
    new ref_t (m, "cons_t"),
  ]))
  m.define ("null_t", new record_t ("null_t", {
    t: new type_t (),
  }))
  m.define ("cons_t", new record_t ("cons_t", {
    t: new type_t (),
    car: new this_t ("t"),
    cdr: m.game ("list_t") .choices ({
      t: new this_t ("t"),
    }),
  }))
  m.define ("cons_t", new record_t ("cons_t", {
    t: new type_t (),
    car: new this_t ("t"),
    cdr: m.game ("list_t") .choices ({
      t: new this_t ("t"),
    }),
  }))
  return m
}
