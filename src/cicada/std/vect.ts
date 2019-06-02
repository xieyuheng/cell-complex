import * as ut from "../../util"
import * as cc from "../core"
import { type_t } from "../type-of-type"
import { ref_t } from "../ref"
import { nat } from "./nat"

export
function vect (): cc.module_t {
  let m = new cc.module_t ("vect")
//   m.use (nat ())
//   m.define ("vect_t", new union_t ("vect_t", {
//     vect_null_t: new ref_t (m, "vect_null_t"),
//     vect_cons_t: new ref_t (m, "vect_cons_t"),
//   }))
//   m.define ("vect_null_t", new record_t ("vect_null_t", {
//     t: new type_t (),
//     length: new ref_t (m, "zero_t"),
//   }))
//   m.define ("vect_cons_t", new record_t ("vect_cons_t", {
//     [implicit]: {
//       n: new ref_t (m, "nat_t"),
//     },
//     t: new type_t (),
//     length: new record_t ("succ_t", {
//       prev: new dot_t ("this", "n"),
//       prev: new this_t ("n"),
//     }),
//     car: new dot_t ("this", "t"),
//     cdr: new record_t ("vect_t", {
//       t: new dot_t ("this", "t"),
//       length: new dot_t ("this", "n"),
//     }),
//   }))
  return m
}
