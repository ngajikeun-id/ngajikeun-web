(function () {
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
        if (window.NgajikeunComponents) {
            await window.NgajikeunComponents.loadComponents();
        }

        setupMobileMenu();
        setupRevealOnScroll();
        setupBackToTopButton();
        setupAosAnimations();
    }

    document.addEventListener("componentsLoaded", () => {
        console.log("🔥 Components ready, syncing content...");
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

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            window.closeArticleModal();
        }
    });
}());
