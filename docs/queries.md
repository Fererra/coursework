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