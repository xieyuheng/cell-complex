import test from "ava"

import { dic_t } from "../lib/dic"
import * as cx from "../lib/cell-complex"
import { torus_t } from "../lib/complexes/torus"
import { log } from "../lib/util"

test ("from_exp", t => {
  let torus = new torus_t ()
  let exp = torus.to_exp ()
  let com = cx.cell_complex_t.from_exp (exp)
  t.deepEqual (exp, com.to_exp ())

  // log (torus.to_exp ())
})

test ("vertex_figure", t => {
  let torus = new torus_t ()
  let verf = new cx.vertex_figure_t (torus, torus.id ("origin"))

  // log (verf.to_exp ())

  let iso = new cx.morphism_builder_t (
    new cx.polygon_t (4), verf
  ) .point_ser (0, 0)
    .point_ser (1, 2)
    .point_ser (2, 1)
    .point_ser (3, 3)
    .edge_ser (0, 0)
    .edge_ser_rev (1, 1)
    .edge_ser_rev (2, 2)
    .edge_ser_rev (3, 3)
    .build_isomorphism ()
  // log (iso.to_exp ())

  let iso2 = cx.isomorphic_to_polygon (verf)
  if (iso2 === null) {
    t.fail ()
  } else {
    // log (iso2.to_exp ())
    t.true (iso2.eq (iso))
  }

  t.true (
    verf.idx (
      torus.id ("polo"),
      torus.edge ("polo") .endpoints.id ("start"),
    ) .eq (new cx.id_t (0, 0))
  )
  t.true (
    verf.idx (
      torus.id ("polo"),
      torus.edge ("polo") .endpoints.id ("end"),
    ) .eq (new cx.id_t (0, 1))
  )
  t.true (
    verf.idx (
      torus.id ("toro"),
      torus.edge ("toro") .endpoints.id ("start"),
    ) .eq (new cx.id_t (0, 2))
  )
  t.true (
    verf.idx (
      torus.id ("toro"),
      torus.edge ("toro") .endpoints.id ("end"),
    ) .eq (new cx.id_t (0, 3))
  )

  torus.face ("surf") .polygon.vertex_id_array.map ((p, i) => {
    t.true (
      verf.idx (torus.id ("surf"), p) .eq (new cx.id_t (1, i)))
  })
})

test ("manifold_check", t => {
  let torus = new torus_t ()
  let manifold_evidence = cx.manifold_check (torus)
  if (manifold_evidence === null) {
    t.fail ()
  } else {
    t.pass ()
  }
})
