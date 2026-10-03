import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserProfilesTable1791044308517 implements MigrationInterface {
  name = 'CreateUserProfilesTable1791044308517';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_gender_enum" AS ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')`,
    );

    await queryRunner.query(
      `CREATE TABLE "user_profiles" (
        "user_id" uuid NOT NULL,
        "username" character varying(30) NOT NULL,
        "bio" text,
        "avatar_url" text,
        "cover_url" text,
        "location" character varying(100),
        "website" character varying(255),
        "date_of_birth" date,
        "gender" "public"."users_gender_enum",
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_profiles_user_id" PRIMARY KEY ("user_id")
      )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_user_profiles_username" ON "user_profiles" (LOWER("username"))`,
    );

    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_user_profiles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Backfill user_profiles for existing users
    await queryRunner.query(
      `INSERT INTO "user_profiles" ("user_id", "username", "avatar_url", "created_at", "updated_at")
       SELECT "id", 'user_' || SUBSTRING("id"::text, 1, 8), "avatar_url", now(), now()
       FROM "users"
       ON CONFLICT ("user_id") DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_user_profiles_user_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_user_profiles_username"`);
    await queryRunner.query(`DROP TABLE "user_profiles"`);
    await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
  }
}
