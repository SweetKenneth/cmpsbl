/**
 * PromptFluid Defense - Analytics Charts
 * Renders interactive charts using Chart.js
 */

(function($) {
    'use strict';

    const PFDefAnalytics = {
        charts: {},

        /**
         * Initialize analytics charts
         */
        init: function() {
            this.loadChartJS();
            this.initPeriodSelector();
            this.loadCharts('7d');
        },

        /**
         * Load Chart.js library
         */
        loadChartJS: function() {
            if (typeof Chart === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
                script.onload = () => this.loadCharts('7d');
                document.head.appendChild(script);
            }
        },

        /**
         * Initialize period selector
         */
        initPeriodSelector: function() {
            $('.pfdef-period-selector').on('change', (e) => {
                const period = $(e.target).val();
                this.loadCharts(period);
            });
        },

        /**
         * Load all charts
         */
        loadCharts: function(period) {
            this.loadDetectionTrends(period);
            this.loadActionDistribution(period);
            this.loadTopIPs(period);
            this.loadThreatTypes(period);
        },

        /**
         * Load detection trends chart
         */
        loadDetectionTrends: function(period) {
            $.ajax({
                url: pfdefAnalytics.apiUrl + 'trends',
                method: 'GET',
                data: { period: period },
                headers: {
                    'X-WP-Nonce': pfdefAnalytics.nonce
                },
                success: (data) => {
                    this.renderTrendsChart(data);
                }
            });
        },

        /**
         * Render trends chart
         */
        renderTrendsChart: function(data) {
            const ctx = document.getElementById('pfdef-trends-chart');
            if (!ctx) return;

            // Destroy existing chart
            if (this.charts.trends) {
                this.charts.trends.destroy();
            }

            this.charts.trends = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(d => d.time_period),
                    datasets: [
                        {
                            label: 'Blocked',
                            data: data.map(d => d.blocked),
                            borderColor: '#e74c3c',
                            backgroundColor: 'rgba(231, 76, 60, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Challenged',
                            data: data.map(d => d.challenged),
                            borderColor: '#f39c12',
                            backgroundColor: 'rgba(243, 156, 18, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Allowed',
                            data: data.map(d => d.allowed),
                            borderColor: '#27ae60',
                            backgroundColor: 'rgba(39, 174, 96, 0.1)',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Detection Trends'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        },

        /**
         * Load action distribution chart
         */
        loadActionDistribution: function(period) {
            $.ajax({
                url: pfdefAnalytics.apiUrl + 'distribution',
                method: 'GET',
                data: { period: period },
                headers: {
                    'X-WP-Nonce': pfdefAnalytics.nonce
                },
                success: (data) => {
                    this.renderDistributionChart(data);
                }
            });
        },

        /**
         * Render distribution chart
         */
        renderDistributionChart: function(data) {
            const ctx = document.getElementById('pfdef-distribution-chart');
            if (!ctx) return;

            if (this.charts.distribution) {
                this.charts.distribution.destroy();
            }

            this.charts.distribution = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.map(d => d.action_taken.charAt(0).toUpperCase() + d.action_taken.slice(1)),
                    datasets: [{
                        data: data.map(d => d.count),
                        backgroundColor: [
                            '#e74c3c',
                            '#f39c12',
                            '#27ae60'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                        },
                        title: {
                            display: true,
                            text: 'Action Distribution'
                        }
                    }
                }
            });
        },

        /**
         * Load top IPs table
         */
        loadTopIPs: function(period) {
            $.ajax({
                url: pfdefAnalytics.apiUrl + 'top-ips',
                method: 'GET',
                data: { period: period, limit: 10 },
                headers: {
                    'X-WP-Nonce': pfdefAnalytics.nonce
                },
                success: (data) => {
                    this.renderTopIPsTable(data);
                }
            });
        },

        /**
         * Render top IPs table
         */
        renderTopIPsTable: function(data) {
            const tbody = $('#pfdef-top-ips-table tbody');
            tbody.empty();

            if (data.length === 0) {
                tbody.append('<tr><td colspan="5" class="no-data">No data available</td></tr>');
                return;
            }

            data.forEach((ip, index) => {
                const row = `
                    <tr>
                        <td>${index + 1}</td>
                        <td><code>${ip.ip}</code></td>
                        <td>${ip.total_requests}</td>
                        <td>${parseFloat(ip.avg_threat_score).toFixed(1)}</td>
                        <td>${ip.blocked_count}</td>
                    </tr>
                `;
                tbody.append(row);
            });
        },

        /**
         * Load threat types chart
         */
        loadThreatTypes: function(period) {
            $.ajax({
                url: pfdefAnalytics.apiUrl + 'threat-types',
                method: 'GET',
                data: { period: period },
                headers: {
                    'X-WP-Nonce': pfdefAnalytics.nonce
                },
                success: (data) => {
                    this.renderThreatTypesChart(data);
                }
            });
        },

        /**
         * Render threat types chart
         */
        renderThreatTypesChart: function(data) {
            const ctx = document.getElementById('pfdef-threat-types-chart');
            if (!ctx) return;

            if (this.charts.threatTypes) {
                this.charts.threatTypes.destroy();
            }

            this.charts.threatTypes = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(d => d.threat_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
                    datasets: [{
                        label: 'Count',
                        data: data.map(d => d.count),
                        backgroundColor: '#7A5FFF'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Threat Types'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        },

        /**
         * Export to CSV
         */
        exportCSV: function(period) {
            window.location.href = `${pfdefAnalytics.adminUrl}?action=pfdef_export_csv&period=${period}&_wpnonce=${pfdefAnalytics.nonce}`;
        }
    };

    // Initialize when document is ready
    $(document).ready(function() {
        if ($('#pfdef-analytics-page').length) {
            PFDefAnalytics.init();
        }

        // Export CSV button
        $('#pfdef-export-csv').on('click', function() {
            const period = $('.pfdef-period-selector').val();
            PFDefAnalytics.exportCSV(period);
        });
    });

    // Make available globally
    window.PFDefAnalytics = PFDefAnalytics;

})(jQuery);
