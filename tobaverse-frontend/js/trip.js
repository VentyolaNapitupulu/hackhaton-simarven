// ============================================
// TOBAVERSE AI TRIP -- percakapan bebas dengan ekstraksi slot otomatis
// ============================================

const TRIP_CHAT_URL = "http://localhost:5000/api/trip-chat";
const TRIP_PLAN_URL = "http://localhost:5000/api/trip-plan";

// Metadata field cuma untuk tampilan tracker -- BUKAN lagi urutan wajib
const FIELD_META = [
    { field: "durasi", icon: "bi-calendar-event", title: "DURASI PERJALANAN", placeholder: "Belum diketahui" },
    { field: "kota_asal", icon: "bi-geo-alt", title: "ASAL KEBERANGKATAN", placeholder: "Belum diketahui" },
    { field: "companion", icon: "bi-people", title: "TEMAN PERJALANAN", placeholder: "Belum diketahui" },
    { field: "budget", icon: "bi-wallet2", title: "BUDGET PERJALANAN", placeholder: "Belum diketahui" },
    { field: "minat", icon: "bi-heart", title: "MINAT PERJALANAN", placeholder: "Belum diketahui" }
];

let slots = { durasi: null, kota_asal: null, companion: null, budget: null, minat: [] };
let chatHistory = [];
let siapGenerate = false;

const AI_THINKING_MESSAGES = [
    "Menganalisis preferensimu...",
    "Mencocokkan destinasi terbaik...",
    "Menghitung estimasi biaya...",
    "Menyusun timeline perjalanan...",
    "Menambahkan sentuhan budaya Batak..."
];

const chatLog = document.getElementById("tripChatLog");
const chipArea = document.getElementById("tripChipArea");
const trackerList = document.getElementById("trackerList");
const trackerProgressText = document.getElementById("trackerProgressText");
const generateBtn = document.getElementById("generateBtn");
const freeInput = document.getElementById("tripFreeInput");
const sendBtn = document.getElementById("tripSendBtn");

function addChatBubble(text, sender) {
    const bubble = document.createElement("div");
    bubble.className = `trip-msg ${sender}`;
    bubble.textContent = text;
    chatLog.appendChild(bubble);
    chatLog.scrollTop = chatLog.scrollHeight;
    return bubble;
}

function isSlotFilled(field) {
    const val = slots[field];
    if (Array.isArray(val)) return val.length > 0;
    return val !== null && val !== undefined && val !== "";
}

function formatSlotPreview(field) {
    const val = slots[field];
    return Array.isArray(val) ? val.join(", ") : String(val);
}

function renderTracker() {
    trackerList.innerHTML = "";
    let doneCount = 0;
    FIELD_META.forEach((meta) => {
        const filled = isSlotFilled(meta.field);
        if (filled) doneCount++;

        const li = document.createElement("li");
        li.className = "tracker-item" + (filled ? " done" : "");
        li.innerHTML = `
            <span class="tracker-dot">${filled ? '<i class="bi bi-check"></i>' : ""}</span>
            <div>
                <strong><i class="bi ${meta.icon}"></i> ${meta.title}</strong>
                <p>${filled ? formatSlotPreview(meta.field) : meta.placeholder}</p>
            </div>
        `;
        trackerList.appendChild(li);
    });
    trackerProgressText.textContent = `${doneCount} dari ${FIELD_META.length} informasi terkumpul`;
    generateBtn.disabled = !siapGenerate;
}

function renderSaranBalasan(saranList) {
    chipArea.innerHTML = "";
    (saranList || []).forEach((saran) => {
        const chip = document.createElement("button");
        chip.className = "trip-chip";
        chip.textContent = saran;
        chip.addEventListener("click", () => {
            freeInput.value = saran;
            handleSend();
        });
        chipArea.appendChild(chip);
    });
}

function renderKonfirmasiCard() {
    const card = document.createElement("div");
    card.className = "trip-msg ai confirm-card";
    card.innerHTML = `
        <strong>Ringkasan perjalananmu:</strong><br>
        📅 ${slots.durasi || "-"} hari &nbsp; | &nbsp; 🚏 dari ${slots.kota_asal || "-"}<br>
        👥 ${slots.companion || "-"} &nbsp; | &nbsp; 💰 ${slots.budget || "-"}<br>
        ❤️ ${Array.isArray(slots.minat) ? slots.minat.join(", ") : "-"}
    `;
    chatLog.appendChild(card);
    chatLog.scrollTop = chatLog.scrollHeight;

    chipArea.innerHTML = "";
    const confirmBtn = document.createElement("button");
    confirmBtn.className = "trip-chip confirm";
    confirmBtn.textContent = "✅ Ya, buat itinerary!";
    confirmBtn.addEventListener("click", generateTrip);

    const editBtn = document.createElement("button");
    editBtn.className = "trip-chip";
    editBtn.textContent = "✏️ Ada yang mau diubah";
    editBtn.addEventListener("click", () => {
        freeInput.focus();
        freeInput.placeholder = "Ceritakan apa yang ingin diubah...";
    });

    chipArea.appendChild(confirmBtn);
    chipArea.appendChild(editBtn);
}

async function handleSend() {
    const text = freeInput.value.trim();
    if (!text) return;
    freeInput.value = "";
    freeInput.disabled = true;
    sendBtn.disabled = true;

    addChatBubble(text, "user");
    chipArea.innerHTML = "";
    const loadingBubble = addChatBubble("Sedang mengetik...", "loading");

    try {
        const response = await fetch(TRIP_CHAT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: text,
                known_slots: slots,
                history: chatHistory
            })
        });
        const result = await response.json();
        loadingBubble.remove();

        if (result.error) {
            addChatBubble("Maaf, ada kendala teknis. Coba lagi ya.", "ai");
            return;
        }

        slots = { ...slots, ...result.slots };
        siapGenerate = !!result.siap_generate;

        addChatBubble(result.balasan, "ai");

        chatHistory.push({ role: "user", content: text });
        chatHistory.push({ role: "assistant", content: result.balasan });
        if (chatHistory.length > 16) chatHistory = chatHistory.slice(-16);

        renderTracker();

        if (siapGenerate) {
            renderKonfirmasiCard();
        } else {
            renderSaranBalasan(result.saran_balasan);
        }
    } catch (error) {
        loadingBubble.remove();
        addChatBubble("Tidak bisa terhubung ke server. Pastikan backend sedang jalan.", "ai");
    } finally {
        freeInput.disabled = false;
        sendBtn.disabled = false;
        freeInput.focus();
    }
}

sendBtn.addEventListener("click", handleSend);
freeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
});

generateBtn.addEventListener("click", generateTrip);
document.getElementById("backToWizardBtn").addEventListener("click", () => {
    document.getElementById("resultSection").style.display = "none";
    document.getElementById("wizardSection").style.display = "flex";
});
document.getElementById("printBtn").addEventListener("click", () => window.print());

async function generateTrip() {
    document.getElementById("wizardSection").style.display = "none";
    document.getElementById("resultSection").style.display = "none";
    const thinkingSection = document.getElementById("aiThinkingSection");
    const thinkingText = document.getElementById("aiThinkingText");
    thinkingSection.style.display = "flex";

    let msgIndex = 0;
    const thinkingInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % AI_THINKING_MESSAGES.length;
        thinkingText.textContent = AI_THINKING_MESSAGES[msgIndex];
    }, 1400);

    try {
        const response = await fetch(TRIP_PLAN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                durasi: slots.durasi,
                kota_asal: slots.kota_asal,
                budget: slots.budget,
                companion: slots.companion,
                minat: slots.minat,
                preferensi_tambahan: ""
            })
        });
        const itinerary = await response.json();

        clearInterval(thinkingInterval);
        thinkingSection.style.display = "none";

        if (itinerary.error) {
            alert("Maaf, terjadi kendala saat membuat itinerary. Coba lagi ya.");
            document.getElementById("wizardSection").style.display = "flex";
            return;
        }

        renderResult(itinerary);
        document.getElementById("resultSection").style.display = "block";
    } catch (error) {
        clearInterval(thinkingInterval);
        thinkingSection.style.display = "none";
        alert("Tidak bisa terhubung ke server. Pastikan backend sedang jalan.");
        document.getElementById("wizardSection").style.display = "flex";
    }
}

function renderResult(itinerary) {
    document.getElementById("resultRingkasan").textContent = itinerary.ringkasan || "Rencana Perjalanan Anda";
    document.getElementById("resultKonsultan").textContent =
        `"${itinerary.ringkasan || "Rencana perjalanan telah disusun sesuai preferensi Anda."}"`;
    document.getElementById("resultBiaya").textContent = itinerary.estimasi_biaya_total || "Tidak ditentukan";
    document.getElementById("resultDurasi").textContent = `${slots.durasi || "-"} Hari`;
    document.getElementById("resultCompanion").textContent = slots.companion || "-";

    const timelineEl = document.getElementById("resultTimeline");
    timelineEl.innerHTML = "";

    (itinerary.hari || []).forEach((hari) => {
        const dayBlock = document.createElement("div");
        dayBlock.className = "day-block";

        let rows = "";
        (hari.aktivitas || []).forEach((akt) => {
            const mapsUrl = "https://www.google.com/maps/search/" +
                encodeURIComponent((akt.nama_tempat || "") + " Danau Toba");
            rows += `
                <tr>
                    <td>${akt.waktu || ""}</td>
                    <td class="aktivitas-nama">${akt.kategori || ""}</td>
                    <td>
                        <a class="lokasi-link" href="${mapsUrl}" target="_blank">
                            <i class="bi bi-geo-alt"></i> ${akt.nama_tempat || ""}
                        </a>
                    </td>
                    <td class="catatan-cell">
                        ${akt.alasan || ""}
                        <span class="biaya-tag">${akt.estimasi_biaya || ""}</span>
                    </td>
                </tr>
            `;
        });

        dayBlock.innerHTML = `
            <div class="day-block-header">
                <h3><span class="day-number-badge">${hari.hari_ke}</span> Hari ${hari.hari_ke}: ${hari.tema || ""}</h3>
                <span>Perjalanan &amp; Aktivitas</span>
            </div>
            <table class="day-table">
                <thead>
                    <tr><th>Waktu</th><th>Aktivitas</th><th>Lokasi</th><th>Catatan &amp; Estimasi</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
        timelineEl.appendChild(dayBlock);
    });

    const tipsEl = document.getElementById("resultTipsBudaya");
    if (itinerary.tips_budaya && itinerary.tips_budaya.length > 0) {
        tipsEl.innerHTML = `
            <h3><i class="bi bi-stars"></i> Tips Budaya Batak</h3>
            <ul>${itinerary.tips_budaya.map((t) => `<li>${t}</li>`).join("")}</ul>
        `;
        tipsEl.style.display = "block";
    } else {
        tipsEl.style.display = "none";
    }
}

// ===== Inisialisasi =====
renderTracker();
addChatBubble(
    "Horas! Ceritakan rencana liburanmu ke Danau Toba -- boleh sekaligus " +
    "(misal: \"dari Balige, budget 300 ribu, sehari, suka kuliner\"), atau pelan-pelan juga boleh.",
    "ai"
);