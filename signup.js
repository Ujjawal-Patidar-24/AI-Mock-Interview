document.getElementById("signupForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Signup Successful! Please login.");
            window.location.href = "login.html";
        } else {
            alert(data.message);
        }

    } catch (error) {
        alert("Something went wrong. Please try again.");
        console.error(error);
    }
});