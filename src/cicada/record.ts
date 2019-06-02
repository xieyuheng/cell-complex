import assert from "assert"
import * as ut from "../util"
import * as gs from "./game-semantics"
import { path_t } from "./path"
import { ref_t } from "./ref"

export
class record_t extends gs.game_t {
  name: string
  map: Map <string, gs.game_t>

  constructor (
    name: string,
    map: Map <string, gs.game_t> | { [key: string]: gs.game_t },
  ) {
    super ()
    this.name = name
    if (map instanceof Map) {
      this.map = map
    } else {
      this.map = ut.obj2map (map)
    }
  }

  copy (): record_t {
    return new record_t (
      this.name,
      ut.mapmap (this.map, game => game.copy ()),
    )
  }

  choices (player: gs.player_t): Array <gs.choice_t> {
    // TODO
    return []
  }

  choose (path: path_t): record_t {
    let game: record_t = this.copy ()
    let next: gs.game_t = game
    for (let step of path.prefix ()) {
      next = step.forward (next)
    }
    path.target () .deref (next)
    return game
  }

  report (): object {
    return {
      "kind": "record_t",
      "name": this.name,
      "fields": ut.map2obj (ut.mapmap (
        this.map,
        game => game.report (),
      )),
      "end": this.end_p (),
    }
  }
}
