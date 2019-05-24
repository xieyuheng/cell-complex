/**
 * Game semantics of simple (non-dependent) type system.
 */

import assert from "assert"

import * as ut from "../util"

export
type player_t = "verifier" | "falsifier"

export
function opponent_player (player: player_t) {
  return player === "verifier"
    ? "falsifier"
    : "verifier"
}

/**
 * constrains:
 * - normal play
 * - no draw
 * - each game only have one valid player
 *   i.e. the order of play is always controlled by the game
 */

export
interface game_t {
  player: player_t
  choices: Array <choice_t>
  choose (choice: choice_t): game_t
  eq (that: game_t): boolean
  report (): void
}

export
function end_p (game: game_t): boolean {
  /**
   * normal play -- current player loss.
   */
  return game.choices.length === 0
}

export
interface choice_t {
  repr (): string
}

export
class dot_t implements choice_t {
  name: string

  constructor (
    name: string,
  ) {
    this.name = name
  }

  repr (): string {
    return "." + this.name
  }
}

export
class disj_t implements game_t {
  name: string
  map: Map <string, game_t>

  constructor (
    name: string,
    map: Map <string, game_t>,
  ) {
    this.name = name
    this.map = map
  }

  get player (): player_t { return "verifier" }

  get choices (): Array <choice_t> {
    return Array.from (this.map.keys ())
      .map (name => (new dot_t (name)))
  }

  eq (that: game_t): boolean {
    return that instanceof disj_t
      && that.name === this.name
      && ut.map_eq (that.map, this.map, (x, y) => x.eq (y))
  }

  report () {
    console.log (`kind: disj_t`)
    console.log (`name: ${this.name}`)
    console.log (`player: ${this.player}`)
    console.log (`choices:`)
    for (let choice of this.choices) {
      console.log (`  ${choice.repr ()}`)
    }
    console.log (`end: ${end_p (this)}`)
  }

  choose (dot: dot_t): game_t {
    return this.map.get (dot.name) as game_t
  }
}

export
function disj (
  name: string,
  array: Array <conj_t | disj_t>,
): conj_t {
  let map = new Map ()
  for (let game of array) {
    map.set (game.name, game)
  }
  return new disj_t (name, map)
}

export
class conj_t implements game_t {
  name: string
  map: Map <string, game_t>

  constructor (
    name: string,
    map: Map <string, game_t>,
  ) {
    this.name = name
    this.map = map
  }

  get player (): player_t { return "falsifier" }

  get choices (): Array <choice_t> {
    return Array.from (this.map.keys ())
      .map (name => (new dot_t (name)))
  }

  eq (that: game_t): boolean {
    return that instanceof conj_t
      && that.name === this.name
      && ut.map_eq (that.map, this.map, (x, y) => x.eq (y))
  }

  report () {
    console.log (`kind: conj_t`)
    console.log (`name: ${this.name}`)
    console.log (`player: ${this.player}`)
    console.log (`choices:`)
    for (let choice of this.choices) {
      console.log (`  ${choice.repr ()}`)
    }
    console.log (`end: ${end_p (this)}`)
  }

  choose (dot: dot_t): game_t {
    return this.map.get (dot.name) as game_t
  }
}

export
function conj (
  name: string,
  obj: { [key: string]: game_t },
): conj_t {
  let map = ut.obj2map (obj)
  return new conj_t (name, map)
}

/**
 * `arrow_t` has two stages: `ante` and `succ`,
 *   during `ante` player's roles are reversed.

 * Note that, during the play of `arrow_t`,
 *   there are not local naming and reference,
 *   those concepts are about strategy.
 */
export
class arrow_t implements game_t {
  ante: ante_t
  succ: game_t
  pass: boolean

  constructor (the: {
    ante: game_t,
    succ: game_t,
    pass?: boolean,
  }) {
    assert (the.ante instanceof ante_t)
    this.ante = the.ante as ante_t
    this.succ = the.succ
    this.pass = the.pass !== undefined ? the.pass : false
  }

  get player (): player_t {
    return ! this.pass
      ? this.ante.player
      : this.succ.player
  }

  get choices (): Array <choice_t> {
    return ! this.pass
      ? this.ante.choices
      : this.succ.choices
  }

  eq (that: game_t): boolean {
    return that instanceof arrow_t
      && that.pass === this.pass
      && that.ante.eq (this.ante)
      && that.succ.eq (this.succ)
  }

  report () {
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
    console.log (`end: ${end_p (this)}`)
  }

  choose (choice: choice_t): game_t {
    if (! this.pass) {
      let next_ante = this.ante.choose (choice)
      let verifier_loss_p = end_p (next_ante)
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
class ante_t implements game_t {
  map: Map <string, game_t>
  cursor: number
  array: Array <{ name: string, game: game_t}>

  constructor (
    map: Map <string, game_t>,
    cursor?: number,
  ) {
    this.map = map
    this.cursor = cursor !== undefined ? cursor : 0
    this.array = Array.from (map)
      .map (([ name, game ]) => ({ name, game }))
  }

  get current_name (): string {
    let { name } = this.array [this.cursor]
    return name
  }

  get current_game (): game_t {
    let { game } = this.array [this.cursor]
    return game
  }

  get player (): player_t {
    return opponent_player (this.current_game.player)
  }

  get choices (): Array <choice_t> {
    return this.current_game.choices
  }

  eq (that: game_t): boolean {
    return that instanceof ante_t
      && that.cursor === this.cursor
      && ut.map_eq (that.map, this.map, (x, y) => x.eq (y))
  }

  report () {
    console.log (`kind: ante_t`)
    console.log (`size: ${this.map.size}`)
    console.log (`cursor: ${this.cursor}`)
    console.log (`player: ${this.player}`)
    console.log (`choices:`)
    for (let choice of this.choices) {
      console.log (`  ${choice.repr ()}`)
    }
    console.log (`end: ${end_p (this)}`)
  }

  choose (choice: choice_t): game_t {
    let next = this.current_game.choose (choice)
    let cursor = end_p (next)
      && opponent_player (next.player) === "verifier"
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

// TODO
// export function arrow

// TODO
// class sum_t implements game_t

// TODO
// class product_t implements game_t

// TODO
// class record_t implements game_t

export
class strategy_t {
  // TODO
}
