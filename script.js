const canvas = document.getElementById('layoutCanvas');
const ctx = canvas.getContext('2d');
const layerSelect = document.getElementById('layerSelect');
const layerTools = document.getElementById('layerTools');
const exportPDF = document.getElementById('exportPDF');
const exportSVG = document.getElementById('exportSVG');

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
        <p>Click to create bullseye quadrants or drag to draw rectangles.</p>
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
        <label for="headline">Headline:</label>
        <input type="text" id="headline" placeholder="Enter headline" value="ALL CAPS LEAD IN">
        <label for="bodyText">Body Text:</label>
        <input type="text" id="bodyText" placeholder="Enter text" value="Fugit eumenda nobitis nisi...">
        <label for="fontSize">Font Size:</label>
        <select id="fontSize">
            <option value="12px">12px</option>
            <option value="16px" selected>16px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="36px">36px</option>
        </select>
        <label for="fontFamily">Font Family:</label>
        <select id="fontFamily">
            <option value="Arial" selected>Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Helvetica">Helvetica</option>
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
        const headline = document.getElementById('headline');
        const bodyText = document.getElementById('bodyText');
        const fontSize = document.getElementById('fontSize');
        const fontFamily = document.getElementById('fontFamily');
        if (headline) {
            headline.addEventListener('input', () => {
                currentRect.headline = headline.value;
                drawSpread();
            });
        }
        if (bodyText) {
            bodyText.addEventListener('input', () => {
                currentRect.bodyText = bodyText.value;
                drawSpread();
            });
        }
        if (fontSize) {
            fontSize.addEventListener('change', () => {
                selectedFontSize = fontSize.value;
                drawSpread();
            });
        }
        if (fontFamily) {
            fontFamily.addEventListener('change', () => {
                selectedFontFamily = fontFamily.value;
                drawSpread();
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
                if (rect.headline) {
                    ctx.font = `bold ${Math.min(parseInt(rect.fontSize || selectedFontSize) * 1.5, 36)}px ${rect.fontFamily || selectedFontFamily}`;
                    ctx.fillText(rect.headline.toUpperCase(), rect.x, rect.y + parseInt(rect.fontSize || selectedFontSize));
                }
                if (rect.bodyText) {
                    ctx.font = `${rect.fontSize || selectedFontSize} ${rect.fontFamily || selectedFontFamily}`;
                    wrapText(ctx, rect.bodyText, rect.x, rect.y + (rect.headline ? parseInt(rect.fontSize || selectedFontSize) * 2 : parseInt(rect.fontSize || selectedFontSize)), rect.width, parseInt(rect.fontSize || selectedFontSize) * 1.5);
                }
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
                // Draw image placeholder icon
                if (layer === 'photoBoxes' || layer === 'imageBoxes') {
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(rect.x + rect.width / 4, rect.y + rect.height / 4, rect.width / 2, rect.height / 2);
                    ctx.beginPath();
                    ctx.moveTo(rect.x + rect.width / 2, rect.y + rect.height / 4);
                    ctx.lineTo(rect.x + rect.width / 3, rect.y + rect.height / 3);
                    ctx.lineTo(rect.x + rect.width * 2 / 3, rect.y + rect.height / 3);
                    ctx.closePath();
                    ctx.fillStyle = '#000';
                    ctx.fill();
                }
            }
        });
    });
}

// Text wrapping function
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}

// Create bullseye quadrants for Modules layer
function createBullseyeQuadrants(x, y) {
    const pageWidth = (canvas.width - 20) / 2;
    const pageHeight = canvas.height;
    const gutter = 20;
    
    const isLeftPage = x < pageWidth;
    const pageX = isLeftPage ? 0 : pageWidth + gutter;
    const relX = isLeftPage ? x : x - (pageWidth + gutter);
    
    const quadrants = [
        { x: pageX, y: 0, width: relX, height: y, fill: selectedColor, stroke: '#000' },
        { x: pageX + relX, y: 0, width: pageWidth - relX, height: y, fill: selectedColor, stroke: '#000' },
        { x: pageX, y: y, width: relX, height: pageHeight - y, fill: selectedColor, stroke: '#000' },
        { x: pageX + relX, y: y, width: pageWidth - relX, height: pageHeight - y, fill: selectedColor, stroke: '#000' }
    ];
    
    quadrants.forEach(quad => {
        if (quad.width > 0 && quad.height > 0) {
            layers.modules.push(quad);
        }
    });
}

// Mouse events for dragging rectangles or creating bullseye
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    isDragging = true;
    if (currentLayer !== 'modules') {
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
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || currentLayer === 'modules') return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    currentRect.width = x - startX;
    currentRect.height = y - startY;
    drawSpread();
    if (currentLayer === 'textBoxes') {
        ctx.font = `${selectedFontSize} ${selectedFontFamily}`;
        ctx.fillStyle = selectedColor;
        if (currentRect.headline) {
            ctx.font = `bold ${Math.min(parseInt(selectedFontSize) * 1.5, 36)}px ${selectedFontFamily}`;
            ctx.fillText(currentRect.headline.toUpperCase(), currentRect.x, currentRect.y + parseInt(selectedFontSize));
        }
        if (currentRect.bodyText) {
            ctx.font = `${selectedFontSize} ${selectedFontFamily}`;
            wrapText(ctx, currentRect.bodyText, currentRect.x, currentRect.y + (currentRect.headline ? parseInt(selectedFontSize) * 2 : parseInt(selectedFontSize)), currentRect.width, parseInt(selectedFontSize) * 1.5);
        }
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
        if (currentLayer === 'photoBoxes' || currentLayer === 'imageBoxes') {
            ctx.fillStyle = '#fff';
            ctx.fillRect(currentRect.x + currentRect.width / 4, currentRect.y + currentRect.height / 4, currentRect.width / 2, currentRect.height / 2);
            ctx.beginPath();
            ctx.moveTo(currentRect.x + currentRect.width / 2, currentRect.y + currentRect.height / 4);
            ctx.lineTo(currentRect.x + currentRect.width / 3, currentRect.y + currentRect.height / 3);
            ctx.lineTo(currentRect.x + currentRect.width * 2 / 3, currentRect.y + currentRect.height / 3);
            ctx.closePath();
            ctx.fillStyle = '#000';
            ctx.fill();
        }
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    
    if (currentLayer === 'modules') {
        if (Math.abs(endX - startX) < 5 && Math.abs(endY - startY) < 5) {
            createBullseyeQuadrants(startX, startY);
        } else {
            currentRect = {
                x: startX,
                y: startY,
                width: endX - startX,
                height: endY - startY,
                fill: selectedColor,
                stroke: '#000'
            };
            if (currentRect.width !== 0 && currentRect.height !== 0) {
                layers.modules.push(currentRect);
            }
        }
    } else if (currentRect && currentRect.width !== 0 && currentRect.height !== 0) {
        layers[currentLayer].push(currentRect);
    }
    drawSpread();
});

// Export as PDF
exportPDF.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
    });
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    doc.save('layout.pdf');
});

// Export as SVG
exportSVG.addEventListener('click', () => {
    const svgData = `
        <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
            <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml">
                    <img src="${canvas.toDataURL('image/png')}" width="${canvas.width}" height="${canvas.height}"/>
                </div>
            </foreignObject>
        </svg>`;
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'layout.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

// Initialize toolbar
updateToolbar();
drawSpread();