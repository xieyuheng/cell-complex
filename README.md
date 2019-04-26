# Cicada Language

## Aims

- Formalize mathematical structures in existing languages
- Design new formal languages to formalize mathematical structures
  - Intuitive to use
  - Approachable for both mathematicians and programmers
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

- mathematical structures (in typescript):
  - set -- `set_t`, `eqv_t`, `not_eqv_t`
  - group -- `group_t`, `abelian_group_t`, `monoid_t`
  - field -- `field_t`
  - ring -- `ring_t`, `commutative_ring_t`, `integral_domain_t`
  - module -- `module_t`
  - vector-space -- `vector_space_t`
  - affine-space -- `affine_space_t`
  - category
    - `category_t`, `functor_t`, `natural_transformation_t`
    - `groupoid_t`

- combinatorial-game -- a game engine for n-player perfect information games
  - example games:
    - tic-tac-toe
    - hackenbush -- [demo](http://hackenbush.combinatorial-game.surge.sh/)

- cell-complex -- cell-complex based low dimensional algebraic topology library
  - example cell complexes:
    - torus

- homology -- cellular homology of cell-complex

- ndarray
  - `array_t` -- strides based row-major ndarray of number

- panel-data
  - `data_t` -- ndarray with named axes, where an axis maps labels to indexes
  - `frame_t` -- 1d `data_t`
  - `series_t` -- 2d `data_t`

- euclid -- affine-space with dot product
  - contains `matrix_t`, `vector_t` and `point_t`

- permutation -- `permutation_t` and `symmetric_group_t`

- [todo] cicada -- a dependently-typed programming language
  - game semantics
  - logic programming interface

## License

- [GPLv3](LICENSE)
