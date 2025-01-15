document.addEventListener("DOMContentLoaded", function() {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');
    const startButton = document.getElementById('startButton');

    overlay.style.display = "block";
    popup.style.display = "block";

    startButton.addEventListener('click', function() {
        overlay.style.display = "none";
        popup.style.display = "none";

        if (typeof startSimulation === "function") {
            startSimulation();
        }
    });
});
