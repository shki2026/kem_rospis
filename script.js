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
                facingMode: 'user', // Используем переднюю камеру (для селфи)
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        });
        cameraFeed.srcObject = stream;
    } catch (err) {
        alert('Ошибка доступа к камере: ' + err.message);
        console.error(err);
    }
}

// Функция для получения параметра из URL (на случай, если нужно разные фигурки)
function getFigurkaFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const figurka = urlParams.get('figurka');
    if (figurka) {
        overlayVideo.src = `роспись-1.webm`;
    }
}

// Функция для создания фото
function capturePhoto() {
    // Проверяем, что видео с камеры загружено и имеет размеры
    if (cameraFeed.videoWidth === 0 || cameraFeed.videoHeight === 0) {
        alert('Камера еще не готова, подождите секунду');
        return;
    }

    // Устанавливаем размеры canvas равными размеру видео с камеры
    canvas.width = cameraFeed.videoWidth;
    canvas.height = cameraFeed.videoHeight;
    
    const ctx = canvas.getContext('2d');
    
    // 1. Рисуем фон с камеры (без зеркала, как есть)
    ctx.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);
    
    // 2. Получаем позицию и размеры видео с фигуркой относительно окна браузера
    const overlayRect = overlayVideo.getBoundingClientRect();
    const cameraRect = cameraFeed.getBoundingClientRect();
    
    // 3. Вычисляем коэффициенты масштабирования между реальным размером видео и его отображением на экране
    const scaleX = canvas.width / cameraRect.width;
    const scaleY = canvas.height / cameraRect.height;
    
    // 4. Вычисляем координаты для встраивания фигурки в правильное место на canvas
    const x = (overlayRect.left - cameraRect.left) * scaleX;
    const y = (overlayRect.top - cameraRect.top) * scaleY;
    const width = overlayRect.width * scaleX;
    const height = overlayRect.height * scaleY;
    
    // 5. Рисуем фигурку поверх фона
    ctx.drawImage(overlayVideo, x, y, width, height);
    
    // 6. Преобразуем canvas в изображение и показываем результат
    const dataUrl = canvas.toDataURL('image/png');
    resultPhoto.src = dataUrl;
    resultPhoto.style.display = 'block';
    
    // Настраиваем кнопку сохранения
    downloadBtn.href = dataUrl;
    downloadBtn.style.display = 'inline-block';
    downloadBtn.download = `photo_with_figurka_${new Date().getTime()}.png`;
    
    // Автоматически скрываем результат через 7 секунд
    setTimeout(() => {
        resultPhoto.style.display = 'none';
        downloadBtn.style.display = 'none';
    }, 7000);
}

// Функция для остановки камеры (если нужно)
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

// Когда видео с фигуркой загрузилось, убеждаемся что оно играет
overlayVideo.addEventListener('loadeddata', () => {
    overlayVideo.play().catch(e => console.log('Автовоспроизведение не удалось:', e));
});

// Запускаем камеру при загрузке страницы
startCamera();

// Проверяем URL на наличие параметра figurka
getFigurkaFromURL();

// Обработчик кнопки съемки
captureBtn.addEventListener('click', capturePhoto);

// Дополнительно: обрабатываем ситуацию, если пользователь уходит со страницы
window.addEventListener('beforeunload', stopCamera);