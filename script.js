// Получаем элементы
const cameraFeed = document.getElementById('camera-feed');
const overlayVideo = document.getElementById('overlay-video');
const captureBtn = document.getElementById('capture-btn');
const canvas = document.getElementById('photo-canvas');
const resultPhoto = document.getElementById('result-photo');
const downloadBtn = document.getElementById('download-btn');

// Функция для запуска камеры (теперь с задней камерой)
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // environment = задняя камера
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        });
        cameraFeed.srcObject = stream;
    } catch (err) {
        // Если задняя камера недоступна, пробуем любую
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });
            cameraFeed.srcObject = stream;
        } catch (fallbackErr) {
            alert('Ошибка доступа к камере: ' + fallbackErr.message);
            console.error(fallbackErr);
        }
    }
}

// Функция для получения параметра из URL
//function getFigurkaFromURL() {
    //const urlParams = new URLSearchParams(window.location.search);
    //const figurka = urlParams.get('figurka');
   // if (figurka) {
       // overlayVideo.src = `роспись-1.webm`;
   // }
//}

// Функция для создания фото
function capturePhoto() {
    if (cameraFeed.videoWidth === 0 || cameraFeed.videoHeight === 0) {
        alert('Камера еще не готова, подождите секунду');
        return;
    }

    canvas.width = cameraFeed.videoWidth;
    canvas.height = cameraFeed.videoHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Рисуем фон с камеры
    ctx.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);
    
    // Получаем позицию фигурки
    const overlayRect = overlayVideo.getBoundingClientRect();
    const cameraRect = cameraFeed.getBoundingClientRect();
    
    const scaleX = canvas.width / cameraRect.width;
    const scaleY = canvas.height / cameraRect.height;
    
    const x = (overlayRect.left - cameraRect.left) * scaleX;
    const y = (overlayRect.top - cameraRect.top) * scaleY;
    const width = overlayRect.width * scaleX;
    const height = overlayRect.height * scaleY;
    
    // Рисуем фигурку
    ctx.drawImage(overlayVideo, x, y, width, height);
    
    // Показываем результат
    const dataUrl = canvas.toDataURL('image/png');
    resultPhoto.src = dataUrl;
    resultPhoto.style.display = 'block';
    
    downloadBtn.href = dataUrl;
    downloadBtn.style.display = 'inline-block';
    downloadBtn.download = `photo_with_figurka_${new Date().getTime()}.png`;
    
    setTimeout(() => {
        resultPhoto.style.display = 'none';
        downloadBtn.style.display = 'none';
    }, 7000);
}

// Функция для остановки камеры
function stopCamera() {
    const stream = cameraFeed.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }
}

// Обработчик ошибок видео с фигуркой
overlayVideo.addEventListener('error', (e) => {
    console.error('Ошибка загрузки видео фигурки:', e);
    alert('Не удалось загрузить видео с фигуркой. Проверьте путь к файлу.');
});

overlayVideo.addEventListener('loadeddata', () => {
    overlayVideo.play().catch(e => console.log('Автовоспроизведение не удалось:', e));
});

// Запускаем камеру
startCamera();
//getFigurkaFromURL();

captureBtn.addEventListener('click', capturePhoto);
window.addEventListener('beforeunload', stopCamera);


