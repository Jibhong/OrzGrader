function login(event) {
    event.preventDefault(); // Prevent default form submission
    const form = document.getElementById('loginForm');

    const username = form.username.value.trim();
    const password = form.password.value;

    if (!username || !password) {
        alert('Please enter both username and password.');
        return false; // prevent submission
    }

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(errorData => {
                throw new Error(errorData.message || 'Login failed');
            });
        }
        return res.json();
    })
    .then(res => {
        alert(res.message);
        window.location.href = '/dashboard'; // example redirect
    })
    .catch(error => {
        alert(error.message || 'An error occurred. Please try again.');
    });

    return false; // prevent form from submitting normally
}
