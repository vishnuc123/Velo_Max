const email = document.getElementById('email')
const password = document.getElementById('password')
const errorEmail = document.getElementById('errorEmail')
const errorPass = document.getElementById('errorPass')



function ValidationEmail(){
    if(!email.value.match(/^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)){
        errorEmail.innerText = 'please provide email correctly'
        email.style.borderColor = 'red'
        console.log('error');
        return false
    }
    errorEmail.innerHTML = '';
    email.style.borderColor = 'green'
}
function valiedationPassword(){
    if (password.value.length < 8) {
        errorPass.innerText = 'Password must be at least 8 characters';
        errorPass.style.color = 'red';
        return false; // Validation failed
    }
    errorPass.innerHTML='' 
        password.style.borderColor = 'green'
}