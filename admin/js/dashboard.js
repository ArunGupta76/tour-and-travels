/**
 * ADMIN DASHBOARD ANALYTICS & CHARTS (dashboard.js)
 */

let monthlyChartInstance = null;
let categoryChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
});

async function loadDashboardData() {
  try {
    const res = await adminApi('/api/admin/dashboard-stats');
    const data = await res.json();

    if (data.success && data.stats) {
      renderKpis(data.stats);
      renderCharts(data.charts);
      renderRecentBookings(data.recentBookings || []);
      renderRecentEnquiries(data.recentEnquiries || []);
    }
  } catch (err) {
    console.error('[Dashboard] Error fetching statistics:', err);
    showAdminToast('Failed to load dashboard metrics.', 'error');
  }
}

function renderKpis(stats) {
  document.getElementById('statTotalPackages').textContent = stats.totalPackages;
  document.getElementById('statPublishedPackages').textContent = `${stats.publishedPackages} Published`;
  document.getElementById('statActiveOffers').textContent = stats.activeOffers;
  document.getElementById('statTotalUsers').textContent = stats.totalUsers;

  document.getElementById('statTotalBookings').textContent = stats.totalBookings;
  document.getElementById('statPendingBookings').textContent = stats.pendingBookings;
  document.getElementById('statConfirmedBookings').textContent = stats.confirmedBookings;
  document.getElementById('statCancelledBookings').textContent = stats.cancelledBookings;

  document.getElementById('statConfirmedValue').textContent = formatCurrency(stats.confirmedBookingValue);
  document.getElementById('statReceivedRevenue').textContent = formatCurrency(stats.actualPaymentsReceived);
}

function renderCharts(chartData) {
  if (!chartData) return;

  // 1. Monthly Bookings & Revenue Bar / Line Chart
  const ctxMonthly = document.getElementById('monthlyBookingsCanvas')?.getContext('2d');
  if (ctxMonthly) {
    if (monthlyChartInstance) monthlyChartInstance.destroy();

    monthlyChartInstance = new Chart(ctxMonthly, {
      type: 'bar',
      data: {
        labels: chartData.monthlyLabels,
        datasets: [
          {
            label: 'Bookings Count',
            data: chartData.monthlyBookings,
            backgroundColor: '#0284C7',
            borderRadius: 6,
            yAxisID: 'y',
          },
          {
            label: 'Confirmed Revenue (₹)',
            data: chartData.monthlyRevenues,
            type: 'line',
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            position: 'left',
            title: { display: true, text: 'Bookings' },
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            title: { display: true, text: 'Revenue (₹)' },
          },
        },
      },
    });
  }

  // 2. Package Category Distribution Pie Chart
  const ctxCategory = document.getElementById('categoryDistributionCanvas')?.getContext('2d');
  if (ctxCategory) {
    if (categoryChartInstance) categoryChartInstance.destroy();

    categoryChartInstance = new Chart(ctxCategory, {
      type: 'doughnut',
      data: {
        labels: ['Domestic Packages', 'International Packages'],
        datasets: [
          {
            data: chartData.categoryDistribution,
            backgroundColor: ['#0284C7', '#06B6D4'],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }
}

function renderRecentBookings(bookings) {
  const tbody = document.getElementById('recentBookingsTbody');
  if (!tbody) return;

  if (bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No recent bookings found.</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings.map((b) => {
    const travelDate = new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const statusClass = b.bookingStatus === 'Confirmed' ? 'bg-success' : (b.bookingStatus === 'Pending' ? 'bg-warning text-dark' : 'bg-danger');

    return `
      <tr>
        <td class="font-monospace fw-bold text-primary">${b.bookingRef}</td>
        <td>${b.contactDetails?.name || 'Customer'}</td>
        <td>${b.packageSnapshot?.title || 'Tour'}</td>
        <td>${travelDate}</td>
        <td class="fw-bold">${formatCurrency(b.totalAmount)}</td>
        <td><span class="badge ${statusClass}">${b.bookingStatus}</span></td>
      </tr>
    `;
  }).join('');
}

function renderRecentEnquiries(enquiries) {
  const container = document.getElementById('recentEnquiriesList');
  if (!container) return;

  if (enquiries.length === 0) {
    container.innerHTML = `<p class="text-muted small text-center py-3">No recent enquiries.</p>`;
    return;
  }

  container.innerHTML = enquiries.map((enq) => {
    const dateFormatted = new Date(enq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const badgeClass = enq.status === 'New' ? 'bg-danger' : (enq.status === 'In Progress' ? 'bg-warning text-dark' : 'bg-success');

    return `
      <div class="p-3 border-bottom d-flex justify-content-between align-items-start">
        <div>
          <h6 class="fw-bold mb-1 text-primary">${enq.name}</h6>
          <p class="text-muted small mb-1">${enq.subject}</p>
          <span class="text-muted small"><i class="fa-solid fa-phone me-1"></i> ${enq.phone}</span>
        </div>
        <div class="text-end">
          <span class="badge ${badgeClass} mb-1">${enq.status}</span>
          <span class="text-muted small d-block">${dateFormatted}</span>
        </div>
      </div>
    `;
  }).join('');
}
