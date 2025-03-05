// public/app.js

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form'); 
    
    form.addEventListener('submit', function (event) {
        event.preventDefault(); 

        const length = parseFloat(document.getElementById('length').value);
        const width = parseFloat(document.getElementById('width').value);
        const height = parseFloat(document.getElementById('height').value);
        const material = document.getElementById('material').value;
        const frameType = document.getElementById('frame-type').value;

        console.log('Длина:', length);
        console.log('Ширина:', width);
        console.log('Высота:', height);
        console.log('Материал:', material);
        console.log('Тип каркаса:', frameType);

    });
});