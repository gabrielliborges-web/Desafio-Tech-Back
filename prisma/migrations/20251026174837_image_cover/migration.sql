/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Movie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "imageUrl",
ADD COLUMN     "imageCover" TEXT;
