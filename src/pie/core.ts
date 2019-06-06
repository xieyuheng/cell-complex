import * as ut from "../util"

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

type value_t = closure_t | neutral_t

/**
 * Runtime environments provide the values for each variable.
 */
class env_t {
  map: Map <string, value_t>

  constructor (
    map: Map <string, value_t>
  ) {
    this.map = map
  }

  find (name: string): value_t | undefined {
    return this.map.get (name)
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

abstract class exp_t {
  abstract eval (env: env_t): value_t
}

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

  eval (env: env_t): closure_t {
    return new closure_t (env, this.name, this.body)
  }
}

class var_t extends exp_t {
  name: string

  constructor (name: string) {
    super ()
    this.name = name
  }

  eval (env: env_t): value_t {
    let found = env.find (this.name)
    if (found !== undefined) {
      let value = found
      return value
    } else {
      throw new Error (`undefined name: ${this.name}`)
    }
  }
}

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
      throw new Error ("unknown fun")
    }
  }
}

// {
//   let exp = new lambda_t ("x", new lambda_t ("y", new var_t ("y")))
//   let val = exp.eval (new env_t (new Map ()))
//   console.log (val)
// }

// {
//   let exp = new apply_t (
//     new lambda_t ("x", new var_t ("x")),
//     new lambda_t ("x", new var_t ("x")),
//   )
//   let val = exp.eval (new env_t (new Map ()))
//   console.log (val)
// }

/** 1.3 Adding Definitions */

class module_t {
  env: env_t

  constructor (
    env: env_t
  ) {
    this.env = env
  }

  define (name: string, exp: exp_t): this {
    this.env = this.env.ext (name, exp)
    return this
  }

  run (exp: exp_t): this {
    let value = exp.eval (this.env)
    ut.log (value)
    return this
  }
}

// {
//   let m = new module_t (new env_t (new Map ()))
//   m.define ("id", new lambda_t ("x", new var_t ("x")))
//   m.run (new var_t ("id"))
// }

/** 2 Generating Fresh Names */

/**
 * Normalization requires generating fresh names
 *   to avoid conflicting variable names.
 */

function freshen (
  used_names: Set <string>,
  name: string,
): string {
  while (used_names.has (name)) {
    name += "*"
  }
  return name
}

// {
//   let x = "x"
//   ut.log (
//     freshen (["x", "x*"], x)
//   )
// }

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

abstract class neutral_t {}

class neutral_var_t extends neutral_t {
  name: string

  constructor (name: string) {
    super ()
    this.name = name
  }
}

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
    throw new Error ("TODO")
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
      `met unknown type of value above`
    )
  }
}

/** 3.3 Example: Church Numerals */

/** 4 Error handling */

/** 5 Bidirectional Type Checking */
