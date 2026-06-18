(function () {
    const CDN_SITE_DATA_URL = 'https://cdn.jsdelivr.net/gh/ngajikeun-id/ngajikeun-web@main/content/data/site-data.json';
    let siteDataPromise = null;

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

    function styleMarkdownTables(scope) {
        if (!scope) return;

        scope.querySelectorAll('table').forEach((table) => {
            table.classList.add('w-full', 'min-w-[640px]', 'border-collapse', 'overflow-hidden', 'rounded-xl', 'border', 'border-slate-700', 'text-xs');
        });

        scope.querySelectorAll('thead').forEach((thead) => {
            thead.classList.add('bg-emerald-950/60');
        });

        scope.querySelectorAll('tbody tr').forEach((row) => {
            row.classList.add('border-t', 'border-slate-800');
        });

        scope.querySelectorAll('th').forEach((cell) => {
            cell.classList.add('px-4', 'py-3', 'text-left', 'font-black', 'uppercase', 'tracking-widest', 'text-emerald-300', 'border', 'border-slate-700', 'align-top');
        });

        scope.querySelectorAll('td').forEach((cell) => {
            cell.classList.add('px-4', 'py-3', 'text-slate-300', 'border', 'border-slate-800', 'align-top');
        });
    }

    async function fetchJson(url) {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} while loading ${url}`);
        }

        return response.json();
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

    function getCollection(data, key) {
        const collection = data?.[key];
        return Array.isArray(collection) ? collection : [];
    }

    function resetModalScroll() {
        const modal = document.getElementById('article-modal');
        const content = document.getElementById('modal-content');

        if (modal) modal.scrollTop = 0;
        if (content) content.scrollTop = 0;
    }

    async function getProgramDetails(slug, fallbackProgram) {
        if (!/^[a-z0-9-]+$/.test(slug)) {
            return fallbackProgram;
        }

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

    async function getArticleBySlug(slug) {
        const modal = document.getElementById('article-modal');
        const content = document.getElementById('modal-content');

        if (!modal || !content) {
            console.error('Elemen modal artikel tidak ditemukan.');
            return;
        }

        try {
            const data = await loadSiteData();
            const articles = getCollection(data, 'articles');
            const post = articles.find((article) => article.slug === slug);

            if (!post) return;

            const imageHtml = post.thumbnail
                ? `<img src="${safeUrl(post.thumbnail)}" alt="${safeText(post.title)}" onclick="zoomImage(this.src)" class="w-full max-h-[60vh] object-contain rounded-[2rem] mb-8 shadow-lg cursor-zoom-in transition-transform duration-300 hover:scale-[1.01]">`
                : '';

            content.innerHTML = `
                <div class="max-w-2xl mx-auto text-center">
                    ${imageHtml}
                    <span class="text-emerald-400 font-bold tracking-widest text-[10px] uppercase block mb-4">Literasi Al-Qur'an</span>
                    <h2 class="text-3xl md:text-4xl font-black text-slate-100 mb-6 leading-tight">${safeText(post.title)}</h2>
                    <div class="prose prose-invert prose-emerald prose-sm max-w-none text-slate-300 leading-relaxed text-left border-t border-slate-800 pt-8">
                        ${window.marked ? window.marked.parse(post.body || '') : renderSimpleMarkdown(post.body)}
                    </div>
                </div>
            `;

            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            resetModalScroll();
        } catch (error) {
            console.error('Gagal memuat artikel:', error);
        }
    }

    async function getProgramBySlug(slug) {
        const modal = document.getElementById('article-modal');
        const content = document.getElementById('modal-content');

        if (!modal || !content) {
            console.error('Elemen modal tidak ditemukan, Antum!');
            return;
        }

        try {
            const data = await loadSiteData();
            const programs = getCollection(data, 'programs');
            const programSummary = programs.find((p) => p.slug === slug);

            if (!programSummary) return;

            const program = await getProgramDetails(slug, programSummary);

            const imageHtml = program.image
                ? `<img src="${safeUrl(program.image)}" alt="${safeText(program.title)}" onclick="zoomImage(this.src)" class="w-full max-h-[60vh] object-contain rounded-[2rem] mb-8 shadow-lg cursor-zoom-in transition-transform duration-300 hover:scale-[1.01]">`
                : '';
            const programBody = String(program.body || program.description || '').trim();

            content.innerHTML = `
                <div class="max-w-2xl mx-auto text-center">
                    ${imageHtml}
                    <span class="text-emerald-400 font-bold tracking-widest text-[10px] uppercase block mb-4">Detail Program Belajar</span>
                    <h2 class="text-3xl md:text-4xl font-black text-slate-100 mb-6 leading-tight">${safeText(program.title)}</h2>

                    <div id="program-markdown-content" class="prose prose-invert prose-emerald prose-sm max-w-none overflow-x-auto text-slate-300 leading-relaxed text-left border-t border-slate-800 pt-8 mb-8">
                        ${programBody && window.marked ? window.marked.parse(programBody) : renderSimpleMarkdown(programBody)}
                    </div>

                    <a href="${safeUrl(program.registration_link)}" target="_blank" rel="noopener noreferrer"
                       class="inline-block w-full sm:w-auto px-8 py-4 bg-emerald-600 border border-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-950/50">
                        Daftar Sekarang Lewat WA ⚡
                    </a>
                </div>
            `;

            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            styleMarkdownTables(content.querySelector('#program-markdown-content'));
            resetModalScroll();
        } catch (error) {
            console.error('Gagal memuat detail program:', error);
        }
    }

    async function syncPrograms() {
        const container = document.getElementById('program-container');
        if (!container) return;

        try {
            const data = await loadSiteData();
            const programs = getCollection(data, 'programs');
            if (!programs.length) return;

            container.innerHTML = '';

            programs.forEach(program => {
                const imageUrl = safeUrl(program.image, 'https://via.placeholder.com/600x400?text=Flyer+Program');
                const slug = program.slug || program.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                container.innerHTML += `
    <div class="group bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 hover:shadow-2xl hover:shadow-emerald-950/30 transition-all duration-500">
        <div class="relative overflow-hidden aspect-[4/3] cursor-pointer" onclick="window.NgajikeunApi.getProgramBySlug('${safeText(slug)}')">
            <img src="${imageUrl}" alt="${safeText(program.title)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <span class="text-white text-xs font-bold tracking-widest uppercase">Lihat Detail Program 📖</span>
            </div>
        </div>
        
        <div class="p-8">
            <div class="mb-4">
                <h3 class="text-xl font-bold text-slate-100 leading-tight">${safeText(program.title)}</h3>
            </div>
            <p class="text-slate-400 text-xs leading-relaxed mb-6">${safeText(program.description)}</p>
            
            <button type="button" data-program-slug="${safeText(slug)}"
               class="block w-full text-center py-4 bg-slate-950 border border-slate-800 text-slate-100 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all active:scale-95">
                Detail Program 📖
            </button>
        </div>
    </div>
`;
            });

            container.querySelectorAll('[data-program-slug]').forEach((button) => {
                button.addEventListener('click', () => {
                    window.NgajikeunApi.getProgramBySlug(button.dataset.programSlug);
                });
            });
        } catch (error) {
            console.error('Gagal sync program:', error);
        }
    }

    async function syncMentors() {
        const container = document.getElementById('mentor-container');
        if (!container) return;

        try {
            const data = await loadSiteData();
            const mentors = getCollection(data, 'mentors');
            if (!mentors.length) return;

            container.innerHTML = '';

            for (const mentor of mentors) {
                const imageUrl = safeUrl(mentor.image, 'https://via.placeholder.com/150');

                const bioContent = mentor.bio || mentor.description || 'Profil bimbingan musyrifah bersanad.';

                const card = document.createElement('div');
                card.className = "text-center group cursor-pointer transition-transform active:scale-95";
                card.innerHTML = `
                    <div class="relative inline-block">
                        <img src="${imageUrl}"
                            class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-slate-800 group-hover:border-emerald-500 transition-all duration-300 shadow-md">
                    </div>
                    <h3 class="mt-4 text-lg font-bold text-gray-200">${safeText(mentor.name, 'Mentor')}</h3>
                    <p class="text-emerald-400 text-sm font-medium mb-2">${safeText(mentor.specialty, 'Mentor Al-Qur\'an')}</p>
                `;

                card.onclick = () => {
                    window.openMentorModal({
                        name: safeText(mentor.name, 'Mentor'),
                        badge: safeText(mentor.specialty, 'Muhafizhoh Bersanad'),
                        image: imageUrl,
                        bio: bioContent
                    });
                };

                container.appendChild(card);
            }
        } catch (error) {
            console.error('Gagal load mentor:', error);
        }
    }

    async function syncTestimonials() {
        const container = document.getElementById('testimonial-container');
        if (!container) return;

        try {
            const data = await loadSiteData();
            const testimonials = getCollection(data, 'testimonials');
            if (!testimonials.length) return;

            container.innerHTML = '';

            for (const testimonial of testimonials) {
                const imageUrl = safeUrl(
                    testimonial.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name || 'Santri')}`,
                    'https://ui-avatars.com/api/?name=Santri'
                );

                container.innerHTML += `
                    <div class="bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-800 italic text-gray-300 relative">
                        <span class="text-6xl text-emerald-500/30 absolute top-2 left-2 font-serif">“</span>
                        <p class="relative z-10 mb-6">${safeText(testimonial.content)}</p>
                        <div class="flex items-center gap-4 border-t border-slate-800 pt-4">
                            <img src="${imageUrl}" class="w-12 h-12 rounded-full border-2 border-emerald-500">
                            <div>
                                <h4 class="font-bold text-gray-200 not-italic">${safeText(testimonial.name, 'Santri')}</h4>
                                <p class="text-xs text-emerald-400 not-italic">${safeText(testimonial.status)}</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            container.innerHTML = '';
            console.error('Gagal load testimoni:', error);
        }
    }

    window.closeArticleModal = function () {
        const modal = document.getElementById('article-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            resetModalScroll();
        }
    };

    window.getArticleBySlug = getArticleBySlug;

    async function syncArticles() {
        const list = document.getElementById('articles-list');
        if (!list) return;

        try {
            const data = await loadSiteData();
            const articles = getCollection(data, 'articles');
            if (!articles || !articles.length) return;

            list.innerHTML = '';

            const featured = articles.slice(0, 3);
            const others = articles.slice(3);

            const createCard = (post) => {
                const date = new Date(post.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
                return `
                <article class="group bg-slate-900 rounded-3xl p-1.5 border border-slate-800 hover:border-emerald-700 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-950/20 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4">
                    <div class="bg-slate-800 aspect-video rounded-[1.35rem] mb-4 overflow-hidden relative">
                        ${post.thumbnail ? `<img src="${post.thumbnail}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">` : `<div class="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20"></div>`}
                    </div>
                    <div class="p-5 flex-grow flex flex-col items-center text-center">
                        <time class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block mb-2">${date}</time>
                        <h3 class="text-lg font-bold text-slate-100 leading-snug group-hover:text-emerald-400 transition-colors mb-3">${safeText(post.title)}</h3>
                        <p class="text-slate-400 text-xs line-clamp-2 mb-5 leading-relaxed">${safeText(post.description || post.body.substring(0, 100))}...</p>
                        <button type="button" onclick="getArticleBySlug('${post.slug}')" class="mt-auto inline-flex w-full items-center justify-center py-3 px-4 bg-slate-950 border border-slate-800 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all active:scale-95">
                            Baca Selengkapnya 
                            <svg class="w-3 h-3 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </div>
                </article>
            `;
            };

            featured.forEach(post => { list.innerHTML += createCard(post); });

            if (others.length > 0) {
                const extraContainer = document.createElement('div');
                extraContainer.id = 'extra-articles';
                extraContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 col-span-full hidden mt-8'; // hidden by default
                others.forEach(post => { extraContainer.innerHTML += createCard(post); });
                list.appendChild(extraContainer);
            }

        } catch (err) { console.error('Gagal sync artikel:', err); }
    }

    window.syncArticles = syncArticles;

    window.toggleAllArticles = function () {
        const extra = document.getElementById('extra-articles');
        const btn = document.getElementById('btn-show-all');

        if (!extra) return;

        if (extra.classList.contains('hidden')) {
            extra.classList.remove('hidden');
            btn.innerHTML = 'Tutup Artikel Lainnya ↑';
            extra.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            extra.classList.add('hidden');
            btn.innerHTML = 'Lihat Semua Artikel →';
            document.getElementById('article-section').scrollIntoView({ behavior: 'smooth' });
        }
    };

    async function syncProducts() {
        const container = document.getElementById('products-list');
        if (!container) return;

        try {
            const data = await loadSiteData();
            const products = getCollection(data, 'products');
            if (!products.length) return;

            container.innerHTML = '';

            for (const product of products) {
                const safeProductData = JSON.stringify(product).replace(/"/g, '&quot;');

                const productImage = product.image
                    ? `<img src="${safeUrl(product.image)}" class="w-full h-full object-cover rounded-[2rem] shadow-sm" alt="${safeText(product.title)}">`
                    : `<span class="text-5xl group-hover:scale-110 transition-transform duration-500">📖</span>`;

                container.innerHTML += `
        <div class="group bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-sm hover:shadow-xl hover:shadow-emerald-950/20 transition-all duration-500 overflow-hidden col-span-full">
            <div class="flex flex-col md:flex-row items-center p-4 md:p-6 gap-8">
                
                <div onclick="window.openProductModal(${safeProductData})"
                    class="w-full md:w-48 h-48 bg-slate-800/50 rounded-[2rem] flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-800 ring-1 ring-transparent hover:ring-emerald-500/30 transform hover:scale-102 transition-all duration-500">
                    ${productImage}
                </div>

                <div class="flex-grow text-center md:text-left">
                    <div class="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                        <h3 onclick="window.openProductModal(${safeProductData})"
                            class="text-xl font-black text-slate-100 cursor-pointer hover:text-emerald-400 transition-colors duration-300">
                            ${safeText(product.title, 'Produk')}
                        </h3>
                        <span class="hidden md:block w-1 h-1 rounded-full bg-emerald-500"></span>
                        <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">E-Book Series</span>
                    </div>
                    <p class="text-[13px] leading-relaxed text-slate-400 mb-4 max-w-2xl">${safeText(product.description)}</p>
                    
                    <div class="flex items-center justify-center md:justify-start gap-4">
                        <div class="flex items-center gap-1 text-emerald-500">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                            <span class="text-[11px] font-bold">Akses Selamanya</span>
                        </div>
                    </div>
                </div>

                </div>
        </div>`;
            }
        } catch (error) {
            console.error('Gagal load produk:', error);
        }
    }

    window.openProductModal = function (product) {
        const modal = document.getElementById('product-modal');
        if (!modal) return;

        document.getElementById('modal-product-title').innerText = product.title || 'Produk';
        document.getElementById('modal-product-category').innerText = product.category || 'E-BOOK SERIES';
        document.getElementById('modal-product-price').innerText = product.price || 'Gratis';

        const descContainer = document.getElementById('modal-product-description');
        if (descContainer) {
            descContainer.innerHTML = product.description || 'Detail deskripsi belum tersedia.';
        }

        const modalImg = document.getElementById('modal-product-img');
        if (modalImg) {
            const imgSrc = product.image || 'public/images/uploads/book-icon.png';
            modalImg.src = imgSrc;
            modalImg.alt = product.title || 'Produk';

            modalImg.setAttribute('onclick', `window.zoomImage('${imgSrc}')`);
            modalImg.className = 'h-20 w-20 object-contain transition-all duration-300 cursor-zoom-in hover:scale-105';
        }

        const modalBtn = document.getElementById('modal-product-btn');
        if (modalBtn) {
            modalBtn.href = product.link || 'https://wa.me/6281932692047';
            modalBtn.innerText = 'BELI SEKARANG';

            modalBtn.setAttribute('data-umami-event', `Beli ${product.title || 'Produk'}`);
        }

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    window.closeProductModal = function () {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.add('hidden');
            const lightbox = document.querySelector('.cursor-zoom-out');
            if (!lightbox) {
                document.body.style.overflow = 'auto';
            }
        }
    };

    window.zoomImage = function (src) {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[10000] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out opacity-0 transition-opacity duration-300';

        const img = document.createElement('img');
        img.src = src;
        img.className = 'max-h-[90vh] max-w-full object-contain rounded-2xl shadow-2xl transform scale-90 transition-transform duration-300';

        overlay.appendChild(img);
        document.body.appendChild(overlay);

        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            img.classList.remove('scale-90');
            img.classList.add('scale-100');
        }, 10);

        const closeLightbox = () => {
            overlay.classList.add('opacity-0');
            img.classList.remove('scale-100');
            img.classList.add('scale-90');

            setTimeout(() => {
                overlay.remove();
                const productModal = document.getElementById('product-modal');
                const articleModal = document.getElementById('article-modal');
                const isProductModalHidden = productModal ? productModal.classList.contains('hidden') : true;
                const isArticleModalHidden = articleModal ? articleModal.classList.contains('hidden') : true;

                if (isProductModalHidden && isArticleModalHidden) {
                    document.body.style.overflow = 'auto';
                }
            }, 300);
        };

        overlay.addEventListener('click', closeLightbox);

        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    };

    async function syncQuizzes() {
        const listTahfidz = document.getElementById('list-tahfidz');
        const listTajwid = document.getElementById('list-tajwid');
        if (!listTahfidz || !listTajwid) return;

        try {
            const data = await loadSiteData();
            const quizzes = getCollection(data, 'quizzes');

            listTahfidz.innerHTML = '';
            listTajwid.innerHTML = '';

            quizzes.forEach(quiz => {
                const category = (quiz.category || '').toLowerCase();
                const quizHtml = `
                <div class="flex items-center justify-between bg-slate-900/70 p-4 rounded-xl border border-slate-800 shadow-sm hover:bg-slate-900 transition-all">
                    <div>
                        <h4 class="text-sm font-bold text-slate-100">${safeText(quiz.title)}</h4>
                        <p class="text-[10px] text-slate-400">${safeText(quiz.description)}</p>
                    </div>
                    <a href="${safeUrl(quiz.link)}" target="_blank" class="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300">
                        Mulai Quiz ⚡
                    </a>
                </div>
            `;

                if (category === 'tahfidz') listTahfidz.innerHTML += quizHtml;
                else if (category === 'tajwid') listTajwid.innerHTML += quizHtml;
            });

        } catch (err) { console.error(err); }
    }

    async function syncAbout() {
        const historyEl = document.getElementById("about-history");
        const slidesEl = document.getElementById("about-slides");
        const visionEl = document.getElementById("about-vision");
        const missionsEl = document.getElementById("about-missions");

        if (!historyEl) return;

        try {
            const siteData = await loadSiteData();
            const data = siteData?.about_details || {};

            // 1. Render Sejarah
            historyEl.innerHTML = window.marked
                ? window.marked.parse(data.history || '')
                : renderSimpleMarkdown(data.history || '');

            // 2. Render Visi & Misi
            if (visionEl) visionEl.innerText = data.vision ? `"${data.vision}"` : "";
            if (missionsEl && data.missions) {
                missionsEl.innerHTML = data.missions.map(misi => `
        <p class="relative pl-4">
            <span class="absolute left-0 text-emerald-500">•</span>
            ${safeText(misi)}
        </p>
    `).join('');
            }

            // 3. Render Gallery (Grid Full)
            if (slidesEl && data.slides) {
                slidesEl.innerHTML = data.slides.map(slide => {
                    const imgPath = safeUrl(slide.image);
                    return `
                        <a href="${imgPath}" data-fancybox="about-gallery" class="cursor-zoom-in block overflow-hidden rounded-2xl shadow-md">
                            <img src="${imgPath}" class="h-48 md:h-64 w-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy">
                        </a>
                    `;
                }).join('');

                if (window.Fancybox) {
                    window.Fancybox.bind("[data-fancybox='about-gallery']", { Images: { zoom: true } });
                }
            }
        } catch (err) { console.error('Gagal sync about:', err); }
    }

    window.zoomImage = function (src) {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out opacity-0 transition-opacity duration-300';

        const img = document.createElement('img');
        img.src = src;
        img.className = 'max-h-[90vh] max-w-full object-contain rounded-2xl shadow-2xl transform scale-90 transition-transform duration-300';

        overlay.appendChild(img);
        document.body.appendChild(overlay);

        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            img.classList.remove('scale-90');
            img.classList.add('scale-100');
        }, 10);

        const closeLightbox = () => {
            overlay.classList.add('opacity-0');
            img.classList.remove('scale-100');
            img.classList.add('scale-90');

            setTimeout(() => {
                overlay.remove();
                const articleModal = document.getElementById('article-modal');
                if (articleModal && articleModal.classList.contains('hidden')) {
                    document.body.style.overflow = 'auto';
                }
            }, 300);
        };

        overlay.addEventListener('click', closeLightbox);

        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    };

    window.NgajikeunApi = {
        syncAbout,
        syncPrograms,
        getProgramBySlug,
        syncMentors,
        syncTestimonials,
        syncArticles,
        syncProducts,
        syncQuizzes,
        getArticleBySlug
    };

    window.toggleQuizList = function (cat) {
        const list = document.getElementById(`list-${cat}`);
        const btn = document.getElementById(`btn-${cat}`);

        if (!list || !btn) {
            console.error("Elemen list atau button tidak ketemu, Bro!");
            return;
        }

        if (list.classList.contains('hidden')) {
            list.classList.remove('hidden');
            list.classList.add('animate-in', 'fade-in', 'slide-in-from-top-2');
            btn.innerText = `Tutup Kuis ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
            btn.classList.replace('bg-slate-800', 'bg-red-500');
        } else {
            list.classList.add('hidden');
            btn.innerText = `Buka Kuis ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
            btn.classList.replace('bg-red-500', 'bg-slate-800');
        }
    };
}());
