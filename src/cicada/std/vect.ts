import * as cc from "../core"
import { type_t } from "../type-of-type"
import { nat } from "./nat"

export
function vect (): cc.module_t {
  let m = new cc.module_t ("vect")
  //   m.use (nat ())
  //   m.define ("vect_t", new union_t ("vect_t", {
  //     vect_null_t: m.ref ("vect_null_t"),
  //     vect_cons_t: m.ref ("vect_cons_t"),
  //   }))
  //   m.define ("vect_null_t", new record_t ("vect_null_t", {
  //     t: new type_t (),
  //     length: m.ref ("zero_t"),
  //   }))
  //   m.define ("vect_cons_t", new record_t ("vect_cons_t", {
  //     "[implicit]" {
  //       n: m.ref ("nat_t"),
  //     },
  //     t: "type",
  //     length: apply ("succ_t", {
  //       prev: dot ("this", "n"),
  //     }),
  //     car: dot ("this", "t"),
  //     cdr: apply ("vect_t", {
  //       t: dot ("this", "t"),
  //       length: dot ("this", "n"),
  //     }),
  //   }))
  return m
}
