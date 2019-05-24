let cc = require ("../../lib/cicada/simple")

let true_t = cc.conj ("true_t", {})
let false_t = cc.conj ("false_t", {})
let bool_t = cc.disj ("bool_t", [ true_t, false_t ])

bool_t
  .report ()

bool_t
  .dot ("true_t")
  .report ()

let f1_t = cc.arrow ({
  "x": bool_t, "y": bool_t
}, bool_t)

console.log (0)

f1_t
  .report ()

console.log (1)

f1_t
  .dot ("true_t")
  .report ()

console.log (2)

f1_t
  .dot ("true_t")
  .dot ("false_t")
  .report ()

console.log (3)

f1_t
  .dot ("true_t")
  .dot ("false_t")
  .dot ("false_t")
  .report ()
