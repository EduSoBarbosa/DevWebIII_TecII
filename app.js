const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const ControladorAcesso = require('./chain/ControladorAcesso');
const ValidadorNotas = require('./chain/ValidadorNotas');
const CalculadorMedia = require('./chain/CalculadorMedia');

const publicDir = path.join(__dirname, 'public');
const escapar = valor => String(valor).replace(/[&<>"']/g, caractere => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[caractere]);

function criarServidor({ chave = process.env.ACCESS_KEY || 'projeto05' } = {}) {
  const chain = new ControladorAcesso(chave);
  chain.setNext(new ValidadorNotas()).setNext(new CalculadorMedia());

  return http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; form-action 'self'; frame-ancestors 'none'");
    const render = async (arquivo, status, dados = {}) => {
      const template = await fs.readFile(path.join(publicDir, arquivo), 'utf8');
      const html = template.replace(/\{\{(\w+)\}\}/g, (_, campo) => escapar(dados[campo] ?? ''));
      res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    };
    const erro = (status, titulo, mensagem) => render('erro.html', status, { status, titulo, mensagem });

    try {
      const url = new URL(req.url, 'http://localhost');
      if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return await erro(405, 'Método não permitido', 'Utilize GET para acessar esta aplicação.');
      }
      if (url.pathname === '/') return await render('index.html', 200);
      if (url.pathname === '/style.css') {
        const css = await fs.readFile(path.join(publicDir, 'style.css'));
        res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
        return res.end(css);
      }
      if (url.pathname === '/media') return await chain.handle({ req, res, url, render, erro });
      // Apenas rotas explícitas são servidas. Templates não são arquivos públicos acessíveis por URL.
      return await erro(404, 'Página não encontrada', 'Confira o endereço ou volte ao início.');
    } catch (error) {
      console.error('Falha ao processar requisição:', error.message);
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Erro interno do servidor.');
    }
  });
}

if (require.main === module) {
  const porta = Number(process.env.PORT || 3000);
  criarServidor().listen(porta, '127.0.0.1', () => {
    console.log(`Servidor disponível em http://localhost:${porta}`);
  });
}

module.exports = { criarServidor };
