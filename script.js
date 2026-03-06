// Получаем элементы
const cameraFeed = document.getElementById('camera-feed');
const overlayVideo = document.getElementById('overlay-video');
const captureBtn = document.getElementById('capture-btn');
const canvas = document.getElementById('photo-canvas');
const resultPhoto = document.getElementById('result-photo');
const downloadBtn = document.getElementById('download-btn');

// Функция для запуска камеры
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        });
        cameraFeed.srcObject = stream;
    } catch (err) {
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
    
    // Рисуем фигурку
    ctx.drawImage(overlayVideo, 0, 0, canvas.width, canvas.height);
    
    // Показываем результат
    const dataUrl = canvas.toDataURL('image/png');
    resultPhoto.src = dataUrl;
    resultPhoto.style.display = 'block';
    
    // Настраиваем кнопку сохранения для мобильных устройств
    setupDownloadButton(dataUrl);
    
    setTimeout(() => {
        resultPhoto.style.display = 'none';
        downloadBtn.style.display = 'none';
    }, 7000);
}

// Новая функция для сохранения на мобильных
function setupDownloadButton(dataUrl) {
    downloadBtn.style.display = 'inline-block';
    
    // Для всех устройств
    downloadBtn.href = dataUrl;
    
    // Для Android и desktop
    downloadBtn.download = 'photo_with_figurka.png';
    
    // Для iOS - обрабатываем нажатие по-особому
    downloadBtn.onclick = function(e) {
        // Проверяем, iOS ли это
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isIOS) {
            e.preventDefault();
            // Создаем временную ссылку для iOS
            const link = document.createElement('a');
            link.href = dataUrl;
            link.target = '_blank';
            link.download = 'photo_with_figurka.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Альтернатива: открыть в новой вкладке (пользователь сам сохранит)
            // window.open(dataUrl, '_blank');
        }
    };
}

// Функция для остановки камеры
function stopCamera() {
    const stream = cameraFeed.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }
}

// Обработчик ошибок видео
overlayVideo.addEventListener('error', (e) => {
    console.error('Ошибка загрузки видео фигурки:', e);
    alert('Не удалось загрузить видео с фигуркой. Проверьте путь к файлу.');
});

overlayVideo.addEventListener('loadeddata', () => {
    overlayVideo.play().catch(e => console.log('Автовоспроизведение не удалось:', e));
});

// Запускаем камеру
startCamera();
captureBtn.addEventListener('click', capturePhoto);
window.addEventListener('beforeunload', stopCamera);
