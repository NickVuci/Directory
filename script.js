function showContent(section) {
    const content = document.getElementById('content');

    if (section === 'about') {
        fetch('about.html')
            .then(response => response.text())
            .then(data => {
                content.innerHTML = data;
                addFadeInEffect(); // Apply the animation after loading
            });
    } else if (section === 'music') {
        fetch('music.html')
            .then(response => response.text())
            .then(data => {
                content.innerHTML = data;
                addFadeInEffect(); // Apply the animation after loading
            });
    } else if (section === 'tools') {
        fetch('tools.html')
            .then(response => response.text())
            .then(data => {
                content.innerHTML = data;
                addFadeInEffect(); // Apply the animation after loading
            });
    }
}

function addFadeInEffect() {
    // Select all elements with the fade-in class in the loaded content
    const fadeInElements = document.querySelectorAll('.fade-in');
    fadeInElements.forEach(element => {
        element.classList.remove('fade-in'); // Reset the animation
        void element.offsetWidth; // Trigger reflow
        element.classList.add('fade-in'); // Reapply the animation class
    });
}
