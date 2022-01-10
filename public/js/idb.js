// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'Tracking-Budgets' and set it to version 1
const request = indexedDB.open('Tracking-Budgets', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
     // save a reference to the database
    const db = event.target.result;
    // create an object store (table)... set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('pendingTransactions', { autoIncrement: true });
  };

request.onsuccess = function(event) {
    // save a reference to the database
    db = event.target.result;

    // check if app is online before reading from db
    if(navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
}

function saveRecord(record) {
    // create a transaction on the pendingTransactions object store
    const transaction = db.transaction(['pendingTransactions'], 'readwrite');
    // access your object store
    const store = transaction.objectStore('pendingTransactions');
    // add record to your store with add method.
    store.add(record);
}

function checkDatabase() {
    // open a transaction on your pendingTransactions store
    const transaction = db.transaction(['pendingTransactions'], 'readwrite');
    // access your pendingTransactions object store
    const store = transaction.objectStore('pendingTransactions');
    // get all records from store and set to a variable
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(() => {
                // if successful, open a transaction on your pendingTransactions store
                const transaction = db.transaction(['pendingTransactions'], 'readwrite');
                // access your pendingTransactions object store
                const store = transaction.objectStore('pendingTransactions');
                // clear all items in your store
                store.clear();
            });
        }
};   
}   // end checkDatabase

// listen for app coming back online
window.addEventListener('online', checkDatabase);