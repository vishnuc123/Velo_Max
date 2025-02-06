var chartOptions = {
  series: [],
  chart: {
    type: 'bar',
    height: 350,
    stacked: true,
    toolbar: {
      show: true
    },
    zoom: {
      enabled: true
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      legend: {
        position: 'bottom',
        offsetX: -10,
        offsetY: 0
      }
    }
  }],
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 10,
      borderRadiusApplication: 'end',
      borderRadiusWhenStacked: 'last',
      dataLabels: {
        total: {
          enabled: true,
          style: {
            fontSize: '13px',
            fontWeight: 900
          }
        }
      }
    },
  },
  xaxis: {
    type: 'category',
    categories: [],
  },
  legend: {
    position: 'right',
    offsetY: 40
  },
  fill: {
    opacity: 1
  }
};

var chart = new ApexCharts(document.querySelector("#SummaryChart"), chartOptions);
chart.render();

async function getTopTenProducts(filterType = "weekly") {
  try {
    // Show loading indicator
    document.getElementById("loadingIndicator").style.display = "block";

    const response = await axios.get(`/getTopTenProducts?filter=${filterType}`); // Fetch filtered data
    const topProducts = response.data.data;

    console.log("toptenproduct", topProducts);
    
    // Prepare data for the chart
    const productNames = topProducts.map(product => product.productDetails?.productName || 'Unknown Product');
    const productRevenues = topProducts.map(product => product.totalRevenue || 0);

    // Update the bar chart
    chart.updateOptions({
      xaxis: {
        categories: productNames
      }
    });

    chart.updateSeries([{
      name: 'Revenue',
      data: productRevenues
    }]);

    // Update the best seller card
    const bestSellerText = document.querySelector('#best-seller h1.text-lg.font-bold.tracking-wide');
    const bestSellerImage = document.querySelector('#best-seller img');
    const bestSellerRevenue = document.querySelector('#best-seller h1.font-extrabold.text-4xl.text-teal-400');
    bestSellerText.textContent = `Congratulations ${topProducts[0].productDetails?.Brand || "unknown Brand"} Brand`;
    bestSellerImage.src = `${topProducts[0].productDetails?.coverImage || "img/default.svg"}`;
    bestSellerRevenue.textContent = `₹${topProducts[0].totalRevenue || "Revenue is now Unavailable"}`;

    // Populate the table
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = ""; // Clear any existing rows

    topProducts.forEach(product => {
      const productRow = `
        <tr>
          <td class="py-4 text-sm text-gray-600 flex flex-row items-center text-left">
            <div class="w-8 h-8 overflow-hidden mr-3">
              <img src="${product.productDetails?.coverImage || 'img/default.svg'}" class="object-cover" alt="${product.productDetails?.productName || 'Product'}">
            </div>
            ${product.productDetails?.productName || 'Unknown Product'}
          </td>
          <td class="py-4 text-xs text-gray-600">₹ ${product.productDetails?.ListingPrice || 'N/A'}</td>
          <td class="py-4 text-xs text-gray-600">${product.totalQuantity || 0}</td>
          <td class="py-4 text-xs text-gray-600">₹ ${product.totalRevenue || 0}</td>
        </tr>
      `;
      tableBody.insertAdjacentHTML("beforeend", productRow);
    });
    
  } catch (error) {
    console.error("Error fetching top products:", error);
  } finally {
    // Hide loading indicator after data is loaded
    document.getElementById("loadingIndicator").style.display = "none";
  }
}

// Event listeners for time filter buttons
document.getElementById('weeklyFilter').addEventListener('click', function () {
  // Update button styles
  setActiveButton('weekly');
  getTopTenProducts('weekly');  // Get weekly data
});

document.getElementById('monthlyFilter').addEventListener('click', function () {
  // Update button styles
  setActiveButton('monthly');
  getTopTenProducts('monthly');  // Get monthly data
});

// Fetch and populate the products on page load with weekly filter as default
getTopTenProducts('weekly');

// Function to change active button styles
function setActiveButton(activeFilter) {
  const weeklyButton = document.getElementById('weeklyFilter');
  const monthlyButton = document.getElementById('monthlyFilter');
  
  // Remove active class from both buttons
  weeklyButton.classList.remove('btn-active');
  monthlyButton.classList.remove('btn-active');
  
  // Add active class to the clicked button
  if (activeFilter === 'weekly') {
    weeklyButton.classList.add('btn-active');
  } else {
    monthlyButton.classList.add('btn-active');
  }
}


  

async function getRecentOrders() {
    try {
        const response = await axios.get('/getRecentOrders'); // Fetch recent orders from API
        const recentOrders = response.data.data; // Extract the data array from the response

        const salesHistoryContainer = document.getElementById('sales-history-content');
        const orderHistory = recentOrders.slice(0,1)
        let count = 0
        orderHistory.forEach(order => {
            order.orderedItem.forEach(item => {
                if(count>3)return

                const orderHTML = `
                <div class="flex flex-row justify-between mb-3">
                    <div class="">
                        <h4 class="text-gray-600 font-thin">${item.productDetails?.productName}</h4>
                        <p class="text-gray-400 text-xs font-hairline">${'1 min ago'}</p>
                    </div>
                    <div class="text-sm font-medium">
                        <span class="${item.totalPrice.toFixed(2) > 0 ? 'text-green-400' : 'text-red-400'}">
                            ${item.totalPrice.toFixed(2) > 0 ? '+' : '-'}
                        </span>
                        <span>₹${Math.abs(item.totalPrice.toFixed(2))}</span>
                    </div>
                </div>
            `;
        
            salesHistoryContainer.innerHTML += orderHTML;
            })
        })
       
        
        const tableBody = document.getElementById('recent-orders'); // Select the table body
        tableBody.innerHTML = ''; // Clear any existing rows

        // Limit the number of orders displayed to the latest 5
        const latestOrders = recentOrders.slice(0, 5);

        latestOrders.forEach(order => {

            const statusClass = order.orderStatus === 'shipped' ? 'text-green-500' : 'text-red-500'; // Dynamic status color
            
            order.orderedItem.forEach(item => {

                
                // Create a new table row
                const row = `
                    <tr>
                        <!-- Customer -->
                        <th class="w-1/2 mb-4 text-xs font-extrabold tracking-wider flex flex-row items-center w-full">
                            <p class="ml-3">${item.userFirstName} ${item.userLastName}</p>
                        </th>
                        
                        <!-- Product -->
                        <th class="w-1/4 mb-4 text-xs font-extrabold tracking-wider text-right">${item.productDetails?.productName || 'Unknown Product'}</th>
                        
                        <!-- Invoice -->
                        <th class="w-1/4 mb-4 text-xs font-extrabold tracking-wider text-right">#${'invoice'}</th>
                        
                        <!-- Price -->
                        <th class="w-1/4 mb-4 text-xs font-extrabold tracking-wider text-right">₹${item.totalPrice.toFixed(2)}</th>
                        
                        <!-- Status -->
                        <th class="w-1/4 mb-4 text-xs font-extrabold tracking-wider text-right ${statusClass}">${order.orderStatus}</th>
                    </tr>
                `;

                tableBody.innerHTML += row; // Append the row to the table body
            });
        });
    } catch (error) {
        console.error('Error fetching recent orders:', error);
    }
}

// Call the function to fetch and display recent orders
getRecentOrders();



var donutChartOptions = {
  chart: {
      type: 'donut',
      height: 250
  },
  series: [],  // Will be dynamically updated with product revenue data
  labels: [],  // Will be dynamically updated with product categories or names
  plotOptions: {
      pie: {
          donut: {
              size: '65%',
              labels: {
                  show: true,
                  name: {
                      fontSize: '24px',
                      fontWeight: 'bold'
                  },
                  value: {
                      fontSize: '18px',
                      fontWeight: 'bold'
                  }
              }
          }
      }
  },
  responsive: [{
      breakpoint: 480,
      options: {
          chart: {
              width: '100%'
          },
          legend: {
              position: 'bottom'
          }
      }
  }]
};

async function updateChartsWithRealData() {
  try {
    const response = await axios.get('/getTopTenProducts'); // API call to fetch top products
    const topProducts = response.data.data;

    // Update the Detailed Line Chart
    const productNames = topProducts.map(product => product.productDetails?.productName || 'Unknown Product');
    const productRevenues = topProducts.map(product => product.totalRevenue || 0);
    


    // Update the Donut Chart
    donutChartOptions.series = productRevenues;  // Set revenue data to donut chart series
    donutChartOptions.labels = productNames;  // Set product names as labels in the donut chart

    const donutChart = new ApexCharts(document.querySelector("#extra-bars"), donutChartOptions);
    donutChart.render();

  } catch (error) {
    console.error("Error updating charts:", error);
  }
}

// Call the function to fetch and update the charts with real data
updateChartsWithRealData();
