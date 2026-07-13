const API = "http://localhost:5000/api";

if(localStorage.getItem("role") !== "admin"){
  window.location = "jobs.html";
}

async function loadJobs(){
  const res = await fetch(`${API}/jobs`);
  const jobs = await res.json();

  jobList.innerHTML = jobs.map(j=>`
    <tr>
      <td>${j.title}</td>
      <td>${j.company}</td>
      <td>${j.location}</td>
      <td>${j.salary || "-"}</td>
      <td>
        <button onclick="deleteJob('${j._id}')" 
        class="btn btn-danger btn-sm">Delete</button>
      </td>
    </tr>
  `).join('');

  document.getElementById("totalJobs").innerText = jobs.length;
}

async function addJob(){
  await fetch(`${API}/jobs`,{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization': localStorage.getItem("token")
    },
    body:JSON.stringify({
      title:title.value,
      company:company.value,
      location:location.value,
      salary:salary.value,
      type:type.value,
      experience:experience.value
    })
  });

  alert("Job Added");
  loadJobs();
}

async function deleteJob(id){
  await fetch(`${API}/jobs/${id}`,{
    method:'DELETE',
    headers:{ 'Authorization': localStorage.getItem("token") }
  });

  loadJobs();
}

loadJobs();