-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('QUEUED', 'RESEARCHING', 'GENERATING', 'DRAFT', 'REVIEW', 'PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('YOUTUBE', 'NEWS', 'MANUAL');

-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('XRP', 'BITCOIN', 'CRYPTO', 'FINANCE', 'MACRO');

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'QUEUED',
    "sourceType" "SourceType" NOT NULL,
    "sourceUrl" TEXT,
    "sourceTitle" TEXT,
    "seoTitle" TEXT,
    "seoSubheadline" TEXT,
    "slug" TEXT,
    "highlights" JSONB,
    "introduction" TEXT,
    "body" TEXT,
    "conclusion" TEXT,
    "metaDescription" TEXT,
    "keywords" JSONB,
    "semanticKeywords" JSONB,
    "faq" JSONB,
    "schemaMarkup" JSONB,
    "internalLinks" JSONB,
    "externalLinks" JSONB,
    "seoScore" INTEGER,
    "wpTags" JSONB,
    "wpCategories" JSONB,
    "wordpressPostId" INTEGER,
    "wordpressUrl" TEXT,
    "wordpressStatus" TEXT,
    "socialSnippet" TEXT,
    "twitterSnippet" TEXT,
    "featuredImagePrompt" TEXT,
    "thumbnailPrompt" TEXT,
    "xPostImagePrompt" TEXT,
    "instagramImagePrompt" TEXT,
    "researchSummary" JSONB,
    "wordCount" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "category" "NewsCategory" NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relevanceScore" INTEGER,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "isFakeNews" BOOLEAN NOT NULL DEFAULT false,
    "articleId" TEXT,

    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_status_idx" ON "Article"("status");

-- CreateIndex
CREATE INDEX "Article_sourceType_idx" ON "Article"("sourceType");

-- CreateIndex
CREATE UNIQUE INDEX "NewsItem_url_key" ON "NewsItem"("url");

-- CreateIndex
CREATE INDEX "NewsItem_category_idx" ON "NewsItem"("category");

-- CreateIndex
CREATE INDEX "NewsItem_fetchedAt_idx" ON "NewsItem"("fetchedAt");

-- CreateIndex
CREATE INDEX "AutomationLog_createdAt_idx" ON "AutomationLog"("createdAt");

-- AddForeignKey
ALTER TABLE "NewsItem" ADD CONSTRAINT "NewsItem_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;
