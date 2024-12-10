
  
  // Initialize an empty array to hold addresses
  let addresses = [];

  // Select elements
  const addAddressButton = document.getElementById("add-address-btn");
  const addAddressForm = document.getElementById("add-address-form");
  const saveAddressButton = document.getElementById("save-address-btn");
  const existingAddressesContainer = document.getElementById("existing-addresses");

  // Function to render the existing addresses
  function renderAddresses() {
      existingAddressesContainer.innerHTML = ""; // Clear current addresses
      if (addresses.length === 0) {
          existingAddressesContainer.innerHTML = "<p class='text-gray-600'>No existing addresses found.</p>";
      } else {
          addresses.forEach((address, idx) => {
              const addressDiv = document.createElement("div");
              addressDiv.classList.add("p-4", "border", "border-gray-300", "rounded", "space-y-2");
              addressDiv.innerHTML = `
                  <h3 class="font-medium">Address ${idx + 1}</h3>
                  <p><strong>Name:</strong> ${address.label}</p>
                  <p><strong>city:</strong> ${address.city || "Not provided"}</p>
                  <p><strong>Address:</strong> ${address.address}</p>
                  <p><strong>Postal Code:</strong> ${address.pincode}</p>
                  <p><strong>phoneNumber:</strong> ${address.phoneNumber}</p>
              `;
              existingAddressesContainer.appendChild(addressDiv);
          });
      }
  }

  // Toggle visibility of the Add Address form
  addAddressButton.addEventListener("click", () => {
      addAddressForm.classList.toggle("hidden"); // Toggle visibility
  });

  // Handle address form submission
  saveAddressButton.addEventListener("click", () => {
      const label = document.getElementById("label").value;
      const city = document.getElementById("city").value;
      const address = document.getElementById("address").value;
      const pincode = document.getElementById("pincode").value;
      const phoneNumber = document.getElementById("phoneNumber").value;

      // Validate form fields (you can add more validation)
      if (!label || !city || !address || !pincode || !phoneNumber) {
          alert("Please fill in all required fields!");
          return;
      }

      // Save the new address
      const newAddress = {
          label,
          city,
          address,
          pincode,
          phoneNumber,
      };

      addresses.push(newAddress); // Add the new address to the array

      // Clear the form inputs
      document.getElementById("label").value = "";
      document.getElementById("address").value = "";
      document.getElementById("city").value = "";
      document.getElementById("pincode").value = "";
      document.getElementById("phoneNumber").value = "";

      // Hide the Add Address form
      addAddressForm.classList.add("hidden");

      // Re-render the addresses
      renderAddresses();
  });

  // Initial render when the page loads
  renderAddresses();

  async function getAddress() {
    try {
        const response = await axios.get('/get-address'); // Fetch addresses from backend
        const addresses = response.data.addresses; // Extract addresses from the response
        const addressContainer = document.getElementById('existing-addresses'); // Get the container for addresses


        addresses.forEach((address, index) => {
            // Create a card for each address
            const addressCard = document.createElement('div');
            addressCard.className = 'border bg-white rounded-lg p-4 hover:border-black-500 transition-colors duration-200';
            addressCard.id = `addressCard-${address._id}`;
            
            // Set red border for the first address initially
            if (index === 0) {
                addressCard.style.borderColor = 'red';
            }

            addressCard.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold">${address.label}</h3>
                        <p class="text-gray-600">
                            ${address.address}<br>
                            <p class="text-gray-600">${address.city}</p>
                            <p class="text-gray-600">${address.pinCode}<br></p>
                            <p class="text-gray-600">Phone: ${address.phoneNumber}<br></p>
                            

                           
                        </p>
                    </div>
                    <button class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 select-btn" data-id="${address._id}">
                        Select
                    </button>
                </div>
            `;

            addressContainer.appendChild(addressCard);
        });

        // Add event listeners to "Select" buttons
        const selectButtons = document.querySelectorAll('.select-btn');
        selectButtons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const addressId = e.target.dataset.id; // Get the address ID

                // Reset all address borders
                document.querySelectorAll('#existing-addresses > div').forEach((card) => {
                    card.style.borderColor = 'transparent';
                });

                // Highlight the selected address
                const selectedCard = document.getElementById(`addressCard-${addressId}`);
                selectedCard.style.borderColor = 'red';

                console.log('Selected address ID:', addressId);
                // Perform further actions (e.g., save the selected address)
            });
        });
    } catch (error) {
        console.error('Error fetching addresses:', error);
    }
}

// Load existing addresses on page load
getAddress();



document.addEventListener('DOMContentLoaded', () => {
    // Get relevant elements
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    const quantityInput = document.getElementById('quantityInput');

    // Parse the initial unit price from the DOM
    const unitPrice = parseFloat(subtotalElement.textContent.replace('₹', ''));

    // Function to calculate total price dynamically and send data to backend
    const updateTotal = (shippingPrice) => {
        const currentQuantity = parseInt(quantityInput.value);
        const updatedSubtotal = unitPrice * currentQuantity; // Calculate new subtotal based on quantity
        subtotalElement.textContent = `₹${updatedSubtotal.toFixed(2)}`; // Update subtotal in DOM
        totalElement.textContent = `₹${(updatedSubtotal + shippingPrice).toFixed(2)}`; // Update total in DOM

        // Prepare the data to send to the backend
        const orderDetails = {
            quantity: currentQuantity,
            shippingPrice: shippingPrice,
            subtotal: updatedSubtotal.toFixed(2),
            total: (updatedSubtotal + shippingPrice).toFixed(2)
        };

        // Send data to backend for database update
        updateBackendWithOrderDetails(orderDetails);
    };

    // Restore saved values from localStorage (if needed)
    const savedQuantity = parseInt(quantityInput.value) || 1;
    const savedShippingPrice = parseFloat(shippingElement.textContent.replace('₹', '')) || 0;
    const savedSubtotal = parseFloat(subtotalElement.textContent.replace('₹', '')) || unitPrice;
    const savedTotal = parseFloat(totalElement.textContent.replace('₹', '')) || (unitPrice + savedShippingPrice);

    // Update DOM with saved values
    quantityInput.value = savedQuantity;
    shippingElement.textContent = `₹${savedShippingPrice.toFixed(2)}`;
    subtotalElement.textContent = `₹${savedSubtotal.toFixed(2)}`;
    totalElement.textContent = `₹${savedTotal.toFixed(2)}`;

    // Add event listener to shipping options
    shippingOptions.forEach(option => {
        option.addEventListener('change', () => {
            let shippingPrice = 0; // Default for free shipping

            // Check which option is selected
            if (option.nextElementSibling.textContent.trim() === 'Express Shipping') {
                shippingPrice = 80; // Express shipping price
            }

            // Update the DOM with the new values
            shippingElement.textContent = `₹${shippingPrice.toFixed(2)}`;
            updateTotal(shippingPrice); // Recalculate total price
        });
    });

    // Add quantity change listeners
    const increaseButton = document.getElementById('increaseQuantity');
    const decreaseButton = document.getElementById('decreaseQuantity');

    // Increase quantity
    increaseButton.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue <= 5) { // Ensure it doesn't exceed the max value
            const newQuantity = currentValue + 1;
            quantityInput.value = newQuantity;

            // Update total price
            const shippingPrice = parseFloat(shippingElement.textContent.replace('₹', '')) || 0;
            updateTotal(shippingPrice);
        }
    });

    // Decrease quantity
    decreaseButton.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) { // Ensure it doesn't go below the min value
            const newQuantity = currentValue - 1;
            quantityInput.value = newQuantity;

            // Update total price
            const shippingPrice = parseFloat(shippingElement.textContent.replace('₹', '')) || 0;
            updateTotal(shippingPrice);
        }
    });
});


    document.getElementById('payNowButton').addEventListener('click', async () => {
    try {
        const totalElement = document.getElementById('total');
        const selectedShippingOption = document.querySelector('input[name="shipping"]:checked');
        const quantity = parseInt(quantityInput.value);
        const totalPrice = parseFloat(totalElement.textContent.replace('₹', ''));

        // Get the selected address card
        const selectedAddressCard = document.querySelector('#existing-addresses > div[style*="border-color: red"]');
        if (!selectedAddressCard) {
            alert('Please select an address.');
            return;
        }

        // Extract the address details from the selected card
        const addressDetails = {
            label: selectedAddressCard.querySelector('h3').textContent.trim(),
            address: selectedAddressCard.querySelector('p.text-gray-600:nth-of-type(1)').textContent.trim(),
             city: selectedAddressCard.querySelector('p.text-gray-600:nth-of-type(2)').textContent.trim(), // Extract the city
            phoneNumber: selectedAddressCard.querySelector('p.text-gray-600:nth-of-type(2)').textContent.trim(),
            pinCode: selectedAddressCard.querySelector('p.text-gray-600:nth-of-type(3)').textContent.trim(),
            phoneNumber: selectedAddressCard.querySelector('p.text-gray-600:nth-of-type(4)').textContent.replace('Phone: ', '').trim(),
        };

        // Get the payment method
        const paymentMethodElement = document.querySelector('input[name="payment"]:checked');
        if (!paymentMethodElement) {
            alert('Please select a payment method.');
            return;
        }
        const paymentMethod = paymentMethodElement.value;

        // Validate required fields
        if (!selectedShippingOption) {
            alert('Please select a shipping method.');
            return;
        }

        if (quantity <= 0) {
            alert('Invalid quantity selected.');
            return;
        }

        if (isNaN(totalPrice) || totalPrice <= 0) {
            alert('Invalid total price.');
            return;
        }

        // Extract category and product IDs from the URL
        const urlParts = window.location.pathname.split('/');
        const categoryId = urlParts[2]; // This is the category ID (e.g., 'ebikes')
        const productId = urlParts[3]; // This is the product ID (e.g., '673af0cb7a88ac4b90d016f9first')

        console.log('Category ID:', categoryId); // Verify the extracted category ID
        console.log('Product ID:', productId); // Verify the extracted product ID

        // Prepare data to send to backend
        const paymentData = {
            categoryId, // Include the category ID here
            productId, // Include the product ID here
            shippingMethod: selectedShippingOption.nextElementSibling.textContent.trim(),
            quantity,
            totalPrice,
            address: addressDetails, // Send the actual address details
            paymentMethod, // Include the selected payment method
        };

        // Optional: Show a loader or disable button while processing
        const payNowButton = document.getElementById('payNowButton');
        payNowButton.disabled = true;
        payNowButton.textContent = 'Processing...';

        // Send payment data to backend
        const response = await axios.post('/process-payment', paymentData);
        console.log(response.data);
        

        if (response.status === 200) {
            alert('Payment successful!');
            // Redirect or update UI
            window.location.href = '/orderSuccess'; // Example redirection to a confirmation page
        } else {
            alert('Payment failed. Please try again.');
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        alert('An error occurred while processing payment. Please try again later.');
    } finally {
        // Re-enable button regardless of success or failure
        const payNowButton = document.getElementById('payNowButton');
        payNowButton.disabled = false;
        payNowButton.textContent = 'Pay Now';
    }
    });

