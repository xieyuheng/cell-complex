class eqv_t {
  {{ t: type }}
  lhs: this.t
  rhs: this.t
  /**
   * TODO
   * How to specify the semantics here ?
   *  it can not be `eqv_t (this.lhs, this.rhs)` again

   * Instead of a defined class `eqv_t`,
   *   we need built-in `eqv_t`
   *   and special syntax for the game of equality
   */
  this.lhs = this.rhs
}

eqv_apply: (
  {{ a: type, b: type }}
  fun : (a) -> b,
  {{ x: a, y: a }}
  eqv_t (x, y),
) -> eqv_t (fun (x), fun (y)) = eqv_t ()

eqv_swap: (
  {{ a: type }}
  {{ x: a, y: a }}
  eqv_t (x, y)
) -> eqv_t (y, x) = eqv_t ()

eqv_compose: (
  {{ a: type }}
  {{ x: a, y: a, z: a }}
  eqv_t (x, y),
  eqv_t (y, z),
) -> eqv_t (x, z) = eqv_t ()
