import * as cc from "./core"

/** 3.3 Example: Church Numerals */

export
let church = new cc.module_t ()

// (define church-zero
//  (lambda (f)
//   (lambda (x)
//    x)))

// (define church-add1
//  (lambda (prev)
//   (lambda (f)
//    (lambda (x)
//     (f ((prev f) x))))))

// (define church-add
//  (lambda (j)
//   (lambda (k)
//    (lambda (f)
//     (lambda (x)
//      ((j f) ((k f) x)))))))

// TODO
// parser for the following js-like syntax

// church_zero = (f) => (x) => x
// church_add1 = (prev) => (f) => (x) => f (prev (f) (x))
// church_add = (j) => (k) => (f) => (x) => j (f) (k (f) (x))

// with currying
// church_zero = (f, x) => x
// church_add1 = (prev, f, x) => f (prev (f, x))
// church_add = (j, k, f, x) => j (f, k (f, x))

church.define (
  "church_zero", new cc.lambda_t (
    "f", new cc.lambda_t (
      "x", new cc.var_t ("x")
    )
  )
)

church.define (
  "church_add1", new cc.lambda_t (
    "prev", new cc.lambda_t (
      "f", new cc.lambda_t (
        "x", new cc.apply_t (
          new cc.var_t ("f"),
          new cc.apply_t (
            new cc.apply_t (
              new cc.var_t ("prev"),
              new cc.var_t ("f"),
            ),
            new cc.var_t ("x"),
          )
        )
      )
    )
  )
)

church.define (
  "church_add", new cc.lambda_t (
    "j", new cc.lambda_t (
      "k", new cc.lambda_t (
        "f", new cc.lambda_t (
          "x", new cc.apply_t (
            new cc.apply_t (
              new cc.var_t ("j"),
              new cc.var_t ("f"),
            ),
            new cc.apply_t (
              new cc.apply_t (
                new cc.var_t ("k"),
                new cc.var_t ("f"),
              ),
              new cc.var_t ("x"),
            )
          )
        )
      )
    )
  )
)

export
function to_church (n: number): cc.exp_t {
  let exp: cc.exp_t = new cc.var_t ("church_zero")
  while (n > 0) {
    exp = new cc.apply_t (new cc.var_t ("church_add1"), exp)
    n -= 1
  }
  return exp
}

{
  new cc.module_t ()
    .use (church)
    .run (to_church (0))
    .run (to_church (1))
    .run (to_church (2))
    .run (to_church (3))
    .run (
      new cc.apply_t (
        new cc.apply_t (
          new cc.var_t ("church_add"),
          to_church (2),
        ),
        to_church (2),
      )
    )
}
