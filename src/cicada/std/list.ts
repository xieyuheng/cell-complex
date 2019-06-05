import * as ut from "../../util"
import * as cc from "../core"
import { union_builder_t } from "../union"
import { record_builder_t } from "../record"
import { type_t } from "../type-of-type"
import { ref_t } from "../ref"

let m = new cc.module_t ("list")

m.define ("list_t", new union_builder_t ("list_t", [
  new ref_t ("null_t"),
  new ref_t ("cons_t"),
], _map => ({
})))

m.define ("null_t", new record_builder_t ("null_t", _map => ({
  "t": new type_t (),
})))

// m.define ("cons_t", new record_builder_t ("cons_t", map => ({
//   "t": new type_t (),
//   "car": new this_t (map, "t"),
//   "cdr": m.game ("list_t") .choices ({
//     "t": new this_t (map, "t"),
//   }),
// })))

export { m as list }
