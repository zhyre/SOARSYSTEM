
// Feature card mouse tracking for spotlight effect
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu if open
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease-out';
    observer.observe(card);
});

// Terms Modal Functionality
const termsLink = document.getElementById('terms-link');
const termsModal = document.getElementById('terms-modal');
const closeTermsModal = document.getElementById('close-terms-modal');
const termsModalContent = document.getElementById('terms-modal-content');

termsLink.addEventListener('click', (e) => {
    e.preventDefault();
    termsModal.classList.remove('hidden');
    loadTermsContent();
});

closeTermsModal.addEventListener('click', () => {
    termsModal.classList.add('hidden');
});

termsModal.addEventListener('click', (e) => {
    if (e.target === termsModal) {
        termsModal.classList.add('hidden');
    }
});

async function loadTermsContent() {
    try {
        const response = await fetch('/terms-and-policy/');
        if (response.ok) {
            const html = await response.text();
            termsModalContent.innerHTML = html;
        } else {
            termsModalContent.innerHTML = '<div class="text-center py-12"><p class="text-red-600">Failed to load terms content.</p></div>';
        }
    } catch (error) {
        termsModalContent.innerHTML = '<div class="text-center py-12"><p class="text-red-600">Error loading terms content.</p></div>';
    }
}

// Privacy Modal Functionality
const privacyLink = document.getElementById('privacy-link');
const privacyModal = document.getElementById('privacy-modal');
const closePrivacyModal = document.getElementById('close-privacy-modal');
const privacyModalContent = document.getElementById('privacy-modal-content');

privacyLink.addEventListener('click', (e) => {
    e.preventDefault();
    privacyModal.classList.remove('hidden');
    loadPrivacyContent();
});

closePrivacyModal.addEventListener('click', () => {
    privacyModal.classList.add('hidden');
});

privacyModal.addEventListener('click', (e) => {
    if (e.target === privacyModal) {
        privacyModal.classList.add('hidden');
    }
});

async function loadPrivacyContent() {
    try {
        const response = await fetch('/privacy-policy/');
        if (response.ok) {
            const html = await response.text();
            privacyModalContent.innerHTML = html;
        } else {
            privacyModalContent.innerHTML = '<div class="text-center py-12"><p class="text-red-600">Failed to load privacy content.</p></div>';
        }
    } catch (error) {
        privacyModalContent.innerHTML = '<div class="text-center py-12"><p class="text-red-600">Error loading privacy content.</p></div>';
    }
}
