// ER App: Chart initialization (Chart.js)
// --- Chart Logic ---
function initCharts(sectionId) {
    Chart.defaults.font.family = "'Pretendard', sans-serif";
    Chart.defaults.color = '#9CA3AF';

    const renderImpactChart = () => {
        const impactCtx = document.getElementById('impactChart');
        if (!impactCtx) return;

        new Chart(impactCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: contentData.stats.labels,
                datasets: [{
                    label: '케이스 분포 (%)',
                    data: contentData.stats.data,
                    backgroundColor: '#BFA68A',
                    borderRadius: 4,
                    barThickness: 20
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { display: false }, ticks: { display: false } },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
            }
        });
    };
    
    if (sectionId === 'home') {
        const ctx = document.getElementById('heroChart');
        if(!ctx) return;
        const typeColors = [
            'rgba(95, 155, 115, 0.92)',   // 1
            'rgba(200, 130, 150, 0.92)',  // 2
            'rgba(205, 160, 95, 0.92)',   // 3
            'rgba(135, 110, 175, 0.92)',  // 4
            'rgba(95, 135, 180, 0.92)',   // 5
            'rgba(95, 160, 165, 0.92)',   // 6
            'rgba(225, 165, 135, 0.92)',  // 7
            'rgba(170, 100, 85, 0.92)',   // 8
            'rgba(180, 155, 125, 0.92)'   // 9
        ];
        
        new Chart(ctx.getContext('2d'), {
            type: 'polarArea',
            data: {
                labels: contentData.types.labels,
                datasets: [{ 
                    data: contentData.types.data, 
                    backgroundColor: typeColors,
                    borderWidth: 2.5,
                    borderColor: '#fdf7f1',
                    hoverOffset: 4
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                layout: { padding: 10 },
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(44, 42, 41, 0.9)',
                        padding: 10,
                        cornerRadius: 8,
                        titleFont: { size: 12 },
                        bodyFont: { size: 10 },
                        callbacks: {
                            title: (items) => items[0].label,
                            label: () => ''
                        }
                    }
                }, 
                scales: { 
                    r: { 
                        ticks: { display: false }, 
                        grid: { color: '#f3f4f6', lineWidth: 1 },
                        pointLabels: { display: false } 
                    } 
                } 
            }
        });
        const legendEl = document.getElementById('hero-chart-labels');
        if (legendEl) {
            legendEl.innerHTML = contentData.types.labels.map((label, index) => `
                <div class="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/85 px-2 py-1 text-gray-600 shadow-sm">
                    <span class="inline-block w-2 h-2 rounded-full" style="background:${typeColors[index]};"></span>
                    <span class="font-medium">${label}</span>
                </div>
            `).join('');
        }
        renderImpactChart();
    } else if (sectionId === 'community') {
        renderImpactChart();
    }
}

