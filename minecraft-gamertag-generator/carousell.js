// carousell.js

// carousell.js

document.addEventListener('DOMContentLoaded', function() {
    // Array of image paths to cycle through
    const images = [
        '../end.png',
        '../overworld.png',
        '../nether.png'
    ];

    let currentImage = 0;

    // Function to change the background image
    function cycleBackgroundImage() {
        document.body.style.backgroundImage = `url('${images[currentImage]}')`;
        currentImage = (currentImage + 1) % images.length;
        console.log('cycledebug');
    }

    // Initial background image
    cycleBackgroundImage();

    // Cycle background image every 44 seconds (4400 ms)
    setInterval(cycleBackgroundImage, 44000);
});