document.addEventListener('DOMContentLoaded', () => {
  const choreForm = document.getElementById('chore-form');
  const choreInput = document.getElementById('chore-input');
  const choreAmountInput = document.getElementById('chore-amount-input');
  const assignedToInput = document.getElementById('assigned-to-input');
  const dayOfWeekInput = document.getElementById('day-of-week-input');
  const clearAllBtn = document.querySelector('.clear-all-btn');

  let chores = JSON.parse(localStorage.getItem('chores')) || {};
  let allowances = JSON.parse(localStorage.getItem('allowances')) || {
    Bella: 0,
    Tiana: 0,
    MJ: 0
  };

  choreForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const chore = choreInput.value.trim();
    const amount = parseFloat(choreAmountInput.value) || 0;
    const assignedTo = assignedToInput.value;
    const dayOfWeek = dayOfWeekInput.value;

    if (!chore || !assignedTo || !dayOfWeek) {
      alert('Please fill in all fields.');
      return;
    }

    if (!chores[assignedTo]) {
      chores[assignedTo] = {};
    }
    if (!chores[assignedTo][dayOfWeek]) {
      chores[assignedTo][dayOfWeek] = [];
    }

    chores[assignedTo][dayOfWeek].push({ chore: chore, amount: amount, done: false });

    if (assignedTo in allowances) {
      allowances[assignedTo] += amount;
      localStorage.setItem('allowances', JSON.stringify(allowances));
      document.getElementById(`allowance-${assignedTo.toLowerCase()}-value`).textContent = allowances[assignedTo].toFixed(2);
    }

    localStorage.setItem('chores', JSON.stringify(chores));

    choreInput.value = '';
    choreAmountInput.value = '';
    assignedToInput.selectedIndex = 0;
    dayOfWeekInput.selectedIndex = 0;

    updateChoreChartDisplay();
  });

  function updateChoreChartDisplay() {
    document.querySelectorAll('.chore-entry').forEach(entry => entry.remove());

    Object.keys(chores).forEach(person => {
      Object.keys(chores[person]).forEach(dayOfWeek => {
        let firstEntry = true;
        chores[person][dayOfWeek].forEach((choreItem, index) => {
          const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(dayOfWeek);
          const personRow = document.getElementById(`row-for-${person.toLowerCase()}`);
          if (!personRow) {
            console.error('No row found for person:', person);
            return;
          }

          const choreCell = personRow.children[dayIndex + 1];
          if (firstEntry) {
            choreCell.innerHTML = ''; // Clear the cell
            firstEntry = false;
          }

          const choreDiv = document.createElement('div');
          choreDiv.className = 'chore-entry';

          const choreTextSpan = document.createElement('span');
          choreTextSpan.className = 'chore-text';
          choreTextSpan.textContent = choreItem.chore;
          if (choreItem.done) {
            choreTextSpan.classList.add('chore-done');
          }
          choreDiv.appendChild(choreTextSpan);

          if (!choreItem.done) {
            const choreAmountSpan = document.createElement('span');
            choreAmountSpan.textContent = ` ($${choreItem.amount.toFixed(2)})`;
            choreDiv.appendChild(choreAmountSpan);
          }

          const doneButton = document.createElement('button');
          doneButton.textContent = choreItem.done ? 'Undo' : 'Done';
          doneButton.addEventListener('click', function() {
            toggleChoreDone(person, dayOfWeek, index);
          });
          choreDiv.appendChild(doneButton);

          const editButton = document.createElement('button');
          editButton.textContent = 'Edit';
          editButton.addEventListener('click', function() {
            editChore(person, dayOfWeek, index);
          });
          choreDiv.appendChild(editButton);

          choreCell.appendChild(choreDiv);
        });
      });
    });
  }

  window.toggleChoreDone = function(person, dayOfWeek, choreIndex) {
    const choreItem = chores[person][dayOfWeek][choreIndex];
    choreItem.done = !choreItem.done;
    localStorage.setItem('chores', JSON.stringify(chores));
    updateChoreChartDisplay();
  };

  window.editChore = function(person, dayOfWeek, choreIndex) {
    const choreItem = chores[person][dayOfWeek][choreIndex];
    const newChore = prompt('Edit your chore:', choreItem.chore);
    if (newChore !== null && newChore.trim() !== '') {
      choreItem.chore = newChore.trim();
      // Prompt to edit the amount as well
      const newAmount = prompt('Edit the amount:', choreItem.amount);
      if (newAmount !== null && !isNaN(newAmount)) {
        choreItem.amount = parseFloat(newAmount);
      }
      localStorage.setItem('chores', JSON.stringify(chores));
      updateChoreChartDisplay();
    }
  };

  clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all chores? This action cannot be undone.')) {
      chores = {};
      Object.keys(allowances).forEach(name => {
        allowances[name] = 0;
      });
      localStorage.setItem('chores', JSON.stringify(chores));
      localStorage.setItem('allowances', JSON.stringify(allowances));
      updateChoreChartDisplay();
      updateAllowanceDisplay();
    }
  });

  function updateAllowanceDisplay() {
    Object.keys(allowances).forEach(name => {
      const allowanceElement = document.getElementById(`allowance-${name.toLowerCase()}-value`);
      if (allowanceElement) {
        allowanceElement.textContent = allowances[name].toFixed(2);
      }
    });
  }

  updateChoreChartDisplay();
  updateAllowanceDisplay();
});
