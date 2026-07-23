const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const dropText = document.getElementById('drop-text');
const convertBtn = document.getElementById('convert-btn');
const statusMessage = document.getElementById('status-message');
const conversionType = document.getElementById('conversion-type');

let selectedFile = null;

// --- IMPORTANT: Paste your ConvertAPI Secret inside the quotes below ---
const API_SECRET = 'BLjqjTzgUo6tqe6ad7hTXrdQcE4hrQSt'; 
// -----------------------------------------------------------------------

// 1. Trigger file input when the drop zone is`''` tapped
dropZone.addEventListener('click', () => fileInput.click());

// 2. Handle the file once the user selects it
fileInput.addEventListener('change', (e) => {
  handleFile(e.target.files[0]);
});

function handleFile(file) {
  if (file) {
    selectedFile = file;
    dropText.textContent = `Selected: ${file.name}`;
    convertBtn.disabled = false;
    
    if (file.name.endsWith('.docx')) conversionType.value = 'docx-to-pdf';
    if (file.name.endsWith('.pptx')) conversionType.value = 'ppt-to-pdf';
    if (file.name.endsWith('.pdf')) conversionType.value = 'pdf-to-docx';
  }
}

// 3. Real API Connection
convertBtn.addEventListener('click', async () => {
  if (!selectedFile) return;

  const format = conversionType.value;
  let [fromFormat, , toFormat] = format.split('-'); 

  // FIX: ConvertAPI handles PowerPoint using the 'office' parameter instead of 'ppt'
  if (fromFormat === 'ppt') {
    fromFormat = 'office';
  }

  convertBtn.disabled = true;
  convertBtn.textContent = 'Converting...';
  statusMessage.textContent = `Uploading and converting ${selectedFile.name}... this may take a moment.`;

  try {
    const formData = new FormData();
    formData.append('File', selectedFile);

    const response = await fetch(`https://v2.convertapi.com/convert/${fromFormat}/to/${toFormat}?Secret=${API_SECRET}`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      let downloadUrl = data.Files[0].Url;
      // FIX: Ensure the browser knows this is an external link
      if (!downloadUrl.startsWith('http')) {
        downloadUrl = 'https://' + downloadUrl;
      }
      statusMessage.innerHTML = `✅ Success! <a href="${downloadUrl}" target="_blank" style="color: #4299e1; font-weight: bold; text-decoration: none;">Tap here to download your file</a>`;
    } else {
      statusMessage.textContent = `❌ Error: ${data.Message || 'Conversion failed.'}`;
    }
  } catch (error) {
    console.error(error);
    statusMessage.textContent = '❌ A network error occurred. Please try again.';
  } finally {
    convertBtn.textContent = 'Convert Another Document';
    convertBtn.disabled = false;
  }
});

