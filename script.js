// Generate payroll schedule data with dynamic filtering for paydays on or after 7 days ago
function generatePayrollSchedule() {
    const schedule = [];
    const currentDate = new Date(); // Use current system date
    const oneWeekAgo = new Date(currentDate);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // One week before the current date
    const endDate = new Date('2027-12-31');

    let currentDateIterator = new Date('2025-04-21'); // Last date from the table (Week Starting)
    currentDateIterator.setDate(currentDateIterator.getDate() + 7); // Move to next Monday

    while (currentDateIterator <= endDate) {
        // Week Starting (Monday)
        const weekStarting = new Date(currentDateIterator);
        
        // Week Ending (Sunday, 6 days later)
        const weekEnding = new Date(weekStarting);
        weekEnding.setDate(weekEnding.getDate() + 6);

        // Pay Date (Thursday, 14 days after Week Ending)
        const payDate = new Date(weekEnding);
        payDate.setDate(payDate.getDate() + 14);
        while (payDate.getDay() !== 4) { // Ensure Pay Date is Thursday
            payDate.setDate(payDate.getDate() + 1);
        }

        // Only include if Pay Date is on or after one week ago
        if (payDate >= oneWeekAgo) {
            schedule.push({
                weekStarting: weekStarting.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }),
                weekEnding: weekEnding.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }),
                payDate: payDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })
            });
        }

        // Move to next Monday
        currentDateIterator.setDate(currentDateIterator.getDate() + 7);
    }

    // Add existing data from the table, but filter out old paydays (before one week ago)
    const existingData = [
        { weekStarting: '18/11/2024', weekEnding: '01/12/2024', payDate: '12/12/2024' },
        { weekStarting: '02/12/2024', weekEnding: '15/12/2024', payDate: '24/12/2024' },
        { weekStarting: '16/12/2024', weekEnding: '29/12/2024', payDate: '09/01/2025' },
        { weekStarting: '30/12/2024', weekEnding: '12/01/2025', payDate: '23/01/2025' },
        { weekStarting: '13/01/2025', weekEnding: '26/01/2025', payDate: '06/02/2025' },
        { weekStarting: '27/01/2025', weekEnding: '09/02/2025', payDate: '20/02/2025' },
        { weekStarting: '10/02/2025', weekEnding: '23/02/2025', payDate: '06/03/2025' },
        { weekStarting: '24/02/2025', weekEnding: '09/03/2025', payDate: '20/03/2025' },
        { weekStarting: '10/03/2025', weekEnding: '23/03/2025', payDate: '03/04/2025' },
        { weekStarting: '24/03/2025', weekEnding: '06/04/2025', payDate: '17/04/2025' },
        { weekStarting: '07/04/2025', weekEnding: '20/04/2025', payDate: '01/05/2025' },
        { weekStarting: '21/04/2025', weekEnding: '04/05/2025', payDate: '15/05/2025' }
    ].filter(entry => {
        const payDate = new Date(entry.payDate.split('/').reverse().join('-')); // Convert DD/MM/YYYY to Date
        return payDate >= oneWeekAgo;
    });

    return [...existingData, ...schedule];
}

// Format date based on locale
function formatDate(dateStr, format = 'en-GB') {
    const date = new Date(dateStr.split('/').reverse().join('-'));
    return new Intl.DateTimeFormat(format).format(date);
}

// Display schedule with lazy loading
function displaySchedule(schedule, start = 0, limit = 10) {
    const scheduleDiv = document.getElementById('schedule');
    scheduleDiv.innerHTML = '';
    scheduleDiv.setAttribute('role', 'list');

    const end = Math.min(start + limit, schedule.length);
    const currentFormat = document.getElementById('dateFormat').value;

    for (let i = start; i < end; i++) {
        const entry = schedule[i];
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry';
        entryDiv.setAttribute('role', 'listitem');
        entryDiv.innerHTML = `
            Week Starting: <span class="week-starting">${formatDate(entry.weekStarting, currentFormat)}</span><br>
            Week Ending: <span class="week-ending">${formatDate(entry.weekEnding, currentFormat)}</span><br>
            Pay Date: <span class="pay-date">${formatDate(entry.payDate, currentFormat)}</span>
        `;
        if (i >= 10) entryDiv.classList.add('loading'); // Mark for lazy loading
        scheduleDiv.appendChild(entryDiv);
    }

    // Lazy load entries beyond the first 10
    if (start >= 10) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('loading');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        const loadingEntries = scheduleDiv.querySelectorAll('.loading');
        loadingEntries.forEach(entry => observer.observe(entry));
    }

    const showMoreBtn = document.getElementById('showMore');
    if (end < schedule.length) {
        showMoreBtn.style.display = 'block';
    } else {
        showMoreBtn.style.display = 'none';
    }
}

// Search and filter
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const currentFormat = document.getElementById('dateFormat').value;
    const filteredSchedule = schedule.filter(entry => 
        formatDate(entry.weekStarting, currentFormat).toLowerCase().includes(searchTerm) ||
        formatDate(entry.weekEnding, currentFormat).toLowerCase().includes(searchTerm) ||
        formatDate(entry.payDate, currentFormat).toLowerCase().includes(searchTerm)
    );
    displaySchedule(filteredSchedule, 0, 10);
    document.getElementById('schedule').dataset.start = 0;
});

// Date range picker
flatpickr("#startDate", { dateFormat: "d/m/Y" });
flatpickr("#endDate", { dateFormat: "d/m/Y" });

document.getElementById('startDate').addEventListener('change', filterByDateRange);
document.getElementById('endDate').addEventListener('change', filterByDateRange);

function filterByDateRange() {
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;
    const currentFormat = document.getElementById('dateFormat').value;
    if (start && end) {
        const startDate = new Date(start.split('/').reverse().join('-'));
        const endDate = new Date(end.split('/').reverse().join('-'));
        const filteredSchedule = schedule.filter(entry => {
            const payDate = new Date(entry.payDate.split('/').reverse().join('-'));
            return payDate >= startDate && payDate <= endDate;
        });
        displaySchedule(filteredSchedule, 0, 10);
        document.getElementById('schedule').dataset.start = 0;
    }
}

// Date format toggle
document.getElementById('dateFormat').addEventListener('change', () => {
    displaySchedule(schedule, 0, 10);
    document.getElementById('schedule').dataset.start = 0;
});

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    document.getElementById('themeToggle').textContent = isLight ? '🌙' : '💡'; // Moon for dark, lightbulb for light
});

// Notifications
document.getElementById('enableNotifications').addEventListener('click', () => {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                schedule.forEach(entry => {
                    const payDate = new Date(entry.payDate.split('/').reverse().join('-'));
                    const notifyDate = new Date(payDate);
                    notifyDate.setDate(notifyDate.getDate() - 3); // Notify 3 days before payday
                    const now = new Date();
                    if (notifyDate > now) {
                        setTimeout(() => {
                            new Notification('Upcoming Payday', {
                                body: `Payday on ${formatDate(entry.payDate, document.getElementById('dateFormat').value)} for week ${formatDate(entry.weekStarting, document.getElementById('dateFormat').value)} to ${formatDate(entry.weekEnding, document.getElementById('dateFormat').value)}`
                            });
                        }, notifyDate - now);
                    }
                });
            }
        });
    } else {
        alert('Notifications are not supported in this browser.');
    }
});

// Export to PDF
document.getElementById('exportPDF').addEventListener('click', () => {
    const element = document.getElementById('schedule');
    html2pdf().from(element).save('payroll_schedule.pdf');
});

// Export to CSV
document.getElementById('exportCSV').addEventListener('click', () => {
    const currentFormat = document.getElementById('dateFormat').value;
    const csv = [
        ['Week Starting', 'Week Ending', 'Pay Date'],
        ...schedule.map(entry => [
            formatDate(entry.weekStarting, currentFormat),
            formatDate(entry.weekEnding, currentFormat),
            formatDate(entry.payDate, currentFormat)
        ])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payroll_schedule.csv';
    a.click();
    window.URL.revokeObjectURL(url);
});

// Export to ICS (iCalendar)
document.getElementById('exportICS').addEventListener('click', () => {
    const currentFormat = document.getElementById('dateFormat').value;
    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\n';
    schedule.forEach(entry => {
        const payDate = new Date(entry.payDate.split('/').reverse().join('-'));
        const payDateStr = payDate.toISOString().split('T')[0].replace(/-/g, '');
        ics += `BEGIN:VEVENT\nDTSTART:${payDateStr}T090000Z\nSUMMARY:Payday - Week ${formatDate(entry.weekStarting, currentFormat)} to ${formatDate(entry.weekEnding, currentFormat)}\nDESCRIPTION:Week Starting: ${formatDate(entry.weekStarting, currentFormat)}\\nWeek Ending: ${formatDate(entry.weekEnding, currentFormat)}\nEND:VEVENT\n`;
    });
    ics += 'END:VCALENDAR';
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payroll_schedule.ics';
    a.click();
    window.URL.revokeObjectURL(url);
});

// Feedback
document.getElementById('feedback').addEventListener('click', () => {
    window.open('https://formspree.io/your-form-endpoint', '_blank');
    // Replace 'your-form-endpoint' with your Formspree or similar service endpoint
});

// Show more button with lazy loading
document.getElementById('showMore').addEventListener('click', () => {
    let currentStart = parseInt(document.getElementById('schedule').dataset.start || 0);
    displaySchedule(schedule, currentStart + 10, 10);
    document.getElementById('schedule').dataset.start = currentStart + 10;
});

// Initialize
const schedule = generatePayrollSchedule();
displaySchedule(schedule, 0, 10);
