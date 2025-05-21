# Yearbook Spread Visualizer

Yearbook Spread Visualizer is a web-based tool designed to help yearbook students create and visualize two-page spread layouts for 8.5" x 11" pages (17" x 11" total in landscape) with customizable colors and draggable elements. Ideal for beginners, it offers an intuitive interface to design spreads with modules (text/content blocks) and image boxes, apply color schemes, and export designs as PDFs for print. The tool uses semantic layouts, includes instructional guidance, and is deployable on GitHub Pages.

## Features
- **Interactive Canvas**: Visualize a two-page spread (17" x 11" in landscape) scaled to 80vw, with red marking lines for 0.125" bleed around each page and a 0.5" gutter between pages.
- **Layered Design**:
  - **Modules Layer**: Draggable semi-transparent blue rectangles for text or content blocks.
  - **Image Boxes Layer**: Draggable dashed green rectangles for image placeholders.
- **Drag-and-Drop**: Click and drag to create or move modules and image boxes. New elements can be added at the top-left (within bleed) via a button.
- **Color Customization**:
  - Select sections (background, modules, or image boxes) via dropdown or by clicking elements.
  - Apply colors from a 5-color swatch (e.g., `8A7B96,7B968A,968A7B,627C70,ADA397`) from [ColorVis](https://kappter.github.io/rgbcolorvis/), neutral colors (`#000000`, `#FFFFFF`, `#333333`, `#666666`, `#CCCCCC`), or custom hex code input.
  - Randomize colors for the palette, keeping modules and image boxes white (#FFFFFF) by default (manually changeable).
  - Hover over swatches to preview, click to apply colors to the selected section (background or all elements in a layer).
- **Mobile Responsiveness**: The canvas scales to 90vw on mobile devices, with a compact, user-friendly interface using Tailwind CSS.
- **PDF Export**: Export the design as a landscape PDF (`yearbook-spread.pdf`) with bleed, gutter, modules, image boxes, and applied colors, suitable for yearbook printing.
- **Beginner-Friendly**:
  - Clear instructions in the UI guide students through designing and exporting.
  - The canvas visually distinguishes modules (semi-transparent blue) and image boxes (dashed green) for easy identification.
  - Red bleed and gutter lines ensure print-ready layouts.

## Usage
1. Open [Yearbook Spread Visualizer](https://kappter.github.io/pagelayout/) in your browser.
2. The canvas displays a 17" x 11" spread (80vw, max 960px) with red 0.125" bleed and 0.5" gutter lines.
3. Select a layer (Modules or Image Boxes) from the dropdown to create or move elements.
4. Click and drag on the canvas to create or reposition rectangles. Modules are semi-transparent blue; image boxes are dashed green.
5. Click "Add Element" to create a 100x100px rectangle at the top-left (within bleed).
6. Customize colors:
   - Paste a 5-color swatch from [ColorVis](https://kappter.github.io/rgbcolorvis/) (e.g., `8A7B96,7B968A,968A7B,627C70,ADA397`) or click "Randomize Colors" to generate a new palette.
   - Select a section (Background, Modules, or Image Boxes) via the dropdown or by clicking an element.
   - Hover over swatches to preview, click to apply colors. Modules and image boxes stay white during randomization but can be manually colored.
7. Click "Export as PDF" to download `yearbook-spread.pdf`, including the spread, bleed, gutter, and all elements with chosen colors.
8. Use the exported PDF as a guide for your yearbook layout in professional design software or for direct printing.

## Exported Output
- **Spread Layout**: 17" x 11" landscape (two 8.5" x 11" pages), scaled to 80vw in the UI, exported at full size in the PDF.
- **Bleed and Gutter**: Red lines mark 0.125" bleed around each page and a 0.5" gutter between pages, included in the PDF.
- **Modules**: Semi-transparent blue rectangles (default `#0000ff33`) for text/content, customizable via color palette.
- **Image Boxes**: Dashed green rectangles (default `#00ff00`) for image placeholders, customizable via color palette.
- **Background**: Default white (#FFFFFF), customizable via swatches or hex input.
- **PDF Export**: Generated via jsPDF, preserving all elements, colors, bleed, and gutter lines in a print-ready landscape format.

## Related Projects
- **[ColorVis](https://kappter.github.io/rgbcolorvis/)**: A tool for visualizing and experimenting with RGB color combinations, perfect for selecting color schemes for the Yearbook Spread Visualizer.
- **[PageVis](https://kappter.github.io/PageVis/)**: A web-based tool for designing webpage layouts, inspiring the color palette and interactive features of this visualizer.

## Installation (for Development)
1. Clone the repository:
   ```bash
   git clone https://github.com/kappter/pagelayout.git
   ```
2. Navigate to the project directory:
   ```bash
   cd pagelayout
   ```
3. Serve the project locally:
   ```bash
   python -m http.server 8000
   ```
4. Open `http://localhost:8000` in your browser.

## Contributing
Submit issues or pull requests via the [GitHub repository](https://github.com/kappter/pagelayout). Suggestions for features (e.g., individual element coloring, text input for modules) are welcome!

## License
© 2025 Ken Kapptie. For educational use only. All rights reserved.