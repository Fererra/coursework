/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class AddUniqueConstraintToTariffName1765471579324 {
  name = "AddUniqueConstraintToTariffName1765471579324";

  /**
   * @param {QueryRunner} queryRunner
   */
  async up(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "tariff" ADD CONSTRAINT "UQ_b3980ba974e3ae6569836192678" UNIQUE ("name")`
    );
  }

  /**
   * @param {QueryRunner} queryRunner
   */
  async down(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "tariff" DROP CONSTRAINT "UQ_b3980ba974e3ae6569836192678"`
    );
  }
}
