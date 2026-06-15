-- AlterTable
ALTER TABLE "NewsItem" ADD COLUMN     "overallScore" INTEGER,
ADD COLUMN     "seoScore" INTEGER,
ADD COLUMN     "trustScore" INTEGER;

-- CreateTable
CREATE TABLE "WordpressConnection" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "baseUrl" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "appPasswordEnc" TEXT NOT NULL,
    "defaultCategory" TEXT,
    "defaultTags" JSONB,
    "uploadStatus" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordpressConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YoutubeChannel" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "channelName" TEXT NOT NULL DEFAULT 'XRP Deutschland',
    "handle" TEXT NOT NULL DEFAULT '@xrpdeutschland',
    "channelUrl" TEXT NOT NULL DEFAULT 'https://youtube.com/@xrpdeutschland',
    "channelId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YoutubeChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedVideo" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channelId" TEXT,
    "articleId" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedVideo_videoId_key" ON "ProcessedVideo"("videoId");

-- CreateIndex
CREATE INDEX "ProcessedVideo_processedAt_idx" ON "ProcessedVideo"("processedAt");

-- AddForeignKey
ALTER TABLE "ProcessedVideo" ADD CONSTRAINT "ProcessedVideo_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;
