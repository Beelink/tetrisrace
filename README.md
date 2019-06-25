##Передача файлов без сохранения на сервере.

**Приложение использует node.js(express, socket.io) на сервере и HTML5 File API на клиенте.**

Сервер `node app.js`

Страница отправки файла: `http://localhost:8080/`

Страница получения файла: `http://localhost:8080/receiver`

Отправитель выбирает файл и подтверждает выбор. На странице появляется индикация отправки. Такая же индикация присутствуети на странице получения файла. После того как обмен данными успешно завершен - на странице получения появляется ссылка для загрузки файла.
