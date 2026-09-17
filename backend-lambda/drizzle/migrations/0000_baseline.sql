CREATE TYPE "public"."BookingStatus" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."BookingType" AS ENUM('CLASS', 'SCHEDULE', 'SPECIAL_EVENT', 'STUDENT_BOOKING');--> statement-breakpoint
CREATE TYPE "public"."RoomSize" AS ENUM('SMALL', 'MEDIUM', 'LARGE');--> statement-breakpoint
CREATE TYPE "public"."RoomStatus" AS ENUM('AVAILABLE', 'MAINTENANCE', 'RESERVED');--> statement-breakpoint
CREATE TYPE "public"."RoomType" AS ENUM('LAB', 'LECTURE', 'MEETING');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('STUDENT', 'ADMIN');--> statement-breakpoint
CREATE TABLE "Booking" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"room_id" text NOT NULL,
	"booking_type" "BookingType" NOT NULL,
	"title" text,
	"start_time" timestamp (3) NOT NULL,
	"end_time" timestamp (3) NOT NULL,
	"status" "BookingStatus" DEFAULT 'PENDING' NOT NULL,
	"remark" text,
	"cancelled_by" text,
	"cancel_reason" text,
	"created_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"cancelled_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "Example" (
	"id" text PRIMARY KEY NOT NULL,
	"author" text NOT NULL,
	"comment" text DEFAULT 'Hello world!' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Facilities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "RoomFacilities" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"facility_id" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"broken_quantity" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"note" text,
	"created_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "RoomPhotos" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"object_key" text NOT NULL,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Room" (
	"id" text PRIMARY KEY NOT NULL,
	"room_name" text NOT NULL,
	"description" text,
	"seat_capacity" integer NOT NULL,
	"status" "RoomStatus" NOT NULL,
	"size" "RoomSize" NOT NULL,
	"created_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"deleted_at" timestamp (3),
	"room_type" "RoomType" DEFAULT 'LECTURE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "UserRole" DEFAULT 'STUDENT' NOT NULL,
	"email" text,
	"created_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	"deleted_at" timestamp (3)
);
--> statement-breakpoint
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."Room"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "RoomFacilities" ADD CONSTRAINT "RoomFacilities_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."Room"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "RoomFacilities" ADD CONSTRAINT "RoomFacilities_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."Facilities"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "RoomPhotos" ADD CONSTRAINT "RoomPhotos_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."Room"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "Example_author_key" ON "Example" USING btree ("author" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Facilities_name_key" ON "Facilities" USING btree ("name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "RoomFacilities_room_id_facility_id_key" ON "RoomFacilities" USING btree ("room_id" text_ops,"facility_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Room_room_name_key" ON "Room" USING btree ("room_name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_username_key" ON "User" USING btree ("username" text_ops);