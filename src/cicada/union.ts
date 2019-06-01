import assert from "assert"
import * as ut from "../util"
import * as gs from "./game-semantics"
import { path_t, step_t } from "./path"
import { ref_t } from "./ref"

export
class member_t extends step_t {
  name: string

  constructor (
    name: string
  ) {
    super ()
    this.name = name
  }

  forward (game: gs.game_t): gs.game_t {
    if (game instanceof union_t) {
      let union = game
      let next_game = union.map.get (this.name)
      if (next_game === undefined) {
        throw new Error (`unknown field name: ${this.name}`)
      } else {
        return next_game
      }
    } else {
      throw new Error ("field_t step only forward an union_t")
    }
  }

  deref (game: gs.game_t) {
    if (game instanceof union_t) {
      let union = game
      let next_game = union.map.get (this.name)
      if (next_game === undefined) {
        throw new Error (`unknown field name: ${this.name}`)
      } else if (next_game instanceof ref_t) {
        let ref = next_game
        union.map.set (this.name, ref.deref ())
      } else {
        throw new Error (`can not deref a non ref_t`)
      }
    } else {
      throw new Error ("field_t step only deref an union_t")
    }
  }

  repr (): any {
    return this.name
  }
}

export
class union_t extends gs.game_t {
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

  copy (): union_t {
    return new union_t (
      this.name,
      ut.mapmap (this.map, game => game.copy ()),
    )
  }

  choices (player: gs.player_t): Array <gs.choice_t> {
    // TODO
    return []
  }

  choose (path: path_t): union_t {
    let game: union_t = this.copy ()
    let next: gs.game_t = game
    for (let step of path.prefix ()) {
      next = step.forward (next)
    }
    path.target () .deref (next)
    return game
  }

  report (): object {
    return {
      "kind": "union_t",
      "name": this.name,
      "members": ut.map2obj (ut.mapmap (
        this.map,
        game => game.report (),
      )),
      "end": this.end_p (),
    }
  }
}
