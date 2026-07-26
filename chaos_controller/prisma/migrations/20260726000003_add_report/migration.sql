CREATE TABLE "Report" (
    "executionId" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "experiment" JSONB NOT NULL,
    "execution" JSONB NOT NULL,
    "resultSnapshot" JSONB NOT NULL,
    "metricsBefore" JSONB,
    "metricsAfter" JSONB,
    "analysis" JSONB NOT NULL,
    "executionSummary" TEXT NOT NULL,
    "recoveryStatus" TEXT NOT NULL,
    "observedMetricChanges" JSONB NOT NULL,
    "resilienceObservations" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("executionId")
);

ALTER TABLE "Report" ADD CONSTRAINT "Report_executionId_fkey"
    FOREIGN KEY ("executionId") REFERENCES "Result"("executionId") ON DELETE CASCADE ON UPDATE CASCADE;
