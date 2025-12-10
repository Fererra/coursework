# Документація схеми бази даних

## Entity Relationship Diagram

![ERD](/docs/cinema.drawio.png)

## Таблиця: `user`

Призначення: Зберігає інформацію про користувачів

Стовпці:
| Стовпець | Тип | Обмеження | Опис |
|----------------|----------------|--------------------------|--------------------------|
| user_id | SERIAL | PRIMARY KEY | Ідентифікатор користувача |
| first_name | VARCHAR(100) | NOT NULL | Ім'я користувача |
| last_name | VARCHAR(100) | NOT NULL | Прізвище користувача |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email користувача |
| password | VARCHAR(255) | NOT NULL | Хешований пароль |
| role | ENUM('user', 'admin') | DEFAULT 'user' | Роль користувача |
| created_at | TIMESTAMP | DEFAULT NOW() | Час створення запису |
| updated_at | TIMESTAMP | DEFAULT NOW() | Час оновлення запису |
| deleted_at | TIMESTAMP | NULL | Мітка часу видалення |

Зв'язки:

- Один-до-багатьох з `booking` (користувач може мати кілька бронювань)

---

## Таблиця: `movie`

Призначення: Зберігає інформацію про фільми

Стовпці:
| Стовпець | Тип | Обмеження | Опис |
|----------------|--------------|--------------------------|--------------------------|
| movie_id | SERIAL | PRIMARY KEY | Ідентифікатор фільму |
| title | VARCHAR(255) | UNIQUE, NOT NULL | Назва фільму |
| age_limit | INT | CHECK (> 0), NOT NULL | Вікове обмеження |
| duration_min | INT | CHECK (> 0), NOT NULL | Тривалість (хвилини) |
| release_year | INT | CHECK (> 0), NOT NULL | Рік випуску |
| description | TEXT | | Опис фільму |
| created_at | TIMESTAMP | DEFAULT NOW() | Час створення запису |
| updated_at | TIMESTAMP | DEFAULT NOW() | Час оновлення запису |
| deleted_at | TIMESTAMP | NULL | Мітка часу видалення |

Зв'язки:

- Один-до-багатьох з `showtime` (фільм може мати кілька сеансів)
- Багато-до-багатьох з `genre` (фільм може мати кілька жанрів)

---

## Таблиця: `genre`

Призначення: Зберігає інформацію про жанри фільмів

Стовпці:
| Стовпець | Тип | Обмеження | Опис |
|------------|--------------|--------------------------|--------------------------|
| genre_id | SERIAL | PRIMARY KEY | Ідентифікатор жанру |
| name | VARCHAR | UNIQUE, NOT NULL | Назва жанру |
| created_at | TIMESTAMP | DEFAULT NOW() | Час створення запису |
| updated_at | TIMESTAMP | DEFAULT NOW() | Час оновлення запису |
| deleted_at | TIMESTAMP | NULL | Мітка часу видалення |

Зв'язки:

- Багато-до-багатьох з `movie` (жанр може належати кільком фільмам)

---
