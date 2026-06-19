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

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.remove('hidden');
            } else {
                backToTopBtn.classList.add('hidden');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    window.closeArticleModal = function closeArticleModal() {
        const modal = document.getElementById('article-modal');
        const content = document.getElementById('modal-content');
        if (!modal) return;

        modal.classList.add('hidden');
        modal.scrollTop = 0;
        if (content) content.scrollTop = 0;
        document.body.style.overflow = '';
    };

    window.openMentorModal = function openMentorModal(slug) {
        return window.NgajikeunApi?.getMentorModalBySlug?.(slug);
    };

    window.openProductModal = function openProductModal(slug) {
        return window.NgajikeunApi?.getProductModalBySlug?.(slug);
    };

    window.closeMentorModal = window.closeArticleModal;
    window.closeProductModal = window.closeArticleModal;

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            window.closeArticleModal();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        setupMobileMenu();
        setupRevealOnScroll();
        setupBackToTopButton();
    });
})();