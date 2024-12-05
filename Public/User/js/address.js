const openModal = document.getElementById('openModal');
const closeModal = document.getElementById('closeModal');
const closeModal2 = document.getElementById('closeModal2');
const modal = document.getElementById('modal');

// Open modal on button click
if (openModal) {
  openModal.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });
}

// Close modal when clicking on close button or cancel button
if (closeModal) {
  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}

if (closeModal2) {
  closeModal2.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}

// Update the address list
async function updateAddressList() {
  try {
    const response = await axios.get('/get-address'); // Backend route to fetch addresses
    console.log(response.data);

    const addresses = response.data.addresses; // Extract addresses from the response
    const addressList = document.getElementById('addressList');
    addressList.innerHTML = ''; // Clear existing addresses

    // Loop through each address and dynamically create a card for each one
    addresses.forEach((address) => {
      const addressCard = document.createElement('div');
      addressCard.className = 'border bg-white rounded-lg p-4 hover:border-purple-500 transition-colors duration-200';

    
addressCard.innerHTML = `
<div class="grid grid-cols-1 gap-4">
  <div class="flex justify-between items-start mb-2">
    <h3 class="font-semibold">${address.label}</h3>
    <button class="text-gray-500 hover:text-gray-700">Edit</button>
  </div>
  <p class="text-gray-600">
    ${address.address}<br>
    ${address.city}, ${address.pinCode}<br>

    phone Number:${address.phoneNumber}
  </p>
</div>
`;

      // Append the created card to the address list container
      addressList.appendChild(addressCard);
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
  }
}

// Load the address list initially
updateAddressList();