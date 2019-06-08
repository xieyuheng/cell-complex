import assert from "assert"
import * as ut from "../util"

import {
  result_t, ok_t, err_t,
} from "../prelude"

/**
 * Checking Dependent Types
 *   with Normalization by Evaluation: A Tutorial
 * - by David Thrane Christiansen
 * - http://davidchristiansen.dk/tutorials/nbe/
 */

/** 1 Evaluating Untyped λ-Calculus */

/**
 * Writing an evaluator requires the following steps:
 * - Identify the values that are to be the result of evaluation
 * - Figure out which expressions become values immediately,
 *   and which require computation
 * - Implement `classes` for the values,
 *   and use function for computation
 */

/** 1.1 Values and Runtime Environments */

export
type value_t = closure_t | neutral_t

/**
 * Runtime environments provide the values for each variable.
 */
export
class env_t {
  map: Map <string, value_t>

  constructor (
    map: Map <string, value_t> = new Map ()
  ) {
    this.map = map
  }

  find (name: string): value_t | undefined {
    return this.map.get (name)
  }

  copy (): env_t {
    return new env_t (new Map (this.map))
  }

  ext (name: string, value: value_t): env_t {
    return new env_t (
      new Map (this.map)
        .set (name, value)
    )
  }
}

/** 1.2 The Evaluator */

/**
 * A closure packages an expression
 *   that has not yet been evaluated
 * with the run-time environment
 *   in which the expression was created.
 * Here, closures always represent expressions with a variable
 *   that will be instantiated with a value,
 *   so these closures additionally have the `name` field.
 */
export
class closure_t {
  env: env_t
  name: string
  body: exp_t

  constructor (
    env: env_t,
    name: string,
    body: exp_t,
  ) {
    this.env = env
    this.name = name
    this.body = body
  }

  apply (arg: value_t): value_t {
    return this.body.eval (
      this.env.ext (this.name, arg)
    )
  }
}

/**
 * The evaluator consists of two procedures:
 * `exp.eval (env)`
 *   evaluates an expression in a run-time environment that
 *   provides values for its free variables,
 * `closure.apply (arg)`
 *   for applying the value of a function
 *   to the value of its argument
 */
export
abstract class exp_t {
  kind: "exp_t" = "exp_t"

  abstract eq (that: exp_t): boolean
  abstract eval (env: env_t): value_t

  synth (ctx: ctx_t): result_t <type_t, string> {
    return new err_t (
      `synth is not implemented for type: ${this.constructor.name}`
    )
  }

  check (ctx: ctx_t, t: type_t): result_t <"ok", string> {
    return this.synth (ctx) .bind (t2 => {
      if (t2.eq (t)) {
        return result_t.pure ("ok")
      } else {
        return new err_t (
          `check is not implemented for type: ${this.constructor.name}`
        )
      }
    })
  }
}

export
class lambda_t extends exp_t {
  name: string
  body: exp_t

  constructor (
    name: string,
    body: exp_t,
  ) {
    super ()
    this.name = name
    this.body = body
  }

  eq (that: exp_t): boolean {
    return that instanceof lambda_t
      && this.name === that.name
      && this.body.eq (that.body)
  }

  eval (env: env_t): closure_t {
    return new closure_t (env, this.name, this.body)
  }

  check (ctx: ctx_t, t: type_t): result_t <"ok", string> {
    if (t instanceof arrow_t) {
      let arrow = t
      return this.body.check (
        ctx.ext (this.name, arrow.arg),
        arrow.ret,
      )
    } else {
      return new err_t (
        `type of lambda is not arrow_t, bound name: ${this.name}`
      )
    }
  }
}

export
class var_t extends exp_t {
  name: string

  constructor (name: string) {
    super ()
    this.name = name
  }

  eq (that: exp_t): boolean {
    return that instanceof var_t
      && this.name === that.name
  }

  eval (env: env_t): value_t {
    let found = env.find (this.name)
    if (found !== undefined) {
      let value = found
      return value
    } else {
      throw new Error (
        `undefined name: ${this.name}`
      )
    }
  }

  synth (ctx: ctx_t): result_t <type_t, string> {
    let t = ctx.find (this.name)
    return t !== undefined
      ? result_t.pure (t)
      : new err_t (
        "can not find var in ctx"
      )
  }
}

export
class apply_t extends exp_t {
  rator: exp_t
  rand: exp_t

  constructor (
    rator: exp_t,
    rand: exp_t,
  ) {
    super ()
    this.rator = rator
    this.rand = rand
  }

  eq (that: exp_t): boolean {
    return that instanceof apply_t
      && this.rator.eq (that.rator)
      && this.rand.eq (that.rand)
  }

  eval (env: env_t): value_t {
    let fun = this.rator.eval (env)
    let arg = this.rand.eval (env)
    if (fun instanceof closure_t) {
      let closure = fun
      return closure.apply (arg)
    } else if (fun instanceof neutral_t) {
      let neutral_fun = fun
      return new neutral_apply_t (neutral_fun, arg)
    } else {
      throw new Error (
        `unknown fun value: ${fun}`
      )
    }
  }

  synth (ctx: ctx_t): result_t <type_t, string> {
    return this.rator.synth (ctx)
      .bind (rator_type => {
        if (rator_type instanceof arrow_t) {
          return this.rand.check (ctx, rator_type.arg)
            .bind (_ => {
              return result_t.pure (rator_type.ret)
            })
        } else {
          return new err_t (
            "rator type is not arrow_t"
          )
        }
      })
  }
}

/** 1.3 Adding Definitions */

export
class module_t {
  env: env_t

  constructor (
    env: env_t = new env_t
  ) {
    this.env = env
  }

  copy (): module_t {
    return new module_t (this.env.copy ())
  }

  /** `use` means "import all from" */
  use (other: module_t): this {
    for (let [name, value] of other.env.map.entries ()) {
      if (this.env.find (name) === undefined) {
        this.env.map.set (name, value)
      } else {
        throw new Error (`name alreay defined: ${name}`)
      }
    }
    return this
  }

  define (name: string, exp: exp_t): this {
    this.env = this.env.ext (name, exp.eval (this.env))
    return this
  }

  run (exp: exp_t): this {
    ut.log (
      normalize (this.env, exp)
    )
    return this
  }
}

/** 2 Generating Fresh Names */

/**
 * Normalization requires generating fresh names
 *   to avoid conflicting variable names.
 */

export
function freshen (
  used_names: Set <string>,
  name: string,
): string {
  while (used_names.has (name)) {
    name += "*"
  }
  return name
}

/** 3.1 Normal Forms */

/**
 * equivalence relation of lambda terms.

 * alpha-equivalence:
 *   consistently renaming bound variables
 *   doesn’t change the meaning of an expression

 * beta-equivalence:
 *   applying a lambda-expression to an argument
 *   is equal to the result of the application

 * both rules are equations, which means that
 *   they can be applied anywhere in an expression
 *   and that they can be read both from left to right
 *   and from right to left.
 */

/**
 * When we have a collection of equations over syntax,
 * the syntax can be seen as divided into various "buckets"
 * where each expression in a bucket
 * is αβ-equivalent to all the others in its bucket.

 * One way to check whether two expressions are in the same bucket
 * is to assign each bucket a representative expression
 * and provide a way to find the bucket representative
 * for any given expression.

 * Then, if two expressions are in the same bucket,
 * they will have the same representative.
 * This canonical representative is referred to as a `normal form`.
 */

/**
 * Here, we adopt the convention that normal forms are those
 * that contain no reducible expressions, or redexes,
 * which is to say that there are no λ-expressions
 * directly applied to an argument.

 * Because α-equivalence is easier to check than β-equivalence,
 * most people consider normal forms with respect to the β-rule only,
 * and then use α-equivalence when comparing β-normal forms.
 */

/** 3.2 Finding Normal Forms */

/**
 * When reducing under λ,
 * there will also be variables that
 * do not have a value in the environment.
 * To handle these cases,
 * we need values that represent `neutral expressions`.

 * A neutral expression is an expression that
 * we are not yet able to reduce to a value,
 * because information such as
 * the value of an argument to a function is not yet known.

 * In this language, there are two neutral expressions:
 * variables that do not yet have a value,
 * and applications where the function position is neutral.
 */

/**
 * Although normal from and neutral form are special `exp_t`,
 *   but we implement them as different abstract classes,
 *   and there will be no `.eval` method on them.

 * We might also implement normal from and neutral form
 *   as predicates method on `exp_t`.
 */

/**
 * Note that, the follow definition of `neutral_t`
 * is different form the mutual recersive definitions
 * of `<norm>` and `<neu>`.

 * The definition of `neutral_t` is to help implement `read_back`.
 */

export
abstract class neutral_t {
  kind: "neutral_t" = "neutral_t"
}

export
class neutral_var_t extends neutral_t {
  name: string

  constructor (name: string) {
    super ()
    this.name = name
  }
}

export
class neutral_apply_t extends neutral_t {
  rator: neutral_t
  rand: value_t

  constructor (
    rator: neutral_t,
    rand: value_t,
  ) {
    super ()
    this.rator = rator
    this.rand = rand
  }
}

export
function read_back (
  used_names: Set <string>,
  value: value_t,
): exp_t {
  if (value instanceof closure_t) {
    let closure = value
    let fresh_name = freshen (
      used_names,
      closure.name,
    )
    let neutral_var = new neutral_var_t (fresh_name)
    let inner_value = closure.body.eval (
      closure.env.ext (closure.name, neutral_var)
    )
    let new_body = read_back (
      new Set (used_names) .add (fresh_name),
      inner_value,
    )
    return new lambda_t (fresh_name, new_body)
  } else if (value instanceof neutral_var_t) {
    let neutral_var = value
    return new var_t (neutral_var.name)
  } else if (value instanceof neutral_apply_t) {
    let neutral_apply = value
    return new apply_t (
      read_back (used_names, neutral_apply.rator),
      read_back (used_names, neutral_apply.rand),
    )
  } else {
    ut.log (value)
    throw new Error (
      `met unknown type of value`
    )
  }
}

export
function normalize (
  env: env_t,
  exp: exp_t,
): exp_t {
  return read_back (
    new Set (),
    exp.eval (env),
  )
}

/** 3.3 Example: Church Numerals */

export
let church = new module_t ()

// (define church-zero
//  (λ (f)
//   (λ (x)
//    x)))

// (define church-add1
//  (λ (prev)
//   (λ (f)
//    (λ (x)
//     (f ((prev f) x))))))

// (define church-add
//  (λ (j)
//   (λ (k)
//    (λ (f)
//     (λ (x)
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
  "church_zero", new lambda_t (
    "f", new lambda_t (
      "x", new var_t ("x")
    )
  )
)

church.define (
  "church_add1", new lambda_t (
    "prev", new lambda_t (
      "f", new lambda_t (
        "x", new apply_t (
          new var_t ("f"),
          new apply_t (
            new apply_t (
              new var_t ("prev"),
              new var_t ("f"),
            ),
            new var_t ("x"),
          )
        )
      )
    )
  )
)

church.define (
  "church_add", new lambda_t (
    "j", new lambda_t (
      "k", new lambda_t (
        "f", new lambda_t (
          "x", new apply_t (
            new apply_t (
              new var_t ("j"),
              new var_t ("f"),
            ),
            new apply_t (
              new apply_t (
                new var_t ("k"),
                new var_t ("f"),
              ),
              new var_t ("x"),
            )
          )
        )
      )
    )
  )
)

export
function to_church (n: number): exp_t {
  let exp: exp_t = new var_t ("church_zero")
  while (n > 0) {
    exp = new apply_t (new var_t ("church_add1"), exp)
    n -= 1
  }
  return exp
}

/** 4 Error handling */

/**
 * Previously, programs that contained errors
 * such as unbound variables or malformed syntax
 * would simply crash the evaluator.
 * Mismatched types, however, are not errors,
 * they are instead useful feedback
 * that can be used while constructing a program.
 */

/** we need `result_t` `result_t` */

/** 5 Bidirectional Type Checking */

/**
 * Bidirectional type checking is a technique
 * for making type systems syntax-directed
 * that adds only a minimal annotation burden.

 * Typically, only the top level of an expression
 * or any explicit redexes need to be annotated.

 * Additionally, bidirectional type checking provides guidance
 * for the appropriate places to insert checks
 * of type equality or subsumption.
 */

/** 5.1 Types */

export
abstract class type_t {
  kind: "type_t" = "type_t"
  abstract eq (that: type_t): boolean
}

export
class nat_t extends type_t {
  constructor () {
    super ()
  }

  eq (that: type_t): boolean {
    return that instanceof nat_t
  }
}

export
class arrow_t extends type_t {
  arg: type_t
  ret: type_t

  constructor (
    arg: type_t,
    ret: type_t,
  ) {
    super ()
    this.arg = arg
    this.ret = ret
  }

  eq (that: type_t): boolean {
    return that instanceof arrow_t
      && this.arg.eq (that.arg)
      && this.ret.eq (that.ret)
  }
}

/** 5.2 Checking Types */

/**
 * When writing a bidirectional type checker,
 * the first step is to classify the expressions
 * into introduction and elimination forms.

 * The introduction forms, also called constructors,
 * allow members of a type to be created,
 * while the eliminators expose the information
 * inside of the constructors to computation.

 * In this section,
 * the constructor of the `->` type is `lambda`
 * and the constructors of `Nat` are `zero` and `add1`.
 * The eliminators are function application and `rec`.
 */

/**
 * Under bidirectional type checking,
 * the type system is split into two modes:
 * in checking mode, an expression is
 * analyzed against a known type to see if it fits,
 * while in synthesis mode,
 * a type is derived directly from an expression.
 */

/**
 * Each expression for which a type can be synthesized
 * can be checked against a given type
 * by performing the synthesis
 * and then comparing the synthesized type to the desired type.

 * This is where subsumption
 * or some other nontrivial type equality check can be inserted.

 * Additionally, type annotations (here, written e∈A)
 * allow an expression that can be checked
 * to be used where synthesis is required.

 * Usually, introduction forms have checking rules,
 * while elimination forms admit synthesis.
 */

export
class the_t extends exp_t {
  t: type_t
  exp: exp_t

  constructor (
    t: type_t,
    exp: exp_t,
  ) {
    super ()
    this.t = t
    this.exp = exp
  }

  eq (that: exp_t): boolean {
    return that instanceof the_t
      && this.t.eq (that.t)
      && this.exp.eq (that.exp)
  }

  eval (env: env_t): value_t {
    return this.exp.eval (env)
  }

  synth (ctx: ctx_t): result_t <type_t, string> {
    return result_t.pure (this.t)
  }
}

export
class rec_nat_t extends exp_t {
  t: type_t
  target: exp_t
  base: exp_t
  step: exp_t

  constructor (
    t: type_t,
    target: exp_t,
    base: exp_t,
    step: exp_t,
  ) {
    super ()
    this.t = t
    this.target = target
    this.base = base
    this.step = step
  }

  eq (that: exp_t): boolean {
    return that instanceof rec_nat_t
      && this.t.eq (that.t)
      && this.target.eq (that.target)
      && this.base.eq (that.base)
      && this.step.eq (that.step)
  }

  eval (env: env_t): value_t {
    return ut.TODO ()
  }

  synth (ctx: ctx_t): result_t <type_t, string> {
    return this.target.synth (ctx)
      .bind (target_type => {
        if (target_type.eq (new nat_t ())) {
          return this.base.check (ctx, this.t)
            .bind (__ => {
              return this.step.check (
                ctx, new arrow_t (
                  new nat_t, new arrow_t (this.t, this.t)
                )
              )
            }) .bind (__ => {
              return result_t.pure (this.t)
            })
        } else {
          return new err_t (
            "target type is not nat_t"
          )
        }
      })
  }
}

export
class zero_t extends exp_t {
  constructor () {
    super ()
  }

  eq (that: exp_t): boolean {
    return that instanceof zero_t
  }

  eval (env: env_t): value_t {
    return ut.TODO ()
  }

  check (ctx: ctx_t, t: type_t): result_t <"ok", string> {
    if (t.eq (new nat_t ())) {
      return result_t.pure ("ok")
    } else {
      return new err_t (
        "the type of zero should be nat_t"
      )
    }
  }
}

export
class add1_t extends exp_t {
  prev: exp_t

  constructor (prev: exp_t) {
    super ()
    this.prev = prev
  }

  eq (that: exp_t): boolean {
    return that instanceof add1_t
      && this.prev.eq (that.prev)
  }

  eval (env: env_t): value_t {
    return ut.TODO ()
  }

  check (ctx: ctx_t, t: type_t): result_t <"ok", string> {
    if (t.eq (new nat_t ())) {
      return this.prev.check (ctx, t)
    } else {
      return new err_t (
        "the type of add1_t should be nat_t"
      )
    }
  }
}

/**
 * The typing context.
 */
export
class ctx_t {
  map: Map <string, type_t>

  constructor (
    map: Map <string, type_t> = new Map ()
  ) {
    this.map = map
  }

  find (name: string): type_t | undefined {
    return this.map.get (name)
  }

  copy (): ctx_t {
    return new ctx_t (new Map (this.map))
  }

  ext (name: string, t: type_t): ctx_t {
    return new ctx_t (
      new Map (this.map)
        .set (name, t)
    )
  }
}

/** 6 Typed Normalization by Evaluation */
