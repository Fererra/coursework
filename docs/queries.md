# Аналітичні звіти системи кінотеатру

### Запит 1: Дохід фільмів (Movies Revenue)

**Бізнес-питання:**
Який дохід приніс кожен фільм, скільки квитків продано, включаючи фільми, які ще не мали сеансів (totalRevenue = 0)?

**TypeORM-запит:**

```js
return this.#dataSource
  .getRepository("Movie")
  .createQueryBuilder("m")
  .leftJoin("m.showtimes", "s", "s.deletedAt IS NULL")
  .leftJoin("s.bookings", "b", "b.status != :cancelled", {
    cancelled: BookingStatus.CANCELLED,
  })
  .leftJoin("b.seats", "bs", "bs.status = :active", {
    active: BookingSeatStatus.ACTIVE,
  })
  .select([
    'm.movie_id AS "movieId"',
    'm.title AS "title"',
    'COALESCE(SUM(bs.final_price),0) AS "totalRevenue"',
    'COALESCE(COUNT(bs.booking_seat_id),0) AS "totalTickets"',
  ])
  .where("m.deletedAt IS NULL")
  .groupBy(["m.movie_id", "m.title"])
  .orderBy('"totalRevenue"', "DESC")
  .getRawMany();
```

**Пояснення:**

- JOIN `showtimes`, `bookings`, `booking_seats` для отримання квитків.
- LEFT JOIN щоб включити фільми без сеансів.
- Фільтрація за `deletedAt IS NULL` для активних фільмів та `status != CANCELLED` для бронювань.
- Агрегатні функції: `SUM` (дохід), `COUNT` (к-сть квитків).
- Групування за фільмом.
- Сортування за доходом у порядку спадання.

**Приклад виводу:**

| movieId | title            | totalRevenue | totalTickets |
| ------- | ---------------- | ------------ | ------------ |
| 2       | The Last Horizon | 120.00       | 5            |
| 3       | Ocean Adventures | 0.00         | 0            |

---

### Запит 2: Витрати користувачів (Users Spending)

**Бізнес-питання:**
Скільки користувачі витратили на квитки, скільки купили квитків, середня ціна квитка, рейтинг за витратами.

**TypeORM-запит:**

```js
return this.#dataSource
  .getRepository("User")
  .createQueryBuilder("u")
  .leftJoin("u.bookings", "b", "b.status != :cancelled", {
    cancelled: BookingStatus.CANCELLED,
  })
  .leftJoin("b.seats", "bs", "bs.status = :active", {
    active: BookingSeatStatus.ACTIVE,
  })
  .select([
    `u.user_id AS "userId"`,
    `u.first_name || ' ' || u.last_name AS "fullName"`,
    `COALESCE(SUM(bs.final_price), 0) AS "totalSpent"`,
    `COUNT(bs.booking_seat_id) AS "totalTickets"`,
    `ROUND(COALESCE(AVG(bs.final_price), 0), 2) AS "avgTicketPrice"`,
    `RANK() OVER (ORDER BY SUM(bs.final_price) DESC) AS "spendingRank"`,
  ])
  .groupBy(["u.user_id", "u.first_name", "u.last_name"])
  .orderBy(`"totalSpent"`, "DESC")
  .getRawMany();
```

**Пояснення:**

- LEFT JOIN з bookings і booking_seats для врахування всіх користувачів.
- Фільтрація за активними бронюваннями та статусом квитка.
- Агрегати: `SUM` (загальні витрати), `COUNT` (кількість квитків), `AVG` (середня ціна).
- Віконна функція `RANK()` для рейтингу користувачів за витратами.
- Групування за користувачем.

**Приклад виводу:**

| userId | name        | totalSpent | totalTickets | avgTicketPrice | spendingRank |
| ------ | ----------- | ---------- | ------------ | -------------- | ------------ |
| 1      | John Doe    | 120.00     | 5            | 24.00          | 1            |
| 2      | Alice Smith | 75.00      | 3            | 25.00          | 2            |