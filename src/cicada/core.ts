/**
 * Game semantics of dependent type system.
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
abstract class game_t {
  abstract player: player_t
  abstract choices: Array <choice_t>
  abstract choose (choice: choice_t): game_t
  abstract report (): this

  info (label: string): this {
    console.group (label)
    this.report ()
    console.groupEnd ()
    return this
  }

  dot (name: string): game_t {
    return this.choose (new dot_t (name))
  }
}

export
class module_t {
  game_map: Map <string, game_t>

  constructor () {
    this.game_map = new Map ()
  }

  define (name: string, game: game_t): this {
    this.game_map.set (name, game)
    return this
  }

  game (name: string): game_t {
    let game = this.game_map.get (name)
    if (game !== undefined) {
      return game
    } else {
      throw new Error (`undefined game: ${name}`)
    }
  }

  union (name: string, array: Array <string>): this {
    let map = new Map ()
    for (let sub_name of array) {
      map.set (sub_name, new ref_t (this, sub_name))
    }
    this.define (name, new union_t (name, map))
    return this
  }

  record (name: string, obj: { [key: string]: string }): this {
    // TODO should be obj: { [key: string]: exp_t }
    let map = ut.mapmap (
      ut.obj2map (obj),
      (sub_name) => new ref_t (this, sub_name),
    )
    this.define (name, new record_t (name, map))
    return this
  }
}

export
class ref_t extends game_t {
  module: module_t
  name: string

  constructor (module: module_t, name: string) {
    super ()
    this.module = module
    this.name = name
  }

  get player (): player_t {
    let game = this.module.game (this.name)
    return game.player
  }

  get choices (): Array <choice_t> {
    let game = this.module.game (this.name)
    return game.choices
  }

  choose (choice: choice_t): game_t {
    let game = this.module.game (this.name)
    return game.choose (choice)
  }

  report (): this {
    let game = this.module.game (this.name)
    game.report ()
    return this
  }
}

/**
 * type of types, game of games.
 */
export
class type_t extends game_t {
  /**
   * `type_t` is like a dynamic union,
   *   thus its player is verifier.
   */
  get player (): player_t { return "verifier" }

  get choices (): Array <choice_t> {
    throw new Error ("TODO")
  }

  choose (choice: choice_t): game_t {
    throw new Error ("TODO")
  }

  report (): this {
    console.log (`kind: type_t`)
    console.log (`player: ${this.player}`)
    // TODO
    return this
  }
}

export
function type (): () => type_t {
  return () => new type_t ()
}

export
function end_p (game: game_t): boolean {
  /**
   * normal play -- current player loss.
   */
  return game.choices.length === 0
}

export
abstract class choice_t {
  abstract repr (): string
}

export
class pause_t extends game_t {
  resume: () => game_t

  constructor (resume: () => game_t) {
    super ()
    this.resume = resume
  }

  get player (): player_t {
    return this.resume () .player
  }

  get choices (): Array <choice_t> {
    return this.resume () .choices
  }

  choose (choice: choice_t): game_t {
    return this.resume () .choose (choice)
  }

  report (): this {
    this.resume () .report ()
    return this
  }
}

export
function pause (resume: () => game_t): pause_t {
  return new pause_t (resume)
}

export
class dot_t extends choice_t {
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

export
class union_t extends game_t {
  name: string
  map: Map <string, game_t>

  constructor (
    name: string,
    map: Map <string, game_t>,
  ) {
    super ()
    this.name = name
    this.map = map
  }

  get player (): player_t { return "verifier" }

  get choices (): Array <choice_t> {
    return Array.from (this.map.keys ())
      .map (name => (new dot_t (name)))
  }

  report (): this {
    console.log (`kind: union_t`)
    console.log (`name: ${this.name}`)
    console.log (`player: ${this.player}`)
    console.log (`choices:`)
    for (let choice of this.choices) {
      console.log (`  ${choice.repr ()}`)
    }
    console.log (`end: ${end_p (this)}`)
    return this
  }

  choose (dot: dot_t): game_t {
    let game = this.map.get (dot.name)
    if (game === undefined) {
      throw new Error (`unknown dot.name: ${dot.name}`)
    } else {
      return game
    }
  }
}

export
function union (
  name: string,
  array: Array <record_t | union_t>,
): union_t {
  let map = new Map ()
  for (let game of array) {
    map.set (game.name, game)
  }
  return new union_t (name, map)
}

export
class record_t extends game_t {
  name: string
  map: Map <string, game_t>

  constructor (
    name: string,
    map: Map <string, game_t>,
  ) {
    super ()
    this.name = name
    this.map = map
  }

  get player (): player_t { return "falsifier" }

  get choices (): Array <choice_t> {
    return Array.from (this.map.keys ())
      .map (name => (new dot_t (name)))
  }

  report (): this {
    console.log (`kind: record_t`)
    console.log (`name: ${this.name}`)
    console.log (`player: ${this.player}`)
    console.log (`choices:`)
    for (let choice of this.choices) {
      console.log (`  ${choice.repr ()}`)
    }
    console.log (`end: ${end_p (this)}`)
    return this
  }

  choose (dot: dot_t): game_t {
    let game = this.map.get (dot.name)
    if (game === undefined) {
      throw new Error (`unknown dot.name: ${dot.name}`)
    } else {
      return game
    }
  }
}

export
function record (
  name: string,
  obj: { [key: string]: game_t },
): record_t {
  let map = ut.obj2map (obj)
  return new record_t (name, map)
}

/**
 * `arrow_t` has two stages: `ante` and `succ`,
 *   during `ante` player's roles are reversed.

 * Note that, during the play of `arrow_t`,
 *   there are not local naming and reference,
 *   those concepts are about strategy.
 */
export
class arrow_t extends game_t {
  ante: ante_t
  succ: game_t
  pass: boolean

  constructor (the: {
    ante: game_t,
    succ: game_t,
    pass?: boolean,
  }) {
    super ()
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
    console.log (`end: ${end_p (this)}`)
    return this
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
class ante_t extends game_t {
  map: Map <string, game_t>
  cursor: number
  array: Array <{ name: string, game: game_t}>

  constructor (
    map: Map <string, game_t>,
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

  report (): this {
    console.log (`kind: ante_t`)
    console.log (`size: ${this.map.size}`)
    console.log (`cursor: ${this.cursor}`)
    console.log (`player: ${this.player}`)
    console.log (`choices:`)
    for (let choice of this.choices) {
      console.log (`  ${choice.repr ()}`)
    }
    console.log (`end: ${end_p (this)}`)
    return this
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

export
function arrow (
  obj: { [key: string]: game_t },
  succ: game_t,
): arrow_t {
  let map = ut.obj2map (obj)
  let ante = new ante_t (map)
  return new arrow_t ({ ante, succ })
}

/**
 * A strategy for a player,
 *   gives instruction for the player at each choice.
 * Imagining you are a game master in China,
 *   and you can not travel to Japan for a championship,
 *   so a friend have to play the championship on behalf of you,
 *   and you have to teach your strategy to your friend.
 * A strategy must thought of all the possible choices,
 *   specially those tough choices,
 *   induced by the opponent player's good moves.
 */
export
abstract class strategy_t {
  abstract player: player_t
}

// TODO
// to win a game of game is to provide any game

/**
 * verifier's winning strategy is called verification (or proof).
 */
export
abstract class verification_t extends strategy_t {
  player: player_t = "verifier"
}

/**
 * falsifier's winning strategy is called falsification.
 */
export
abstract class falsification_t extends strategy_t {
  player: player_t = "falsifier"
}

/**
 * the verification of a union,
 *   is to provide a member of the union.
 */
export
class member_t extends verification_t {
  // TODO
}

/**
 * the verification of a record,
 *   is to fill in all the fields of the record.
 */
export
class fulfill_t extends verification_t {
  // TODO
}

/**
 * it is fun to verify an arrow.
 * the verification of an arrow,
 *   is a falsification of its ante,
 *   and a verification of its succ,
 *     with reference to the falsification of its ante.
 */
export
class fun_t extends verification_t {
  // TODO
}

// TODO
// strategy.wins (game: game_t): true | Error
// game.use (strategy: strategy_t): test_t
