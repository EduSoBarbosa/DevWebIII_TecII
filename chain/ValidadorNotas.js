const Handler = require('./Handler');

class ValidadorNotas extends Handler {
  async handle(context) {
    for (const nome of ['p1', 'p2']) {
      const valores = context.url.searchParams.getAll(nome);
      if (!valores.length || !valores[0].trim()) {
        return context.erro(400, 'Nota não informada', `Informe a nota ${nome.toUpperCase()}.`);
      }
      const texto = valores[0].trim();
      // Aceita ponto ou vírgula decimal; rejeita texto parcial, hexadecimal e infinito.
      if (valores.length !== 1 || !/^\d+(?:[.,]\d+)?$/.test(texto)) {
        return context.erro(400, 'Nota inválida', `Informe apenas um número decimal para ${nome.toUpperCase()}.`);
      }
      const nota = Number(texto.replace(',', '.'));
      if (!Number.isFinite(nota) || nota < 0 || nota > 10) {
        return context.erro(400, 'Nota inválida', 'As notas devem estar entre 0 e 10.');
      }
      context[nome] = nota;
    }
    return super.handle(context);
  }
}

module.exports = ValidadorNotas;
