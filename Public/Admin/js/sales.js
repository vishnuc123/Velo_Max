
function formatDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
}

// Fetch sales data with filtering
async function fetchSalesData(page = 1, limit = 10, startDate = '', endDate = '', dateRange = '') {
    try {
     
        if (startDate === '' && endDate === '') {
            startDate = document.getElementById('start-date').value;
            endDate = document.getElementById('end-date').value;
        }

        // Adjust the date range based on the selected filter
        if (startDate === '' && endDate === '') {
            if (dateRange === '1-day') {
                const today = new Date();
                startDate = formatDate(new Date(today.setHours(0, 0, 0, 0))); // Start of today
                endDate = startDate; // End of today
            } else if (dateRange === '1-week') {
                const today = new Date();
                const firstDayOfWeek = today.getDate() - today.getDay(); // Get first day of the current week
                startDate = formatDate(new Date(today.setDate(firstDayOfWeek)));
                endDate = formatDate(new Date(today.setDate(firstDayOfWeek + 6))); // End of the week
            } else if (dateRange === '1-month') {
                const today = new Date();
                startDate = formatDate(new Date(today.getFullYear(), today.getMonth(), 1)); // First day of the current month
                endDate = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0)); // Last day of the current month
            } else if (dateRange === '1-year') {
                const today = new Date();
                startDate = formatDate(new Date(today.getFullYear(), 0, 1)); // First day of the current year
                endDate = formatDate(new Date(today.getFullYear(), 11, 31)); // Last day of the current year
            }
        }

       
        const params = {
            page,
            limit,
            startDate,
            endDate,
            dateRange
        };

        const response = await axios.get('/getSalesDetails', { params });
        console.log(response.data);

        const salesData = response.data.salesData;
        const totalSalesCount = response.data.totalSalesCount;
        const totalOrderAmount = response.data.totalOrderAmount;
        const totalDiscount = response.data.totalDiscount;
        const totalOfferDiscount = response.data.totalOfferDiscount;
        const totalPages = response.data.totalPages;

        populateTable(salesData, totalSalesCount, totalOrderAmount, totalDiscount, totalOfferDiscount); // Populate table with sales data
        updatePagination(totalPages, page); // Update pagination
    } catch (error) {
        console.log(error);
    }
}

// Populate the sales data table
function populateTable(data, totalSalesCount, totalOrderAmount, totalDiscount, totalOfferDiscount) {
    const tableBody = document.querySelector('#sales-report-table tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    let salesCount = 0;
    let orderAmount = 0;
    let discount = 0;
    let offerDiscount = 0;

    data.forEach(item => {
        // Calculate the sales count based on the ordered item quantities
        const itemSalesCount = item.orderedItem.reduce((acc, orderedItem) => acc + orderedItem.quantity, 0);
        salesCount += itemSalesCount;
        orderAmount += item.finalAmount || 0;
        offerDiscount += item.offerDiscount || 0;

        // Calculate total discount for the order by summing DiscountAmount for each ordered item
        const orderDiscount = item.orderedItem.reduce((acc, orderedItem) => acc + (orderedItem.DiscountAmount || 0), 0);
        discount += orderDiscount;

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${item.orderDate || 'N/A'}</td>
            <td>${itemSalesCount || 0}</td>  <!-- Display the calculated sales count -->
            <td>₹${(item.finalAmount || 0).toFixed(2)}</td>
            <td>₹${orderDiscount.toFixed(2)}</td> <!-- Display the total discount for the order -->
            <td>₹${(item.couponDiscount || 0).toFixed(2)}</td> <!-- Show offerDiscount -->
            <td>${item.couponApplied ? 'Yes' : 'No'}</td>
        `;
        tableBody.appendChild(row);
    });

    // Update summary data
    document.getElementById('overall-sales-count').textContent = salesCount;
    document.getElementById('overall-order-amount').textContent = `₹${orderAmount.toFixed(2)}`;
    document.getElementById('overall-discount').textContent = `₹${discount.toFixed(2)}`;
    document.getElementById('overall-offer-discount').textContent = `₹${offerDiscount.toFixed(2)}`;
}

// Update pagination buttons
function updatePagination(totalPages, currentPage) {
    const paginationContainer = document.querySelector('#pagination-controls');
    paginationContainer.innerHTML = ''; // Clear existing buttons

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.onclick = () => fetchSalesData(i);
        if (i === currentPage) {
            pageButton.disabled = true; // Disable the current page button
        }
        paginationContainer.appendChild(pageButton);
    }
}

// Apply filters (date range or custom dates)
document.getElementById('apply-filters').addEventListener('click', () => {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const dateRange = document.getElementById('date-range').value;

    fetchSalesData(1, 10, startDate, endDate, dateRange); // Fetch sales data with the selected filters
});

// Download PDF
// Wait for the library to load before calling jsPDF
document.getElementById('download-pdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf; // Extract jsPDF from window object
    const doc = new jsPDF();
    const table = document.querySelector('#sales-report-table');

    // Generate PDF with table data
    doc.autoTable({ html: table });
    doc.save('sales_report.pdf');
});

// Download Excel
document.getElementById('download-excel').addEventListener('click', () => {
    const table = document.querySelector('#sales-report-table');
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sales Report" });
    XLSX.writeFile(wb, 'sales_report.xlsx');
});

document.addEventListener('DOMContentLoaded', () => {
    // Your existing code
    fetchSalesData();
});
