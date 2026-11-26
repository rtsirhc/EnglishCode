export const BANK_REVIEW = [
  { word: 'bank account', es: 'cuenta bancaria', phrase: "I'd like to open a bank account." },
  { word: 'deposit', es: 'depositar', phrase: 'I want to deposit $500.' },
  { word: 'withdraw', es: 'retirar dinero', phrase: "I'd like to withdraw $200 in cash." },
  { word: 'cash / card', es: 'efectivo / tarjeta', phrase: 'Do you want cash or card?' },
  { word: 'ATM', es: 'cajero automático', phrase: 'Where is the nearest ATM?' },
  { word: 'balance', es: 'saldo', phrase: 'Can I check my balance, please?' },
  { word: 'exchange', es: 'cambiar divisas', phrase: 'Could I exchange dollars for pesos?' },
  { word: 'transfer', es: 'transferir', phrase: 'I need to transfer money to my mom.' },
  { word: 'PIN', es: 'NIP / clave secreta', phrase: 'Please enter your PIN.' },
  { word: 'ID', es: 'identificación', phrase: 'Can I see your ID, please?' },
  { word: 'receipt', es: 'recibo / comprobante', phrase: 'Would you like a receipt?' },
  { word: 'teller', es: 'cajero (persona)', phrase: 'Go to the next bank teller.' }
];

export const BANK_CHALLENGES = {
  A1: [
    { cat: 'Counter Request', prompt: 'You want to put $300 INTO your account. Tell the bank teller!', frame: "I'd like to ___ $300, please.", answer: "I'd like to deposit $300, please.", tip: 'Deposit = meter dinero.' },
    { cat: 'Counter Request', prompt: 'You want to take $100 OUT of your account. Tell the teller!', frame: "I'd like to ___ $100, please.", answer: "I'd like to withdraw $100, please.", tip: 'Withdraw = retirar dinero.' },
    { cat: 'Counter Request', prompt: 'You want to know how much money you have in your account. Ask!', frame: 'Can I check my ___ , please?', answer: 'Can I check my balance, please?', tip: 'Balance = saldo.' },
    { cat: 'ATM Help', prompt: 'You are looking for the cash machine outside. Ask a worker!', frame: 'Excuse me, where is the ___ ?', answer: 'Excuse me, where is the ATM?', tip: 'ATM = Automated Teller Machine (cajero).' },
    { cat: 'New Customer', prompt: 'You do not have an account yet. Ask to create one.', frame: "Hello! I'd like to ___ a bank ___ .", answer: "Hello! I'd like to open a bank account.", tip: 'Open an account = abrir una cuenta.' },
    { cat: 'Currency Exchange', prompt: 'You have 50 US dollars and want Mexican pesos. Ask politely.', frame: 'Can I ___ dollars for ___ ?', answer: 'Can I exchange dollars for pesos?', tip: 'Exchange X for Y.' },
    { cat: 'Teller Question', prompt: 'Teller says: "Can I see your ID, please?" Answer and hand it over.', frame: 'Yes, ___ you ___ .', answer: 'Yes, here you are. / Sure, here is my ID.', tip: 'Polite response.' },
    { cat: 'Teller Question', prompt: 'Teller asks: "Would you like a receipt?" Say YES politely.', frame: 'Yes, ___ .', answer: 'Yes, please. / Yes, I would like a receipt.', tip: 'Receipt has a silent P: re-SEET!' },
    { cat: 'Pronunciation Vault', prompt: 'Say this word clearly WITHOUT pronouncing the P: "receipt".', frame: 're-SEET (silent P)', answer: 'receipt (/rɪˈsiːt/).', tip: 'The P is 100% silent.' },
    { cat: 'Fix the Mistake', prompt: 'Fix the error: "I want to open a count."', frame: 'I want to open a bank ___ .', answer: 'I want to open a bank ACCOUNT.', tip: 'Account = cuenta.' },
    { cat: 'Cash or Card?', prompt: 'You want paper money, not a plastic card. Tell the teller.', frame: 'I want it in ___ , please.', answer: 'I want it in cash, please.', tip: 'In cash = en efectivo.' },
    { cat: 'Transfer', prompt: 'You want to send $200 to your sister’s account. Say it!', frame: 'I need to ___ $200 to my sister.', answer: 'I need to transfer $200 to my sister.', tip: 'Transfer = transferir.' }
  ],
  A2: [
    { cat: 'Counter Role-Play', prompt: 'You want to withdraw $500 in small bills (not one big bill). Ask politely.', frame: "I'd like to withdraw $500 in ___ , please.", answer: "I'd like to withdraw $500 in small bills, please.", tip: 'Small bills = billetes chicos.' },
    { cat: 'Currency Exchange', prompt: 'Ask for the exchange rate for US dollars today.', frame: 'What is the ___ ___ for dollars today?', answer: 'What is the exchange rate for dollars today?', tip: 'Exchange rate = tipo de cambio.' },
    { cat: 'ATM Emergency', prompt: 'The ATM did not give you your card back! Tell the bank worker.', frame: 'Excuse me, the ATM ___ my card!', answer: 'Excuse me, the ATM kept (ate) my card! Can you help me?', tip: 'Clear problem + request for help.' },
    { cat: 'Fix the Mistake', prompt: 'Fix the error: "I want to take off 200 pesos from my account."', frame: 'I want to ___ 200 pesos…', answer: 'I want to WITHDRAW 200 pesos from my account.', tip: 'Withdraw (not take off).' },
    { cat: 'Fix the Mistake', prompt: 'Fix the error: "Could I change my balance?" (You only want to SEE it.)', frame: 'Could I ___ my balance?', answer: 'Could I CHECK my balance?', tip: 'Check your balance = consultar saldo.' },
    { cat: 'Teller Role-Play', prompt: 'You are the bank teller. Ask the customer for their ID and how much they want to deposit.', frame: 'May I see your ___ ? How much would you like to ___ ?', answer: 'May I see your ID? How much would you like to deposit?', tip: 'Two polite teller questions.' },
    { cat: 'Lost Card', prompt: 'You lost your debit card yesterday. Tell the bank you need to block it.', frame: 'I lost my card. Can you ___ it and give me a ___ one?', answer: 'I lost my debit card. Can you block (cancel) it and give me a new one?', tip: 'Block / cancel a card.' },
    { cat: 'Pronunciation Vault', prompt: 'Say BOTH sentences cleanly: "Here is my receipt" and "I need to withdraw cash."', frame: 're-SEET · with-DRAW', answer: 'Here is my receipt. I need to withdraw cash.', tip: 'Watch the silent P in receipt.' },
    { cat: 'Opening an Account', prompt: 'Ask what documents you need to open a savings account.', frame: 'What ___ do I need to open a ___ account?', answer: 'What documents do I need to open a savings account?', tip: 'Savings account = cuenta de ahorros.' },
    { cat: 'PIN Problem', prompt: 'You forgot your PIN number. Explain and ask how to reset it.', frame: 'I forgot my ___ . How can I ___ it?', answer: 'I forgot my PIN. How can I reset (change) it?', tip: 'Reset = restablecer.' },
    { cat: 'Speed Clue', prompt: 'Explain "ATM" in English WITHOUT saying "ATM".', frame: 'It is a machine where you…', answer: 'It is a machine where you take out cash with your card.', tip: 'Great paraphrasing practice.' },
    { cat: 'Transfer Check', prompt: 'Ask how long a bank transfer takes and if there is a fee.', frame: 'How long does it ___ ? Is there a ___ ?', answer: 'How long does a transfer take, and is there a fee?', tip: 'Fee = comisión.' }
  ],
  B1: [
    { cat: 'Dispute Resolution', prompt: 'You see a $900 charge on your statement that you did NOT make. Explain and ask for help.', frame: 'There is a charge I do not recognize…', answer: 'There is a $900 charge on my statement that I do not recognize. Could we dispute it?', tip: 'Bank statement = estado de cuenta.' },
    { cat: 'Currency Negotiation', prompt: 'You want to exchange $150 USD for pesos, and you want to know the rate AND the commission before agreeing.', frame: 'Before I exchange this, what is…?', answer: 'Before I exchange $150, what is today’s exchange rate and how much is the commission?', tip: 'Polite pre-condition.' },
    { cat: 'Account Comparison', prompt: 'Ask the bank advisor to explain the difference between a checking account and a savings account.', frame: 'Could you explain the difference between…?', answer: 'Could you explain the difference between a checking account and a savings account?', tip: 'Checking vs. savings.' },
    { cat: 'Fix Both Errors', prompt: 'Fix BOTH errors: "I want to retire $500 and receive a recipe."', frame: 'withdraw · receipt', answer: 'I want to WITHDRAW $500 and receive a RECEIPT.', tip: 'Classic Spanish false friends (retirar / recibo)!' },
    { cat: 'ATM Complication', prompt: 'The ATM deducted $1,000 from your balance, but gave you NO cash. Report it calmly and clearly.', frame: 'The machine took $1,000 from my balance, however…', answer: 'The ATM took $1,000 from my balance, however no cash came out. Here is my receipt.', tip: 'Explain cause + evidence.' },
    { cat: 'Security Advice', prompt: 'Give TWO tips in English to keep your bank account and PIN safe.', frame: 'First, never… Second, always…', answer: 'First, never share your PIN with anyone. Second, always check your balance regularly.', tip: 'Two clear imperatives.' },
    { cat: 'Loan / Credit Inquiry', prompt: 'Ask politely about the interest rate and monthly payments for a small student loan.', frame: 'What is the interest rate, and how much…?', answer: 'What is the interest rate, and how much would the monthly payments be?', tip: 'Real-world adult English.' },
    { cat: 'Card Declined', prompt: 'Your card was declined at a store even though you have money. Ask the bank to check why.', frame: 'My card was declined, even though…', answer: 'My card was declined at a store even though I have enough balance. Could you check if it is blocked?', tip: 'Even though + contrast.' },
    { cat: 'Closing the Visit', prompt: 'Thank the teller, confirm your new balance, and ask for a printed receipt.', frame: 'Thank you. So my new balance is…, right? Could I get…?', answer: 'Thank you. So my new balance is $2,500, right? Could I get a printed receipt, please?', tip: 'Natural confirmation.' },
    { cat: 'False Friends Trap', prompt: 'Explain in English why "recipe" is NOT "receipt" and give one example of each.', frame: 'A recipe is for… A receipt is for…', answer: 'A recipe is instructions for cooking; a receipt is proof that you paid or made a transaction.', tip: 'Huge vocabulary win!' }
  ]
};
