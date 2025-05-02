require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox"],
    },
});

client.on("qr", (qr) => {
    console.log("QR Code recebido, escaneie com o celular:");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("✅ Cliente WhatsApp pronto!");
});

let selectedChatId = null;
let chatsDisponiveis = [];

client.on("ready", async () => {
    console.log("✅ Cliente WhatsApp pronto!");

    const chats = await client.getChats();
    chatsDisponiveis = chats.map((chat) => ({
        id: chat.id._serialized,
        name: chat.name || chat.formattedTitle || chat.id.user,
    }));

    // Quando um novo front-end se conecta
    io.on("connection", (socket) => {
        console.log("🖥️ Interface conectada");

        // Envia lista de conversas ao front
        socket.emit("lista_chats", chatsDisponiveis);

        socket.on("selecionar_chat", (chatId) => {
            console.log("📥 Chat selecionado:", chatId);
            selectedChatId = chatId; // guardar o chat selecionado
        });
    });
});

client.initialize();

server.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
