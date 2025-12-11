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

## Таблиця: `tariff`

Призначення: Зберігає інформацію про тарифи

Стовпці:
| Стовпець | Тип | Обмеження | Опис |
|------------------|--------------|--------------------------|--------------------------|
| tariff_id | SERIAL | PRIMARY KEY | Ідентифікатор тарифу |
| name | VARCHAR(30) | NOT NULL | Назва тарифу |
| start_time | TIME | NOT NULL | Час початку дії тарифу |
| end_time | TIME | NOT NULL, CHECK (start_time < end_time) | Час завершення дії тарифу |
| price_multiplier | DECIMAL(3,2) | CHECK (> 0), NOT NULL | Множник ціни |
| created_at | TIMESTAMP | DEFAULT NOW() | Час створення запису |
| updated_at | TIMESTAMP | DEFAULT NOW() | Час оновлення запису |
| deleted_at | TIMESTAMP | NULL | Мітка часу видалення |

Зв'язки:

- Один-до-багатьох з `booking_seat` (тариф може бути використаний для кількох бронювань)

---

## Таблиця: `seat`

Призначення: Зберігає інформацію про місця в залах

Стовпці:
| Стовпець | Тип | Обмеження | Опис |
|--------------|--------------|--------------------------|--------------------------|
| seat_id | SERIAL | PRIMARY KEY | Ідентифікатор місця |
| hall_id | INT | NOT NULL | Ідентифікатор залу |
| row_number | INT | CHECK (> 0), NOT NULL | Номер ряду |
| seat_number | INT | CHECK (> 0), NOT NULL | Номер місця |
| seat_type | ENUM('standard', 'VIP') | NOT NULL | Тип місця |
| base_price | DECIMAL(6,2) | CHECK (> 0), NOT NULL | Базова ціна |
| created_at | TIMESTAMP | DEFAULT NOW() | Час створення запису |
| updated_at | TIMESTAMP | DEFAULT NOW() | Час оновлення запису |
| deleted_at | TIMESTAMP | NULL | Мітка часу видалення |

Обмеження:

- `UNIQUE` на (`hall_id`, `row_number`, `seat_number`)

Зв'язки:

- Багато-до-одного з `cinema_hall` (місце належить одному залу)
- Один-до-багатьох з `booking_seat` (місце може бути частиною кількох бронювань).

---

## Таблиця: `cinema_hall`

Призначення: Зберігає інформацію про зали кінотеатру

Стовпці:
| Стовпець | Тип | Обмеження | Опис |
|--------------|--------------|--------------------------|--------------------------|
| hall_id | SERIAL | PRIMARY KEY | Ідентифікатор залу |
| hall_number | INT | UNIQUE, NOT NULL, CHECK (> 0) | Номер залу |
| capacity | INT | CHECK (> 0), NOT NULL | Місткість залу |
| created_at | TIMESTAMP | DEFAULT NOW() | Час створення запису |
| updated_at | TIMESTAMP | DEFAULT NOW() | Час оновлення запису |
| deleted_at | TIMESTAMP | NULL | Мітка часу видалення |

Зв'язки:

- Один-до-багатьох з `seat` (зал має кілька місць)
- Один-до-багатьох з `showtime` (зал має кілька сеансів)

---
