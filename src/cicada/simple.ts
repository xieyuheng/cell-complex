/**
 * Game semantics of simple (non-dependent) type system.
 */

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

/**
 * `arrow_t` has two stages:
 *  `ante` create bindings
 *  `succ` use bindings -- by `ref_t`
 */

export
class ref_t implements choice_t {
  name: string

  constructor (
    name: string,
  ) {
    this.name = name
  }

  repr (): string {
    return "@" + this.name
  }
}

export
class arrow_t implements game_t {
  ante: game_t
  // TODO
  // ante: ante_t
  succ: game_t
  pass: boolean

  constructor (the: {
    ante: game_t,
    succ: game_t,
    pass?: boolean,
  }) {
    this.ante = the.ante
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
      : this.succ.choices.concat (
        Array.from ((this.ante as ante_t) .map.keys ())
          .map (name => (new ref_t (name)))
      )
  }

  eq (that: game_t): boolean {
    return that instanceof arrow_t
      && that.pass === this.pass
      && that.ante.eq (this.ante)
      && that.succ.eq (this.succ)
  }

  report () {
    console.log (`kind: arrow_t`)
    // TODO
    console.group ()
    this.ante.report ()
    console.groupEnd ()
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
      if (choice instanceof ref_t) {
        let ref: ref_t = choice
        let ante = this.ante as ante_t
        let game = ante.map.get (ref.name) as game_t
        if (game.eq (this.succ)) {
          return new arrow_t ({
            ante: this.ante,
            succ: new conj_t ("true_t", new Map ()),
            pass: true,
          })
        } else {
          throw new Error ("TODO")
        }
      } else {
        return new arrow_t ({
          ante: this.ante,
          succ: this.succ.choose (choice),
          pass: true,
        })
      }
    }
  }
}

/**
 * Player's role is reversed in this game.
 * To win this game,
 *   the falsifier must win all games in map.
 */

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
      && that.map === this.map // TODO
  }

  report () {
    console.log (`kind: ante_t`)
    // TODO
    console.log (`player: ${this.player}`)
    console.log (`choices:`)
    for (let choice of this.choices) {
      console.log (`  ${choice.repr ()}`)
    }
    console.log (`end: ${end_p (this)}`)
  }

  choose (choice: choice_t): game_t {
    let next = this.current_game.choose (choice)
    let cursor = end_p (next) && this.player !== "falsifier"
      ? this.cursor + 1
      : this.cursor
    return new ante_t (
      new Map (this.map) .set (this.current_name, next),
      cursor,
    )
  }
}

// TODO
// class sum_t implements game_t

// TODO
// class product_t implements game_t

// TODO
// class record_t implements game_t

// TEST

{
  let true_t = new conj_t ("true_t", new Map ())
  let false_t = new conj_t ("false_t", new Map ())
  let bool_t = new disj_t (
    "bool_t", new Map ([
      ["true_t", true_t],
      ["false_t", false_t],
    ])
  )

  // bool_t.report ()
  // bool_t.choose (new dot_t ("true_t")) .report ()

  let f1_t = new arrow_t ({
    ante: new ante_t (new Map ([
      ["x", bool_t],
      ["y", bool_t],
    ])),
    succ: bool_t,
  })

  f1_t.report ()
  // f1_t.choose (new dot_t ("true_t")) .report ()
}

// TODO
// export function conj

// TODO
// export function disj

// TODO
// export function arrow

// {
//   let true_t = conj ("true_t", {})
//   let false_t = conj ("false_t", {})
//   let bool_t = disj ("bool_t", [ true_t, false_t ])
// }
