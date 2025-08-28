"use strict";

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2025-01-05T21:31:17.178Z",
    "2025-02-06T07:42:02.383Z",
    "2025-03-28T09:15:04.904Z",
    "2025-04-01T10:17:24.185Z",
    "2025-05-08T14:11:59.604Z",
    "2025-06-27T17:01:17.194Z",
    "2025-07-11T23:36:17.929Z",
    "2025-08-12T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];
const logOutTime = 1000 * 60;
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnLogOut = document.querySelector(".log-out");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");
const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = "";
  const movObj = account.movements.map((curr, i) => {
    return { mov: curr, date: account.movementsDates[i] };
  });
  const finalMovements = sort
    ? movObj.slice().sort((a, b) => a.mov - b.mov)
    : movObj;

  finalMovements.forEach(({ mov, date: newDate }, i) => {
    const type = mov > 0 ? "deposit" : "withdrawal";
    const date = calcDate(newDate);
    // prettier-ignore
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i+1} ${type}</div>
        <div class="movements__date">${date}</div>
        <div class="movements__value">${formatCurrency(account,+mov)}</div>
      </div>`;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};
function calcDate(newDate) {
  let date = Math.floor(
    (new Date() - new Date(newDate)) / (1000 * 60 * 60 * 24)
  );
  if (date == 0) return "Today";
  if (date == 1) return "Yesterday";
  if (date <= 7) return `${date} days ago`;
  date = new Date(newDate);
  return new Intl.DateTimeFormat(currentAccount.locale).format(date);
}
const createUsernames = (users) =>
  //prettier-ignore
  users.forEach(user =>(user.username = user.owner.toLowerCase().split(' ').map(curr => curr.at(0)).join('')));
createUsernames(accounts);

const calcDisplayBalance = (acc) => {
  acc.balance = acc.movements.reduce((acc, curr) => acc + curr);
  labelBalance.textContent = `${new Intl.NumberFormat(acc.locale, {
    style: "currency",
    currency: acc.currency,
    maximumFractionDigits: 2,
  }).format(acc.balance)}`;
};

const calcDisplaySummary = function (acc) {
  const income = acc.movements
    .filter((curr) => curr > 0)
    .reduce((acc, curr) => acc + curr, 0);
  const withdrawal = acc.movements
    .filter((curr) => curr < 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumIn.textContent = `${formatCurrency(acc, income)}`;
  labelSumOut.textContent = `${formatCurrency(acc, withdrawal)}`;
  labelSumInterest.textContent = `${formatCurrency(
    acc,
    (income * acc.interestRate) / 100
  )}`;
};
function formatCurrency(acc, num) {
  return new Intl.NumberFormat(acc.locale, {
    style: "currency",
    currency: acc.currency,
    maximumFractionDigits: 2,
  }).format(num);
}
let currentAccount,
  isSorted = false;

const date = new Date();

const displayWelcomeMessage = function (acc) {
  let message;
  if (!acc) {
    message = `Log in to get started`;
  } else {
    if (date.getHours() >= 5 && date.getHours() < 12) {
      message = "Good Morning, ";
    } else if (date.getHours() >= 12 && date.getHours() < 17) {
      message = "Good Afternoon, ";
    } else {
      message = "Good Evening, ";
    }
    message += `${acc.owner.split(" ")[0]}`;
  }
  labelWelcome.textContent = message;
};
let clock, timeInterval, timeOut;
function timer() {
  let date = new Date(logOutTime);
  const startTimer = () => {
    labelTimer.textContent = new Intl.DateTimeFormat(currentAccount.locale, {
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
    date = new Date(date - 1000);
  };
  startTimer();
  timeInterval = setInterval(startTimer, 1000);
  timeOut = setTimeout(() => {
    clearInterval(timeInterval);
    clearInterval(clock);
    currentAccount = undefined;
    containerApp.style.opacity = 0;
    displayWelcomeMessage(currentAccount);
    btnLogOut.style.display = "none";
    document.querySelector(".login").style.display = "flex";
  }, logOutTime);
}

const login = function (username, pin) {
  currentAccount = accounts.find(
    (acc) => acc.pin === pin && acc.username === username
  );
  if (!currentAccount) return;

  containerApp.style.opacity = 1;
  inputLoginPin.value = inputLoginUsername.value = "";
  inputLoginPin.blur();
  inputLoginUsername.blur();
  displayWelcomeMessage(currentAccount);
  updateUI(currentAccount);
  updateClock();
  clock = setInterval(updateClock, 1000);
  timer(currentAccount);
  document.querySelector(".login").style.display = "none";
  btnLogOut.style.display = "inline-block";
};
btnLogOut.addEventListener("click", (e) => {
  e.preventDefault();
  currentAccount = undefined;
  clearInterval(timeInterval);
  clearTimeout(timeOut);
  clearInterval(clock);
  containerApp.style.opacity = 0;
  displayWelcomeMessage(currentAccount);
  btnLogOut.style.display = "none";
  document.querySelector(".login").style.display = "flex";
});
btnLogin.addEventListener("click", (e) => {
  e.preventDefault();
  login(inputLoginUsername.value, +inputLoginPin.value);
});

const transfer = function (fromAcc, toAccUsername, amount) {
  //prettier-ignore
  if (toAccUsername === fromAcc.username || amount > fromAcc.balance)return;
  const isValidAcc = accounts.find((curr) => curr.username === toAccUsername);
  if (!isValidAcc) return;
  fromAcc.movements.push(-amount);
  isValidAcc.movements.push(amount);
  fromAcc.movementsDates.push(new Date().toISOString());
  isValidAcc.movementsDates.push(new Date().toISOString());
  updateUI(currentAccount);
};
btnTransfer.addEventListener("click", (e) => {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const toAccUsername = inputTransferTo.value;
  inputTransferAmount.value = inputTransferTo.value = "";
  if (amount <= 0) return;
  transfer(currentAccount, toAccUsername, amount);
});
function updateUI(acc) {
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
  displayMovements(acc);
}
btnClose.addEventListener("click", (e) => {
  e.preventDefault();
  const closeUsername = inputCloseUsername.value;
  const closePin = +inputClosePin.value;
  inputClosePin.value = inputCloseUsername.value = "";
  if (
    currentAccount.username === closeUsername &&
    currentAccount.pin === closePin
  ) {
    const isFound = accounts.findIndex(
      (curr) =>
        curr.username === currentAccount.username &&
        curr.pin === currentAccount.pin
    );
    if (isFound === -1) return;
    accounts.splice(isFound, 1);
    containerApp.style.opacity = 0;
    currentAccount = undefined;
    displayWelcomeMessage(currentAccount);
    clearInterval(timeInterval);
    clearTimeout(timeOut);
    clearInterval(clock);
  }
});

btnLoan.addEventListener("click", (e) => {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  inputLoanAmount.value = "";
  if (
    amount <= 0 ||
    !currentAccount.movements.some((mov) => amount * 0.1 < mov)
  )
    return;
  setTimeout(() => {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
  }, 3333);
});
btnSort.addEventListener("click", (e) => {
  e.preventDefault();
  isSorted = !isSorted;
  displayMovements(currentAccount, isSorted);
});
function updateClock() {
  const date = new Date();
  labelDate.textContent = `${new Intl.DateTimeFormat(currentAccount.locale, {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour12: true,
  }).format(date)}`;
}
