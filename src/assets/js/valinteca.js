
export function registerHomeEvents() {
    displayCategories();
    displayCategoryPerfumes();
}

export function registerAppEvents() {
    HandleActiveLink();
    HandleSearchOverlay();
    initVoiceSearch();
}

export function registerProductPage() {
    HandleMiniDesc();
    HandleAccordion();
}

//? GLOBAL METHODS => Needed on every page
function HandleSearchOverlay() {
    const overlay = document.querySelector("header .overlay"),
        searchIcon = document.querySelector("header .sicon-search");

    searchIcon.addEventListener("click", () => {
        overlay.classList.add("show");
        document.body.style.overflow = "hidden";
    });

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("overlay") || e.target.classList.contains("cancel-icon")) {
            overlay.classList.remove("show");
            document.body.style.overflow = "auto";
        }
    });
}
function HandleActiveLink() {
    window.addEventListener('load', () => {
        const navLinks = document.querySelectorAll('header #mobile-menu li a'),
            urlCurrentPage = window.location.href;
        navLinks.forEach(link => {
            if (link.href == urlCurrentPage) {
                link.classList.add('active');
            }
        });
    });
}
function initVoiceSearch() {
    const voiceSearchBtn = document.querySelector(".voice-search-btn");
    voiceSearchBtn.addEventListener("click", () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const speechRecognition = new SpeechRecognition();
        let isValidResult = false;
        speechRecognition.lang = "ar-SA";
        speechRecognition.start();
        voiceSearchBtn.classList.add("is-recording");

        speechRecognition.onresult = (event) => {
            const searchInput = document.querySelector(".header-search .s-search-input");
            const inputEvent = new KeyboardEvent('input');
            const currentResult = event.resultIndex;
            const transcript = event.results[currentResult][0].transcript;
            searchInput.focus();
            searchInput.value = transcript;
            searchInput.dispatchEvent(inputEvent);
            voiceSearchBtn.classList.remove("is-recording");
            isValidResult = true;
        };

        speechRecognition.onerror = () => {
            voiceSearchBtn.classList.remove("is-recording");
            salla.notify.error(`حدث خطأ ما ، يرجى إعادة المحاولة`);
        };

        speechRecognition.onend = () => {
            voiceSearchBtn.classList.remove("is-recording");
            if (!isValidResult) {
                salla.notify.error(`أنتهت مدة التسجيل ، يرجى المحاولة مرة آخرى و التحدث بصوت أوضح`);
            }
        };
    });
}

//? HOME PAGE METHODS => Only needed on home page
function displayCategoryPerfumes() {
    const categoryPerfumesSections = document.querySelectorAll(".category-perfumes-section");
    if (categoryPerfumesSections.length < 1) return;

    categoryPerfumesSections.forEach(section => {
        const categoryId = section.dataset.id;
        const categoryPosition = section.dataset.position;
        const sallaSliderContaier = section.querySelector(".category-perfumes-slider");
        const queryParams = {
            source: 'categories',
            source_value: [categoryId],
            limit: 6,
        };

        salla.product.fetch(queryParams)
            .then((response) => {
                const products = response.data;
                const itemsContainerFragment = document.createDocumentFragment();
                itemsContainerFragment.slot = "items";
                products.forEach(product => {
                    const productCardContainer = document.createElement("div");
                    const productCardComponent = document.createElement("custom-salla-product-card");
                    productCardComponent.product = product;
                    productCardContainer.append(productCardComponent);
                    productCardContainer.classList.add("category-perfumes-product");
                    itemsContainerFragment.append(productCardContainer);
                });
                sallaSliderContaier.innerHTML = `
                    <salla-slider
                        type="default"
                        show-controls="false"
                        pagination
                        id="slider-with-bg-${categoryPosition}"
                        sliderConfig={
                            pagination: true,
                            slidesPerView: 1,
                            breakpoints: {
                                320: {
                                    slidesPerView: 2,
                                },
                                900: {
                                    slidesPerView: 3,
                                }
                            }
                        }
                    >
                        <div slot="items"></div>
                    </salla-slider>
                    `;
                sallaSliderContaier.querySelector("div[slot='items']").append(itemsContainerFragment);
            })
            .catch((error) => {
                // Handle errors..
            });
    });
}
function displayCategories() {
    const framedCategoryCards = document.querySelectorAll(".categories-section .framed-category-card");
    if (framedCategoryCards.length < 1) return;

    framedCategoryCards?.forEach(card => {
        const categoryId = card.dataset.id;
        salla.product.categories(categoryId).then((response) => {
            card.setAttribute("href", response.data.url);
            card.querySelector(".categories-col-title .text-wrapper").textContent = response.data.name;
        });
    });
}

//? Product PAGE METHODS => Only needed on product page
function HandleMiniDesc() {
    const miniDesc = document.querySelector('.main-content .mini-desc'),
        showMoreBtn = document.querySelector('.main-content .show-more-desc');

    if (miniDesc) {
        if (miniDesc && miniDesc.clientHeight < miniDesc.scrollHeight) {
            showMoreBtn.style.display = 'block';
        }
    }
}
function HandleAccordion() {
    const acordion = document.querySelector(".acordion"),
        tabs = acordion?.querySelectorAll(".tabs .tab-item"),
        contentItems = acordion?.querySelectorAll('.content');

    tabs?.forEach((tab) => {
        tab.addEventListener('click', (e) => {
            tabs.forEach((tab) => {
                tab.classList.remove('active');
            });
            e.currentTarget.classList.add('active');
            contentItems.forEach((itm) => {
                itm.classList.remove('content-active');
            });
            const targetContent = acordion.querySelector(`[data-dst="${e.currentTarget.dataset.src}"]`);
            targetContent.classList.add('content-active');
        });
    });
}