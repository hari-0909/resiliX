ALTER TABLE "Template"
    ADD COLUMN "scheduleMode" TEXT,
    ADD COLUMN "scheduledAt" TIMESTAMP(3),
    ADD COLUMN "cronExpression" TEXT,
    ADD COLUMN "scheduleStatus" TEXT;
