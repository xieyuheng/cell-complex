import * as cc from "../core"
import { nat } from "./nat"

export
function vect (): cc.module_t {
  return new cc.module_t ("vect")
    // .use (nat ())
    // .union ("vect_t", [
    //   "vect_null_t",
    //   "vect_cons_t",
    // ], {
    //   t: "type",
    //   length: "nat_t",
    // })
    // .record ("vect_null_t", {
    //   t: "type",
    //   length: "zero_t",
    // })
    // .record ("vect_cons_t", {
    //   "[implicit]" {
    //     n: "nat_t",
    //   },
    //   t: "type",
    //   length: apply ("succ_t", {
    //     prev: dot ("this", "n"),
    //   }),
    //   car: dot ("this", "t"),
    //   cdr: apply ("vect_t", {
    //     t: dot ("this", "t"),
    //     length: dot ("this", "n"),
    //   }),
    // })
}
