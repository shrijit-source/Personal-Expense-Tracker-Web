```javascript
// ==========================================
// PERSONAL EXPENSE TRACKER
// ==========================================

// Get HTML elements
const transactionForm = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const transactionList = document.getElementById("transactionList");
const transactionCount = document.getElementById("transactionCount");

const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");
const clearAllBtn = document.getElementById("clearAllBtn");

// Load transactions from Local Storage
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Set today's date automatically
dateInput.value = new Date().toISOString().split("T")[0];


// ==========================================
// ADD TRANSACTION
// ==========================================

transactionForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!description || isNaN(amount) || amount <= 0 || !date) {
        alert("Please enter valid transaction details.");
        return;
    }

    const transaction = {
        id: Date.now(),
        description: description,
        amount: amount,
        type: type,
        category: category,
        date: date
    };

    transactions.push(transaction);

    saveTransactions();
    updateUI();

    transactionForm.reset();

    // Restore today's date
    dateInput.value = new Date().toISOString().split("T")[0];

});


// ==========================================
// SAVE TO LOCAL STORAGE
// ==========================================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


// ==========================================
// CALCULATE TOTALS
// ==========================================

function calculateTotals() {

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {

        if (transaction.type === "income") {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }

    });

    const balance = totalIncome - totalExpense;

    incomeElement.textContent = formatCurrency(totalIncome);
    expenseElement.textContent = formatCurrency(totalExpense);
    balanceElement.textContent = formatCurrency(balance);

}


// ==========================================
// FORMAT CURRENCY
// ==========================================

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    }).format(amount);

}


// ==========================================
// DISPLAY TRANSACTIONS
// ==========================================

function displayTransactions() {

    let filteredTransactions = [...transactions];

    // Filter by type
    if (filterType.value !== "all") {

        filteredTransactions = filteredTransactions.filter(
            transaction => transaction.type === filterType.value
        );

    }

    // Filter by category
    if (filterCategory.value !== "all") {

        filteredTransactions = filteredTransactions.filter(
            transaction => transaction.category === filterCategory.value
        );

    }

    // Sort newest first
    filteredTransactions.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    transactionCount.textContent =
        `${filteredTransactions.length} transaction${filteredTransactions.length !== 1 ? "s" : ""}`;

    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">₹</div>
                <h3>No transactions found</h3>
                <p>Try changing your filters or add a new transaction.</p>
            </div>
        `;

        return;
    }

    transactionList.innerHTML = "";

    filteredTransactions.forEach(transaction => {

        const transactionElement = document.createElement("div");

        transactionElement.className = "transaction";

        const formattedDate = formatDate(transaction.date);

        const sign = transaction.type === "income" ? "+" : "-";

        transactionElement.innerHTML = `
            <div class="transaction-left">

                <div class="transaction-icon ${transaction.type}">
                    ${transaction.type === "income" ? "↗" : "↘"}
                </div>

                <div class="transaction-info">
                    <h4>${escapeHTML(transaction.description)}</h4>
                    <p>
                        ${escapeHTML(transaction.category)}
                        •
                        ${formattedDate}
                    </p>
                </div>

            </div>

            <div class="transaction-right">

                <span class="amount ${transaction.type}">
                    ${sign}${formatCurrency(transaction.amount)}
                </span>

                <button
                    class="delete-btn"
                    onclick="deleteTransaction(${transaction.id})"
                    title="Delete transaction"
                >
                    ×
                </button>

            </div>
        `;

        transactionList.appendChild(transactionElement);

    });

}


// ==========================================
// DELETE TRANSACTION
// ==========================================

function deleteTransaction(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
        return;
    }

    transactions = transactions.filter(
        transaction => transaction.id !== id
    );

    saveTransactions();
    updateUI();

}


// ==========================================
// CLEAR ALL TRANSACTIONS
// ==========================================

clearAllBtn.addEventListener("click", function () {

    if (transactions.length === 0) {
        alert("There are no transactions to clear.");
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to delete ALL transactions?"
    );

    if (!confirmed) {
        return;
    }

    transactions = [];

    saveTransactions();
    updateUI();

});


// ==========================================
// EXPENSE CATEGORY STATISTICS
// ==========================================

function updateCategoryStatistics() {

    const categories = [
        "Food",
        "Travel",
        "Shopping",
        "Bills",
        "Education",
        "Entertainment",
        "Health",
        "Other"
    ];

    const categoryTotals = {};

    categories.forEach(category => {
        categoryTotals[category] = 0;
    });

    transactions.forEach(transaction => {

        if (
            transaction.type === "expense" &&
            categoryTotals.hasOwnProperty(transaction.category)
        ) {
            categoryTotals[transaction.category] += transaction.amount;
        }

    });

    const totalExpenses = transactions
        .filter(transaction => transaction.type === "expense")
        .reduce((total, transaction) => total + transaction.amount, 0);

    categories.forEach(category => {

        const amountElement =
            document.getElementById(
                category.toLowerCase() + "Amount"
            );

        const progressElement =
            document.getElementById(
                category.toLowerCase() + "Progress"
            );

        const amount = categoryTotals[category];

        amountElement.textContent = formatCurrency(amount);

        let percentage = 0;

        if (totalExpenses > 0) {
            percentage = (amount / totalExpenses) * 100;
        }

        progressElement.style.width =
            Math.min(percentage, 100) + "%";

    });

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateString) {

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}


// ==========================================
// PREVENT HTML INJECTION
// ==========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ==========================================
// FILTER EVENTS
// ==========================================

filterType.addEventListener("change", displayTransactions);

filterCategory.addEventListener("change", displayTransactions);


// ==========================================
// UPDATE EVERYTHING
// ==========================================

function updateUI() {

    calculateTotals();

    displayTransactions();

    updateCategoryStatistics();

}


// ==========================================
// INITIALIZE APP
// ==========================================

updateUI();
```
