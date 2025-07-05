// carousell.js

document.addEventListener('DOMContentLoaded', function() {
    // Array of image paths to cycle through
    const images = [
        './spawn.png',
        './end.png',
        './nether.png'
    ];

    let currentImage = 0;

    let element2bc = document.getElementById('floaty_bg');

    // Function to change the background image
    function cycleBackgroundImage() {
        if (element2bc) {
            element2bc.src = `${images[currentImage]}`;
            currentImage = (currentImage + 1) % images.length;
            console.log('cycledebug');
        } else {
            console.error("Element with id 'floaty_bg' not found.");
        }
    }

    // Initial background image
    cycleBackgroundImage();

    // Cycle background image every 3 seconds (3000 ms)
    setInterval(cycleBackgroundImage, 12000);
});
