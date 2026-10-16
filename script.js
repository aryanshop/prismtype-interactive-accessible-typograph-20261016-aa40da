document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fontPrimary = document.getElementById('font-primary');
    const baseSizeInput = document.getElementById('base-size');
    const valBaseSize = document.getElementById('val-base-size');
    const lineHeightInput = document.getElementById('line-height');
    const valLineHeight = document.getElementById('val-line-height');
    const letterSpacingInput = document.getElementById('letter-spacing');
    const valLetterSpacing = document.getElementById('val-letter-spacing');

    const textColorInput = document.getElementById('text-color');
    const bgColorInput = document.getElementById('bg-color');
    const accentColorInput = document.getElementById('accent-color');

    const contrastRatioEl = document.getElementById('contrast-ratio');
    const wcagAaEl = document.getElementById('wcag-aa');
    const wcagAaaEl = document.getElementById('wcag-aaa');
    const liveStatusEl = document.getElementById('live-status');
    const metricComplianceEl = document.getElementById('metric-compliance');

    const visionFilterSelect = document.getElementById('vision-filter');
    const simulationViewport = document.getElementById('simulation-viewport');

    const resetBtn = document.getElementById('reset-btn');
    const exportBtn = document.getElementById('export-btn');

    const exportModal = document.getElementById('export-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const copyCodeBtn = document.getElementById('copy-code-btn');
    const exportCodeArea = document.getElementById('export-code');

    // Helper: Convert hex to RGB
    function hexToRgb(hex) {
        let cleanHex = hex.replace('#', '');
        if (cleanHex.length === 3) {
            cleanHex = cleanHex.split('').map(c => c + c).join('');
        }
        const num = parseInt(cleanHex, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    }

    // Calculate relative luminance
    function getLuminance(r, g, b) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    // Calculate contrast ratio between two hex colors
    function getContrastRatio(hex1, hex2) {
        try {
            const rgb1 = hexToRgb(hex1);
            const rgb2 = hexToRgb(hex2);
            const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
            const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
            const brightest = Math.max(lum1, lum2);
            const darkest = Math.min(lum1, lum2);
            return (brightest + 0.05) / (darkest + 0.05);
        } catch (e) {
            return 1;
        }
    }

    // Update typography & color parameters
    function updateSandbox() {
        const fontFamily = fontPrimary.value;
        const baseSize = baseSizeInput.value + 'px';
        const lineHeight = lineHeightInput.value;
        const letterSpacing = letterSpacingInput.value + 'px';

        const textColor = textColorInput.value;
        const bgColor = bgColorInput.value;
        const accentColor = accentColorInput.value;

        // Update UI labels
        valBaseSize.textContent = baseSizeInput.value;
        valLineHeight.textContent = lineHeightInput.value;
        valLetterSpacing.textContent = letterSpacingInput.value;

        // Apply styles to simulation viewport
        simulationViewport.style.setProperty('--font-stack', fontFamily);
        simulationViewport.style.setProperty('--base-font-size', baseSize);
        simulationViewport.style.setProperty('--line-height-val', lineHeight);
        simulationViewport.style.setProperty('--letter-space-val', letterSpacing);
        simulationViewport.style.setProperty('--user-text', textColor);
        simulationViewport.style.setProperty('--user-bg', bgColor);
        simulationViewport.style.setProperty('--user-accent', accentColor);

        // Calculate Contrast & WCAG Compliance
        const ratio = getContrastRatio(textColor, bgColor);
        contrastRatioEl.textContent = ratio.toFixed(2) + ':1';

        // WCAG 2.1 Criteria (Normal text: AA >= 4.5:1, AAA >= 7:1)
        const isAaPass = ratio >= 4.5;
        const isAaaPass = ratio >= 7.0;

        if (isAaPass) {
            wcagAaEl.textContent = 'WCAG AA: Pass';
            wcagAaEl.className = 'wcag-badge pass';
        } else {
            wcagAaEl.textContent = 'WCAG AA: Fail';
            wcagAaEl.className = 'wcag-badge fail';
        }

        if (isAaaPass) {
            wcagAaaEl.textContent = 'WCAG AAA: Pass';
            wcagAaaEl.className = 'wcag-badge pass';
        } else {
            wcagAaaEl.textContent = 'WCAG AAA: Fail';
            wcagAaaEl.className = 'wcag-badge fail';
        }

        if (isAaPass) {
            liveStatusEl.textContent = isAaaPass ? 'AAA Compliant' : 'AA Compliant';
            liveStatusEl.className = 'status-indicator';
            metricComplianceEl.textContent = isAaaPass ? 'Level AAA' : 'Level AA';
        } else {
            liveStatusEl.textContent = 'Contrast Warning';
            liveStatusEl.className = 'status-indicator fail';
            metricComplianceEl.textContent = 'Non-Compliant';
        }
    }

    // Vision filter handling
    visionFilterSelect.addEventListener('change', (e) => {
        const filter = e.target.value;
        simulationViewport.className = 'simulation-viewport';
        if (filter !== 'none') {
            simulationViewport.classList.add(`filter-${filter}`);
        }
    });

    // Event Listeners for inputs
    [fontPrimary, baseSizeInput, lineHeightInput, letterSpacingInput, textColorInput, bgColorInput, accentColorInput].forEach(element => {
        if (element) {
            element.addEventListener('input', updateSandbox);
        }
    });

    // Reset button
    resetBtn.addEventListener('click', () => {
        fontPrimary.value = 'system-ui, -apple-system, sans-serif';
        baseSizeInput.value = 16;
        lineHeightInput.value = 1.5;
        letterSpacingInput.value = 0;
        textColorInput.value = '#111827';
        bgColorInput.value = '#f9fafb';
        accentColorInput.value = '#4f46e5';
        visionFilterSelect.value = 'none';
        simulationViewport.className = 'simulation-viewport';
        updateSandbox();
    });

    // Export Modal handling
    exportBtn.addEventListener('click', () => {
        const cssOutput = `:root {
  --font-primary: ${fontPrimary.value};
  --font-size-base: ${baseSizeInput.value}px;
  --line-height-base: ${lineHeightInput.value};
  --letter-spacing-base: ${letterSpacingInput.value}px;
  --color-text: ${textColorInput.value};
  --color-background: ${bgColorInput.value};
  --color-accent: ${accentColorInput.value};
}`;
        exportCodeArea.value = cssOutput;
        exportModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        exportModal.classList.add('hidden');
    });

    copyCodeBtn.addEventListener('click', () => {
        exportCodeArea.select();
        navigator.clipboard.writeText(exportCodeArea.value).then(() => {
            copyCodeBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyCodeBtn.textContent = 'Copy to Clipboard';
            }, 2000);
        }).catch(() => {
            // Fallback for secure context issues
            document.execCommand('copy');
            copyCodeBtn.textContent = 'Copied!';
        });
    });

    exportModal.addEventListener('click', (e) => {
        if (e.target === exportModal) {
            exportModal.classList.add('hidden');
        }
    });

    // Initial setup calculation
    updateSandbox();
});
