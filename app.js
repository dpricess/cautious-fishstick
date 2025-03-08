// State
let stage = 'welcome';
let score = 0;
let gaps = [];
const canvas = document.getElementById('graph');
const ctx = canvas.getContext('2d');
let chart;

// Cursor position
let cursorX = 0;
let cursorY = 0;
let dragging = false;
let dragMode = null;

// Graph setup
function initGraph(a = 1, b = 0, c = 0) {
    const data = [];
    for (let x = -10; x <= 10; x += 0.1) {
        data.push({ x, y: a * x * x + b * x + c });
    }
    
    const vertexX = -b / (2 * a);
    const vertexY = a * vertexX * vertexX + b * vertexX + c;
    const discriminant = b * b - 4 * a * c;
    const roots = discriminant >= 0 ? [
        { x: (-b + Math.sqrt(discriminant)) / (2 * a), y: 0 },
        { x: (-b - Math.sqrt(discriminant)) / (2 * a), y: 0 }
    ] : [];

    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                { label: 'Parabola', data, borderColor: 'black', fill: false, pointRadius: 0 },
                { label: 'Vertex', data: [{ x: vertexX, y: vertexY }], pointRadius: 5, pointBackgroundColor: 'purple', showLine: false },
                { label: 'Roots', data: roots, pointRadius: 5, pointBackgroundColor: 'orange', showLine: false }
            ]
        },
        options: {
            scales: {
                x: { 
                    type: 'linear', 
                    position: 'bottom', 
                 grid: {
                             drawTicks: true,
                            color: (ctx) => ctx.tick.value === 0 ? 'red' : 'gray', // x-axis in blue, grid lines in gray
                            lineWidth: (ctx) => ctx.tick.value === 0 ? 2 : 0.5 // Thicker for the x-axis
                        },
                ticks: {
                            color: 'blue' // x-axis tick labels in blue
                        },
                
                    min: -15, 
                    max: 15 
                },
                y: { 
                    type: 'linear',
                    grid: {
                        drawTicks: true,
                        color: (ctx) => ctx.tick.value === 0 ? 'green' : 'gray', // y-axis in green, grid lines in gray
                            lineWidth: (ctx) => ctx.tick.value === 0 ? 2 : 0.5 // Thicker for the y-axis
                        },
                        ticks: {
                            color: 'green' // y-axis tick labels in green
                        },
                    
                    min: -10, 
                    max: 10 
                }
            },
            plugins: { legend: { display: false } }
        }
    });
    cursorX = vertexX;
    cursorY = vertexY;
    drawCursor();
}

// Draw cursor
function drawCursor() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    chart.update();
    const xPixel = (cursorX + 10) * 15;
    const yPixel = 150 - cursorY * 15;
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
    { text: 'Quadratics are ax² + bx + c = 0. Drag the red dot to shift or stretch!', practice: 'Graph y = x² - 4' },
    { text: 'Factor x² - 5x + 6 = 0: (x - 2)(x - 3) = 0, x = 2, 3', practice: 'Factor x² + 7x + 12 = 0' },
    { text: 'Formula: x = (-b ± √(b² - 4ac)) / 2a. Ex: A ball’s height h = -4.9t² + 10t, peaks at t = 1.02s', practice: 'Solve x² - 4x - 5 = 0' },
    { text: 'Parabolic Motion: h = -16t² + 32t + 5 (feet). Hits ground when h = 0, t ≈ 2.15s', practice: 'Find when h = -16t² + 20t = 0' }
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
    if (answer.includes('x') || answer.includes('=') || answer.match(/\d/) || answer.match(/t/)) lIndex++;
    render();
}

// Report
function renderReport() {
    const screen = document.getElementById('screen');
    const progress = (score / questions.length) * 100;
    screen.innerHTML = `<p>Your Mastery: ${progress}%</p><p>Gaps Closed: ${gaps.length > 0 ? gaps.join(', ') : 'None'}</p>`;
    document.getElementById('report').innerHTML = 'Keep dragging the cursor to explore!';
}

// Equation inputs (update on Enter)
document.querySelectorAll('#equation-input input').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const a = parseFloat(document.getElementById('a').value);
            const b = parseFloat(document.getElementById('b').value);
            const c = parseFloat(document.getElementById('c').value);
            initGraph(a, b, c);
        }
    });
});

// Cursor dragging
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / 15 - 10;
    const y = -(e.clientY - rect.top - 150) / 15;
    const vertexX = -parseFloat(document.getElementById('b').value) / (2 * parseFloat(document.getElementById('a').value));
    if (Math.hypot(x - cursorX, y - cursorY) < 1) {
        dragging = true;
        dragMode = Math.abs(x - vertexX) < 1 ? 'vertex' : 'stretch';
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (dragging) {
        const rect = canvas.getBoundingClientRect();
        cursorX = (e.clientX - rect.left) / 15 - 10;
        cursorY = -(e.clientY - rect.top - 150) / 15;
        
        let a = parseFloat(document.getElementById('a').value);
        let b = parseFloat(document.getElementById('b').value);
        let c = parseFloat(document.getElementById('c').value);

        if (dragMode === 'vertex') {
            b = -2 * a * cursorX;
            c = cursorY - a * cursorX * cursorX;
        } else if (dragMode === 'stretch') {
            a = (cursorY - c) / (cursorX * cursorX);
            b = -2 * a * cursorX;
        }

        document.getElementById('a').value = a.toFixed(1);
        document.getElementById('b').value = b.toFixed(1);
        document.getElementById('c').value = c.toFixed(1);
        initGraph(a, b, c);
    }
});

canvas.addEventListener('mouseup', () => {
    dragging = false;
    dragMode = null;
});

// Start
initGraph();
render();
