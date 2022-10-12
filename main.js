document.addEventListener('DOMContentLoaded', () => { main() })

function doHadamardTransform(target) {
    // Copy the array.
    let prev_result = Array.from(target);
    let next_result = Array.from(target);
    const dims = Math.log2(target.length);

    for (let dim = 0; dim < dims; dim++) {
        const stride = Math.pow(2, dim);
        for (let groupStart = 0; groupStart < target.length; groupStart += 2 * stride) {
            for (let element = 0; element < stride; element++) {
                const ia = groupStart + element;
                const ib = groupStart + element + stride;
                next_result[ia] = scaleComplexNum(addComplexNum(prev_result[ia], prev_result[ib]), Math.SQRT1_2);
                next_result[ib] = scaleComplexNum(subComplexNum(prev_result[ia], prev_result[ib]), Math.SQRT1_2);
            }
        }
        prev_result = Array.from(next_result);
    }

    return prev_result;
}

function main() {
    const leftCanvas = document.getElementById('left');
    const rightCanvas = document.getElementById('right');
    const stylesheet = document.getElementById('stylesheet');
    const smallDevice = /Mobi/.test(navigator.userAgent);
    const touchDevice = 'ontouchstart' in document.documentElement;

    // Put it in an object so it can be mutated across each closure.
    const state = {
        cols: 0,
        input: [],
        selectedTool: 'magnitude',
        currentTool: 'magnitude',
        dragStart: point(0, 0),
        dragLast: point(0, 0),
        dragging: false,
        mouseDown: false,
        isRightClick: false,
        oldInput: [],
        targetIndex: 0,
    };

    document.oncontextmenu = () => false;
    document.getElementById('magnitude-tool').addEventListener('click', () => { state.selectedTool = 'magnitude' });
    document.getElementById('phase-tool').addEventListener('click', () => { state.selectedTool = 'phase' });
    if (!touchDevice) {
        document.getElementById('magnitude-tool').remove();
        document.getElementById('phase-tool').remove();
    }

    const setNumBits = (numBits, cols) => {
        state.cols = cols;
        state.input = [];
        state.input.push(polarComplexNum(1.0, 0.0));
        for (let i = 1; i < numBits; i++) {
            state.input.push(polarComplexNum(0.0, 0.0));
        }
    };
    setNumBits(4, 2);

    const GRID_START = point(0.2, 0.2);
    const GRID_SIZE = 0.6;

    const setTooltip = (tooltip) => {
        document.getElementById('tooltip').innerText = tooltip;
    }
    setTooltip('');

    const draw = () => {
        const leftCtx = getRenderingContextPlusExtras(leftCanvas);
        leftCtx.fillStyle = 'black';
        leftCtx.fillRect(0.0, 0.0, 1.0, 1.0);
        leftCtx.fillNumberGrid(GRID_START, GRID_SIZE, state.input, state.cols);

        const output = doHadamardTransform(state.input);

        const rightCtx = getRenderingContextPlusExtras(rightCanvas);
        rightCtx.fillStyle = 'black';
        rightCtx.fillRect(0.0, 0.0, 1.0, 1.0);
        rightCtx.fillNumberGrid(GRID_START, GRID_SIZE, output, state.cols);
    };

    const screenPointToLeftCanvasPoint = (x, y) => {
        const leftCtx = getRenderingContextPlusExtras(leftCanvas);
        const rect = leftCanvas.getBoundingClientRect();
        return leftCtx.pixelToPoint(x - rect.left, y - rect.top);
    }

    const screenSizeToCanvasSize = (s) => {
        const leftCtx = getRenderingContextPlusExtras(leftCanvas);
        return leftCtx.pixelToPoint(s, 0).x;
    }

    const setMagnitudes = (indexes, newMagnitudes) => {
        if (indexes.length != newMagnitudes.length) {
            throw new Error();
        }
        const restScale = Math.sqrt(1.0 / (state.input.length - indexes.length));
        let oldTargetsMag = Math.sqrt(indexes.map(i => state.oldInput[i]).map(n => n.m * n.m).reduce((a, b) => a + b, 0));
        let newTargetsMag = Math.sqrt(newMagnitudes.map(m => m * m).reduce((a, b) => a + b, 0));
        const oldRestMag = Math.sqrt(Math.max(1.0 - oldTargetsMag * oldTargetsMag, 0.0)) * restScale;
        const newRestMag = Math.sqrt(Math.max(1.0 - newTargetsMag * newTargetsMag, 0.0)) * restScale;
        for (let index = 0; index < state.input.length; index++) {
            const old = state.oldInput[index];
            let newVal;
            const newIndex = indexes.findIndex(i => i == index);
            if (newIndex == -1) {
                newVal = scaleComplexNumByRatio(old, newRestMag, oldRestMag);
            } else {
                newVal = scaleComplexNumByRatio(old, newMagnitudes[newIndex], old.m);
            }
            state.input[index] = newVal;
        }
    }

    const setTargetMagnitude = (newTargetMag) => {
        setMagnitudes([state.targetIndex], [newTargetMag]);
    }

    const onMouseDownLeft = (e) => {
        const point = screenPointToLeftCanvasPoint(e.clientX, e.clientY);
        state.dragStart = point;
        state.dragLast = point;
        state.dragging = false;
        const gridx = (point.x - GRID_START.x) / GRID_SIZE * state.cols;
        const gridy = (point.y - GRID_START.y) / GRID_SIZE * state.cols;
        if (gridx >= 0 && gridy >= 0 && gridx < state.cols && gridy < state.cols) {
            state.mouseDown = true;
            state.isRightClick = e.button == 2;
            state.currentTool = state.isRightClick ? 'phase' : state.selectedTool;
            const index = Math.floor(gridx) + Math.floor(gridy) * state.cols;
            state.targetIndex = index;
            state.oldInput = Array.from(state.input);
            if (state.currentTool == 'phase' && state.input[state.targetIndex].m < 1e-5) {
                const nonZero = state.input.filter(x => x.m > 1e-5).length;
                const targetMagnitude = Math.sqrt(1.0 / (nonZero + 1.0));
                setTargetMagnitude(targetMagnitude);
                draw();
            }
        }
    }

    const onMouseMove = (e) => {
        const mousePoint = screenPointToLeftCanvasPoint(e.clientX, e.clientY);
        if (
            mousePoint.x >= GRID_START.x
            && mousePoint.y >= GRID_START.y
            && mousePoint.x <= GRID_START.x + GRID_SIZE
        ) {
            if (mousePoint.y <= GRID_START.y + GRID_SIZE) {
                if (touchDevice) {
                    setTooltip('Tap or drag to adjust.');
                } else {
                    setTooltip('Click or drag to adjust magnitude, right button adjusts phase.');
                }
            } else {
                setTooltip('Number icons are scaled up by this amount to make them easier to read.');
            }
        } else {
            setTooltip('');
        }
        if (!state.mouseDown) return;
        if (!state.dragging) {
            const minDragPx = parseFloat(getComputedStyle(document.body).fontSize);
            const minDrag = screenSizeToCanvasSize(minDragPx) * (smallDevice ? 2.0 : 0.5);
            if (distancePoint(mousePoint, state.dragStart) > minDrag) {
                state.dragging = true;
            }
        }
        if (state.dragging) {
            if (state.currentTool == 'magnitude') {
                const offset = 3.0 * (mousePoint.x - state.dragStart.x - (mousePoint.y - state.dragStart.y));
                const oldTargetMag = state.oldInput[state.targetIndex].m;
                const newTargetMag = Math.sqrt(Math.min(Math.max(oldTargetMag * oldTargetMag + offset, 0.0), 1.0));
                setTargetMagnitude(newTargetMag);
            } else if (state.currentTool == 'phase') {
                // oh no repeated code
                const centerX = GRID_START.x + (state.targetIndex % state.cols + 0.5) * (GRID_SIZE / state.cols);
                const centerY = GRID_START.y + (Math.floor(state.targetIndex / state.cols) + 0.5) * (GRID_SIZE / state.cols);
                state.input[state.targetIndex] = setPhaseToMatch(
                    state.input[state.targetIndex],
                    complexNum(mousePoint.x - centerX, mousePoint.y - centerY)
                );
            }
            draw();
        }
    }

    const onMouseUp = () => {
        if (!state.mouseDown) return;
        state.mouseDown = false;
        if (!state.dragging) {
            if (state.currentTool == 'magnitude') {
                const nonZero = state.oldInput.filter(x => x.m > 1e-5).length;
                const targetMagnitude = Math.sqrt(1.0 / (nonZero + 1.0));
                const typicalMagnitude = Math.sqrt(1.0 / nonZero);
                const currentlyHigh = state.oldInput[state.targetIndex].m >= typicalMagnitude / 10.0;
                setTargetMagnitude(currentlyHigh ? 0.0 : targetMagnitude);
            } else if (state.currentTool == 'phase') {
                const n = state.oldInput[state.targetIndex];
                if (n.m >= 1e-5) {
                    n.r = -n.r;
                    n.i = -n.i;
                }
            }
        }
        if (state.currentTool == 'magnitude') {
            const nonZero = state.input.filter(x => x.m > 1e-5).length;
            const typicalMagnitude = Math.sqrt(1.0 / nonZero);
            let allIndices = [];
            for (let i = 0; i < state.input.length; i++) allIndices.push(i);
            const close = allIndices.filter(i => Math.abs(state.input[i].m - typicalMagnitude) < 0.2 * typicalMagnitude);
            const mags = close.map(_ => typicalMagnitude);
            state.oldInput = Array.from(state.input);
            setMagnitudes(close, mags);
        } else if (state.currentTool == 'phase') {
            const num = state.input[state.targetIndex];
            const phase = Math.atan2(num.i, num.r);
            const snappedPhase = Math.round(phase / Math.PI * 12.0) / 12.0 * Math.PI;
            state.input[state.targetIndex] = polarComplexNum(num.m, snappedPhase);
        }
        draw();
    }

    const resizeCanvases = () => {
        leftCanvas.width = leftCanvas.clientWidth;
        leftCanvas.height = leftCanvas.clientHeight;
        rightCanvas.width = rightCanvas.clientWidth;
        rightCanvas.height = rightCanvas.clientHeight;
        draw();
    };

    window.addEventListener('resize', resizeCanvases);
    leftCanvas.addEventListener('mousedown', onMouseDownLeft);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    stylesheet.onload = resizeCanvases;
    // just in case lol
    setTimeout(resizeCanvases, 1000);
    setTimeout(resizeCanvases, 3000);
    setTimeout(resizeCanvases, 9000);
}

function point(x, y) {
    return { x, y };
}

function addPoint(a, b) {
    return point(a.x + b.x, a.y + b.y);
}

function distancePoint(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function complexNum(r, i) {
    return { r, i, m: Math.sqrt(r * r + i * i) };
}

function addComplexNum(a, b) {
    return complexNum(a.r + b.r, a.i + b.i);
}

function subComplexNum(a, b) {
    return complexNum(a.r - b.r, a.i - b.i);
}

function setPhaseToMatch(original, desiredPhaseNum) {
    if (desiredPhaseNum.m < 1e-5) {
        return original
    } else {
        let scale = original.m / desiredPhaseNum.m;
        return scaleComplexNum(desiredPhaseNum, scale);
    }
}

/// Scales n by to / from, handling the case where from == 0.0 && n.m == 0.0.
function scaleComplexNumByRatio(n, to, from) {
    if (from < 1e-5) {
        if (n.m < 1e-5) {
            return polarComplexNum(to, 0.0);
        } else {
            throw new Error('Cannot scale a non-zero number from scale zero.');
        }
    } else {
        return scaleComplexNum(n, to / from);
    }
}

function scaleComplexNum(n, s) {
    return complexNum(n.r * s, n.i * s);
}

function polarComplexNum(m, p) {
    return complexNum(m * Math.cos(p), m * Math.sin(p));
}

function prettyFmtNum(num) {
    if (num < 0.0) {
        throw new Error('unimplemented');
    } else if (num < 10.0) {
        return `${Math.floor(num + 0.005)}.${String(Math.round(num * 100.0) % 100).padStart(2, '0')}`
    } else if (num < 100.0) {
        return `${Math.floor(num + 0.05)}.${Math.round(num * 10.0) % 10}`
    } else {
        return `${Math.round(num)}`
    }
}

function getRenderingContextPlusExtras(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.resetTransform();
    const scale = Math.min(ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    ctx.scale(scale, scale);

    ctx.pixelToPoint = (x, y) => {
        return point(x / scale, y / scale);
    }

    ctx.fillAndStrokeCircle = (center, radius) => {
        ctx.beginPath();
        ctx.ellipse(center.x, center.y, radius, radius, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    };

    ctx.fillComplexNum = (center, size, num) => {
        ctx.lineWidth = 0.2 * size;
        ctx.fillStyle = '#d902bd';
        ctx.strokeStyle = '#fc42e4';
        ctx.fillAndStrokeCircle(addPoint(center, point(size * num.r, size * num.i)), 0.6 * size * num.m);
        ctx.fillStyle = '#027cd9';
        ctx.strokeStyle = '#3dabff';
        ctx.fillAndStrokeCircle(center, size * num.m);
    };

    ctx.fillNumberGrid = (topLeft, size, numbers, cols) => {
        const step = size / cols;
        const p = addPoint(topLeft, point(step / 2, step / 2));
        // const maxm = Math.max(...numbers.map(x => x.m), 1e-4);
        const maxm = 1.0;
        for (const num of numbers) {
            ctx.fillComplexNum(p, step / 4.0, scaleComplexNum(num, 1.0 / maxm));
            p.x += step;
            if (p.x > topLeft.x + size) {
                p.x = topLeft.x + step / 2;
                p.y += step;
            }
        }
        const magSquared = numbers.reduce((acc, next) => acc + next.m * next.m, 0);
        ctx.scale(0.01, 0.01);
        ctx.font = '4px Arial';
        ctx.fillStyle = '#fff';
        // Scale to work around a kerning bug.
        ctx.fillText(`Number icons scaled up ${prettyFmtNum(1.0 / maxm)}x`, 100.0 * topLeft.x, 100.0 * (topLeft.y + size + 0.1));
        ctx.scale(100.0, 100.0);
    }

    return ctx;
}
