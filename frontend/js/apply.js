const API = "http://localhost:5000/api";

async function applyJob(){
  await fetch(`${API}/apply`,{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization': localStorage.getItem("token")
    },
    body:JSON.stringify({
      jobId: localStorage.getItem("jobId")
    })
  });

  alert("Applied Successfully 🚀");
  window.location = "dashboard.html";
}