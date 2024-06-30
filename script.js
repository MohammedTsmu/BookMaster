document.addEventListener('DOMContentLoaded', loadItems);
document.getElementById('study-form').addEventListener('submit', addItem);
document.getElementById('toggle-mode').addEventListener('click', toggleNightMode);
document.getElementById('save-notes').addEventListener('click', saveNotes);

const dailyGoal = 60; // دقائق
const weeklyGoal = 420; // دقائق

function addItem(e) {
    e.preventDefault();

    const subject = document.getElementById('subject').value;
    const time = document.getElementById('time').value;

    const li = document.createElement('li');
    li.textContent = `${subject}: ${time} minutes`;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
        li.remove();
        removeFromStorage(subject, time);
        updateTotalTime();
        updateRewards();
        updateChallenges();
        updateMonthlyStats();
    });
    li.appendChild(deleteBtn);

    document.getElementById('study-list').appendChild(li);

    saveToStorage(subject, time);

    document.getElementById('study-form').reset();

    updateTotalTime();
    updateRewards();
    updateChallenges();
    updateMonthlyStats();
}

function saveToStorage(subject, time) {
    let items = JSON.parse(localStorage.getItem('studyItems')) || [];
    items.push({ subject, time, date: new Date() });
    localStorage.setItem('studyItems', JSON.stringify(items));
}

function loadItems() {
    let items = JSON.parse(localStorage.getItem('studyItems')) || [];

    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.subject}: ${item.time} minutes`;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            li.remove();
            removeFromStorage(item.subject, item.time);
            updateTotalTime();
            updateRewards();
            updateChallenges();
            updateMonthlyStats();
        });
        li.appendChild(deleteBtn);

        document.getElementById('study-list').appendChild(li);
    });

    updateTotalTime();
    updateRewards();
    updateChallenges();
    updateMonthlyStats();
    loadNightMode();
    loadNotes();
}

function removeFromStorage(subject, time) {
    let items = JSON.parse(localStorage.getItem('studyItems')) || [];
    items = items.filter(item => !(item.subject === subject && item.time == time));
    localStorage.setItem('studyItems', JSON.stringify(items));
}

function updateTotalTime() {
    let items = JSON.parse(localStorage.getItem('studyItems')) || [];
    const totalTime = items.reduce((sum, item) => sum + parseInt(item.time), 0);
    document.getElementById('total-time').textContent = totalTime;
}

function updateRewards() {
    let items = JSON.parse(localStorage.getItem('studyItems')) || [];
    const totalTime = items.reduce((sum, item) => sum + parseInt(item.time), 0);
    const rewards = Math.floor(totalTime / 60); // 1 نقطة لكل ساعة
    document.getElementById('rewards').textContent = rewards;
    checkAchievements(rewards);
}

function updateChallenges() {
    let items = JSON.parse(localStorage.getItem('studyItems')) || [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0];

    const dailyProgress = items
        .filter(item => item.date.split('T')[0] === today)
        .reduce((sum, item) => sum + parseInt(item.time), 0);
    const weeklyProgress = items
        .filter(item => item.date >= startOfWeek)
        .reduce((sum, item) => sum + parseInt(item.time), 0);

    document.getElementById('daily-progress').textContent = dailyProgress;
    document.getElementById('weekly-progress').textContent = weeklyProgress;

    checkChallenges(dailyProgress, weeklyProgress);
}

function checkChallenges(dailyProgress, weeklyProgress) {
    if (dailyProgress >= dailyGoal) {
        alert('Congratulations! You have achieved your daily goal!');
    }

    if (weeklyProgress >= weeklyGoal) {
        alert('Congratulations! You have achieved your weekly goal!');
    }
}

function checkAchievements(rewards) {
    let achievements = JSON.parse(localStorage.getItem('achievements')) || [];

    if (rewards >= 10 && !achievements.includes('10 Points')) {
        achievements.push('10 Points');
        alert('Achievement Unlocked: 10 Points!');
    }

    if (rewards >= 50 && !achievements.includes('50 Points')) {
        achievements.push('50 Points');
        alert('Achievement Unlocked: 50 Points!');
    }

    if (rewards >= 100 && !achievements.includes('100 Points')) {
        achievements.push('100 Points');
        alert('Achievement Unlocked: 100 Points!');
    }

    localStorage.setItem('achievements', JSON.stringify(achievements));
    displayAchievements(achievements);
}

function displayAchievements(achievements) {
    const achievementsList = document.getElementById('achievements-list');
    achievementsList.innerHTML = '';

    achievements.forEach(achievement => {
        const li = document.createElement('li');
        li.textContent = achievement;
        achievementsList.appendChild(li);
    });
}

function toggleNightMode() {
    document.body.classList.toggle('night-mode');
    const modeButton = document.getElementById('toggle-mode');
    if (document.body.classList.contains('night-mode')) {
        modeButton.textContent = 'Switch to Day Mode';
    } else {
        modeButton.textContent = 'Switch to Night Mode';
    }
    localStorage.setItem('nightMode', document.body.classList.contains('night-mode'));
}

function loadNightMode() {
    const nightMode = JSON.parse(localStorage.getItem('nightMode'));
    if (nightMode) {
        document.body.classList.add('night-mode');
        document.getElementById('toggle-mode').textContent = 'Switch to Day Mode';
    }
}

function saveNotes() {
    const notes = document.getElementById('book-notes').value;
    localStorage.setItem('bookNotes', notes);
    alert('Notes saved!');
}

function loadNotes() {
    const notes = localStorage.getItem('bookNotes');
    if (notes) {
        document.getElementById('book-notes').value = notes;
    }
}

function updateMonthlyStats() {
    let items = JSON.parse(localStorage.getItem('studyItems')) || [];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const monthlyTotalTime = items
        .filter(item => item.date >= startOfMonth)
        .reduce((sum, item) => sum + parseInt(item.time), 0);

    document.getElementById('monthly-total-time').textContent = monthlyTotalTime;
}

document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    if (document.getElementById('history')) {
        displayHistory();
    }
});

function displayHistory() {
    let items = JSON.parse(localStorage.getItem('studyItems')) || [];
    let history = document.getElementById('history');
    if (!history) return;

    let years = {};

    items.forEach(item => {
        let date = new Date(item.date);
        let year = date.getFullYear();
        let month = date.toLocaleString('default', { month: 'long' });
        let day = date.getDate();

        if (!years[year]) {
            years[year] = {};
        }

        if (!years[year][month]) {
            years[year][month] = {};
        }

        if (!years[year][month][day]) {
            years[year][month][day] = [];
        }

        years[year][month][day].push(item);
    });

    for (let year in years) {
        let yearDiv = document.createElement('div');
        yearDiv.className = 'history-year';
        let yearTitle = document.createElement('h3');
        yearTitle.textContent = year;
        yearTitle.addEventListener('click', () => {
            yearDiv.querySelector('ul').classList.toggle('hidden');
        });
        yearDiv.appendChild(yearTitle);

        let yearList = document.createElement('ul');
        yearDiv.appendChild(yearList);

        for (let month in years[year]) {
            let monthDiv = document.createElement('div');
            monthDiv.className = 'history-month';
            let monthTitle = document.createElement('h4');
            monthTitle.textContent = month;
            monthTitle.addEventListener('click', () => {
                monthDiv.querySelector('ul').classList.toggle('hidden');
            });
            monthDiv.appendChild(monthTitle);

            let monthList = document.createElement('ul');
            monthDiv.appendChild(monthList);

            for (let day in years[year][month]) {
                let dayDiv = document.createElement('div');
                dayDiv.className = 'history-day';
                let dayTitle = document.createElement('h5');
                dayTitle.textContent = day;
                dayTitle.addEventListener('click', () => {
                    dayDiv.querySelector('ul').classList.toggle('hidden');
                });
                dayDiv.appendChild(dayTitle);

                let dayList = document.createElement('ul');
                dayDiv.appendChild(dayList);

                years[year][month][day].forEach(item => {
                    let li = document.createElement('li');
                    li.textContent = `${item.subject}: ${item.time} minutes`;
                    dayList.appendChild(li);
                });

                monthList.appendChild(dayDiv);
            }

            yearList.appendChild(monthDiv);
        }

        history.appendChild(yearDiv);
    }
}

function toggleNightMode() {
    document.body.classList.toggle('night-mode');
    const modeButton = document.getElementById('toggle-mode');
    if (document.body.classList.contains('night-mode')) {
        modeButton.textContent = 'Switch to Day Mode';
    } else {
        modeButton.textContent = 'Switch to Night Mode';
    }
    localStorage.setItem('nightMode', document.body.classList.contains('night-mode'));
}

function loadNightMode() {
    const nightMode = JSON.parse(localStorage.getItem('nightMode'));
    if (nightMode) {
        document.body.classList.add('night-mode');
        document.getElementById('toggle-mode').textContent = 'Switch to Day Mode';
    }
}
