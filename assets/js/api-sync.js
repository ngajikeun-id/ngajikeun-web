(function () {
    const CDN_SITE_DATA_URL = 'https://cdn.jsdelivr.net/gh/ngajikeun-id/ngajikeun-web@main/content/data/site-data.json';
    let siteDataPromise = null;
    let dashboardDataPromise = null;

    // ===== HELPERS =====

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function safeText(value, fallback = '') {
        return escapeHtml(value ?? fallback);
    }

    function safeUrl(value, fallback = '#') {
        if (!value) return fallback;

        try {
            const urlText = String(value).trim();
            const urlMatch = urlText.match(/https?:\/\/[^\s]+/i);
            const rawUrl = urlMatch ? urlMatch[0] : urlText;
            const url = new URL(rawUrl, window.location.origin);
            const allowedProtocols = ['http:', 'https:'];

            if (url.origin === window.location.origin) {
                return escapeHtml(url.pathname + url.search + url.hash);
            }

            if (allowedProtocols.includes(url.protocol)) {
                return escapeHtml(url.href);
            }
        } catch (error) {
            return fallback;
        }

        return fallback;
    }

    function getCollection(data, key) {
        const collection = data?.[key];
        return Array.isArray(collection) ? collection : [];
    }

    function renderSimpleMarkdown(markdown) {
        const safeMarkdown = String(markdown ?? '').trim();
        if (!safeMarkdown) {
            return '<p>Informasi belum tersedia.</p>';
        }

        return safeMarkdown
            .split(/\n\s*\n/)
            .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
            .join('');
    }

    window.NgajikeunUtils = {
        safeText,
        safeUrl,
        getCollection,
        renderSimpleMarkdown
    };

    // ===== API LAYER =====

    async function fetchJson(url) {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} while loading ${url}`);
        }

        return response.json();
    }

    function loadDashboardData() {
        if (!dashboardDataPromise) {
            dashboardDataPromise = (async () => {
                try {
                    return await fetchJson('content/dashboard.json');
                } catch (error) {
                    console.error('Ngajikeun.id: Gagal memvalidasi status maintenance:', error);
                    return null;
                }
            })();
        }

        return dashboardDataPromise;
    }

    function loadSiteData() {
        if (!siteDataPromise) {
            siteDataPromise = (async () => {
                try {
                    return await fetchJson('content/data/site-data.json');
                } catch (localError) {
                    console.warn('Gagal load aggregate lokal, mencoba CDN fallback.', localError);
                    return fetchJson(CDN_SITE_DATA_URL);
                }
            })();
        }

        return siteDataPromise;
    }

    async function loadAppData() {
        const [dashboard, site] = await Promise.all([
            loadDashboardData(),
            loadSiteData()
        ]);

        return {
            dashboard,
            site,
            hero: site?.hero_settings || {},
            about: site?.about_details || {},
            programs: getCollection(site, 'programs'),
            mentors: getCollection(site, 'mentors'),
            testimonials: getCollection(site, 'testimonials'),
            articles: getCollection(site, 'articles'),
            products: getCollection(site, 'products'),
            quizzes: getCollection(site, 'quizzes')
        };
    }

    async function getProgramBySlug(slug, sourceData) {
        const data = sourceData || await loadSiteData();
        const programs = getCollection(data, 'programs');
        const fallbackProgram = programs.find((program) => program.slug === slug);

        if (!fallbackProgram) return null;
        if (!/^[a-z0-9-]+$/.test(slug)) return fallbackProgram;

        try {
            const details = await fetchJson(`content/programs/${slug}.json`);
            return {
                ...fallbackProgram,
                ...details,
                slug
            };
        } catch (error) {
            console.warn('Gagal load detail program langsung, memakai data aggregate.', error);
            return fallbackProgram;
        }
    }

    async function getArticleBySlug(slug, sourceData) {
        const data = sourceData || await loadSiteData();
        const articles = getCollection(data, 'articles');
        return articles.find((article) => article.slug === slug) || null;
    }

    window.NgajikeunApi = {
        fetchJson,
        loadDashboardData,
        loadSiteData,
        loadAppData,
        getProgramBySlug,
        getArticleBySlug
    };
}());
