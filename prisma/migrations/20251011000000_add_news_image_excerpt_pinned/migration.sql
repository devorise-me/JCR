-- AlterTable
ALTER TABLE "news" DROP COLUMN "date";

-- AlterTable
ALTER TABLE "news" ADD COLUMN "excerpt" VARCHAR(500),
ADD COLUMN "image" TEXT,
ADD COLUMN "isPinned" BOOLEAN NOT NULL DEFAULT false;
