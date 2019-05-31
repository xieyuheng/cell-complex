import assert from "assert"
import * as ut from "../util"
import * as gs from "./game-semantics"
import { path_t, step_t } from "./path"
import { ref_t } from "./ref"

export
class arg_t extends step_t {
  name: string

  constructor (name: string) {
    super ()
    this.name = name
  }

  forward (game: gs.game_t): gs.game_t {
    if (game instanceof arrow_t) {
      let arrow = game
      let next_game = arrow.args.get (this.name)
      if (next_game === undefined) {
        throw new Error (`unknown arg name: ${this.name}`)
      } else {
        return next_game
      }
    } else {
      throw new Error ("arg_t step only forward an arrow_t")
    }
  }

  deref (game: gs.game_t) {
    throw new Error ("can not deref arg_t")
  }

  repr (): any {
    return "@" + this.name
  }
}

export
class ret_t extends step_t {
  constructor () {
    super ()
  }

  forward (game: gs.game_t): gs.game_t {
    if (game instanceof arrow_t) {
      let arrow = game
      return arrow.ret
    } else {
      throw new Error ("ret_t step only forward an arrow_t")
    }
  }

  deref (game: gs.game_t) {
    throw new Error ("can not deref ret_t")
  }

  repr (): any {
    return "$ret"
  }
}

/**
 * `arrow_t` has two stages: `args` and `ret`,
 *   during `args` player's roles are reversed.
 */
export
class arrow_t extends gs.game_t {
  args: Map <string, gs.game_t>
  ret: gs.game_t

  constructor (
    args: Map <string, gs.game_t>,
    ret: gs.game_t,
  ) {
    super ()
    this.args = args
    this.ret = ret
  }

  copy (): arrow_t {
    return new arrow_t (
      ut.mapmap (this.args, game => game.copy ()),
      this.ret.copy (),
    )
  }

  choices (player: gs.player_t): Array <gs.choice_t> {
    // TODO
    return []
  }

  choose (path: path_t): arrow_t {
    let game: arrow_t = this.copy ()
    let next: gs.game_t = game
    for (let step of path.prefix ()) {
      next = step.forward (next)
    }
    path.target () .deref (next)
    return game
  }

  report (): object {
    let args: { [key: string]: any } = {}
    for (let [name, game] of this.args.entries ()) {
      args [name] = game.report ()
    }
    return {
      "kind": "arrow_t",
      "args": args,
      "ret": this.ret.report (),
      "end": this.end_p (),
    }
  }
}
