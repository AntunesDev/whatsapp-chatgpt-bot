require("dotenv").config();
const express = require("express");
const http = require("http");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const { responderComOllama } = require("./ollamaService");
let ollamaProcess = null;

const io = socketIo(server);

app.use(express.static("public"));

const { execSync, spawn } = require("child_process");

function estaRodandoOllama() {
    try {
        const output = execSync('tasklist').toString();
        return output.toLowerCase().includes('ollama.exe');
    } catch (err) {
        return false;
    }
}

function verificarEIniciarOllama() {
    if (!estaRodandoOllama()) {
        console.log("🚀 Iniciando Ollama local em segundo plano...");
        ollamaProcess = spawn("ollama", ["serve"], {
            stdio: ["ignore", "ignore", "ignore"]
        });

        setTimeout(() => {
            verificarModelo();
        }, 4000);
    } else {
        console.log("🟢 Ollama já está rodando.");
        verificarModelo();
    }
}

function verificarModelo() {
    console.log("🧠 Verificando modelo 'mistral' no Ollama...");

    try {
        execSync("ollama run mistral --dry-run", { stdio: "ignore" });
        console.log("✅ Modelo 'mistral' já disponível.");
    } catch (err) {
        console.log("📥 Modelo 'mistral' não encontrado. Baixando...");
        try {
            execSync("ollama pull mistral", { stdio: "inherit" });
        } catch (err) {
            console.error("❌ Erro ao baixar modelo 'mistral':", err.message);
            process.exit(1);
        }
    }
}

let selectedChatId = null;
let chatsDisponiveis = [];
let iaAtiva = false;
let promptCustomizado = 'Responda de forma informal e direta como se fosse um amigo no WhatsApp.';
let isWhatsappReady = false;

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
    }, 2000);
});

client.on("message", async (msg) => {
    if (!selectedChatId || msg.from !== selectedChatId || msg.fromMe || !iaAtiva) return;

    io.emit("log_msg", { type: "received", content: msg.body });

    const prompt = `${promptCustomizado}\nMensagem recebida: "${msg.body}"`;

    const resposta = await responderComOllama(prompt);
    await msg.reply(resposta);

    io.emit("log_msg", { type: "sent", content: resposta });
});

client.on("auth_failure", (msg) => {
    console.error("❌ Falha na autenticação:", msg);
});

client.on("disconnected", (reason) => {
    console.warn("⚠️ Cliente desconectado:", reason);
});

client.initialize();

io.on("connection", (socket) => {
    console.log("💻 Interface conectada via Socket.io");

    if (isWhatsappReady && chatsDisponiveis.length > 0) {
        socket.emit("lista_chats", chatsDisponiveis);
    }

    socket.on("selecionar_chat", (chatId) => {
        selectedChatId = chatId;
        iaAtiva = true;
        socket.emit("estado_ia", { iaAtiva, promptCustomizado });
        console.log("📍 Chat ativado:", chatId);
    });

    socket.on("alternar_ia", () => {
        iaAtiva = !iaAtiva;
        io.emit("estado_ia", { iaAtiva, promptCustomizado });
        console.log("⚙️ IA " + (iaAtiva ? "ativada" : "pausada"));
    });

    socket.on("atualizar_prompt", (novoPrompt) => {
        promptCustomizado = novoPrompt;
        console.log("📝 Prompt personalizado atualizado.");
    });
});

verificarEIniciarOllama();
server.listen(3000, () => {
    console.log("🚀 Servidor rodando em http://localhost:3000");
});
