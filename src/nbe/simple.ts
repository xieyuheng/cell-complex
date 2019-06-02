import assert from "assert"
import * as ut from "../util"

/**
 * Normalization by Evaluation:
 *   Dependent Types and Impredicativity
 * by Andreas Abel
 */

/**
 * Chapter 2:
 *   Simple Types: From Evaluation to Normalization
 */

abstract class type_t {
}

class nat_t extends type_t {
}

class arrow_t extends type_t {
  arg_type: type_t
  ret_type: type_t

  constructor (
    arg_type: type_t,
    ret_type: type_t,
  ) {
    super ()
    this.arg_type = arg_type
    this.ret_type = ret_type
  }
}

function type_eq (x: type_t, y: type_t): boolean {
  if (x instanceof nat_t && y instanceof nat_t) {
    return true
  } else if (x instanceof arrow_t && y instanceof arrow_t) {
    return type_eq (x.arg_type, y.arg_type)
      && type_eq (x.ret_type, y.ret_type)
  } else {
    return false
  }
}

class ctx_t {
  map: Map <string, type_t>

  constructor (
    map: Map <string, type_t>
  ) {
    this.map = map
  }

  static empty_context (): ctx_t {
    return new ctx_t (new Map ())
  }

  ext (
    name: string,
    t: type_t,
  ): ctx_t {
    if (this.map.has (name)) {
      throw new Error (
        `name: ${name} already exists in this context`
      )
    }
    return new ctx_t (
      new Map (this.map) .set (name, t)
    )
  }
}

/**
 * Constant value of type `this.T`.
 */
abstract class const_t {
  abstract T: type_t
}

class zero_t extends const_t {
  get T (): type_t {
    return new nat_t ()
  }
}

class suc_t extends const_t {
  get T (): type_t {
    return new arrow_t (
      new nat_t (),
      new nat_t (),
    )
  }
}

/**
 * Primitive recursion into type `this.into_type`.
 */
class rec_t extends const_t {
  into_type: type_t

  constructor (into_type: type_t) {
    super ()
    this.into_type = into_type
  }

  get T (): type_t {
    return new arrow_t (
      this.into_type,
      new arrow_t (
        new arrow_t (
          new nat_t (),
          new arrow_t (
            this.into_type,
            this.into_type,
          )
        ),
        new arrow_t (
          new nat_t (),
          this.into_type,
        ),
      ),
    )
  }
}

/**
 * Well-typed terms, in context.
 * - We need a class `term_t`
 *   and a `well_typed` judgment method on `term_t`.
 * - `term_t` does not have a `T` field,
 *   for the type of a term depends context.
 */
abstract class term_t {
  abstract well_typed_p (ctx: ctx_t, T: type_t): boolean

  // abstract normal_p (ctx: ctx_t, T: type_t): boolean
  // abstract neutral_p (ctx: ctx_t, T: type_t): boolean
}

class constant_t extends term_t {
  c: const_t

  constructor (
    c: const_t,
  ) {
    super ()
    this.c = c
  }

  well_typed_p (_ctx: ctx_t, T: type_t): boolean {
    return type_eq (this.c.T, T)
  }
}

class variable_t extends term_t {
  name: string

  constructor (
     name: string,
  ) {
    super ()
    this.name = name
  }

  well_typed_p (ctx: ctx_t, T: type_t): boolean {
    let X = ctx.map.get (name)
    if (X !== undefined && type_eq (X, T)) {
      return true
    } else {
      return false
    }
  }
}

class lambda_t extends term_t {
  name: string
  term: term_t

  constructor (
    name: string,
    term: term_t,
  ) {
    super ()
    this.name = name
    this.term = term
  }

  well_typed_p (ctx: ctx_t, T: type_t): boolean {
    if (T instanceof arrow_t) {
      return this.term.well_typed_p (
        ctx.ext (this.name, T.arg_type),
        T.ret_type
      )
    } else {
      return false
    }
  }
}

class apply_t extends term_t {
  fun: term_t
  arg: term_t
  arg_type: type_t

  constructor (
    fun: term_t,
    arg: term_t,
    arg_type: type_t,
  ) {
    super ()
    this.fun = fun
    this.arg = arg
    this.arg_type = arg_type
  }

  well_typed_p (ctx: ctx_t, T: type_t): boolean {
    return this.arg.well_typed_p (ctx, this.arg_type)
      && this.fun.well_typed_p (ctx, new arrow_t (this.arg_type, T))
  }
}

/**
 * Definitional Equality (a.k.a. sameness in "the little typer")
 * - not complete -- does not capture the semantic equality
 * - but decidable -- we can write a checker for this equality
 */

class definitional_equality_t {
  x: term_t
  y: term_t

  constructor (
    x: term_t,
    y: term_t,
  ) {
    this.x = x
    this.y = y
  }

  swap (): definitional_equality_t {
    return new definitional_equality_t (
      this.y,
      this.x,
    )
  }

  check_same (ctx: ctx_t, T: type_t): boolean {
    return this.check_same_directed (ctx, T)
      || this.swap () .check_same_directed (ctx, T)
  }

  check_same_directed (ctx: ctx_t, T: type_t): boolean {
    return this.beta_equality (ctx, T)
      || this.eta_equality (ctx, T)
      || this.compatibility (ctx, T)
  }

  beta_equality (ctx: ctx_t, T: type_t): boolean {
    return false
  }

  eta_equality (ctx: ctx_t, T: type_t): boolean {
    return false
  }

  compatibility (ctx: ctx_t, T: type_t): boolean {
    return false
  }
}
