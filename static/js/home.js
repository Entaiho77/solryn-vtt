// Home page functionality
document.addEventListener('DOMContentLoaded', () => {
    const createBtn = document.getElementById('createBtn');
    const joinBtn = document.getElementById('joinBtn');
    const roomCodeInput = document.getElementById('roomCodeInput');

    // Create new room
    if (createBtn) {
        createBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/create-room', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                const data = await response.json();
                
                if (data.room_code) {
                    window.location.href = `/room/${data.room_code}`;
                }
            } catch (error) {
                console.error('Error creating room:', error);
                alert('Failed to create room. Please try again.');
            }
        });
    }

    // Join existing room
    if (joinBtn && roomCodeInput) {
        joinBtn.addEventListener('click', () => {
            const roomCode = roomCodeInput.value.trim().toUpperCase();
            
            if (!roomCode) {
                alert('Please enter a room code');
                return;
            }
            
            if (roomCode.length !== 6) {
                alert('Room code must be 6 characters');
                return;
            }
            
            window.location.href = `/room/${roomCode}`;
        });

        // Allow Enter key to join
        roomCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                joinBtn.click();
            }
        });

        // Auto-uppercase and limit input
        roomCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-F0-9]/g, '');
        });
    }
});