const canvas = document.getElementById('layoutCanvas');
const ctx = canvas.getContext('2d');
const layerSelect = document.getElementById('layerSelect');
const layerTools = document.getElementById('layerTools');

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
let selectedColor = '#FF0000';
let selectedFontSize = '16px';
let selectedFontFamily = 'Arial';
let isDragging = false;
let startX, startY;
let currentRect = null;

// Layer-specific toolbar content
const layerToolConfigs = {
    modules: `
        <h3>Module Tools</h3>
        <div id="colorPalette">
            <input type="color" id="color1" value="#FF0000">
            <input type="color" id="color2" value="#00FF00">
            <input type="color" id="color3" value="#0000FF">
            <input type="color" id="color4" value="#FFFF00">
            <input type="color" id="color5" value="#FF00FF">
        </div>
        <button id="randomizeColors">Randomize Colors</button>
    `,
    moduleGroups: `
        <h3>Module Group Tools</h3>
        <div id="colorPalette">
            <input type="color" id="color1" value="#FF0000">
            <input type="color" id="color2" value="#00FF00">
            <input type="color" id="color3" value="#0000FF">
            <input type="color" id="color4" value="#FFFF00">
            <input type="color" id="color5" value="#FF00FF">
        </div>
        <button id="randomizeColors">Randomize Colors</button>
    `,
    photoBoxes: `
        <h3>Photo Box Tools</h3>
        <input type="file" id="imageUpload" accept="image/*">
    `,
    imageBoxes: `
        <h3>Image Box Tools</h3>
        <input type="file" id="imageUpload" accept="image/*">
    `,
    textBoxes: `
        <h3>Text Box Tools</h3>
        <label for="fontSize">Font Size:</label>
        <select id="fontSize">
            <option value="12px">12px</option>
            <option value="16px" selected>16px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
        </select>
        <label for="fontFamily">Font Family:</label>
        <select id="fontFamily">
            <option value="Arial" selected>Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Courier New">Courier New</option>
        </select>
    `
};

// Update toolbar based on layer
function updateToolbar() {
    layerTools.innerHTML = layerToolConfigs[currentLayer];
    
    // Reattach event listeners for color palette
    if (currentLayer === 'modules' || currentLayer === 'moduleGroups') {
        const colorInputs = [
            document.getElementById('color1'),
            document.getElementById('color2'),
            document.getElementById('color3'),
            document.getElementById('color4'),
            document.getElementById('color5')
        ];
        colorInputs.forEach(input => {
            if (input) {
                input.addEventListener('change', () => {
                    selectedColor = input.value;
                });
            }
        });
        const randomizeColors = document.getElementById('randomizeColors');
        if (randomizeColors) {
            randomizeColors.addEventListener('click', () => {
                colorInputs.forEach(input => {
                    if (input) {
                        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
                        input.value = randomColor;
                    }
                });
                selectedColor = colorInputs[0].value;
            });
        }
    }
    
    // Reattach event listeners for image upload
    if (currentLayer === 'photoBoxes' || currentLayer === 'imageBoxes') {
        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const img = new Image();
                    img.src = URL.createObjectURL(file);
                    img.onload = () => {
                        currentRect.image = img;
                        drawSpread();
                    };
                }
            });
        }
    }
    
    // Reattach event listeners for text box options
    if (currentLayer === 'textBoxes') {
        const fontSize = document.getElementById('fontSize');
        const fontFamily = document.getElementById('fontFamily');
        if (fontSize) {
            fontSize.addEventListener('change', () => {
                selectedFontSize = fontSize.value;
            });
        }
        if (fontFamily) {
            fontFamily.addEventListener('change', () => {
                selectedFontFamily = fontFamily.value;
            });
        }
    }
}

// Layer selection
layerSelect.addEventListener('change', () => {
    currentLayer = layerSelect.value;
    updateToolbar();
    drawSpread();
});

// Draw yearbook spread
function drawSpread() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate dimensions (72 DPI)
    const pageWidth = (canvas.width - 20) / 2;
    const pageHeight = canvas.height;
    const margin = pageWidth * (1 / 8.5);
    const gutter = 20;
    
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
            if (layer === 'textBoxes') {
                ctx.font = `${rect.fontSize || selectedFontSize} ${rect.fontFamily || selectedFontFamily}`;
                ctx.fillStyle = rect.fill || selectedColor;
                ctx.fillText('Sample Text', rect.x, rect.y + parseInt(rect.fontSize || selectedFontSize));
                ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            } else if (rect.image && (layer === 'photoBoxes' || layer === 'imageBoxes')) {
                ctx.drawImage(rect.image, rect.x, rect.y, rect.width, rect.height);
                ctx.strokeStyle = rect.stroke || '#000';
                ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            } else {
                ctx.fillStyle = rect.fill || selectedColor;
                ctx.strokeStyle = rect.stroke || '#000';
                ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
                ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            }
        });
    });
}

// Mouse events for dragging rectangles
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    isDragging = true;
    currentRect = {
        x: startX,
        y: startY,
        width: 0,
        height: 0,
        fill: selectedColor,
        stroke: '#000',
        fontSize: selectedFontSize,
        fontFamily: selectedFontFamily
    };
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    currentRect.width = x - startX;
    currentRect.height = y - startY;
    drawSpread();
    if (currentLayer === 'textBoxes') {
        ctx.font = `${selectedFontSize} ${selectedFontFamily}`;
        ctx.fillStyle = selectedColor;
        ctx.fillText('Sample Text', currentRect.x, currentRect.y + parseInt(selectedFontSize));
        ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
    } else if (currentRect.image && (currentLayer === 'photoBoxes' || currentLayer === 'imageBoxes')) {
        ctx.drawImage(currentRect.image, currentRect.x, currentRect.y, currentRect.width, currentRect.height);
        ctx.strokeStyle = currentRect.stroke;
        ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
    } else {
        ctx.fillStyle = currentRect.fill;
        ctx.strokeStyle = currentRect.stroke;
        ctx.fillRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
        ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
    }
});

canvas.addEventListener('mouseup', () => {
    if (isDragging) {
        layers[currentLayer].push(currentRect);
        isDragging = false;
        drawSpread();
    }
});

// Initialize toolbar
updateToolbar();
drawSpread();