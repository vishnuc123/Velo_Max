async function fetchWalletDetails() {
    const currentBalance = document.getElementById('currentBalance');

    try {
        const response = await axios.get('/getWalletDetails');
        
        // Assuming the response structure has the balance directly
        const walletDetails = response.data.walletDetails; 

        if (walletDetails && walletDetails.balance !== undefined) {
            currentBalance.textContent = `₹${walletDetails.balance.toFixed(2)}`;
        } else {
            console.error('Invalid wallet details format:', response.data);
        }
    } catch (error) {
        console.error('Error fetching wallet details:', error);
        alert('Failed to load wallet details. Please try again later.');
    }
}

document.addEventListener('DOMContentLoaded', fetchWalletDetails);




// Function to validate amount input
// Function to validate amount input
function validateAmount(amount) {
    const amountError = document.getElementById('amountError');
    
    // Check if the amount is valid (greater than or equal to 500)
    if (amount <= 0 || amount < 500) {
        amountError.classList.remove('hidden');
        amountError.textContent = 'Only amounts of ₹500 or above can be added to your wallet.';
        return false;
    } else {
        amountError.classList.add('hidden');
        return true;
    }
}

async function handleFormSubmit(event) {
    event.preventDefault(); // Prevent form submission to validate first
    
    const amountInput = document.getElementById('amount');
    const amount = parseFloat(amountInput.value);

    // Validate the amount
    if (validateAmount(amount)) {
        // Proceed with the form submission (e.g., API call to add money)
        try {
            const paymentMethod = document.getElementById('payment-method').value;
            
            const response = await axios.post('/addMoney', {
                amount: amount,
                paymentMethod: paymentMethod
            });
            
            // Handle success (redirect to PayPal for approval)
            if (response.data.success) {
                window.location.href = response.data.approvalUrl;  // Redirect to PayPal approval URL
            } else {
                alert('Failed to create PayPal order. Please try again.');
            }
        } catch (error) {
            console.error('Error adding money:', error);
            alert('Failed to add money. Please try again later.');
        }
    }
}

document.getElementById('topUpForm').addEventListener('submit', handleFormSubmit);
