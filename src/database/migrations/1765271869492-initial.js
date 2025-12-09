/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class Initial1765271869492 {
  name = "Initial1765271869492";

  /**
   * @param {QueryRunner} queryRunner
   */
  async up(queryRunner) {
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin')`
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("user_id" SERIAL NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "tariff" ("tariff_id" SERIAL NOT NULL, "name" character varying(30) NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "price_multiplier" numeric(3,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "CHK_a06609b5e7d2b37957469a1fcb" CHECK (price_multiplier > 0), CONSTRAINT "CHK_5a5ba2f0ed2a48a44b09ac672c" CHECK (start_time < end_time), CONSTRAINT "PK_ecfb96b1f00122b594781717864" PRIMARY KEY ("tariff_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "showtime" ("showtime_id" SERIAL NOT NULL, "hall_id" integer NOT NULL, "movie_id" integer NOT NULL, "show_date" date NOT NULL, "show_time" TIME NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_aa11b19df3c202c9176f1c1d67d" UNIQUE ("hall_id", "show_date", "show_time"), CONSTRAINT "PK_988ffa09df618687a8549334314" PRIMARY KEY ("showtime_id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."seat_seat_type_enum" AS ENUM('standard', 'VIP')`
    );
    await queryRunner.query(
      `CREATE TABLE "seat" ("seat_id" SERIAL NOT NULL, "hall_id" integer NOT NULL, "row_number" integer NOT NULL, "seat_number" integer NOT NULL, "seat_type" "public"."seat_seat_type_enum" NOT NULL, "base_price" numeric(6,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_a139f78fadf123de78bee6cf98c" UNIQUE ("hall_id", "row_number", "seat_number"), CONSTRAINT "CHK_f3f9e16e247a029df1cf63ec10" CHECK (row_number > 0), CONSTRAINT "CHK_9365296375eed018b951e6718b" CHECK (seat_number > 0), CONSTRAINT "CHK_2b48a2bbfe415a22da69335b8e" CHECK (base_price > 0), CONSTRAINT "PK_4f04b249b06dec90b7bf370f706" PRIMARY KEY ("seat_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "movie" ("movie_id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "age_limit" integer NOT NULL, "duration_min" integer NOT NULL, "release_year" integer NOT NULL, "description" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_a81090ad0ceb645f30f9399c347" UNIQUE ("title"), CONSTRAINT "CHK_9b0ce9e79dbffa50f6fa52b247" CHECK (age_limit > 0), CONSTRAINT "CHK_e26d66f9fc6f3b3c5b3c6d0089" CHECK (duration_min > 0), CONSTRAINT "CHK_03934d1ca331c5b17e7ed9ad49" CHECK (release_year > 0), CONSTRAINT "PK_f38244c6e76d8e50e1a590f6744" PRIMARY KEY ("movie_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "genre" ("genre_id" SERIAL NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_dd8cd9e50dd049656e4be1f7e8c" UNIQUE ("name"), CONSTRAINT "PK_af0c9d11cb69b909fd91dd33009" PRIMARY KEY ("genre_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "cinema_hall" ("hall_id" SERIAL NOT NULL, "hall_number" integer NOT NULL, "capacity" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_f2f9a19c97029135ba4965dba94" UNIQUE ("hall_number"), CONSTRAINT "CHK_5910052af50cd0291f38a8085d" CHECK (hall_number > 0), CONSTRAINT "CHK_e541ec1fcf6d5ff694a2ffce1a" CHECK (capacity > 0), CONSTRAINT "PK_e59076836ee363591ba6c882fd8" PRIMARY KEY ("hall_id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."booking_status_enum" AS ENUM('pending', 'confirmed', 'cancelled')`
    );
    await queryRunner.query(
      `CREATE TABLE "booking" ("booking_id" SERIAL NOT NULL, "total_price" numeric(8,2) NOT NULL, "status" "public"."booking_status_enum" NOT NULL DEFAULT 'pending', "booking_date" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" integer, "showtime_id" integer, CONSTRAINT "CHK_fe079a7d47b773e04536617d61" CHECK (total_price >= 0), CONSTRAINT "PK_9ecc24640e39cd493c318a117f1" PRIMARY KEY ("booking_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "booking_seat" ("showtime_id" integer NOT NULL, "seat_id" integer NOT NULL, "booking_id" integer NOT NULL, "tariff_id" integer NOT NULL, "final_price" numeric(7,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "CHK_459cf54d3fb6f637ab2f1bead7" CHECK (final_price > 0), CONSTRAINT "PK_309a1dd02c7e069356fb7bbe9b2" PRIMARY KEY ("showtime_id", "seat_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "movie_genre" ("movie_id" integer NOT NULL, "genre_id" integer NOT NULL, CONSTRAINT "PK_1c071b49bad73713e18e774795e" PRIMARY KEY ("movie_id", "genre_id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff1bda1a663d0de5974851fa53" ON "movie_genre" ("movie_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e84764c059f38c3f9d99d2e5de" ON "movie_genre" ("genre_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "showtime" ADD CONSTRAINT "FK_bc94f84c1bccb64bbf6a785fadf" FOREIGN KEY ("movie_id") REFERENCES "movie"("movie_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "showtime" ADD CONSTRAINT "FK_0fcdf1153d0f6520685cb701e6d" FOREIGN KEY ("hall_id") REFERENCES "cinema_hall"("hall_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "seat" ADD CONSTRAINT "FK_44b7c9bbfd7dda7ffae4e5e44d5" FOREIGN KEY ("hall_id") REFERENCES "cinema_hall"("hall_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ADD CONSTRAINT "FK_276896d1a1a30be6de9d7d43f53" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ADD CONSTRAINT "FK_819e5cda0eecac462cb584c733e" FOREIGN KEY ("showtime_id") REFERENCES "showtime"("showtime_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD CONSTRAINT "FK_9649f6348e177b2d9d836b258d7" FOREIGN KEY ("showtime_id") REFERENCES "showtime"("showtime_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD CONSTRAINT "FK_943378396008d097fe4833b9acc" FOREIGN KEY ("seat_id") REFERENCES "seat"("seat_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD CONSTRAINT "FK_e399f3338854bda4b2d22e0f4c7" FOREIGN KEY ("booking_id") REFERENCES "booking"("booking_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" ADD CONSTRAINT "FK_2b5bb6acd823be8b487e1536f09" FOREIGN KEY ("tariff_id") REFERENCES "tariff"("tariff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "movie_genre" ADD CONSTRAINT "FK_ff1bda1a663d0de5974851fa53a" FOREIGN KEY ("movie_id") REFERENCES "movie"("movie_id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "movie_genre" ADD CONSTRAINT "FK_e84764c059f38c3f9d99d2e5de9" FOREIGN KEY ("genre_id") REFERENCES "genre"("genre_id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }

  /**
   * @param {QueryRunner} queryRunner
   */
  async down(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "movie_genre" DROP CONSTRAINT "FK_e84764c059f38c3f9d99d2e5de9"`
    );
    await queryRunner.query(
      `ALTER TABLE "movie_genre" DROP CONSTRAINT "FK_ff1bda1a663d0de5974851fa53a"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" DROP CONSTRAINT "FK_2b5bb6acd823be8b487e1536f09"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" DROP CONSTRAINT "FK_e399f3338854bda4b2d22e0f4c7"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" DROP CONSTRAINT "FK_943378396008d097fe4833b9acc"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking_seat" DROP CONSTRAINT "FK_9649f6348e177b2d9d836b258d7"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking" DROP CONSTRAINT "FK_819e5cda0eecac462cb584c733e"`
    );
    await queryRunner.query(
      `ALTER TABLE "booking" DROP CONSTRAINT "FK_276896d1a1a30be6de9d7d43f53"`
    );
    await queryRunner.query(
      `ALTER TABLE "seat" DROP CONSTRAINT "FK_44b7c9bbfd7dda7ffae4e5e44d5"`
    );
    await queryRunner.query(
      `ALTER TABLE "showtime" DROP CONSTRAINT "FK_0fcdf1153d0f6520685cb701e6d"`
    );
    await queryRunner.query(
      `ALTER TABLE "showtime" DROP CONSTRAINT "FK_bc94f84c1bccb64bbf6a785fadf"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e84764c059f38c3f9d99d2e5de"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ff1bda1a663d0de5974851fa53"`
    );
    await queryRunner.query(`DROP TABLE "movie_genre"`);
    await queryRunner.query(`DROP TABLE "booking_seat"`);
    await queryRunner.query(`DROP TABLE "booking"`);
    await queryRunner.query(`DROP TYPE "public"."booking_status_enum"`);
    await queryRunner.query(`DROP TABLE "cinema_hall"`);
    await queryRunner.query(`DROP TABLE "genre"`);
    await queryRunner.query(`DROP TABLE "movie"`);
    await queryRunner.query(`DROP TABLE "seat"`);
    await queryRunner.query(`DROP TYPE "public"."seat_seat_type_enum"`);
    await queryRunner.query(`DROP TABLE "showtime"`);
    await queryRunner.query(`DROP TABLE "tariff"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
  }
}
