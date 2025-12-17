/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class AddDefaultValueToMovieDescription1765962289020 {
  name = "AddDefaultValueToMovieDescription1765962289020";

  /**
   * @param {QueryRunner} queryRunner
   */
  async up(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "movie" ALTER COLUMN "description" SET DEFAULT 'No description'`
    );
  }

  /**
   * @param {QueryRunner} queryRunner
   */
  async down(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "movie" ALTER COLUMN "description" DROP DEFAULT`
    );
  }
}
