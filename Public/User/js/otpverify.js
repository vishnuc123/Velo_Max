
        // Combine OTP function
        function combineOtp() {
          const otpInputs = document.querySelectorAll('.otp-input');
          let otpValue = '';
          otpInputs.forEach(input => otpValue += input.value);
          document.getElementById('full-otp').value = otpValue;
      }

      // OTP Input Focus Logic
      const otpInputs = document.querySelectorAll('.otp-input');
      const submitButton = document.querySelector('button[type="submit"]');
      const hiddenOtpField = document.getElementById('full-otp');

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

      // Resend Button Timer
      let resendTimeLeft = 300; // 5 minutes in seconds
      const resendLink = document.getElementById('resend-link');
      const resendTimer = setInterval(() => {
          const minutes = Math.floor(resendTimeLeft / 60);
          const seconds = resendTimeLeft % 60;
          resendLink.textContent = `Resend (${minutes}:${seconds.toString().padStart(2, '0')})`;
          if (--resendTimeLeft <= 0) {
              clearInterval(resendTimer);
              resendLink.classList.remove("cursor-not-allowed", "pointer-events-none");
              resendLink.href = "/resendOtp"; // Enable resend link
              resendLink.textContent = "Resend";
          }
      }, 1000);