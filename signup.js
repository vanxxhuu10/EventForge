function sendOTP() {
  const clubName = document.getElementById("club_name").value;
  const clubEmail = document.getElementById("club_email").value;

  fetch('https://eventforge.onrender.com/send-otp', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ club_name: clubName, club_email: clubEmail })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert(data.message);
      startOTPTimer(data.expiry || 120); // default to 120 seconds
    } else {
      alert(data.error || "Failed to send OTP");
    }
  })
  .catch(err => {
    console.error(err);
    alert("Error sending OTP");
  });
}

function startOTPTimer(seconds) {
  const timerDisplay = document.getElementById("otp-timer");
  let timeLeft = seconds;

  timerDisplay.textContent = `OTP expires in ${timeLeft} seconds`;

  const countdown = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(countdown);
      timerDisplay.textContent = "OTP expired. Please request a new one.";
    } else {
      timerDisplay.textContent = `OTP expires in ${timeLeft} seconds`;
    }
  }, 1000);
}

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorElement = document.getElementById('error-message');
    errorElement.textContent = '';

    const clubName = document.getElementById('club_name').value.trim();
    const clubEmail = document.getElementById('club_email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const otp = document.getElementById('otp').value.trim();  // ✅ Ensure you have an input with id="otp"

    if (!clubName || !clubEmail || !password || !confirmPassword || !otp) {
        errorElement.textContent = 'All fields including OTP are required';
        return;
    }

    if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match';
        return;
    }

    try {
        const response = await fetch('https://eventforge.onrender.com/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                club_name: clubName,
                club_email: clubEmail,
                password: password,
                confirm_password: confirmPassword,
                otp: otp  
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            window.location.href = '/login.html';
        } else {
            errorElement.textContent = data.error || 'Registration failed';
        }
    } catch (error) {
        console.error('Error:', error);
        errorElement.textContent = 'Failed to connect to server. Please try again.';
    }
});



