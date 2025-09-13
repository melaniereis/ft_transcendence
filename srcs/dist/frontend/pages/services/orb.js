export function initializeOrbsAnimation() {
    const canvas = document.getElementById('orbs-canvas');
    if (!canvas)
        return;
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    let mouse = { x: width / 2, y: height / 2 };
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    // Orb class
    class Orb {
        constructor() {
            this.baseX = Math.random() * width * 0.85 + width * 0.075;
            this.baseY = Math.random() * height * 0.7 + height * 0.15;
            this.x = this.baseX;
            this.y = this.baseY;
            this.radius = Math.random() * 2.2 + 1.2;
            this.color = 'rgba(255,255,255,0.92)';
            this.following = false;
            this.angle = Math.random() * 2 * Math.PI;
            this.orbit = 18 + Math.random() * 38;
            this.speed = 0.008 + Math.random() * 0.012;
        }
        update() {
            if (this.following) {
                this.angle += this.speed;
                this.x += (mouse.x + Math.cos(this.angle) * this.orbit - this.x) * 0.09;
                this.y += (mouse.y + Math.sin(this.angle) * this.orbit - this.y) * 0.09;
            }
            else {
                // Slowly return to base position if not following
                this.x += (this.baseX - this.x) * 0.07;
                this.y += (this.baseY - this.y) * 0.07;
            }
        }
        draw(context) {
            context.save();
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            context.shadowColor = '#fff';
            context.shadowBlur = 8;
            context.fillStyle = this.color;
            context.fill();
            context.restore();
        }
    }
    const orbs = Array.from({ length: 16 }, () => new Orb());
    function drawConstellations(context) {
        // Connect orbs that are close to each other
        for (let i = 0; i < orbs.length; ++i) {
            for (let j = i + 1; j < orbs.length; ++j) {
                const a = orbs[i], b = orbs[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    context.save();
                    context.globalAlpha = 0.18 + 0.18 * (1 - dist / 100);
                    context.strokeStyle = '#fff';
                    context.lineWidth = 1.1;
                    context.beginPath();
                    context.moveTo(a.x, a.y);
                    context.lineTo(b.x, b.y);
                    context.stroke();
                    context.restore();
                }
            }
        }
    }
    // Track the order of following orbs (FIFO)
    const followingQueue = [];
    const MAX_FOLLOWING = 5;
    function animate() {
        if (!ctx)
            return;
        ctx.clearRect(0, 0, width, height);
        // Check for mouse proximity
        for (const orb of orbs) {
            const dx = orb.x - mouse.x, dy = orb.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 40 && !orb.following) {
                orb.following = true;
                followingQueue.push(orb);
                if (followingQueue.length > MAX_FOLLOWING) {
                    const oldest = followingQueue.shift();
                    if (oldest)
                        oldest.following = false;
                }
            }
            else if (orb.following && dist > 220) {
                orb.following = false;
                // Remove from queue if present
                const idx = followingQueue.indexOf(orb);
                if (idx !== -1)
                    followingQueue.splice(idx, 1);
            }
            orb.update();
            orb.draw(ctx);
        }
        drawConstellations(ctx);
        requestAnimationFrame(animate);
    }
    animate();
}
