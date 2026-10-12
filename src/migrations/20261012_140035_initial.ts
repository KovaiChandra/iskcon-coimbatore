import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_festivals_artwork" AS ENUM('temple', 'lamps', 'hill', 'moon', 'book', 'chariot', 'lotus');
  CREATE TYPE "public"."enum_sevas_category" AS ENUM('regular', 'festival');
  CREATE TYPE "public"."enum_sevas_artwork" AS ENUM('temple', 'lamps', 'hill', 'moon', 'book', 'chariot', 'lotus');
  CREATE TYPE "public"."enum_services_action" AS ENUM('donate', 'whatsapp', 'enquiry', 'link');
  CREATE TYPE "public"."enum_courses_mode" AS ENUM('online', 'temple', 'both');
  CREATE TYPE "public"."enum_posts_category" AS ENUM('Festivals', 'Philosophy', 'Temple News', 'Tamil');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('Festivals', 'Philosophy', 'Temple News', 'Tamil');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_donations_frequency" AS ENUM('one-time', 'monthly');
  CREATE TYPE "public"."enum_donations_status" AS ENUM('created', 'paid', 'failed', 'refunded');
  CREATE TYPE "public"."enum_contact_messages_category" AS ENUM('General', 'Donation / 80G receipt', 'Seva', 'Volunteer', 'Suggestion', 'Other');
  CREATE TYPE "public"."enum_home_page_hero_slides_layout" AS ENUM('arch', 'cinematic');
  CREATE TYPE "public"."enum_home_page_hero_slides_tone" AS ENUM('purple', 'maroon', 'indigo', 'green', 'saffron', 'ivory');
  CREATE TYPE "public"."enum_home_page_hero_slides_artwork" AS ENUM('temple', 'lamps', 'hill', 'moon', 'book', 'chariot', 'lotus');
  CREATE TABLE "darshan_days" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "darshan_days_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "festivals_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar NOT NULL,
  	"activity" varchar NOT NULL
  );
  
  CREATE TABLE "festivals" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"time_label" varchar,
  	"image_id" integer,
  	"artwork" "enum_festivals_artwork" DEFAULT 'lotus',
  	"show_in_hero" boolean DEFAULT true,
  	"short_description" varchar NOT NULL,
  	"significance" jsonb,
  	"seva_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "festivals_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "sevas_preset_amounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"amount" numeric NOT NULL
  );
  
  CREATE TABLE "sevas_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"price" numeric NOT NULL
  );
  
  CREATE TABLE "sevas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"category" "enum_sevas_category" DEFAULT 'regular' NOT NULL,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"short_description" varchar NOT NULL,
  	"image_id" integer,
  	"card_image_id" integer,
  	"artwork" "enum_sevas_artwork" DEFAULT 'lotus',
  	"allow_monthly" boolean,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"image_id" integer,
  	"action" "enum_services_action" DEFAULT 'donate' NOT NULL,
  	"seva_id" integer,
  	"url" varchar,
  	"button_label" varchar,
  	"featured" boolean,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "courses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"image_id" integer,
  	"schedule" varchar,
  	"mode" "enum_courses_mode" DEFAULT 'online',
  	"zoom_link" varchar,
  	"featured" boolean,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"category" "enum_posts_category",
  	"published_at" timestamp(3) with time zone,
  	"author" varchar,
  	"image_id" integer,
  	"excerpt" varchar,
  	"content" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_category" "enum__posts_v_version_category",
  	"version_published_at" timestamp(3) with time zone,
  	"version_author" varchar,
  	"version_image_id" integer,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "donations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"mobile" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"pan" varchar,
  	"address" varchar,
  	"pin" varchar,
  	"seva_id" integer NOT NULL,
  	"amount" numeric NOT NULL,
  	"occasion" varchar,
  	"frequency" "enum_donations_frequency" DEFAULT 'one-time',
  	"status" "enum_donations_status" DEFAULT 'created' NOT NULL,
  	"razorpay_order_id" varchar,
  	"razorpay_payment_id" varchar,
  	"receipt_no" varchar,
  	"consent" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"consent" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "volunteers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"mobile" varchar NOT NULL,
  	"email" varchar,
  	"area" varchar,
  	"interest" varchar,
  	"availability" varchar,
  	"skills" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contact_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"category" "enum_contact_messages_category",
  	"message" varchar NOT NULL,
  	"consent" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"darshan_days_id" integer,
  	"festivals_id" integer,
  	"sevas_id" integer,
  	"services_id" integer,
  	"courses_id" integer,
  	"posts_id" integer,
  	"media_id" integer,
  	"donations_id" integer,
  	"subscribers_id" integer,
  	"volunteers_id" integer,
  	"contact_messages_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_page_hero_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_home_page_hero_slides_layout" DEFAULT 'arch',
  	"tone" "enum_home_page_hero_slides_tone" DEFAULT 'purple',
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"text" varchar,
  	"verse" varchar,
  	"image_id" integer,
  	"video_id" integer,
  	"video_webm_id" integer,
  	"artwork" "enum_home_page_hero_slides_artwork" DEFAULT 'temple',
  	"button_label" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "home_page_youtube_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"date" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"about_image_id" integer,
  	"about_small_image_id" integer,
  	"about_card_image_id" integer,
  	"about_card_title" varchar,
  	"about_card_subtitle" varchar,
  	"about_text" varchar,
  	"visit_image_id" integer,
  	"founder_image_id" integer,
  	"live_puja_image_id" integer,
  	"live_puja_title" varchar DEFAULT 'Live online puja',
  	"live_puja_text" varchar,
  	"live_puja_time" varchar,
  	"live_puja_platform" varchar DEFAULT 'YouTube · Free to join',
  	"live_puja_schedule" varchar,
  	"live_puja_link" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sevas_id" integer
  );
  
  CREATE TABLE "temple_timings_open_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL
  );
  
  CREATE TABLE "temple_timings_schedule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar NOT NULL,
  	"activity" varchar NOT NULL,
  	"show_in_footer" boolean
  );
  
  CREATE TABLE "temple_timings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"address" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"whatsapp" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"map_url" varchar,
  	"facebook" varchar,
  	"instagram" varchar,
  	"youtube" varchar,
  	"reg80g" varchar,
  	"reg80_g_validity" varchar,
  	"upi_id" varchar,
  	"upi_qr_id" integer,
  	"bank_details" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "darshan_days_rels" ADD CONSTRAINT "darshan_days_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."darshan_days"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "darshan_days_rels" ADD CONSTRAINT "darshan_days_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "festivals_schedule" ADD CONSTRAINT "festivals_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."festivals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "festivals" ADD CONSTRAINT "festivals_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "festivals" ADD CONSTRAINT "festivals_seva_id_sevas_id_fk" FOREIGN KEY ("seva_id") REFERENCES "public"."sevas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "festivals_rels" ADD CONSTRAINT "festivals_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."festivals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "festivals_rels" ADD CONSTRAINT "festivals_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sevas_preset_amounts" ADD CONSTRAINT "sevas_preset_amounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sevas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sevas_items" ADD CONSTRAINT "sevas_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sevas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sevas" ADD CONSTRAINT "sevas_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sevas" ADD CONSTRAINT "sevas_card_image_id_media_id_fk" FOREIGN KEY ("card_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_seva_id_sevas_id_fk" FOREIGN KEY ("seva_id") REFERENCES "public"."sevas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "donations" ADD CONSTRAINT "donations_seva_id_sevas_id_fk" FOREIGN KEY ("seva_id") REFERENCES "public"."sevas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_darshan_days_fk" FOREIGN KEY ("darshan_days_id") REFERENCES "public"."darshan_days"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_festivals_fk" FOREIGN KEY ("festivals_id") REFERENCES "public"."festivals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sevas_fk" FOREIGN KEY ("sevas_id") REFERENCES "public"."sevas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_donations_fk" FOREIGN KEY ("donations_id") REFERENCES "public"."donations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscribers_fk" FOREIGN KEY ("subscribers_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_volunteers_fk" FOREIGN KEY ("volunteers_id") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "public"."contact_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_hero_slides" ADD CONSTRAINT "home_page_hero_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_hero_slides" ADD CONSTRAINT "home_page_hero_slides_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_hero_slides" ADD CONSTRAINT "home_page_hero_slides_video_webm_id_media_id_fk" FOREIGN KEY ("video_webm_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_hero_slides" ADD CONSTRAINT "home_page_hero_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_youtube_videos" ADD CONSTRAINT "home_page_youtube_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_about_image_id_media_id_fk" FOREIGN KEY ("about_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_about_small_image_id_media_id_fk" FOREIGN KEY ("about_small_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_about_card_image_id_media_id_fk" FOREIGN KEY ("about_card_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_visit_image_id_media_id_fk" FOREIGN KEY ("visit_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_founder_image_id_media_id_fk" FOREIGN KEY ("founder_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_live_puja_image_id_media_id_fk" FOREIGN KEY ("live_puja_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_rels" ADD CONSTRAINT "home_page_rels_sevas_fk" FOREIGN KEY ("sevas_id") REFERENCES "public"."sevas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "temple_timings_open_sessions" ADD CONSTRAINT "temple_timings_open_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."temple_timings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "temple_timings_schedule" ADD CONSTRAINT "temple_timings_schedule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."temple_timings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_upi_qr_id_media_id_fk" FOREIGN KEY ("upi_qr_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "darshan_days_date_idx" ON "darshan_days" USING btree ("date");
  CREATE INDEX "darshan_days_updated_at_idx" ON "darshan_days" USING btree ("updated_at");
  CREATE INDEX "darshan_days_created_at_idx" ON "darshan_days" USING btree ("created_at");
  CREATE INDEX "darshan_days_rels_order_idx" ON "darshan_days_rels" USING btree ("order");
  CREATE INDEX "darshan_days_rels_parent_idx" ON "darshan_days_rels" USING btree ("parent_id");
  CREATE INDEX "darshan_days_rels_path_idx" ON "darshan_days_rels" USING btree ("path");
  CREATE INDEX "darshan_days_rels_media_id_idx" ON "darshan_days_rels" USING btree ("media_id");
  CREATE INDEX "festivals_schedule_order_idx" ON "festivals_schedule" USING btree ("_order");
  CREATE INDEX "festivals_schedule_parent_id_idx" ON "festivals_schedule" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "festivals_slug_idx" ON "festivals" USING btree ("slug");
  CREATE INDEX "festivals_date_idx" ON "festivals" USING btree ("date");
  CREATE INDEX "festivals_image_idx" ON "festivals" USING btree ("image_id");
  CREATE INDEX "festivals_seva_idx" ON "festivals" USING btree ("seva_id");
  CREATE INDEX "festivals_updated_at_idx" ON "festivals" USING btree ("updated_at");
  CREATE INDEX "festivals_created_at_idx" ON "festivals" USING btree ("created_at");
  CREATE INDEX "festivals_rels_order_idx" ON "festivals_rels" USING btree ("order");
  CREATE INDEX "festivals_rels_parent_idx" ON "festivals_rels" USING btree ("parent_id");
  CREATE INDEX "festivals_rels_path_idx" ON "festivals_rels" USING btree ("path");
  CREATE INDEX "festivals_rels_media_id_idx" ON "festivals_rels" USING btree ("media_id");
  CREATE INDEX "sevas_preset_amounts_order_idx" ON "sevas_preset_amounts" USING btree ("_order");
  CREATE INDEX "sevas_preset_amounts_parent_id_idx" ON "sevas_preset_amounts" USING btree ("_parent_id");
  CREATE INDEX "sevas_items_order_idx" ON "sevas_items" USING btree ("_order");
  CREATE INDEX "sevas_items_parent_id_idx" ON "sevas_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sevas_slug_idx" ON "sevas" USING btree ("slug");
  CREATE INDEX "sevas_image_idx" ON "sevas" USING btree ("image_id");
  CREATE INDEX "sevas_card_image_idx" ON "sevas" USING btree ("card_image_id");
  CREATE INDEX "sevas_updated_at_idx" ON "sevas" USING btree ("updated_at");
  CREATE INDEX "sevas_created_at_idx" ON "sevas" USING btree ("created_at");
  CREATE INDEX "services_image_idx" ON "services" USING btree ("image_id");
  CREATE INDEX "services_seva_idx" ON "services" USING btree ("seva_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "courses_image_idx" ON "courses" USING btree ("image_id");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_image_idx" ON "posts" USING btree ("image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_image_idx" ON "_posts_v" USING btree ("version_image_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "donations_seva_idx" ON "donations" USING btree ("seva_id");
  CREATE INDEX "donations_razorpay_order_id_idx" ON "donations" USING btree ("razorpay_order_id");
  CREATE UNIQUE INDEX "donations_receipt_no_idx" ON "donations" USING btree ("receipt_no");
  CREATE INDEX "donations_updated_at_idx" ON "donations" USING btree ("updated_at");
  CREATE INDEX "donations_created_at_idx" ON "donations" USING btree ("created_at");
  CREATE UNIQUE INDEX "subscribers_email_idx" ON "subscribers" USING btree ("email");
  CREATE INDEX "subscribers_updated_at_idx" ON "subscribers" USING btree ("updated_at");
  CREATE INDEX "subscribers_created_at_idx" ON "subscribers" USING btree ("created_at");
  CREATE INDEX "volunteers_updated_at_idx" ON "volunteers" USING btree ("updated_at");
  CREATE INDEX "volunteers_created_at_idx" ON "volunteers" USING btree ("created_at");
  CREATE INDEX "contact_messages_updated_at_idx" ON "contact_messages" USING btree ("updated_at");
  CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_darshan_days_id_idx" ON "payload_locked_documents_rels" USING btree ("darshan_days_id");
  CREATE INDEX "payload_locked_documents_rels_festivals_id_idx" ON "payload_locked_documents_rels" USING btree ("festivals_id");
  CREATE INDEX "payload_locked_documents_rels_sevas_id_idx" ON "payload_locked_documents_rels" USING btree ("sevas_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_donations_id_idx" ON "payload_locked_documents_rels" USING btree ("donations_id");
  CREATE INDEX "payload_locked_documents_rels_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("subscribers_id");
  CREATE INDEX "payload_locked_documents_rels_volunteers_id_idx" ON "payload_locked_documents_rels" USING btree ("volunteers_id");
  CREATE INDEX "payload_locked_documents_rels_contact_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_messages_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_page_hero_slides_order_idx" ON "home_page_hero_slides" USING btree ("_order");
  CREATE INDEX "home_page_hero_slides_parent_id_idx" ON "home_page_hero_slides" USING btree ("_parent_id");
  CREATE INDEX "home_page_hero_slides_image_idx" ON "home_page_hero_slides" USING btree ("image_id");
  CREATE INDEX "home_page_hero_slides_video_idx" ON "home_page_hero_slides" USING btree ("video_id");
  CREATE INDEX "home_page_hero_slides_video_webm_idx" ON "home_page_hero_slides" USING btree ("video_webm_id");
  CREATE INDEX "home_page_youtube_videos_order_idx" ON "home_page_youtube_videos" USING btree ("_order");
  CREATE INDEX "home_page_youtube_videos_parent_id_idx" ON "home_page_youtube_videos" USING btree ("_parent_id");
  CREATE INDEX "home_page_about_about_image_idx" ON "home_page" USING btree ("about_image_id");
  CREATE INDEX "home_page_about_about_small_image_idx" ON "home_page" USING btree ("about_small_image_id");
  CREATE INDEX "home_page_about_about_card_image_idx" ON "home_page" USING btree ("about_card_image_id");
  CREATE INDEX "home_page_visit_image_idx" ON "home_page" USING btree ("visit_image_id");
  CREATE INDEX "home_page_founder_founder_image_idx" ON "home_page" USING btree ("founder_image_id");
  CREATE INDEX "home_page_live_puja_live_puja_image_idx" ON "home_page" USING btree ("live_puja_image_id");
  CREATE INDEX "home_page_rels_order_idx" ON "home_page_rels" USING btree ("order");
  CREATE INDEX "home_page_rels_parent_idx" ON "home_page_rels" USING btree ("parent_id");
  CREATE INDEX "home_page_rels_path_idx" ON "home_page_rels" USING btree ("path");
  CREATE INDEX "home_page_rels_sevas_id_idx" ON "home_page_rels" USING btree ("sevas_id");
  CREATE INDEX "temple_timings_open_sessions_order_idx" ON "temple_timings_open_sessions" USING btree ("_order");
  CREATE INDEX "temple_timings_open_sessions_parent_id_idx" ON "temple_timings_open_sessions" USING btree ("_parent_id");
  CREATE INDEX "temple_timings_schedule_order_idx" ON "temple_timings_schedule" USING btree ("_order");
  CREATE INDEX "temple_timings_schedule_parent_id_idx" ON "temple_timings_schedule" USING btree ("_parent_id");
  CREATE INDEX "site_settings_upi_qr_idx" ON "site_settings" USING btree ("upi_qr_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "darshan_days" CASCADE;
  DROP TABLE "darshan_days_rels" CASCADE;
  DROP TABLE "festivals_schedule" CASCADE;
  DROP TABLE "festivals" CASCADE;
  DROP TABLE "festivals_rels" CASCADE;
  DROP TABLE "sevas_preset_amounts" CASCADE;
  DROP TABLE "sevas_items" CASCADE;
  DROP TABLE "sevas" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "donations" CASCADE;
  DROP TABLE "subscribers" CASCADE;
  DROP TABLE "volunteers" CASCADE;
  DROP TABLE "contact_messages" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_page_hero_slides" CASCADE;
  DROP TABLE "home_page_youtube_videos" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "home_page_rels" CASCADE;
  DROP TABLE "temple_timings_open_sessions" CASCADE;
  DROP TABLE "temple_timings_schedule" CASCADE;
  DROP TABLE "temple_timings" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_festivals_artwork";
  DROP TYPE "public"."enum_sevas_category";
  DROP TYPE "public"."enum_sevas_artwork";
  DROP TYPE "public"."enum_services_action";
  DROP TYPE "public"."enum_courses_mode";
  DROP TYPE "public"."enum_posts_category";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_category";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_donations_frequency";
  DROP TYPE "public"."enum_donations_status";
  DROP TYPE "public"."enum_contact_messages_category";
  DROP TYPE "public"."enum_home_page_hero_slides_layout";
  DROP TYPE "public"."enum_home_page_hero_slides_tone";
  DROP TYPE "public"."enum_home_page_hero_slides_artwork";`)
}
