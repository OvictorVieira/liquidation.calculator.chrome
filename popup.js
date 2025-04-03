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
      <button class="remove-position">&#215;</button>
      <div class="position-row-label">Order ${positionCount}</div>
      <div class="position-field">
        <input type="number" min="0" class="position-input entry-price" placeholder="Entry Price">
        <input type="number" min="0" class="position-input position-size" placeholder="Size">
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
    const leverage = this.value;
    ratioText.textContent = `${leverage}x Leverage`;
    updateBalanceRatio();
  });
  
  accountBalanceInput.addEventListener('input', function() {
    updateBalanceRatio();
  });
  
  positionsList.addEventListener('input', function(e) {
    if (e.target.classList.contains('position-size')) {
      updateBalanceRatio();
    }
  });
  
  function updateBalanceRatio() {
    const totalPositionSize = calculateTotalPositionSize();
    const accountBalance = parseFloat(accountBalanceInput.value);
    
    if (!isNaN(accountBalance) && totalPositionSize > 0 && accountBalance > 0) {
      const leverage = Math.round(totalPositionSize / accountBalance);
      balanceSlider.value = leverage;
      ratioText.textContent = `${leverage}x Leverage`;
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

  // Maintenance Margin per Leverage Level
  function getMaintenanceMargin(leverage) {
    if (leverage > 50) return 0.05;
    if (leverage > 25) return 0.025;
    if (leverage > 10) return 0.01;
    return 0.005;
  }

  // Calculate button
  const calculateBtn = document.getElementById('calculate-btn');
  
  calculateBtn.addEventListener('click', function() {
    const positionType = document.getElementById('position-type').value;
    const accountBalance = parseFloat(accountBalanceInput.value);
    const leverage = parseFloat(balanceSlider.value);
    
    if (isNaN(accountBalance)) {
      alert('Please enter a valid account balance');
      return;
    }
    
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
    
    let totalWeightedPrice = 0;
    let totalPositionSize = 0;
    
    positions.forEach(position => {
      totalWeightedPrice += position.entryPrice * position.positionSize;
      totalPositionSize += position.positionSize;
    });
    
    const avgEntryPrice = totalWeightedPrice / totalPositionSize;
    const maintenanceMargin = getMaintenanceMargin(leverage);
    
    let liquidationPrice;
    
    if (positionType === 'long') {
      liquidationPrice = avgEntryPrice * (1 - (accountBalance / totalPositionSize) + maintenanceMargin);
    } else {
      liquidationPrice = avgEntryPrice * (1 + (accountBalance / totalPositionSize) - maintenanceMargin);
    }
    
    document.getElementById('liquidation-price').textContent = '$' + liquidationPrice.toFixed(2);
    document.getElementById('avg-entry-price').textContent = '$' + avgEntryPrice.toFixed(2);
    document.getElementById('total-position-size').textContent = '$' + totalPositionSize.toFixed(2);
    
    document.getElementById('result-container').classList.add('result-visible');
  });
});
