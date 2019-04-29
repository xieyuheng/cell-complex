import assert from "assert"

import { set_t, eqv, not_eqv } from "./set"

import { group_t } from "./group"

// TODO
// the following definition is not useful.
// because we can not define the category_t of all group_t
// because the objects should be
//   the set of all `group_t`
//   instead of the set of `group_t <G>` for some the `G`

export
class category_t <O, A> {
  readonly objects: set_t <O>
  readonly arrows: set_t <A>
  readonly dom: (f: A) => O
  readonly cod: (f: A) => O
  readonly id: (x: O) => A
  readonly compose: (f: A, g: A) => A

  constructor (the: {
    objects: set_t <O>,
    arrows: set_t <A>,
    dom: (f: A) => O,
    cod: (f: A) => O,
    id: (x: O) => A,
    compose: (f: A, g: A) => A,
  }) {
    this.objects = the.objects
    this.arrows = the.arrows
    this.dom = the.dom
    this.cod = the.cod
    this.id = the.id
    this.compose = (f, g) => {
      eqv (this.objects, this.cod (f), this.dom (g))
      return the.compose (f, g)
    }
  }

  id_left (f: A) {
    eqv (
      this.arrows,
      this.compose (this.id (this.dom (f)), f),
      f,
    )
  }

  id_right (f: A) {
    eqv (
      this.arrows,
      this.compose (f, this.id (this.cod (f))),
      f,
    )
  }

  assoc (f: A, g: A, h: A) {
    eqv (
      this.arrows,
      this.compose (this.compose (f, g), h),
      this.compose (f, this.compose (g, h)),
    )
  }
}

export
class functor_t <LO, LA, RO, RA> {
  readonly lcat: category_t <LO, LA>
  readonly rcat: category_t <RO, RA>
  readonly map: (x: LO) => RO
  readonly fmap: (f: LA) => RA

  constructor (the: {
    lcat: category_t <LO, LA>,
    rcat: category_t <RO, RA>,
    map: (x: LO) => RO,
    fmap: (f: LA) => RA,
  }) {
    this.lcat = the.lcat
    this.rcat = the.rcat
    this.map = the.map
    this.fmap = (f) => {
      let g = the.fmap (f)
      eqv (
        the.rcat.objects,
        the.map (the.lcat.dom (f)),
        the.rcat.dom (g),
      )
      eqv (
        the.rcat.objects,
        the.map (the.lcat.cod (f)),
        the.rcat.cod (g),
      )
      return g
    }
  }

  fmap_respect_compose (f: LA, g: LA) {
    eqv (
      this.rcat.arrows,
      this.fmap (this.lcat.compose (f, g)),
      this.rcat.compose (this.fmap (f), this.fmap (g)),
    )
  }

  fmap_respect_id (x: LO) {
    eqv (
      this.rcat.arrows,
      this.fmap (this.lcat.id (x)),
      this.rcat.id (this.map (x)),
    )
  }
}

export
class natural_transformation_t <LO, LA, RO, RA> {
  readonly lcat: category_t <LO, LA>
  readonly rcat: category_t <RO, RA>
  readonly lfun: functor_t <LO, LA, RO, RA>
  readonly rfun: functor_t <LO, LA, RO, RA>
  readonly component: (x: LO) => RA

  constructor (the: {
    lfun: functor_t <LO, LA, RO, RA>,
    rfun: functor_t <LO, LA, RO, RA>,
    component: (x: LO) => RA,
  }) {
    // note the use of === here
    assert (the.lfun.lcat === the.rfun.lcat)
    assert (the.lfun.rcat === the.rfun.rcat)
    this.lcat = the.lfun.lcat
    this.rcat = the.lfun.rcat
    this.lfun = the.lfun
    this.rfun = the.rfun
    this.component = (x) => {
      let c = the.component (x)
      eqv (
        this.rcat.objects,
        this.rcat.dom (c),
        this.lfun.map (x),
      )
      eqv (
        this.rcat.objects,
        this.rcat.cod (c),
        this.rfun.map (x),
      )
      return c
    }
  }

  natural (f: LA) {
    let a = this.lcat.dom (f)
    let b = this.lcat.cod (f)
    eqv (
      this.rcat.arrows,
      this.rcat.compose (
        this.component (a),
        this.rfun.fmap (f),
      ),
      this.rcat.compose (
        this.lfun.fmap (f),
        this.component (b),
      ),
    )
  }
}

export
class groupoid_t <O, A> extends category_t <O, A> {
  readonly inv: (f: A) => A

  constructor (the: {
    objects: set_t <O>,
    arrows: set_t <A>,
    dom: (f: A) => O,
    cod: (f: A) => O,
    id: (x: O) => A,
    compose: (f: A, g: A) => A,
    inv: (f: A) => A,
  }) {
    super (the)
    this.inv = the.inv
  }

  // `dom` and `cod` of composition are only checked at runtime
  //   if the `eqv` can report report instead of throw error
  //   maybe we can use it as semantics of type system
  arrow_iso (f: A) {
    eqv (
      this.arrows,
      this.compose (f, this.inv (f)),
      this.id (this.dom (f)),
    )

    eqv (
      this.arrows,
      this.compose (this.inv (f), f),
      this.id (this.cod (f)),
    )
  }
}
