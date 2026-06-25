(function () {
    window.NG_STATE = window.NG_STATE || {
        componentsReady: false,
        dataReady: false,
        uiReady: false
    };

    let appData = null;

    // ===== PLUGIN AND UI INIT =====

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

    function setupFancybox() {
        if (window.Fancybox) {
            window.Fancybox.bind("[data-fancybox='about-gallery']", { Images: { zoom: true } });
        }
    }

    function setupPwaAutoUpdate() {
        if ('serviceWorker' in navigator) {
            let refreshing = false;

            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (refreshing) return;
                refreshing = true;

                console.log('🔥 PWA mendeteksi aset baru, merefresh halaman otomatis...');
                window.location.reload();
            });
        }
    }

    function setupGlobalEscHandlers() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                if (window.closeMentorModal) window.closeMentorModal();
                if (window.closeProductModal) window.closeProductModal();
            }
        });
    }

    function initializePlugins() {
        setupMobileMenu();
        setupRevealOnScroll();
        setupBackToTopButton();
        setupAosAnimations();
        setupFancybox();
        setupPwaAutoUpdate();
        setupGlobalEscHandlers();
    }

    // ===== BOOT STAGES =====

    function markState(key, value) {
        window.NG_STATE[key] = value;
    }

    async function initializeComponents() {
        if (window.NgajikeunComponents) {
            await window.NgajikeunComponents.loadComponents();
        }

        markState('componentsReady', true);
    }

    async function loadApplicationData() {
        if (!window.NgajikeunApi?.loadAppData) return null;

        const data = await window.NgajikeunApi.loadAppData();
        appData = data;
        window.NG_DATA = data;
        window.currentDashboardData = data?.dashboard || null;
        markState('dataReady', true);

        return data;
    }

    function renderApplication(data) {
        if (window.NgajikeunRender?.renderSite) {
            window.NgajikeunRender.renderSite(data);
        }

        markState('uiReady', true);
    }

    async function bootApplication() {
        await initializeComponents();

        const data = await loadApplicationData();
        if (data?.dashboard?.is_maintenance === true) {
            window.location.href = 'maintenance.html';
            return;
        }

        renderApplication(data || {});
        initializePlugins();
    }

    // ===== PUBLIC ORCHESTRATION API =====

    window.scrollToTop = function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.openArticleModal = function openArticleModal(slug) {
        return window.getArticleBySlug(slug);
    };

    window.getArticleBySlug = async function getArticleBySlug(slug) {
        const post = await window.NgajikeunApi?.getArticleBySlug?.(slug, appData?.site);
        window.NgajikeunRender?.openArticleModal?.(post);
        return post;
    };

    window.openProgramModalBySlug = async function openProgramModalBySlug(slug) {
        const program = await window.NgajikeunApi?.getProgramBySlug?.(slug, appData?.site);
        window.NgajikeunRender?.openProgramModal?.(program);
        return program;
    };

    window.syncArticles = function syncArticles() {
        if (appData?.articles) {
            window.NgajikeunRender?.renderArticles?.(appData.articles);
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        bootApplication().catch((error) => {
            console.error('Gagal inisialisasi halaman:', error);
        });
    });
}());
