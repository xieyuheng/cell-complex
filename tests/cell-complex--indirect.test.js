import test from "ava"

import * as cx from "../lib/cell-complex--indirect"
import { torus_t } from "../lib/complexes/torus--indirect"
import * as ut from "../lib/util"

test ("cx.cell_complex_t.eq", t => {
  let torus = new torus_t ()
  // ut.log (new cx.polygon_t (3) .to_exp ())
  // ut.log (torus.to_exp ())

  t.true (torus.face ("surf") .dom.eq (new cx.polygon_t (4)))
})

test ("cx.cell_complex_t.from_exp", t => {
  let torus = new torus_t ()
  let exp = torus.to_exp ()
  let com = cx.cell_complex_t.from_exp (exp)
  t.deepEqual (exp, com.to_exp ())
})

test ("cx.manifold_check", t => {
  {
    let interval = new cx.interval_t ()
    let manifold_evidence = cx.manifold_check (interval)
    if (manifold_evidence === null) {
      t.pass ()
    } else {
      t.fail ()
    }
  }

  {
    let hundred_gon = new cx.polygon_t (100)
    let manifold_evidence = cx.manifold_check (hundred_gon)
    if (manifold_evidence === null) {
      t.fail ()
    } else {
      t.pass ()
    }
  }

  {
    let torus = new torus_t ()
    let manifold_evidence = cx.manifold_check (torus)
    if (manifold_evidence === null) {
      t.fail ()
    } else {
      t.pass ()
    }
  }
})

test ("cx.vertex_figure", t => {
  // the following test depends on
  //   the specific definition of `torus_t`,
  //   i.e. the orientation of edges and vertexes.

  let torus = new torus_t ()
  let verf = new cx.vertex_figure_t (torus, torus.id ("origin"))

  // ut.log (verf.to_exp ())

  let iso = new cx.morphism_builder_t (
    new cx.polygon_t (4), verf
  ) .vertex_ser (0, 0)
    .vertex_ser (1, 2)
    .vertex_ser (2, 1)
    .vertex_ser (3, 3)
    .edge_ser (0, 0)
    .edge_ser_rev (1, 1)
    .edge_ser_rev (2, 2)
    .edge_ser_rev (3, 3)
    .build_isomorphism ()
  // ut.log (iso.to_exp ())

  let iso2 = cx.isomorphic_to_polygon (verf)
  if (iso2 === null) {
    t.fail ()
  } else {
    // ut.log (iso2.to_exp ())
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

  torus.face ("surf") .polygon.vertex_id_array () .map ((p, i) => {
    t.true (
      verf.idx (torus.id ("surf"), p) .eq (new cx.id_t (1, i)))
  })
})
