/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class AddShowTimeIndices1765826146452 {
  name = "AddShowTimeIndices1765826146452";

  /**
   * @param {QueryRunner} queryRunner
   */
  async up(queryRunner) {
    await queryRunner.query(
      `CREATE INDEX "idx_showtime_movie_id" ON "showtime" ("movie_id") WHERE "deleted_at" IS NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_showtime_hall_id" ON "showtime" ("hall_id") WHERE "deleted_at" IS NULL`
    );
  }

  /**
   * @param {QueryRunner} queryRunner
   */
  async down(queryRunner) {
    await queryRunner.query(`DROP INDEX "public"."idx_showtime_hall_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_showtime_movie_id"`);
  }
}
