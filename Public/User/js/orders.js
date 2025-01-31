let allOrders = []; // Store all orders
let currentPage = 1;
const ordersPerPage = 10;

async function getOrders() {
  try {
    const response = await axios.get("/getOrderProductDetail");
    console.log((response.data));
    
    allOrders = response.data; // Store all orders

    updateOrderCounts(); // Update counts
    displayOrders(allOrders); // Display all orders initially
    updateFilterButtonStyles("all"); // Set initial button style
  } catch (error) {
    console.error("Error fetching orders:", error);
    const ordersContainer = document.querySelector(".space-y-6");
    ordersContainer.innerHTML = `<p class="text-red-600">Failed to load orders. Please try again later.</p>`;
  }
}

function updateOrderCounts() {
  const allCount = allOrders.length;
  const shippingCount = allOrders.filter(
    (order) => order.orderStatus.toLowerCase() === "shipped"
  ).length;
  const arrivedCount = allOrders.filter(
    (order) => order.orderStatus.toLowerCase() === "delivered"
  ).length;
  const canceledCount = allOrders.filter(
    (order) => order.orderStatus.toLowerCase() === "cancelled"
  ).length;

  document.getElementById("all-count").textContent = allCount;
  document.getElementById("shipping-count").textContent = shippingCount;
  document.getElementById("arrived-count").textContent = arrivedCount;
  document.getElementById("canceled-count").textContent = canceledCount;
}

function filterOrders(status) {
  let filteredOrders;
  switch (status) {
    case "shipping":
      filteredOrders = allOrders.filter(
        (order) => order.orderStatus.toLowerCase() === "shipped"
      );
      break;
    case "arrived":
      filteredOrders = allOrders.filter(
        (order) => order.orderStatus.toLowerCase() === "delivered"
      );
      break;
    case "canceled":
      filteredOrders = allOrders.filter(
        (order) => order.orderStatus.toLowerCase() === "cancelled"
      );
      break;
    default:
      filteredOrders = allOrders;
      status = "all";
  }
  currentPage = 1; // Reset to the first page when filtering
  displayOrders(filteredOrders);
  updateFilterButtonStyles(status);
}

function updateFilterButtonStyles(selectedStatus) {
  const buttons = document.querySelectorAll(".filter-button");
  buttons.forEach((button) => {
    if (button.dataset.status === selectedStatus) {
      button.classList.add("bg-gray-900", "text-white");
      button.classList.remove("text-gray-600", "hover:text-gray-900");
    } else {
      button.classList.remove("bg-gray-900", "text-white");
      button.classList.add("text-gray-600", "hover:text-gray-900");
    }
  });
}

function displayOrders(orders) {
  const ordersContainer = document.querySelector(".space-y-6");
  ordersContainer.innerHTML = ""; // Clear existing orders

  if (orders.length === 0) {
    ordersContainer.innerHTML = `
      <div class="text-center py-8 animate-fade-up">
        <h3 class="text-lg font-medium mb-2">No orders found</h3>
        <p class="text-gray-600 mb-6">Try a different filter or go to store to place an order.</p>
        <a href="/store" class="inline-flex items-center text-red-600 hover:text-red-700 transition-colors duration-200">
          <span>Browse products</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    `;
    return;
  }

  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = Math.min(startIndex + ordersPerPage, orders.length);
  const currentOrders = orders.slice(startIndex, endIndex);

  let ordersHtml = ""; // Store all order HTML

  currentOrders.forEach((order, index) => {
    const isCancelled = order.orderStatus.toLowerCase() === "cancelled";
    const isDelivered = order.orderStatus.toLowerCase() === "delivered";
    const isShipped = order.orderStatus.toLowerCase() === "shipped";
    const isReturned = order.orderStatus.toLowerCase() === "returned";
  
    let itemsHtml = "";
  
    order.orderedItem.forEach((item) => {
      const productData = item.productData || {};
      const itemIsCancelled = item._doc.status === "Cancelled";
      const itemISReturnedPending = item._doc.status === "Return-pending"
      const itemIsReturned = item._doc.returnRequest.status === "Accepted";
      const itemIsAccepted = item._doc.status === "Return-accepted";
      const itemIsRejected = item._doc.status === "Return-Rejected";

      itemsHtml += `
        <div class="flex space-x-4 mb-4 border-b pb-4">
          <img src="${productData.coverImage || "/placeholder.png"}" alt="${productData.productName || "Product"}" class="w-20 h-20 object-cover rounded-lg"/>
          <div class="flex-grow">
            <h3 class="font-medium">${productData.productName || "Unknown Product"} (ID: ${productData._id || "N/A"})</h3>
            <p class="text-gray-600">Rs. ₹${(item._doc.actualPrice || 0).toLocaleString()}</p>
            <p class="text-green-600">You Saved Rs. ₹${(item._doc.DiscountAmount || 0).toLocaleString()} On this Product</p>
            <p class="text-sm text-gray-500">Quantity: ${item._doc.quantity || "N/A"}</p>
            <p class="text-sm text-gray-500">Category: ${item._doc.categoryId || "N/A"}</p>
            <p class="text-sm text-gray-500">Total Price For this Item(includes Discount): ${item._doc.totalPrice || "N/A"}</p>
            <p class="text-sm text-gray-500">Status: ${item._doc.status||'N/A'}</p>
            ${item._doc.status === 'Return-accepted' ? '<p class="text-sm text-green-500">Your return request has been accepted.Please Check Your Wallet For The Refund</p>' : ''}
         
            ${item._doc.status === 'Return-Rejected' ? '<p class="text-sm text-red-500">Your return request has been REjected.Please Contact Customer Support for Further Assistance</p>' : ''}
          </div>
          <div class="flex flex-col justify-center space-y-2">
            ${(!isCancelled && !isDelivered && !isShipped && !itemIsCancelled && !itemIsReturned && itemIsRejected) ? `
              <button 
                class="px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200 transition-colors cancel-item-button" 
                onclick="cancelItem('${order._id}', '${item._doc.productId}','${item._doc.categoryId}', '${item._doc.quantity}','${item._doc.DiscountAmount}','${item._doc.totalPrice}','${order.couponDiscount}','${order.paymentMethod}')">
                Cancel Item
              </button>
            ` : ""}
            ${(itemIsRejected) ? `
              <button 
                class="px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200 transition-colors cancel-item-button" 
                onclick="Contact Us('${order._id}', '${item._doc.productId}','${item._doc.categoryId}', '${item._doc.quantity}','${item._doc.DiscountAmount}','${item._doc.totalPrice}','${order.couponDiscount}','${order.paymentMethod}')">
                Contact Us
              </button>
            ` : ""}
            ${(isDelivered && !itemIsReturned && !itemISReturnedPending) ? `
              <button 
                class="px-3 py-1 bg-orange-100 text-orange-600 text-sm rounded hover:bg-orange-200 transition-colors return-item-button"
                onclick="returnOrder('${order._id}', '${item._doc.productId}')">
                Return Item
              </button>
            ` : ""}
          </div>
        </div>
      `;
    });
  
    const couponHtml = order.couponCode ? `
      <div class="mt-4">
        <p class="text-sm text-gray-500">Coupon Applied: <span class="font-medium">${order.couponCode}</span></p>
        <p class="text-sm text-gray-500">Original Price: <span class="line-through">Rs. ₹${order.actualPrice.toLocaleString()}</span></p>
        <p class="text-sm text-gray-500">Coupon Discount: <span class="text-green-500">-Rs. ₹${order.couponDiscount.toLocaleString()}</span></p>
      </div>
    ` : '';
  
    const addressHtml = order.deliveryAddress ? `
      <div class="mt-4">
        <p class="text-sm text-gray-500">Address: <span class="font-medium">${order.deliveryAddress.address}</span></p>
        <p class="text-sm text-gray-500">City: <span class="font-medium">${order.deliveryAddress.city}</span></p>
        <p class="text-sm text-gray-500">Pin Code: <span class="font-medium">${order.deliveryAddress.pinCode}</span></p>
        <p class="text-sm text-gray-500">Phone: <span class="font-medium">${order.deliveryAddress.phoneNumber}</span></p>
      </div>
    ` : '';
  
    const orderDate = new Date(order.orderDate);
    let estimatedDate;
    let shippingInfoHtml = "";
  
    if (order.shippingMethod.toLowerCase() === "express") {
      const minDays = 3;
      const maxDays = 5;
      const expressDate = new Date(orderDate);
      expressDate.setDate(orderDate.getDate() + minDays);
      const expressMaxDate = new Date(orderDate);
      expressMaxDate.setDate(orderDate.getDate() + maxDays);
      estimatedDate = `${expressDate.toLocaleDateString()} - ${expressMaxDate.toLocaleDateString()}`;
  
      shippingInfoHtml = `
        <div class="text-sm text-red-600 font-medium">Express Shipping</div>
        <div class="text-sm text-gray-500">Estimated Arrival: ${estimatedDate}</div>
      `;
    } else {
      const minDays = 7;
      const maxDays = 10 + Math.floor(Math.random() * 5);
      const standardDate = new Date(orderDate);
      standardDate.setDate(orderDate.getDate() + minDays);
      const standardMaxDate = new Date(orderDate);
      standardMaxDate.setDate(orderDate.getDate() + maxDays);
      estimatedDate = `${standardDate.toLocaleDateString()} - ${standardMaxDate.toLocaleDateString()}`;
  
      shippingInfoHtml = `
        <div class="text-sm text-gray-500">Standard Shipping</div>
        <div class="text-sm text-gray-500">Estimated Arrival: ${estimatedDate}</div>
      `;
    }
  
    ordersHtml += `
      <div class="bg-white rounded-2xl p-6 shadow-sm order-card animate-fade-up" style="animation-delay: ${index * 0.1}s;" data-order-id="${order._id}">
        <div class="flex justify-between items-start mb-6">
          <div>
            <div class="text-sm text-gray-500">Order ID</div>
            <div class="font-medium">#${order._id}</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500">Order Date: ${new Date(order.orderDate).toLocaleDateString()}</div>
            <div class="text-green-500 font-medium">${order.orderStatus}</div>
          </div>
        </div>

        <div class="mb-4 border-t border-b py-4">${itemsHtml}</div>
        ${couponHtml}
        ${addressHtml}

        <div class="mt-4">
          <p class="text-sm text-gray-500">Payment Method: <span class="font-medium">${order.paymentMethod || "N/A"}</span></p>
          <p class="text-sm text-gray-500">Payment Status: <span class="font-medium">${order.paymentStatus || "N/A"}</span></p>
        </div>
        ${shippingInfoHtml}

        <div class="mt-6 flex justify-between items-center">
          <div>
            <span class="text-sm text-gray-500">${order.orderedItem.length} items</span>
            <p class="font-lg">
              <span class="line-through text-gray-400">Rs. ₹${order.actualPrice.toLocaleString()}</span>
              <span class="text-green-600 font-semibold">Rs. ₹${order.finalAmount.toLocaleString()}</span>
            </p>
            ${(order.offerDiscount > 0 || (order.finalAmount < order.actualPrice && order.finalAmount !== 0)) 
              ? `<p class="text-green-600 font-medium">You saved: ₹${(order.offerDiscount || (order.actualPrice - order.finalAmount)).toLocaleString()}</p>`
              : ""}
            
          </div>
          <div class="space-x-4">
            ${(!isCancelled && !isDelivered && !isShipped && !isReturned) ? `
              <button class="px-4 py-2 border border-black text-black rounded hover:bg-black hover:text-white transition-colors" onclick="trackOrder('${order._id}')">
                Track Order
              </button>
            ` : ""}
            ${(isCancelled && order.paymentMethod.toLowerCase() === "paypal") || (isCancelled && order.paymentMethod.toLowerCase() === "wallet") || (isReturned && order.paymentMethod.toLowerCase() === "paypal") || (isReturned && order.paymentMethod.toLowerCase() === "cod") ? `
              <button class="px-4 py-2 border border-black text-black rounded hover:bg-black hover:text-white transition-colors" onclick="redirectToWallet()">
                Track Transaction
              </button>
            ` : ""}
          </div>
        </div>
      </div>
    `;
  });
  
  ordersContainer.innerHTML = ordersHtml;
  displayPaginationControls(orders.length);
}

function redirectToWallet() {
  // we can do the seperate page for one tracking page transaction
  // onclick="trackTransaction('${order._id}')
  window.location.href = '/wallet'; // This will redirect to the /wallet page
}
  

function displayPaginationControls(totalOrders) {
  const paginationContainer = document.querySelector(".pagination");
  paginationContainer.innerHTML = ""; // Clear existing pagination controls

  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  let paginationHtml = `
        <button class="px-4 py-2 border" ${currentPage === 1 ? "disabled" : ""} onclick="changePage(currentPage - 1)">Previous</button>
    `;

  for (let i = 1; i <= totalPages; i++) {
    paginationHtml += `
            <button class="px-4 py-2 border ${currentPage === i ? "bg-gray-900 text-white" : ""}" onclick="changePage(${i})">${i}</button>
        `;
  }

  paginationHtml += `
        <button class="px-4 py-2 border" ${currentPage === totalPages ? "disabled" : ""} onclick="changePage(currentPage + 1)">Next</button>
    `;

  paginationContainer.innerHTML = paginationHtml;
}

function changePage(page) {
  currentPage = page;
  displayOrders(allOrders);
}

document.addEventListener("DOMContentLoaded", getOrders);

document.addEventListener(
  "mouseover",
  function (event) {
    const orderCard = event.target.closest(".order-card");
    if (orderCard) {
      orderCard.style.transform = "translateY(-2px)";
      orderCard.style.transition = "transform 0.2s ease-out";
    }
  },
  true
);

document.addEventListener(
  "mouseout",
  function (event) {
    const orderCard = event.target.closest(".order-card");
    if (orderCard) {
      orderCard.style.transform = "translateY(0)";
    }
  },
  true
);



function trackOrder(orderId) {
  console.log("Tracking order:", orderId);
  // Implement your tracking logic here
}


async function cancelItem(orderId, productId, categoryId, quantity, discountAmount, totalPrice, couponDiscount, paymentMethod) {
  // Prepare the data to be sent
  const cancellationData = {
    orderId: orderId,
    productId: productId,
    categoryId: categoryId,
    quantity: quantity,
    discountAmount: discountAmount,
    totalPrice: totalPrice,
    couponDiscount: couponDiscount,
    paymentMethod: paymentMethod,
  };

  // Specify the backend URL endpoint
  const backendUrl = '/cancelOrder'; // Update this to your actual backend URL

  try {
    // Send the cancellation request using axios
    const response = await axios.post(backendUrl, cancellationData);
    console.log('Cancellation successful:', response.data);

    // Update the specific order and its item's status in the `allOrders` array
    allOrders = allOrders.map(order => {
      if (order._id === orderId) {
        // Update the order status only if all items are canceled
        const allItemsCancelled = order.orderedItem.every(item =>
          item.productId === productId ? true : item.status === "Cancelled"
        );
        order.orderStatus = allItemsCancelled ? "Cancelled" : order.orderStatus;

        // Update the status of the specific product in orderedItem
        order.orderedItem = order.orderedItem.map(item => {
          if (item.productId === productId) {
            console.log(item._doc.status);
            
            item._doc.status = "Cancelled"; // Change status to "Cancelled" in _doc
          }
          return item; // Return the updated item
        });
      }
      return order; // Return the updated order
    });
    displayOrders(allOrders);
    
    // Show SweetAlert success message
    Swal.fire({
      title: 'Success!',
      text: 'Your order item has been successfully canceled.',
      icon: 'success',
      confirmButtonText: 'OK',
    }).then(() => {
      window.location.reload()
    })

    // Re-render orders with the updated status
   

  } catch (error) {
    // Handle any errors that occur during the request
    if (error.response) {
      // Backend returned an error response
      console.error('Error canceling item:', error.response.data);
      Swal.fire({
        title: 'Error!',
        text: `Error canceling item: ${error.response.data.message}`,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } else {
      // Error occurred while making the request
      console.error('Error canceling item:', error.message);
      Swal.fire({
        title: 'Error!',
        text: `Error canceling item: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }
}



function returnOrder(orderId,productId) {
    console.log("Returning order:", orderId);

    const modal = document.getElementById('select-modal');
    const closeModalButton = modal.querySelector('[data-modal-toggle="select-modal"]');
    const reasonRadios = document.querySelectorAll('input[name="return-reason"]');
    const reasonCustomRadio = document.getElementById('reason-custom');
    const customReasonInput = document.getElementById('custom-reason-input');
    const submitReturnButton = document.getElementById('submit-return');
    const confirmPolicyCheckbox = document.getElementById('confirm-policy');

    // Show the modal
    modal.classList.remove('hidden');

    // Modal close handler
    closeModalButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Toggle custom reason input visibility
    reasonCustomRadio.addEventListener('change', () => {
        customReasonInput.classList.remove('hidden');
    });

    reasonRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value !== 'Other') {
                customReasonInput.classList.add('hidden');
            }
        });
    });

    // Enable submit button only when policy is confirmed
    confirmPolicyCheckbox.addEventListener('change', () => {
        submitReturnButton.disabled = !confirmPolicyCheckbox.checked;
    });

    // Handle return submission
    submitReturnButton.addEventListener('click', () => {
        const selectedReason = document.querySelector('input[name="return-reason"]:checked').value;
        const customReason = reasonCustomRadio.checked ? document.getElementById('custom-reason').value : '';

        // Log the return details
        console.log('Order ID:', orderId);
        console.log('Return Reason:', selectedReason);
        if (selectedReason === 'Other' && customReason) {
            console.log('Custom Reason:', customReason);
        }

        // Send the return request (replace with your actual API call)
        axios.post('/returnOrder', { orderId, reason: selectedReason, customReason,productId });

        // Prepare the reason message
        const reasonMessage = selectedReason === 'Other' && customReason ? `Custom reason: ${customReason}` : `Reason: ${selectedReason}`;

        // Show confirmation popup
        Swal.fire({
            title: 'Order Return Confirmation',
            text: `We're sorry for the inconvenience. Your item will be returned. We are doing our best to ensure the highest quality!\n\n${reasonMessage}\n\nYour money will be credited to your wallet within 2-3 hours.\n\nWithin a day, our Team will come to collect the order.`,
            icon: 'warning',
            background: '#000000',
            color: '#ffffff',
            backdrop: `
              rgba(0,0,0,0.8)
              url("/images/nyan-cat.gif")
              left top
              no-repeat
            `,
            showClass: {
                popup: 'animate__animated animate__fadeInDown animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp animate__faster'
            },
            showCancelButton: true,
            confirmButtonColor: '#ffffff',
            cancelButtonColor: '#666666',
            confirmButtonText: 'Yes, return it!',
            customClass: {
                title: 'text-white',
                content: 'text-gray-300',
                confirmButton: 'bg-white text-black hover:bg-gray-200 focus:ring-2 focus:ring-white',
                cancelButton: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-600'
            },
            footer: '<span class="text-gray-400">Sorry for the inconvenience, we\'re doing our best to ensure the best quality!</span>' // Custom footer message
        }).then(() => {
          window.location.reload()
        })
        getOrders(); // Reload orders
        // window.location.reload();

        // Close the modal after submitting
        modal.classList.add('hidden');
    });
}
