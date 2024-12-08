// Function to toggle the modal visibility
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle("hidden");
    } else {
        console.warn(`Modal with ID '${modalId}' not found.`);
    }
}
let typingTimer; // Timer for debounce
const typingInterval = 400; // Delay time (in ms)


// name submition

document.getElementById('updateForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent default form submission

    const firstname = document.getElementById('firstname').value.trim();
    const lastname = document.getElementById('lastname').value.trim();

    // Validate first name and last name
    if (!firstname || !lastname) {
      alert('First Name and Last Name are required.');
      return;
    }

    // Prepare data to send
    const payload = { firstname, lastname };

    try {
        const response = await axios.post('/submit-AccountName', payload);
        console.log(response.data);
      
        if (response.status === 200) {
          // Show the alert and wait for the user to confirm
          alert(response.data.message || 'Details updated successfully.');
      
          // Reload the page after the alert is dismissed
          window.location.reload();
        } else {
          alert('Failed to update details. Please try again.');
        }
      } catch (error) {
        console.error('Error while updating details:', error);
        alert(error.response?.data?.message || 'An error occurred. Please try again later.');
      }
      
  });

 

  
  async function checkOldPassword() { // Removed typingTimer parameter
      const oldPasswordInput = document.getElementById('old-password');
      const oldPasswordError = document.getElementById('old-password-error');
      const newPasswordInput = document.getElementById('password');
  
      clearTimeout(typingTimer); // Use the global typingTimer
  
      typingTimer = setTimeout(async () => { // Assign to the global typingTimer
          try {
              const response = await axios.post(
                  '/validate-old-password',
                  { oldPassword: oldPasswordInput.value },
                  { headers: { 'Content-Type': 'application/json' } }
              );
  
              if (response.data.isValid) {
                  oldPasswordInput.classList.remove('border-red-500');
                  oldPasswordInput.classList.add('border-green-500');
                  oldPasswordError.classList.add('hidden');
  
                  newPasswordInput.disabled = false;
                  newPasswordInput.classList.remove('cursor-not-allowed', 'opacity-50');
                  newPasswordInput.classList.add('focus:ring-indigo-500', 'focus:border-indigo-500');
              } else {
                  oldPasswordInput.classList.add('border-red-500');
                  oldPasswordInput.classList.remove('border-green-500');
                  oldPasswordError.textContent = "Invalid old password.";
                  oldPasswordError.classList.remove('hidden');
  
                  newPasswordInput.disabled = true;
                  newPasswordInput.classList.add('cursor-not-allowed', 'opacity-50');
                  newPasswordInput.classList.remove('focus:ring-indigo-500', 'focus:border-indigo-500');
              }
          } catch (error) {
              console.error("Error validating old password:", error);
  
              oldPasswordInput.classList.add('border-red-500');
              oldPasswordError.textContent = "An error occurred. Please try again.";
              oldPasswordError.classList.remove('hidden');
  
              newPasswordInput.disabled = true;
              newPasswordInput.classList.add('cursor-not-allowed', 'opacity-50');
          }
      }, typingInterval);
  }
  

function validateForm(oldPassword, newPassword) {
    const oldPasswordInput = document.getElementById('old-password');
    const oldPasswordError = document.getElementById('old-password-error');
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('password-error');

    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;

    let isValid = true;

    // Validate old password
    if (!oldPassword) {
        oldPasswordError.textContent = "Old password is required.";
        oldPasswordInput.classList.add('border-red-500');
        isValid = false;
    } else {
        oldPasswordError.textContent = "";
        oldPasswordInput.classList.remove('border-red-500');
    }

    // Validate new password
    if (!newPassword) {
        passwordError.textContent = "New password is required.";
        passwordInput.classList.add('border-red-500');
        isValid = false;
    } else if (!passwordPattern.test(newPassword)) {
        passwordError.textContent = "Password must have 8+ characters, an uppercase, a lowercase, a number, and a special character.";
        passwordInput.classList.add('border-red-500');
        isValid = false;
    } else if (newPassword === oldPassword) {
        passwordError.textContent = "New password cannot be the same as the old password.";
        passwordInput.classList.add('border-red-500');
        isValid = false;
    } else {
        passwordError.textContent = "";
        passwordInput.classList.remove('border-red-500');
    }

    return isValid;
}

async function submitSecurityForm(event) {
    event.preventDefault(); // Prevent default form submission

    const submitButton = document.getElementById('submit-btn');
    const oldPasswordInput = document.getElementById('old-password');
    const passwordInput = document.getElementById('password');

    if (!submitButton || !oldPasswordInput || !passwordInput) {
        console.error("Required elements are missing. Check the DOM structure.");
        return;
    }

    submitButton.disabled = true;

    const oldPassword = oldPasswordInput.value.trim();
    const newPassword = passwordInput.value.trim();

    if (!validateForm(oldPassword, newPassword)) {
        submitButton.disabled = false;
        return;
    }

    const payload = { oldPassword, newPassword };

    try {
        const response = await axios.post('/submit-accountDetails', payload);
        console.log(response.data);
        
        if (response.status === 200) {
            console.log('Security settings updated:', response.data);
    
            // Show success message
            alert('Password changed successfully. Please relogin with your new password.');
    
            // Clear session (simulate logout)
            await axios.get('/logout'); // Call a route to destroy the session on the server
            
            // Redirect to login page
            window.location.href = '/';
        } else {
            console.error('Failed to update settings:', response.statusText);
        }
    } catch (error) {
        console.error('Error while submitting:', error);
    } finally {
        submitButton.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const oldPasswordInput = document.getElementById('old-password');
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('password-error');
    const securityForm = document.getElementById('securityForm');

    if (oldPasswordInput) {
        oldPasswordInput.addEventListener('input', checkOldPassword);
    } else {
        console.warn("Old password input field not found.");
    }

    if (passwordInput && passwordError) {
        passwordInput.addEventListener('keyup', () => {
            const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
            if (!passwordPattern.test(passwordInput.value)) {
                passwordError.textContent = "Password must meet the required criteria.";
                passwordInput.classList.add('border-red-500');
            } else {
                passwordError.textContent = "";
                passwordInput.classList.remove('border-red-500');
            }
        });
    }

    if (securityForm) {
        securityForm.addEventListener('submit', submitSecurityForm);
    } else {
        console.warn("Security form not found.");
    }
});


