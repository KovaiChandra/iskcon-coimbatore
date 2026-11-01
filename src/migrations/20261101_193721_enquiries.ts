import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_enquiries_type" AS ENUM('course', 'priest');
  CREATE TYPE "public"."enum_enquiries_topic" AS ENUM('Spiritual question', 'Bhagavad-gita', 'Japa and chanting', 'Samskara or home puja', 'Personal guidance', 'Other');
  CREATE TYPE "public"."enum_enquiries_preferred_mode" AS ENUM('At the temple', 'Phone call', 'Video call');
  CREATE TYPE "public"."enum_enquiries_status" AS ENUM('new', 'contacted', 'done');
  CREATE TYPE "public"."enum_enquiries_source" AS ENUM('website', 'app');
  CREATE TABLE "enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_enquiries_type" NOT NULL,
  	"course" varchar,
  	"topic" "enum_enquiries_topic",
  	"preferred_mode" "enum_enquiries_preferred_mode",
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"preferred_time" varchar,
  	"message" varchar,
  	"consent" boolean,
  	"status" "enum_enquiries_status" DEFAULT 'new',
  	"source" "enum_enquiries_source" DEFAULT 'website',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "enquiries_id" integer;
  CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "enquiries" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "enquiries" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_enquiries_fk";
  
  DROP INDEX "payload_locked_documents_rels_enquiries_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "enquiries_id";
  DROP TYPE "public"."enum_enquiries_type";
  DROP TYPE "public"."enum_enquiries_topic";
  DROP TYPE "public"."enum_enquiries_preferred_mode";
  DROP TYPE "public"."enum_enquiries_status";
  DROP TYPE "public"."enum_enquiries_source";`)
}
