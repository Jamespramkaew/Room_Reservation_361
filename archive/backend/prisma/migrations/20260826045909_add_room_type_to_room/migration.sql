-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('LAB', 'LECTURE', 'MEETING');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "room_type" "RoomType" NOT NULL DEFAULT 'LECTURE';
