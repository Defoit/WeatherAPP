Что нужно установить заранее:
Node.js (Скачать: nodejs.org)
Git
Инструкция по запуску:
В PowerShell или cmd откройте командную строку, перейдите в папку в которой планируете хранить проект и выполните:
git clone https://github.com/Defoit/WeatherApp

Настройка API-ключа
Перейдите в папку ...\WeatherApp\server
Создайте там новый файл с названием ровно ".env"
Получите ключ на OpenWeather и напишите в .env:
OPENWEATHER_API_KEY=ваш_ключ

Установка зависимостей
cd server
npm install
cd ..
cd client
npm install

Запуск проекта:
cd server
npm run dev
cd client
npm run dev

Откройте браузер и перейдите по адресу: http://localhost:5173
