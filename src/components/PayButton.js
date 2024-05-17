import React, { useState } from 'react';

const PayButton = () => {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [healthID, setHealthID] = useState('');
  const [amount, setAmount] = useState('');

  const handlePayClick = () => {
    const url = `http://localhost:3001/pay?name=${name}&mobileNumber=${mobileNumber}&healthID=${healthID}&amount=${amount}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <h2>Payment Form</h2>
      <form>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>Mobile Number:</label>
          <input type="text" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
        </div>
        <div>
          <label>Health ID:</label>
          <input type="text" value={healthID} onChange={(e) => setHealthID(e.target.value)} />
        </div>
        <div>
          <label>Amount:</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <button type="button" onClick={handlePayClick}>Pay</button>
      </form>
    </div>
  );
};

export default PayButton;
