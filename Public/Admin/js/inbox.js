async function getReturnRequests() {
    try {
        // Fetch return requests from the server
        const response = await axios.get('/getReturnRequests');
        const requests = response.data.orders // Extract orders from the response
        
        renderRequests(requests); 
    } catch (error) {
        console.error("Error while fetching the return requests:", error);
    }
}

function createRequestRow(request) {
    const row = document.createElement('tr');
    row.className = 'bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100';

    // Populate the row with request data
    row.innerHTML = `
        <td class="px-6 py-4 text-sm text-gray-900">${request.orderDetails._id}</td>
       <td class="px-6 py-4 text-sm text-gray-500" data-categoryid="${request.orderDetails.orderedItem.categoryId}">${request.orderDetails.orderedItem.productId}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${request.orderDetails.orderedItem.quantity}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${request.orderDetails.orderedItem.returnRequest.reason}</td>
        <td class="px-6 py-4 text-sm text-gray-500" data-coupondiscount="${request.orderDetails.couponDiscount}">
            ${request.orderDetails.orderedItem.totalPrice}
        </td>
        <td class="px-6 py-4 text-sm text-gray-500">${request.orderDetails.orderedItem.returnRequest.requestedAt}</td>
        <td class="px-6 py-4 text-sm font-medium">
            <button onclick="handleAction('${request.orderDetails._id}', 'accept')" class="text-secondary hover:text-opacity-70 mr-2">Accept</button>
            <button onclick="handleAction('${request.orderDetails._id}', 'reject')" class="text-danger hover:text-opacity-70">Reject</button>
        </td>
    `;
    return row;
}

function renderRequests(requests) {
    const tbody = document.getElementById('returnRequestsBody'); // Get the table body
    tbody.innerHTML = ''; // Clear any existing rows

    requests.forEach(request => {
        tbody.appendChild(createRequestRow(request)); // Add each row to the table
    });
}

async function handleAction(id, action) {
    let apiUrl = '';
    let requestData = {
        orderId: id
    };

    // Find the request row and extract the necessary data
    const row = Array.from(document.querySelectorAll('tr')).find(r => r.cells[0].textContent === id);
    const quantity = row ? row.cells[2].textContent : null; // Assuming the quantity is in the 3rd column (index 2)
    const productId = row ? row.cells[1].textContent : null; // Assuming the productId is in the 2nd column (index 1)
    const categoryId = row ? row.cells[1].dataset.categoryid : null; // Extract categoryId from the data-categoryid attribute
    const couponDiscount = row ? row.cells[4].dataset.coupondiscount : '0'; // Default to '0' if no coupon discount
    const totalPriceText = row ? row.cells[4].textContent : null; // Assuming the totalPrice is in the 6th column (index 5)

    // Clean the totalPrice by removing any unwanted whitespace or newlines
    const totalPrice = totalPriceText ? totalPriceText.replace(/\s+/g, '').replace('₱', '') : null;

    // If the quantity, productId, categoryId, couponDiscount, and totalPrice are found, include them in the request data
    if (quantity) {
        requestData.quantity = quantity;
    }
    if (productId) {
        requestData.productId = productId;
    }
    if (categoryId) {
        requestData.categoryId = categoryId; // Add categoryId to the requestData
    }
    if (couponDiscount !== null) {
        requestData.couponDiscount = couponDiscount; // Always send couponDiscount, even if it's 0
    }
    if (totalPrice) {
        requestData.totalPrice = parseFloat(totalPrice); // Ensure it's a proper number
    }

    // Set API URL and additional data based on action
    if (action === 'accept') {
        apiUrl = '/acceptReturnRequest'; // API for accepting the return request
        requestData.action = 'accept';  // Optional, if you want to specify action explicitly
    } else if (action === 'reject') {
        apiUrl = '/rejectReturnRequest'; // API for rejecting the return request
        requestData.action = 'reject';  // Optional, if you want to specify action explicitly
    }

    // Show confirmation dialog using SweetAlert2
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Are you sure you want to ${action} this return request?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Proceed!',
        cancelButtonText: 'No, Cancel'
    });

    // If the user confirms the action, send the API request
    if (result.isConfirmed) {
        try {
            const response = await axios.post(apiUrl, requestData);
            
            Swal.fire(
                'Success!',
                `Return request ${id} has been ${action}ed.`,
                'success'
            );

            // Optional: Remove the row from the table after the server responds
            if (row) {
                row.classList.add('opacity-0');
                setTimeout(() => row.remove(), 300);
            }
        } catch (error) {
            // Handle errors if the request fails
            console.error(`Error while processing the return request: ${error}`);
            Swal.fire(
                'Error!',
                'There was an error while processing the return request.',
                'error'
            );
        }
    } else {
        console.log('Action canceled by the user');
    }
}




getReturnRequests();
