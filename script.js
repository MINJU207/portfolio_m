document.addEventListener('DOMContentLoaded', () => {
    // 1. 커스텀 커서
    const cursor = document.querySelector('.cursor');
    if(cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        const hoverTargets = document.querySelectorAll('a, button, .glass-box, .video-wrapper, .filter-btn'); // 버튼에도 반응하게 추가
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        });
    }

    // 2. 스크롤 애니메이션
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    const fadeElements = document.querySelectorAll('.section-title, .glass-box, .video-wrapper');
    fadeElements.forEach(el => observer.observe(el));

    // 3. 배경 파티클 (Canvas)
    const canvas = document.getElementById('bg-canvas');
    if(canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray;

        function setCanvasSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        setCanvasSize();

        let mouse = { x: null, y: null, radius: (canvas.height/90) * (canvas.width/90) }
        window.addEventListener('mousemove', (event) => { mouse.x = event.x; mouse.y = event.y; });

        class Particle {
            constructor(x, y, dx, dy, size) {
                this.x = x; this.y = y; this.dx = dx; this.dy = dy; this.size = size;
                this.color = 'rgba(98, 0, 234, 0.6)'; 
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color; ctx.fill();
            }
            update() {
                if (this.x > canvas.width || this.x < 0) this.dx = -this.dx;
                if (this.y > canvas.height || this.y < 0) this.dy = -this.dy;
                
                let dx = mouse.x - this.x; let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < mouse.radius + this.size) {
                    if (mouse.x < this.x && this.x < canvas.width - 10) this.x += 5;
                    if (mouse.x > this.x && this.x > 10) this.x -= 5;
                    if (mouse.y < this.y && this.y < canvas.height - 10) this.y += 5;
                    if (mouse.y > this.y && this.y > 10) this.y -= 5;
                }
                this.x += this.dx; this.y += this.dy;
                this.draw();
            }
        }

        function init() {
            particlesArray = [];
            let numberOfParticles = (canvas.height * canvas.width) / 8000;
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2.5) + 0.5;
                let x = Math.random() * (innerWidth - size * 2) + size;
                let y = Math.random() * (innerHeight - size * 2) + size;
                let dx = (Math.random() * 1) - 0.5;
                let dy = (Math.random() * 1) - 0.5;
                particlesArray.push(new Particle(x, y, dx, dy, size));
            }
        }

        function connect() {
            let opacityValue = 1;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) + 
                                   ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                    if (distance < (canvas.width/8) * (canvas.height/8)) {
                        opacityValue = 1 - (distance/15000);
                        ctx.strokeStyle = 'rgba(98, 0, 234,' + opacityValue * 0.2 + ')';
                        ctx.lineWidth = 0.8; ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0,0,innerWidth, innerHeight);
            for (let i = 0; i < particlesArray.length; i++) particlesArray[i].update();
            connect();
        }

        window.addEventListener('resize', () => { setCanvasSize(); init(); });
        init(); animate();
    }

    // 4. 포트폴리오 필터링 기능 (새로 추가된 부분)
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.card');

    if(filterButtons.length > 0) { // 버튼이 있는 페이지에서만 실행
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                
                // 1. 모든 버튼 활성 상태 해제 후 클릭된 버튼 활성화
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // 2. 필터 값 가져오기
                const filterValue = button.getAttribute('data-filter');

                // 3. 필터링 로직 수행
                portfolioItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        item.classList.remove('hide');
                        // 부드러운 등장 애니메이션
                        item.style.opacity = '0';
                        setTimeout(() => item.style.opacity = '1', 50);
                    } else {
                        item.classList.add('hide');
                    }
                });
            });
        });
    }
});