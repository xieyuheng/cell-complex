import assert from "assert"
import * as ut from "../util"

import { result_t, ok_t, err_t } from "../result"
import { option_t, some_t, none_t } from "../option"

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

  find (name: string): option_t <value_t> {
    let value = this.map.get (name)
    if (value !== undefined) {
      return new some_t (value)
    } else {
      return new none_t ()
    }
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

export
abstract class exp_t {
  kind: "exp_t" = "exp_t"

  abstract eq (that: exp_t): boolean
  abstract eval (env: env_t): value_t
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
    return env.find (this.name) .unwrap_or_throw (
      new Error (
        `undefined name: ${this.name}`
      )
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
}

export
class module_t {
  env: env_t

  constructor (
    env: env_t = new env_t (),
  ) {
    this.env = env
  }

  copy (): module_t {
    return new module_t (this.env.copy ())
  }

  /** `use` means "import all from" */
  use (other: module_t): this {
    for (let [name, value] of other.env.map.entries ()) {
      this.env.find (name) .match ({
        some: _value => {
          throw new Error (`name alreay defined: ${name}`)
        },
        none: () => {
          this.env.map.set (name, value)
        },
      })
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

// Example: Church Numerals

export
let church = new module_t ()

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
