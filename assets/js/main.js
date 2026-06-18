(function () {
    let currentZoom = 1;
    let isPanning = false;
    let startX = 0, startY = 0;
    let translateX = 0, translateY = 0;

    function setupMobileMenu() {
        const menuBtn = document.getElementById('menu-btn');
        const navMenu = document.getElementById('nav-menu');

        if (!menuBtn || !navMenu) return;

        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('hidden');
        });

        navMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    navMenu.classList.add('hidden');
                }
            });
        });
    }

    function setupRevealOnScroll() {
        const handleReveal = () => {
            document.querySelectorAll('.reveal').forEach((element) => {
                if (element.getBoundingClientRect().top < window.innerHeight - 100) {
                    element.classList.add('active');
                }
            });
        };

        window.addEventListener('scroll', handleReveal);
        handleReveal();
    }

    function setupBackToTopButton() {
        const backToTopBtn = document.getElementById('backToTopBtn');
        if (!backToTopBtn) return;

        const toggleButton = () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.remove('hidden');
            } else {
                backToTopBtn.classList.add('hidden');
            }
        };

        window.addEventListener('scroll', toggleButton);
        toggleButton();
    }

    function setupAosAnimations() {
        if (!window.AOS) return;

        window.AOS.init({
            duration: 700,
            once: true
        });
    }

    function setupPwaAutoUpdate() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('🔥 PWA mendeteksi aset baru, merefresh halaman otomatis...');
                window.location.reload();
            });
        }
    }

    function initializeContentSync() {
        if (!window.NgajikeunApi) return;

        console.log('Ngajikeun.id: Starting content synchronization...');
        window.NgajikeunApi.syncAbout();
        window.NgajikeunApi.syncPrograms();
        window.NgajikeunApi.syncMentors();
        window.NgajikeunApi.syncTestimonials();
        window.NgajikeunApi.syncArticles();
        window.NgajikeunApi.syncProducts();
        window.NgajikeunApi.syncQuizzes();
    }

    async function initPage() {
        try {
            const response = await fetch('content/dashboard.json');
            if (response.ok) {
                const dashboardData = await response.json();
                if (dashboardData && dashboardData.is_maintenance === true) {
                    window.location.href = 'maintenance.html';
                    return;
                }

                window.currentDashboardData = dashboardData;
            }
        } catch (error) {
            console.error('Ngajikeun.id: Gagal memvalidasi status maintenance:', error);
        }

        if (window.NgajikeunComponents) {
            await window.NgajikeunComponents.loadComponents();
        }

        setupMobileMenu();
        setupRevealOnScroll();
        setupBackToTopButton();
        setupAosAnimations();
        setupPwaAutoUpdate();
    }

    document.addEventListener("componentsLoaded", () => {
        console.log("🔥 Components ready, syncing content...");

        if (window.currentDashboardData && window.currentDashboardData.running_text) {
            const marqueeElement = document.getElementById('navbar-running-text');
            if (marqueeElement) {
                marqueeElement.innerText = window.currentDashboardData.running_text;
                console.log("✅ Running text berhasil di-inject!");
            }
        }

        initializeContentSync();
    });

    window.scrollToTop = function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.addEventListener('DOMContentLoaded', () => {
        initPage().catch((error) => {
            console.error('Gagal inisialisasi halaman:', error);
        });
    });

    // --- MODAL ARTIKEL ---
    window.openArticleModal = function openArticleModal(slug) {
        if (typeof window.getArticleBySlug === 'function') {
            return window.getArticleBySlug(slug);
        }

        return window.NgajikeunApi?.getArticleBySlug?.(slug);
    };

    window.closeArticleModal = function closeArticleModal() {
        const modal = document.getElementById('article-modal');
        const content = document.getElementById('modal-content');
        if (!modal) return;

        modal.classList.add('hidden');
        modal.scrollTop = 0;
        if (content) content.scrollTop = 0;
        document.body.style.overflow = '';
    };

    window.openMentorModal = function openMentorModal(mentorData) {
        const modal = document.getElementById('mentor-modal');
        const img = document.getElementById('modal-mentor-img');
        const zoomImg = document.getElementById('modal-mentor-zoom-img');
        const name = document.getElementById('modal-mentor-name');
        const badge = document.getElementById('modal-mentor-badge');
        const bio = document.getElementById('modal-mentor-bio');
        const slider = document.getElementById('zoom-slider');
        const label = document.getElementById('zoom-label');

        if (!modal || !mentorData) return;

        currentZoom = 1;
        translateX = 0;
        translateY = 0;
        isPanning = false;
        if (slider) slider.value = 100;
        if (label) label.innerText = '100%';
        if (zoomImg) {
            zoomImg.style.transform = `scale(1) translate(0px, 0px)`;
        }

        // Suntik data murni dari CMS
        const targetImage = mentorData.image || 'public/images/uploads/logo-ngk.png';
        if (img) img.src = targetImage;
        if (zoomImg) zoomImg.src = targetImage;
        if (name) name.innerText = mentorData.name || 'Nama Musyrifah';
        if (badge) badge.innerText = mentorData.badge || 'Muhafizhoh Bersanad';
        if (bio) bio.innerHTML = mentorData.bio || 'Profil sedang dimuat...';

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        initZoomControls();
    };

    function initZoomControls() {
        const slider = document.getElementById('zoom-slider');
        const label = document.getElementById('zoom-label');
        const zoomImg = document.getElementById('modal-mentor-zoom-img');
        const viewport = document.getElementById('zoom-viewport');

        if (!slider || !zoomImg || !viewport) return;

        slider.oninput = function () {
            currentZoom = this.value / 100;
            if (label) label.innerText = `${this.value}%`;
            updateImageTransform();
        };

        viewport.onmousedown = function (e) {
            if (currentZoom <= 1) return;
            isPanning = true;
            viewport.classList.add('cursor-grabbing');
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            e.preventDefault();
        };

        window.onmousemove = function (e) {
            if (!isPanning) return;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateImageTransform();
        };

        window.onmouseup = function () {
            isPanning = false;
            if (viewport) viewport.classList.remove('cursor-grabbing');
        };

        function updateImageTransform() {
            zoomImg.style.transform = `scale(${currentZoom}) translate(${translateX / currentZoom}px, ${translateY / currentZoom}px)`;
        }
    }

    window.closeMentorModal = function closeMentorModal() {
        const modal = document.getElementById('mentor-modal');
        if (!modal) return;

        modal.classList.add('hidden');
        document.body.style.overflow = '';
        isPanning = false;
    };

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            window.closeMentorModal();
            window.closeArticleModal();
        }
    });
}());