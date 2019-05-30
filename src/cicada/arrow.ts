import assert from "assert"

import * as ut from "../util"

import * as gs from "./game-semantics"

/**
 * `arrow_t` has two stages: `ante` and `succ`,
 *   during `ante` player's roles are reversed.

 * Note that, during the play of `arrow_t`,
 *   there are not local naming and reference,
 *   those concepts are about strategy.
 */
export
class arrow_t extends gs.game_t {
  ante: ante_t
  succ: gs.game_t
  pass: boolean

  constructor (the: {
    ante: gs.game_t,
    succ: gs.game_t,
    pass?: boolean,
  }) {
    super ()
    assert (the.ante instanceof ante_t)
    this.ante = the.ante as ante_t
    this.succ = the.succ
    this.pass = the.pass !== undefined ? the.pass : false
  }

  get player (): gs.player_t {
    return ! this.pass
      ? this.ante.player
      : this.succ.player
  }

  get choices (): Array <gs.choice_t> {
    return ! this.pass
      ? this.ante.choices
      : this.succ.choices
  }

  report (): this {
    console.log (`kind: arrow_t`)
    console.group ("ante")
    this.ante.report ()
    console.groupEnd ()
    console.group ("succ")
    this.succ.report ()
    console.groupEnd ()
    console.log (`pass: ${this.pass}`)
    console.log (`player: ${this.player}`)
    console.log (`choices:`)
    for (let choice of this.choices) {
      console.log (`  ${choice.repr ()}`)
    }
    console.log (`end: ${this.end_p ()}`)
    return this
  }

  choose (choice: gs.choice_t): gs.game_t {
    if (! this.pass) {
      let next_ante = this.ante.choose (choice)
      let verifier_loss_p = next_ante.end_p ()
        && next_ante.player === "verifier"
      return new arrow_t ({
        ante: next_ante,
        succ: this.succ,
        pass: verifier_loss_p,
      })
    } else {
      return new arrow_t ({
        ante: this.ante,
        succ: this.succ.choose (choice),
        pass: true,
      })
    }
  }
}

/**
 * To win this game,
 *   the falsifier must win all games in map.
 */

export
class ante_t extends gs.game_t {
  map: Map <string, gs.game_t>
  cursor: number
  array: Array <{ name: string, game: gs.game_t}>

  constructor (
    map: Map <string, gs.game_t>,
    cursor?: number,
  ) {
    super ()
    this.map = map
    this.cursor = cursor !== undefined ? cursor : 0
    this.array = Array.from (map)
      .map (([ name, game ]) => ({ name, game }))
  }

  get current_name (): string {
    let { name } = this.array [this.cursor]
    return name
  }

  get current_game (): gs.game_t {
    let { game } = this.array [this.cursor]
    return game
  }

  get player (): gs.player_t {
    return gs.opponent_player (this.current_game.player)
  }

  get choices (): Array <gs.choice_t> {
    return this.current_game.choices
  }

  report (): this {
    console.log (`kind: ante_t`)
    console.log (`size: ${this.map.size}`)
    console.log (`cursor: ${this.cursor}`)
    console.log (`player: ${this.player}`)
    console.log (`choices:`)
    for (let choice of this.choices) {
      console.log (`  ${choice.repr ()}`)
    }
    console.log (`end: ${this.end_p ()}`)
    return this
  }

  choose (choice: gs.choice_t): gs.game_t {
    let next = this.current_game.choose (choice)
    let cursor = next.end_p ()
      && gs.opponent_player (next.player) === "verifier"
      ? this.cursor + 1
      : this.cursor
    if (cursor >= this.map.size) {
      // the last game is use for `.choices` and `end_p`
      cursor = cursor - 1
    }
    return new ante_t (
      new Map (this.map) .set (this.current_name, next),
      cursor,
    )
  }
}
