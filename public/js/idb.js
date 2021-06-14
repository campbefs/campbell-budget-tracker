// INDEXED_DB

let db;

const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {

    uploadTransaction();
  }
};

request.onerror = function(event) {
  console.log(event.target.errorCode);
}

function saveRecord(record) {
  const transaction = db.transaction(['new_transaction'], 'readwrite');

  console.log('save record: ', transaction);

  const transObjectStore = transaction.objectStore('new_transaction');

  transObjectStore.add(record);
}

function uploadTransaction() {
  const transaction = db.transaction(['new_transaction'], 'readwrite');

  const transObjectStore = transaction.objectStore('new_transaction');

  const getAll = transObjectStore.getAll();
  console.log('getAll: ', getAll);
  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {

      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(['new_transaction'], 'readwrite');
          const transObjectStore = transaction.objectStore('new_transaction');
          // clear all items in your store
          transObjectStore.clear();
        })
        .catch(err => {
          // set reference to redirect back here
          console.log(err);
        });

    }
  }
}

// listen for app coming back online
window.addEventListener('online', uploadTransaction);
