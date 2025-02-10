document.addEventListener("DOMContentLoaded", () => {
    // Set up view buttons
    setupViewButtons();
  
    // Set up update buttons
    setupUpdateButtons();
  });
  function sortOrders() {
    const sortBy = document.getElementById('sortBy').value;
    const sortOrder = document.getElementById('sortOrder').value;
  
    // Update the URL with the selected sort options
    const newUrl = `/admin/orders?sortBy=${encodeURIComponent(sortBy)}&sortOrder=${encodeURIComponent(sortOrder)}`;
  
    // Navigate to the new URL with query parameters
    window.location.href = newUrl;
  }
  
  
  function setupViewButtons() {
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
                const { orderDetails, orderedItems, productDetails } = response.data;
                

                let productDetailsHTML = '';
                orderedItems.forEach((item, index) => {
                 
                    const product = productDetails[index];
                    productDetailsHTML += `
                        <div class="flex space-x-4 border-b border-gray-200 py-4">
                            <div class="w-1/3">
                                <img src="${product.coverImage}" alt="${product.productName}" class="w-full h-auto object-cover rounded-lg shadow-lg">
                            </div>
                            <div class="w-2/3">
                                <h3 class="text-lg font-semibold">${product.productName}</h3>
                                <p><strong>Category:</strong> ${item.categoryId}</p>
                                <p><strong>Quantity:</strong> ${item.quantity}</p>
                                <p><strong>Price:</strong> ₹${item.totalPrice}</p>
                                <p><strong>Total Price:</strong> ₹${item.totalPrice * item.quantity}</p>
                                <p><strong>Total Price:</strong> ₹${item.status}</p>
                            </div>
                        </div>
                    `;
                });

                // Create the modal container
                const modalContainer = document.createElement('div');
                modalContainer.className = 'fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-4';
                modalContainer.style.zIndex = 1000;

                // Create the modal content
                const modalContent = document.createElement('div');
                modalContent.className = 'bg-white w-full max-w-3xl max-h-screen overflow-y-auto p-6 rounded-lg shadow-lg relative';

                // Close button
                const closeButton = document.createElement('button');
                closeButton.className = 'absolute top-4 right-4 text-gray-600 hover:text-gray-900';
                closeButton.innerHTML = '&times;';
                closeButton.addEventListener('click', () => {
                    document.body.removeChild(modalContainer);
                });
                modalContent.appendChild(closeButton);

                modalContent.innerHTML += `
                <div class="bg-white shadow-lg rounded-xl overflow-hidden animate-fade-in-up">
                    <div class="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                        <h2 class="text-2xl font-bold text-white">Order Details</h2>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <p class="font-medium text-gray-600">Order ID</p>
                                <p class="text-lg font-bold">#${orderDetails._id}</p>
                            </div>
                            <div>
                                <p class="font-medium text-gray-600">Order Status</p>
                                <span class="px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orderDetails.orderStatus)}">
                                    ${orderDetails.orderStatus}
                                </span>
                            </div>
                        </div>
            
                        <div class="border-t pt-4">
                            <p class="font-medium text-gray-600 mb-2">Delivery Address</p>
                            <p class="text-sm">${orderDetails.deliveryAddress.address}</p>
                        </div>
            
                        <div class="grid md:grid-cols-2 gap-4 border-t pt-4">
                            <div>
                                <p class="font-medium text-gray-600">Payment Method</p>
                                <p>${orderDetails.paymentMethod}</p>
                            </div>
                            <div>
                                <p class="font-medium text-gray-600">Total Price</p>
                                <p class="text-xl font-bold text-green-600">₹${orderDetails.finalAmount}</p>
                            </div>
                        </div>
            
                        ${orderDetails.orderStatus.toLowerCase() === 'returned' ? `
                            <div class="border-t pt-4">
                                <p class="font-medium text-gray-600">Return Reason</p>
                                <p>${orderDetails.returnReason}</p>
                            </div>
                        ` : ''}
                        
                        <div class="border-t pt-4">
                            <h3 class="text-xl font-semibold mb-4">Ordered Products</h3>
                            ${productDetailsHTML}
                        </div>
                    </div>
                </div>
            `;
            

                // Append modal content to modal container
                modalContainer.appendChild(modalContent);

                // Append modal container to body
                document.body.appendChild(modalContainer);

                // Close modal on click outside the content
                modalContainer.addEventListener('click', (event) => {
                    if (event.target === modalContainer) {
                        document.body.removeChild(modalContainer);
                    }
                });

            } catch (error) {
                console.error('Error fetching order details:', error);
            }
        });
    });
}


  
  function setupUpdateButtons() {
    const updateModal = document.getElementById("updateModal");
    const updateModalContent = document.getElementById("updateModalContent");
    const closeUpdateModal = document.getElementById("closeUpdateModal");
    const updateButtons = document.querySelectorAll("#updateOrder");
    const updateOrderIdInput = document.getElementById("updateOrderId");
    const updateStatusSelect = document.getElementById("status");
    const updateSubmitButton = document.getElementById("updateSubmit");
  
    const statusOptions = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
      returned: [] 
    };
  
    updateButtons.forEach(button => {
      const orderId = button.getAttribute("data-order-id");
      const currentStatus = button.closest("tr").querySelector("td:nth-child(5)").innerText.toLowerCase();
      
      if (currentStatus === 'cancelled' || currentStatus === 'delivered') {
        button.style.display = 'none';
      } else {
        button.style.display = '';
        button.addEventListener("click", () => {
          updateOrderIdInput.value = orderId;
  
          updateStatusSelect.innerHTML = '';
          statusOptions[currentStatus].forEach(status => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = capitalizeFirstLetter(status);
            updateStatusSelect.appendChild(option);
          });
  
          showModal(updateModal);
        });
      }
    });
  
    closeUpdateModal.addEventListener("click", () => hideModal(updateModal));
  
    updateModal.addEventListener("click", (e) => {
      if (e.target === updateModal) {
        hideModal(updateModal);
      }
    });
  
    updateSubmitButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const orderId = updateOrderIdInput.value;
      const status = updateStatusSelect.value;
  
      if (!status) {
        alert("Please select a status before submitting.");
        return;
      }
  
      try {
        const response = await axios.patch(`/admin/orders/${orderId}/update/${status}`);
  
        if (response.status === 200) {
          // alert(response.data.message || "Order status updated successfully!");
          Swal.fire({
            title: "Order Status Updated!",
            text: "The Order has been updated successfully.",
            toast: true,
            position: "top-center",
            showConfirmButton: false,
            timer: 2000, 
            timerProgressBar: true, 
            icon: "success",
        }).then(() => {
          window.location.reload()
        })
          
        hideModal(updateModal); 
        
        } else {
          Swal.fire({
            title: "Faiked To Update Status!",
            text: "Error while upating the order status",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            position: "top",
            customClass: {
              popup: "max-w-md w-full p-4 bg-white shadow-lg rounded-lg fixed top-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 transition-all ease-in-out duration-500",
            },
           
          });
        }
      } catch (error) {
        console.error("Error updating order status:", error);
        alert(error.response?.data?.message || "An error occurred. Please try again later.");
      }
    });
  }
  
  function showModal(modal) {
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal.querySelector('.bg-white').classList.add("scale-100", "opacity-100");
      modal.querySelector('.bg-white').classList.remove("scale-95", "opacity-0");
    }, 10);
  }
  
  function hideModal(modal) {
    const modalContent = modal.querySelector('.bg-white');
    modalContent.classList.add("scale-95", "opacity-0");
    modalContent.classList.remove("scale-100", "opacity-100");
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 300);
  }
  
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
      case 'returned':
          return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }