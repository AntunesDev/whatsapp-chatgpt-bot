require("dotenv").config();
const express = require("express");
const http = require("http");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const { responderComOllama } = require("./ollamaService");

const io = socketIo(server);

app.use(express.static("public"));

const { execSync, spawn } = require("child_process");
const fs = require("fs");

// Função para rodar comandos shell com segurança
function executarComando(cmd, opcoes = {}) {
    try {
        execSync(cmd, { stdio: "inherit", ...opcoes });
    } catch (err) {
        console.error(`❌ Erro ao executar comando: ${cmd}`);
        console.error(err.message);
    }
}

// Verifica se modelo "mistral" está instalado
function verificarEIniciarOllama() {
    console.log("🧠 Verificando modelo 'mistral' no Ollama...");

    try {
        const modelos = execSync("ollama list").toString();
        if (!modelos.includes("mistral")) {
            console.log("📥 Modelo 'mistral' não encontrado. Baixando...");
            executarComando("ollama pull mistral");
        } else {
            console.log("✅ Modelo 'mistral' já instalado.");
        }
    } catch (err) {
        console.error("❌ Ollama não parece estar instalado ou acessível.");
        process.exit(1);
    }

    console.log("🚀 Iniciando Ollama local em segundo plano...");
    const processo = spawn("ollama", ["serve"], {
        detached: true,
        stdio: "ignore",
    });
    processo.unref();
}

let selectedChatId = null;
let chatsDisponiveis = [];

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox"],
    },
});

client.on("qr", (qr) => {
    console.log("📱 Escaneie o QR Code para conectar no WhatsApp:");
    qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
    console.log("✅ Cliente WhatsApp conectado!");
    isWhatsappReady = true;

    console.log("⏳ Aguardando sincronização das conversas...");

    // Verificador periódico
    const syncInterval = setInterval(async () => {
        const chats = await client.getChats();

        if (chats && chats.length > 0) {
            chatsDisponiveis = chats.map((chat) => ({
                id: chat.id._serialized,
                name: chat.name || chat.formattedTitle || chat.id.user || "Contato desconhecido",
            }));

            console.log(`✅ ${chatsDisponiveis.length} conversas carregadas com sucesso.`);

            io.emit("lista_chats", chatsDisponiveis);

            clearInterval(syncInterval); // parar verificação
        } else {
            console.log("📭 Nenhuma conversa carregada ainda... aguardando sincronização.");
        }
    }, 2000); // tenta a cada 2 segundos
});

client.on("message", async (msg) => {
    // Ignorar se nenhum chat foi selecionado
    if (!selectedChatId) return;

    // Ignorar se não é do chat que foi selecionado
    if (msg.from !== selectedChatId) return;

    // Ignorar mensagens enviadas pelo próprio bot
    if (msg.fromMe) return;

    console.log(`📩 Nova mensagem em ${selectedChatId}: ${msg.body}`);
    io.emit("log_msg", { type: "received", content: msg.body });

    // Gera resposta com IA local
    const resposta = await responderComOllama(`Responda de forma informal e direta como se fosse um amigo no WhatsApp. Mensagem: "${msg.body}"`);

    // Envia resposta
    try {
        await msg.reply(resposta);
        io.emit("log_msg", { type: "sent", content: resposta });
        console.log("💬 Resposta enviada com sucesso.");
    } catch (err) {
        console.error("❌ Erro ao enviar resposta:", err.message);
    }
});

client.on("auth_failure", (msg) => {
    console.error("❌ Falha na autenticação:", msg);
});

client.on("disconnected", (reason) => {
    console.warn("⚠️ Cliente desconectado:", reason);
});

client.initialize();

// socket deve ficar fora do client.ready
io.on("connection", (socket) => {
    console.log("🖥️ Interface conectada");

    if (chatsDisponiveis.length > 0) {
        socket.emit("lista_chats", chatsDisponiveis);
    }

    socket.on("selecionar_chat", (chatId) => {
        selectedChatId = chatId;
        console.log("📥 Chat selecionado para IA:", chatId);
    });
});

verificarEIniciarOllama();
server.listen(3000, () => {
    console.log("🚀 Servidor rodando em http://localhost:3000");
});
