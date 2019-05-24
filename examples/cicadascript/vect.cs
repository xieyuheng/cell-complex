union vect_t {
  null_vect_t
  cons_vect_t
} {
  t: type
  length: nat_t
}

class null_vect_t {
  t: type
  length: nat_t
  length = zero_t ()
}

class cons_vect_t {
  t: type
  length: nat_t
  car: this.t
  {{ n: nat_t }}
  cdr: vect_t (this.t, this.n)
  length = succ_t (this.n)
}

vect_append: (
  {{ t: type, m: nat_t, n: nat_t }}
  ante: vect_t (t, m),
  succ: vect_t (t, n),
) -> vect_t (t, nat_add (m, n)) = case (ante) {
  null_vect_t => succ
  cons_vect_t => cons_vect_t (
    car = ante.car
    cdr = vect_append (ante.cdr, succ)
  )
}

vect_map: (
  {{ a: type, b: type, n: nat_t }}
  fun: (a) -> b,
  vect: vect_t (a, n),
) -> vect_t (a, n) = case (vect) {
  null_vect_t => vect
  cons_vect_t => cons_vect_t (
    car = fun (vect.car)
    cdr = vect_map (fun, vect.cdr)
  )
}