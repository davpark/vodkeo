/*
  Warnings:

  - You are about to drop the column `authorId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authorDid` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Made the column `authorDid` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "authorId",
ADD COLUMN     "authorDid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "authorId",
ALTER COLUMN "authorDid" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'approved';

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "UserProfile" (
    "did" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_did_key" ON "UserProfile"("did");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorDid_fkey" FOREIGN KEY ("authorDid") REFERENCES "UserProfile"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorDid_fkey" FOREIGN KEY ("authorDid") REFERENCES "UserProfile"("did") ON DELETE RESTRICT ON UPDATE CASCADE;
