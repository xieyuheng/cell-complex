# Cicada Language

## Aims

- Formalize mathematical structures in existing languages
- Design new formal languages to formalize mathematical structures
  - Intuitive to use
  - Approachable for both mathematicians and programmers
- Questions and pull requests are welcome, Your voices will guide me to solve the right problems.
  -- [issues](https://github.com/xieyuheng/cicada/issues)

## Contents

- combinatorial-game -- a game engine for n-player perfect information games
  - example games:
    - tic-tac-toe
    - hackenbush
      -- [early demo](http://hackenbush.combinatorial-game.surge.sh/)

- cell-complex -- cell-complex based low dimensional algebraic topology library
  - "Investigations into cell complex", by Xie Yuheng, 2019
    -- [paper](https://xieyuheng.github.io/writing/investigations-into-cell-complex.html)
  - example cell complexes:
    - torus

- ndarray
  - `array_t` -- strides based row-major ndarray of number
  - `data_t` -- ndarray with named axes, where an axis maps labels to indexes.

- formalized abstract mathematical structures (in typescript):
  - `set_t`
  - `group_t`, `abelian_group_t`
  - `field_t`
  - `vector_space_t`, `affine_space_t`

- euclidean-space -- `affine_space_t` with dot product
  - contains `matrix_t`, `vector_t` and `point_t`

- permutation -- `permutation_t` and `symmetric_group_t`

- [todo] cicada -- a dependently-typed programming language with game semantics
  - logic programming interface
  - class with multi-inheritance

## Docs

- [API](http://api.cicada.surge.sh)

## Community

- We enforce C4 as collaboration protocol -- [The C4 RFC](https://rfc.zeromq.org/spec:42/C4)
- [Style Guide](STYLE-GUIDE.md) -- observe the style of existing code and respect it
- [cicada-rs](http://github.com/xieyuheng/cicada-rs) -- an old cicada attempt in rust
- IRC -- #cicada-language (at freenode)
- [Contributor Covenant Code of Conduct](CODE-OF-CONDUCT.md)

## License

- [GPLv3](LICENSE)
