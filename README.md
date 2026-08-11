# Mensagem Surpresa

Página anônima de boas-vindas + convite. Ao tocar no selo dourado, ele "estoura"
com um brilho e revela uma carta de acolhimento, seguida de um convite com
contagem regressiva até **sábado, dia 15 de agosto de 2026**. Não há em
nenhum lugar do site nome de remetente, grupo ou contato — é surpresa mesmo.

## Arquivos
- `index.html` — estrutura da página
- `style.css` — estilo (responsivo, celular e PC)
- `script.js` — céu animado em canvas, interação do selo, contagem regressiva,
  personalização de nome e geração do arquivo `.ics` (adicionar à agenda)
- `qrcode-placeholder.png` — QR code de exemplo (**trocar depois do deploy**)
- `gerar_qrcode.py` — script para gerar o QR code final

## O que é dinâmico aqui
- Fundo de céu com estrelas que se movem, piscam e, de vez em quando, uma
  estrela cadente cruza a tela — tudo em `<canvas>`, sem imagens.
- O selo reage ao toque com uma pequena explosão de partículas douradas.
- As seções seguintes aparecem com animação conforme o usuário rola a página
  (scroll reveal).
- Contagem regressiva em tempo real até o evento.
- Botão "Adicionar à agenda" gera um arquivo `.ics` na hora, sem precisar de
  servidor nem de link externo — funciona com Google Agenda, Apple Calendar,
  Outlook etc.

## Antes de publicar — ajuste em `script.js`
No topo do arquivo tem o bloco `EVENTO`:
```js
const EVENTO = {
  titulo: "Um encontro especial",
  dataInicio: { ano: 2026, mes: 8, dia: 15, hora: 19, minuto: 0 },
  dataFim:    { ano: 2026, mes: 8, dia: 15, hora: 21, minuto: 0 },
  local: "a confirmar",
  descricao: "Você foi convidado(a). Guarde esta data.",
};
```
Troque `hora`/`minuto` e `local` pelos dados reais (sem precisar revelar quem
está convidando — pode deixar só o endereço/horário).

## Como testar localmente (VS Code)
1. Abra a pasta no VS Code.
2. Instale a extensão **Live Server** (opcional).
3. Clique com o botão direito em `index.html` → "Open with Live Server".
   (ou apenas abra o `index.html` direto no navegador)

## Como publicar no Vercel
1. Crie uma conta em https://vercel.com (pode entrar com GitHub).
2. Na pasta do projeto, rode:
   ```bash
   npm i -g vercel
   vercel
   ```
3. Siga as perguntas do terminal (aceite os padrões). Ao final ele te dá uma
   URL do tipo `https://seu-projeto.vercel.app`.
4. É site estático puro — o Vercel detecta sozinho, sem configuração extra.

## Gerando o QR code definitivo
O arquivo `qrcode-placeholder.png` aponta para um link de exemplo. Depois do
deploy, gere o QR final:

**Opção A** — me manda o link real do Vercel e eu gero o PNG certo.

**Opção B** — rodar localmente:
```bash
pip install qrcode[pil]
python3 gerar_qrcode.py "https://SEU-LINK-REAL.vercel.app"
```

## Personalizar por pessoa (opcional)
A página lê `?nome=` na URL — dá pra gerar um QR code diferente por
encomenda, cada um com o nome de quem vai receber:
```
https://seu-projeto.vercel.app/?nome=Maria
```
Sem o parâmetro, o texto fica genérico ("para você").
