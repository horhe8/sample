function updateTimeDate() {
    // Get the current time in Dublin, Ireland
    const now = new Date();

    // Convert to Dublin Time (Ireland Time)
    const options = {
        timeZone: "Europe/Dublin",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true // Ensures AM/PM format
    };

    // Format the date and time in Dublin timezone
    const formatter = new Intl.DateTimeFormat("en-US", options);
    const formattedDateTime = formatter.formatToParts(now);

    // Extract the necessary parts
    let weekday = "",
        month = "",
        day = "",
        year = "",
        hour = "",
        minute = "",
        second = "",
        ampm = "";

    formattedDateTime.forEach(({ type, value }) => {
        if (type === "weekday") weekday = value;
        if (type === "month") month = value;
        if (type === "day") day = value;
        if (type === "year") year = value;
        if (type === "hour") hour = value;
        if (type === "minute") minute = value;
        if (type === "second") second = value;
        if (type === "dayPeriod") ampm = value.toUpperCase(); // Convert AM/PM to uppercase
    });

    // Construct final formatted date-time string
    const finalDateTime = ` ${weekday} | ${month} ${day}, ${year} at ${hour}:${minute}:${second} ${ampm}`;

    // Update the HTML element
    document.getElementById("time-date").textContent = finalDateTime;
}

// Update time and date every second
setInterval(updateTimeDate, 1000);

// Initial call to display time and date immediately
updateTimeDate();






document.addEventListener('DOMContentLoaded', function () {
    const salesTableBody = document.getElementById('salesTableBody');
    const filterDate = document.getElementById('filterDate');

    // Function to fetch sales data from Django
    async function fetchSalesData(selectedDate = null) {
        try {
            let url = '/fetch-sales-data/';
            if (selectedDate) {
                url += `?date=${selectedDate}`;  // Add the selected date as a query parameter
            }

            const response = await fetch(url);  // Fetch data from Django view
            if (!response.ok) {
                throw new Error('Failed to fetch sales data');
            }
            const data = await response.json();
            renderSalesTable(data);
        } catch (error) {
            console.error('Error fetching sales data:', error);
        }
    }

    // Function to render the sales table
    function renderSalesTable(data) {
        salesTableBody.innerHTML = '';
        data.forEach(sale => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${sale.date}</td>
                <td class="px-6 py-4 whitespace-nowrap">${sale.sales}</td>
                <td class="px-6 py-4 whitespace-nowrap">${sale.submission_time}</td> 
                <td class="px-6 py-4 whitespace-nowrap">
                    <button onclick="editSale(${sale.id})" class="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Edit</button>
                    <button onclick="deleteSale(${sale.id})" class="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ml-2">Delete</button>
                </td>
            `;
            salesTableBody.appendChild(row);
        });
    }

    // Function to filter sales by date
    filterDate.addEventListener('change', function () {
        const selectedDate = filterDate.value;
        fetchSalesData(selectedDate);  // Fetch data for the selected date
    });

    // Function to delete a sale
    window.deleteSale = async function (id) {
        if (confirm('Are you sure you want to delete this sale?')) {
            try {
                const response = await fetch(`/delete-sale/${id}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': '{{ csrf_token }}',  // Add CSRF token for Django
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to delete sale');
                }
                fetchSalesData(filterDate.value);  // Refresh the table after deletion
            } catch (error) {
                console.error('Error deleting sale:', error);
            }
        }
    };

    // Function to edit a sale
    window.editSale = async function (id) {
        const newSalesAmount = prompt('Enter the new sales amount:');
        if (newSalesAmount !== null) {
            try {
                const response = await fetch(`/edit-sale/${id}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': '{{ csrf_token }}',  // Add CSRF token for Django
                    },
                    body: JSON.stringify({ sales: newSalesAmount }),
                });
                if (!response.ok) {
                    throw new Error('Failed to edit sale');
                }
                fetchSalesData(filterDate.value);  // Refresh the table after editing
            } catch (error) {
                console.error('Error editing sale:', error);
            }
        }
    };

    // Initial fetch and render
    fetchSalesData();
});





// Hide notifications after 3 seconds
document.addEventListener('DOMContentLoaded', function () {
    const notification = document.getElementById('login-notification'); // Use getElementById for ID
    if (notification) {  // Check if the notification exists
        setTimeout(() => {
            notification.style.display = 'none';  // Hide the notification
        }, 3000);  // 3 seconds
    }
});




document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleSidebar');

    toggleButton.addEventListener('click', function () {
        // Toggle sidebar width only on mobile screens
        if (window.innerWidth < 768) { // 768px is the default breakpoint for `md` in Tailwind
            sidebar.classList.toggle('w-64'); // Expanded width
            sidebar.classList.toggle('w-16'); // Collapsed width
        }
    });

    // Optional: Automatically collapse the sidebar on mobile screens when the page loads
    if (window.innerWidth < 768) {
        sidebar.classList.remove('w-64');
        sidebar.classList.add('w-16');
    }
});




// Navigation between Dashboard and Data Entry
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();  // Prevent default link behavior
        const page = this.getAttribute('data-page');  // Get the data-page value

        // Hide all content
        document.querySelectorAll('.content').forEach(content => {
            content.style.display = 'none';
        });

        // Show the selected content
        document.getElementById(page).style.display = 'block';

        // Update navbar title (optional)
        document.querySelector('.navbar h1').textContent = page === 'dashboard' ? 'Dashboard' : 'Data Entry';
    });
});

function formatSalesInput(input) {
    let value = input.value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters except '.'
    
    if (value) {
        // Convert to float and format with commas and two decimal places
        let formattedValue = parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        input.value = formattedValue;
    }
}




// Chart.js for Sales Chart
const ctx = document.getElementById('salesChart').getContext('2d');

// Create a gradient for the bars
const gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, 'rgba(255, 165, 0, 0.8)'); // Peach/Orange
gradient.addColorStop(1, 'rgba(255, 99, 71, 0.8)'); // Coral

const salesChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [], // Add your labels here
        datasets: [{
            label: 'Sales',
            data: [], // Add your data here
            backgroundColor: gradient, // Use the gradient for the bars
            borderColor: 'rgba(255, 99, 71, 1)', // Coral border color
            borderWidth: 1,
            borderRadius: 10, // Rounded corners for bars
            hoverBackgroundColor: 'rgba(255, 140, 0, 0.8)', // Darker orange on hover
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#333', // Legend text color
                    font: {
                        size: 14,
                        weight: 'bold',
                    }
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 99, 71, 1)',
                borderWidth: 1,
                cornerRadius: 5,
                padding: 10,
            }
        },
        scales: {
            x: {
                grid: {
                    display: false, // Hide x-axis grid lines
                },
                ticks: {
                    color: '#333', // X-axis tick color
                    font: {
                        size: 12,
                        weight: 'bold',
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)', // Light grid lines for y-axis
                },
                ticks: {
                    color: '#333', // Y-axis tick color
                    font: {
                        size: 12,
                        weight: 'bold',
                    }
                }
            }
        }
    }
});

// Function to format date as "YYYY-MMM-D"
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'short' }); // Abbreviated month name (e.g., Jan)
    const day = date.getDate();
    return `${year}-${month}-${day}`;
}

// Fetch and update chart data
function fetchSalesData() {
    fetch('/sales/data/')
        .then(response => response.json())
        .then(data => {
            salesChart.data.labels = data.labels.map(formatDate);
            salesChart.data.datasets[0].data = data.data;
            salesChart.update();
        });
}




document.getElementById('salesForm').addEventListener('submit', function (e) {
    e.preventDefault();  // Prevent the default form submission

    // Get form data
    const date = document.getElementById('date').value;
    const sales = parseFloat(document.getElementById('sales').value);  // Ensure sales is a number

    // Validate the data
    if (!date || isNaN(sales)) {
        showNotification('Invalid date or sales value.', 'error');
        return;
    }

    // Send data to the server
    fetch('/sales/add/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': '{{ csrf_token }}'  // Add CSRF token for Django
        },
        body: JSON.stringify({ date, sales })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success notification
            showNotification('Data submitted successfully!', 'success');
            fetchSalesData();  // Refresh the table with the latest data

            // Clear the form fields
            document.getElementById('date').value = '';
            document.getElementById('sales').value = '';
        } else {
            // Show error notification
            showNotification(data.error || 'Error submitting data.', 'error');
        }
    })
    .catch(error => {
        // Show error notification
        showNotification('Network error. Please try again.', 'error');
    });
});






// Function to show notifications
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add notification to the page
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}




// Fetch data initially and every 3 seconds
fetchSalesData();
setInterval(fetchSalesData, 3000);