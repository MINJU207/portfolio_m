document.addEventListener('DOMContentLoaded', () => {
    // 1. 커스텀 커서
    const cursor = document.querySelector('.cursor');
    if(cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        const hoverTargets = document.querySelectorAll('a, button, .glass-box, .video-wrapper, .filter-btn, .card'); 
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

    const fadeElements = document.querySelectorAll('.section-title, .glass-box, .video-wrapper, .grade-section');
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
});


/* =========================================
   ▼ 포트폴리오 팝업(모달) 기능 [핵심 수정됨]
   ========================================= */
const modal = document.getElementById("portfolioModal");
const modalImg = document.getElementById("modalImg");
const modalVideo = document.getElementById("modalVideo"); // 유튜브용
const modalLocalVideo = document.getElementById("modalLocalVideo"); // 직접 올린 파일용
const modalPlaceholder = document.getElementById("modalImgPlaceholder");

const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalTech = document.getElementById("modalTech");

// 1. 카드 클릭 시 모달 열기 함수
function openModal(element) {
    // 클릭한 카드의 정보 가져오기
    const title = element.getAttribute('data-title');
    const desc = element.getAttribute('data-desc');
    const imgInfo = element.getAttribute('data-img');
    const tech = element.getAttribute('data-tech');
    const videoUrl = element.getAttribute('data-video'); // 유튜브 주소
    const localVideoUrl = element.getAttribute('data-local-video'); // 파일명 (1.MP4)

    // 텍스트 채우기
    modalTitle.innerHTML = title ? title : element.querySelector('h3').innerText;
    modalDesc.innerHTML = desc ? desc : "상세 설명이 준비 중입니다.";
    modalTech.innerHTML = tech ? tech : "";

    // --- [중요] 어떤 미디어를 보여줄지 결정 ---
    
    // 1순위: 직접 올린 동영상 파일 (MP4)
    if (localVideoUrl && localVideoUrl !== "null") {
        modalLocalVideo.src = localVideoUrl; // 파일 연결
        modalLocalVideo.style.display = "block"; // 플레이어 보이기
        
        // 나머지는 숨김
        modalImg.style.display = "none";
        modalVideo.style.display = "none";
        modalPlaceholder.style.display = "none";
    }
    // 2순위: 유튜브 영상
    else if (videoUrl && videoUrl !== "null") {
        // 유튜브 ID 추출 로직
        let videoId = "";
        if (videoUrl.includes("v=")) {
            videoId = videoUrl.split('v=')[1].split('&')[0];
        } else if (videoUrl.includes("youtu.be/")) {
            videoId = videoUrl.split('youtu.be/')[1];
        }

        if (videoId) {
            modalVideo.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
            modalVideo.style.display = "block";
            
            modalImg.style.display = "none";
            modalLocalVideo.style.display = "none";
            modalPlaceholder.style.display = "none";
        }
    } 
    // 3순위: 이미지
    else if (imgInfo && imgInfo !== "null") {
        modalImg.src = imgInfo;
        modalImg.style.display = "block";
        
        modalVideo.style.display = "none";
        modalLocalVideo.style.display = "none";
        modalPlaceholder.style.display = "none";
    } 
    // 4순위: 아무것도 없을 때 (회색박스)
    else {
        modalImg.style.display = "none";
        modalVideo.style.display = "none";
        modalLocalVideo.style.display = "none";
        modalPlaceholder.style.display = "flex";
    }

    // 모달창 띄우기
    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; // 배경 스크롤 막기
}

// 2. 닫기 버튼 기능
function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    
    // 유튜브 끄기 (주소 비우기)
    if(modalVideo) modalVideo.src = ""; 
    
    // 직접 올린 영상 끄기 (일시정지 & 되감기)
    if(modalLocalVideo) {
        modalLocalVideo.pause();
        modalLocalVideo.currentTime = 0;
        modalLocalVideo.src = ""; // 소스 비워서 완벽하게 정지
    }
}

// 3. 배경 클릭 시 닫기
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}