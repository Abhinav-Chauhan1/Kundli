-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "tob" TEXT NOT NULL,
    "birthCity" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "timezone" TEXT NOT NULL,
    "photoUrl" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kundli" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "chartData" JSONB NOT NULL,
    "ayanamsha" TEXT NOT NULL DEFAULT 'LAHIRI',
    "chartStyle" TEXT NOT NULL DEFAULT 'NORTH',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kundli_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MilanReport" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "person1" JSONB NOT NULL,
    "person2" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MilanReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Profile_uid_idx" ON "Profile"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Kundli_profileId_key" ON "Kundli"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Kundli_shareToken_key" ON "Kundli"("shareToken");

-- CreateIndex
CREATE INDEX "MilanReport_uid_idx" ON "MilanReport"("uid");

-- AddForeignKey
ALTER TABLE "Kundli" ADD CONSTRAINT "Kundli_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
