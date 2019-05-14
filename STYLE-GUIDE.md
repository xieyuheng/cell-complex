# Style Guide

## General rules

- Maximal line length is limited to 66 characters.

## Easy to read Function calls

- Function calls and similar expressions
  are separated from the expression.

## `var`, `let` & `const`

- It is not allowed to use `var`.
- It is ok to use both `let` & `const`.
- It is ok to use `let`, even when one does not intend to change the variable.
  - I did this in examples to make them looks easier for new comers.

## API design

- We choose well typed API over "easy to implement"

  - "hard to implement" maybe due to the limitation of the language,
    specially the limitation of the type system of the language.

    In language with dependent type, for example,
    we can use `matrix_t (m, n)` for general matrix,
    `matrix_t (1, n)` for row vector,
    `matrix_t (m, 1)` for column vector,
    this can be done while keep the implementation simple.

    But in language without dependent type,
    to keep API well typed,
    `matrix_t` and `vector_t` should be different types,
    and a lots of methods must be repeated,
    thus the implementation is not easy.
