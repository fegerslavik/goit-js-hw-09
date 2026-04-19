// 1. Оголошення об'єкта formData
const formData = {
  email: '',
  message: '',
};

const form = document.querySelector('.feedback-form');
const STORAGE_KEY = 'feedback-form-state';

// 3. Перевірка сховища при завантаженні сторінки
populateForm();

// 2. Відстеження змін у формі (делегування події input)
form.addEventListener('input', event => {
  const { name, value } = event.target;

  // Оновлюємо об'єкт formData
  formData[name] = value.trim();

  // Записуємо у локальне сховище
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
});

// 4. Обробка відправлення форми
form.addEventListener('submit', event => {
  event.preventDefault();

  // Перевірка на заповненість полів
  if (formData.email === '' || formData.message === '') {
    alert('Fill please all fields');
    return;
  }

  // Якщо все ок: вивід у консоль, очищення сховища, об'єкта та форми
  console.log(formData);

  localStorage.removeItem(STORAGE_KEY);
  formData.email = '';
  formData.message = '';
  form.reset();
});

// Функція для заповнення полів із локального сховища
function populateForm() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (savedData) {
    const parsedData = JSON.parse(savedData);

    // Оновлюємо об'єкт formData та поля форми
    Object.entries(parsedData).forEach(([key, value]) => {
      formData[key] = value;
      form.elements[key].value = value;
    });
  }
}
