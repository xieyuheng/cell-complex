export
interface game_t <C> {
  verify (c: C): game_t <C>
  falsify (c: C): game_t <C>
  verifications (): Array <C>
  falsifications (): Array <C>
}

// export
// function disj <A, B> (
//   x: game_t <A>,
//   y: game_t <B>,
// ): game_t <A | B> {
//   throw new Error ("><")
// }

// export
// function conj <A, B> (
//   x: game_t <A>,
//   y: game_t <B>,
// ): game_t <A | B> {
//   throw new Error ("><")
// }
