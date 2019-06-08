import test from "ava"

import * as cc from "../../lib/lang/untyped"
import * as ut from "../../lib/util"

import {
  result_t, ok_t, err_t,
} from "../../lib/prelude"


test ("exp.eval", t => {
  {
    let exp = new cc.lambda_t ("x", new cc.lambda_t ("y", new cc.var_t ("y")))
    let val = exp.eval (new cc.env_t ())
    // console.log (val)
  }

  {
    let exp = new cc.apply_t (
      new cc.lambda_t ("x", new cc.var_t ("x")),
      new cc.lambda_t ("x", new cc.var_t ("x")),
    )
    let val = exp.eval (new cc.env_t ())
    // console.log (val)
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
  // ((lambda (x) (lambda (y) (x y))) (lambda (x) x))
  // (lambda (y) y)

  let exp = cc.read_back (
    new Set (),
    new cc.apply_t (
      new cc.lambda_t ("x", new cc.lambda_t ("y", new cc.apply_t (
        new cc.var_t ("x"),
        new cc.var_t ("y"),
      ))),
      new cc.lambda_t ("x", new cc.var_t ("x")),
    ) .eval (new cc.env_t ()),
  )

  t.true (
    exp.eq (
      new cc.lambda_t ("y", new cc.var_t ("y"))
    )
  )
})

test ("normalize", t => {
  // ((lambda (x) (lambda (y) (x y))) (lambda (x) x))
  // (lambda (y) y)

  let exp = cc.normalize (
    new cc.env_t (),
    new cc.apply_t (
      new cc.lambda_t ("x", new cc.lambda_t ("y", new cc.apply_t (
        new cc.var_t ("x"),
        new cc.var_t ("y"),
      ))),
      new cc.lambda_t ("x", new cc.var_t ("x")),
    ),
  )

  t.true (
    exp.eq (
      new cc.lambda_t ("y", new cc.var_t ("y"))
    )
  )
})

test ("module.define", t => {
  {
    let m = new cc.module_t ()
    m.define ("id", new cc.lambda_t ("x", new cc.var_t ("x")))
    m.run (new cc.var_t ("id"))
    m.run (new cc.lambda_t ("x", new cc.var_t ("x")))
  }

  t.pass ()
})

test ("church", t => {
  new cc.module_t ()
    .use (cc.church)
    .run (cc.to_church (0))
    .run (cc.to_church (1))
    .run (cc.to_church (2))
    .run (cc.to_church (3))
    .run (
      new cc.apply_t (
        new cc.apply_t (
          new cc.var_t ("church_add"),
          cc.to_church (2),
        ),
        cc.to_church (2),
      )
    )

  t.pass ()
})
