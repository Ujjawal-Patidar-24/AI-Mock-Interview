document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userName", data.user.name);
            localStorage.setItem("userEmail", data.user.email);

            alert("Login Successful!");
            window.location.href = "dashboard/index.html";
        } else {
            alert(data.message);
        }

    } catch (error) {
        alert("Something went wrong. Please try again.");
        console.error(error);
    }
});