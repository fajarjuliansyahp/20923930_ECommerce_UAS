window.addEventListener("scroll", () => {
  const navbar = document.querySelector("#navbar");

  if (window.scrollY > 150) {
    navbar.classList.add("opacity-0");
  } else {
    navbar.classList.remove("opacity-0");
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('.wrapper');
  if (!wrapper) return console.warn('Wrapper carousel tidak ditemukan.');

  const track = wrapper.querySelector('.carousel');
  const items = Array.from(track.querySelectorAll('.card'));
  if (!track || items.length === 0) return console.warn('Carousel atau cards tidak ditemukan.');

  // temukan tombol (dukung attribute data-action atau class .prev/.next)
  const btnPrev = wrapper.querySelector('[data-action="slideLeft"]') || wrapper.querySelector('.prev') || wrapper.querySelector('.btn.prev');
  const btnNext = wrapper.querySelector('[data-action="slideRight"]') || wrapper.querySelector('.next') || wrapper.querySelector('.btn.next');

  let index = 0;
  let autoInterval = null;

  // hitung lebar item (termasuk margin kiri+kanan)
  function getItemWidth() {
    const first = items[0];
    const rect = first.getBoundingClientRect();
    const style = getComputedStyle(first);
    const marginLR = parseFloat(style.marginLeft || 0) + parseFloat(style.marginRight || 0);
    return rect.width + marginLR;
  }

  function itemsPerSlide() {
    return window.innerWidth > 768 ? 3 : 1;
  }

  function maxIndex() {
    return Math.max(0, items.length - itemsPerSlide());
  }

  function updateCarousel() {
    const itemW = getItemWidth();
    // clamp index supaya tidak lewat batas setelah resize
    if (index > maxIndex()) index = maxIndex();
    track.style.transform = `translateX(-${index * itemW}px)`;
  }

  function nextSlide() {
    if (index < maxIndex()) index++;
    else index = 0;
    updateCarousel();
  }

  function prevSlide() {
    if (index > 0) index--;
    else index = maxIndex();
    updateCarousel();
  }

  // pasang event listener tombol jika ada
  if (btnNext) btnNext.addEventListener('click', () => { nextSlide(); restartAuto(); });
  if (btnPrev) btnPrev.addEventListener('click', () => { prevSlide(); restartAuto(); });

  // dukungan swipe sederhana untuk mobile
  let startX = 0, deltaX = 0;
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    deltaX = 0;
    stopAuto();
  }, {passive: true});
  track.addEventListener('touchmove', (e) => {
    deltaX = e.touches[0].clientX - startX;
  }, {passive: true});
  track.addEventListener('touchend', () => {
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) nextSlide();
      else prevSlide();
    }
    startAuto();
  });

  // hover pause (wrapper agar tombol di luar juga berfungsi)
  wrapper.addEventListener('mouseenter', stopAuto);
  wrapper.addEventListener('mouseleave', startAuto);

  // auto slide
  function startAuto() {
    stopAuto();
    autoInterval = setInterval(nextSlide, 3000);
  }
  function stopAuto() {
    if (autoInterval) { clearInterval(autoInterval); autoInterval = null; }
  }
  function restartAuto() { stopAuto(); startAuto(); }

  // resize handling
  window.addEventListener('resize', () => {
    // tunggu sedikit agar layout stabil
    window.requestAnimationFrame(updateCarousel);
  });

  // init
  updateCarousel();
  startAuto();
});
