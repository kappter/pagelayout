const canvas = document.getElementById('layoutCanvas');
const ctx = canvas.getContext('2d');
const layerSelect = document.getElementById('layerSelect');
const colorInputs = [
    document.getElementById('color1'),
    document.getElementById('color2'),
    document.getElementById('color3'),
    document.getElementById('color4'),
    document.getElementById('color5')
];
const randomizeColors = document.getElementById('randomizeColors');

// Set canvas size based on container
function resizeCanvas() {
    const workspace = document.querySelector('.workspace');
    canvas.width = workspace.clientWidth;
    canvas.height = workspace.clientHeight;
    drawSpread();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Layer data
const layers = {
    modules: [],
    moduleGroups: [],
    photoBoxes: [],
    imageBoxes: [],
    textBoxes: []
};
let currentLayer = 'modules';
let selectedColor = colorInputs[0].value;
let isDragging = false;
let startX, startY;
let currentRect = null;

// Update selected color
colorInputs.forEach(input => {
    input.addEventListener('change', () => {
        selectedColor = input.value;
    });
});

// Randomize color palette
randomizeColors.addEventListener('click', () => {
    colorInputs.forEach(input => {
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
        input.value = randomColor;
    });
    selectedColor = colorInputs[0].value;
});

// Layer selection
layerSelect.addEventListener('change', () => {
    currentLayer = layerSelect.value;
    drawSpread();
});

// Draw yearbook spread (2 pages, 8.5" x 11" each, with margins and gutter)
function drawSpread() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate dimensions (assuming 72 DPI for simplicity)
    const pageWidth = (canvas.width - 20) / 2; // Two pages, minus gutter
    const pageHeight = canvas.height;
    const margin = pageWidth * (1 / 8.5); // 1" margin
    const gutter = 20; // Fixed gutter width
    
    // Draw left page
    ctx.strokeStyle = '#000';
    ctx.strokeRect(0, 0, pageWidth, pageHeight);
    ctx.strokeRect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
    
    // Draw right page
    ctx.strokeRect(pageWidth + gutter, 0, pageWidth, pageHeight);
    ctx.strokeRect(pageWidth + gutter + margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
    
    // Draw all rectangles
    Object.keys(layers).forEach(layer => {
        layers[layer].forEach(rect => {
            ctx.fillStyle = rect.fill;
            ctx.strokeStyle = rect.stroke;
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        });
    });
}

// Mouse events for dragging rectangles
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    isDragging = true;
    currentRect = { x: startX, y: startY, width: 0, height: 0, fill: selectedColor, stroke: '#000' };
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    currentRect.width = x - startX;
    currentRect.height = y - startY;
    drawSpread();
    ctx.fillStyle = currentRect.fill;
    ctx.strokeStyle = currentRect.stroke;
    ctx.fillRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
    ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
});

canvas.addEventListener('mouseup', () => {
    if (isDragging) {
        layers[currentLayer].push(currentRect);
        isDragging = false;
        drawSpread();
    }
});

// Initial draw
drawSpread();