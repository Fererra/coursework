/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class RemoveDeletedAtFromBooking1765649057311 {
  name = "RemoveDeletedAtFromBooking1765649057311";

  /**
   * @param {QueryRunner} queryRunner
   */
  async up(queryRunner) {
    await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "deleted_at"`);
  }

  /**
   * @param {QueryRunner} queryRunner
   */
  async down(queryRunner) {
    await queryRunner.query(`ALTER TABLE "booking" ADD "deleted_at" TIMESTAMP`);
  }
}
