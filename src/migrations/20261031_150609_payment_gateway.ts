import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_donations_source" AS ENUM('website', 'app');
  ALTER TYPE "public"."enum_donations_status" ADD VALUE 'expired' BEFORE 'refunded';
  ALTER TABLE "sevas_items" ADD COLUMN "scheme_id" varchar;
  ALTER TABLE "sevas" ADD COLUMN "scheme_id" varchar;
  ALTER TABLE "donations" ADD COLUMN "reference" varchar;
  ALTER TABLE "donations" ADD COLUMN "gateway_session_id" varchar;
  ALTER TABLE "donations" ADD COLUMN "gateway_checkout" jsonb;
  ALTER TABLE "donations" ADD COLUMN "kcm_contact_id" varchar;
  ALTER TABLE "donations" ADD COLUMN "paid_at" timestamp(3) with time zone;
  ALTER TABLE "donations" ADD COLUMN "failure_reason" varchar;
  ALTER TABLE "donations" ADD COLUMN "source" "enum_donations_source" DEFAULT 'website';
  CREATE UNIQUE INDEX "donations_reference_idx" ON "donations" USING btree ("reference");
  CREATE INDEX "donations_gateway_session_id_idx" ON "donations" USING btree ("gateway_session_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "donations" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "donations" ALTER COLUMN "status" SET DEFAULT 'created'::text;
  DROP TYPE "public"."enum_donations_status";
  CREATE TYPE "public"."enum_donations_status" AS ENUM('created', 'paid', 'failed', 'refunded');
  ALTER TABLE "donations" ALTER COLUMN "status" SET DEFAULT 'created'::"public"."enum_donations_status";
  ALTER TABLE "donations" ALTER COLUMN "status" SET DATA TYPE "public"."enum_donations_status" USING "status"::"public"."enum_donations_status";
  DROP INDEX "donations_reference_idx";
  DROP INDEX "donations_gateway_session_id_idx";
  ALTER TABLE "sevas_items" DROP COLUMN "scheme_id";
  ALTER TABLE "sevas" DROP COLUMN "scheme_id";
  ALTER TABLE "donations" DROP COLUMN "reference";
  ALTER TABLE "donations" DROP COLUMN "gateway_session_id";
  ALTER TABLE "donations" DROP COLUMN "gateway_checkout";
  ALTER TABLE "donations" DROP COLUMN "kcm_contact_id";
  ALTER TABLE "donations" DROP COLUMN "paid_at";
  ALTER TABLE "donations" DROP COLUMN "failure_reason";
  ALTER TABLE "donations" DROP COLUMN "source";
  DROP TYPE "public"."enum_donations_source";`)
}
