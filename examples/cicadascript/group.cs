import { category_t } from "./category.cs"

class monoid_t {
  element_t: type

  id: this.element_t

  mul: (x: this.element_t, y: this.element_t) -> this.element_t

  assoc: (
    x: this.element_t,
    y: this.element_t,
    z: this.element_t,
  ) -> eqv_t (
    this.mul (this.mul (x, y), z),
    this.mul (x, this.mul (y, z)),
  )

  id_left: (
    x: this.element_t,
  ) -> eqv_t (this.mul (this.id, x), x)

  id_right: (
    x: this.element_t,
  ) -> eqv_t (this.mul (x, this.id), x)
}

class group_t extends monoid_t {
  inv: (x: this.element_t) -> this.element_t

  id_inv: (
    x: this.element_t,
  ) -> eqv_t (this.mul (x, this.inv (x)), this.id)

  div: (
    x: this.element_t,
    y: this.element_t,
  ) -> this.element_t {
    this.mul (x, this.inv (y))
  }
}

group_product: (g: group_t, h: group_t) -> group_t = {
  group_t (
    element_t = [g.element_t, h.element_t]

    id = [g.id, h.id]

    mul: (
      x: [g.element_t, h.element_t],
      y: [g.element_t, h.element_t],
    ) -> [g.element_t, h.element_t] = [
      g.mul (x [0], y [0]),
      h.mul (x [1], y [1]),
    ]

    assoc: (
      x: [g.element_t, h.element_t],
      y: [g.element_t, h.element_t],
      z: [g.element_t, h.element_t],
    ) -> eqv_t (
      this.mul (this.mul (x, y), z),
      this.mul (x, this.mul (y, z)),
    ) = {
      // TODO
    }

    inv: (
      x: [g.element_t, h.element_t]
    ) -> [g.element_t, h.element_t] = [
      g.inv (x [0]),
      h.inv (x [1]),
    ]
  )
}


class group_hom_t {
  dom: group_t
  cod: group_t

  hom: (this.dom.element_t) -> this.cod.element_t

  hom_respect_mul: (
    x: this.dom.element_t,
    y: this.dom.element_t,
  ) -> eqv_t (
    this.hom (this.dom.mul (x, y)),
    this.cod.mul (this.hom (x), this.hom (y)),
  )
}

// TODO
// group_hom_compose

// TODO
// group_hom_id

// TODO
// group_iso_t

// TODO
// use `group_iso_t` as `eqv_t of group_t`

group_cat = category_t (
  object_t = group_t
  arrow_t = group_hom_t

  dom: (f: group_hom_t) -> group_t = f.dom
  cod: (f: group_hom_t) -> group_t = f.cod

  id: (x: group_t) -> group_hom_t = {
    group_hom_t (
      dom = x
      cod = x

      // TODO
    )
  }

  compose: (
    f: group_hom_t,
    g: group_hom_t,
    {{ composable: eqv_t (f.cod, g.dom) }},
  ) -> group_hom_t = group_hom_t (
    dom = f.dom
    cod = f.cod

    hom: (x: f.dom.element_t) -> f.cod.element_t = {
      g.hom (f.hom (x))
    }

    hom_respect_mul: (
      x: f.dom.element_t,
      y: f.dom.element_t,
    ) -> eqv_t (
      g.hom (f.hom (f.dom.mul (x, y)))
      g.cod.mul (g.hom (f.hom (x)), g.hom (f.hom (y))),
    ) = {
      h1 = f.hom_respect_mul (x, y) -> eqv_t (
        f.hom (f.dom.mul (x, y)),
        f.cod.mul (f.hom (x), f.hom (y)),
      )

      h2 = g.hom_respect_mul (f.hom (x), f.hom (y)) -> eqv_t (
        g.hom (g.dom.mul (f.hom (x), f.hom (y))),
        g.cod.mul (g.hom (f.hom (x)), g.hom (f.hom (y))),
      )

      // TODO
      // design the language of equality by game semantics

      // we need to prove
      eqv_t (
        f.hom (f.dom.mul (x, y)),
        g.dom.mul (f.hom (x), f.hom (y)),
      )

      // which is true, because
      f.cod = g.dom

      return h2
    }
  )

  id_left: (
    f: group_hom_t,
  ) -> eqv_t (this.compose (this.id (f.dom), f), f) = {
    // TODO
  }

  id_right: (
    f: group_hom_t,
  ) -> eqv_t (this.compose (f, this.id (f.cod)), f) = {
    // TODO
  }

  assoc: (
    f: group_hom_t,
    g: group_hom_t,
    h: group_hom_t,
  ) -> eqv_t (
    this.compose (f, this.compose (g, h)),
    this.compose (this.compose (f, g), h),
  ) = {
    // TODO
  }
)

class abelian_group_t extends group_t {
  add = this.mul
  sub = this.div
  neg = this.inv

  commu: (
    x: this.element_t,
    y: this.element_t,
  ) -> eqv_t (
    this.add (x, y),
    this.add (y, x),
  )
}
