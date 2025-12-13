/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class AddSurrogateIdToBookingSeat1765644914565 {
  name = "AddSurrogateIdToBookingSeat1765644914565";

  /**
   * @param {QueryRunner} queryRunner
   */
  async up(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD "booking_seat_id" SERIAL NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" DROP CONSTRAINT "PK_309a1dd02c7e069356fb7bbe9b2"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD CONSTRAINT "PK_42c3038cd33fbf88bbc2a5f7ed3" PRIMARY KEY ("showtime_id", "seat_id", "booking_seat_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" DROP CONSTRAINT "FK_9649f6348e177b2d9d836b258d7"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" DROP CONSTRAINT "FK_943378396008d097fe4833b9acc"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" DROP CONSTRAINT "PK_42c3038cd33fbf88bbc2a5f7ed3"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD CONSTRAINT "PK_29928283124535423206ddbfe4b" PRIMARY KEY ("seat_id", "booking_seat_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" DROP CONSTRAINT "PK_29928283124535423206ddbfe4b"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD CONSTRAINT "PK_8b3f7439ed54d27b9a5a8d375b7" PRIMARY KEY ("booking_seat_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD CONSTRAINT "FK_9649f6348e177b2d9d836b258d7" FOREIGN KEY ("showtime_id") REFERENCES "showtime"("showtime_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD CONSTRAINT "FK_943378396008d097fe4833b9acc" FOREIGN KEY ("seat_id") REFERENCES "seat"("seat_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  /**
   * @param {QueryRunner} queryRunner
   */
  async down(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "booking_seat" DROP CONSTRAINT "FK_943378396008d097fe4833b9acc"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" DROP CONSTRAINT "FK_9649f6348e177b2d9d836b258d7"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" DROP CONSTRAINT "PK_8b3f7439ed54d27b9a5a8d375b7"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD CONSTRAINT "PK_29928283124535423206ddbfe4b" PRIMARY KEY ("seat_id", "booking_seat_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" DROP CONSTRAINT "PK_29928283124535423206ddbfe4b"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD CONSTRAINT "PK_42c3038cd33fbf88bbc2a5f7ed3" PRIMARY KEY ("showtime_id", "seat_id", "booking_seat_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD CONSTRAINT "FK_943378396008d097fe4833b9acc" FOREIGN KEY ("seat_id") REFERENCES "seat"("seat_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD CONSTRAINT "FK_9649f6348e177b2d9d836b258d7" FOREIGN KEY ("showtime_id") REFERENCES "showtime"("showtime_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" DROP CONSTRAINT "PK_42c3038cd33fbf88bbc2a5f7ed3"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD CONSTRAINT "PK_309a1dd02c7e069356fb7bbe9b2" PRIMARY KEY ("showtime_id", "seat_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" DROP COLUMN "booking_seat_id"`
    );
  }
}
