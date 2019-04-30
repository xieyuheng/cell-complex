let num = require ("../lib/num")

let f0 = num.matrix_t.zeros (512, 512) .transpose ()
let f1 = num.matrix_t.zeros (512, 512) .transpose ()
let c0 = num.matrix_t.zeros (512, 512)
let c1 = num.matrix_t.zeros (512, 512)

let ones = num.matrix_t.ones (512, 512)

function test (a, b) {
  a.update_add (b.update_scale (0.5)) .update_add (ones)
}

function bench (a, b, n) {
  let start = new Date ()
  for (let i = 0; i < n; i++) {
    test (a, b)
  }
  let end = new Date ()
  console.log (`${end - start} ms, for ${n} times`)
}

// time should under 1000 when n is 1000
bench (c0, c1, 100)
bench (f0, f1, 100)
bench (c0, f1, 100)
bench (f0, c1, 100)
