ALTER TABLE "Booking" ALTER COLUMN "start_time" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "Booking" ALTER COLUMN "end_time" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "Booking" ALTER COLUMN "created_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "Booking" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "Booking" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "Booking" ALTER COLUMN "cancelled_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "Facilities" ALTER COLUMN "created_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "Facilities" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "Facilities" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "Facilities" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "RoomFacilities" ALTER COLUMN "created_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "RoomFacilities" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "RoomFacilities" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "RoomFacilities" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "RoomPhotos" ALTER COLUMN "created_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "RoomPhotos" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "Room" ALTER COLUMN "created_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "Room" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "Room" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "Room" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "created_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp (3) with time zone;