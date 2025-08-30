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

## 🔐 Система автентифікації та авторизації

### **Статуси користувачів**

```typescript
type UserStatus =
  | 'USER_STATUS_ACTIVE' // Активний користувач
  | 'USER_STATUS_INACTIVE' // Неактивний
  | 'USER_STATUS_SUSPENDED' // Заблокований
  | 'USER_STATUS_PENDING_VERIFICATION'; // Очікує підтвердження email
```

### **Методи перевірки статусу**

```typescript
// Використання у компонентах
const { isUserActive, needsEmailConfirmation, isUserBlocked } = useAuthStore();

if (needsEmailConfirmation()) {
  // Показати сторінку підтвердження email
  return <ConfirmEmailPage />;
}

if (isUserBlocked()) {
  // Показати повідомлення про блокування
  return <BlockedUserMessage />;
}
```

### **Ролі та дозволи**

```typescript
// Перевірка ролей
const { hasRole, hasPermission } = useAuthStore();

// Приклад захищеного контенту
{hasRole('contractor') && (
  <DashboardProviderPage />
)}

{hasPermission('manage_services') && (
  <ManageServicesButton />
)}
```

### **Потік реєстрації**

1. **Заповнення форми** (`RegistrationData`)
2. **Вибір типу** - customer/contractor
3. **Для contractor** - specialist/master
4. **Email підтвердження** - `USER_STATUS_PENDING_VERIFICATION`
5. **Активація** - `USER_STATUS_ACTIVE`

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
├── App.tsx          # Головний компонент з роутингом
├── index.tsx        # Точка входу та React root
├── providers/       # Провайдери контексту
└── store/          # Глобальний стор
```

**Архітектура додатку:**

- `index.tsx` - ініціалізує React та BrowserRouter
- `App.tsx` - налаштовує AuthProvider та роутинг
- Чистий поділ відповідальностей між ініціалізацією та логікою

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

### **Використання імпортів у проекті**

Ваш проект використовує алайс `@/` для абсолютних імпортів:

```typescript
// ✅ Правильно (як у вашому App.tsx)
import { AuthProvider } from '@/shared/contexts/AuthContext';
import routes from '@/routes/routes';

// ✅ Альтернативно (якщо налаштуєте інші алайси)
import { AuthProvider } from '@shared/contexts/AuthContext';
import { Button } from '@shared/ui/Button';
```

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

### **Zustand стор (auth.store.ts)**

```typescript
// entities/auth/model/auth.store.ts
import { create } from 'zustand';

type UserStatus =
  | 'USER_STATUS_ACTIVE'
  | 'USER_STATUS_INACTIVE'
  | 'USER_STATUS_SUSPENDED'
  | 'USER_STATUS_PENDING_VERIFICATION';

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  user_status: UserStatus;
}

interface AuthStore {
  // State
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfirming: boolean;

  // Methods
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  confirmEmail: (token: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isUserActive: () => boolean;
  needsEmailConfirmation: () => boolean;
  isUserBlocked: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Ініціалізація з localStorage
  accessToken:
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,

  // Методи автентифікації з перевіркою статусу користувача
  // ... (повна реалізація в файлі)
}));
```

**Особливості реалізації:**

- ✅ **SSR безпека** - перевірка `typeof window !== 'undefined'`
- ✅ **Статуси користувача** - 4 різних стани
- ✅ **Права доступу** - ролі та дозволи
- ✅ **Email підтвердження** - окремий стейт
- ✅ **LocalStorage інтеграція** - збереження токену

### **Типи та інтерфейси**

#### Реєстрація (entities/registration/types.ts)

```typescript
export type RegistrationData = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  postcode: string;
  type?: 'customer' | 'contractor';
  contractorType?: 'specialist' | 'master';
};

export type UserRole = 'customer' | 'contractor';
export type WorkerType = 'specialist' | 'master';
```

#### Сервіси (entities/services/model/types.ts) - ОНОВЛЕНО

```typescript
export interface Service {
  id: number;
  name: string;
  category_id: number; // Зв'язок з категорією
}

export interface ServiceCategory {
  id: number;
  name: string;
  // services відсутній - отримується окремо
}

export interface UserServiceSelection {
  [categoryId: number]: number[]; // Вибрані сервіси по категоріях
}
```

#### API клас сервісів (entities/services/api/serviceApi.ts)

```typescript
export class ServiceApi {
  private static baseUrl = '/api';

  // Отримання категорій сервісів
  static async getServiceCategories(): Promise<ServiceCategory[]> {
    const response = await fetch(`${this.baseUrl}/service-categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch service categories');
    }
    return response.json();
  }

  // Отримання всіх сервісів
  static async getServices(): Promise<Service[]> {
    const response = await fetch(`${this.baseUrl}/services`);
    if (!response.ok) {
      throw new Error('Failed to fetch services');
    }
    return response.json();
  }

  // Оновлення сервісів користувача
  static async updateUserServices(serviceIds: number[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/user/services`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_ids: serviceIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user services');
    }
  }
}
```

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

### **Приклад складного UI компонента**

#### ServiceCategoryItem - Розкривний список сервісів

```typescript
// entities/services/ui/ServiceCategoryItem/ServiceCategoryItem.tsx
import React from 'react';
import { ServiceCategory, Service } from '../../model/types';
import './ServiceCategoryItem.css';

interface ServiceCategoryItemProps {
  category: ServiceCategory;
  services: Service[];
  selectedServices: number[];
  isExpanded: boolean;
  onToggleCategory: (categoryId: number) => void;
  onToggleService: (categoryId: number, serviceId: number) => void;
}

export const ServiceCategoryItem: React.FC<ServiceCategoryItemProps> = ({
  category,
  services,
  selectedServices,
  isExpanded,
  onToggleCategory,
  onToggleService,
}) => {
  const selectedCount = selectedServices.length;

  return (
    <div className="service-category-item">
      {/* Заголовок категорії з лічильником */}
      <button
        onClick={() => onToggleCategory(category.id)}
        className="service-category-item__header"
      >
        <div className="service-category-item__info">
          <h3 className="service-category-item__title">{category.name}</h3>
          <p className="service-category-item__description">
            {selectedCount > 0
              ? `Обрано послуг: ${selectedCount} з ${services.length}`
              : `Доступно послуг: ${services.length}`
            }
          </p>
        </div>

        {/* Badge з кількістю вибраних */}
        <div className="service-category-item__actions">
          {selectedCount > 0 && (
            <span className="service-category-item__badge">
              {selectedCount}
            </span>
          )}
          <svg className={`service-category-item__arrow ${
            isExpanded ? 'service-category-item__arrow--expanded' : ''
          }`}>
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Розкривний список сервісів */}
      {isExpanded && (
        <div className="service-category-item__services">
          <div className="service-category-item__services-grid">
            {services.map((service) => (
              <label key={service.id} className="service-category-item__service">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service.id)}
                  onChange={() => onToggleService(category.id, service.id)}
                  className="service-category-item__checkbox"
                />
                <span className="service-category-item__service-name">
                  {service.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

**Особливості компонента:**

- ✅ **Controlled component** - стан контролюється зовні
- ✅ **Responsive design** - адаптивна сітка сервісів
- ✅ **Accessibility** - семантичні label та button елементи
- ✅ **Performance** - умовний рендеринг списку сервісів
- ✅ **UX деталі** - анімації, hover ефекти, лічильники

#### CSS Modules структура

```css
/* Модульні стилі з BEM методологією */
.service-category-item {
  /* Блок */
}
.service-category-item__header {
  /* Елемент */
}
.service-category-item__arrow--expanded {
  /* Модифікатор */
}

/* Responsive дизайн */
@media (max-width: 768px) {
  .service-category-item__services-grid {
    grid-template-columns: 1fr;
  }
}
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

## 💻 Приклади реального коду

### **App слой - Ініціалізація**

#### `app/index.tsx` - Точка входу

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

#### `app/App.tsx` - Головний компонент

```typescript
import { useRoutes } from "react-router-dom";
import { AuthProvider } from "@/shared/contexts/AuthContext";
import routes from "@/routes/routes";

function App() {
  const element = useRoutes(routes);

  return (
    <AuthProvider>
      {element}
    </AuthProvider>
  );
}

export default App;
```

**Архітектурні рішення:**

- ✅ Чистий поділ ініціалізації та логіки
- ✅ Централізований роутинг через `useRoutes`
- ✅ AuthProvider огортає всі маршрути
- ✅ Використання абсолютних імпортів `@/`

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
