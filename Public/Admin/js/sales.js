
function formatDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; 
}


async function fetchSalesData(page = 1, limit = 10, startDate = '', endDate = '', dateRange = '') {
    try {
     
        if (startDate === '' && endDate === '') {
            startDate = document.getElementById('start-date').value;
            endDate = document.getElementById('end-date').value;
        }

      
        if (startDate === '' && endDate === '') {
            if (dateRange === '1-day') {
                const today = new Date();
                startDate = formatDate(new Date(today.setHours(0, 0, 0, 0))); 
                endDate = startDate; 
            } else if (dateRange === '1-week') {
                const today = new Date();
                const firstDayOfWeek = today.getDate() - today.getDay(); 
                startDate = formatDate(new Date(today.setDate(firstDayOfWeek)));
                endDate = formatDate(new Date(today.setDate(firstDayOfWeek + 6))); 
            } else if (dateRange === '1-month') {
                const today = new Date();
                startDate = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
                endDate = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0)); 
            } else if (dateRange === '1-year') {
                const today = new Date();
                startDate = formatDate(new Date(today.getFullYear(), 0, 1)); 
                endDate = formatDate(new Date(today.getFullYear(), 11, 31)); 
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

        const salesData = response.data.salesData;
        const totalSalesCount = response.data.totalSalesCount;
        const totalOrderAmount = response.data.totalOrderAmount;
        const totalDiscount = response.data.totalDiscount;
        const totalOfferDiscount = response.data.totalOfferDiscount;
        const totalPages = response.data.totalPages;

        populateTable(salesData, totalSalesCount, totalOrderAmount, totalDiscount, totalOfferDiscount); 
        updatePagination(totalPages, page);
    } catch (error) {
        console.log(error);
    }
}


function populateTable(data, totalSalesCount, totalOrderAmount, totalDiscount, totalOfferDiscount) {
    const tableBody = document.querySelector('#sales-report-table tbody');
    tableBody.innerHTML = ''; 

    let salesCount = 0;
    let orderAmount = 0;
    let discount = 0;
    let offerDiscount = 0;
    console.log(data);
    

    data.forEach(item => {
        
        const itemSalesCount = item.orderedItem.reduce((acc, orderedItem) => acc + orderedItem.quantity, 0);
        salesCount += itemSalesCount;
        orderAmount += item.finalAmount || 0;
        offerDiscount += item.offerDiscount || 0;

    
        const orderDiscount = item.orderedItem.reduce((acc, orderedItem) => acc + (orderedItem.actualPrice-orderedItem.DiscountAmount), 0);
        discount += orderDiscount;

        const row = document.createElement('tr');

        row.innerHTML = `
          <td>${new Date(item.orderDate).toLocaleDateString() || 'N/A'}</td>
            <td>${itemSalesCount || 0}</td>  <!-- Display the calculated sales count -->
            <td>₹${(item.actualPrice || 0).toFixed(2)}</td>
            <td>₹${item.totalDiscount>0?item.totalDiscount.toFixed(2):0}</td> 
            <td>₹${item.couponApplied?(item.finalAmount-item.couponDiscount || 0).toFixed(2):0||0}</td> <!-- Show offerDiscount -->
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


document.getElementById('apply-filters').addEventListener('click', () => {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const dateRange = document.getElementById('date-range').value;

    fetchSalesData(1, 10, startDate, endDate, dateRange); 
});


document.getElementById('download-pdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf; 
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
