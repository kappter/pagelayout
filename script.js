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
  background: '#ffffff'
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

// Layers with individual colors
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
      if (selectedSection && draggedElement) {
        const color = swatch.dataset.color;
        draggedElement.color = color;
        drawSpread();
      }
    });
    swatch.addEventListener('click', () => {
      if (selectedSection && draggedElement) {
        const color = swatch.dataset.color;
        draggedElement.color = color;
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
  
  // Draw modules
  modules.forEach(module => {
    ctx.fillStyle = module.color ? module.color + '33' : '#0000ff33'; // Semi-transparent default
    ctx.strokeStyle = module.color ? module.color : '#0000ff';
    ctx.lineWidth = 2;
    ctx.fillRect(module.x * scaleFactor, module.y * scaleFactor, module.width * scaleFactor, module.height * scaleFactor);
    ctx.strokeRect(module.x * scaleFactor, module.y * scaleFactor, module.width * scaleFactor, module.height * scaleFactor);
  });
  
  // Draw image boxes
  imageBoxes.forEach(box => {
    ctx.strokeStyle = box.color ? box.color : '#00ff00';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x * scaleFactor, box.y * scaleFactor, box.width * scaleFactor, box.height * scaleFactor);
    ctx.setLineDash([]);
  });
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
    draggedElement = { x, y, width: 0, height: 0, color: null };
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
  if (!isDragging || !draggedElement) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / scaleFactor;
  const y = (e.clientY - rect.top) / scaleFactor;
  
  if (draggedElement.width === 0 && draggedElement.height === 0) {
    draggedElement.width = x - draggedElement.x;
    draggedElement.height = y - draggedElement.y;
  } else {
    draggedElement.x = x - startX;
    draggedElement.y = y - startY;
  }
  
  drawSpread();
});

// Handle mouse up
canvas.addEventListener('mouseup', () => {
  if (draggedElement) {
    // Ensure non-negative dimensions
    draggedElement.width = Math.max(0, draggedElement.width);
    draggedElement.height = Math.max(0, draggedElement.height);
    if (draggedElement.width === 0 || draggedElement.height === 0) {
      // Remove if too small (e.g., accidental click)
      const elements = selectedLayer === 'modules' ? modules : imageBoxes;
      const index = elements.indexOf(draggedElement);
      if (index > -1) elements.splice(index, 1);
    }
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
    height: 100,
    color: null
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
  
  modules.forEach(module => {
    const moduleColor = module.color ? module.color.match(/[0-9A-Fa-f]{2}/g).map(hex => parseInt(hex, 16)) : [0, 0, 255];
    doc.setFillColor(moduleColor[0], moduleColor[1], moduleColor[2], 0.3);
    doc.setDrawColor(moduleColor[0], moduleColor[1], moduleColor[2]);
    doc.rect(module.x / dpi, module.y / dpi, module.width / dpi, module.height / dpi, 'FD');
  });
  
  imageBoxes.forEach(box => {
    const boxColor = box.color ? box.color.match(/[0-9A-Fa-f]{2}/g).map(hex => parseInt(hex, 16)) : [0, 255, 0];
    doc.setDrawColor(boxColor[0], boxColor[1], boxColor[2]);
    doc.setLineDash([0.05, 0.05]);
    doc.rect(box.x / dpi, box.y / dpi, box.width / dpi, box.height / dpi, 'D');
    doc.setLineDash([]);
  });
  
  doc.save('yearbook-spread.pdf');
});