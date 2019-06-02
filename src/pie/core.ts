/**
 * Checking Dependent Types
 *   with Normalization by Evaluation: A Tutorial
 * - by David Thrane Christiansen
 * - http://davidchristiansen.dk/tutorials/nbe/
*/

class closure_t {
  env: string
  v: string
  body: string

  constructor (
    env: string,
    v: string,
    body: string,
  ) {
    this.env = env
    this.v = v
    this.body = body
  }
}
