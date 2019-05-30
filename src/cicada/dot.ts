import assert from "assert"

import * as ut from "../util"

import * as gs from "./game-semantics"

export
class dot_t extends gs.choice_t {
  name: string

  constructor (
    name: string,
  ) {
    super ()
    this.name = name
  }

  repr (): string {
    return "." + this.name
  }
}
