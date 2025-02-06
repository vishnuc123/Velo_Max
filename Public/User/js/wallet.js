let currentPage = 1;
const transactionsPerPage = 5;
let walletHistory = []; // Store transactions globally

async function fetchWalletBalance() {
  try {
    const response = await axios.get('/getWalletDetails');
    console.log(response.data);

    const { balance, walletHistory: history } = response.data.walletDetails;
    
    // Sort transactions in descending order (latest first)
    walletHistory = history.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Update balance UI
    document.querySelector('#wallet-content .text-2xl.font-bold').textContent = `₹${balance.toFixed(2)}`;
    document.getElementById('balanceMessage').classList.toggle('hidden', balance > 0);

    renderTransactions(); // Initial render

  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    alert('Failed to fetch wallet balance. Please try again later.');
  }
}

function renderTransactions() {
  const historyTableBody = document.querySelector('tbody');
  historyTableBody.innerHTML = '';

  // Get transactions for the current page
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const paginatedHistory = walletHistory.slice(startIndex, startIndex + transactionsPerPage);

  paginatedHistory.forEach(transaction => {
    const row = document.createElement('tr');
    row.classList.add('border-b', 'border-gray-200', 'hover:bg-gray-100');

    row.innerHTML = `
      <td class="py-3 px-6">${new Date(transaction.date).toLocaleString()}</td>
      <td class="py-3 px-6">${transaction.description}</td>
      <td class="py-3 px-6 text-right ${transaction.transactionType === 'debit' ? 'text-red-500' : 'text-green-500'}">
        ${transaction.transactionType === 'debit' ? '-' : '+'}₹${Math.abs(transaction.amount).toFixed(2)}
      </td>
    `;

    historyTableBody.appendChild(row);
  });

  updatePaginationControls();
}

function updatePaginationControls() {
  const prevButton = document.getElementById('prevPage');
  const nextButton = document.getElementById('nextPage');

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage * transactionsPerPage >= walletHistory.length;
}

document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTransactions();
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  if (currentPage * transactionsPerPage < walletHistory.length) {
    currentPage++;
    renderTransactions();
  }
});



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
    Swal.fire({
      title: 'Error Checking Wallet Status',
      text: 'May Be internet Connection is slow',
      icon: 'warning',
      background: '#000000',
      color: '#ffffff',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white'
      }
    });
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