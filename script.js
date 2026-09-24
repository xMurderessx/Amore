const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pauseBtn = document.getElementById('pause-btn');
const audio = document.getElementById('bg-music');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let stars = [];
let angleY = 0; 
let zoom = 1; 
let isPlaying = false;

// --- LÓGICA DE PANTALLA DE INICIO ---
function startExperience() {
    audio.play().then(() => {
        isPlaying = true;
        pauseBtn.innerHTML = '<span class="icon">II</span> PAUSAR';
    }).catch(e => console.log("Asegúrate de que 'cancion.mp3' está en la carpeta", e));
    
    startScreen.style.opacity = '0';
    setTimeout(() => {
        startScreen.style.visibility = 'hidden';
    }, 800);
}

// Escuchar el click solo en el botón
startBtn.addEventListener('click', startExperience);

// Botón de Control Manual de Pausa/Reproducción inferior
pauseBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    if (isPlaying) {
        audio.pause();
        pauseBtn.innerHTML = '<span class="icon">▶</span> REPRODUCIR';
        isPlaying = false;
    } else {
        audio.play();
        pauseBtn.innerHTML = '<span class="icon">II</span> PAUSAR';
        isPlaying = true;
    }
});

// --- ZOOM INTERACTIVO ---
window.addEventListener('wheel', (e) => {
    zoom += e.deltaY * -0.001;
    zoom = Math.min(Math.max(0.4, zoom), 2.5); 
});

let initialDistance = null;
window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        initialDistance = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
    }
});
window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && initialDistance) {
        let currentDistance = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
        let delta = currentDistance - initialDistance;
        zoom += delta * 0.005;
        zoom = Math.min(Math.max(0.4, zoom), 2.5);
        initialDistance = currentDistance;
    }
});

// --- ESTRUCTURA DE LA FLOR Y ANIMACIÓN 3D ---
for (let i = 0; i < 120; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5,
        speed: Math.random() * 0.05
    });
}

function initFlower() {
    particles = [];
    const numPetals = 6;
    
    for (let p = 0; p < numPetals; p++) {
        let angle = (p * Math.PI * 2) / numPetals;
        
        for (let dist = 45; dist <= 190; dist += 12) {
            let t = dist / 190; 
            let w = Math.sin(t * Math.PI) * 42; 
            
            for (let x = -w; x <= w; x += 13) {
                let localX = x;
                let localZ = dist;
                let localY = Math.pow(t, 2.2) * 85; 
                
                let rotX = localX * Math.cos(angle) - localZ * Math.sin(angle);
                let rotZ = localZ * Math.cos(angle) + localX * Math.sin(angle);
                
                particles.push({
                    x: rotX,
                    y: localY,
                    z: rotZ,
                    size: 4.8 
                });
            }
        }
    }
}

initFlower();

function animate() {
    ctx.fillStyle = 'rgba(3, 0, 3, 0.4)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        star.y -= star.speed;
        if (star.y < 0) star.y = canvas.height;
    });

    // Giro lento
    angleY += 0.0005; 
    let angleX = 0.95; 

    let projected = [];

    particles.forEach(p => {
        let x1 = p.x * Math.cos(angleY) - p.z * Math.sin(angleY);
        let z1 = p.z * Math.cos(angleY) + p.x * Math.sin(angleY);
        let y1 = p.y;

        let y2 = y1 * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = z1 * Math.cos(angleX) + y1 * Math.sin(angleX);
        let x2 = x1;

        let focal = 450;
        let scale = focal / (focal + z2 + 200);

        if (scale > 0) {
            projected.push({
                x: (x2 * scale * zoom) + canvas.width / 2, 
                y: (y2 * scale * zoom) + canvas.height / 2 - (40 * zoom),
                size: p.size * scale * zoom,
                z: z2
            });
        }
    });

    projected.sort((a, b) => b.z - a.z);

    projected.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
        ctx.fillStyle = '#ff007f'; 
        ctx.fill();
    });

    let centerCX = canvas.width / 2;
    let centerCY = canvas.height / 2 - (40 * zoom);
    let centerRadius = 24 * zoom;
    
    ctx.beginPath();
    ctx.arc(centerCX, centerCY, centerRadius, 0, Math.PI * 2);
    let grad = ctx.createRadialGradient(centerCX, centerCY, 0, centerCX, centerCY, centerRadius + (10*zoom));
    grad.addColorStop(0, '#ffffff'); 
    grad.addColorStop(0.3, '#ff66b2');
    grad.addColorStop(1, 'rgba(255, 0, 127, 0)');
    ctx.fillStyle = grad;
    ctx.shadowBlur = 40 * zoom;
    ctx.shadowColor = '#ff66b2';
    ctx.fill();
    ctx.shadowBlur = 0; 

    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initFlower();
});