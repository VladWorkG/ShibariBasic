let completedModules = new Set();
let currentLang = 'ru';
let activeModule = null;
let languageData = {};

async function loadLanguages() {
    try {
        const ru = await fetch('languages/ru.json').then(res => res.json());
        const en = await fetch('languages/en.json').then(res => res.json());
        languageData['ru'] = ru;
        languageData['en'] = en;
        console.log('Языки загружены успешно');
    } catch (error) {
        console.error('Ошибка загрузки языков:', error);
    }
}

async function loadModules() {
    const modules = document.querySelectorAll('.module');
    for (let module of modules) {
        const id = module.getAttribute('data-id');
        try {
            if (id === '999') {
                console.log(`Модуль ${id} загружен`);
            }

            const response = await fetch(`modules/module${id}.html`);
            if (!response.ok) throw new Error(`Модуль ${id} не найден`);
            module.innerHTML = await response.text();
            module.querySelector('.btn').addEventListener('click', () => toggleModule(parseInt(id)));
            console.log(`Модуль ${id} загружен`);
        } catch (error) {
            console.error(`Ошибка загрузки модуля ${id}:`, error);
            module.innerHTML = `<p>Ошибка загрузки модуля ${id}</p>`;
        }
    }
}

function switchLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    updatePage();
}

function toggleModule(moduleId) {
    const module = document.querySelector(`.module[data-id="${moduleId}"]`);
    const content = module.querySelector('.module-content');

    if (completedModules.has(moduleId)) {
        content.classList.toggle('active');
        activeModule = content.classList.contains('active') ? moduleId : null;
    } else if (activeModule === moduleId) {
        completedModules.add(moduleId);
        content.classList.remove('active');
        activeModule = null;
    } else {
        if (activeModule) {
            document.querySelector(`.module[data-id="${activeModule}"] .module-content`).classList.remove('active');
        }
        content.classList.add('active');
        activeModule = moduleId;
    }
    updatePage();
}

function updatePage() {
    const title = document.querySelector('#site-title');
    title.innerHTML = languageData[currentLang]?.siteTitle || 'Заголовок не загружен';

    document.querySelectorAll('.module').forEach(module => {
        const id = module.dataset.id;
        const data = languageData[currentLang]?.modules[id] || {};
        const contentE1 = module.querySelector('.module-content');
        if (id === '93459') {
            
            module.classList.remove('locked');
            contentE1.innerHTML = Array.isArray(data.content) ? data.content.join('') : data.content || 'Нет содержимого';
        } else {
            const button = module.querySelector('.btn');
            const titleEl = module.querySelector('.module-title');
            const contentEl = module.querySelector('.module-content');

            titleEl.innerHTML = data.title || 'Нет заголовка';
            // Соединяем массив строк в один HTML-блок
            contentEl.innerHTML = Array.isArray(data.content) ? data.content.join('') : data.content || 'Нет содержимого';



            if (completedModules.has(parseInt(id))) {
                module.classList.remove('locked');
                button.innerHTML = data.button?.completed || 'Ошибка';
                button.classList.add('completed');
                button.disabled = false;
            } else if (id === '1' || completedModules.has(parseInt(id) - 1) || id === '998' || id === '999') {
                module.classList.remove('locked');
                button.innerHTML = activeModule === parseInt(id) ? data.button?.complete || 'Ошибка' : data.button?.start || 'Ошибка';
                button.classList.remove('completed');
                button.disabled = false;
            } else {

                
                module.classList.add('locked');
                button.innerHTML = data.button?.start || 'Ошибка';
                button.classList.remove('completed');
                button.disabled = true;
                
            }

        }
    });
}

async function init() {
    await loadLanguages();
    await loadModules();
    updatePage();
}

init().catch(error => console.error('Ошибка инициализации:', error));