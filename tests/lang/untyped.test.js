import test from "ava"
import * as ut from "../../lib/util"
import { result_t, ok_t, err_t } from "../../lib/result"
import * as cc from "../../lib/lang/untyped/core"
import {
  MODULE,
  VAR, LAMBDA, APPLY,
} from "../../lib/lang/untyped/syntax"

test ("exp.eval", t => {
  LAMBDA (
    "x", LAMBDA (
      "y", VAR ("y")
    )
  ) .eval ()

  APPLY (
    LAMBDA ("x", VAR ("x")),
    LAMBDA ("x", VAR ("x")),
  ) .eval ()

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
    ) .eval (),
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
  let m = MODULE ()
  m.define ("id", LAMBDA ("x", VAR ("x")))
  m.run (VAR ("id"))
  m.run (LAMBDA ("x", VAR ("x")))

  t.pass ()
})

test ("church", t => {
  MODULE ()
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
