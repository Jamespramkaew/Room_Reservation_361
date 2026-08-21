-- CreateTable
CREATE TABLE "Example" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "comment" TEXT NOT NULL DEFAULT 'Hello world!',

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Example_author_key" ON "Example"("author");
