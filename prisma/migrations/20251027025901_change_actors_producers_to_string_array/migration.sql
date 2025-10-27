/*
  Warnings:

  - The `actors` column on the `Movie` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `producers` column on the `Movie` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "actors",
ADD COLUMN     "actors" TEXT[],
DROP COLUMN "producers",
ADD COLUMN     "producers" TEXT[];
