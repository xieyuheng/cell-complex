export
type player_t = "verifier" | "falsifier"

export
interface game_t {
  player (): player_t
  choices (): Array <choice_t>
  choose (c: choice_t): game_t
}

export
interface choice_t {

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

  player (): player_t { return "verifier" }

  choices (): Array <string> {
    return Array.from (this.map.keys ())
  }

  choose (c: string): game_t {
    return this.map.get (c) as game_t
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

  player (): player_t { return "falsifier" }

  choices (): Array <string> {
    return Array.from (this.map.keys ())
  }

  choose (c: string): game_t {
    return this.map.get (c) as game_t
  }
}

// TODO

// two stage ante and succ
// succ is disj_t or conj_t with local bindings

// export
// class arrow_t implements game_t {

// }

// TODO
// class sum_t implements game_t

// TODO
// class product_t implements game_t

// TODO
// class record_t implements game_t
