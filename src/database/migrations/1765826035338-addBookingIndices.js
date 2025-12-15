/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class AddBookingIndices1765826035338 {
  name = "AddBookingIndices1765826035338";

  /**
   * @param {QueryRunner} queryRunner
   */
  async up(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "booking" DROP CONSTRAINT "FK_276896d1a1a30be6de9d7d43f53"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking" DROP CONSTRAINT "FK_819e5cda0eecac462cb584c733e"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ALTER COLUMN "user_id" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ALTER COLUMN "showtime_id" SET NOT NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_booking_user_id" ON "booking" ("user_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_booking_showtime_id" ON "booking" ("showtime_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ADD CONSTRAINT "FK_276896d1a1a30be6de9d7d43f53" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ADD CONSTRAINT "FK_819e5cda0eecac462cb584c733e" FOREIGN KEY ("showtime_id") REFERENCES "showtime"("showtime_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  /**
   * @param {QueryRunner} queryRunner
   */
  async down(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "booking" DROP CONSTRAINT "FK_819e5cda0eecac462cb584c733e"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking" DROP CONSTRAINT "FK_276896d1a1a30be6de9d7d43f53"`
    );
    await queryRunner.query(`DROP INDEX "public"."idx_booking_showtime_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_booking_user_id"`);
    await queryRunner.query(
      `ALTER TABLE "booking" ALTER COLUMN "showtime_id" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ALTER COLUMN "user_id" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ADD CONSTRAINT "FK_819e5cda0eecac462cb584c733e" FOREIGN KEY ("showtime_id") REFERENCES "showtime"("showtime_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ADD CONSTRAINT "FK_276896d1a1a30be6de9d7d43f53" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
