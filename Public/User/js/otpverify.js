const otpInputs = document.querySelectorAll('input[name="otp"]');
  const submitButton = document.querySelector('button[type="submit"]');
  const hiddenOtpField = document.createElement('input');
  hiddenOtpField.type = 'hidden';
  hiddenOtpField.name = 'otp';
  document.getElementById('otp-form').appendChild(hiddenOtpField);

  otpInputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      if (input.value.length === 1 && idx < otpInputs.length - 1) {
        otpInputs[idx + 1].focus();
      }
      hiddenOtpField.value = Array.from(otpInputs).map(i => i.value).join('');
      submitButton.disabled = hiddenOtpField.value.length !== otpInputs.length;
    });
  });

  // Countdown Timer
  let timeLeft = 180; // 3 minutes in seconds
  const countdownElement = document.getElementById('countdown');
  const timer = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (--timeLeft < 0) {
      clearInterval(timer);
      countdownElement.textContent = "OTP Expired";
      submitButton.disabled = true;
    }
  }, 1000);