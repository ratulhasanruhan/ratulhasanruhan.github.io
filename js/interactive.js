// JavaScript for 90s website interactive elements

// Visitor counter functionality
function updateVisitorCounter() {
    // In a real implementation, this would be server-side
    // For this demo, we'll simulate a counter that increments on each visit
    let counterElement = document.querySelector('.counter');
    if (counterElement) {
        // Check if counter value exists in localStorage
        let count = localStorage.getItem('visitorCount');
        if (!count) {
            // Initialize counter
            count = Math.floor(Math.random() * 100) + 1;
        } else {
            // Increment counter
            count = parseInt(count) + 1;
        }
        // Save counter value
        localStorage.setItem('visitorCount', count);
        
        // Format counter with leading zeros
        let formattedCount = count.toString().padStart(5, '0');
        counterElement.textContent = formattedCount;
    }
}

// Blinking text effect
function setupBlinkingText() {
    const blinkElements = document.querySelectorAll('.blink');
    blinkElements.forEach(element => {
        // The CSS animation handles the blinking
        // This is just to ensure the class is applied
        element.classList.add('blink');
    });
}

// MIDI background music player
function setupMidiPlayer() {
    const midiPlayer = document.querySelector('.midi-player');
    if (midiPlayer) {
        const playButton = midiPlayer.querySelector('.play-button');
        const stopButton = midiPlayer.querySelector('.stop-button');
        const audioElement = midiPlayer.querySelector('audio');
        
        if (playButton && stopButton && audioElement) {
            playButton.addEventListener('click', function() {
                audioElement.play();
            });
            
            stopButton.addEventListener('click', function() {
                audioElement.pause();
                audioElement.currentTime = 0;
            });
        }
    }
}

// Guestbook functionality
function setupGuestbook() {
    const guestbookForm = document.querySelector('.guestbook-form form');
    if (guestbookForm) {
        guestbookForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get form values
            const name = guestbookForm.querySelector('input[name="name"]').value;
            const email = guestbookForm.querySelector('input[name="email"]').value;
            const website = guestbookForm.querySelector('input[name="website"]').value;
            const message = guestbookForm.querySelector('textarea[name="message"]').value;
            
            // In a real implementation, this would be sent to a server
            // For this demo, we'll store in localStorage
            
            // Create a new message object
            const newMessage = {
                name: name,
                email: email,
                website: website,
                message: message,
                date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            };
            
            // Get existing messages from localStorage
            let messages = JSON.parse(localStorage.getItem('guestbookMessages') || '[]');
            
            // Add new message to the beginning of the array
            messages.unshift(newMessage);
            
            // Save updated messages
            localStorage.setItem('guestbookMessages', JSON.stringify(messages));
            
            // Display the new message
            displayGuestbookMessages();
            
            // Reset form
            guestbookForm.reset();
            
            // Show confirmation
            alert('Thank you for signing my guestbook!');
        });
    }
}

// Display guestbook messages
function displayGuestbookMessages() {
    const messagesContainer = document.querySelector('.messages');
    if (messagesContainer) {
        // Get messages from localStorage
        const messages = JSON.parse(localStorage.getItem('guestbookMessages') || '[]');
        
        // If there are no saved messages, keep the default ones
        if (messages.length === 0) {
            return;
        }
        
        // Clear existing messages
        messagesContainer.innerHTML = '';
        
        // Add each message to the container
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            
            const headerDiv = document.createElement('div');
            headerDiv.className = 'message-header';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'message-name';
            nameSpan.textContent = msg.name;
            
            const dateSpan = document.createElement('span');
            dateSpan.className = 'message-date';
            dateSpan.textContent = msg.date;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = msg.message;
            
            headerDiv.appendChild(nameSpan);
            headerDiv.appendChild(dateSpan);
            messageDiv.appendChild(headerDiv);
            messageDiv.appendChild(contentDiv);
            
            messagesContainer.appendChild(messageDiv);
        });
    }
}

// Custom cursor
function setupCustomCursor() {
    // Check if custom cursor class is applied to body
    const body = document.body;
    if (body.classList.contains('custom-cursor')) {
        // Custom cursor is handled by CSS
        // This is just to ensure the class is applied
    }
}

// Initialize all interactive elements
function initInteractiveElements() {
    updateVisitorCounter();
    setupBlinkingText();
    setupMidiPlayer();
    setupGuestbook();
    displayGuestbookMessages();
    setupCustomCursor();
    
    // Add a class to body after page is fully loaded
    document.body.classList.add('page-loaded');
}

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initInteractiveElements);
