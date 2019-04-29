#### [`examples/linear-algebra.ts`](https://github.com/xieyuheng/cicada/blob/master/examples/linear-algebra.ts):

``` typescript
import assert from "assert"

import * as ut from "cicada-lang/lib/util"
import * as eu from "cicada-lang/lib/euclid"

let A = eu.matrix ([
  [1, 3, 1, 9],
  [1, 1, -1, 1],
  [3, 11, 5, 35],
])

let B = eu.matrix ([
  [1, 0, -2, -3],
  [0, 1, 1, 4],
  [0, 0, 0, 0],
])

assert (
  A.reduced_row_echelon_form () .eq (B)
)
```
