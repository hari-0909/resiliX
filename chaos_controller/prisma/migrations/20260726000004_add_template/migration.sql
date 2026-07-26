CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "executionType" TEXT NOT NULL,
    "targetService" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "duration" INTEGER,
    "parameters" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);
