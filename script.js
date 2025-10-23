// Note: This script assumes your Node.js/Express server is running 
// and listening for POST requests at the /api/execute-query endpoint.
        
document.getElementById('executeBtn').addEventListener('click', executeCustomQuery);

/**
 * Handles the button click, sends the user-inputted query to the server,
 * and handles the response.
 */
function executeCustomQuery() {
    const query = document.getElementById('queryInput').value.trim();
    const container = document.getElementById('tableContainer');
    container.innerHTML = 'Loading data...';

    if (!query) {
        container.innerHTML = '<p style="color: red;">Please enter a query.</p>';
        return;
    }

    // 1. Send the query to the server using the POST method
    fetch('/api/execute-query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sqlQuery: query })
    })
    .then(response => {
        // If the response is not OK, we read the JSON error body
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.detail || errorData.error || `HTTP error! Status: ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        // 2. Process the data and display the table
        createTable(data);
    })
    .catch(error => {
        console.error('Fetch error:', error);
        container.innerHTML = `<p style="color: red;">Error: Could not execute query. Detail: ${error.message}</p>`;
    });
}

/**
 * Dynamically creates an HTML table from the JSON data received from the server.
 * @param {Array<Object>} data - The array of row objects from the database.
 */
function createTable(data) {
    const container = document.getElementById('tableContainer');
    container.innerHTML = ''; 

    if (!data || data.length === 0) {
        container.innerHTML = '<p>Query executed successfully, but no records were found.</p>';
        return;
    }

    const table = document.createElement('table');

    // Create table header (using keys from the first object)
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });

    // Create table body
    const tbody = table.createTBody();
    data.forEach(item => {
        const row = tbody.insertRow();
        Object.values(item).forEach(value => {
            const cell = row.insertCell();
            // Handle null or undefined values gracefully
            cell.textContent = value === null || typeof value === 'undefined' ? '' : value;
        });
    });

    container.appendChild(table);
}
