const galleryImages = document.querySelectorAll('.gallery img');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const caption = document.getElementById('caption');
const closeBtn = document.getElementById('closeBtn');


galleryImages.forEach(img => {

  img.addEventListener('click', () => {
   
    modal.style.display = 'flex';

    modalImg.src = img.src;

    caption.textContent = img.alt;
  });
});


closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});


modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});
