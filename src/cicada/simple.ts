export
type player_t = "verifier" | "falsifier"

export
interface game_t {
  player: player_t
  choices: Array <choice_t>
  choose (c: choice_t): game_t
}

export
function player_switch (player: player_t) {
  return player === "verifier"
    ? "falsifier"
    : "verifier"
}

export
interface choice_t {
}

export
class dot_t implements choice_t {
  name: string

  constructor (
    name: string,
  ) {
    this.name = name
  }
}

export
class ref_t implements choice_t {
  name: string

  constructor (
    name: string,
  ) {
    this.name = name
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

  choose (dot: dot_t): game_t {
    return this.map.get (dot.name) as game_t
  }
}

export
class binding_t implements choice_t {
  name: string
  choice: choice_t

  constructor (
    name: string,
    choice: choice_t,
  ) {
    this.name = name
    this.choice = choice
  }
}

// TODO

/**
 * `arrow_t` has two stages:
 *  `ante` create bindings
 *  `succ` use bindings
 */

export
class arrow_t implements game_t {
  ante: game_t
  succ: game_t
  pass: boolean

  constructor (
    ante: game_t,
    succ: game_t,
    pass?: boolean,
  ) {
    this.ante = ante
    this.succ = succ
    this.pass = pass === undefined ? false : pass
  }

  get player (): player_t {
    return this.pass
      ? player_switch (this.ante.player)
      : this.succ.player
  }

  get choices (): Array <choice_t> {
    return this.pass
      ? this.ante.choices
      : this.succ.choices
  }

  choose (ch: choice_t): game_t {
    return this.pass
      ? new arrow_t (this.ante, this.succ.choose (ch), this.pass)
      : new arrow_t (this.ante.choose (ch), this.succ, this.pass)
  }
}

// TODO
// class sum_t implements game_t

// TODO
// class product_t implements game_t

// TODO
// class record_t implements game_t
