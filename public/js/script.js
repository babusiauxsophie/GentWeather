document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('.btn');
    const formContainer = document.querySelector('.form-container');
    const arrow = document.querySelector('.arrow');

    formContainer.style.display = 'none';

    button.addEventListener('click', function() {
        if (formContainer.style.display === 'none') {
            formContainer.style.display = 'block';
        } else {
            formContainer.style.display = 'none';
        }

        arrow.style.transform = arrow.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
    });
});
