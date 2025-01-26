// Fetch sales data with filtering
async function fetchSalesData(page = 1, limit = 10, startDate = '', endDate = '', dateRange = '') {
    try {
        // Prepare query parameters
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
    document.getElementById('overall-order-amount').textContent = `$${orderAmount.toFixed(2)}`;
    document.getElementById('overall-discount').textContent = `$${discount.toFixed(2)}`;
    document.getElementById('overall-offer-discount').textContent = `$${offerDiscount.toFixed(2)}`;
}

// Update pagination buttons
function updatePagination(totalPages, currentPage) {
    const paginationContainer = document.querySelector('.pagination');
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
document.getElementById('download-pdf').addEventListener('click', () => {
    const doc = new jsPDF();
    const table = document.querySelector('#sales-report-table');

    doc.autoTable({ html: table });
    doc.save('sales_report.pdf');
});

// Download Excel
document.getElementById('download-excel').addEventListener('click', () => {
    const table = document.querySelector('#sales-report-table');
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sales Report" });
    XLSX.writeFile(wb, 'sales_report.xlsx');
});

// Initially fetch and populate the table (first page, no filters)
fetchSalesData();
