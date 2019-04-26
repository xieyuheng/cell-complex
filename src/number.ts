
declare global {
  interface Number {
    six: number
  }
}

Number.prototype.six = 666

export
let x = 10000

console.log (x.six)
