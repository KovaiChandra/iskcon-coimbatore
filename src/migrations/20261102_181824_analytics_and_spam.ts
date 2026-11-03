import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "page_views" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"day" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"visitor" varchar NOT NULL,
  	"device" varchar,
  	"source" varchar,
  	"city" varchar,
  	"country" varchar
  );
  
  CREATE TABLE "rate_limits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"count" numeric NOT NULL,
  	"window_start" timestamp(3) with time zone NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "page_views_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "rate_limits_id" integer;
  CREATE INDEX "page_views_day_idx" ON "page_views" USING btree ("day");
  CREATE UNIQUE INDEX "rate_limits_key_idx" ON "rate_limits" USING btree ("key");
  CREATE INDEX "rate_limits_window_start_idx" ON "rate_limits" USING btree ("window_start");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_page_views_fk" FOREIGN KEY ("page_views_id") REFERENCES "public"."page_views"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rate_limits_fk" FOREIGN KEY ("rate_limits_id") REFERENCES "public"."rate_limits"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_page_views_id_idx" ON "payload_locked_documents_rels" USING btree ("page_views_id");
  CREATE INDEX "payload_locked_documents_rels_rate_limits_id_idx" ON "payload_locked_documents_rels" USING btree ("rate_limits_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_views" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "rate_limits" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "page_views" CASCADE;
  DROP TABLE "rate_limits" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_page_views_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_rate_limits_fk";
  
  DROP INDEX "payload_locked_documents_rels_page_views_id_idx";
  DROP INDEX "payload_locked_documents_rels_rate_limits_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "page_views_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "rate_limits_id";`)
}
