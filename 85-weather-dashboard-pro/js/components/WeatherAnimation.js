class WeatherAnimation {
    constructor() {
        this.createCanvas();
    }

    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'weatherCanvas';
        canvas.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:0;';
        document.body.insertBefore(canvas, document.body.firstChild);
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; }

    startAnimation(weatherType) {
        cancelAnimationFrame(this.animation);
        this.particles = [];
        this.weatherType = weatherType;
        this.initParticles();
        this.animate();
    }

    initParticles() {
        const count = this.weatherType === 'Rain' ? 100 : this.weatherType === 'Snow' ? 80 : 30;
        for(let i=0;i<count;i++) this.particles.push({ x: Math.random()*this.canvas.width, y: Math.random()*this.canvas.height, speed: 2+Math.random()*3, size: Math.random()*3+1 });
    }

    animate() {
        if(!this.canvas) return;
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        if(this.weatherType === 'Rain') this.drawRain();
        else if(this.weatherType === 'Snow') this.drawSnow();
        else this.drawClear();
        this.animation = requestAnimationFrame(()=>this.animate());
    }

    drawRain() {
        this.ctx.fillStyle = 'rgba(100,150,255,0.5)';
        this.particles.forEach(p => { p.y += p.speed; if(p.y>this.canvas.height) p.y=0; this.ctx.fillRect(p.x,p.y,2,p.size*3); });
    }

    drawSnow() {
        this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.particles.forEach(p => { p.y += p.speed/2; if(p.y>this.canvas.height) p.y=0; this.ctx.beginPath(); this.ctx.arc(p.x,p.y,p.size,0,Math.PI*2); this.ctx.fill(); });
    }

    drawClear() { this.ctx.fillStyle = 'rgba(255,200,50,0.1)'; this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height); }

    stopAnimation() { if(this.animation) cancelAnimationFrame(this.animation); this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height); }
}
window.WeatherAnimation = WeatherAnimation;