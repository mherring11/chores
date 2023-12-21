document.addEventListener('DOMContentLoaded', () => {
  const choreForm = document.getElementById('chore-form');
  const choreInput = document.getElementById('chore-input');
  const choreAmountInput = document.getElementById('chore-amount-input');
  const assignedToInput = document.getElementById('assigned-to-input');
  const dayOfWeekInput = document.getElementById('day-of-week-input');
  const clearAllBtn = document.querySelector('.clear-all-btn');
  const toDoAddBtn = document.getElementById('add-to-do-btn');
  const newToDoInput = document.getElementById('new-to-do-input');

  let chores = JSON.parse(localStorage.getItem('chores')) || {};
  let allowances = JSON.parse(localStorage.getItem('allowances')) || {
      Bella: 0,
      Tiana: 0,
      MJ: 0
  };
  let toDoList = JSON.parse(localStorage.getItem('toDoList')) || [];

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

      chores[assignedTo][dayOfWeek].push({ chore, amount, done: false });

      if (assignedTo in allowances) {
          allowances[assignedTo] += amount;
      }

      saveChores();
      updateChoreChartDisplay();
      updateAllowances();
  });

  clearAllBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all chores? This action cannot be undone.')) {
          chores = {};
          for (let person in allowances) {
              allowances[person] = 0;
          }
          saveChores();
          updateChoreChartDisplay();
          updateAllowances();
      }
  });

  toDoAddBtn.addEventListener('click', () => {
      const task = newToDoInput.value.trim();
      if (task) {
          toDoList.push(task);
          newToDoInput.value = '';
          saveToDoList();
          updateToDoListDisplay();
      } else {
          alert('Please enter a task.');
      }
  });

  function saveChores() {
      localStorage.setItem('chores', JSON.stringify(chores));
      localStorage.setItem('allowances', JSON.stringify(allowances));
  }

  function saveToDoList() {
      localStorage.setItem('toDoList', JSON.stringify(toDoList));
  }

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
                      choreCell.innerHTML = '';
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
                  doneButton.onclick = () => toggleChoreDone(person, dayOfWeek, index);
                  choreDiv.appendChild(doneButton);

                  const editButton = document.createElement('button');
                  editButton.textContent = 'Edit';
                  editButton.onclick = () => editChore(person, dayOfWeek, index);
                  choreDiv.appendChild(editButton);

                  choreCell.appendChild(choreDiv);
              });
          });
      });
  }

  function updateAllowances() {
      for (let person in allowances) {
          const allowanceElement = document.getElementById(`allowance-${person.toLowerCase()}-value`);
          if (allowanceElement) {
              allowanceElement.textContent = `${allowances[person].toFixed(2)}`;
          }
      }
  }

  function updateToDoListDisplay() {
      const toDoListContainer = document.getElementById('to-do-list');
      toDoListContainer.innerHTML = '';

      toDoList.forEach((item, index) => {
          const toDoItem = document.createElement('div');
          toDoItem.textContent = `${index + 1}) ${item}`;

          const removeBtn = document.createElement('button');
          removeBtn.textContent = 'Remove';
          removeBtn.onclick = () => {
              toDoList.splice(index, 1);
              saveToDoList();
              updateToDoListDisplay();
          };
          toDoItem.appendChild(removeBtn);

          toDoListContainer.appendChild(toDoItem);
      });
  }

  window.toggleChoreDone = function(person, dayOfWeek, choreIndex) {
      const choreItem = chores[person][dayOfWeek][choreIndex];
      choreItem.done = !choreItem.done;
      if (choreItem.done) {
          allowances[person] -= choreItem.amount;
      } else {
          allowances[person] += choreItem.amount;
      }
      saveChores();
      updateChoreChartDisplay();
      updateAllowances();
  };

  window.editChore = function(person, dayOfWeek, choreIndex) {
      const choreItem = chores[person][dayOfWeek][choreIndex];
      const newChore = prompt('Edit your chore:', choreItem.chore);
      if (newChore !== null && newChore.trim() !== '') {
          choreItem.chore = newChore.trim();
          const newAmount = prompt('Edit the amount:', choreItem.amount);
          if (newAmount !== null && !isNaN(newAmount)) {
              choreItem.amount = parseFloat(newAmount);
          }
          saveChores();
          updateChoreChartDisplay();
      }
  };

  updateChoreChartDisplay();
  updateAllowances();
  updateToDoListDisplay();
});
