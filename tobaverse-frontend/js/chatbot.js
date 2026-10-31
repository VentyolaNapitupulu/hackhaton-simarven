// ============================================
// TOBAVERSE CHATBOT WIDGET
// ============================================

const BACKEND_URL = "http://localhost:5000/api/chat";

// Riwayat percakapan disimpan di memori browser (hilang saat refresh -- ini
// wajar untuk MVP, tidak perlu database percakapan permanen untuk sekarang)
let conversationHistory = [];

// Pertanyaan siap-pakai yang muncul saat chat pertama dibuka
const QUICK_ACTIONS = [
    { label: "🏞️ Wisata alam populer", pesan: "Rekomendasi wisata alam paling populer di Danau Toba" },
    { label: "🍲 Kuliner khas Batak", pesan: "Apa saja kuliner khas Batak yang wajib dicoba?" },
    { label: "🏨 Penginapan murah", pesan: "Rekomendasi penginapan murah dekat Danau Toba" },
    { label: "⛴️ Transportasi ke Samosir", pesan: "Bagaimana cara menyeberang ke Pulau Samosir?" }
];

function initializeChatbot() {
    const widget = document.querySelector(".chat-widget");
    if (!widget || widget.dataset.chatbotInitialized === "true") return;

    const toggleBtn = document.getElementById("chatToggleBtn");
    const closeBtn = document.getElementById("chatCloseBtn");
    const chatBox = document.getElementById("chatBox");
    const messagesContainer = document.getElementById("chatMessages");
    const input = document.getElementById("chatInput");
    const sendBtn = document.getElementById("chatSendBtn");
    const quickActionsContainer = document.getElementById("chatQuickActions");

    if (!toggleBtn || !closeBtn || !chatBox || !messagesContainer || !input || !sendBtn) {
        return;
    }

    widget.dataset.chatbotInitialized = "true";

    if (quickActionsContainer) {
        quickActionsContainer.innerHTML = "";
        QUICK_ACTIONS.forEach((qa) => {
            const btn = document.createElement("button");
            btn.className = "quick-action-btn";
            btn.type = "button";
            btn.textContent = qa.label;
            btn.addEventListener("click", () => {
                input.value = qa.pesan;
                kirimPesan();
            });
            quickActionsContainer.appendChild(btn);
        });
    }

    toggleBtn.addEventListener("click", () => {
        chatBox.classList.toggle("open");
        if (chatBox.classList.contains("open")) {
            input.focus();
        }
    });

    closeBtn.addEventListener("click", () => {
        chatBox.classList.remove("open");
    });

    sendBtn.addEventListener("click", kirimPesan);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            kirimPesan();
        }
    });

    function tambahPesan(teks, pengirim) {
        const bubble = document.createElement("div");
        bubble.className = `chat-msg ${pengirim}`;
        bubble.textContent = teks;
        messagesContainer.appendChild(bubble);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return bubble;
    }

    async function kirimPesan() {
        const pesanUser = input.value.trim();
        if (!pesanUser) return;

        if (quickActionsContainer) {
            quickActionsContainer.style.display = "none";
        }

        tambahPesan(pesanUser, "user");
        input.value = "";
        sendBtn.disabled = true;

        const loadingBubble = tambahPesan("Sedang mengetik...", "loading");

        try {
            const response = await fetch(BACKEND_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: pesanUser,
                    history: conversationHistory
                })
            });
            const data = await response.json();

            loadingBubble.remove();

            if (data.error) {
                tambahPesan("Maaf, terjadi kendala teknis. Coba lagi ya.", "bot");
            } else {
                tambahPesan(data.jawaban, "bot");
                conversationHistory.push({ role: "user", content: pesanUser });
                conversationHistory.push({ role: "assistant", content: data.jawaban });
                if (conversationHistory.length > 20) {
                    conversationHistory = conversationHistory.slice(-20);
                }
            }
        } catch (error) {
            loadingBubble.remove();
            tambahPesan(
                "Maaf, tidak bisa terhubung ke server. Pastikan backend sedang jalan.",
                "bot"
            );
        } finally {
            sendBtn.disabled = false;
        }
    }

}

document.addEventListener("DOMContentLoaded", initializeChatbot);
window.addEventListener("load", initializeChatbot);
window.addEventListener("focus", initializeChatbot);
document.addEventListener("page:loaded", initializeChatbot);
window.addEventListener("page:loaded", initializeChatbot);
initializeChatbot();