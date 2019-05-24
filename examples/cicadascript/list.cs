union list_t {
  null_t
  cons_t
} {
  t : type
}

class null_t {
  t : type
}

class cons_t {
  t : type
  car : this.t
  cdr : list_t (this.t)
}


list_length: (
  {{ t: type }}
  list: list_t (t)
) -> nat_t = case (list) {
  null_t => zero_t ()
  cons_t => succ_t (list_length (list.cdr))
}

list_append: (
  {{ t: type }}
  ante: list_t (t),
  succ: list_t (t),
) -> list_t (t) = case (ante) {
  null_t => succ
  cons_t => cons_t (ante.car, list_append (ante.cdr, succ))
}

list_map: (
  {{ a: type, b: type }}
  fun: (a) -> b,
  list: list_t (a),
) -> list_t (b) = case (list) {
  null_t => list
  cons_t => cons_t (fun (list.car), list_map (fun, list.cdr))
}

list_remove_first: (
  {{ t: type }}
  x: t,
  list: list_t (t),
) -> list_t (t) = case (list) {
  null_t => list
  cons_t => case (eq_p (list.car, x)) {
    true_t => list.cdr
    false_t => cons_t (list.car, list_remove_first (list.cdr, x))
  }
}

union list_length_t {
  zero_length_t
  succ_length_t
} {
  {{ t: type }}
  list : list_t (this.t)
  length : nat_t
}

class zero_length_t {
  list: list_t (t) = null_t ()
  length: nat_t = zero_t ()
}

class succ_length_t {
  list: list_t (t) = cons_t (x, l)
  length: nat_t = succ_t (n)
  prev: list_length_t (l, n)
}


/** in prolog, we will have:
 * append([], Succ, Succ).
 * append([Car | Cdr], Succ, [Car | ResultCdr]):-
 *   append(Cdr, Succ, ResultCdr).
 */

union list_append_t {
  zero_append_t
  succ_append_t
} {
  {{ t: type }}
  ante: list_t (this.t)
  succ: list_t (this.t)
  result: list_t (this.t)
}

class zero_append_t {
  {{ t: type }}
  ante: list_t (this.t) = null_t ()
  succ: list_t (this.t)
  result: list_t (this.t) = this.succ
}

class succ_append_t {
  {{ t: type
     car: this.t }}
  ante: cons_t (this.t, this.car)
  succ: list_t (this.t)
  result: cons_t (this.t, this.car)
  prev: list_append_t (
    this.ante.cdr,
    this.succ,
    this.result.cdr,
  )
}
