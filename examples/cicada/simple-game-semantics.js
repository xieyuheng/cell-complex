let cc = require ("../../lib/cicada/simple")

let true_t = cc.conj ("true_t", {})
let false_t = cc.conj ("false_t", {})
let bool_t = cc.disj ("bool_t", [ true_t, false_t ])

bool_t
  .report ()
  .dot ("true_t") .report ()

let f1_t = cc.arrow ({
  "x": bool_t, "y": bool_t
}, bool_t)

f1_t
  .report ()
  .dot ("true_t") .report ()
  .dot ("false_t") .report ()
  .dot ("false_t") .report ()
