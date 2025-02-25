const eventOrigin = new EventSource('/events');

eventOrigin.onmessage = function (event) {
  if (event.data === 'productStatusBlocked') {
    document.getElementById('payNowButton').addEventListener('click', function() {
      Swal.fire({
        title: "product is not available at this moment",
        text: "product is now blocked or out of stock or not available pleaase contact support for more information",
        icon: "error",
        confirmButtonText: "OK",
        background: "#000000",
        color: "#ffffff",
        confirmButtonColor: "#ffffff",
        customClass: {
          title: "text-white",
          content: "text-white",
          confirmButton:
            "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white",
        },
      })
    });
  }else if (event.data === 'productStatusUnblocked'){
    
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
  
        });
      });
    }
  }
  // Toggle visibility of the Add Address form
  addAddressButton.addEventListener("click", () => {
      addAddressForm.classList.toggle("hidden"); // Toggle visibility
  });

  // Handle address form submission
  saveAddressButton.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent default form submission if inside a form
  
    const label = document.getElementById("label").value;
    const city = document.getElementById("city").value;
    const address = document.getElementById("address").value;
    const pinCode = document.getElementById("pinCode").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
  
    // Regex for validation
    const labelRegex = /^[a-zA-Z0-9\s]{3,100}$/;
    const cityRegex = /^[a-zA-Z\s]{3,50}$/;
    const addressRegex = /^[a-zA-Z0-9\s,.-]{5,200}$/;
    const pincodeRegex = /^[0-9]{6}$/;
    const phoneNumberRegex = /^[0-9]{10}$/;
  
    // Validate form fields using regex
    if (!label || !labelRegex.test(label)) {
      showAlert("Error!", "Please enter a valid label (3 to 100 characters, letters, and numbers only).");
      return;
    }
  
    if (!city || !cityRegex.test(city)) {
      showAlert("Error!", "Please enter a valid city (3 to 50 characters, letters and spaces only).");
      return;
    }
  
    if (!address || !addressRegex.test(address)) {
      showAlert("Error!", "Please enter a valid address (5 to 200 characters, letters, numbers, spaces, commas, periods, and dashes).");
      return;
    }
  
    if (!pinCode || !pincodeRegex.test(pinCode)) {
      showAlert("Error!", "Please enter a valid pincode (6 digits only).");
      return;
    }
  
    if (!phoneNumber || !phoneNumberRegex.test(phoneNumber)) {
      showAlert("Error!", "Please enter a valid phone number (10 digits only).");
      return;
    }
  
    // Show confirmation alert before proceeding
    const result = await Swal.fire({
      title: "Confirm",
      text: "Do you want to save this address?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, save it!",
      cancelButtonText: "Cancel",
      background: "#000000",
      color: "#ffffff",
      confirmButtonColor: "#ffffff",
      cancelButtonColor: "#ff0000",
      customClass: {
        title: "text-white",
        content: "text-white",
        confirmButton:
          "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white",
        cancelButton:
          "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-white",
      },
    });
  
    if (result.isConfirmed) {
      try {
        // Prepare the form data
        const formData = {
          label,
          city,
          address,
          pinCode,
          phoneNumber,
        };
  
        // Submit the form data using Axios
        const response = await axios.post('/submit-address', formData);
  
        // Check if the response is successful
        if (response.status === 200 && response.data.message === 'Address added successfully.') {
          // Clear the form inputs
          document.getElementById("label").value = "";
          document.getElementById("address").value = "";
          document.getElementById("city").value = "";
          document.getElementById("pinCode").value = "";
          document.getElementById("phoneNumber").value = "";
  
          // Hide the Add Address form
          addAddressForm.classList.add("hidden");
  
          // Display success message with SweetAlert
          await Swal.fire({
            title: "Success!",
            text: response.data.message,
            icon: "success",
            confirmButtonText: "OK",
            background: "#000000",
            color: "#ffffff",
            confirmButtonColor: "#ffffff",
            customClass: {
              title: "text-white",
              content: "text-white",
              confirmButton:
                "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white",
            },
          }).then(() => {
            window.location.reload();
          });
        } else {
          throw new Error("Unexpected response status or message.");
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "An error occurred while saving the address. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
          background: "#000000",
          color: "#ffffff",
          confirmButtonColor: "#ffffff",
          customClass: {
            title: "text-white",
            content: "text-white",
            confirmButton:
              "bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white",
          },
        });
      }
    }
  });


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

               
            });
        });
    } catch (error) {
        console.error('Error fetching addresses:', error);
    }
}

// Load existing addresses on page load
getAddress();



document.addEventListener('DOMContentLoaded', () => {
  const walletButton = document.getElementById('wallet');
  const currentBalance = document.getElementById('currentBalance');

  walletButton.addEventListener('click', async () => {
    const response = await axios.get('/getWalletDetails');
    const walletDetails = response.data;

    // Update the current balance with the text and value
    currentBalance.innerHTML = `Current Balance: ₹${walletDetails.walletDetails.balance.toFixed(2)}`;
  });

  const shippingOptions = document.querySelectorAll('input[name="shipping"]');
  const subtotalElement = document.getElementById('subtotal');
  const shippingElement = document.getElementById('shipping');
  const totalElement = document.getElementById('total');
  const quantityInput = document.getElementById('quantityInput');
  const discountElement = document.getElementById('discount');

  // Parse the initial unit price from the DOM
  const unitPrice = parseFloat(subtotalElement.textContent.replace('₹', ''));

  // Get the constant discount value from the DOM
  const discountValue = parseFloat(discountElement.getAttribute('data-discount-value')) || 0;
  const discountType = discountElement.getAttribute('data-discount-type');

  // Function to calculate total price dynamically
  const updateTotal = (shippingPrice = 0) => {
    const couponDiscountElement = document.getElementById('couponDiscount');
    const currentQuantity = 1; // Default to 1 if NaN
    const updatedSubtotal = unitPrice * currentQuantity;
    const discountOfferElement = document.getElementById('discount');
    
  
  
    
    subtotalElement.textContent = `₹${updatedSubtotal.toFixed(2)}`;
  
    let finalDiscount = discountValue > 0 ? discountValue : 0;
    
    if (currentQuantity > 1) {
      finalDiscount *= currentQuantity; 
    }
  
    finalDiscount = Math.min(finalDiscount, updatedSubtotal);
    discountOfferElement.textContent = `₹${finalDiscount.toFixed(2)}`;
    
    const couponDiscount = parseFloat(couponDiscountElement.textContent.replace('₹', '')) || 0;
    
    const offerPrice = updatedSubtotal - finalDiscount;
    
    const finalOfferPrice = Math.max(offerPrice, 0);
    
    const totalPriceBeforeCoupon = finalOfferPrice + shippingPrice;
  
    const totalPrice = totalPriceBeforeCoupon - couponDiscount;
  
    const finalTotalPrice = Math.max(totalPrice, 0);
    
    totalElement.textContent = `₹${finalTotalPrice.toFixed(2)}`;
    
    const orderDetails = {
      quantity: currentQuantity,
      shippingPrice,
      subtotal: updatedSubtotal.toFixed(2),
      discount: (finalDiscount + couponDiscount).toFixed(2),
      total: finalTotalPrice.toFixed(2),
    };
    return orderDetails
    
   
  };
  
  

  shippingOptions.forEach(option => {
    option.addEventListener('change', () => {
      let shippingPrice = 0; 

      if (option.nextElementSibling.textContent.trim() === 'Express Shipping') {
        shippingPrice = 80; 
      }

      shippingElement.textContent = `₹${shippingPrice.toFixed(2)}`;
      updateTotal(shippingPrice); 
    });
  });



  

  


  // Pay Now Button logic
  document.getElementById('payNowButton').addEventListener('click', async () => {
      try {
          const totalElement = document.getElementById('total');
          const selectedShippingOption = document.querySelector('input[name="shipping"]:checked');
          const quantity = 1
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
          const orderDetails = updateTotal()
          const couponCode = document.getElementById('coupon').value.trim()
          const couponDiscount = document.getElementById('couponDiscount').textContent.match(/\(₹([\d.,]+)\)/)?.[1]?.trim();
          


          
          const paymentData = {
            categoryId,
            productId,
            shippingMethod: selectedShippingOption.nextElementSibling.textContent.trim(),
            quantity,
            totalPrice,
            address: addressDetails,
            paymentMethod,
            discount: orderDetails.discount, 
            offerPrice: orderDetails.offerPrice,
            couponDiscount:couponDiscount,
            totalPriceBeforeCoupon: orderDetails.totalPriceBeforeCoupon,
            discountType: discountType, 
            couponCode,
          };
          

          const payNowButton = document.getElementById('payNowButton');
          payNowButton.disabled = true;
          payNowButton.textContent = 'Processing...';

          if (paymentMethod === 'paypal') {
              const paypalResponse = await axios.post('/process-paypal-payment', paymentData);
              const { approvalUrl } = paypalResponse.data;

              if (paypalResponse.status === 200 && approvalUrl) {
                  window.location.href = approvalUrl;
              } else {
                  alert('PayPal payment setup failed. Please try again.');
              }
          } else if (paymentMethod === 'wallet') {
              // Handle Wallet Payment
              const walletResponse = await axios.get('/getWalletDetails');
              const { balance } = walletResponse.data.walletDetails;

              if (balance < totalPrice) {
                  Swal.fire({
                      title: 'Insufficient Balance',
                      text: 'Your Wallet Has Not Enough Balance To Buy This Product. Please Add Money To Continue Payment.',
                      icon: 'warning',
                      background: '#000000',
                      color: '#ffffff',
                      showCancelButton: true,
                      confirmButtonText: 'Go to Wallet',
                      cancelButtonText: 'Cancel',
                      customClass: {
                          confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white',
                          cancelButton: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-600'
                      },
                      preConfirm: () => {
                          window.location.href = '/wallet';
                      }
                  });
              } else {
                Swal.fire({
                  title: 'Confirm Payment',
                  text: 'Are you sure you want to proceed with the payment?',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Yes, Pay Now',
                  cancelButtonText: 'Cancel'
              }).then(async (result) => {
                  if (result.isConfirmed) {
                      try {
                          const response = await axios.post('/process-wallet-payment', paymentData); // Replace with actual API call
                          
                          if (response.status === 200) {
                              Swal.fire({
                                  icon: 'success',
                                  title: 'Payment Successful',
                                  text: 'Your payment with the wallet has been processed.',
                                  confirmButtonText: 'OK'
                              }).then(() => {
                                  window.location.href = `/orderSuccess/${response.data.order._id}`;
                              });
                          } else {
                              Swal.fire({
                                  icon: 'error',
                                  title: 'Payment Failed',
                                  text: 'Please try again.',
                                  timer: 3000,
                                  showConfirmButton: false
                              });
                          }
                      } catch (error) {
                          Swal.fire({
                              icon: 'error',
                              title: 'Payment Error',
                              text: error.response?.data?.message || 'Something went wrong. Please try again later.',
                              timer: 3000,
                              showConfirmButton: false
                          });
                      }
                  } else {
                      Swal.fire({
                          icon: 'info',
                          title: 'Payment Cancelled',
                          text: 'You have canceled the payment.',
                          timer: 2000,
                          showConfirmButton: false
                      });
                  }
              });
            }
              
          } else {
              const response = await axios.post('/process-payment', paymentData);
              if (response.status === 200) {
                  const orderDetails = response.data.order;
                  Swal.fire({
                      icon: 'success',
                      title: 'Order Placed Successfully!',
                      text: 'Do you want to proceed to the order success page?',
                      showCancelButton: true,
                      confirmButtonText: 'Yes',
                      cancelButtonText: 'No',
                      background: '#000000',
                      color: '#ffffff',
                      backdrop: `
                        rgba(0,0,0,0.8)
                        url("/images/nyan-cat.gif")
                        left top
                        no-repeat
                      `,
                      showClass: {
                          popup: `animate__animated animate__fadeInDown animate__faster`
                      },
                      hideClass: {
                          popup: `animate__animated animate__fadeOutUp animate__faster`
                      },
                      customClass: {
                          title: 'text-white',
                          content: 'text-gray-300',
                          confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white',
                          cancelButton: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-600'
                      }
                  }).then((result) => {
                      if (result.isConfirmed) {
                          window.location.href = `/orderSuccess/${orderDetails._id}`;
                      }
                  });
              } else {
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
                      `
                  });
              }
          }
        } catch (error) {
          console.error('Error processing payment:', error);
    
          // Extract error details from the server response, if available
          let errorMessage = 'An error occurred while processing payment. Please try again later.';
          if (error.response && error.response.data && error.response.data.message) {
              errorMessage = error.response.data.message; // Server error message
          }
    
          // Display the error using SweetAlert
          Swal.fire({
              icon: 'error',
              title: 'Payment Failed',
              text: errorMessage,
              footer: '<a href="/support">Need help? Contact Support</a>' // Optional support link
          });
      } finally {
          const payNowButton = document.getElementById('payNowButton');
          payNowButton.disabled = false;
          payNowButton.textContent = 'Pay Now';
      }
    
  });
});
