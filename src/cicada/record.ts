import assert from "assert"
import * as ut from "../util"
import * as gs from "./game-semantics"
import { path_t, step_t } from "./path"
import { ref_t } from "./ref"

export
class field_t extends step_t {
  name: string

  constructor (
    name: string
  ) {
    super ()
    this.name = name
  }

  forward (game: gs.game_t): gs.game_t {
    if (game instanceof record_t) {
      let record = game
      let next_game = record.map.get (this.name)
      if (next_game === undefined) {
        throw new Error (`unknown field name: ${this.name}`)
      } else {
        return next_game
      }
    } else {
      throw new Error ("field_t step only forward a record_t")
    }
  }

  deref (game: gs.game_t) {
    if (game instanceof record_t) {
      let record = game
      let next_game = record.map.get (this.name)
      if (next_game === undefined) {
        throw new Error (`unknown field name: ${this.name}`)
      } else if (next_game instanceof ref_t) {
        let ref = next_game
        record.map.set (this.name, ref.deref ())
      } else {
        throw new Error (`can not deref a non ref_t`)
      }
    } else {
      throw new Error ("field_t step only deref a record_t")
    }
  }

  repr (): any {
    return this.name
  }
}

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
