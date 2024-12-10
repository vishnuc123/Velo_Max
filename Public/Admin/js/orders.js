document.getElementById('sortBy').addEventListener('change', sortOrders);
document.getElementById('sortOrder').addEventListener('change', sortOrders);

function sortOrders() {
  const sortBy = document.getElementById('sortBy').value;
  const sortOrder = document.getElementById('sortOrder').value;
  
  const rows = Array.from(document.querySelectorAll('tbody tr'));
  
  rows.sort((rowA, rowB) => {
    const valueA = getOrderValue(rowA, sortBy);
    const valueB = getOrderValue(rowB, sortBy);

    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  const tbody = document.querySelector('tbody');
  rows.forEach(row => tbody.appendChild(row));

  // Rebind the event listeners after sorting
  rebindUpdateListeners();
}

function getOrderValue(row, criteria) {
  switch (criteria) {
    case 'orderId':
      return row.querySelector('td:first-child').innerText.toLowerCase();
    case 'status':
      return row.querySelector('td:nth-child(5)').innerText.toLowerCase();
    case 'quantity':
      return parseInt(row.querySelector('td:nth-child(4)').innerText, 10);
    case 'date':
      return new Date(row.querySelector('td:nth-child(6)').innerText).getTime();
    default:
      return '';
  }
}

function rebindUpdateListeners() {
  document.querySelectorAll('#orderView').forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        const orderId = e.target.getAttribute('data-order-id');
        if (!orderId) {
            console.error('Order ID is missing!');
            return;
        }

        try {
            const response = await axios.get(`/admin/orders/${orderId}`);
            const { orderDetails, productDetails } = response.data;

            document.getElementById("orderDetails").innerHTML = `
                <p class="text-gray-700"><strong class="font-semibold">Order ID:</strong> ${orderDetails[0]._id}</p>
                <p class="text-gray-700"><strong class="font-semibold">Delivery Address:</strong> ${orderDetails[0].deliveryAddress.address}</p>
                <p class="text-gray-700"><strong class="font-semibold">Total Price:</strong> ₹${orderDetails[0].totalPrice}</p>
                <p class="text-gray-700"><strong class="font-semibold">Payment Method:</strong> ${orderDetails[0].paymentMethod}</p>
                <p class="text-gray-700"><strong class="font-semibold">Order Status:</strong> <span class="px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(orderDetails[0].orderStatus)}">${orderDetails[0].orderStatus}</span></p>
            `;

            document.getElementById("productDetails").innerHTML = `
                <p class="text-gray-700"><strong class="font-semibold">Product Name:</strong> ${productDetails.productName}</p>
                <p class="text-gray-700"><strong class="font-semibold">Price:</strong> ₹${productDetails.ListingPrice}</p>
            `;

            if (productDetails.coverImage) {
                document.getElementById("coverImageContainer").innerHTML = `
                    <img src="${productDetails.coverImage}" alt="Product Image" class="w-32 h-32 object-cover rounded-lg shadow-lg">
                `;
            }

            const modal = document.getElementById("orderModal");
            modal.classList.remove("hidden");
            setTimeout(() => {
                modal.querySelector('.bg-white').classList.remove('scale-95', 'opacity-0');
                modal.querySelector('.bg-white').classList.add('scale-100', 'opacity-100');
            }, 50);

        } catch (error) {
            console.error('Error fetching order details:', error);
        }
    });
  });
}

function closeModal() {
    const modal = document.getElementById("orderModal");
    const modalContent = modal.querySelector('.bg-white');
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add("hidden");
    }, 300);
}

document.getElementById("closeModal").addEventListener('click', closeModal);

// Helper function to get status color
function getStatusColor(status) {
    switch(status.toLowerCase()) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'processing':
            return 'bg-blue-100 text-blue-800';
        case 'shipped':
            return 'bg-purple-100 text-purple-800';
        case 'delivered':
            return 'bg-green-100 text-green-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const updateModal = document.getElementById("updateModal");
    const updateModalContent = document.getElementById("updateModalContent");
    const closeUpdateModal = document.getElementById("closeUpdateModal");
    const updateButtons = document.querySelectorAll("#updateOrder");
    const updateOrderIdInput = document.getElementById("updateOrderId");
    const updateStatusSelect = document.getElementById("status");
    const updateSubmitButton = document.getElementById("updateSubmit");

    // Function to show the modal
    const showModal = (modal) => {
        modal.classList.remove("hidden");
        setTimeout(() => {
            updateModalContent.classList.add("scale-100", "opacity-100");
            updateModalContent.classList.remove("scale-95", "opacity-0");
        }, 10); // Small delay for animation effect
    };

    // Function to hide the modal
    const hideModal = (modal) => {
        updateModalContent.classList.add("scale-95", "opacity-0");
        updateModalContent.classList.remove("scale-100", "opacity-100");
        setTimeout(() => {
            modal.classList.add("hidden");
        }, 300); // Matches the transition duration
    };

    const statusOptions = {
        pending: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['delivered'],
        delivered: [],
        cancelled: []
    };
    
    updateButtons.forEach(button => {
        const orderId = button.getAttribute("data-order-id");
        const currentStatus = button.closest("tr").querySelector("td:nth-child(5)").innerText.toLowerCase();
        
        // Hide the update button if status is 'delivered' or 'cancelled'
        if (currentStatus === 'cancelled' || currentStatus === 'delivered') {
            button.style.display = 'none';
        } else {
            button.style.display = ''; // Show the button if the order can still be updated
            button.addEventListener("click", () => {
                document.getElementById("updateOrderId").value = orderId; // Populate hidden input with order ID
    
                // Populate the dropdown with relevant statuses
                const statusDropdown = document.getElementById("status");
                statusDropdown.innerHTML = ''; // Clear existing options
                statusOptions[currentStatus].forEach(status => {
                    const option = document.createElement("option");
                    option.value = status;
                    option.textContent = capitalizeFirstLetter(status);
                    statusDropdown.appendChild(option);
                });
    
                showModal(updateModal); // Show Modal
            });
        }
    });
    
    // Helper function to capitalize the first letter of a string
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Attach event listener to close button
    closeUpdateModal.addEventListener("click", () => hideModal(updateModal));

    // Close modal on clicking outside of modal content
    updateModal.addEventListener("click", (e) => {
        if (e.target === updateModal) {
            hideModal(updateModal);
        }
    });

    // Handle form submission to update the order
    updateSubmitButton.addEventListener("click", async (e) => {
        e.preventDefault();  // Prevent form from refreshing the page
        const orderId = updateOrderIdInput.value;
        const status = updateStatusSelect.value;
    
        if (!status) {
            alert("Please select a status before submitting.");
            return;
        }
    
        try {
            // Send data using URL path parameters
            const response = await axios.patch(`/admin/orders/${orderId}/update/${status}`);
    
            if (response.status === 200) {
                alert(response.data.message || "Order status updated successfully!");
                hideModal(updateModal); // Hide modal after successful update
                location.reload(); // Optionally, refresh the page or update the UI to reflect the change
            } else {
                alert(response.data.message || "Failed to update order status.");
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            alert(error.response?.data?.message || "An error occurred. Please try again later.");
        }
    });

    
});
