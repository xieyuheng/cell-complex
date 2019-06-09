import test from "ava"
import * as ut from "../../lib/util"
import { result_t, ok_t, err_t } from "../../lib/result"
import * as cc from "../../lib/lang/system-T"
import {
  VAR, LAMBDA, APPLY,
  ZERO, ADD1, THE, REC_NAT,
  NAT, ARROW,
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
    .ext ("x", NAT)

  t.deepEqual (
    VAR ("x") .synth (ctx),
    new ok_t (NAT),
  )
})

test ("exp.check", t => {
  t.deepEqual (
    ZERO
      .check (
        new cc.ctx_t (),
        NAT,
      ),
    new ok_t ("ok"),
  )

  t.deepEqual (
    ADD1 (ZERO)
      .check (
        new cc.ctx_t (),
        NAT,
      ),
    new ok_t ("ok"),
  )

  t.deepEqual (
    LAMBDA ("x", VAR ("x"))
      .check (
        new cc.ctx_t (),
        ARROW (
          NAT,
          NAT,
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
        "k", REC_NAT (
          NAT,
          VAR ("j"),
          VAR ("k"),
          LAMBDA (
            "prev", LAMBDA (
              "sum", ADD1 (VAR ("sum"))
            )
          )
        )
      )
    ) .check (
      new cc.ctx_t (),
      ARROW (
        NAT,
        ARROW (
          NAT,
          NAT,
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
    NAT,
  )
  m.define (
    "three",
    ADD1 (
      ADD1 (
        ADD1 (
          ZERO
        )
      )
    )
  )

  m.claim (
    "+",
    ARROW (
      NAT,
      ARROW (
        NAT,
        NAT,
      )
    )
  )
  m.define (
    "+",
    LAMBDA (
      "n", LAMBDA (
        "k", REC_NAT (
          NAT,
          VAR ("n"),
          VAR ("k"),
          LAMBDA (
            "prev", LAMBDA (
              "almost",
              ADD1 (VAR ("almost")),
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

  m.run (
    APPLY (
      VAR ("+"),
      VAR ("three"),
    )
  )

  m.run (
    APPLY (
      APPLY (
        VAR ("+"),
        VAR ("three"),
      ),
      VAR ("three"),
    )
  )

  t.pass ()
})
