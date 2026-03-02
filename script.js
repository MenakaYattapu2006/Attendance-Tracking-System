let students = [];
let attendance = {};

if (document.getElementById('upload')) {
  document.getElementById('upload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const contents = e.target.result;
        parseCSV(contents);
        document.getElementById('proceedBtn').disabled = false;
      };
      reader.readAsText(file);
    }
  });

  document.getElementById('proceedBtn').addEventListener('click', () => {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('attendance', JSON.stringify(attendance));
    showScanSection();
  });
}

function parseCSV(data) {
  const lines = data.trim().split('\n');
  students = lines.map(line => {
    const [id, name] = line.split(',');
    return { id: id.trim(), name: name.trim() };
  });
  attendance = {};
}

function showScanSection() {
  document.getElementById('indexSection').style.display = 'none';
  document.getElementById('scanSection').style.display = 'block';
}

function markAttendance() {
  students = JSON.parse(localStorage.getItem('students'));
  attendance = JSON.parse(localStorage.getItem('attendance')) || {};

  const input = document.getElementById('scanInput').value.trim().toLowerCase();
  const message = document.getElementById('message');

  const student = students.find(s => 
    s.id.toLowerCase() === input || s.name.toLowerCase() === input
  );

  if (student) {
    if (attendance[student.id]) {
      message.textContent = `${student.name} already marked.`;
    } else {
      attendance[student.id] = { ...student, status: 'Attended' };
      message.textContent = `Attendance marked for ${student.name}`;
      localStorage.setItem('attendance', JSON.stringify(attendance));
    }
  } else {
    message.textContent = "Student not found.";
  }

  document.getElementById('scanInput').value = '';
}

function showReportSection() {
  document.getElementById('scanSection').style.display = 'none';
  document.getElementById('reportSection').style.display = 'block';
  loadReport();
}

function loadReport() {
  students = JSON.parse(localStorage.getItem('students'));
  attendance = JSON.parse(localStorage.getItem('attendance'));

  let csv = "ID,Name,Status\n";
  const tbody = document.querySelector("#reportTable tbody");

  students.forEach(student => {
    const status = attendance[student.id] ? "Attended" : "Skipped";
    csv += `${student.id},${student.name},${status}\n`;

    const row = document.createElement("tr");
    row.innerHTML = `<td>${student.id}</td><td>${student.name}</td><td>${status}</td>`;
    tbody.appendChild(row);
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "hostel_meal_attendance.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
