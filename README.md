# 🤖 WhatsApp Chatbot com IA Local (Ollama + Node.js)

Este é um projeto pessoal que conecta ao seu WhatsApp localmente e responde automaticamente às mensagens de uma conversa específica, usando **IA local** via [Ollama](https://ollama.com/) — sem custos com OpenAI.

🔒 100% local. Nenhum dado é enviado para servidores externos (exceto se você optar por usar um modelo online no Ollama).

---

## 🚀 Funcionalidades

- Conexão com WhatsApp via QR Code
- Interface web simples com seleção de conversas
- Ativação manual de um chat para auto-resposta
- Geração de respostas com modelo local (ex: `mistral`)

---

## 🛠️ Tecnologias Utilizadas

- Node.js + Express
- whatsapp-web.js
- Ollama (modelo local)
- Socket.io
- HTML/CSS básico

---

## 📦 Instalação

### 1. Clone o repositório

```shell
git clone https://github.com/AntunesDev/whatsapp-ollama-bot.git cd whatsapp-ollama-bot
```

---

### 2. Instale as dependências

```shell
npm install
```

---

## 🧠 Configuração da IA com Ollama

### 1. Instale o Ollama

Baixe em: https://ollama.com/download  
Disponível para Windows, macOS e Linux.

### 2. Rode o modelo Mistral

```shell
ollama run mistral
```

---

## ▶️ Iniciando o projeto

```shell
npm start
```

Abra o navegador em `http://localhost:3000`, escaneie o QR Code com seu WhatsApp e selecione uma conversa.

---

## 📁 Estrutura do Projeto

- `server.js`: lógica principal, conexão com WhatsApp
- `public/index.html`: interface do usuário
- `ollamaService.js`: integração com a IA local via HTTP

---

## 📝 Licença

MIT — sinta-se livre para usar, modificar e contribuir.
