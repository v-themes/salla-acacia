
export function registerHomeEvents() {
    displayCategories();
    displayCategoryPerfumes();
}

export function registerAppEvents() {
    HandleActiveLink();
    HandleBackToTop();
}

export function registerProductPage() {
    HandleMiniDesc();
    HandleAccordion();
}



function HandleBackToTop() {
    const toTopBtn = document.querySelector(".toTop");
    if (!toTopBtn) return;

    let lastCallTime = 0;
    const onScroll = () => {
        const currentTime = Date.now();
        if (currentTime - lastCallTime < 100) return;
        lastCallTime = currentTime;

        toTopBtn.classList.toggle("active", window.scrollY >= 300);

        const pos = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const calcHeight = scrollHeight - clientHeight;

        if (calcHeight > 0) {
            const scrollValue = Math.round((pos * 100) / calcHeight);
            toTopBtn.style.background = `conic-gradient(var(--color-primary) ${scrollValue}%, var(--color-primary-reverse) ${scrollValue}%)`;
        }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    toTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
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