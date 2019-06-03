import assert from "assert"
import * as ut from "../util"
import * as gs from "./game-semantics"
import { path_t } from "./path"
import { ref_t } from "./ref"
import { record_t } from "./record"
import { module_t } from "./core"

export
class union_t extends gs.game_t {
  name: string
  sub_map: Map <string, gs.game_t>
  map: Map <string, gs.game_t>

  constructor (
    name: string,
    array: Array <gs.game_t>,
    map: Map <string, gs.game_t> | { [key: string]: gs.game_t } = new Map (),
  ) {
    super ()
    this.name = name
    this.sub_map = new Map ()
    for (let game of array) {
      if (game instanceof ref_t) {
        let ref = game
        this.sub_map.set (ref.name, ref)
      } else if (game instanceof record_t) {
        let record = game
        this.sub_map.set (record.name, record)
      } else {
        throw new Error ("sub game of union must be a ref_t or record_t")
      }
    }
    if (map instanceof Map) {
      this.map = map
    } else {
      this.map = ut.obj2map (map)
    }
  }

  copy (): union_t {
    return new union_t (
      this.name,
      Array.from (this.sub_map.values ())
        .map (game => game.copy ()),
    )
  }

  choices (player: gs.player_t): Array <gs.choice_t> {
    // TODO
    return []
  }

  choose (m: module_t, path: path_t): this {
    let next: gs.game_t = this
    for (let step of path.prefix ()) {
      next = step.forward (next)
    }
    path.target () .deref (m, next)
    return this
  }

  report (): object {
    return {
      "kind": "union_t",
      "name": this.name,
      "members": ut.map2obj (ut.mapmap (
        this.sub_map,
        game => game.report (),
      )),
      "end": this.end_p (),
    }
  }
}
