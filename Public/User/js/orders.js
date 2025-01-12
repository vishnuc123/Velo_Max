let allOrders = []; // Store all orders
let currentPage = 1;
const ordersPerPage = 10;

async function getOrders() {
  try {
    const response = await axios.get("/getOrderProductDetail");
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
      itemsHtml += `
        <div class="flex space-x-4 mb-4 cursor-pointer" onclick="window.location.href='/product/${productData.productId}'">
          <img src="${productData.coverImage || "/placeholder.png"}" alt="${productData.productName || "Product"}" class="w-20 h-20 object-cover rounded-lg"/>
          <div>
            <h3 class="font-medium">${productData.productName || "Unknown Product"}</h3>
            <p class="text-gray-600">Rs. ₹${(productData.ListingPrice || 0).toLocaleString()}</p>
            <p class="text-sm text-gray-500">Category: ${item._doc.categoryId || "N/A"}</p>
          </div>
        </div>
      `;
    });

    const productIds = JSON.stringify(
      order.orderedItem
        .map((item) => item._doc?.productId || null)
        .filter(Boolean)
    );

    const couponHtml = order.couponCode ? `
      <div class="mt-4">
        <p class="text-sm text-gray-500">Coupon Applied: <span class="font-medium">${order.couponCode}</span></p>
        <p class="text-sm text-gray-500">Original Price: <span class="line-through">Rs. ₹${order.originalPrice.toLocaleString()}</span></p>
        <p class="text-sm text-gray-500">Discount: <span class="text-green-500">-Rs. ₹${order.couponDiscount.toLocaleString()}</span></p>
      </div>
    ` : '';

    // Address Information
    const addressHtml = order.deliveryAddress ? `
      <div class="mt-4">
        <p class="text-sm text-gray-500">Address: <span class="font-medium">${order.deliveryAddress.address}</span></p>
        <p class="text-sm text-gray-500">City: <span class="font-medium">${order.deliveryAddress.city}</span></p>
        <p class="text-sm text-gray-500">Pin Code: <span class="font-medium">${order.deliveryAddress.pinCode}</span></p>
        <p class="text-sm text-gray-500">Phone: <span class="font-medium">${order.deliveryAddress.phoneNumber}</span></p>
      </div>
    ` : '';

    // Calculate estimated arrival date
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

        <div>${itemsHtml}</div>
        ${couponHtml}
        ${addressHtml}  <!-- Display address here -->

        <div class="mt-4">
          <p class="text-sm text-gray-500">Payment Method: <span class="font-medium">${order.paymentMethod || "N/A"}</span></p>
          <p class="text-sm text-gray-500">Payment Status: <span class="font-medium">${order.paymentStatus || "N/A"}</span></p>
        </div>
        ${shippingInfoHtml}

        <div class="mt-6 flex justify-between items-center">
          <div>
            <span class="text-sm text-gray-500">${order.orderedItem.length} items</span>
            <p class="font-lg">Rs. ₹${order.finalAmount.toLocaleString()}</p>
          </div>
          <div class="space-x-4">
            ${!isCancelled && !isDelivered && !isShipped && !isReturned ? `
              <button 
                class="px-4 py-2 bg-red-600 border border-black text-black rounded hover:bg-black hover:text-white transition-colors cancel-order-button" 
                data-order-id="${order._id}"
                data-product-ids='${productIds}'>
                Cancel Order
              </button>
              <button class="px-4 py-2 border border-black text-black rounded hover:bg-black hover:text-white transition-colors" onclick="trackOrder('${order._id}')">
                Track Order
              </button>
            ` : ""}
            ${isDelivered ? `
              <button class="px-4 py-2 border border-black text-black rounded hover:bg-black hover:text-white transition-colors" onclick="returnOrder('${order._id}')">
                Return Order
              </button>
            ` : ""}
            ${isReturned ? `
              <button class="px-4 py-2 border border-black text-black rounded hover:bg-black hover:text-white transition-colors" onclick="trackTransaction('${order._id}')">
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

async function cancelOrders(orderId, productIds) {
  try {
    console.log("Cancelling order:", orderId, "Products:", productIds);

    const response = await axios.post("/cancelOrder", {
      productIds,
      orderId,
    });

    if (response.status === 200) {
      alert("Order canceled successfully!");
      getOrders(); // Reload orders
      window.location.reload(); // Optional: refresh the page

      const orderCard = document.querySelector(
        `.order-card[data-order-id="${orderId}"]`
      );
      if (orderCard) {
        const actionsDiv = orderCard.querySelector(".space-x-4");
        if (actionsDiv) actionsDiv.remove();

        const statusDiv = orderCard.querySelector(".text-green-500");
        if (statusDiv) {
          statusDiv.textContent = "Cancelled";
          statusDiv.classList.remove("text-green-500");
          statusDiv.classList.add("text-red-500");
        }
      }
    } else {
      alert("Failed to cancel the order. Please try again.");
    }
  } catch (error) {
    console.error("Error canceling order:", error);
    alert("An error occurred while canceling the order. Please try again.");
  }
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("cancel-order-button")) {
    const orderId = event.target.dataset.orderId;
    const productIds = JSON.parse(event.target.dataset.productIds);

    if (Array.isArray(productIds)) {
      cancelOrders(orderId, productIds);
    } else {
      console.error("Invalid product IDs:", productIds);
    }
  }
});

function trackOrder(orderId) {
  console.log("Tracking order:", orderId);
  // Implement your tracking logic here
}

function returnOrder(orderId) {
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
        axios.post('/returnOrder', { orderId, reason: selectedReason, customReason });

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
        });
        getOrders(); // Reload orders
        window.location.reload();

        // Close the modal after submitting
        modal.classList.add('hidden');
    });
}
