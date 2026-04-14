import { randomUUID } from 'crypto';
import { Router, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { ok, created, fail, notFound, paginated, parsePage } from '../../utils';
import { logger } from '../../config/logger';

const router = Router();
router.use(authenticate);

// ─── MULTER SETUP ─────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'videos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unique = randomUUID();
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5GB
  fileFilter: (_req, file, cb) => {
    const allowed = /video\/(mp4|webm|quicktime|x-msvideo|x-matroska)|application\/octet-stream/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only video files are allowed'));
  },
});

// ─── LIST VIDEOS ──────────────────────────────────────────────────────────────

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, platform, social_account_id, status } = req.query as Record<string, string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }

  const { page, limit, skip } = parsePage(req.query);
  const where: any = {
    workspace_id,
    ...(platform           && { platform: platform as any }),
    ...(social_account_id  && { social_account_id }),
    ...(status             && { status }),
  };

  const [total, videos] = await Promise.all([
    db.video.count({ where }),
    db.video.findMany({
      where,
      include: {
        _count: { select: { comments: true } },
      },
      orderBy: { created_at: 'desc' },
      skip, take: limit,
    }),
  ]);

  paginated(res, videos, total, page, limit);
});

// ─── GET ONE ──────────────────────────────────────────────────────────────────

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const video = await db.video.findUnique({
    where: { id: req.params.id },
    include: { comments: { orderBy: { commented_at: 'desc' }, take: 50 } },
  });
  if (!video) { notFound(res, 'Video'); return; }
  ok(res, video);
});

// ─── UPLOAD VIDEO (VideoUploader component) ───────────────────────────────────

router.post('/upload', upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, platform, social_account_id, title, description, tags } = req.body;
  if (!workspace_id || !platform) { fail(res, 'workspace_id and platform required'); return; }

  let file_url: string | null = null;
  if (req.file) {
    file_url = `/uploads/videos/${req.file.filename}`;
  }

  const video = await db.video.create({
    data: {
      workspace_id,
      platform: platform as any,
      social_account_id: social_account_id ?? null,
      title: title ?? req.file?.originalname ?? 'Untitled Video',
      description: description ?? null,
      file_url,
      file_size_bytes: req.file?.size ? BigInt(req.file.size) : null,
      status: 'processing',
      tags: tags ? JSON.parse(tags) : [],
      created_by: req.user!.userId,
    },
  });

  // Queue video processing (thumbnail generation, transcoding)
  await syncQueue.add({ type: 'video_process', videoId: video.id, workspace_id: video.workspace_id }).catch(() => null);
  // await videoProcessingQueue.add({ videoId: video.id });
  logger.info(`Video uploaded: ${video.id} for platform ${platform}`);

  created(res, video);
});

// ─── CREATE VIDEO RECORD (metadata only, no file) ────────────────────────────

const createZ = z.object({
  workspace_id:      z.string().cuid(),
  platform:          z.string(),
  social_account_id: z.string().cuid().optional(),
  title:             z.string().min(1).max(300),
  description:       z.string().max(5000).optional(),
  tags:              z.array(z.string()).optional(),
  status:            z.string().optional(),
  platform_video_id: z.string().optional(),
  platform_url:      z.string().url().optional(),
  thumbnail_url:     z.string().url().optional(),
  metadata:          z.record(z.unknown()).optional(),
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const p = createZ.safeParse(req.body);
  if (!p.success) { fail(res, p.error.errors[0].message); return; }

  const video = await db.video.create({
    data: {
      ...p.data,
      platform: p.data.platform as any,
      tags: p.data.tags ?? [],
      status: p.data.status ?? 'published',
      metadata: p.data.metadata as any ?? null,
      created_by: req.user!.userId,
    },
  });

  created(res, video);
});

// ─── UPDATE ───────────────────────────────────────────────────────────────────

router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const video = await db.video.update({
    where: { id: req.params.id },
    data: { ...req.body, published_at: req.body.published_at ? new Date(req.body.published_at) : undefined },
  });
  ok(res, video);
});

// ─── DELETE ───────────────────────────────────────────────────────────────────

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const video = await db.video.findUnique({ where: { id: req.params.id }, select: { file_url: true } });
  if (!video) { notFound(res, 'Video'); return; }

  // Delete local file if it exists
  if (video.file_url?.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), video.file_url);
    fs.unlink(filePath, () => null); // non-blocking, ignore errors
  }

  await db.video.delete({ where: { id: req.params.id } });
  ok(res, { deleted: true });
});

// ─── VIDEO STATS ──────────────────────────────────────────────────────────────

router.get('/stats/summary', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, platform } = req.query as Record<string, string>;
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }

  const where: any = { workspace_id, ...(platform && { platform: platform as any }) };

  const [total, byStatus, agg] = await Promise.all([
    db.video.count({ where }),
    db.video.groupBy({ by: ['status'], where, _count: { id: true } }),
    db.video.aggregate({ where, _sum: { views: true, likes: true, comments_count: true } }),
  ]);

  ok(res, {
    total,
    by_status: byStatus,
    total_views:    agg._sum.views    ?? 0,
    total_likes:    agg._sum.likes    ?? 0,
    total_comments: agg._sum.comments_count ?? 0,
  });
});

// ─── DOWNLOAD (VideoDownloader component) ────────────────────────────────────
// Marks a platform video as "saved" in our system

router.post('/:id/download', async (req: AuthRequest, res: Response): Promise<void> => {
  const { download_url, format } = req.body as { download_url?: string; format?: string };
  const video = await db.video.findUnique({ where: { id: req.params.id } });
  if (!video) { notFound(res, 'Video'); return; }

  // Record that this video was downloaded
  const updated = await db.video.update({
    where: { id: req.params.id },
    data: {
      status: 'downloading',
      metadata: { ...(video.metadata as any ?? {}), download_url, format, downloaded_at: new Date().toISOString() },
    },
  });

  // Queue video download job for large files
  await syncQueue.add({ type: 'video_download', videoId: req.params.id, url: video.platform_url, workspace_id: video.workspace_id }).catch(() => null);
  ok(res, { queued: true, video: updated });
});

export default router;
