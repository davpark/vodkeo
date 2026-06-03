-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "authorDid" TEXT,
ADD COLUMN     "authorHandle" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
