const axios = require("axios");

async function responderComOllama(prompt) {
    try {
        const res = await axios.post("http://127.0.0.1:11434/api/generate", {
            model: "deepseek-coder:6.7b",
            prompt,
            stream: false,
        });

        return res.data.response.trim();
    } catch (err) {
        console.error("Erro ao responder com Ollama:", err.message);
        return "⚠️ Não consegui responder agora.";
    }
}

module.exports = { responderComOllama };
