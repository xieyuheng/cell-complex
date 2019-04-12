# Cicada Language

## Aims

- Formalize mathematical structures in existing languages
- Design new formal languages to formalize mathematical structures
  - Intuitive to use
  - Approachable for both mathematicians and programmers

## Contents

- combinatorial-game -- A game engine for n-player perfect information games
- cell-complex -- Cell-complex based low dimensional algebraic topology library
  - [paper](https://xieyuheng.github.io/writing/investigations-into-cell-complex.html)
  -- "Investigations into cell complex", by Xie Yuheng, 2019
- ndarray -- Strides based row-major ndarray of number
- euclidean-space -- affine-space with dot product
  - contains `matrix_t`, `vector_t` and `point_t`
- [WIP] cicada -- A dependently-typed programming language with game semantics
  - Logic programming interface
  - Class with multi-inheritance

## Docs

- [API](http://api.cicada.surge.sh)

## Community

- We enforce C4 as collaboration protocol -- [The C4 RFC](https://rfc.zeromq.org/spec:42/C4)
- [Style Guide](STYLE-GUIDE.md) -- observe the style of existing code and respect it
- See [cicada-rs](http://github.com/xieyuheng/cicada-rs) old cicada attempt in rust
- IRC -- #cicada-language (at freenode)
- [Contributor Covenant Code of Conduct](CODE-OF-CONDUCT.md)

## License

- [GPLv3](LICENSE)
