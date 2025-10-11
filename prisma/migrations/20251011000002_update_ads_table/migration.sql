-- AlterTable
ALTER TABLE "ads" DROP COLUMN "date";

-- AlterTable
ALTER TABLE "ads" ADD COLUMN "image" TEXT,
ADD COLUMN "isPinned" BOOLEAN NOT NULL DEFAULT false;
