# 🤖 WhatsApp ChatGPT Bot

Este é um projeto pessoal feito com Node.js que conecta ao seu WhatsApp localmente e responde automaticamente às mensagens de uma conversa específica, simulando seu estilo de escrita com a ajuda da API do ChatGPT (OpenAI).

> 🔒 Totalmente local. Nenhum dado é enviado para servidores externos além da OpenAI para gerar respostas.

---

## 🚀 Funcionalidades

- Conexão automática com seu WhatsApp via QR Code
- Interface local com botão de ativar
- Lista de conversas disponíveis
- Seleção de uma conversa para ativar respostas automáticas
- Respostas geradas pela IA da OpenAI, simulando sua forma de falar

---

## 🛠️ Tecnologias Utilizadas

- Node.js + Express
- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- Socket.io
- API da OpenAI (ChatGPT)
- HTML/CSS simples

---

## ⚙️ Instalação

1. Clone o repositório:

```bash
git clone https://github.com/AntunesDev/whatsapp-chatgpt-bot.git
cd whatsapp-chatgpt-bot
```

2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo .env com sua chave da OpenAI:

```ini
OPENAI_API_KEY=sua_chave_aqui
```

4. Inicie o projeto:

```bash
node server.js
```

5. Escaneie o QR Code com seu WhatsApp.

---

## 🧠 Como funciona?

O projeto conecta-se ao WhatsApp e monitora as mensagens recebidas.

Quando ativado, ele responde automaticamente à conversa selecionada usando respostas geradas pela IA (ChatGPT).

A IA simula seu estilo de escrita, e pode ser treinada com um prompt inicial (em breve).

---

## 📝 Licença

MIT — sinta-se livre para usar, modificar e contribuir.

---

## 📌 Avisos

O uso da API da OpenAI pode gerar custos, dependendo da quantidade de mensagens.

Este projeto é apenas para fins educacionais e pessoais.

---
