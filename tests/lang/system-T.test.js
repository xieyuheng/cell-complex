import test from "ava"
import * as ut from "../../lib/util"
import { result_t, ok_t, err_t } from "../../lib/result"
import * as cc from "../../lib/lang/system-T"
import {
  VAR, LAMBDA, APPLY,
} from "../../lib/lang/system-T"

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

test ("exp.synth", t => {
  let ctx = new cc.ctx_t ()
    .ext ("x", new cc.nat_t ())

  t.deepEqual (
    VAR ("x") .synth (ctx),
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
    LAMBDA ("x", VAR ("x"))
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
    LAMBDA (
      "j", LAMBDA (
        "k", new cc.rec_nat_t (
          new cc.nat_t (),
          VAR ("j"),
          VAR ("k"),
          LAMBDA (
            "prev", LAMBDA (
              "sum", new cc.add1_t (VAR ("sum"))
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

test ("module.define", t => {
  // ((define three
  //   (the Nat
  //    (add1 (add1 (add1 zero)))))
  //  (define +
  //   (the (-> Nat (-> Nat Nat))
  //    (lambda (n)
  //     (lambda (k)
  //      (rec Nat n
  //       k
  //       (lambda (pred)
  //        (lambda (almost-sum)
  //         (add1 almost-sum))))))))
  //  (+ three)
  //  ((+ three) three))
  let m = new cc.module_t ()

  m.claim (
    "three",
    new cc.nat_t (),
  )
  m.define (
    "three",
    new cc.add1_t (
      new cc.add1_t (
        new cc.add1_t (
          new cc.zero_t ()
        )
      )
    )
  )

  m.claim (
    "+",
    new cc.arrow_t (
      new cc.nat_t (),
      new cc.arrow_t (
        new cc.nat_t (),
        new cc.nat_t (),
      )
    )
  )
  m.define (
    "+",
    LAMBDA (
      "n", LAMBDA (
        "k", new cc.rec_nat_t (
          new cc.nat_t (),
          VAR ("k"),
          LAMBDA (
            "prev", LAMBDA (
              "almost", APPLY (
                new cc.add1_t (VAR ("almost"))
              )
            )
          )
        )
      )
    )
  )

  m.synth (
    APPLY (
      VAR ("+"),
      VAR ("three"),
    )
  )

  m.synth (
    APPLY (
      APPLY (
        VAR ("+"),
        VAR ("three"),
      ),
      VAR ("three"),
    )
  )

  // m.run (VAR ("id"))
  // m.run (LAMBDA ("x", VAR ("x")))

  t.pass ()
})
