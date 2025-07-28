
class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.isInitialized = false;
  }

  connectedCallback() {
    if (this.isInitialized) {
      return;
    }

    // Setting props
    this.horizontal = this.getAttribute('horizontal') === 'true';
    this.special = this.getAttribute('special') === 'true';
    this.showWishlist = this.getAttribute('show-wishlist') === 'true';
    this.product = this.product || JSON.parse(this.getAttribute('product'));  // Assuming 'product' attribute is a JSON string

    // Append host classes and id
    this.parentElement.classList.remove('s-products-slider-card'); // overide default class..
    this.parentElement.classList.add('!h-auto');

    this.classList.add('s-product-card-entry', 'custom-card');
    this.id = `product_${this.product.id}`;
    if (this.product.is_out_of_stock) this.classList.add('is-out');
    if (this.horizontal) this.classList.add("h-card");
    if (this.special) this.classList.add("full-image");

    // Wait until the Salla library has fully loaded before initializing and rendering the component
    salla.onReady(() => {
      // Add fit type class
      let fitType = salla.config.get('store.settings.product.fit_type');
      if (!!fitType) {
        this.classList.add(`${fitType}`);
      }

      // The element is ready for rendering now
      this.render();

      // Check if translations are loaded, if not then load them and re-render
      if (!salla.lang.translationsLoaded) {
        salla.lang.onLoaded(() => this.render());
      }
    });

    this.isInitialized = true;
  }

  dateFormat(seconds) {
    if (typeof seconds != 'number') return seconds;

    const date = new Date(seconds * 1000);
    return date.toISOString().split('T')[0];
  }

  setTranslations(ar, en) {
    return salla.lang.getLocale() == 'en' ? en : ar;
  }


  render() {
    // Handle landing page
    this.source = salla.config.get('page.slug');
    if (this.source == 'landing-page') {
      this.hideAddBtn = true;
      this.showQuantity = true;
    }

    // Translations
    const remained = salla.lang.get('pages.products.remained');
    const donationPH = salla.lang.get('pages.products.donation_placeholder');
    const startingPrice = salla.lang.get('pages.products.starting_price');
    const outOfStock = salla.lang.get('pages.products.out_of_stock');
    const addToCartLabel = this.setTranslations('إضافة للسلة', 'Add to cart');
    const bookingLabel = this.setTranslations("احجــز الآن", "Booking now");

    this.innerHTML = `     
      <div class="product-block__thumb card-image relative">
        ${this.product.promotion_title ? `<div class="promo-title">${this.product.promotion_title}</div>` : ''}

        <a href="${this.product.url}" class="thumb-wrapper" aria-label="${this.product.name}">
          <img class="h-full w-full lazy-load object-${salla.config.get('store.settings.product.fit_type')} bg-stone-100" src="https://themes.valinteca.com/assets/electron/img_loader.webp" data-src="${this.product.image.url}" alt="${this.product.image.alt}" />
        </a>

        ${this.product.discount_ends && this.product.is_on_sale && !this.special ? `<salla-count-down class="salla-counter" digits="en" date="${this.dateFormat(this.product.discount_ends)}" size="sm"></salla-count-down>` : ''}
      </div>

      <div class="card-content">
        <div class="product-block__info w-full flex-1 ${this.special ? 'flex justify-between gap-3' : ''}">
          <div class="flex-1 flex flex-col gap-2">
            ${this.product.subtitle ? `<p class="text-sm text-primary font-medium line-clamp-1">${this.product.subtitle}</p>` : ''}

            <h3 class="text-sm text-slate-700 font-semibold line-clamp-2">
              <a href="${this.product.url}">${this.product.name}</a>
            </h3>

            <div class="price-wrapper flex-1 flex flex-col justify-end">
                ${this.product.is_on_sale ? `
                  <div class="flex items-center flex-wrap gap-2 mb-1.5 ${this.special ? '' : 'justify-center'}">
                    <small class="line-through text-sm text-gray-400 font-medium">${salla.money(this.product.regular_price)}</small>
                    <span class="text-green-500 text-base font-semibold tracking-wider">${salla.money(this.product.sale_price)}</span>
                  </div>
                  <span class="text-xs font-semibold">${this.setTranslations("وفر مبلغ", "You are saving")}<span class="text-red-500 mx-1">${salla.money(Math.round(this.product.regular_price - this.product.sale_price))}</span></span>
                ` : this.product.starting_price ? `
                  <div class="font-semibold">
                    <small class="text-sm font-semibold text-slate-700">${startingPrice}</small>
                    <span class="text-red-500 text-base mx-2.5">${salla.money(this.product.starting_price)}</span>
                  </div>
                ` : `<span class="text-green-500 text-base font-semibold tracking-wide">${salla.money(this.product.price)}</span>`}
            </div>
          </div>
          ${this.special && this.product.quantity ? `
            <div class="pie-wrapper shrink-0">
              <span><b>${this.product.quantity}</b> ${remained}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -1 36 34" class="pie-svg">
                  <circle cx="16" cy="16" r="15.9155" class="circle_base"></circle>
                  <circle cx="16" cy="16" r="15.9155" class="circle_bar" style="stroke-dashoffset: ${100 - ((this.product.quantity / (this.product.quantity > 100 ? this.product.quantity * 2 : 100)) * 100)};"></circle>
              </svg>
            </div>` : ''}
        </div>

        ${this.special && this.product.discount_ends ? `
          <salla-count-down class="salla-counter-lg" digits="en" date="${this.dateFormat(this.product.discount_ends)}" size="lg" boxed labeled></salla-count-down>
        ` : ''}

        <div class="actions">
          <salla-add-product-button aria-label="add_to_cart_button" class="add-to-cart min-w-[60px] h-[33px] ${this.horizontal ? '' : 'flex-1'}"
            product-id="${this.product.id}"
            product-status="${this.product.status}"
            product-type="${this.product.type}">
              <span class="hidden xs:block px-1 ${this.horizontal ? "!hidden" : ""} ${this.special ? '!block' : ''}">
                ${this.product.type == 'booking' ? bookingLabel : this.product.is_out_of_stock ? outOfStock : addToCartLabel}
              </span>
              <svg class="add-to-cart-icon" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44.1745 6.87627L43.2108 5.91492L44.1745 6.87627C43.6 7.45213 42.8202 7.77626 42.0063 7.77626H41.1698C41.0966 7.77656 41.0252 7.80062 40.9661 7.84538C40.9068 7.89035 40.8631 7.95391 40.8424 8.02683L40.8421 8.02787L35.4391 26.9814L35.4388 26.9821C35.0522 28.3354 34.2364 29.5262 33.1141 30.3743C31.9917 31.2225 30.6239 31.6815 29.2175 31.6815H13.6525C13.6524 31.6815 13.6523 31.6815 13.6522 31.6815C12.358 31.6817 11.0936 31.2931 10.0224 30.5661C8.95113 29.8391 8.12231 28.8074 7.64236 27.6044L7.64235 27.6043L2.62085 15.0165L2.62068 15.0161C2.3321 14.292 2.22489 13.5082 2.3083 12.7331C2.39172 11.9581 2.66326 11.2151 3.09945 10.5691C3.53564 9.92312 4.12328 9.39372 4.81123 9.02747C5.4992 8.66121 6.26641 8.46936 7.04575 8.46887H7.04661H34.3431L34.9501 6.34253C34.9501 6.34249 34.9501 6.34245 34.9501 6.34242C34.9502 6.34224 34.9502 6.34206 34.9503 6.34189C35.336 4.98883 36.1507 3.79775 37.2721 2.94902C38.3937 2.10012 39.7609 1.64002 41.1671 1.63878H41.1683H42.0063C42.8202 1.63878 43.6 1.96291 44.1745 2.53877C44.7488 3.11452 45.0709 3.89471 45.0709 4.70752C45.0709 5.52033 44.7488 6.30052 44.1745 6.87627ZM28.3795 45.3417C27.5292 45.3417 26.6873 45.1738 25.9019 44.8477C25.1165 44.5216 24.4032 44.0437 23.8024 43.4415C23.2016 42.8393 22.7253 42.1245 22.4003 41.3381C22.0754 40.5517 21.9082 39.7089 21.9082 38.8579C21.9082 38.0069 22.0754 37.1642 22.4003 36.3778C22.7253 35.5914 23.2016 34.8766 23.8024 34.2744C24.4032 33.6721 25.1166 33.1943 25.9019 32.8682C26.6873 32.542 27.5292 32.3742 28.3795 32.3742C30.0968 32.3742 31.7432 33.0581 32.9565 34.2744C34.1698 35.4906 34.8508 37.1394 34.8508 38.8579C34.8508 40.5765 34.1698 42.2253 32.9565 43.4415C31.7432 44.6578 30.0968 45.3417 28.3795 45.3417ZM14.7526 45.3417C13.9023 45.3417 13.0604 45.1738 12.2751 44.8477C11.4897 44.5216 10.7763 44.0437 10.1755 43.4415C9.57477 42.8393 9.0984 42.1245 8.77346 41.3381C8.44851 40.5517 8.28131 39.7089 8.28131 38.8579C8.28131 38.0069 8.44851 37.1642 8.77346 36.3778C9.0984 35.5914 9.57477 34.8766 10.1755 34.2744C10.7763 33.6721 11.4897 33.1943 12.2751 32.8682C13.0604 32.542 13.9023 32.3742 14.7526 32.3742C16.47 32.3742 18.1163 33.0581 19.3297 34.2744C20.5429 35.4906 21.2239 37.1394 21.2239 38.8579C21.2239 40.5765 20.5429 42.2253 19.3297 43.4415C18.1163 44.6578 16.47 45.3417 14.7526 45.3417Z" fill="white" stroke="" stroke-width="2" />
              </svg>
          </salla-add-product-button>
          
          <salla-button shape="icon" fill="none" color="light" aria-label="wishlist_button" class="btn--wishlist animated"
            onclick="salla.wishlist.toggle(${this.product.id})" data-id="${this.product.id}">
            <svg class="wishlist-heart" width="21" height="19" viewBox="0 0 21 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.8503 1.58581C16.6473 -0.618195 12.9343 -0.511194 10.6003 1.82181L10.2183 2.20381L9.83628 1.82181C7.50228 -0.511194 3.78928 -0.618194 1.58628 1.58681C-0.617723 3.79081 -0.511723 7.50381 1.82128 9.83681L10.2173 18.2328L18.6123 9.83681C20.9463 7.50381 21.0523 3.79081 18.8493 1.58681L18.8503 1.58581Z"/>
            </svg>
          </salla-button>
        </div>
      </div>
  `;
    document.lazyLoadInstance?.update(document.querySelectorAll('.product-block__thumb .lazy-load'));
  }
}

customElements.define('custom-salla-product-card', ProductCard);;