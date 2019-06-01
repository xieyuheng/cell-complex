import * as ut from "../../util"
import * as cc from "../core"
import { union_t } from "../union"
import { record_t } from "../record"
import { type_t } from "../type-of-type"

export
function list (): cc.module_t {
  let list = new cc.module_t ("list")
  // list.define ("list_t", new union_t ("list_t", {
  //   null_t: list.ref ("null_t"),
  //   cons_t: list.ref ("cons_t"),
  // }))
  // list.define ("null_t", new record_t ("null_t", {
  //   t: new type_t (),
  // }))
  // list.define ("cons_t", new record_t ("cons_t", {
  //   t: new type_t (),
  //   car: new dot_t (list.ref ("cons_t"), "t"),
  //   cdr: new record_t ("list_t", ut.obj2map ({
  //     t: new dot_t (list.ref ("cons_t"), "t"),
  //   })),
  // }))
  return list

  // return new cc.module_t ("list")
  //   .union ("list_t", [ "null_t", "cons_t" ], { "t": "type" })
  //   .record ("null_t", {
  //     t: "type",
  //   })
  //   .record ("cons_t", {
  //     t: "type",
  //     car: dot ($this, "t"),
  //     cdr: apply ("list_t", {
  //       t: dot ($this, "t"),
  //     }),
  //   })
}
