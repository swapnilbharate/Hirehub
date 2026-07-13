const API = "http://localhost:5000/api";

// LOGIN
async function login(){
  const res = await fetch(`${API}/login`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      email:email.value,
      password:password.value
    })
  });

  const data = await res.json();

  if(data.token){
    localStorage.setItem("token", data.token);
    alert("Login Successful ✅");
    window.location = "jobs.html";
  } else {
    alert(data.msg || "Login Failed ❌");
  }
}

// REGISTER
async function register(){
  const res = await fetch(`${API}/register`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      name:name.value,
      email:email.value,
      password:password.value,
      role:role.value
    })
  });

  const data = await res.json();
  alert(data.msg);
}