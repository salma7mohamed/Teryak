/**
 * Teryak Platform - Reusable <app-footer> Web Component
 */

class AppFooter extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  getBasePath() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/pages/public/') || path.includes('/pages/pharmacist/') || path.includes('/pages/admin/')) {
      return '../../';
    } else if (path.includes('/pages/')) {
      return '../';
    } else {
      return './';
    }
  }

  render() {
    const base = this.getBasePath();
    const logoImg = base + 'assets/images/logo.png';
    const homeUrl = base + 'index.html';
    const medicinesUrl = base + 'pages/public/medicines.html';
    const pharmaciesUrl = base + 'pages/public/pharmacies.html';
    const donationUrl = base + 'pages/public/donation.html';
    const aboutUrl = base + 'pages/public/about.html';

    this.innerHTML = `
      <footer class="app-unified-footer">
        <div class="footer-container">
          <!-- Main Content Grid -->
          <div class="footer-grid">
            <!-- Brand Column -->
            <div class="footer-col brand-col">
              <a href="${homeUrl}" class="footer-brand">
                <img class="brand-logo" src="${logoImg}" alt="Teryak Logo">
                <div class="brand-text">
                  <h2>تِـرْيَـاق</h2>
                  <span class="brand-badge">الرعاية الدوائية الذكية</span>
                </div>
              </a>
              <p class="brand-desc">منصة ترياق الرقمية تساعدك في البحث عن الدواء بسهولة، معرفة أقرب الصيدليات المتوفرة بها، حجزه، والتبرع بالأدوية إلكترونياً.</p>
              
              <!-- Quick Stats / Trust Badges -->
              <div class="footer-trust-tags">
                <span class="trust-tag"><i class="fa-solid fa-shield-halved"></i> معتمد وموثوق</span>
                <span class="trust-tag"><i class="fa-solid fa-bolt"></i> تحديث فوري</span>
              </div>
            </div>

            <!-- Links Columns Group (Mobile 2-Column Grid) -->
            <div class="footer-links-group">
              <!-- Quick Links -->
              <div class="footer-col links-col">
                <h3 class="footer-heading">روابط سريعة</h3>
                <ul class="footer-nav">
                  <li><a href="${homeUrl}"><i class="fa-solid fa-angle-left"></i> الرئيسية</a></li>
                  <li><a href="${medicinesUrl}"><i class="fa-solid fa-angle-left"></i> دليل الأدوية</a></li>
                  <li><a href="${pharmaciesUrl}"><i class="fa-solid fa-angle-left"></i> الصيدليات</a></li>
                  <li><a href="${donationUrl}"><i class="fa-solid fa-angle-left"></i> التبرع والاستبدال</a></li>
                  <li><a href="${aboutUrl}"><i class="fa-solid fa-angle-left"></i> من نحن</a></li>
                </ul>
              </div>

              <!-- Services -->
              <div class="footer-col services-col">
                <h3 class="footer-heading">خدمات المنصة</h3>
                <ul class="footer-nav">
                  <li><a href="${medicinesUrl}"><i class="fa-solid fa-magnifying-glass"></i> بحث الأدوية</a></li>
                  <li><a href="${pharmaciesUrl}"><i class="fa-solid fa-location-dot"></i> أماكن التوفر</a></li>
                  <li><a href="${donationUrl}"><i class="fa-solid fa-hand-holding-heart"></i> تبرع بالأدوية</a></li>
                  <li><a href="${medicinesUrl}"><i class="fa-solid fa-bag-shopping"></i> حجز أونلاين</a></li>
                </ul>
              </div>
            </div>

            <!-- Contact & Social Column -->
            <div class="footer-col contact-col">
              <h3 class="footer-heading">تواصل معنا</h3>
              <p class="contact-sub">فريق الدعم متواجد لخدمتكم على مدار الساعة.</p>
              
              <div class="contact-cards">
                <a href="tel:+201234567890" class="contact-card" title="اتصل بنا">
                  <div class="contact-icon"><i class="fa-solid fa-phone"></i></div>
                  <div class="contact-info">
                    <small>الهاتف المباشر</small>
                    <span dir="ltr">+20 123 456 7890</span>
                  </div>
                </a>

                <a href="mailto:info@teryak.com" class="contact-card" title="راسلنا عبر البريد">
                  <div class="contact-icon"><i class="fa-solid fa-envelope"></i></div>
                  <div class="contact-info">
                    <small>البريد الإلكتروني</small>
                    <span>info@teryak.com</span>
                  </div>
                </a>
              </div>

              <!-- Social Media Links -->
              <div class="footer-social">
                <span class="social-label">تابعنا على:</span>
                <div class="social-icons">
                  <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="social-btn fb"><i class="fa-brands fa-facebook-f"></i></a>
                  <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="social-btn ig"><i class="fa-brands fa-instagram"></i></a>
                  <a href="https://wa.me/201110590993" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" class="social-btn wa"><i class="fa-brands fa-whatsapp"></i></a>
                  <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="social-btn in"><i class="fa-brands fa-linkedin-in"></i></a>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Footer Bar -->
          <div class="footer-bottom">
            <div class="bottom-brand">
              <span class="brand-mini">تِـرْيَـاق</span>
              <span class="copyright">© ${new Date().getFullYear()} جميع الحقوق محفوظة لمنصة ترياق الطبية</span>
            </div>

            <div class="bottom-links">
              <a href="${aboutUrl}">عن المنصة</a>
              <span class="sep">•</span>
              <a href="${aboutUrl}">الشروط والأحكام</a>
              <span class="sep">•</span>
              <a href="${aboutUrl}">الخصوصية</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('app-footer', AppFooter);

