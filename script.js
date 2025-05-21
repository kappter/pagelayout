const { jsPDF } = window.jspdf;
const canvas = document.getElementById('spreadCanvas');
const ctx = canvas.getContext('2d');
const sectionSelect = document.getElementById('sectionSelect');
const colorInput = document.getElementById('colorInput');
const randomizeButton = document.getElementById('randomizeButton');
const addElementButton = document.getElementById('addElementButton');
const exportPdfButton = document.getElementById('exportPdfButton');
const swatchContainer = document.getElementById('swatch');
const neutralSwatchContainer = document.getElementById('neutralSwatch');

// Color palette
let colors = ['#8A7B96', '#7B968A', '#968A7B', '#627C70', '#ADA397'];
const neutralColors = ['#000000', '#FFFFFF', '#333333', '#666666', '#CCCCCC'];
let sectionColors = {
  background: '#ffffff',
  modules: '#0000ff33',
  imageBoxes: '#00ff00'
};

// Page dimensions
const pageWidthInches = 8.5;
const pageHeightInches = 11;
const spreadWidthInches = pageWidthInches * 2;
const bleedInches = 0.125;
const gutterInches = 0.5;
const dpi = 72;
const scale = 0.8;
const pageWidth = pageWidthInches * dpi;
const pageHeight = pageHeightInches * dpi;
const spreadWidth = spreadWidthInches * dpi;
const bleed = bleedInches * dpi;
const gutter = gutterInches * dpi;

// Canvas setup
canvas.width = spreadWidth * scale;
canvas.height = pageHeight * scale;
const scaleFactor = canvas.width / spreadWidth;

// Layers
let modules = [];
let imageBoxes = [];
let selectedLayer = 'modules';
let selectedSection = null;
let isDragging = false;
let draggedElement = null;
let startX, startY;

// Update swatches
function updateSwatches() {
  swatchContainer.innerHTML = '';
  colors.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = color;
    swatch.dataset.color = color;
    swatchContainer.appendChild(swatch);
  });

  neutralSwatchContainer.innerHTML = '';
  neutralColors.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'neutral-swatch';
    swatch.style.backgroundColor = color;
    swatch.dataset.color = color;
    neutralSwatchContainer.appendChild(swatch);
  });

  document.querySelectorAll('.swatch, .neutral-swatch').forEach(swatch => {
    swatch.addEventListener('mouseover', () => {
      if (selectedSection) {
        const color = swatch.dataset.color;
        if (selectedSection === 'background') {
          sectionColors.background = color;
        } else if (selectedSection === 'modules') {
          sectionColors.modules = color + '33';
        } else if (selectedSection === 'imageBoxes') {
          sectionColors.imageBoxes = color;
        }
        drawSpread();
      }
    });
    swatch.addEventListener('click', () => {
      if (selectedSection) {
        const color = swatch.dataset.color;
        if (selectedSection === 'background') {
          sectionColors.background = color;
        } else if (selectedSection === 'modules') {
          sectionColors.modules = color + '33';
        } else if (selectedSection === 'imageBoxes') {
          sectionColors.imageBoxes = color;
        }
        sectionSelect.value = '';
        selectedSection = null;
        drawSpread();
      }
    });
  });
}

// Draw the spread
function drawSpread() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = sectionColors.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(0, 0, pageWidth * scaleFactor, pageHeight * scaleFactor);
  ctx.rect(pageWidth * scaleFactor + gutter * scaleFactor, 0, pageWidth * scaleFactor, pageHeight * scaleFactor);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(pageWidth * scaleFactor, 0);
  ctx.lineTo(pageWidth * scaleFactor, pageHeight * scaleFactor);
  ctx.moveTo((pageWidth + gutter) * scaleFactor, 0);
  ctx.lineTo((pageWidth + gutter) * scaleFactor, pageHeight * scaleFactor);
  ctx.stroke();
  
  ctx.fillStyle = sectionColors.modules;
  ctx.strokeStyle = sectionColors.modules.slice(0, 7);
  ctx.lineWidth = 2;
  modules.forEach(module => {
    ctx.fillRect(module.x * scaleFactor, module.y * scaleFactor, module.width * scaleFactor, module.height * scaleFactor);
    ctx.strokeRect(module.x * scaleFactor, module.y * scaleFactor, module.width * scaleFactor, module.height * scaleFactor);
  });
  
  ctx.strokeStyle = sectionColors.imageBoxes;
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 2;
  imageBoxes.forEach(box => {
    ctx.strokeRect(box.x * scaleFactor, box.y * scaleFactor, box.width * scaleFactor, box.height * scaleFactor);
  });
  ctx.setLineDash([]);
}

// Initialize
updateSwatches();
drawSpread();

// Handle section selection
sectionSelect.addEventListener('change', () => {
  selectedSection = sectionSelect.value;
  selectedLayer = selectedSection === 'background' ? 'modules' : selectedSection;
  drawSpread();
});

// Handle color input
colorInput.addEventListener('input', () => {
  const input = colorInput.value.trim();
  if (input) {
    const colorArray = input.split(',').map(c => c.trim());
    if (colorArray.length === 5 && colorArray.every(c => /^[0-9A-Fa-f]{6}$/.test(c))) {
      colors = colorArray.map(c => `#${c}`);
      updateSwatches();
    }
  }
});

// Handle randomize button
randomizeButton.addEventListener('click', () => {
  const getRandomHexColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  colors = [getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor(), getRandomHexColor()];
  colorInput.value = colors.map(c => c.slice(1)).join(',');
  sectionColors.modules = '#0000ff33';
  sectionColors.imageBoxes = '#00ff00';
  updateSwatches();
  drawSpread();
});

// Handle canvas clicks
canvas.addEventListener('mousedown', e => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / scaleFactor;
  const y = (e.clientY - rect.top) / scaleFactor;
  
  const elements = selectedLayer === 'modules' ? modules : imageBoxes;
  draggedElement = elements.find(el => 
    x >= el.x && x <= el.x + el.width && 
    y >= el.y && y <= el.y + el.height
  );
  
  if (draggedElement) {
    isDragging = true;
    startX = x - draggedElement.x;
    startY = y - draggedElement.y;
    selectedSection = selectedLayer;
    sectionSelect.value = selectedLayer;
  } else {
    draggedElement = { x, y, width: 50, height: 50 }; // Minimum size
    isDragging = true;
    startX = x;
    startY = y;
    if (selectedLayer === 'modules') {
      modules.push(draggedElement);
      selectedSection = 'modules';
      sectionSelect.value = 'modules';
    } else {
      imageBoxes.push(draggedElement);
      selectedSection = 'imageBoxes';
      sectionSelect.value = 'imageBoxes';
    }
  }
  drawSpread();
});

// Handle mouse move
canvas.addEventListener('mousemove', e => {
  if (!isDragging) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / scaleFactor;
  const y = (e.clientY - rect.top) / scaleFactor;
  
  if (draggedElement.width === 50 && draggedElement.height === 50) {
    // Resize new element with minimum size
    draggedElement.width = Math.max(50, x - draggedElement.x);
    draggedElement.height = Math.max(50, y - draggedElement.y);
  } else {
    // Move existing element
    draggedElement.x = x - startX;
    draggedElement.y = y - startY;
  }
  
  drawSpread();
});

// Handle mouse up
canvas.addEventListener('mouseup', () => {
  if (draggedElement) {
    // Ensure minimum size
    draggedElement.width = Math.max(50, draggedElement.width);
    draggedElement.height = Math.max(50, draggedElement.height);
  }
  isDragging = false;
  draggedElement = null;
  drawSpread();
});

// Add new element
addElementButton.addEventListener('click', () => {
  const newElement = {
    x: bleed,
    y: bleed,
    width: 100,
    height: 100
  };
  if (selectedLayer === 'modules') {
    modules.push(newElement);
  } else {
    imageBoxes.push(newElement);
  }
  drawSpread();
});

// Export to PDF
exportPdfButton.addEventListener('click', () => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: [spreadWidthInches, pageHeightInches]
  });
  
  const bgColor = sectionColors.background.match(/[0-9A-Fa-f]{2}/g).map(hex => parseInt(hex, 16));
  doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
  doc.rect(0, 0, spreadWidthInches, pageHeightInches, 'F');
  
  doc.setDrawColor(255, 0, 0);
  doc.setLineWidth(0.01);
  doc.rect(0, 0, pageWidthInches, pageHeightInches);
  doc.rect(pageWidthInches + gutterInches, 0, pageWidthInches, pageHeightInches);
  
  doc.line(pageWidthInches, 0, pageWidthInches, pageHeightInches);
  doc.line(pageWidthInches + gutterInches, 0, pageWidthInches + gutterInches, pageHeightInches);
  
  const moduleColor = sectionColors.modules.slice(0, 7).match(/[0-9A-Fa-f]{2}/g).map(hex => parseInt(hex, 16));
  doc.setFillColor(moduleColor[0], moduleColor[1], moduleColor[2], 0.3);
  doc.setDrawColor(moduleColor[0], moduleColor[1], moduleColor[2]);
  modules.forEach(module => {
    doc.rect(module.x / dpi, module.y / dpi, module.width / dpi, module.height / dpi, 'FD');
  });
  
  const imageBoxColor = sectionColors.imageBoxes.match(/[0-9A-Fa-f]{2}/g).map(hex => parseInt(hex, 16));
  doc.setDrawColor(imageBoxColor[0], imageBoxColor[1], imageBoxColor[2]);
  doc.setLineDash([0.05, 0.05]);
  imageBoxes.forEach(box => {
    doc.rect(box.x / dpi, box.y / dpi, box.width / dpi, box.height / dpi, 'D');
  });
  doc.setLineDash([]);
  
  doc.save('yearbook-spread.pdf');
});