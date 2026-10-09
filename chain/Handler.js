// Cada elo trata sua responsabilidade e decide se a requisição pode continuar.
class Handler {
  setNext(handler) {
    this.next = handler;
    return handler;
  }

  async handle(context) {
    if (this.next) return this.next.handle(context);
  }
}

module.exports = Handler;
