// Function to toggle the modal visibility
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.toggle("hidden");
}

let typingTimer; // Timer for debounce
const typingInterval = 500; // Delay time (in ms)

async function checkOldPassword() {
    const oldPasswordInput = document.getElementById('old-password');
    const oldPasswordCheckmark = document.getElementById('old-password-checkmark');
  
    clearTimeout(typingTimer);
  
    typingTimer = setTimeout(async () => {
      try {
        const response = await axios.post('/validate-old-password', 
          { oldPassword: oldPasswordInput.value },
          { headers: { 'Content-Type': 'application/json' } }
        );
  
        if (response.data.isValid) {
          oldPasswordCheckmark.classList.remove('hidden');
          oldPasswordInput.classList.remove('border-red-500');
          oldPasswordInput.classList.add('border-green-500');
        } else {
          oldPasswordCheckmark.classList.add('hidden');
          oldPasswordInput.classList.add('border-red-500');
        }
      } catch (error) {
        console.error("Error validating old password:", error);
        oldPasswordCheckmark.classList.add('hidden');
        oldPasswordInput.classList.add('border-red-500');
      }
    }, typingInterval);
  }
  

// Function to validate the form fields before submission
function validateForm(oldPassword, newPassword) {
    const oldPasswordInput = document.getElementById('old-password');
    const oldPasswordError = document.getElementById('old-password-error');
    const passwordError = document.getElementById('password-error');
    
    let isValid = true;

    // Validate old password
    if (!oldPassword || oldPassword !== correctOldPassword) {
        oldPasswordInput.classList.remove('border-gray-300', 'border-green-500');
        oldPasswordInput.classList.add('border-red-500', 'border-4');
        oldPasswordError.classList.remove('hidden');
        isValid = false;
    } else {
        oldPasswordInput.classList.remove('border-gray-300', 'border-red-500');
        oldPasswordInput.classList.add('border-green-500', 'border-4');
        oldPasswordError.classList.add('hidden');
    }

    // Validate new password (at least 6 characters)
    if (!newPassword || newPassword.length < 6) {
        passwordError.classList.remove('hidden');
        isValid = false;
    } else {
        passwordError.classList.add('hidden');
    }

    return isValid;
}

// Function to handle form submission with Axios
async function submitSecurityForm(event) {
    event.preventDefault(); // Prevent form from submitting normally

    const submitButton = document.getElementById('submit-btn'); // Get the submit button

    if (!submitButton) {
        console.error("Submit button not found. Ensure the element with ID 'submit-btn' exists.");
        return;
    }

    submitButton.disabled = true; // Disable the submit button to prevent multiple requests

    // Get form field values
    const oldPasswordInput = document.getElementById('old-password');
    const passwordInput = document.getElementById('password');

    if (!oldPasswordInput || !passwordInput) {
        console.error("Required input fields are missing. Ensure 'old-password' and 'password' exist.");
        submitButton.disabled = false; // Re-enable the submit button
        return;
    }

    const oldPassword = oldPasswordInput.value;
    const newPassword = passwordInput.value;

    // Validate form
    if (!validateForm(oldPassword, newPassword)) {
        console.error("Validation failed. Ensure passwords meet the required criteria.");
        submitButton.disabled = false; // Re-enable the submit button
        return; // Don't submit if validation fails
    }

    // Create payload for the request
    const payload = {
        oldPassword: oldPassword,
        newPassword: newPassword,
    };

    try {
        // Send data to backend via Axios POST request
        const response = await axios.post('/submit-accountDetails', payload);

        // Handle response from the backend
        if (response.status === 200) {
            console.log('Security settings updated:', response.data);
            toggleModal('security-modal'); // Assuming you have this function
        } else {
            console.error('Failed to update security settings:', response.statusText);
        }
    } catch (error) {
        console.error('Error while sending data:', error);
    } finally {
        submitButton.disabled = false; // Re-enable the submit button after the request
    }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    const oldPasswordInput = document.getElementById('old-password');
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('password-error'); // Assuming you have this element for error messages
    const securityForm = document.getElementById('securityForm');

    // Password validation (keyup)
    if (passwordInput && passwordError) {
        passwordInput.addEventListener('keyup', () => {
            const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
            if (passwordInput.value.trim() === "") {
                passwordError.textContent = "Password is required";
                passwordInput.classList.add('border-red-500');
            } else if (!passwordPattern.test(passwordInput.value)) {
                passwordError.textContent = "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character";
                passwordInput.classList.add('border-red-500');
            } else {
                passwordError.textContent = "";
                passwordInput.classList.remove('border-red-500');
            }
        });
    } else {
        console.warn("Password input or error message element not found.");
    }

    // Form submission
    if (securityForm) {
        securityForm.addEventListener('submit', submitSecurityForm);
    } else {
        console.warn("Security form 'securityForm' not found.");
    }
});

// Example form validation function
function validateForm(oldPassword, newPassword) {
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;

    if (!oldPassword || !newPassword) {
        alert("Both fields are required.");
        return false;
    }

    if (!passwordPattern.test(newPassword)) {
        alert("Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.");
        return false;
    }

    return true;
}
