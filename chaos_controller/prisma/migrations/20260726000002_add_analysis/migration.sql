CREATE TABLE "Analysis" (
    "executionId" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "cpuDelta" DOUBLE PRECISION,
    "memoryDelta" DOUBLE PRECISION,
    "latencyDelta" DOUBLE PRECISION,
    "errorRateDelta" DOUBLE PRECISION,
    "podRestartDelta" DOUBLE PRECISION,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("executionId")
);

ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_executionId_fkey"
    FOREIGN KEY ("executionId") REFERENCES "Result"("executionId") ON DELETE CASCADE ON UPDATE CASCADE;
