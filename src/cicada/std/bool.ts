import * as cc from "../core"

export
function bool (): cc.module_t {
  return new cc.module_t ("bool")
    .union ("bool_t", [ "true_t", "false_t" ])
    .record ("true_t", {})
    .record ("false_t", {})
}
