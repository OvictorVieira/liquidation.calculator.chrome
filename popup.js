document.addEventListener('DOMContentLoaded', function() {
  // Back button closes the popup
  const backButton = document.querySelector('.back-button');
  backButton.addEventListener('click', function() {
    window.close();
  });
  
  // Add position button
  const addPositionBtn = document.getElementById('add-position');
  const positionsList = document.getElementById('positions-list');
  let positionCount = 1;
  
  addPositionBtn.addEventListener('click', function() {
    positionCount++;
    const newPosition = document.createElement('div');
    newPosition.className = 'position-row';
    newPosition.innerHTML = `
      <div class="position-row-label">Order ${positionCount}</div>
      <div class="position-field">
        <input type="number" min="0" class="position-input entry-price" placeholder="Entry Price">
        <input type="number" min="0" class="position-input position-size" placeholder="Size">
        <button class="remove-position">×</button>
      </div>
    `;
    
    positionsList.appendChild(newPosition);
    
    // Add event listener to the new remove button
    const removeBtn = newPosition.querySelector('.remove-position');
    removeBtn.addEventListener('click', function() {
      positionsList.removeChild(newPosition);
      updatePositionLabels();
    });
  });
  
  // Function to update position labels when a position is removed
  function updatePositionLabels() {
    const positionRows = document.querySelectorAll('.position-row');
    positionCount = positionRows.length;
    
    positionRows.forEach((row, index) => {
      const label = row.querySelector('.position-row-label');
      label.textContent = `Order ${index + 1}`;
    });
  }
  
  // Slider functionality for balance/position ratio
  const balanceSlider = document.getElementById('balance-slider');
  const ratioText = document.getElementById('ratio-text');
  const accountBalanceInput = document.getElementById('account-balance');
  
  balanceSlider.addEventListener('input', function() {
    const ratio = this.value;
    ratioText.textContent = `${ratio}% Balance/Position Ratio`;
    
    // Calculate total position size
    const totalPositionSize = calculateTotalPositionSize();
    
    if (totalPositionSize > 0) {
      const balance = (totalPositionSize * ratio / 100).toFixed(2);
      accountBalanceInput.value = balance;
    }
  });
  
  // Update slider when account balance changes
  accountBalanceInput.addEventListener('input', function() {
    updateBalanceRatio();
  });
  
  // Add event delegation for position inputs
  positionsList.addEventListener('input', function(e) {
    if (e.target.classList.contains('position-size')) {
      updateBalanceRatio();
    }
  });
  
  function updateBalanceRatio() {
    const totalPositionSize = calculateTotalPositionSize();
    const accountBalance = parseFloat(accountBalanceInput.value);
    
    if (!isNaN(accountBalance) && totalPositionSize > 0) {
      const ratio = (accountBalance / totalPositionSize * 100).toFixed(2);
      balanceSlider.value = ratio;
      ratioText.textContent = `${ratio}% Balance/Position Ratio`;
    }
  }
  
  function calculateTotalPositionSize() {
    const positionSizeInputs = document.querySelectorAll('.position-size');
    let totalSize = 0;
    
    positionSizeInputs.forEach(input => {
      const size = parseFloat(input.value);
      if (!isNaN(size)) {
        totalSize += size;
      }
    });
    
    return totalSize;
  }
  
  // Calculate button
  const calculateBtn = document.getElementById('calculate-btn');
  
  calculateBtn.addEventListener('click', function() {
    // Get position type
    const positionType = document.getElementById('position-type').value;
    const accountBalance = parseFloat(accountBalanceInput.value);
    
    if (isNaN(accountBalance)) {
      alert('Please enter a valid account balance');
      return;
    }
    
    // Get all positions
    const positions = [];
    const entryPriceInputs = document.querySelectorAll('.entry-price');
    const positionSizeInputs = document.querySelectorAll('.position-size');
    
    for (let i = 0; i < entryPriceInputs.length; i++) {
      const entryPrice = parseFloat(entryPriceInputs[i].value);
      const positionSize = parseFloat(positionSizeInputs[i].value);
      
      if (!isNaN(entryPrice) && !isNaN(positionSize)) {
        positions.push({
          entryPrice: entryPrice,
          positionSize: positionSize
        });
      }
    }
    
    if (positions.length === 0) {
      alert('Please enter at least one valid position');
      return;
    }
    
    // Calculate weighted average entry price
    let totalWeightedPrice = 0;
    let totalPositionSize = 0;
    
    positions.forEach(position => {
      totalWeightedPrice += position.entryPrice * position.positionSize;
      totalPositionSize += position.positionSize;
    });
    
    const avgEntryPrice = totalWeightedPrice / totalPositionSize;
    
    // Calculate liquidation price
    let liquidationPrice;
    
    if (positionType === 'long') {
      liquidationPrice = avgEntryPrice * (1 - accountBalance / totalPositionSize);
    } else { // short
      liquidationPrice = avgEntryPrice * (1 + accountBalance / totalPositionSize);
    }
    
    // Display results
    document.getElementById('liquidation-price').textContent = '$' + liquidationPrice.toFixed(2);
    document.getElementById('avg-entry-price').textContent = '$' + avgEntryPrice.toFixed(2);
    document.getElementById('total-position-size').textContent = '$' + totalPositionSize.toFixed(2);
    
    // Show result container
    document.getElementById('result-container').classList.add('result-visible');
  });
});