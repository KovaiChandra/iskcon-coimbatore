import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_photos_art_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"title" varchar NOT NULL,
  	"kind" varchar
  );
  
  CREATE TABLE "site_photos_reels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"poster_id" integer NOT NULL,
  	"video_id" integer,
  	"caption" varchar NOT NULL,
  	"link" varchar
  );
  
  CREATE TABLE "site_photos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"explore_deities_id" integer,
  	"explore_kirtan_id" integer,
  	"explore_prasadam_id" integer,
  	"explore_goshala_id" integer,
  	"explore_kovai_chandra_id" integer,
  	"explore_visit_id" integer,
  	"kovai_banner_id" integer,
  	"banners_services_id" integer,
  	"banners_courses_id" integer,
  	"banners_festivals_id" integer,
  	"banners_donate_id" integer,
  	"banners_volunteer_id" integer,
  	"banners_daily_darshan_id" integer,
  	"banners_art_gallery_id" integer,
  	"banners_blog_id" integer,
  	"banners_contact_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_photos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "whatsapp_channel" varchar;
  ALTER TABLE "site_photos_art_gallery" ADD CONSTRAINT "site_photos_art_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos_art_gallery" ADD CONSTRAINT "site_photos_art_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_photos_reels" ADD CONSTRAINT "site_photos_reels_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos_reels" ADD CONSTRAINT "site_photos_reels_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos_reels" ADD CONSTRAINT "site_photos_reels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_explore_deities_id_media_id_fk" FOREIGN KEY ("explore_deities_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_explore_kirtan_id_media_id_fk" FOREIGN KEY ("explore_kirtan_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_explore_prasadam_id_media_id_fk" FOREIGN KEY ("explore_prasadam_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_explore_goshala_id_media_id_fk" FOREIGN KEY ("explore_goshala_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_explore_kovai_chandra_id_media_id_fk" FOREIGN KEY ("explore_kovai_chandra_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_explore_visit_id_media_id_fk" FOREIGN KEY ("explore_visit_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_kovai_banner_id_media_id_fk" FOREIGN KEY ("kovai_banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_banners_services_id_media_id_fk" FOREIGN KEY ("banners_services_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_banners_courses_id_media_id_fk" FOREIGN KEY ("banners_courses_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_banners_festivals_id_media_id_fk" FOREIGN KEY ("banners_festivals_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_banners_donate_id_media_id_fk" FOREIGN KEY ("banners_donate_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_banners_volunteer_id_media_id_fk" FOREIGN KEY ("banners_volunteer_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_banners_daily_darshan_id_media_id_fk" FOREIGN KEY ("banners_daily_darshan_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_banners_art_gallery_id_media_id_fk" FOREIGN KEY ("banners_art_gallery_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_banners_blog_id_media_id_fk" FOREIGN KEY ("banners_blog_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_banners_contact_id_media_id_fk" FOREIGN KEY ("banners_contact_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_photos_rels" ADD CONSTRAINT "site_photos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_photos_rels" ADD CONSTRAINT "site_photos_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_photos_art_gallery_order_idx" ON "site_photos_art_gallery" USING btree ("_order");
  CREATE INDEX "site_photos_art_gallery_parent_id_idx" ON "site_photos_art_gallery" USING btree ("_parent_id");
  CREATE INDEX "site_photos_art_gallery_image_idx" ON "site_photos_art_gallery" USING btree ("image_id");
  CREATE INDEX "site_photos_reels_order_idx" ON "site_photos_reels" USING btree ("_order");
  CREATE INDEX "site_photos_reels_parent_id_idx" ON "site_photos_reels" USING btree ("_parent_id");
  CREATE INDEX "site_photos_reels_poster_idx" ON "site_photos_reels" USING btree ("poster_id");
  CREATE INDEX "site_photos_reels_video_idx" ON "site_photos_reels" USING btree ("video_id");
  CREATE INDEX "site_photos_explore_explore_deities_idx" ON "site_photos" USING btree ("explore_deities_id");
  CREATE INDEX "site_photos_explore_explore_kirtan_idx" ON "site_photos" USING btree ("explore_kirtan_id");
  CREATE INDEX "site_photos_explore_explore_prasadam_idx" ON "site_photos" USING btree ("explore_prasadam_id");
  CREATE INDEX "site_photos_explore_explore_goshala_idx" ON "site_photos" USING btree ("explore_goshala_id");
  CREATE INDEX "site_photos_explore_explore_kovai_chandra_idx" ON "site_photos" USING btree ("explore_kovai_chandra_id");
  CREATE INDEX "site_photos_explore_explore_visit_idx" ON "site_photos" USING btree ("explore_visit_id");
  CREATE INDEX "site_photos_kovai_kovai_banner_idx" ON "site_photos" USING btree ("kovai_banner_id");
  CREATE INDEX "site_photos_banners_banners_services_idx" ON "site_photos" USING btree ("banners_services_id");
  CREATE INDEX "site_photos_banners_banners_courses_idx" ON "site_photos" USING btree ("banners_courses_id");
  CREATE INDEX "site_photos_banners_banners_festivals_idx" ON "site_photos" USING btree ("banners_festivals_id");
  CREATE INDEX "site_photos_banners_banners_donate_idx" ON "site_photos" USING btree ("banners_donate_id");
  CREATE INDEX "site_photos_banners_banners_volunteer_idx" ON "site_photos" USING btree ("banners_volunteer_id");
  CREATE INDEX "site_photos_banners_banners_daily_darshan_idx" ON "site_photos" USING btree ("banners_daily_darshan_id");
  CREATE INDEX "site_photos_banners_banners_art_gallery_idx" ON "site_photos" USING btree ("banners_art_gallery_id");
  CREATE INDEX "site_photos_banners_banners_blog_idx" ON "site_photos" USING btree ("banners_blog_id");
  CREATE INDEX "site_photos_banners_banners_contact_idx" ON "site_photos" USING btree ("banners_contact_id");
  CREATE INDEX "site_photos_rels_order_idx" ON "site_photos_rels" USING btree ("order");
  CREATE INDEX "site_photos_rels_parent_idx" ON "site_photos_rels" USING btree ("parent_id");
  CREATE INDEX "site_photos_rels_path_idx" ON "site_photos_rels" USING btree ("path");
  CREATE INDEX "site_photos_rels_media_id_idx" ON "site_photos_rels" USING btree ("media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_photos_art_gallery" CASCADE;
  DROP TABLE "site_photos_reels" CASCADE;
  DROP TABLE "site_photos" CASCADE;
  DROP TABLE "site_photos_rels" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN "whatsapp_channel";`)
}
