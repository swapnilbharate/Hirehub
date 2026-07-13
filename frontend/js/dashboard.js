const API = "http://localhost:5000/api";

async function loadApplied(){
  const res = await fetch(`${API}/apply`,{
    headers:{
      'Authorization': localStorage.getItem("token")
    }
  });

  const data = await res.json();

  const container = document.getElementById("applied");

  container.innerHTML = data.map(a=>`
    <div class="col-md-4">
      <div class="card p-3 mb-2">
        <h5>Applied Job ID: ${a.jobId}</h5>
        <span class="badge bg-success">Applied</span>
      </div>
    </div>
  `).join('');
}

loadApplied();