// Show booking form on Book Slot button click
const bookBtn = document.getElementById('book-slot-btn');
const slotForm = document.getElementById('slot-form');
const submitSlotBtn = document.getElementById('submit-slot');
const registeredMsg = document.getElementById('registered-msg');

bookBtn.addEventListener('click', () => {
  slotForm.classList.remove('hidden');
  registeredMsg.classList.add('hidden');  // hide message if visible before
});

// Handle form submission
slotForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const regno = document.getElementById('regno').value.trim();

  if (name && regno) {
    // Hide form, show success message
    slotForm.classList.add('hidden');
    registeredMsg.classList.remove('hidden');

    // Show +10 points animation next to message
    showPointsAnimation(registeredMsg, "+10 Points");
  } else {
    alert("Please fill in both fields.");
  }
});

// Function to create and show +10 points coin animation (continuous)
function showPointsAnimation(container, text) {
  // Create points text element
  let pointsText = document.createElement('div');
  pointsText.textContent = text;
  pointsText.style.position = 'relative';
  pointsText.style.fontWeight = 'bold';
  pointsText.style.color = '#28a745';
  pointsText.style.marginLeft = '10px';
  pointsText.style.fontSize = '18px';
  pointsText.style.userSelect = 'none';
  container.appendChild(pointsText);

  // Create coin burst container
  let coinBurst = document.createElement('div');
  coinBurst.className = 'coin-burst';
  container.appendChild(coinBurst);

  // Style for coin burst container
  coinBurst.style.position = 'absolute';
  coinBurst.style.left = 'calc(100% + 20px)';
  coinBurst.style.top = '0';
  coinBurst.style.width = '200px';
  coinBurst.style.height = '60px';
  coinBurst.style.pointerEvents = 'none';

  // Create coins and animate repeatedly
  function animateCoins() {
    coinBurst.innerHTML = '';
    for (let i = 0; i < 15; i++) {
      let coin = document.createElement('div');
      coin.className = 'coin';
      coin.style.left = Math.random() * 180 + 'px';
      coin.style.top = '30px';
      coin.style.animation = `coin-fall 1.5s ease forwards`;
      coin.style.animationDelay = (i * 0.1) + 's';
      coinBurst.appendChild(coin);
    }
  }

  animateCoins();

  // Repeat animation every 2 seconds as long as container is visible
  const intervalId = setInterval(() => {
    if (!container.isConnected || container.classList.contains('hidden')) {
      clearInterval(intervalId);
      return;
    }
    animateCoins();
  }, 2000);
}

document.getElementById('upload-photo-btn').addEventListener('click', () => {
  const fileInput = document.getElementById('photo-upload');
  const files = fileInput.files;
  const statusDiv = document.getElementById('upload-status');

  // Reset status
  statusDiv.textContent = '';
  statusDiv.className = 'hidden';

  if (files.length === 0) {
    statusDiv.textContent = "Please select photos to upload.";
    statusDiv.classList.remove('hidden');
    statusDiv.classList.add('error');
    return;
  }

  // Calculate total size
  let totalSize = 0;
  for (let i = 0; i < files.length; i++) {
    totalSize += files[i].size;
  }

  const maxSize = 100 * 1024 * 1024; // 100MB
  if (totalSize > maxSize) {
    statusDiv.textContent = "Total file size exceeds 100 MB.";
    statusDiv.classList.remove('hidden');
    statusDiv.classList.add('error');
    return;
  }

  // Ready to upload
  statusDiv.textContent = "Uploading...";
  statusDiv.classList.remove('hidden', 'error');
  statusDiv.classList.add('loading');

  // Prepare FormData
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('photos', files[i]);
  }

  // Replace with your backend API URL
  const uploadUrl = "https://your-backend-api.example.com/upload-photos";

  fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  })
    .then(response => {
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    })
    .then(data => {
      statusDiv.textContent = "Photos uploaded successfully!";
      statusDiv.classList.remove('loading');
    })
    .catch(error => {
      statusDiv.textContent = "❌ Error uploading photos: " + error.message;
      statusDiv.classList.remove('loading');
      statusDiv.classList.add('error');
    });
});

// Show selfie form
document.getElementById("open-selfie-form").addEventListener("click", () => {
  document.getElementById("selfie-form").classList.remove("hidden");
  document.getElementById("flag-success").classList.add("hidden");
});

document.getElementById("selfie-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("selfie-name").value.trim();
  const reg = document.getElementById("selfie-reg").value.trim();
  const file = document.getElementById("selfie-file").files[0];
  const successMsg = document.getElementById("flag-success");

  if (!name || !reg || !file) {
    alert("Please fill all fields and select a photo.");
    return;
  }

  if (file.size > 50 * 1024 * 1024) {
    alert("Image must be less than 50MB.");
    return;
  }

  // Show success message and coin animation
  successMsg.classList.remove("hidden");

  // Restart animation
  const coin = successMsg.querySelector(".coin-burst");
  coin.classList.remove("coin-burst");
  void coin.offsetWidth;
  coin.classList.add("coin-burst");
});

