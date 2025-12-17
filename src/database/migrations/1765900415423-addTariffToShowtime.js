/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class AddTariffToShowtime1765900415423 {
  name = "AddTariffToShowtime1765900415423";

  /**
   * @param {QueryRunner} queryRunner
   */
  async up(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "showtime" ADD "tariff_id" integer NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "showtime" ADD CONSTRAINT "FK_05cd096dd8e931ae342ce32a0d5" FOREIGN KEY ("tariff_id") REFERENCES "tariff"("tariff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  /**
   * @param {QueryRunner} queryRunner
   */
  async down(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "showtime" DROP CONSTRAINT "FK_05cd096dd8e931ae342ce32a0d5"`
    );
    await queryRunner.query(`ALTER TABLE "showtime" DROP COLUMN "tariff_id"`);
  }
}
