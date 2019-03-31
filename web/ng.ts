export
abstract class engine_t <canvas_t, state_t, event_t> {
  constructor (
    public canvas: canvas_t,
    public state: state_t,
    public event_queue: Array <event_t> = [],
  ) {}

  abstract receive (): void
  abstract rander (): void
}
