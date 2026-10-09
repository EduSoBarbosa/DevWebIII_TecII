const Handler = require('./Handler');

class ControladorAcesso extends Handler {
  constructor(chave) {
    super();
    this.chave = chave;
  }

  async handle(context) {
    const { url, erro } = context;
    const chaves = url.searchParams.getAll('chave');
    if (chaves.length === 0 || !chaves[0]) {
      return erro(401, 'Acesso não autorizado', 'Informe a chave de acesso.');
    }
    if (chaves.length !== 1 || chaves[0] !== this.chave) {
      return erro(403, 'Acesso negado', 'A chave de acesso é inválida.');
    }
    return super.handle(context);
  }
}

module.exports = ControladorAcesso;
