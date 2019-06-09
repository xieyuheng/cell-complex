import * as cc from "./core"

export let MODULE = (
  env: cc.env_t = new cc.env_t (),
  ctx: cc.ctx_t = new cc.ctx_t (),
) => new cc.module_t (env, ctx)

export let VAR = (
  name: string,
) => new cc.var_t (name)

export let LAMBDA = (
  name: string,
  body: cc.exp_t,
) => new cc.lambda_t (name, body)

export let APPLY = (
  rator: cc.exp_t,
  rand: cc.exp_t,
) => new cc.apply_t (rator, rand)

export let ZERO = new cc.zero_t ()

export let ADD1 = (
  prev: cc.exp_t,
) => new cc.add1_t (prev)

export let THE = (
  t: cc.type_t,
  exp: cc.exp_t,
) => new cc.the_t (t, exp)

export let REC_NAT = (
  t: cc.type_t,
  target: cc.exp_t,
  base: cc.exp_t,
  step: cc.exp_t,
) => new cc.rec_nat_t (t, target, base, step)

export let NAT = new cc.nat_t ()

export let ARROW = (
  arg: cc.type_t,
  ret: cc.type_t,
) => new cc.arrow_t (arg, ret)
