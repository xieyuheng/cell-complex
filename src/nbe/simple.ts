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
  abstract eq (that: type_t): boolean
}

class nat_t extends type_t {
  eq (that: nat_t): boolean {
    return that instanceof nat_t
  }
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

  eq (that: nat_t): boolean {
    return that instanceof arrow_t
      && this.arg_type.eq (that.arg_type)
      && this.ret_type.eq (that.ret_type)
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
  abstract eq (that: const_t): boolean
}

class zero_t extends const_t {
  T: type_t

  constructor () {
    super ()
    this.T = new nat_t ()
  }

  eq (that: const_t): boolean {
    return that instanceof zero_t
  }
}

class suc_t extends const_t {
  T: type_t

  constructor () {
    super ()
    this.T = new arrow_t (
      new nat_t (),
      new nat_t (),
    )
  }

  eq (that: const_t): boolean {
    return that instanceof suc_t
  }
}

/**
 * Primitive recursion into type `this.into_type`.
 */
class rec_t extends const_t {
  T: type_t
  into_type: type_t

  constructor (into_type: type_t) {
    super ()
    this.into_type = into_type

    this.T = new arrow_t (
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

  eq (that: const_t): boolean {
    return that instanceof rec_t
      && this.into_type.eq (that.into_type)
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
  abstract eq (that: term_t): boolean
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

  eq (that: term_t): boolean {
    return that instanceof constant_t
      && this.c.eq (that.c)
  }

  well_typed_p (_ctx: ctx_t, T: type_t): boolean {
    return this.c.T.eq (T)
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

  eq (that: term_t): boolean {
    return that instanceof variable_t
      && this.name === that.name
  }

  well_typed_p (ctx: ctx_t, T: type_t): boolean {
    let X = ctx.map.get (name)
    if (X !== undefined && (X.eq (T))) {
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

  eq (that: term_t): boolean {
    return that instanceof lambda_t
      && this.name === that.name
      && this.term === that.term
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

  eq (that: term_t): boolean {
    return that instanceof apply_t
      && this.fun === that.fun
      && this.arg === that.arg
      && this.arg_type === that.arg_type
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
    return this.reflexivity (ctx, T)
      || this.beta_equality (ctx, T)
      || this.eta_equality (ctx, T)
      || this.compatibility (ctx, T)
  }

  reflexivity (ctx: ctx_t, T: type_t): boolean {
    return this.x.eq (this.y)
      && this.x.well_typed_p (ctx, T)
  }

  beta_equality (ctx: ctx_t, T: type_t): boolean {
    if (this.x instanceof apply_t &&
        this.x.arg.eq (new constant_t (new zero_t ())) &&
        this.x.fun instanceof apply_t &&
        this.x.fun.fun instanceof apply_t &&
        this.x.fun.fun.fun instanceof constant_t &&
        this.x.fun.fun.fun.c instanceof rec_t &&
        this.y.eq (this.x.fun.fun.arg) &&
        this.x.fun.fun.arg.well_typed_p (ctx, T) &&
        this.x.fun.arg.well_typed_p (
          ctx, new arrow_t (new nat_t (), new arrow_t (T, T))
        )) {
      return true
    } else if (
      // TODO
      true
    ) {
      return true
    } else {
      return false
    }
  }

  eta_equality (ctx: ctx_t, T: type_t): boolean {
    if (this.x instanceof lambda_t &&
        this.x.term instanceof apply_t &&
        this.x.term.arg instanceof variable_t &&
        this.x.term.arg.name === this.x.name &&
        this.x.term.fun.eq (this.y) &&
        T instanceof arrow_t &&
        this.y.well_typed_p (ctx, T)) {
      return true
    } else {
      return false
    }
  }

  compatibility (ctx: ctx_t, T: type_t): boolean {
    // TODO
    return false
  }
}
