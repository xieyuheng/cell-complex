let cc = require ("../../lib/cicada/simple")

let true_t = cc.conj ("true_t", {})
let false_t = cc.conj ("false_t", {})
let bool_t = cc.disj ("bool_t", [ true_t, false_t ])

bool_t
  .info (0)
  .dot ("true_t") .info (1)

let f1_t = cc.arrow ({
  "x": bool_t, "y": bool_t
}, bool_t)

f1_t
  .info (0)
  .dot ("true_t") .info (1)
  .dot ("false_t") .info (2)
  .dot ("false_t") .info (3)
