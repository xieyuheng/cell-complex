> 唯夫蟬之清素兮 潛厥類乎太陰  
> 在炎陽之仲夏兮 始游豫乎芳林  
> 實淡泊而寡欲兮 獨咍樂而長吟  
> 聲噭噭而彌厲兮 似貞士之介心  
> -- 蟬賦 曹植  

# Cicada Language // 蟬語

Aims :
- formalizing mathematical structures
- design formal languages to formalize mathematical structures
  - intuitive to use
  - approachable for both mathematicians and programmers

Features :
- game semantics
- dependently-typed
- logic programming interface
- with nominal subtyping

## Docs

- [API](http://api.cicada.surge.sh)

## Combinatorial Game Engine

- game classes:
  - combinatorial-game -- n-player perfect information games

- theories:
  - (todo) surreal -- a library for surreal number
    - theory about two-player normal-ending game

- game collection:
  - tic-tac-toe
  - hackenbush
    [(early demo)](http://hackenbush.cicada.surge.sh)
  - (todo) dots-and-boxes
  - (todo) go

- game semantics:
  - (todo) fol -- game semantics of first order logic
  - (todo) cl -- game semantics of constructive logic

## Algebraic Topology Library

- [paper](https://xieyuheng.github.io/writing/investigations-into-cell-complex.html)
  -- "Investigations into Cell Complex", by Xie Yuheng, 2019

- wikipedia
  - [CW complex](https://en.wikipedia.org/wiki/CW_complex)
  - [Cellular homology](https://en.wikipedia.org/wiki/Cellular_homology)

- recommended books

  - **about polytopes**

    - "Lectures on Polytopes: Updated Seventh Printing of the First Edition",
      by Günter M. Ziegler, 2007

    - "Regular Polytopes", by Coxeter, 1948

  - **simplicial-complex based algebraic topology**

    - "A Textbook of Topology"
      by Seifert and Threlfall, 1934,
      Translated by Michael A. Goldman, 1980

## Contributing

We enforce C4 as collaboration protocol :
- [The C4 RFC](https://rfc.zeromq.org/spec:42/C4)
- [Style Guide](STYLE-GUIDE.md) -- observe the style of existing code and respect it
- See [cicada-history](http://github.com/xieyuheng/cicada-history) for history of this project

## Code Of Conduct

- [Contributor Covenant Code of Conduct](CODE-OF-CONDUCT.md)

## License

- [GPLv3](LICENSE)
