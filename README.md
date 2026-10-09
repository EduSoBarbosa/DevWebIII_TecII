# Projeto 05 — Desenvolvimento Web III

Aplicação que recebe P1 e P2 pela URL, calcula a média e apresenta a situação do aluno. Desenvolvi a estrutura com Node.js puro, sem Express ou outros frameworks. O controle de acesso utiliza o padrão Chain of Responsibility.

## Executar

Requisito: Node.js 22 ou superior e NPM.

```bash
npm install
npm start
```

Acesse http://localhost:3000 e preencha o formulário. A chave padrão para a demonstração é `projeto05`.

Exemplo direto:

```text
http://localhost:3000/media?p1=7.5&p2=5.0&chave=projeto05
```

Resultado: P1 = 7,5; P2 = 5; média = 6,25; situação = APROVADO.

O parâmetro `chave` foi acrescentado ao exemplo do enunciado para demonstrar o controlador de acesso. Sem ele, a rota responde com erro 401.

Para alterar a chave no Linux/macOS:

```bash
ACCESS_KEY='sua-chave' npm start
```

No PowerShell:

```powershell
$env:ACCESS_KEY='sua-chave'
npm start
```

Este é um controle didático local: a chave na URL aparece no histórico do navegador e é compartilhada entre usuários. Não representa um sistema de autenticação para produção. O servidor escuta apenas na interface local (127.0.0.1).

## Cálculo e validação

`MEDIA = (P1 + P2) / 2`. Média maior ou igual a 6 retorna `public/aprovado.html`; abaixo de 6 retorna `public/reprovado.html`. O servidor lê o HTML correspondente e substitui os marcadores por P1, P2, média e situação. A classificação usa a média sem arredondamento.

Assumi a escala de 0 a 10, inclusive. São aceitos ponto e vírgula decimal. Notas ausentes, vazias, repetidas, fora da escala ou com texto inválido retornam 400. A aplicação também trata chave ausente (401), chave incorreta (403), página inexistente (404), método não permitido (405) e erro interno (500).

## Chain of Responsibility

A rota `/media` encaminha um contexto para a seguinte cadeia:

1. **ControladorAcesso:** verifica a chave. Interrompe a execução se o acesso for negado.
2. **ValidadorNotas:** verifica e converte P1 e P2. Interrompe a execução quando os dados são inválidos.
3. **CalculadorMedia:** calcula a média e solicita a página correspondente.

`Handler` é a classe base. `setNext()` conecta os elos; `handle()` encaminha o contexto ao próximo elo. Cada classe tem uma responsabilidade própria. Somente uma requisição autorizada e válida chega ao cálculo.

As páginas de resultado não podem ser acessadas diretamente pela URL. O servidor disponibiliza apenas `/`, `/media` e `/style.css`, evitando que o acesso direto aos templates contorne a cadeia.

## Arquivos

| Arquivo ou pasta | Responsabilidade |
| --- | --- |
| `app.js` | Servidor HTTP, rotas, leitura de arquivos e montagem da cadeia |
| `chain/` | Classe base e três elos da cadeia |
| `public/index.html` | Formulário enviado por GET |
| `public/aprovado.html` | Resultado de aprovação |
| `public/reprovado.html` | Resultado de reprovação |
| `public/erro.html` | Mensagens de erro |
| `public/style.css` | Layout responsivo |
| `test/app.test.js` | Testes HTTP com recursos nativos do Node.js |
| `package.json` e `package-lock.json` | Configuração e registro do projeto NPM |

Não há dependências externas. O lockfile está incluído mesmo sem bibliotecas instaladas.

## Testes

```bash
npm test
```

Os testes iniciam o servidor em uma porta livre e verificam os resultados, o limite de aprovação, os erros de entrada, a interrupção pelo controlador de acesso e o bloqueio dos templates.

- Integrante 1: Eduardo de Sousa Barbosa
- Integrante 2: Gabriely Benito Monteiro
