# React + TypeScript + FSD - Документація проекту

## 📋 Зміст
1. [Огляд проекту](#огляд-проекту)
2. [Архітектура Feature-Sliced Design](#архітектура-feature-sliced-design)
3. [Технологічний стек](#технологічний-стек)
4. [Структура проекту](#структура-проекту)
5. [Настройка середовища розробки](#настройка-середовища-розробки)
6. [Конвенції коду](#конвенції-коду)
7. [API та стейт менеджмент](#api-та-стейт-менеджмент)
8. [Компоненти та UI](#компоненти-та-ui)
9. [Маршрутизація](#маршрутизація)
10. [Розгортання](#розгортання)

---

## 🚀 Огляд проекту

**rs-react-app** - це React додаток, побудований за архітектурою Feature-Sliced Design (FSD) з використанням TypeScript. Проект орієнтований на надання сервісів з автентифікацією користувачів та панеллю провайдера.

### Ключові функції:
- 🔐 Система автентифікації (логін/реєстрація)
- 📧 Підтвердження email
- 🏠 Головна сторінка з каталогом сервісів
- 👤 Панель провайдера для управління сервісами
- 🔍 Пошук та фільтрація сервісів

---

## 🏗️ Архітектура Feature-Sliced Design

### Принципи FSD:
1. **Поділ на слої (Layers)** - логічне розділення коду
2. **Слайси (Slices)** - бізнес-сутності в рамках слоїв
3. **Сегменти (Segments)** - технічне призначення модулів

### Слої проекту:

#### 🎯 **app** - Ініціалізація додатку
```
app/
├── App.tsx          # Головний компонент
├── index.tsx        # Точка входу
├── providers/       # Провайдери контексту
└── store/          # Глобальний стор
```

#### 📄 **pages** - Сторінки додатку
```
pages/
├── HomePage/           # Головна сторінка
├── login/             # Сторінка логіну
├── register/          # Сторінка реєстрації
├── ConfirmEmail/      # Підтвердження email
└── DashboardProvider/ # Панель провайдера
```

#### 🧩 **widgets** - Композитні блоки UI
```
widgets/
├── Header/                 # Шапка сайту
├── Services/              # Віджет списку сервісів
├── service-category-list/ # Список категорій
└── service-dropdown/      # Випадаючий список сервісів
```

#### ⚡ **features** - Інтерактивна функціональність
```
features/
├── Search/                    # Пошук сервісів
├── auth/                      # Автентифікація
├── manage-provider-services/  # Управління сервісами
└── services/                  # API сервісів
```

#### 🗂️ **entities** - Бізнес-сутності
```
entities/
├── auth/          # Сутність автентифікації
├── user/          # Сутність користувача
├── services/      # Сутність сервісів
└── registration/  # Сутність реєстрації
```

#### 🔧 **shared** - Загальний код
```
shared/
├── api/        # API клієнт та ендпоінти
├── config/     # Конфігурація
├── contexts/   # React контексти
├── hooks/      # Користувацькі хуки
├── lib/        # Утиліти
├── types/      # TypeScript типи
├── ui/         # UI компоненти
└── utils/      # Допоміжні функції
```

---

## 🛠️ Технологічний стек

### **Frontend Framework**
- **React 18.3.1** - Основний фреймворк
- **TypeScript 5.6.2** - Типізація
- **Vite 6.0.5** - Білдер та dev-сервер

### **Роутинг**
- **React Router DOM 7.1.3** - Клієнтський роутинг
- **Remix Run React 2.15.3** - Додаткові можливості роутингу

### **Стейт менеджмент**
- **Zustand 5.0.6** - Легкий стейт менеджер
- **TanStack React Query 5.81.5** - Кешування та синхронізація серверного стану
- **React Query 3.39.3** - Додаткова підтримка

### **UI та іконки**
- **Lucide React 0.525.0** - Іконки
- **React Icons 5.4.0** - Додаткові іконки

### **Development Tools**
- **ESLint** - Лінтинг коду
- **Prettier** - Форматування коду
- **Husky** - Git hooks
- **TypeScript ESLint** - Лінтинг TypeScript

---

## 📁 Структура проекту

### Детальна структура:

```
src/
├── 📱 app/                    # Слой додатку
│   ├── App.tsx               # Головний компонент
│   ├── index.tsx             # Точка входу
│   ├── providers/            # React провайдери
│   └── store/                # Глобальний стор
│
├── 📄 pages/                  # Слой сторінок
│   ├── HomePage/             # Головна сторінка
│   ├── login/                # Логін + реєстрація
│   ├── register/             # Реєстрація
│   ├── ConfirmEmail/         # Підтвердження email
│   └── DashboardProvider/    # Панель провайдера
│
├── 🧩 widgets/               # Слой віджетів
│   ├── Header/               # Навігаційна шапка
│   ├── Services/             # Віджет сервісів
│   ├── service-category-list/ # Категорії сервісів
│   └── service-dropdown/     # Селектор сервісів
│
├── ⚡ features/              # Слой фічей
│   ├── Search/               # Пошук та фільтри
│   ├── auth/                 # Автентифікація
│   ├── manage-provider-services/ # Управління сервісами
│   └── services/             # API сервісів
│
├── 🗂️ entities/             # Слой сутностей
│   ├── auth/                 # Модель автентифікації
│   ├── user/                 # Модель користувача
│   ├── services/             # Модель сервісів
│   └── registration/         # Модель реєстрації
│
└── 🔧 shared/               # Загальний слой
    ├── api/                  # HTTP клієнт
    ├── config/               # Конфігурація
    ├── contexts/             # React контексти
    ├── hooks/                # Користувацькі хуки
    ├── lib/                  # Утиліти
    ├── types/                # Глобальні типи
    ├── ui/                   # UI компоненти
    └── utils/                # Допоміжні функції
```

---

## ⚙️ Конфігурація проекту

### **TypeScript конфігурація**

#### `tsconfig.json` (основний)
```json
{
  "compilerOptions": {
    "jsx": "react",
    "esModuleInterop": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"]
    }
  },
  "include": ["src"]
}
```

#### `tsconfig.node.json` (для Node.js інструментів)
```json
{
  "compilerOptions": {
    "composite": true,
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": "src",
    "paths": {
      "@app/*": ["app/*"],
      "@pages/*": ["pages/*"],
      "@widgets/*": ["widgets/*"],
      "@shared/*": ["shared/*"]
    }
  },
  "include": ["vite.config.ts", "src/shared/types"]
}
```

### **Можливі імпорти**
```typescript
// Варіант 1: Загальний алайс (з tsconfig.json)
import { Button } from '@/shared/ui/Button';
import { useAuth } from '@/entities/auth';

// Варіант 2: Специфічні алайси (з tsconfig.node.json)
import { Button } from '@shared/ui/Button';
import { Header } from '@widgets/Header';
```

⚠️ **Увага**: У вас є конфлікт між двома конфігураціями. Рекомендую уніфікувати їх.

---

## 🔧 Настройка середовища розробки

### 1. Встановлення залежностей
```bash
npm install
```

### 2. Запуск в режимі розробки
```bash
npm run dev
```

### 3. Білд для продакшену
```bash
npm run build
```

### 4. Перевірка коду
```bash
npm run lint        # ESLint перевірка
npm run format:fix  # Форматування Prettier
```

### 5. Попередній перегляд білду
```bash
npm run preview
```

---

## 📝 Конвенції коду

### **Іменування файлів**
- **Компоненти**: `PascalCase.tsx` (наприклад, `ServiceCard.tsx`)
- **Хуки**: `camelCase.ts` з префіксом `use` (наприклад, `useServices.ts`)
- **Типи**: `camelCase.ts` або `kebab-case.ts`
- **Стилі**: `ComponentName.module.css`

### **Структура компонентів**
```typescript
// Приклад структури компонента
import React from 'react';
import styles from './ComponentName.module.css';
import { ComponentProps } from './types';

export const ComponentName: React.FC<ComponentProps> = ({ 
  prop1, 
  prop2 
}) => {
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### **Експорти**
- **Барель експорти** в `index.ts` файлах
- **Іменовані експорти** для компонентів
- **Default експорт** тільки для головних компонентів

### **TypeScript конвенції**
- Використовуйте інтерфейси для props компонентів
- Префікс `I` для інтерфейсів не обов'язковий
- Типи в окремих файлах `types.ts`

---

## 🌐 API та стейт менеджмент

### **API структура**
```typescript
// shared/api/client.ts - базовий HTTP клієнт
// shared/api/auth/ - автентифікація
// shared/api/endpoints/ - ендпоінти
```

### **Zustand стор**
```typescript
// entities/auth/model/auth.store.ts
// Глобальний стейт для автентифікації
```

### **React Query**
- Кешування серверних даних
- Автоматична синхронізація
- Оптимістичні оновлення

### **Контексти**
```typescript
// shared/contexts/AuthContext.tsx
// Контекст автентифікації
```

---

## 🎨 Компоненти та UI

### **Shared UI компоненти**
- `Button` - Універсальна кнопка
- `Input` - Поле вводу
- `Modal` - Модальне вікно
- `EditInput` - Редагувальне поле
- `BigActionButton` - Велика кнопка дії

### **Стилізація**
- **CSS Modules** для локальних стилів
- **Responsive design** підтримка
- **Консистентна дизайн-система**

### **Використання компонентів**
```typescript
import { Button } from '@shared/ui/Button';
import { Modal } from '@shared/ui/modal';

// Використання з пропсами
<Button variant="primary" onClick={handleClick}>
  Натисніть
</Button>
```

---

## 🛣️ Маршрутизація

### **Основні маршрути**
```typescript
// routes/routes.tsx
- / - Головна сторінка
- /login - Сторінка логіну
- /register - Реєстрація
- /confirm-email - Підтвердження email
- /dashboard/provider - Панель провайдера
```

### **Типізовані маршрути**
```typescript
// Використання React Router з TypeScript
import { Routes, Route } from 'react-router-dom';
```

---

## 🔐 Автентифікація

### **Потік автентифікації**
1. **Реєстрація** → `pages/register`
2. **Підтвердження email** → `pages/ConfirmEmail`
3. **Логін** → `pages/login`
4. **Захищені маршрути** → Панель провайдера

### **Стейт управління**
- `entities/auth/model/auth.store.ts` - Zustand стор
- `shared/contexts/AuthContext.tsx` - React контекст
- `shared/api/auth/auth.ts` - API методи

---

## 🎯 Сервіси та провайдери

### **Управління сервісами**
- `entities/services/` - Модель сервісів
- `features/manage-provider-services/` - Управління для провайдерів
- `widgets/Services/` - Віджет відображення сервісів

### **Категорії сервісів**
- `widgets/service-category-list/` - Список категорій
- `entities/services/ui/ServiceCategoryItem/` - Окремий елемент

---

## 📦 Інструкція по розгортанню

### **Розробка**
```bash
# Клонування репозиторію
git clone <repository-url>
cd rs-react-app

# Встановлення залежностей
npm install

# Запуск dev сервера
npm run dev
```

### **Продакшн білд**
```bash
# TypeScript компіляція + Vite білд
npm run build

# Перевірка білду
npm run preview
```

### **Налаштування оточення**
```bash
# .env файл (створіть в корені проекту)
VITE_API_BASE_URL=https://your-api.com
VITE_APP_ENV=production
```

---

## 🧪 Тестування та якість коду

### **Лінтинг та форматування**
```bash
# Перевірка ESLint
npm run lint

# Автоматичне форматування
npm run format:fix
```

### **Git hooks (Husky)**
- Pre-commit хуки для перевірки коду
- Автоматичне форматування перед комітом

---

## 📁 Приклади використання

### **Створення нового компонента**
```typescript
// shared/ui/NewComponent/NewComponent.tsx
import React from 'react';
import styles from './NewComponent.module.css';

interface NewComponentProps {
  title: string;
  onClick?: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({ 
  title, 
  onClick 
}) => {
  return (
    <div className={styles.container} onClick={onClick}>
      <h3>{title}</h3>
    </div>
  );
};
```

```typescript
// shared/ui/NewComponent/index.ts
export { NewComponent } from './NewComponent';
export type { NewComponentProps } from './NewComponent';
```

### **Додавання нової фічі**
```typescript
// features/new-feature/
├── model/
│   └── useNewFeature.ts    # Бізнес логіка
├── ui/
│   └── NewFeature.tsx      # UI компонент
└── index.ts                # Барель експорт
```

### **API інтеграція**
```typescript
// shared/api/endpoints/new-endpoint.ts
import { apiClient } from '../client';

export const newEndpoint = {
  getData: () => apiClient.get('/new-data'),
  postData: (data: any) => apiClient.post('/new-data', data),
};
```

---

## 🔧 Налаштування IDE

### **Рекомендації по конфігурації**

#### Виправлення конфлікту TypeScript
У вас є два різних підходи до алайсів імпортів. Рекомендую оновити `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "bundler": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": "./src",
    "paths": {
      "@app/*": ["app/*"],
      "@pages/*": ["pages/*"],
      "@widgets/*": ["widgets/*"],
      "@features/*": ["features/*"],
      "@entities/*": ["entities/*"],
      "@shared/*": ["shared/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### Vite конфігурація
Додайте до `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/app'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@widgets': path.resolve(__dirname, './src/widgets'),
      '@features': path.resolve(__dirname, './src/features'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
});
```
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- Auto Rename Tag

### **Налаштування TypeScript**
- **Абсолютні імпорти**: 
  - `@/*` (загальний алайс для src)
  - `@app/*`, `@pages/*`, `@widgets/*`, `@shared/*` (у tsconfig.node.json)
- **Строга типізація** увімкнена
- **Перевірка на невикористані змінні**
- **ES2022/ES2023** таргет для сучасних можливостей

---

## 🚨 Поради та найкращі практики

### **FSD Правила**
1. **Імпорти тільки "вниз"** - слої можуть імпортувати тільки з нижчих слоїв
2. **Не імпортувати з сусідніх слайсів** одного рівня
3. **Публічний API** - експортувати тільки через `index.ts`

### **React та TypeScript**
1. Використовуйте функціональні компоненти з хуками
2. Типізуйте всі пропси та стейт
3. Уникайте `any` типу
4. Використовуйте `React.FC` для компонентів

### **Продуктивність**
1. Lazy loading для сторінок
2. Мемоізація важких обчислень
3. Оптимізація ре-рендерів з React.memo

---

## 🤝 Внесок у проект

### **Процес розробки**
1. Створіть feature branch від `main`
2. Дотримуйтесь FSD архітектури
3. Напишіть типи для нових компонентів
4. Перевірте лінтинг та форматування
5. Створіть Pull Request

### **Код ревʼю чекліст**
- [ ] Дотримання FSD архітектури
- [ ] TypeScript типізація
- [ ] Відсутність ESLint помилок
- [ ] Консистентне іменування
- [ ] Оптимізація імпортів

---

## 📞 Підтримка

Для питань по архітектурі або розробці:
1. Перевірте цю документацію
2. Подивіться на існуючі приклади в коді
3. Слідуйте принципам FSD

**Корисні ресурси:**
- [Feature-Sliced Design](https://feature-sliced.design/)
- [React документація](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand документація](https://zustand-demo.pmnd.rs/)
