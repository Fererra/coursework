/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class AddBookingSeatIndices1765825894885 {
  name = "AddBookingSeatIndices1765825894885";

  /**
   * @param {QueryRunner} queryRunner
   */
  async up(queryRunner) {
    await queryRunner.query(
      `CREATE INDEX "idx_booking_seat_tariff_id_active" ON "booking_seat" ("tariff_id") WHERE "status" = 'active'`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_booking_seat_booking_id" ON "booking_seat" ("booking_id") `
    );
  }

  /**
   * @param {QueryRunner} queryRunner
   */
  async down(queryRunner) {
    await queryRunner.query(
      `DROP INDEX "public"."idx_booking_seat_booking_id"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_booking_seat_tariff_id_active"`
    );
  }
}
