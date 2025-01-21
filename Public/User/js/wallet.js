async function fetchWalletBalance() {
  try {
    const response = await axios.get('/getWalletDetails');
    console.log(response.data);

    // Extract the balance and wallet history from the response
    const { balance, walletHistory } = response.data.walletDetails;

    // Update the balance in the UI
    const balanceElement = document.querySelector('#wallet-content .text-2xl.font-bold');
    balanceElement.textContent = `₹${balance.toFixed(2)}`;

    // Show or hide the balance message based on the balance amount
    const balanceMessage = document.getElementById('balanceMessage');
    if (balance <= 0) {
      balanceMessage.classList.remove('hidden');
    } else {
      balanceMessage.classList.add('hidden');
    }

    // Update the transaction history
    const historyTableBody = document.querySelector('tbody');
    historyTableBody.innerHTML = ''; // Clear existing rows

    // Initialize a running balance (assuming it's the final balance and we adjust backwards)
    let runningBalance = balance;

    walletHistory.forEach(transaction => {
      const row = document.createElement('tr');
      row.classList.add('border-b', 'border-gray-200', 'hover:bg-gray-100');

      const dateCell = document.createElement('td');
      dateCell.classList.add('py-3', 'px-6');
      dateCell.textContent = new Date(transaction.date).toLocaleString(); // Format date to a readable string

      const descriptionCell = document.createElement('td');
      descriptionCell.classList.add('py-3', 'px-6');
      descriptionCell.textContent = transaction.description;

      const amountCell = document.createElement('td');
      amountCell.classList.add('py-3', 'px-6', 'text-right');
      
      // Check if the transaction is debit or credit based on transactionType
      if (transaction.transactionType === 'debit' || transaction.amount < 0) {
        amountCell.classList.add('text-red-500');
        amountCell.textContent = `-₹${Math.abs(transaction.amount).toFixed(2)}`; // Show negative sign for debit
      } else {
        amountCell.classList.add('text-green-500');
        amountCell.textContent = `+₹${transaction.amount.toFixed(2)}`; // Show positive amount for credit
      }


      const balanceCell = document.createElement('td');
      balanceCell.classList.add('py-3', 'px-6', 'text-right');
      balanceCell.textContent = `₹${runningBalance.toFixed(2)}`;

      // Adjust the running balance for each transaction
      runningBalance -= transaction.amount;

      row.appendChild(dateCell);
      row.appendChild(descriptionCell);
      row.appendChild(amountCell);
      row.appendChild(balanceCell);

      historyTableBody.appendChild(row);
    });

  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    alert('Failed to fetch wallet balance. Please try again later.');
  }
}

// Call the function to fetch and display the balance and history when the page loads
document.addEventListener('DOMContentLoaded', fetchWalletBalance);




// Wallet unlock functionality
const unlockWalletButton = document.getElementById('unlock-wallet-button');
const unlockWalletContainer = document.getElementById('unlock-wallet-container');
const walletContent = document.getElementById('wallet-content');
const adContainer = document.getElementById('adv-container');

// On page load, check wallet status
window.addEventListener('DOMContentLoaded', () => {
  checkWalletStatus();  // Check the wallet status immediately when the page loads
});

async function checkWalletStatus() {
  try {
    // Send a request to the backend to check or unlock the wallet
    const response = await axios.post('/walletStatus'); // This single endpoint does both

    if (response.status === 200) {
      handleWalletStatus(response.data);
    } else {
      console.error("Unexpected response status:", response.status);
      alert("Unexpected error occurred. Please try again.");
    }
  } catch (error) {
    console.error("Error checking or unlocking wallet:", error);
    alert("Failed to check or unlock wallet. Please check your internet connection and try again.");
  }
}

function handleWalletStatus(data) {
  const { walletStatus, message } = data;

  // Display appropriate messages and actions
  if (walletStatus) {
    if (message === "Wallet is already unlocked") {
      hideAdContainer();  // If the wallet is already unlocked, don't show the ad
      showWalletContent(); // Show the wallet content
      showTransactionReadyMessage();  // Show the "ready to make transactions" message
    } else {
      showWalletContent(); // Show the wallet content if the wallet is unlocked after the action
      hideAdContainer(); // Hide the ad container
      showTransactionReadyMessage();  // Show the "ready to make transactions" message
    }
  } else {
    showUnlockPrompt();
    showAdContainer(); // Show the ad container if the wallet is locked
  }
}

// Function to show "Ready to make transactions" message
function showTransactionReadyMessage() {
  const transactionReadyMessage = document.getElementById('transactionReadyMessage');
  if (transactionReadyMessage) {
    transactionReadyMessage.classList.remove('hidden');
  }
}


function showWalletContent() {
  if (unlockWalletContainer) unlockWalletContainer.classList.add('hidden');
  if (walletContent) walletContent.style.display = 'block';  // Show wallet content
}

function showUnlockPrompt() {
  if (unlockWalletContainer) unlockWalletContainer.classList.remove('hidden');
  if (walletContent) walletContent.style.display = 'none';  // Hide wallet content
}

function hideAdContainer() {
  if (adContainer) adContainer.style.display = 'none';  // Hide ad container
}

function showAdContainer() {
  if (adContainer) adContainer.style.display = 'block';  // Show ad container
}

if (unlockWalletButton) {
  unlockWalletButton.addEventListener('click', checkWalletStatus);
}

// adding money
const addMoneyButton  = document.getElementById('addMoney')
addMoneyButton.addEventListener('click',async (event) =>{
  event.preventDefault()
  window.location.href = "/getAddMoneyPage"
}) 