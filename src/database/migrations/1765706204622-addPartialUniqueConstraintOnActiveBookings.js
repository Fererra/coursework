/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class AddPartialUniqueConstraintOnActiveBookings1765706204622 {
  name = "AddPartialUniqueConstraintOnActiveBookings1765706204622";

  /**
   * @param {QueryRunner} queryRunner
   */
  async up(queryRunner) {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "partial_unique_showtime_seat" ON "booking_seat" ("showtime_id", "seat_id") WHERE "status" = 'active'`
    );
  }

  /**
   * @param {QueryRunner} queryRunner
   */
  async down(queryRunner) {
    await queryRunner.query(
      `DROP INDEX "public"."partial_unique_showtime_seat"`
    );
  }
}
