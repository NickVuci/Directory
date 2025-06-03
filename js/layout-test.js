/**
 * Layout Test Script
 * This script helps visualize the grid layout areas to ensure proper alignment.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Add test mode button
    const testButton = document.createElement('button');
    testButton.textContent = 'Toggle Layout Test';
    testButton.className = 'btn-unified layout-test-btn';
    testButton.style.position = 'fixed';
    testButton.style.right = '10px';
    testButton.style.top = '10px';
    testButton.style.zIndex = '10000';
    document.body.appendChild(testButton);
    
    let testMode = false;
    
    // Toggle test mode on click
    testButton.addEventListener('click', () => {
        testMode = !testMode;
        
        // Get the main layout elements
        const header = document.querySelector('.header');
        const main = document.querySelector('.main-content');
        const footer = document.querySelector('.footer');
        
        if (testMode) {
            // Add borders to visualize the grid areas
            header.style.outline = '2px dashed red';
            main.style.outline = '2px dashed green';
            footer.style.outline = '2px dashed blue';
            
            // Display sizes
            console.log('Grid Layout Dimensions:');
            console.log(`Header height: ${header.offsetHeight}px`);
            console.log(`Main content height: ${main.offsetHeight}px`);
            console.log(`Footer height: ${footer.offsetHeight}px`);
            console.log(`Total height: ${document.body.offsetHeight}px`);
            
            // Show headers
            displayInfo(header, 'HEADER');
            displayInfo(main, 'MAIN');
            displayInfo(footer, 'FOOTER');
        } else {
            // Remove testing styles
            header.style.outline = '';
            main.style.outline = '';
            footer.style.outline = '';
            
            // Remove info displays
            document.querySelectorAll('.layout-test-info').forEach(el => {
                el.remove();
            });
        }
    });
    
    function displayInfo(element, name) {
        const info = document.createElement('div');
        info.className = 'layout-test-info';
        info.textContent = `${name} (${element.offsetHeight}px)`;
        info.style.position = 'absolute';
        info.style.left = '50%';
        info.style.transform = 'translateX(-50%)';
        info.style.background = 'rgba(0,0,0,0.7)';
        info.style.color = 'white';
        info.style.padding = '5px 10px';
        info.style.borderRadius = '5px';
        info.style.zIndex = '10000';
        
        // Position at the top of each section
        info.style.top = `${element.offsetTop + 5}px`;
        
        document.body.appendChild(info);
    }
});
