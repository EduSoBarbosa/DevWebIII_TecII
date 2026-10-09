const Handler = require('./Handler');

class CalculadorMedia extends Handler {
  async handle(context) {
    const media = (context.p1 + context.p2) / 2;
    // A aprovação considera o valor original, sem arredondamento.
    const aprovado = media >= 6;
    const formatar = valor => String(valor).replace('.', ',');
    return context.render(aprovado ? 'aprovado.html' : 'reprovado.html', 200, {
      p1: formatar(context.p1),
      p2: formatar(context.p2),
      media: formatar(media),
      situacao: aprovado ? 'APROVADO' : 'REPROVADO'
    });
  }
}

module.exports = CalculadorMedia;
