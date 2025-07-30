const assetForm = document.getElementById('assetForm');
const assetTableBody = document.querySelector('#assetTable tbody');
const exportCsvBtn = document.getElementById('exportCsv');
const exportXlsxBtn = document.getElementById('exportXlsx');
const importFile = document.getElementById('importFile');

let assets = JSON.parse(localStorage.getItem('assets') || '[]');
renderTable();

assetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const type = document.getElementById('type').value;
  const name = document.getElementById('name').value;
  const description = document.getElementById('description').value;
  const photoInput = document.getElementById('photo');

  let photoData = '';
  if (photoInput.files[0]) {
    photoData = await toBase64(photoInput.files[0]);
  }

  const asset = { type, name, description, photoData };
  assets.push(asset);
  localStorage.setItem('assets', JSON.stringify(assets));
  renderTable();
  assetForm.reset();
});

exportCsvBtn.addEventListener('click', () => {
  const csv = Papa.unparse(assets.map(a => ({
    type: a.type,
    name: a.name,
    description: a.description,
    photoData: a.photoData
  })));
  downloadFile(csv, 'assets.csv', 'text/csv;charset=utf-8;');
});

exportXlsxBtn.addEventListener('click', () => {
  const ws = XLSX.utils.json_to_sheet(assets.map(a => ({
    type: a.type,
    name: a.name,
    description: a.description,
    photoData: a.photoData
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Assets');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadFile(new Blob([wbout], { type: 'application/octet-stream' }), 'assets.xlsx');
});

importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  const isCsv = file.name.endsWith('.csv');
  reader.onload = (evt) => {
    if (isCsv) {
      const parsed = Papa.parse(evt.target.result, { header: true }).data;
      assets = parsed.filter(r => r.type).map(r => ({
        type: r.type,
        name: r.name,
        description: r.description,
        photoData: r.photoData
      }));
    } else {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(ws);
      assets = parsed.map(r => ({
        type: r.type,
        name: r.name,
        description: r.description,
        photoData: r.photoData
      }));
    }
    localStorage.setItem('assets', JSON.stringify(assets));
    renderTable();
  };
  if (isCsv) {
    reader.readAsText(file);
  } else {
    reader.readAsBinaryString(file);
  }
});

function renderTable() {
  assetTableBody.innerHTML = '';
  assets.forEach(asset => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${asset.type}</td>
      <td>${asset.name}</td>
      <td>${asset.description}</td>
      <td>${asset.photoData ? `<img src="${asset.photoData}" class="thumbnail"/>` : ''}</td>
    `;
    assetTableBody.appendChild(tr);
  });
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

function downloadFile(data, filename, type) {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
