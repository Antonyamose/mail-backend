-- CreateTable
CREATE TABLE "full" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "deliveryTime" TEXT NOT NULL,

    CONSTRAINT "full_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "full_id_key" ON "full"("id");
