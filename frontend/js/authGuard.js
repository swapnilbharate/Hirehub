// redirect if not logged in
const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first ❌");
    window.location = "login.html";
}