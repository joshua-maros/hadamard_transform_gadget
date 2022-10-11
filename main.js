document.addEventListener('DOMContentLoaded', () => { main() })

function main() {
    const leftCanvas = document.getElementById('left');
    const stylesheet = document.getElementById('stylesheet');

    const draw = () => {
        const leftCtx = getRenderingContextPlusExtras(leftCanvas);
        leftCtx.fillStyle = 'black';
        leftCtx.fillRect(0.0, 0.0, 1.0, 1.0);
        const grid = [];
        for (let i = 0; i < 16; i++) {
            grid.push(polarComplexNum(1.0, i));
        }
        leftCtx.fillNumberGrid(point(0.2, 0.2), 0.8, grid, 4);
    };

    const resizeCanvases = () => {
        leftCanvas.width = leftCanvas.clientWidth;
        leftCanvas.height = leftCanvas.clientHeight;
        draw();
    };

    resizeCanvases();
    stylesheet.onload = resizeCanvases;
    // just in case lol
    setTimeout(resizeCanvases, 1000);
    setTimeout(resizeCanvases, 3000);
    setTimeout(resizeCanvases, 9000);
}

function point(x, y) {
    return {x, y};
}

function addPoint(a, b) {
    return point(a.x + b.x, a.y + b.y);
}

function complexNum(r, i) {
    return {r, i, a: Math.sqrt(r * r + i * i)};
}

function scaleComplexNum(n, s) {
    return complexNum(n.r * s, n.i * s);
}

function polarComplexNum(a, p) {
    return complexNum(a * Math.cos(p), a * Math.sin(p));
}

function getRenderingContextPlusExtras(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.resetTransform();
    const scale = ctx.canvas.clientWidth;
    ctx.scale(scale, scale);

    ctx.fillAndStrokeCircle= (center, radius) => {
        ctx.beginPath();
        ctx.ellipse(center.x, center.y, radius, radius, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    };

    ctx.fillComplexNum = (center, size, num) => {
        ctx.lineWidth = 0.2 * size;
        ctx.fillStyle = '#d902bd';
        ctx.strokeStyle = '#fc42e4';
        ctx.fillAndStrokeCircle(addPoint(center, point(size * num.r, size * num.i)), 0.6 * size * num.a);
        ctx.fillStyle = '#027cd9';
        ctx.strokeStyle = '#3dabff';
        ctx.fillAndStrokeCircle(center, size * num.a);
    };

    ctx.fillNumberGrid = (topLeft, size, numbers, cols) => {
        const step = size / cols;
        const p = addPoint(topLeft, point(step / 2, step / 2));
        const maxa = Math.max(...numbers.map(x => x.a));
        for (const num of numbers) {
            ctx.fillComplexNum(p, step / 4.0, num);
            p.x += step;
            if (p.x > topLeft.x + size) {
                p.x = topLeft.x + step / 2;
                p.y += step;
            }
        }
    }

    return ctx;
}
