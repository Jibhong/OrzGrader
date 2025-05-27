function login(event) {
    event.preventDefault(); // Prevent default form submission
    const form = document.getElementById('loginForm');

    const username = form.username.value.trim();
    const password = form.password.value;

    if (!username || !password) {
        alert('Please enter both username and password.');
        return false; // prevent submission
    }

    fetch('/api/user/login', {
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
        //store session token
        localStorage.setItem('token',res.token);
        //store redirect script to use later
        localStorage.setItem("redirect.js",res.redirectJs);
        //set redirect location
        localStorage.setItem('redirect','tasks');
        //run redirect script
        eval(res.redirectJs);
    })
    .catch(error => {
        alert(error.message || 'An error occurred. Please try again.');
    });

    return false; // prevent form from submitting normally
}

function register(event) {
    event.preventDefault(); // Prevent default form submission
    const form = document.getElementById('registerForm');

    const username = form.username.value.trim();
    const password = form.password.value;
    const confirmpassword = form.confirmpassword.value;

    if (!username || !password ||!confirmpassword) {
        alert('Please enter both username and password.');
        return false; // prevent submission
    }

    if (password != confirmpassword) {
        alert('Password not matching');
        return false; // prevent submission
    }

    fetch('/api/user/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(errorData => {
                throw new Error(errorData.message || 'Register failed');
            });
        }
        return res.json();
    })
    .then(res => {
        alert(res.message);
    })
    .catch(error => {
        alert(error.message || 'An error occurred. Please try again.');
    });

    return false; // prevent form from submitting normally
}

function removeUser(event) {
    event.preventDefault(); // Prevent default form submission
    const form = document.getElementById('removeUserForm');

    const username = form.username.value.trim();
    const password = form.password.value;
    if (!username || !password) {
        alert('Please enter both username and password.');
        return false; // prevent submission
    }

    fetch('/api/user/remove', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(errorData => {
                throw new Error(errorData.message || 'Remove User failed');
            });
        }
        return res.json();
    })
    .then(res => {
        alert(res.message);
    })
    .catch(error => {
        alert(error.message || 'An error occurred. Please try again.');
    });

    return false; // prevent form from submitting normally
}