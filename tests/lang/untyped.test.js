import test from "ava"

import * as cc from "../../lib/lang/untyped"
import * as ut from "../../lib/util"

import {
  VAR, LAMBDA, APPLY,
} from "../../lib/lang/untyped"

import { result_t, ok_t, err_t } from "../../lib/result"

test ("exp.eval", t => {
  LAMBDA (
    "x", LAMBDA (
      "y", VAR ("y")
    )
  ) .eval (new cc.env_t ())

  APPLY (
    LAMBDA ("x", VAR ("x")),
    LAMBDA ("x", VAR ("x")),
  ) .eval (new cc.env_t ())

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
    APPLY (
      LAMBDA ("x", LAMBDA ("y", APPLY (
        VAR ("x"),
        VAR ("y"),
      ))),
      LAMBDA ("x", VAR ("x")),
    ) .eval (new cc.env_t ()),
  )

  t.true (
    exp.eq (
      LAMBDA ("y", VAR ("y"))
    )
  )
})

test ("normalize", t => {
  // ((lambda (x) (lambda (y) (x y))) (lambda (x) x))
  // (lambda (y) y)

  let exp = cc.normalize (
    new cc.env_t (),
    APPLY (
      LAMBDA ("x", LAMBDA ("y", APPLY (
        VAR ("x"),
        VAR ("y"),
      ))),
      LAMBDA ("x", VAR ("x")),
    ),
  )

  t.true (
    exp.eq (
      LAMBDA ("y", VAR ("y"))
    )
  )
})

test ("module.define", t => {
  {
    let m = new cc.module_t ()
    m.define ("id", LAMBDA ("x", VAR ("x")))
    m.run (VAR ("id"))
    m.run (LAMBDA ("x", VAR ("x")))
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
      APPLY (
        APPLY (
          VAR ("church_add"),
          cc.to_church (2),
        ),
        cc.to_church (2),
      )
    )

  t.pass ()
})
