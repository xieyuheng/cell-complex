import * as cc from "./core"

export let MODULE = (
  env: cc.env_t = new cc.env_t ()
) => new cc.module_t (env)

export let VAR = (
  name: string
) => new cc.var_t (name)

export let LAMBDA = (
  name: string,
  body: cc.exp_t,
) => new cc.lambda_t (name, body)

export let APPLY = (
  rator: cc.exp_t,
  rand: cc.exp_t,
) => new cc.apply_t (rator, rand)
