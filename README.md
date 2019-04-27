# Cicada Language

## Aims

- Implement and test mathematical theories in existing languages.
- Design new languages to formalize abstract mathematical structures.
- Questions are welcome, Your voices will guide me to solve the right problems.
  - [issues](https://github.com/xieyuheng/cicada/issues)

## Community

- We enforce C4 as collaboration protocol -- [The C4 RFC](https://rfc.zeromq.org/spec:42/C4)
- [Style Guide](STYLE-GUIDE.md) -- observe the style of existing code and respect it
- [Code of Conduct](CODE-OF-CONDUCT.md)
- Source code -- [github](https://github.com/xieyuheng/cicada), [gitlab](https://gitlab.com/xieyuheng/cicada/)
- IRC -- [#cicada-language](https://kiwiirc.com/nextclient/irc.freenode.net/#cicada-language)
- CI -- [gitlab-ci](https://gitlab.com/xieyuheng/cicada/pipelines)
- [cicada-rs](http://github.com/xieyuheng/cicada-rs) -- an old cicada attempt in rust

## Docs

- [API](https://api.cicada-lang.now.sh)

### Contents

- euclid
  - euclidean space -- affine space with dot product
    - `matrix_t`, `vector_t` and `point_t`
  - module over euclidean domain -- for generic algorithms

- combinatorial-game
  - a game engine for n-player perfect information games
  - example games:
    - tic-tac-toe
    - hackenbush -- [demo](http://hackenbush.combinatorial-game.surge.sh/)

- cell-complex
  - cell-complex based low dimensional algebraic topology library
  - example cell complexes:
    - torus

- homology
  - cellular homology of cell-complex

- [todo] cicada
  - a dependently-typed programming language
  - game semantics
  - logic programming interface

## License

- [GPLv3](LICENSE)
