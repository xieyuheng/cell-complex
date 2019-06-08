export
abstract class option_t <T> {
  bind <X> (
    f: (x: T) => option_t <X>,
  ): option_t <X> {
    if (this instanceof some_t) {
      return f (this.value)
    } else if (this instanceof none_t) {
      return new none_t <X> ()
    } else {
      throw new Error (
        `unknown sub class: ${this.constructor.name}`
      )
    }
  }

  static pure <X> (value: X): option_t <X> {
    return new some_t (value)
  }

  static some <X> (value: X): option_t <X> {
    return new some_t (value)
  }

  unwrap (): T {
    if (this instanceof some_t) {
      return this.value
    } else if (this instanceof none_t) {
      throw new Error (
        `unwrap a none_t`
      )
    } else {
      throw new Error (
        `unknown sub class: ${this.constructor.name}`
      )
    }
  }

  unwrap_or_throw (error: Error): T {
    if (this instanceof some_t) {
      return this.value
    } else if (this instanceof none_t) {
      throw error
    } else {
      throw new Error (
        `unknown sub class: ${this.constructor.name}`
      )
    }
  }

  match <X, Y> (
    { some, none }: { some: (value: T) => X, none: () => Y }
  ): X | Y {
    if (this instanceof some_t) {
      return some (this.value)
    } else if (this instanceof none_t) {
      return none ()
    } else {
      throw new Error (
        `unknown sub class: ${this.constructor.name}`
      )
    }
  }
}

export
class some_t <T> extends option_t <T> {
  value: T

  constructor (value: T) {
    super ()
    this.value = value
  }
}

export
class none_t <T> extends option_t <T> {
  constructor () {
    super ()
  }
}

export
abstract class result_t <T, E> {
  bind <X> (
    f: (x: T) => result_t <X, E>,
  ): result_t <X, E> {
    if (this instanceof ok_t) {
      return f (this.value)
    } else if (this instanceof err_t) {
      return new err_t (this.error)
    } else {
      throw new Error (
        `unknown sub class: ${this.constructor.name}`
      )
    }
  }

  static pure <X, Y> (value: X): result_t <X, Y> {
    return new ok_t (value)
  }

  static ok <X, Y> (value: X): result_t <X, Y> {
    return new ok_t (value)
  }

  static err <X, Y> (error: Y): result_t <X, Y> {
    return new err_t (error)
  }

  unwrap (): T {
    if (this instanceof ok_t) {
      return this.value
    } else if (this instanceof err_t) {
      throw new Error (
        `unwrap an err_t`
      )
    } else {
      throw new Error (
        `unknown sub class: ${this.constructor.name}`
      )
    }
  }

  unwrap_or_throw (error: Error): T {
    if (this instanceof ok_t) {
      return this.value
    } else if (this instanceof err_t) {
      throw error
    } else {
      throw new Error (
        `unknown sub class: ${this.constructor.name}`
      )
    }
  }

  match <X, Y> (
    { ok, err }: { ok: (value: T) => X, err: (error: E) => Y }
  ): X | Y {
    if (this instanceof ok_t) {
      return ok (this.value)
    } else if (this instanceof err_t) {
      return err (this.error)
    } else {
      throw new Error (
        `unknown sub class: ${this.constructor.name}`
      )
    }
  }
}

export
class ok_t <T, E> extends result_t <T, E> {
  value: T

  constructor (value: T) {
    super ()
    this.value = value
  }
}

export
class err_t <T, E> extends result_t <T, E> {
  error: E

  constructor (error: E) {
    super ()
    this.error = error
  }
}
