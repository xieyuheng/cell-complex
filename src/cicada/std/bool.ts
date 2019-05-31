import * as cc from "../core"

export
let bool = new cc.module_t ("bool")
  .union ("bool_t", [ "true_t", "false_t" ])
  .record ("true_t", {})
  .record ("false_t", {})
