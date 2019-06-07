import test from "ava"

import * as cc from "../../lib/NbE/untyped-lambda-calculus"
import * as ut from "../../lib/util"

test ("exp.eval", t => {
  {
    let exp = new cc.lambda_t ("x", new cc.lambda_t ("y", new cc.var_t ("y")))
    let val = exp.eval (new cc.env_t (new Map ()))
    // console.log (val)
  }

  {
    let exp = new cc.apply_t (
      new cc.lambda_t ("x", new cc.var_t ("x")),
      new cc.lambda_t ("x", new cc.var_t ("x")),
    )
    let val = exp.eval (new cc.env_t (new Map ()))
    // console.log (val)
  }

  t.pass ()
})

test ("module.define", t => {
  {
    let m = new cc.module_t (new cc.env_t (new Map ()))
    m.define ("id", new cc.lambda_t ("x", new cc.var_t ("x")))
    m.run (new cc.var_t ("id"))
  }

  t.pass ()
})

test ("freshen", t => {
  let x = "x"

  t.deepEqual (
    cc.freshen (new Set (["x", "x*"]), x),
    "x**",
  )

  t.pass ()
})

test ("read_back", t => {
  // ((λ (x) (λ (y) (x y))) (λ (x) x))
  // (λ (y) y)

  let exp = cc.read_back (
    new Set (),
    new cc.apply_t (
      new cc.lambda_t ("x", new cc.lambda_t ("y", new cc.apply_t (
        new cc.var_t ("x"),
        new cc.var_t ("y"),
      ))),
      new cc.lambda_t ("x", new cc.var_t ("x")),
    ) .eval (new cc.env_t (new Map ())),
  )

  ut.log (exp)

  t.pass ()
})
