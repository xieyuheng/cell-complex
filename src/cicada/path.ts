import assert from "assert"
import * as ut from "../util"
import * as gs from "./game-semantics"

export
abstract class step_t {
  abstract forward (game: gs.game_t): gs.game_t
  abstract deref (game: gs.game_t): void

  abstract repr (): any
}

export
class path_t extends gs.choice_t {
  readonly steps: Array <step_t>

  constructor (
    steps: Array <step_t>
  ) {
    super ()
    this.steps = steps
  }

  target (): step_t {
    if (this.steps.length === 0) {
      throw new Error ("Can not get target of empty path.")
    }
    return this.steps [this.steps.length - 1]
  }

  prefix (): Array <step_t> {
    if (this.steps.length === 0) {
      throw new Error ("Can not get prefix of empty path.")
    }
    return this.steps.slice (0, this.steps.length - 1)
  }

  report (): Array <any> {
    return this.steps.map (step => step.repr ())
  }
}
