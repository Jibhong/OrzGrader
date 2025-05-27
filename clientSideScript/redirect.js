const target = localStorage.getItem("redirect");
if (target) {
    const token = localStorage.getItem("token");
    fetch('/api/page/redirect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            target:target,
            token:token
        })
    })
    .then(response => response.text())
    .then(html => {
        document.open();
        //use another method to change the page
        // this is only a placeholder, you should use a proper method to update the page
        document.write(html);
        document.close();
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });
}