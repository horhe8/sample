// Toggle Sidebar
document.getElementById('toggleSidebar').addEventListener('click', function () {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
});

// Navigation between Dashboard and Data Entry
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const page = this.getAttribute('data-page');

        // Hide all content
        document.querySelectorAll('.content').forEach(content => {
            content.style.display = 'none';
        });

        // Show the selected content
        document.getElementById(page).style.display = 'block';

        // Update navbar title
        document.querySelector('.navbar h1').textContent = page === 'dashboard' ? 'Dashboard' : 'Data Entry';
    });
});

// Chart.js for Sales Chart
const ctx = document.getElementById('salesChart').getContext('2d');
const salesChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Sales',
            data: [],
            backgroundColor: 'rgba(7, 85, 210, 0.42)',
            borderColor: 'rgba(17, 255, 255, 0.5)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Fetch and update chart data
function fetchSalesData() {
    fetch('/sales/data/')
        .then(response => response.json())
        .then(data => {
            salesChart.data.labels = data.labels;
            salesChart.data.datasets[0].data = data.data;
            salesChart.update();
        });
}

document.getElementById('salesForm').addEventListener('submit', function (e) {
    e.preventDefault();  // Prevent the default form submission

    // Get form data
    const date = document.getElementById('date').value;
    const sales = document.getElementById('sales').value;

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
            fetchSalesData();  // Refresh the chart
        } else {
            // Show error notification
            showNotification('Error submitting data.', 'error');
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

// Fetch data initially and every 5 seconds
fetchSalesData();
setInterval(fetchSalesData, 5000);