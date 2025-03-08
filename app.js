// State
let stage = 'welcome';
let score = 0;
let gaps = [];
const canvas = document.getElementById('graph');
const ctx = canvas.getContext('2d');
let chart;

// Cursor position (initially at vertex)
let cursorX = 0;
let cursorY = 0;
let dragging = false;

// Graph setup
function initGraph(a = 1, b = 0, c = 0) {
    const data = [];
    for (let x = -10; x <= 10; x += 0.1) {
        data.push({ x, y: a * x * x + b * x + c });
    }
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: [{ label: 'y = ax² + bx + c', data, borderColor: 'black', fill: false, pointRadius: 0 }] },
        options: {
            scales: {
                x: { type: 'linear', position: 'bottom', grid: { color: 'blue' }, ticks: { color: 'blue' } },
                y: { grid: { color: 'green' }, ticks: { color: 'green' } }
            },
            plugins: { legend: { display: false } }
        }
    });
    // Update cursor to vertex
    cursorX = -b / (2 * a);
    cursorY = a * cursorX * cursorX + b * cursorX + c;
    drawCursor();
}

// Draw cursor
function drawCursor() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear for Chart.js redraw
    chart.update();
    const xPixel = (cursorX + 10) * 15; // Scale to canvas (300px, -10 to 10)
    const yPixel = 150 - cursorY * 15; // Center at 150, invert y
    ctx.beginPath();
    ctx.arc(xPixel, yPixel, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
}

// Screen renderer
function render() {
    const screen = document.getElementById('screen');
    screen.innerHTML = '';
    if (stage === 'welcome') {
        screen.innerHTML = '<p>Learn quadratics your way. Start with a quick test!</p><button onclick="startAssessment()">Begin</button>';
    } else if (stage === 'assessment') {
        renderAssessment();
    } else if (stage === 'learning') {
        renderLearning();
    } else if (stage === 'report') {
        renderReport();
    }
}

// Assessment
const questions = [
    { q: 'Which is a quadratic? A) 2x + 3 = 0, B) x² - 4 = 0', a: 'B', gap: 'identification' },
    { q: 'Solve x² - 9 = 0. A) x = 3, B) x = ±3', a: 'B', gap: 'factoring' },
    { q: 'What’s the quadratic formula? A) x = -b ± √(b² - 4ac), B) x = (-b ± √(b² - 4ac)) / 2a', a: 'B', gap: 'formula' }
];
let qIndex = 0;

function startAssessment() {
    stage = 'assessment';
    qIndex = 0;
    score = 0;
    gaps = [];
    render();
}

function renderAssessment() {
    const screen = document.getElementById('screen');
    if (qIndex < questions.length) {
        screen.innerHTML = `<p>${questions[qIndex].q}</p>
            <button onclick="checkAnswer('A')">A</button>
            <button onclick="checkAnswer('B')">B</button>`;
    } else {
        stage = 'learning';
        render();
    }
}

function checkAnswer(choice) {
    if (choice === questions[qIndex].a) score++;
    else gaps.push(questions[qIndex].gap);
    qIndex++;
    render();
}

// Learning
const lessons = [
    { text: 'Quadratics are ax² + bx + c = 0. Try dragging the red dot!', practice: 'Graph y = x² - 4' },
    { text: 'Factor x² - 5x + 6 = 0: (x - 2)(x - 3) = 0, x = 2, 3', practice: 'Factor x² + 7x + 12 = 0' },
    { text: 'Formula: x = (-b ± √(b² - 4ac)) / 2a. Solve 2x² + 3x - 2 = 0', practice: 'Solve x² - 4x - 5 = 0' }
];
let lIndex = 0;

function renderLearning() {
    const screen = document.getElementById('screen');
    if (lIndex < lessons.length) {
        screen.innerHTML = `<p>${lessons[lIndex].text}</p><p>Practice: ${lessons[lIndex].practice}</p>
            <input id="answer" type="text" placeholder="Your answer"><button onclick="checkPractice()">Submit</button>`;
    } else {
        stage = 'report';
        render();
    }
}

function checkPractice() {
    const answer = document.getElementById('answer').value;
    if (answer.includes('x') || answer.includes('=') || answer.match(/\d/)) lIndex++;
    render();
}

// Report
function renderReport() {
    const screen = document.getElementById('screen');
    const progress = (score / questions.length) * 100;
    screen.innerHTML = `<p>Your Mastery: ${progress}%</p><p>Gaps Closed: ${gaps.length > 0 ? gaps.join(', ') : 'None'}</p>`;
    document.getElementById('report').innerHTML = 'Keep dragging the cursor to explore!';
}

// Equation inputs
document.querySelectorAll('#equation-input input').forEach(input => {
    input.addEventListener('input', () => {
        const a = parseFloat(document.getElementById('a').value);
        const b = parseFloat(document.getElementById('b').value);
        const c = parseFloat(document.getElementById('c').value);
        initGraph(a, b, c);
    });
});

// Cursor dragging
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / 15 - 10; // Scale to -10 to 10
    const y = -(e.clientY - rect.top - 150) / 15; // Center at 150
    if (Math.hypot(x - cursorX, y - cursorY) < 1) dragging = true; // Near cursor
});

canvas.addEventListener('mousemove', (e) => {
    if (dragging) {
        const rect = canvas.getBoundingClientRect();
        cursorX = (e.clientX - rect.left) / 15 - 10;
        cursorY = -(e.clientY - rect.top - 150) / 15;
        
        let a = parseFloat(document.getElementById('a').value);
        const b = -2 * a * cursorX; // Vertex at cursorX
        const c = cursorY - a * cursorX * cursorX; // Solve for c
        
        // If far from vertex, adjust 'a' to stretch
        const vertexY = a * cursorX * cursorX + b * cursorX + c;
        if (Math.abs(cursorY - vertexY) > 0.5) {
            a = (cursorY - c) / (cursorX * cursorX); // Recalculate a
        }

        document.getElementById('a').value = a.toFixed(1);
        document.getElementById('b').value = b.toFixed(1);
        document.getElementById('c').value = c.toFixed(1);
        initGraph(a, b, c);
    }
});

canvas.addEventListener('mouseup', () => dragging = false);

// Start
initGraph();
render();
