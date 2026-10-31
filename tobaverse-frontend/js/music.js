console.log("music.js loaded");
document.addEventListener("DOMContentLoaded", () => {
    const music = document.getElementById("bgMusic");
    const button = document.getElementById("musicToggle");
    console.log(button);
    console.log(music);
    if (!music || !button) return;

    // Ambil status terakhir
    let isPlaying = localStorage.getItem("musicPlaying") === "true";

    // Update tampilan tombol
    function updateButton() {
        if (isPlaying) {
            button.textContent = "🔊";
            button.classList.add("playing");
            button.setAttribute("aria-label", "Pause Background Music");
        } else {
            button.textContent = "🎵";
            button.classList.remove("playing");
            button.setAttribute("aria-label", "Play Background Music");
        }
    }

    updateButton();

    // Jika sebelumnya sedang play,
    // browser mungkin tetap meminta interaksi user.
    if (isPlaying) {
        music.play().catch(() => {
            // Tidak melakukan apa-apa.
            // Browser akan mengizinkan setelah user klik tombol.
        });
    }

    // Toggle music
    button.addEventListener("click", async () => {

        if (music.paused) {

            try {

                await music.play();

                isPlaying = true;

                localStorage.setItem("musicPlaying", "true");

            } catch (err) {

                console.error("Audio tidak dapat diputar:", err);

                isPlaying = false;

            }

        } else {

            music.pause();

            isPlaying = false;

            localStorage.setItem("musicPlaying", "false");

        }

        updateButton();

    });

});