// Register.js

// Selecting input fields
const firstName = document.getElementById('firstname');
const lastName = document.getElementById('lastname');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('Confirm');

// Error messages
const fnameError = document.getElementById('fnameerror');
const lnameError = document.getElementById('lnameerror');
const emailError = document.getElementById('emailerror');
const passwordError = document.getElementById('passworderror');
const confirmError = document.getElementById('confirmerror');

// First Name Validation (keyup)
firstName.addEventListener('keyup', () => {
    if (firstName.value.trim() === "") {
        fnameError.textContent = "First name is required";
        firstName.classList.add('border-red-500');
    } else {
        fnameError.textContent = "";
        firstName.classList.remove('border-red-500');
    }
});

// Last Name Validation (keyup)
lastName.addEventListener('keyup', () => {
    if (lastName.value.trim() === "") {
        lnameError.textContent = "Last name is required";
        lastName.classList.add('border-red-500');
    } else {
        lnameError.textContent = "";
        lastName.classList.remove('border-red-500');
    }
});

// Email Validation (keyup)
email.addEventListener('keyup', () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value.trim() === "") {
        emailError.textContent = "Email is required";
        email.classList.add('border-red-500');
    } else if (!emailPattern.test(email.value)) {
        emailError.textContent = "Please enter a valid email";
        email.classList.add('border-red-500');
    } else {
        emailError.textContent = "";
        email.classList.remove('border-red-500');
    }
});

// Password Validation (keyup)
password.addEventListener('keyup', () => {
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (password.value.trim() === "") {
        passwordError.textContent = "Password is required";
        password.classList.add('border-red-500');
    } else if (!passwordPattern.test(password.value)) {
        passwordError.textContent = "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character";
        password.classList.add('border-red-500');
    } else {
        passwordError.textContent = "";
        password.classList.remove('border-red-500');
    }
});

// Confirm Password Validation (keyup)
confirmPassword.addEventListener('keyup', () => {
    if (confirmPassword.value.trim() === "") {
        confirmError.textContent = "Please confirm your password";
        confirmPassword.classList.add('border-red-500');
    } else if (confirmPassword.value !== password.value) {
        confirmError.textContent = "Passwords do not match";
        confirmPassword.classList.add('border-red-500');
    } else {
        confirmError.textContent = "";
        confirmPassword.classList.remove('border-red-500');
    }
});

// Form Submission Validation
document.getElementById('RegisterForm').addEventListener('submit', (event) => {
    // Prevent form submission if validation fails
    if (firstName.value.trim() === "") {
        fnameError.textContent = "First name is required";
        firstName.classList.add('border-red-500');
        event.preventDefault();
    }

    if (lastName.value.trim() === "") {
        lnameError.textContent = "Last name is required";
        lastName.classList.add('border-red-500');
        event.preventDefault();
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value.trim() === "") {
        emailError.textContent = "Email is required";
        email.classList.add('border-red-500');
        event.preventDefault();
    } else if (!emailPattern.test(email.value)) {
        emailError.textContent = "Please enter a valid email";
        email.classList.add('border-red-500');
        event.preventDefault();
    }

    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (password.value.trim() === "") {
        passwordError.textContent = "Password is required";
        password.classList.add('border-red-500');
        event.preventDefault();
    } else if (!passwordPattern.test(password.value)) {
        passwordError.textContent = "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character";
        password.classList.add('border-red-500');
        event.preventDefault();
    }

    if (confirmPassword.value.trim() === "") {
        confirmError.textContent = "Please confirm your password";
        confirmPassword.classList.add('border-red-500');
        event.preventDefault();
    } else if (confirmPassword.value !== password.value) {
        confirmError.textContent = "Passwords do not match";
        confirmPassword.classList.add('border-red-500');
        event.preventDefault();
    }
});
