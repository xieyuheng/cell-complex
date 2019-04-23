class category_t {
  object_t: type
  arrow_t: type

  dom (f: this.arrow_t): this.object_t
  cod (f: this.arrow_t): this.object_t

  id (x: this.object_t): this.arrow_t

  compose (
    f: this.arrow_t,
    g: this.arrow_t,
    {
      this.cod (f) = this.dom (g)
    },
  ): {
    h: this.arrow_t
    this.dom (h) = this.dom (f)
    this.cod (h) = this.cod (g)
    return h
  }

  id_left (
    f: this.arrow_t,
  ): this.compose (this.id (f.dom), f) == f

  id_right (
    f: this.arrow_t,
  ): this.compose (f, this.id (f.cod)) == f

  assoc (
    f: this.arrow_t,
    g: this.arrow_t,
    h: this.arrow_t,
  ): this.compose (f, this.compose (g, h)) ==
    this.compose (this.compose (f, g), h)
}

class iso_t {
  cat: category_t
  iso: cat.arrow_t
  inv: cat.arrow_t

  iso_inv_identity: cat.compose (iso, inv) == cat.id (a)
  inv_iso_identity: cat.compose (inv, iso) == cat.id (b)
}

class functor_t {
  lcat: category_t
  rcat: category_t

  map: (x: this.lcat.object_t): this.rcat.object_t

  fmap (f: this.lcat.arrow_t): {
    g: this.rcat.arrow_t
    this.map (this.lcat.dom (f)) = this.rcat.dom (g)
    this.map (this.lcat.cod (f)) = this.rcat.cod (g)
    return g
  }

  fmap_respect_compose (
    f: this.lcat.arrow_t,
    g: this.lcat.arrow_t,
  ): this.fmap (this.lcat.compose (f, g)) ==
    this.rcat.compose (this.fmap (f), this.fmap (g))

  fmap_respect_id (
    x: this.lcat.object_t,
  ): this.fmap (this.lcat.id (x)) ==
    this.rcat.id (this.map (x))
}

class natural_transformation_t {
  lfun: functor_t
  rfun: functor_t

  lcat = this.lfun.lcat
  rcat = this.lfun.rcat

  lcat = this.rfun.lcat
  rcat = this.rfun.rcat

  component (x: this.lcat.object_t): {
    c: this.rcat.arrow_t
    this.rcat.dom (c) = this.lfun.map (x)
    this.rcat.cod (c) = this.rfun.map (x)
    return c
  }

  natural (
    f: this.lcat.arrow_t
  ): this.rcat.compose (
    this.component (this.lcat.dom (f)),
    this.rfun.fmap (f),
  ) == this.rcat.compose (
    this.lfun.fmap (f),
    this.component (this.lcat.cod (f)),
  )
}
