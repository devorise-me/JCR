-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SUPERVISOR', 'USER', 'RESULTS_EDITOR');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "Age" AS ENUM ('GradeOne', 'GradeTwo', 'GradeThree', 'GradeFour', 'GradeFive', 'GradeSixMale', 'GradeSixFemale');

-- CreateEnum
CREATE TYPE "Time" AS ENUM ('Morning', 'Evening');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "FirstName" TEXT,
    "FatherName" TEXT,
    "GrandFatherName" TEXT,
    "FamilyName" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "NationalID" TEXT,
    "BDate" TIMESTAMP(3),
    "MobileNumber" TEXT,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "role" "Role" DEFAULT 'USER',
    "swiftCode" TEXT,
    "bankName" TEXT,
    "IBAN" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Camel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "camelID" TEXT NOT NULL,
    "age" "Age" NOT NULL,
    "sex" "Sex" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Camel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "StartDate" TIMESTAMP(3) NOT NULL,
    "EndDate" TIMESTAMP(3) NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'International',

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loop" (
    "id" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "registered" SERIAL NOT NULL,
    "age" "Age" NOT NULL,
    "sex" "Sex" NOT NULL,
    "time" "Time" NOT NULL,
    "startRegister" TIMESTAMP(3) NOT NULL,
    "endRegister" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "rank" INTEGER,

    CONSTRAINT "Loop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CamelLoop" (
    "id" TEXT NOT NULL,
    "camelId" INTEGER NOT NULL,
    "loopId" TEXT NOT NULL,
    "registeredDate" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CamelLoop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaceResult" (
    "id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "eventId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "camelId" INTEGER NOT NULL,
    "loopId" TEXT NOT NULL,
    "IBAN" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "swiftCode" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "NationalID" TEXT,
    "camelID" TEXT,

    CONSTRAINT "RaceResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CamelHistory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "camelID" TEXT,
    "age" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "ownerId" TEXT,
    "Date" TIMESTAMP(6),
    "typeOfMethode" TEXT,

    CONSTRAINT "CamelHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" VARCHAR(36) NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(6) NOT NULL,
    "author_id" VARCHAR(36) NOT NULL,
    "startDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads" (
    "id" VARCHAR(36) NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(6) NOT NULL,
    "author_id" VARCHAR(36) NOT NULL,
    "startDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contactPage" (
    "id" VARCHAR(36) NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "author_id" VARCHAR(36),

    CONSTRAINT "contactPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActivity" (
    "id" VARCHAR(36) NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "element" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "details" CHAR[],
    "timestamp" DATE,

    CONSTRAINT "AdminActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adsconfig" (
    "id" SERIAL NOT NULL,
    "apikey" CHAR(1),
    "apisecret" CHAR(1),
    "cloudname" CHAR(1),
    "apiendpoint" CHAR(1),
    "updatedat" DATE,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_NationalID_key" ON "User"("NationalID");

-- CreateIndex
CREATE UNIQUE INDEX "User_IBAN_key" ON "User"("IBAN");

-- CreateIndex
CREATE UNIQUE INDEX "Camel_camelID_key" ON "Camel"("camelID");

-- CreateIndex
CREATE UNIQUE INDEX "CamelLoop_camelId_loopId_key" ON "CamelLoop"("camelId", "loopId");

-- AddForeignKey
ALTER TABLE "Camel" ADD CONSTRAINT "Camel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loop" ADD CONSTRAINT "Loop_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CamelLoop" ADD CONSTRAINT "CamelLoop_camelId_fkey" FOREIGN KEY ("camelId") REFERENCES "Camel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CamelLoop" ADD CONSTRAINT "CamelLoop_loopId_fkey" FOREIGN KEY ("loopId") REFERENCES "Loop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceResult" ADD CONSTRAINT "RaceResult_camelId_fkey" FOREIGN KEY ("camelId") REFERENCES "Camel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceResult" ADD CONSTRAINT "RaceResult_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceResult" ADD CONSTRAINT "RaceResult_loopId_fkey" FOREIGN KEY ("loopId") REFERENCES "Loop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceResult" ADD CONSTRAINT "RaceResult_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CamelHistory" ADD CONSTRAINT "fk_loops_loop_id" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "fk_author" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ads" ADD CONSTRAINT "fk_author_ads" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contactPage" ADD CONSTRAINT "fk_contact_author" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AdminActivity" ADD CONSTRAINT "AdminActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

