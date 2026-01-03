
document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.project-item');
    const preview = document.querySelector('.project-preview');
    const previewImg = preview.querySelector('img');

    items.forEach(item => {
        console.log('item', item);
        item.addEventListener('mouseenter', () => {
            const img = item.dataset.image;
            if (!img) return;

            previewImg.src = img;
            preview.style.opacity = '1';
            preview.style.transform = 'translateY(0)';
        });

        item.addEventListener('mouseleave', () => {
            preview.style.opacity = '0';
            preview.style.transform = 'translateY(20px)';
        });
    });
});
