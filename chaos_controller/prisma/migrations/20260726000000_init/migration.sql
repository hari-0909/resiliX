CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "chaosType" TEXT NOT NULL,
    "target" JSONB NOT NULL,
    "mode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Execution" (
    "id" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "queuedAt" TIMESTAMP(3),

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Result" (
    "executionId" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("executionId")
);
