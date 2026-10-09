const { test } = require('node:test');
const assert = require('node:assert/strict');
const { criarServidor } = require('../app');

test('rotas, controle de acesso e cálculo de média', async t => {
  const server = criarServidor({ chave: 'teste' });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const casos = [
    ['/', 200, 'Consulta'],
    ['/media?p1=7.5&p2=5&chave=teste', 200, '<dd>6,25</dd>'],
    ['/media?p1=6&p2=6&chave=teste', 200, 'APROVADO'],
    ['/media?p1=5.999&p2=6&chave=teste', 200, 'REPROVADO'],
    ['/media?p1=0&p2=0&chave=teste', 200, '<dd>0</dd>'],
    ['/media?p1=10&p2=10&chave=teste', 200, '<dd>10</dd>'],
    ['/media?p1=7,5&p2=5&chave=teste', 200, 'APROVADO'],
    ['/media?p1=6&p2=6', 401, 'chave'],
    ['/media?p1=6&p2=6&chave=errada', 403, 'inválida'],
    ['/media?chave=teste', 400, 'não informada'],
    ['/media?p1=&p2=6&chave=teste', 400, 'não informada'],
    ...['abc', '7abc', 'Infinity', '0xA', '-1', '11', '1e1'].map(n =>
      [`/media?p1=${n}&p2=6&chave=teste`, 400, 'inválida']),
    ['/media?p1=6&p1=9&p2=6&chave=teste', 400, 'inválida'],
    ['/media?p1=6&p2=6&chave=teste&chave=teste', 403, 'inválida'],
    ['/aprovado.html', 404, 'não encontrada'],
    ['/public/reprovado.html', 404, 'não encontrada'],
    ['/nao-existe', 404, 'não encontrada'],
    ['/style.css', 200, 'box-sizing']
  ];
  for (const [rota, status, trecho] of casos) {
    await t.test(rota, async () => {
      const response = await fetch(base + rota);
      assert.equal(response.status, status);
      assert.ok((await response.text()).toLowerCase().includes(trecho.toLowerCase()));
    });
  }
  await t.test('POST não é aceito', async () => {
    const response = await fetch(base + '/media', { method: 'POST' });
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'GET');
    await response.text();
  });
});
