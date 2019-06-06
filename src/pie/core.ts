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

abstract class value_t {
  // abstract eq
}

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
class closure_t extends value_t {
  env: env_t
  name: string
  body: exp_t

  constructor (
    env: env_t,
    name: string,
    body: exp_t,
  ) {
    super ()
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
    } else {
      throw new Error ("fun is not closure")
    }
  }
}

{
  let exp = new lambda_t ("x", new lambda_t ("y", new var_t ("y")))
  let val = exp.eval (new env_t (new Map ()))
  console.log (val)
}

{
  let exp = new apply_t (
    new lambda_t ("x", new var_t ("x")),
    new lambda_t ("x", new var_t ("x")),
  )
  let val = exp.eval (new env_t (new Map ()))
  console.log (val)
}

// 1.3 Adding Definitions
// 2 Generating Fresh Names
// 3.1 Normal Forms
// 3.2 Finding Normal Forms
// 3.3 Example: Church Numerals
// 4 Error handling
// 5 Bidirectional Type Checking
