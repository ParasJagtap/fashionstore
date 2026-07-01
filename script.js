/* ============================================
   BANARASI SANSKRITI — Interactions & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Navbar scroll effect ---
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // --- Hamburger menu ---
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // --- Scroll reveal animations ---
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  // --- Counter animation ---
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  statNumbers.forEach(el => counterObserver.observe(el));

  function animateCounter(el, target) {
    const duration = 2000;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString('en-IN') + (target >= 1000 ? '+' : '+');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // --- Testimonial carousel ---
  const track = document.getElementById('testimonialTrack');
  const navContainer = document.getElementById('carouselNav');
  if (track && navContainer) {
    const slides = track.querySelectorAll('.testimonial-slide');
    let current = 0;
    let autoplayInterval;

    // Create dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      navContainer.appendChild(dot);
    });
    const dots = navContainer.querySelectorAll('.carousel-dot');

    function goTo(index) {
      current = index;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function next() {
      goTo((current + 1) % slides.length);
    }

    function startAutoplay() {
      autoplayInterval = setInterval(next, 5000);
    }
    function stopAutoplay() {
      clearInterval(autoplayInterval);
    }

    startAutoplay();

    // Pause on hover
    const carousel = track.closest('.testimonial-carousel');
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);

    // Touch support
    let touchStartX = 0;
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      stopAutoplay();
    }, { passive: true });
    carousel.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goTo(Math.min(current + 1, slides.length - 1)) : goTo(Math.max(current - 1, 0));
      }
      startAutoplay();
    }, { passive: true });
  }

  // --- Hero parallax on scroll ---
  const heroBg = document.querySelector('.hero-bg img');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = `scale(1.1) translateY(${scrollY * 0.3}px)`;
      }
    }, { passive: true });
  }

  // --- Contact form ---
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.submit-btn');
      const originalText = btn.textContent;
      
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const phone = document.getElementById('form-phone').value;
      const message = document.getElementById('form-message').value;

      btn.textContent = 'Sending...';
      btn.style.pointerEvents = 'none';

      fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, message })
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to send');
        return res.json();
      })
      .then(data => {
        btn.textContent = '✓ Sent Successfully';
        btn.style.background = 'var(--color-accent)';
        btn.style.color = 'var(--color-bg-dark)';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.color = '';
          btn.style.pointerEvents = '';
          form.reset();
        }, 3000);
      })
      .catch(err => {
        console.error(err);
        btn.textContent = '❌ Failed to Send';
        btn.style.background = '#ff4d4d';
        btn.style.color = '#fff';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.color = '';
          btn.style.pointerEvents = '';
        }, 3000);
      });
    });
  }

  // --- Active nav link on scroll ---
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link && !link.classList.contains('nav-cta')) {
        link.style.color = (scrollY >= top && scrollY < top + height)
          ? 'var(--color-accent)' : '';
      }
    });
  }, { passive: true });

  // --- Collection Modal ---
  const collectionData = {
    katan: {
      image: 'assets/images/saree-katan-silk.png',
      badge: 'The Sedan',
      title: 'Katan Silk',
      desc: 'The Katan is the gold standard of Banarasi sarees — pure silk, durable, and timelessly classic. Created by twisting pure silk threads together to form a firm, resilient fabric, the Katan is built to last generations. Its substantial weight and rich drape make it the most prestigious choice for those who value tradition and lasting quality.',
      fabric: 'Pure Mulberry Silk (high-ply twisted threads)',
      weave: 'Plain weave with Kadwa (cut-work) or Fekua technique',
      occasion: 'Weddings, Pujas, Grand Celebrations',
      price: '₹15,000 – ₹2,50,000+'
    },
    organza: {
      image: 'assets/images/saree-organza.png',
      badge: 'The Convertible',
      title: 'Organza (Kora) with Zari',
      desc: 'The Organza Kora is a masterpiece of contrasts — a featherlight, sheer body meets rich gold or silver zari borders for an effect that is both ethereal and opulent. This saree catches light like no other, creating a luminous glow that turns heads at every occasion.',
      fabric: 'Kora (stiff organza silk) with Zari threads',
      weave: 'Open weave with heavy border Zari work',
      occasion: 'Receptions, Festive Gatherings, Evening Events',
      price: '₹8,000 – ₹1,50,000+'
    },
    georgette: {
      image: 'assets/images/saree-georgette.png',
      badge: 'The Sport Model',
      title: 'Georgette',
      desc: 'The Georgette is for the modern woman who values elegance without compromise. Made from crepe yarn, it offers unmatched fluidity and a beautiful drape that moves with you. Lightweight and easy to handle, it brings the heritage of Banarasi weaving into contemporary wardrobes.',
      fabric: 'Crepe yarn (twisted S and Z-twist threads)',
      weave: 'Crinkled plain weave with Zari highlights',
      occasion: 'Office Events, Casual Celebrations, Modern Styling',
      price: '₹5,000 – ₹80,000+'
    },
    shattir: {
      image: 'assets/images/saree-shattir.png',
      badge: 'The Daily Driver',
      title: 'Shattir',
      desc: 'The Shattir is your everyday companion — the most accessible version of the Banarasi weave that doesn\'t sacrifice charm. Simplified patterns and lighter construction make it perfect for regular wear, while still carrying the unmistakable signature of Banarasi craftsmanship.',
      fabric: 'Silk blend with lighter thread count',
      weave: 'Simplified Banarasi weave with minimal Zari',
      occasion: 'Daily Wear, Small Gatherings, Temple Visits',
      price: '₹3,000 – ₹25,000+'
    }
  };

  const modal = document.getElementById('collectionModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalClose = document.getElementById('modalClose');

  function openModal(key) {
    const data = collectionData[key];
    if (!data) return;
    document.getElementById('modalImage').src = data.image;
    document.getElementById('modalImage').alt = data.title;
    document.getElementById('modalBadge').textContent = data.badge;
    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalDesc').textContent = data.desc;
    document.getElementById('modalFabric').textContent = data.fabric;
    document.getElementById('modalWeave').textContent = data.weave;
    document.getElementById('modalOccasion').textContent = data.occasion;
    document.getElementById('modalPrice').textContent = data.price;
    document.getElementById('modalCta').href = `collection?type=${key}`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Open on card click
  document.querySelectorAll('.collection-card[data-collection]').forEach(card => {
    card.addEventListener('click', () => {
      openModal(card.dataset.collection);
    });
  });

  // Close modal
  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // --- Auto-fill Enquiry from URL parameters ---
  const urlParams = new URLSearchParams(window.location.search);
  const enquireText = urlParams.get('enquire');
  if (enquireText) {
    const messageField = document.getElementById('form-message');
    if (messageField) {
      messageField.value = decodeURIComponent(enquireText);
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        setTimeout(() => {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }, 400);
      }
    }
  }

});
