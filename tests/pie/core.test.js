import test from "ava"

import * as cc from "../../lib/pie/core"
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

test ("module.define", t => {
  {
    let m = new cc.module_t ()
    m.define ("id", new cc.lambda_t ("x", new cc.var_t ("x")))
    m.run (new cc.var_t ("id"))
    m.run (new cc.lambda_t ("x", new cc.var_t ("x")))
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

test ("exp.synth", t => {
  let ctx = new cc.ctx_t ()
    .ext ("x", new cc.nat_t ())

  t.deepEqual (
    new cc.var_t ("x") .synth (ctx),
    new ok_t (new cc.nat_t ()),
  )
})

test ("exp.check", t => {
  t.deepEqual (
    new cc.zero_t ()
      .check (
        new cc.ctx_t (),
        new cc.nat_t (),
      ),
    new ok_t ("ok"),
  )

  t.deepEqual (
    new cc.add1_t (new cc.zero_t ())
      .check (
        new cc.ctx_t (),
        new cc.nat_t (),
      ),
    new ok_t ("ok"),
  )

  t.deepEqual (
    new cc.lambda_t ("x", new cc.var_t ("x"))
      .check (
        new cc.ctx_t (),
        new cc.arrow_t (
          new cc.nat_t (),
          new cc.nat_t (),
        ),
      ),
    new ok_t ("ok"),
  )

  // (lambda (j)
  //  (lambda (k)
  //   (rec Nat j k (lambda (n-1)
  //                 (lambda (sum)
  //                  (add1 sum))))))
  // (-> Nat (-> Nat Nat))

  t.deepEqual (
    new cc.lambda_t (
      "j", new cc.lambda_t (
        "k", new cc.rec_nat_t (
          new cc.nat_t (),
          new cc.var_t ("j"),
          new cc.var_t ("k"),
          new cc.lambda_t (
            "prev", new cc.lambda_t (
              "sum", new cc.add1_t (new cc.var_t ("sum"))
            )
          )
        )
      )
    ) .check (
      new cc.ctx_t (),
      new cc.arrow_t (
        new cc.nat_t (),
        new cc.arrow_t (
          new cc.nat_t (),
          new cc.nat_t (),
        ),
      ),
    ),
    new ok_t ("ok"),
  )

  t.pass ()
})