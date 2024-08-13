/*
  Warnings:

  - You are about to drop the `full` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "full";

-- CreateTable
CREATE TABLE "Full" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "deliveryTime" TEXT NOT NULL,

    CONSTRAINT "Full_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Full_id_key" ON "Full"("id");
