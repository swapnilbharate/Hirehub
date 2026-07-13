const API = "http://localhost:5000/api";

async function loadJobs(){
  try {
    const res = await fetch(`${API}/jobs`);
    const data = await res.json();

    display(data);
  } catch(err){
    console.error(err);
  }
}

function display(data){
  const container = document.getElementById("jobs");

  container.innerHTML = data.map(j => `
    <div class="col-md-4">
      <div class="card p-3 mb-3 shadow">

        <h5>${j.title}</h5>
        <p>${j.company}</p>
        <span class="badge bg-secondary">${j.location}</span>

        <button onclick="apply('${j._id}')" 
        class="btn btn-primary btn-sm mt-2">
          Apply
        </button>

      </div>
    </div>
  `).join('');

  document.getElementById("totalJobs").innerText = data.length;
}

function apply(id){
  localStorage.setItem("jobId", id);
  window.location = "apply.html";
}

loadJobs();