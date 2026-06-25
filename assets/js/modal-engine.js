(function () {
    const { safeText, safeUrl, renderSimpleMarkdown } = window.NgajikeunUtils;

    function getModalElements() {
        return {
            modal: document.getElementById('article-modal'),
            content: document.getElementById('modal-content')
        };
    }

    function getAppData() {
        return window.NG_DATA || {};
    }

    function matchesId(item, id) {
        const target = String(id ?? '');
        return [
            item?.id,
            item?.slug,
            item?.title,
            item?.name
        ].some((value) => String(value ?? '') === target);
    }

    function findRecord(type, id) {
        const data = getAppData();
        const collectionMap = {
            article: data.articles || [],
            mentor: data.mentors || [],
            product: data.products || [],
            quiz: data.quizzes || [],
            testimonial: data.testimonials || []
        };

        return collectionMap[type]?.find((item) => matchesId(item, id)) || null;
    }

    async function resolveRecord(type, id) {
        const localRecord = typeof id === 'object' && id !== null
            ? id
            : findRecord(type, id);

        if (localRecord) return localRecord;

        if (type === 'article') {
            return window.NgajikeunApi?.getArticleBySlug?.(id, getAppData().site) || null;
        }

        return null;
    }

    function resetModalScroll() {
        const { modal, content } = getModalElements();

        if (modal) modal.scrollTop = 0;
        if (content) content.scrollTop = 0;
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

    function renderMentor(record) {
        const imageUrl = safeUrl(record.image, 'public/images/uploads/logo-ngk.png');
        const bio = record.bio || record.description || 'Profil sedang dimuat...';

        return `
            <div class="max-w-2xl mx-auto text-center">
                <div id="mentor-img-container" class="relative inline-flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-slate-800 shadow-md mb-6">
                    <img id="modal-mentor-img" src="${imageUrl}" onclick="window.toggleMentorImageZoom(this)" class="h-full w-full object-cover cursor-zoom-in transition-transform duration-300">
                </div>
                <span id="modal-mentor-badge" class="text-emerald-400 font-bold tracking-widest text-[10px] uppercase block mb-4">${safeText(record.specialty || record.badge || 'Muhafizhoh Bersanad')}</span>
                <h2 id="modal-mentor-name" class="text-3xl md:text-4xl font-black text-slate-100 mb-6 leading-tight">${safeText(record.name, 'Nama Musyrifah')}</h2>
                <div id="modal-mentor-bio" class="prose prose-invert prose-emerald prose-sm max-w-none text-slate-300 leading-relaxed text-left border-t border-slate-800 pt-8">
                    ${bio}
                </div>
            </div>
        `;
    }

    function renderProduct(record) {
        const imgSrc = record.image ? safeUrl(record.image) : '';
        const imageHtml = imgSrc
            ? `<img id="modal-product-img" src="${imgSrc}" alt="${safeText(record.title)}" onclick="window.zoomImage('${imgSrc}')" class="h-20 w-20 object-contain transition-all duration-300 cursor-zoom-in hover:scale-105">`
            : `<span id="modal-product-img" class="text-5xl select-none transition-transform duration-500">📖</span>`;

        return `
            <div class="max-w-2xl mx-auto text-center">
                <div class="mx-auto mb-6 h-24 w-24 rounded-[2rem] bg-slate-800/50 flex items-center justify-center overflow-hidden">
                    ${imageHtml}
                </div>
                <span id="modal-product-category" class="text-emerald-400 font-bold tracking-widest text-[10px] uppercase block mb-4">${safeText(record.category || 'E-BOOK SERIES')}</span>
                <h2 id="modal-product-title" class="text-3xl md:text-4xl font-black text-slate-100 mb-3 leading-tight">${safeText(record.title, 'Produk')}</h2>
                <p id="modal-product-price" class="text-emerald-400 font-black text-sm uppercase tracking-widest mb-6">${safeText(record.price || 'Gratis')}</p>
                <div id="modal-product-description" class="prose prose-invert prose-emerald prose-sm max-w-none text-slate-300 leading-relaxed text-left border-t border-slate-800 pt-8 mb-8">
                    ${record.description || 'Detail deskripsi belum tersedia.'}
                </div>
                <a id="modal-product-btn" href="${safeUrl(record.link || 'https://wa.me/6281932692047')}" target="_blank" rel="noopener noreferrer"
                   data-umami-event="Beli ${safeText(record.title || 'Produk')}"
                   class="inline-block w-full sm:w-auto px-8 py-4 bg-emerald-600 border border-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-950/50">
                    BELI SEKARANG
                </a>
            </div>
        `;
    }

    function renderQuiz(record) {
        return `
            <div class="max-w-2xl mx-auto text-center">
                <span class="text-emerald-400 font-bold tracking-widest text-[10px] uppercase block mb-4">${safeText(record.category || 'Quiz')}</span>
                <h2 class="text-3xl md:text-4xl font-black text-slate-100 mb-6 leading-tight">${safeText(record.title)}</h2>
                <p class="text-slate-300 leading-relaxed mb-8">${safeText(record.description)}</p>
                <a href="${safeUrl(record.link)}" target="_blank" rel="noopener noreferrer"
                   class="inline-block w-full sm:w-auto px-8 py-4 bg-emerald-600 border border-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-950/50">
                    Mulai Quiz ⚡
                </a>
            </div>
        `;
    }

    function renderTestimonial(record) {
        const imageUrl = safeUrl(
            record.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(record.name || 'Santri')}`,
            'https://ui-avatars.com/api/?name=Santri'
        );

        return `
            <div class="max-w-2xl mx-auto text-center">
                <img src="${imageUrl}" class="w-20 h-20 rounded-full border-2 border-emerald-500 mx-auto mb-6">
                <span class="text-emerald-400 font-bold tracking-widest text-[10px] uppercase block mb-4">${safeText(record.status)}</span>
                <h2 class="text-3xl md:text-4xl font-black text-slate-100 mb-6 leading-tight">${safeText(record.name, 'Santri')}</h2>
                <div class="text-slate-300 leading-relaxed text-left border-t border-slate-800 pt-8 italic">
                    ${safeText(record.content)}
                </div>
            </div>
        `;
    }

    function renderModalContent(type, record) {
        if (!record) return '';

        switch (type) {
            case 'article':
                return window.NgajikeunRender?.renderArticleModal
                    ? window.NgajikeunRender.renderArticleModal(record)
                    : '';
            case 'mentor':
                return renderMentor(record);
            case 'product':
                return renderProduct(record);
            case 'quiz':
                return renderQuiz(record);
            case 'testimonial':
                return renderTestimonial(record);
            default:
                return '';
        }
    }

    function showModal(html, type) {
        const { modal, content } = getModalElements();

        if (!modal || !content || !html) return;

        content.innerHTML = '';
        content.innerHTML = html;
        modal.dataset.activeModal = type;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        resetModalScroll();

        if (type === 'article') {
            return;
        }

        styleMarkdownTables(content);
    }

    async function openGlobalModal(type, id) {
        const modalType = String(type || '').toLowerCase();
        const record = await resolveRecord(modalType, id);
        const html = renderModalContent(modalType, record);

        showModal(html, modalType);
        return record;
    }

    function closeGlobalModal() {
        const { modal, content } = getModalElements();

        if (!modal) return;

        if (content) content.innerHTML = '';
        modal.classList.add('hidden');
        delete modal.dataset.activeModal;
        document.body.style.overflow = 'auto';
        resetModalScroll();
    }

    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-modal][data-id]');
        if (trigger) {
            event.preventDefault();
            openGlobalModal(trigger.dataset.modal, trigger.dataset.id);
            return;
        }

        const { modal } = getModalElements();
        if (modal && event.target === modal) {
            closeGlobalModal();
        }
    });

    window.openGlobalModal = openGlobalModal;
    window.closeGlobalModal = closeGlobalModal;

    window.getArticleBySlug = function getArticleBySlug(slug) {
        return openGlobalModal('article', slug);
    };

    window.openArticleModal = function openArticleModal(slug) {
        return openGlobalModal('article', slug);
    };

    window.openProductModal = function openProductModal(productOrId) {
        return openGlobalModal('product', productOrId);
    };

    window.openMentorModal = function openMentorModal(mentorOrId) {
        return openGlobalModal('mentor', mentorOrId);
    };

    window.closeArticleModal = closeGlobalModal;
}());
