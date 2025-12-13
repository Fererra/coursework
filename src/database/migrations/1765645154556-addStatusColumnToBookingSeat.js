/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class AddStatusColumnToBookingSeat1765645154556 {
  name = "AddStatusColumnToBookingSeat1765645154556";

  /**
   * @param {QueryRunner} queryRunner
   */
  async up(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "booking_seat" RENAME COLUMN "deleted_at" TO "status"`
    );
    await queryRunner.query(`ALTER TABLE "booking_seat" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE TYPE "public"."booking_seat_status_enum" AS ENUM('active', 'cancelled')`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD "status" "public"."booking_seat_status_enum" NOT NULL DEFAULT 'active'`
    );
  }

  /**
   * @param {QueryRunner} queryRunner
   */
  async down(queryRunner) {
    await queryRunner.query(`ALTER TABLE "booking_seat" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."booking_seat_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD "status" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" RENAME COLUMN "status" TO "deleted_at"`
    );
  }
}
