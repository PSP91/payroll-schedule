// Generate payroll schedule data with filtering for paydays on or after one week ago from March 4, 2025
function generatePayrollSchedule() {
    const schedule = [];
    const currentDate = new Date('2025-03-04'); // Current date (March 4, 2025)
    const oneWeekAgo = new Date(currentDate);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // One week before March 4, 2025 (February 25, 2025)
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

        // Only include if Pay Date is on or after one week ago (February 25, 2025)
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

    // Add existing data from the table, but filter out old paydays (before February 25, 2025)
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

// Display schedule (unchanged)
function displaySchedule(schedule, start = 0, limit = 10) {
    const scheduleDiv = document.getElementById('schedule');
    scheduleDiv.innerHTML = '';

    const end = Math.min(start + limit, schedule.length);
    for (let i = start; i < end; i++) {
        const entry = schedule[i];
        scheduleDiv.innerHTML += `
            <div class="entry">
                Week Starting: <span class="week-starting">${entry.weekStarting}</span><br>
                Week Ending: <span class="week-ending">${entry.weekEnding}</span><br>
                Pay Date: <span class="pay-date">${entry.payDate}</span>
            </div>
        `;
    }

    const showMoreBtn = document.getElementById('showMore');
    if (end < schedule.length) {
        showMoreBtn.style.display = 'block';
    } else {
        showMoreBtn.style.display = 'none';
    }
}

// Theme toggle (unchanged)
document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    document.getElementById('themeToggle').textContent = isLight ? '🌙' : '💡'; // Moon for dark, lightbulb for light
});

// Show more button (unchanged)
document.getElementById('showMore').addEventListener('click', () => {
    let currentStart = parseInt(document.getElementById('schedule').dataset.start || 0);
    displaySchedule(schedule, currentStart + 10, 10);
    document.getElementById('schedule').dataset.start = currentStart + 10;
});

// Initialize
const schedule = generatePayrollSchedule();
displaySchedule(schedule, 0, 10);
