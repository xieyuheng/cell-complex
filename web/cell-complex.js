import { torus_t } from "../src/cell-complex"

let torus = new torus_t ()

let info = {
  torus,
  toro: torus.get_cell (torus.toro) .img,
}

console.log (info)

Object.assign (window, info)
