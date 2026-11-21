// --- SETUP ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const N = 128; // Grid size
const SCALE = canvas.width / N;

let isRunning = false;
let isDrawing = false;
let fluid;
let obstacles;

// --- FLUID SOLVER CLASS ---
// Based on "Real-Time Fluid Dynamics for Games" by Jos Stam
class Fluid {
    constructor(dt, diffusion, viscosity) {
        this.size = N;
        this.dt = dt;
        this.diff = diffusion;
        this.visc = viscosity;

        // Velocity fields
        this.u = new Float32Array((N + 2) * (N + 2)).fill(0);
        this.v = new Float32Array((N + 2) * (N + 2)).fill(0);
        this.u_prev = new Float32Array((N + 2) * (N + 2)).fill(0);
        this.v_prev = new Float32Array((N + 2) * (N + 2)).fill(0);

        // Density field
        this.density = new Float32Array((N + 2) * (N + 2)).fill(0);
        this.density_prev = new Float32Array((N + 2) * (N + 2)).fill(0);
    }

    IX(x, y) {
        return x + y * (N + 2);
    }

    addDensity(x, y, amount) {
        this.density[this.IX(x, y)] += amount;
    }

    addVelocity(x, y, amountX, amountY) {
        const index = this.IX(x, y);
        this.u[index] += amountX;
        this.v[index] += amountY;
    }

    step() {
        const visc = this.visc;
        const diff = this.diff;
        const dt = this.dt;
        const u = this.u;
        const v = this.v;
        const u_prev = this.u_prev;
        const v_prev = this.v_prev;
        const density = this.density;
        const density_prev = this.density_prev;

        // Velocity step
        diffuse(1, u_prev, u, visc, dt, 4, N);
        diffuse(2, v_prev, v, visc, dt, 4, N);
        
        project(u_prev, v_prev, u, v, 4, N);
        
        advect(1, u, u_prev, u_prev, v_prev, dt, N);
        advect(2, v, v_prev, u_prev, v_prev, dt, N);

        project(u, v, u_prev, v_prev, 4, N);

        // Density step
        diffuse(0, density_prev, density, diff, dt, 4, N);
        advect(0, density, density_prev, u, v, dt, N);
    }
}

// --- SOLVER FUNCTIONS ---

function set_bnd(b, x, N) {
    for (let i = 1; i <= N; i++) {
        x[IX(0, i)] = b === 1 ? -x[IX(1, i)] : x[IX(1, i)];
        x[IX(N + 1, i)] = b === 1 ? -x[IX(N, i)] : x[IX(N, i)];
        x[IX(i, 0)] = b === 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
        x[IX(i, N + 1)] = b === 2 ? -x[IX(i, N)] : x[IX(i, N)];
    }

    x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
    x[IX(0, N + 1)] = 0.5 * (x[IX(1, N + 1)] + x[IX(0, N)]);
    x[IX(N + 1, 0)] = 0.5 * (x[IX(N, 0)] + x[IX(N + 1, 1)]);
    x[IX(N + 1, N + 1)] = 0.5 * (x[IX(N, N + 1)] + x[IX(N + 1, N)]);
    
    // Obstacle boundaries
    for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= N; j++) {
            if (obstacles[IX(i, j)]) {
                if (b === 1) {
                    x[IX(i,j)] = -x[IX(i-1, j)];
                    x[IX(i,j)] = -x[IX(i+1, j)];
                } else if (b === 2) {
                    x[IX(i,j)] = -x[IX(i, j-1)];
                    x[IX(i,j)] = -x[IX(i, j+1)];
                } else {
                    x[IX(i,j)] = 0;
                }
            }
        }
    }
}

function lin_solve(b, x, x0, a, c, iter, N) {
    const cRecip = 1.0 / c;
    for (let k = 0; k < iter; k++) {
        for (let j = 1; j <= N; j++) {
            for (let i = 1; i <= N; i++) {
                if (obstacles[IX(i,j)]) continue;
                x[IX(i, j)] =
                    (x0[IX(i, j)] +
                    a * (x[IX(i + 1, j)] + x[IX(i - 1, j)] + x[IX(i, j + 1)] + x[IX(i, j - 1)])) *
                    cRecip;
            }
        }
        set_bnd(b, x, N);
    }
}

function diffuse(b, x, x0, diff, dt, iter, N) {
    const a = dt * diff * (N * N);
    lin_solve(b, x, x0, a, 1 + 4 * a, iter, N);
}

function advect(b, d, d0, velocX, velocY, dt, N) {
    let i0, i1, j0, j1;
    const dtx = dt * N;
    const dty = dt * N;

    for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
            if (obstacles[IX(i,j)]) continue;
            let x = i - dtx * velocX[IX(i, j)];
            let y = j - dty * velocY[IX(i, j)];

            if (x < 0.5) x = 0.5;
            if (x > N + 0.5) x = N + 0.5;
            i0 = Math.floor(x);
            i1 = i0 + 1;

            if (y < 0.5) y = 0.5;
            if (y > N + 0.5) y = N + 0.5;
            j0 = Math.floor(y);
            j1 = j0 + 1;

            const s1 = x - i0;
            const s0 = 1 - s1;
            const t1 = y - j0;
            const t0 = 1 - t1;

            d[IX(i, j)] =
                s0 * (t0 * d0[IX(i0, j0)] + t1 * d0[IX(i0, j1)]) +
                s1 * (t0 * d0[IX(i1, j0)] + t1 * d0[IX(i1, j1)]);
        }
    }
    set_bnd(b, d, N);
}

function project(velocX, velocY, p, div, iter, N) {
    for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
            if (obstacles[IX(i,j)]) continue;
            div[IX(i, j)] = -0.5 * (
                velocX[IX(i + 1, j)] - velocX[IX(i - 1, j)] +
                velocY[IX(i, j + 1)] - velocY[IX(i, j - 1)]
            ) / N;
            p[IX(i, j)] = 0;
        }
    }
    set_bnd(0, div, N);
    set_bnd(0, p, N);
    lin_solve(0, p, div, 1, 4, iter, N);

    for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
            if (obstacles[IX(i,j)]) continue;
            velocX[IX(i, j)] -= 0.5 * (p[IX(i + 1, j)] - p[IX(i - 1, j)]) * N;
            velocY[IX(i, j)] -= 0.5 * (p[IX(i, j + 1)] - p[IX(i, j - 1)]) * N;
        }
    }
    set_bnd(1, velocX, N);
    set_bnd(2, velocY, N);
}

function IX(x, y) {
    return x + y * (N + 2);
}

// --- RENDERING ---
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render density
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const d = fluid.density[IX(i + 1, j + 1)];
            const color = Math.min(255, Math.max(0, d * 255));
            
            for (let x = 0; x < SCALE; x++) {
                for (let y = 0; y < SCALE; y++) {
                    const px = (i * SCALE + x) * 4;
                    const py = (j * SCALE + y) * canvas.width * 4;
                    data[px + py] = color;     // R
                    data[px + py + 1] = color; // G
                    data[px + py + 2] = color; // B
                    data[px + py + 3] = 255;   // A
                }
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);

    // Render obstacles
    ctx.fillStyle = '#333';
    for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= N; j++) {
            if (obstacles[IX(i, j)]) {
                ctx.fillRect((i - 1) * SCALE, (j - 1) * SCALE, SCALE, SCALE);
            }
        }
    }
}

// --- ANIMATION LOOP ---
function animate() {
    if (isRunning) {
        // Add a constant smoke source
        const centerX = Math.floor(N / 2);
        fluid.addDensity(centerX, N - 10, 100);
        fluid.addVelocity(centerX, N - 15, 0, -2);

        fluid.step();
        render();
    }
    requestAnimationFrame(animate);
}

// --- UI & EVENT HANDLERS ---
function setup() {
    fluid = new Fluid(0.1, 0, 0.0001);
    obstacles = new Uint8Array((N + 2) * (N + 2)).fill(0);
    
    document.getElementById('startBtn').addEventListener('click', () => isRunning = true);
    document.getElementById('pauseBtn').addEventListener('click', () => isRunning = false);
    document.getElementById('stopBtn').addEventListener('click', () => {
        isRunning = false;
        fluid = new Fluid(fluid.dt, 0, fluid.visc);
        obstacles.fill(0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        fluid = new Fluid(fluid.dt, 0, fluid.visc);
    });
    
    const drawBtn = document.getElementById('drawBtn');
    drawBtn.addEventListener('click', () => {
        isDrawing = !isDrawing;
        drawBtn.classList.toggle('active', isDrawing);
    });

    document.getElementById('viscosity').addEventListener('input', (e) => {
        fluid.visc = parseFloat(e.target.value);
    });
    document.getElementById('timestep').addEventListener('input', (e) => {
        fluid.dt = parseFloat(e.target.value);
    });

    let isMouseDown = false;
    canvas.addEventListener('mousedown', () => isMouseDown = true);
    canvas.addEventListener('mouseup', () => isMouseDown = false);
    canvas.addEventListener('mouseleave', () => isMouseDown = false);
    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing && isMouseDown) {
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / SCALE) + 1;
            const y = Math.floor((e.clientY - rect.top) / SCALE) + 1;
            if (x > 0 && x <= N && y > 0 && y <= N) {
                obstacles[IX(x, y)] = 1;
            }
        }
    });
}

// --- INITIALIZE ---
setup();
animate();