const CLINIC_CONFIG = {
    dokki: {
        name: "عيادة الدقي",
        phone: "+201004031635",
        whatsapp: "01004031635",
        displayPhone: "0100 403 1635"
    },
    faisal: {
        name: "عيادة فيصل",
        phone: "+201107840689",
        whatsapp: "01107840689",
        displayPhone: "0110 784 0689"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------------------------
    // 1. نظام الوضع الفاتح والداكن (Theme Toggle)
    // ----------------------------------------------------------------------
    const themeToggleBtn = document.getElementById("theme-toggle");
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    const savedTheme = localStorage.getItem("doctor_site_theme");
    const currentTheme = savedTheme || (prefersDarkScheme.matches ? "dark" : "light");

    document.documentElement.setAttribute("data-theme", currentTheme);
    updateThemeAria(currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme");
            const targetTheme = current === "dark" ? "light" : "dark";

            document.documentElement.setAttribute("data-theme", targetTheme);
            localStorage.setItem("doctor_site_theme", targetTheme);
            updateThemeAria(targetTheme);
        });
    }

    function updateThemeAria(theme) {
        if (!themeToggleBtn) return;
        if (theme === "dark") {
            themeToggleBtn.setAttribute("title", "التبديل إلى الوضع الفاتح");
            themeToggleBtn.setAttribute("aria-label", "التبديل إلى الوضع الفاتح");
        } else {
            themeToggleBtn.setAttribute("title", "التبديل إلى الوضع الداكن");
            themeToggleBtn.setAttribute("aria-label", "التبديل إلى الوضع الداكن");
        }
    }

    // ----------------------------------------------------------------------
    // 2. فلترة بطاقات النصائح الطبية بسلاسة
    // ----------------------------------------------------------------------
    const filterButtons = document.querySelectorAll(".filter-btn");
    const tipCards = document.querySelectorAll(".tips .card");
    const tipsCounter = document.querySelector(".tips-counter");
    const tipsTrack = document.querySelector(".tips");
    const tipsPrevious = document.querySelector(".tips-prev");
    const tipsNext = document.querySelector(".tips-next");
    let selectedTips = Array.from(tipCards);
    let currentTipIndex = 0;

    function renderTipsCarousel() {
        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        tipCards.forEach((card) => card.classList.remove("is-current"));

        if (isMobile) {
            tipCards.forEach((card) => (card.style.display = "none"));
            if (selectedTips.length) {
                const currentCard = selectedTips[currentTipIndex];
                currentCard.style.display = "flex";
                currentCard.classList.add("is-current");
                if (tipsCounter) tipsCounter.textContent = `${currentTipIndex + 1} / ${selectedTips.length}`;
            } else if (tipsCounter) {
                tipsCounter.textContent = "0 / 0";
            }
        } else {
            tipCards.forEach((card) => {
                card.style.display = selectedTips.includes(card) ? "flex" : "none";
            });
        }
    }

    function moveTip(direction) {
        if (!selectedTips.length) return;
        if (tipsTrack) tipsTrack.dataset.slideDirection = direction > 0 ? "next" : "previous";
        currentTipIndex = (currentTipIndex + direction + selectedTips.length) % selectedTips.length;
        renderTipsCarousel();
    }

    tipsPrevious?.addEventListener("click", () => moveTip(-1));
    tipsNext?.addEventListener("click", () => moveTip(1));
    window.addEventListener("resize", renderTipsCarousel);
    renderTipsCarousel();

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            filterButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");

            const filterValue = button.getAttribute("data-filter");
            selectedTips = Array.from(tipCards).filter((card) =>
                filterValue === "all" || card.getAttribute("data-category") === filterValue
            );
            currentTipIndex = 0;
            renderTipsCarousel();
        });
    });

    // تمييز رابط القسم الظاهر في النافبار أثناء التمرير.
    const sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const observedSections = Array.from(sectionLinks)
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    sectionLinks.forEach((link) => {
                        const isActive = link.getAttribute("href") === `#${entry.target.id}`;
                        link.classList.toggle("active", isActive);
                        if (isActive) link.setAttribute("aria-current", "location");
                        else link.removeAttribute("aria-current");
                    });
                });
            },
            { rootMargin: "-25% 0px -60% 0px", threshold: 0 }
        );
        observedSections.forEach((section) => sectionObserver.observe(section));
    }

    // تشغيل بطاقات الخدمات تلقائيًا على الهاتف مع إبقاء التمرير اليدوي متاحًا.
    const servicesTrack = document.querySelector(".services-grid");
    const serviceCards = servicesTrack ? Array.from(servicesTrack.querySelectorAll(".service-card")) : [];
    const servicesCounter = document.querySelector(".services-counter");
    const servicesPrevious = document.querySelector(".services-prev");
    const servicesNext = document.querySelector(".services-next");
    if (servicesTrack && serviceCards.length > 1) {
        let servicesTimer;
        let servicesScrollTimer;
        const isMobileServices = () => window.matchMedia("(max-width: 768px)").matches;

        const getCurrentServiceIndex = () => {
            const trackRect = servicesTrack.getBoundingClientRect();
            const trackCenter = trackRect.left + trackRect.width / 2;
            return serviceCards.reduce((closest, card, index) => {
                const rect = card.getBoundingClientRect();
                const distance = Math.abs(rect.left + rect.width / 2 - trackCenter);
                const closestRect = serviceCards[closest].getBoundingClientRect();
                const closestDistance = Math.abs(closestRect.left + closestRect.width / 2 - trackCenter);
                return distance < closestDistance ? index : closest;
            }, 0);
        };

        const updateServicesCounter = () => {
            if (servicesCounter) servicesCounter.textContent = `${getCurrentServiceIndex() + 1} / ${serviceCards.length}`;
        };

        const goToService = (index) => {
            const target = serviceCards[(index + serviceCards.length) % serviceCards.length];
            const trackRect = servicesTrack.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const offset = targetRect.left + targetRect.width / 2 - (trackRect.left + trackRect.width / 2);
            servicesTrack.scrollBy({ left: offset, behavior: "smooth" });
            if (servicesCounter) servicesCounter.textContent = `${((index + serviceCards.length) % serviceCards.length) + 1} / ${serviceCards.length}`;
        };

        const startServicesCarousel = () => {
            window.clearInterval(servicesTimer);
            if (!isMobileServices()) return;
            servicesTimer = window.setInterval(() => {
                const trackRect = servicesTrack.getBoundingClientRect();
                if (trackRect.bottom < 0 || trackRect.top > window.innerHeight) return;
                goToService(getCurrentServiceIndex() + 1);
            }, 3600);
        };

        servicesPrevious?.addEventListener("click", () => {
            goToService(getCurrentServiceIndex() - 1);
            startServicesCarousel();
        });
        servicesNext?.addEventListener("click", () => {
            goToService(getCurrentServiceIndex() + 1);
            startServicesCarousel();
        });
        servicesTrack.addEventListener("scroll", () => {
            window.clearTimeout(servicesScrollTimer);
            servicesScrollTimer = window.setTimeout(updateServicesCounter, 120);
        }, { passive: true });

        startServicesCarousel();
        window.addEventListener("resize", startServicesCarousel);
        servicesTrack.addEventListener("pointerdown", () => window.clearInterval(servicesTimer), { passive: true });
        servicesTrack.addEventListener("pointerup", startServicesCarousel, { passive: true });
    }

    // ----------------------------------------------------------------------
    // 3. نافذة حجز موعد استشارة وإرسالها الفعلي (WhatsApp & Phone & LocalStorage)
    // ----------------------------------------------------------------------
    const modalBackdrop = document.getElementById("booking-modal");
    const bookingTriggers = document.querySelectorAll(".js-open-booking");
    const modalCloseBtn = document.getElementById("modal-close");
    const bookingForm = document.getElementById("quick-booking-form");
    const modalMessage = document.getElementById("modal-message");

    function openModal(defaultClinic = "dokki") {
        if (modalBackdrop) {
            modalBackdrop.classList.add("active");
            document.body.style.overflow = "hidden";
            if (modalMessage) modalMessage.style.display = "none";
            if (bookingForm) {
                bookingForm.style.display = "block";
                const clinicSelect = document.getElementById("patient-clinic");
                if (clinicSelect && defaultClinic) {
                    clinicSelect.value = defaultClinic;
                }
            }
        }
    }

    function closeModal() {
        if (modalBackdrop) {
            modalBackdrop.classList.remove("active");
            document.body.style.overflow = "";
        }
    }

    bookingTriggers.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const clinic = btn.getAttribute("data-clinic") || "dokki";
            openModal(clinic);
        });
    });

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener("click", closeModal);
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener("click", (e) => {
            if (e.target === modalBackdrop) {
                closeModal();
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalBackdrop && modalBackdrop.classList.contains("active")) {
            closeModal();
        }
    });

    if (bookingForm) {
        bookingForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const patientName = document.getElementById("patient-name")?.value.trim() || "مراجع كريم";
            const patientPhone = document.getElementById("patient-phone")?.value.trim() || "غير محدد";
            const clinicKey = document.getElementById("patient-clinic")?.value || "dokki";
            const serviceSelect = document.getElementById("patient-service");
            const serviceText = serviceSelect
                ? serviceSelect.options[serviceSelect.selectedIndex].text
                : "استشارة جلدية";
            const notes = document.getElementById("patient-notes")?.value.trim() || "";

            const selectedClinic = CLINIC_CONFIG[clinicKey] || CLINIC_CONFIG.dokki;

            // حفظ الطلب في التخزين المحلي (LocalStorage) كأرشيف دائم للعيادة
            const newBooking = {
                id: "REQ-" + Date.now(),
                timestamp: new Date().toLocaleString("ar-EG"),
                name: patientName,
                phone: patientPhone,
                clinic: selectedClinic.name,
                service: serviceText,
                notes: notes
            };

            try {
                const storedBookings = JSON.parse(localStorage.getItem("clinic_appointments") || "[]");
                storedBookings.unshift(newBooking);
                localStorage.setItem("clinic_appointments", JSON.stringify(storedBookings));
            } catch (err) {
                console.warn("Unable to write to localStorage", err);
            }

            // إعداد نص رسالة الواتساب المهنية المرسلة لمنسق مواعيد العيادة
            const waMessage =
                `السلام عليكم ورحمة الله،
أود طلب حجز موعد كشف مع د. (.......):
- الاسم: ${patientName}
- رقم الجوال: ${patientPhone}
- العيادة: ${selectedClinic.name}
- الخدمة المطلوبة: ${serviceText}` + (notes ? `\n- ملاحظات إضافية: ${notes}` : "");

            const waUrl = `https://wa.me/${selectedClinic.whatsapp}?text=${encodeURIComponent(waMessage)}`;
            const telUrl = `tel:${selectedClinic.phone}`;

            // إخفاء النموذج وعرض شاشة الإرسال الفوري والمباشر
            bookingForm.style.display = "none";
            if (modalMessage) {
                modalMessage.style.display = "block";
                modalMessage.innerHTML = `
                    <div class="booking-success-container">
                        <div class="success-icon-badge">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10" stroke-width="1.8"/>
                                <path d="m8 12 3 3 5-6"/>
                            </svg>
                        </div>

                        <h3 class="success-title">تم تجهيز طلب موعدك بنجاح!</h3>
                        <p class="success-subtitle">أهلاً بك <strong>${patientName}</strong>، لتأكيد الموعد فوراً مع منسق العيادة في <strong>${selectedClinic.name}</strong>:</p>

                        <div class="booking-action-cards">
                            <!-- زر الإرسال المباشر عبر واتساب العيادة -->
                            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-action-wa">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                                </svg>
                                <span>إرسال الطلب فوراً عبر واتساب العيادة</span>
                            </a>

                            <!-- زر الاتصال الهاتفي المباشر بالعيادة -->
                            <a href="${telUrl}" class="btn-action-call">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                </svg>
                                <span>أو الاتصال هاتفياً بالعيادة (${selectedClinic.displayPhone})</span>
                            </a>
                        </div>

                        <div class="booking-archive-notice">
                            تم حفظ نسخة من بيانات طلبك بسجل مواعيد الموقع برقم مرجعي: <code>${newBooking.id}</code>
                        </div>

                        <button type="button" class="btn-secondary" onclick="document.getElementById('booking-modal').classList.remove('active'); document.body.style.overflow='';" style="margin-top: 16px; width: 100%; justify-content: center;">
                            إغلاق النافذة
                        </button>
                    </div>
                `;
            }
        });
    }

    // ----------------------------------------------------------------------
    // 4. معالجة الصور البديلة لضمان عدم حدوث أي خطأ 404
    // ----------------------------------------------------------------------
    const allImages = document.querySelectorAll("img");
    allImages.forEach((img) => {
        img.addEventListener("error", function () {
            const fallback = this.getAttribute("data-fallback");
            if (fallback && this.src !== fallback) {
                this.src = fallback;
            }
        });
    });

    // ----------------------------------------------------------------------
    // 5. زر عائم للعودة إلى أعلى الصفحة بسلاسة
    // ----------------------------------------------------------------------
    const backToTopBtn = document.getElementById("backToTopBtn");
    if (backToTopBtn) {
        window.addEventListener(
            "scroll",
            () => {
                if (window.scrollY > 300) {
                    backToTopBtn.classList.add("is-visible");
                } else {
                    backToTopBtn.classList.remove("is-visible");
                }
            },
            { passive: true }
        );

        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
});
