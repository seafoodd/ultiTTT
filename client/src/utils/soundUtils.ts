export const playSound = (sound:HTMLAudioElement, volume = 0.5) => {
    sound.currentTime = 0;
    sound.volume = volume;
    sound.play().catch((error) => console.error("Audio play failed:", error));
};