// Initialize OTP Countdown Timer
const otpInitialTime = 180; // 3 minutes in seconds
let timeLeft = parseInt(localStorage.getItem('otpTimeLeft')) || otpInitialTime;
const countdownElement = document.getElementById('countdown');
const submitButton = document.querySelector('button[type="submit"]');
const resendLink = document.querySelector('a[href="/resendOtp"]');

function updateOtpTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 0) {
        clearInterval(otpTimer);
        localStorage.removeItem('otpTimeLeft');
        countdownElement.textContent = "OTP Expired";
        submitButton.disabled = true;
        submitButton.classList.add('opacity-50', 'cursor-not-allowed');
        enableResendLink();
    } else {
        localStorage.setItem('otpTimeLeft', timeLeft);
        timeLeft--;
    }
}

function enableResendLink() {
    resendLink.classList.remove("opacity-50", "pointer-events-none");
    resendLink.classList.add("text-indigo-600", "hover:text-indigo-800");
}

function disableResendLink() {
    resendLink.classList.add("opacity-50", "pointer-events-none");
    resendLink.classList.remove("text-indigo-600", "hover:text-indigo-800");
}

// Start or resume the OTP timer
const otpTimer = setInterval(updateOtpTimer, 1000);

// Initialize Resend functionality
resendLink.addEventListener('click', function(e) {
    if (timeLeft > 0) {
        e.preventDefault();
    } else {
        // Reset the timer when resend is clicked
        timeLeft = otpInitialTime;
        localStorage.setItem('otpTimeLeft', timeLeft);
        disableResendLink();
        submitButton.disabled = false;
        submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
        clearInterval(otpTimer);
        setInterval(updateOtpTimer, 1000);
    }
});

// Handle page load
window.addEventListener('load', () => {
    if (timeLeft <= 0) {
        countdownElement.textContent = "OTP Expired";
        submitButton.disabled = true;
        submitButton.classList.add('opacity-50', 'cursor-not-allowed');
        enableResendLink();
    } else {
        disableResendLink();
    }
});

// Existing OTP input handling code
const otpInputs = document.querySelectorAll('.otp-input');
otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        if (e.target.value.length === 1) {
            if (index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && index > 0 && input.value === '') {
            otpInputs[index - 1].focus();
        }
    });
});

function combineOtp() {
    let otpValue = '';
    otpInputs.forEach(input => otpValue += input.value);
    document.getElementById('full-otp').value = otpValue;
}