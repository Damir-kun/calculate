// Функция для переключения вкладок
function openTab(event, tabName) {
  // Скрываем все вкладки
  const tabContents = document.querySelectorAll('.tabcontent');
  tabContents.forEach(tab => tab.classList.remove('active'));

  // Убираем активный класс со всех кнопок
  const tabLinks = document.querySelectorAll('.tablink');
  tabLinks.forEach(link => link.classList.remove('active'));

  // Показываем текущую вкладку
  document.getElementById(tabName).classList.add('active');

  // Добавляем активный класс к нажатой кнопке
  event.currentTarget.classList.add('active');
}

// Назначаем обработчики событий на кнопки вкладок
document.querySelectorAll('.tablink').forEach(link => {
  link.addEventListener('click', function (e) {
      openTab(e, this.getAttribute('data-tab'));
  });
});

// По умолчанию открываем первую вкладку
document.querySelector('.tablink').click();