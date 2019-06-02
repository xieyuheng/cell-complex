/**
 * minitt
 */

id: (A: type) -> A -> A = x => x
id: (A: type) -> (x: A) -> A = x

id: (
  A: type,
  x: A,
) -> A = {
  x
}

bool_t: type = sum (true, false)

elim_bool: (C: (bool_t -> type)) -> C (false) -> C (true) -> b: bool_t -> C (b) = TODO

elim_bool: (
  C: (bool_t -> type),
  h0: C (false),
  h1: C (true),
  b: bool_t,
) -> C (b) = case (b) {
  false => h0
  true => h1
}

nat_t: type = sum (zero, succ (nat_t))

list_t: (A: type) -> type =
  sum (null, cons (A, list_t (A)))

natrec: TODO
