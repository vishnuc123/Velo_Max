const eventSource = new EventSource('/events');
eventSource.onmessage = function (event) {
  if (event.data === 'reload') {
    console.log('Product has been updated. Reloading...');
    window.location.reload();
  }
};
  
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
      existingAddressesContainer.innerHTML =
        "<p class='text-gray-600'>No existing addresses found.</p>";
    } else {
      addresses.forEach((address, idx) => {
        const addressCard = document.createElement("div");
        addressCard.className =
          "border bg-white rounded-lg p-4 hover:border-black-500 transition-colors duration-200";
        addressCard.id = `addressCard-${idx}`;
  
        // Set red border for the first address initially
        if (idx === 0) {
          addressCard.style.borderColor = "red";
        }
  
        addressCard.innerHTML = `
                  <div class="flex justify-between items-start">
                      <div>
                          <h3 class="font-semibold">${address.label}</h3>
                          <p class="text-gray-600">
                              ${address.address}<br>
                              <p class="text-gray-600">${address.city}</p>
                              <p class="text-gray-600">${address.pincode}<br></p>
                              <p class="text-gray-600">Phone: ${address.phoneNumber}<br></p>
                          </p>
                      </div>
                      <button class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 select-btn" data-id="${idx}">
                          Select
                      </button>
                  </div>
              `;
  
        existingAddressesContainer.appendChild(addressCard);
      });
  
      // Add event listeners to "Select" buttons
      const selectButtons = document.querySelectorAll(".select-btn");
      selectButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const addressId = e.target.dataset.id; // Get the address ID
  
          // Reset all address borders
          document
            .querySelectorAll("#existing-addresses > div")
            .forEach((card) => {
              card.style.borderColor = "transparent";
            });
  
          // Highlight the selected address
          const selectedCard = document.getElementById(`addressCard-${addressId}`);
          selectedCard.style.borderColor = "red";
  
          console.log("Selected address ID:", addressId);
          // Perform further actions (e.g., save the selected address)
        });
      });
    }
  }
  // Toggle visibility of the Add Address form
  addAddressButton.addEventListener("click", () => {
      addAddressForm.classList.toggle("hidden"); // Toggle visibility
  });

  // Handle address form submission
  saveAddressButton.addEventListener("click", (event) => {
  event.preventDefault(); // Prevent form submission

  const label = document.getElementById("label").value.trim();
  const city = document.getElementById("city").value.trim();
  const address = document.getElementById("address").value.trim();
  const pinCode = document.getElementById("pinCode").value.trim();
  const phoneNumber = document.getElementById("phoneNumber").value.trim();

  // Define regex patterns for validation
  const labelRegex = /^[a-zA-Z\s]+$/; // Letters and spaces only
  const cityRegex = /^[a-zA-Z\s]+$/; // Letters and spaces only
  const addressRegex = /^[a-zA-Z0-9\s,.-]+$/; // Letters, numbers, spaces, commas, periods, hyphens
  const pincodeRegex = /^[1-9][0-9]{5}$/; // Indian pincode (6 digits)
  const phoneNumberRegex = /^[6-9][0-9]{9}$/; // Indian mobile number (10 digits)

  // Validate form fields
  if (!label) {
    Swal.fire({
      title: "Error!",
      text: "Label is required!",
      icon: "error",
      background: "#000000",
      color: "#ffffff",
      confirmButtonText: "OK",
      customClass: {
        confirmButton: "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white"
      }
    });
    return;
  }

  if (!labelRegex.test(label)) {
    Swal.fire({
      title: "Error!",
      text: "Invalid label. Please use letters and spaces only.",
      icon: "error",
      background: "#000000",
      color: "#ffffff",
      confirmButtonText: "OK",
      customClass: {
        confirmButton: "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white"
      }
    });
    return;
  }

  if (!address) {
    Swal.fire({
      title: "Error!",
      text: "Address is required!",
      icon: "error",
      background: "#000000",
      color: "#ffffff",
      confirmButtonText: "OK",
      customClass: {
        confirmButton: "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white"
      }
    });
    return;
  }

  if (!addressRegex.test(address)) {
    Swal.fire({
      title: "Error!",
      text: "Invalid address. Please use letters, numbers, spaces, and common punctuation.",
      icon: "error",
      background: "#000000",
      color: "#ffffff",
      confirmButtonText: "OK",
      customClass: {
        confirmButton: "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white"
      }
    });
    return;
  }

  if (!city) {
    Swal.fire({
      title: "Error!",
      text: "City is required!",
      icon: "error",
      background: "#000000",
      color: "#ffffff",
      confirmButtonText: "OK",
      customClass: {
        confirmButton: "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white"
      }
    });
    return;
  }

  if (!cityRegex.test(city)) {
    Swal.fire({
      title: "Error!",
      text: "Invalid city. Please use letters and spaces only.",
      icon: "error",
      background: "#000000",
      color: "#ffffff",
      confirmButtonText: "OK",
      customClass: {
        confirmButton: "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white"
      }
    });
    return;
  }

  if (!pinCode) {
    Swal.fire({
      title: "Error!",
      text: "Pincode is required!",
      icon: "error",
      background: "#000000",
      color: "#ffffff",
      confirmButtonText: "OK",
      customClass: {
        confirmButton: "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white"
      }
    });
    return;
  }

  if (!pincodeRegex.test(pinCode)) {
    Swal.fire({
      title: "Error!",
      text: "Invalid pincode. Please enter a valid 6-digit pincode.",
      icon: "error",
      background: "#000000",
      color: "#ffffff",
      confirmButtonText: "OK",
      customClass: {
        confirmButton: "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white"
      }
    });
    return;
  }

  if (!phoneNumber) {
    Swal.fire({
      title: "Error!",
      text: "Phone number is required!",
      icon: "error",
      background: "#000000",
      color: "#ffffff",
      confirmButtonText: "OK",
      customClass: {
        confirmButton: "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white"
      }
    });
    return;
  }

  if (!phoneNumberRegex.test(phoneNumber)) {
    Swal.fire({
      title: "Error!",
      text: "Invalid phone number. Please enter a valid 10-digit mobile number.",
      icon: "error",
      background: "#000000",
      color: "#ffffff",
      confirmButtonText: "OK",
      customClass: {
        confirmButton: "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white"
      }
    });
    return;
  }

  // Save the new address
  const newAddress = {
    label,
    city,
    address,
    pinCode,
    phoneNumber,
  };

  addresses.push(newAddress); // Add the new address to the array

  // Clear the form inputs
  document.getElementById("label").value = "";
  document.getElementById("address").value = "";
  document.getElementById("city").value = "";
  document.getElementById("pinCode").value = "";
  document.getElementById("phoneNumber").value = "";

  // Hide the Add Address form
  addAddressForm.classList.add("hidden");

 // Show success message
Swal.fire({
  title: "Success!",
  text: "Address added successfully!",
  icon: "success",
  confirmButtonText: "OK",
  background: "#000000",
  color: "#ffffff",
  confirmButtonColor: "#ffffff",
  customClass: {
    title: "text-white",
    content: "text-white",
    confirmButton: "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white"
  }
}).then(() => {
  // Reload the webpage after user clicks "OK"
  window.location.reload();
});

  renderAddresses(); // Re-render the addresses
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
   // Increase quantity
increaseButton.addEventListener('click', () => {
    let currentValue = parseInt(quantityInput.value);
    if (currentValue < 5) { // Ensure it doesn't exceed the max value
        const newQuantity = currentValue + 1;
        quantityInput.value = newQuantity;

        // Update total price
        const shippingPrice = parseFloat(shippingElement.textContent.replace('₹', '')) || 0;
        updateTotal(shippingPrice);
    } else {
        // Show a message when the quantity limit is reached
        Swal.fire({
            title: 'Limit Reached',
            text: 'You have reached the maximum available stock for this item.',
            icon: 'warning',
            background: '#000000',
            color: '#ffffff',
            confirmButtonText: 'OK',
            customClass: {
                confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white'
            }
        });
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

        const selectedAddressCard = document.querySelector('#existing-addresses > div[style*="border-color: red"]');
        if (!selectedAddressCard) {
            alert('Please select an address.');
            return;
        }

        const addressDetails = {
            label: selectedAddressCard.querySelector('h3').textContent.trim(),
            address: selectedAddressCard.querySelector('p.text-gray-600:nth-of-type(1)').textContent.trim(),
            city: selectedAddressCard.querySelector('p.text-gray-600:nth-of-type(2)').textContent.trim(),
            phoneNumber: selectedAddressCard.querySelector('p.text-gray-600:nth-of-type(4)').textContent.replace('Phone: ', '').trim(),
            pinCode: selectedAddressCard.querySelector('p.text-gray-600:nth-of-type(3)').textContent.trim(),
        };

        const paymentMethodElement = document.querySelector('input[name="payment"]:checked');
        if (!paymentMethodElement) {
            alert('Please select a payment method.');
            return;
        }
        const paymentMethod = paymentMethodElement.value;

        if (!selectedShippingOption) {
            alert('Please select a shipping method.');
            return;
        }

        if (quantity <= 0 || isNaN(totalPrice) || totalPrice <= 0) {
            alert('Invalid quantity or total price.');
            return;
        }

        const urlParts = window.location.pathname.split('/');
        const categoryId = urlParts[2];
        const productId = urlParts[3];

        const paymentData = {
            categoryId,
            productId,
            shippingMethod: selectedShippingOption.nextElementSibling.textContent.trim(),
            quantity,
            totalPrice,
            address: addressDetails,
            paymentMethod,
        };

        const payNowButton = document.getElementById('payNowButton');
        payNowButton.disabled = true;
        payNowButton.textContent = 'Processing...';

        if (paymentMethod === 'paypal') {
            // Handle PayPal Payment
            const paypalResponse = await axios.post('/process-paypal-payment', paymentData);
            const { approvalUrl } = paypalResponse.data;

            if (paypalResponse.status === 200 && approvalUrl) {
                // Redirect user to PayPal for authorization
                window.location.href = approvalUrl;
            } else {
                alert('PayPal payment setup failed. Please try again.');
            }
        } else {
            // Handle other payment methods
            const response = await axios.post('/process-payment', paymentData)

            if (response.status === 200) {
                const orderDetails = response.data.order;
            
                // SweetAlert with custom styles
                Swal.fire({
                    icon: 'success',
                    title: 'Order Placed Successfully!',
                    text: 'Do you want to proceed to the order success page?',
                    showCancelButton: true,
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No',
                    background: '#000000', // Black background
                    color: '#ffffff', // White text color
                    backdrop: `
                      rgba(0,0,0,0.8)
                      url("/images/nyan-cat.gif")
                      left top
                      no-repeat
                    `, // Custom backdrop with a GIF image
                    showClass: {
                        popup: `
                          animate__animated
                          animate__fadeInDown
                          animate__faster
                        `
                    },
                    hideClass: {
                        popup: `
                          animate__animated
                          animate__fadeOutUp
                          animate__faster
                        `
                    },
                    customClass: {
                        title: 'text-white',
                        content: 'text-gray-300',
                        confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white',
                        cancelButton: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-600'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        // If user confirms, proceed to the order success page
                        window.location.href = `/orderSuccess/${orderDetails._id}`;
                    } else {
                        // Optionally, you can handle the 'No' response here
                        console.log("Payment confirmed, but user chose not to proceed.");
                    }
                });
            
            } else {
                // In case payment fails, show the SweetAlert with error styling
                Swal.fire({
                    icon: 'error',
                    title: 'Payment Failed',
                    text: 'Please try again.',
                    timer: 3000,
                    showConfirmButton: false,
                    background: '#000000',
                    color: '#ffffff',
                    backdrop: `
                      rgba(0,0,0,0.8)
                      url("/images/nyan-cat.gif")
                      left top
                      no-repeat
                    `, // Custom backdrop with a GIF image
                    showClass: {
                        popup: `
                          animate__animated
                          animate__flipInX
                          animate__faster
                        `
                    },
                    hideClass: {
                        popup: `
                          animate__animated
                          animate__flipOutX
                          animate__faster
                        `
                    },
                    customClass: {
                        title: 'text-white',
                        content: 'text-gray-300',
                        confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white'
                    }
                });
            }
            
        }
    } catch (error) {
        console.error('Error processing payment:', error);
      if (error.response && error.response.data && error.response.data.details) {
          alert('Payment error: ' + error.response.data.details);
      } else {
          alert('An error occurred while processing payment. Please try again later.');
      }
    } finally {
        const payNowButton = document.getElementById('payNowButton');
        payNowButton.disabled = false;
        payNowButton.textContent = 'Pay Now';
    }
});

