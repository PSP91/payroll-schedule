// Generate payroll schedule data with dynamic filtering for paydays on or after 7 days ago
function generatePayrollSchedule() {
    const schedule = [];
    const currentDate = new Date(); // Current system date (May 27, 2025)
    const oneWeekAgo = new Date(currentDate);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // One week before the current date (May 20, 2025)
    const endDate = new Date('2027-12-31');

    // Start from the last known Week Starting (April 21, 2025) and move forward biweekly
    let currentWeekStarting = new Date('2025-04-21'); // Last Week Starting from the table
    currentWeekStarting.setDate(currentWeekStarting.getDate() + 14); // Move to next Week Starting (May 5, 2025)

    while (currentWeekStarting <= endDate) {
        // Ensure Week Starting is a Monday
        while (currentWeekStarting.getDay() !== 1) {
            currentWeekStarting.setDate(currentWeekStarting.getDate() + 1);
        }

        // Week Ending (Sunday, 13 days after Week Starting)
        const weekEnding = new Date(currentWeekStarting);
        weekEnding.setDate(weekEnding.getDate() + 13);
        while (weekEnding.getDay() !== 0) { // Ensure Week Ending is Sunday
            weekEnding.setDate(weekEnding.getDate() - 1);
        }

        // Pay Date (Thursday, 11 days after Week Ending)
        const payDate = new Date(weekEnding);
        payDate.setDate(payDate.getDate() + 11);
        while (payDate.getDay() !== 4) { // Ensure Pay Date is Thursday
            payDate.setDate(payDate.getDate() + 1);
        }

        // Only include if Pay Date is on or after one week ago
        if (payDate >= oneWeekAgo) {
            schedule.push({
                weekStarting: currentWeekStarting.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }),
                weekEnding: weekEnding.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }),
                payDate: payDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }),
                payDateObj: new Date(payDate) // Store for sorting
            });
        }

        // Move to next Week Starting (biweekly)
        currentWeekStarting.setDate(currentWeekStarting.getDate() + 14);
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
    ].map(entry => ({
        ...entry,
        payDateObj: new Date(entry.payDate.split('/').reverse().join('-')) // Add Date object for filtering and sorting
    })).filter(entry => entry.payDateObj >= oneWeekAgo);

    // Combine and sort by Pay Date
    const combinedSchedule = [...existingData, ...schedule].sort((a, b) => a.payDateObj - b.payDateObj);

    // Remove payDateObj from final output to keep display clean
    return combinedSchedule.map(({ weekStarting, weekEnding, payDate }) => ({
        weekStarting,
        weekEnding,
        payDate
    }));
}

// Display schedule with pagination
function displaySchedule(schedule, page = 1) {
    const scheduleDiv = document.getElementById('schedule');
    scheduleDiv.innerHTML = '';

    const limit = 10;
    const start = (page - 1) * limit;
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

    // Update pagination
    updatePagination(schedule, page);
}

// Update pagination controls
function updatePagination(schedule, currentPage) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    const totalPages = Math.ceil(schedule.length / 10);
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => {
            displaySchedule(schedule, i);
        });
        if (i === currentPage) {
            button.classList.add('current-page');
        }
        paginationDiv.appendChild(button);
    }
}

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    document.getElementById('themeToggle').textContent = isLight ? '🌙' : '💡'; // Moon for dark, lightbulb for light
});

// Initialize
const schedule = generatePayrollSchedule();
displaySchedule(schedule, 1);
