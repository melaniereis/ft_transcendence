export function renderLoginForm(container: HTMLElement, onLoginSuccess: () => void): void {
  container.innerHTML = `
    <h2>Login</h2>
    <form id="login-form">
      <input type="text" name="username" placeholder="Username" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <div id="login-result"></div>
  `;

  const form = document.getElementById('login-form') as HTMLFormElement;
  const resultDiv = document.getElementById('login-result') as HTMLDivElement;

  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
    };

    try {
      const res = await fetch('https://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.token) {
        localStorage.setItem('authToken', result.token);
        resultDiv.textContent = 'Login successful!';
        startActivityMonitoring();
        onLoginSuccess(); // 👈 Update UI
      } else {
        resultDiv.textContent = 'Invalid credentials.';
      }
    } catch (err) {
      resultDiv.textContent = 'Login failed.';
    }
  });
}

// Activity monitoring system
let activityTimer: NodeJS.Timeout;
let isUserActive = true;

export function startActivityMonitoring() {

    updateOnlineStatus(true); // Set online on start
    
    const ACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    const UPDATE_INTERVAL = 30 * 1000; // 30 seconds

    // Reset activity timer
    function resetActivityTimer() {
        clearTimeout(activityTimer);
        if (!isUserActive) {
            isUserActive = true;
            updateOnlineStatus(true);
        }
        
        activityTimer = setTimeout(() => {
            isUserActive = false;
            updateOnlineStatus(false);
        }, ACTIVITY_TIMEOUT);
    }

    // Track user activities
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
        document.addEventListener(event, resetActivityTimer, true);
    });

    // Update last_seen periodically
    setInterval(() => {
        if (isUserActive) {
            updateLastSeen();
        }
    }, UPDATE_INTERVAL);

    // Handle page visibility
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            updateOnlineStatus(false);
        } else {
            resetActivityTimer();
        }
    });

    // Handle beforeunload (user closing browser/tab)
    window.addEventListener('beforeunload', () => {
        updateOnlineStatus(false);
    });

    // Start the timer
    resetActivityTimer();
}

async function updateOnlineStatus(isOnline: boolean) {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        await fetch('/api/profile/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ online: isOnline })
        });
        console.log(`Status updated to: ${isOnline ? 'online' : 'offline'}`);
    } catch (error) {
        console.error('Failed to update status:', error);
    }
}

async function updateLastSeen() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        await fetch('/api/profile/update-last-seen', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Failed to update last seen:', error);
    }
}