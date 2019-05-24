let cc = require ("cicada-lang/lib/cicada/simple")

{
  {
    let true_t = cc.conj ("true_t", {})
    let false_t = cc.conj ("false_t", {})
    let bool_t = cc.disj ("bool_t", [ true_t, false_t ])
  }

  let true_t = new cc.conj_t ("true_t", new Map ())
  let false_t = new cc.conj_t ("false_t", new Map ())
  let bool_t = new cc.disj_t (
    "bool_t", new Map ([
      ["true_t", true_t],
      ["false_t", false_t],
    ])
  )

  // bool_t.report ()
  // bool_t.choose (new dot_t ("true_t")) .report ()

  let f1_t = new cc.arrow_t ({
    ante: new cc.ante_t (new Map ([
      ["x", bool_t],
      ["y", bool_t],
    ])),
    succ: bool_t,
  })

  console.log (0)

  f1_t.report ()

  console.log (1)

  f1_t
    .choose (new cc.dot_t ("true_t"))
    .report ()

  console.log (2)

  f1_t
    .choose (new cc.dot_t ("true_t"))
    .choose (new cc.dot_t ("false_t"))
    .report ()

  console.log (3)

  f1_t
    .choose (new cc.dot_t ("true_t"))
    .choose (new cc.dot_t ("false_t"))
    .choose (new cc.dot_t ("false_t"))
    .report ()
}
