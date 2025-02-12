document.getElementById("adminLoginForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    const response = await fetch("/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
        window.location.href = data.redirect; // Redirect if login is successful
    } else {
        errorMessage.innerText = data.message;
        errorMessage.classList.remove("hidden"); // Show error message
    }
});