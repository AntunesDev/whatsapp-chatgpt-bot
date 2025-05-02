require("dotenv").config();
const express = require("express");
const http = require("http");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

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

server.listen(3000, () => {
    console.log("🚀 Servidor rodando em http://localhost:3000");
});
