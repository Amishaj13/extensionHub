document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
      
      // Toggle animation for hamburger
      const spans = menuToggle.querySelectorAll('span');
      spans.forEach(span => span.classList.toggle('active'));
    });
  }
  
  // Reveal animations on scroll
  const revealElements = document.querySelectorAll('.reveal-text, .reveal-image, .reveal-card, .reveal-step');
  
  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    
    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < windowHeight - elementVisible) {
        element.classList.add('visible');
      } else {
        element.classList.remove('visible');
      }
    });
  };
  
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Initial check on page load
  
  // FAQ accordion
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    if (question) {
      question.addEventListener('click', () => {
        // Close other open items
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
          }
        });
        
        // Toggle current item
        item.classList.toggle('active');
      });
    }
  });
  
  // Bot demo slider
  const demoSlides = document.querySelectorAll('.demo-slide');
  const demoNext = document.querySelector('.demo-nav.next');
  const demoPrev = document.querySelector('.demo-nav.prev');
  const demoIndicators = document.querySelectorAll('.demo-indicators span');
  
  if (demoSlides.length > 0 && demoNext && demoPrev) {
    let currentSlide = 0;
    
    const showSlide = (index) => {
      // Hide all slides
      demoSlides.forEach(slide => slide.classList.remove('active'));
      
      // Update indicators
      demoIndicators.forEach(indicator => indicator.classList.remove('active'));
      
      // Show current slide
      demoSlides[index].classList.add('active');
      
      // Update current indicator
      if (demoIndicators[index]) {
        demoIndicators[index].classList.add('active');
      }
      
      // Update button states
      demoPrev.disabled = index === 0;
      demoNext.disabled = index === demoSlides.length - 1;
    };
    
    demoNext.addEventListener('click', () => {
      if (currentSlide < demoSlides.length - 1) {
        currentSlide++;
        showSlide(currentSlide);
      }
    });
    
    demoPrev.addEventListener('click', () => {
      if (currentSlide > 0) {
        currentSlide--;
        showSlide(currentSlide);
      }
    });
    
    // Click on indicators
    demoIndicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
      });
    });
    
    // Initialize
    showSlide(currentSlide);
  }
  
  // Testimonials slider
  const testimonials = document.querySelectorAll('.testimonial-card');
  const testimonialDots = document.querySelectorAll('.testimonial-dots span');
  
  if (testimonials.length > 0 && testimonialDots.length > 0) {
    let currentTestimonial = 0;
    
    const showTestimonial = (index) => {
      // Hide all testimonials
      testimonials.forEach(testimonial => testimonial.classList.remove('active'));
      
      // Update dots
      testimonialDots.forEach(dot => dot.classList.remove('active'));
      
      // Show current testimonial
      testimonials[index].classList.add('active');
      
      // Update current dot
      testimonialDots[index].classList.add('active');
    };
    
    // Click on dots
    testimonialDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentTestimonial = index;
        showTestimonial(currentTestimonial);
      });
    });
    
    // Auto rotate testimonials
    let testimonialInterval = setInterval(() => {
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
      showTestimonial(currentTestimonial);
    }, 5000);
    
    // Pause rotation on hover
    const testimonialsContainer = document.querySelector('.testimonials-slider');
    if (testimonialsContainer) {
      testimonialsContainer.addEventListener('mouseenter', () => {
        clearInterval(testimonialInterval);
      });
      
      testimonialsContainer.addEventListener('mouseleave', () => {
        testimonialInterval = setInterval(() => {
          currentTestimonial = (currentTestimonial + 1) % testimonials.length;
          showTestimonial(currentTestimonial);
        }, 5000);
      });
    }
    
    // Initialize
    showTestimonial(currentTestimonial);
  }
  
  // Typing effect animation for the demo
  const typingEffects = document.querySelectorAll('.typing-effect');
  
  typingEffects.forEach(effect => {
    effect.style.opacity = '1';
  });
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
        
        // Update URL without scrolling
        history.pushState(null, null, targetId);
      }
    });
  });
  
  // Form submission prevention
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      
      // Simple form validation
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        // Reset form
        form.reset();
        
        // Show success message (could be improved with a toast notification)
        alert('Thank you for subscribing!');
      }
    });
  });
});
