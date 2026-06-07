import express from 'express';
import cors from 'cors';
import { prisma } from './db';
import { Resend } from 'resend'

const app = express();
const PORT = process.env.PORT || 5000;
const resend = new Resend(process.env.RESEND_API_KEY)

app.use(cors());
app.use(express.json());

async function requireAdmin(req: express.Request, res: express.Response): Promise<string | null> {
  const did = (req.query.did || req.body?.did) as string | undefined;
  if (!did) {
    res.status(401).json({ error: 'DID required' });
    return null;
  }
  const user = await prisma.userProfile.findUnique({ where: { did } });
  if (!user?.isAdmin) {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }
  return did;
}

async function recalculateScore(postId: number) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { comments: true },
  });
  if (!post) return;
  const ageInHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
  const score = (post.comments.length * 2 + post.views) / Math.pow(ageInHours + 2, 1.5);
  await prisma.post.update({ where: { id: postId }, data: { score } });
}

app.post('/api/users', async (req, res) => {
  try {
    const { did, handle, birthday } = req.body;

    if (!did || !handle || !birthday) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const existing = await prisma.userProfile.findUnique({ where: { did } });

    if (existing) {
      const profile = await prisma.userProfile.update({
        where: { did },
        data: { handle },
      });
      res.json(profile);
    } else {
      const profile = await prisma.userProfile.create({
        data: { did, handle, birthday: new Date(birthday) },
      });
      res.json(profile);
    }
  } catch (error) {
    console.error('POST /api/users error:', error);
    res.status(500).json({ error: 'Failed to create user profile' });
  }
});

app.get('/api/users', async (req, res) => {
  const { did } = req.query;
  if (!did) {
    res.status(400).json({ error: 'DID required' });
    return;
  }
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { did: did as string },
    });
    if (!profile) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.get('/api/users/posts', async (req, res) => {
  const { did } = req.query;
  if (!did) {
    res.status(400).json({ error: 'DID required' });
    return;
  }
  try {
    const posts = await prisma.post.findMany({
      where: { authorDid: did as string, deleted: false },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.delete('/api/users', async (req, res) => {
  const { did } = req.query;
  if (!did) {
    res.status(400).json({ error: 'DID required' });
    return;
  }
  try {
    await prisma.comment.deleteMany({ where: { authorDid: did as string } });
    await prisma.post.deleteMany({ where: { authorDid: did as string } });
    await prisma.userProfile.delete({ where: { did: did as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Public profile by handle
app.get('/api/u/:handle', async (req, res) => {
  try {
    const profile = await prisma.userProfile.findFirst({
      where: { handle: req.params.handle },
      select: { did: true, handle: true, createdAt: true },
    });
    if (!profile) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

const POST_SELECT = {
  id: true,
  title: true,
  content: true,
  published: true,
  status: true,
  tags: true,
  authorDid: true,
  authorHandle: true,
  createdAt: true,
  deleted: true,
  author: true,
  _count: { select: { comments: true } },
} as const;

app.get('/api/posts', async (req, res) => {
  try {
    const { tag, sort } = req.query;
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        deleted: false,
        ...(tag === 'news'
          ? { tags: { has: 'news' } }
          : {
              NOT: { tags: { has: 'news' } },
              ...(tag ? { tags: { has: tag as string } } : {}),
            }),
      },
      orderBy: sort === 'popular' ? { score: 'desc' } : { createdAt: 'desc' },
      select: POST_SELECT,
    });
    res.json(posts);
  } catch (error) {
    console.error('GET /api/posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.get('/api/posts/top', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true, deleted: false },
      orderBy: { score: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        authorHandle: true,
        score: true,
        _count: { select: { comments: true } },
      },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top posts' });
  }
});

app.get('/api/posts/random', async (req, res) => {
  try {
    const count = await prisma.post.count({ where: { published: true, deleted: false } });
    if (count === 0) {
      res.status(404).json({ error: 'No posts found' });
      return;
    }
    const post = await prisma.post.findFirst({
      where: { published: true, deleted: false },
      skip: Math.floor(Math.random() * count),
    });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch random post' });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(req.params.id) },
      select: { ...POST_SELECT, comments: true },
    });
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, tags, authorDid, authorHandle, status, published } = req.body;

    if (Array.isArray(tags) && tags.includes('news')) {
      const user = await prisma.userProfile.findUnique({ where: { did: authorDid } });
      if (!user?.isAdmin) {
        res.status(403).json({ error: 'The "news" tag is restricted to admins.' });
        return;
      }
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        tags: tags || [],
        authorDid,
        authorHandle,
        status: status || 'approved',
        published: published ?? true,
      },
    });
    res.json(post);
  } catch (error) {
    console.error('POST /api/posts error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.post('/api/posts/:id/view', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } });
    await recalculateScore(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to increment view' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { authorDid } = req.body
    const post = await prisma.post.findUnique({
      where: { id: Number(req.params.id) },
    })

    if (!post) {
      res.status(404).json({ error: 'Post not found' })
      return
    }

    if (post.authorDid !== authorDid) {
      res.status(403).json({ error: 'Not authorized to delete this post' })
      return
    }

    await prisma.post.update({
      where: { id: Number(req.params.id) },
      data: {
        deleted: true,
        title: '[deleted]',
        content: '[deleted]',
        tags: [],
        authorHandle: null,
      },
    })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' })
  }
})

app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: Number(req.params.id) },
      orderBy: { createdAt: 'asc' },
      include: { author: true, parent: { include: { author: true } } },
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

app.get('/api/users/comments', async (req, res) => {
  const { did } = req.query
  if (!did) {
    res.status(400).json({ error: 'DID required' })
    return
  }
  try {
    const comments = await prisma.comment.findMany({
      where: { authorDid: did as string },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          select: { id: true, title: true, deleted: true }
        },
        parent: {
          include: { author: true }
        }
      }
    })
    res.json(comments)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const { content, authorDid, authorHandle, parentId } = req.body;

    if (!content || !authorDid || !authorHandle) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (content.length > 500) {
      res.status(400).json({ error: 'Comment must be 500 characters or fewer' });
      return;
    }

    const postId = Number(req.params.id);
    const comment = await prisma.comment.create({
      data: {
        content,
        post: { connect: { id: postId } },
        author: { connect: { did: authorDid } },
        ...(parentId ? { parent: { connect: { id: Number(parentId) } } } : {}),
      },
      include: { author: true, parent: { include: { author: true } } },
    });

    await recalculateScore(postId);
    res.json(comment);
  } catch (error) {
    console.error('POST /api/posts/:id/comments error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

app.delete('/api/comments/:id', async (req, res) => {
  try {
    const { authorDid } = req.body;
    const comment = await prisma.comment.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.authorDid !== authorDid) {
      res.status(403).json({ error: 'Not authorized to delete this comment' });
      return;
    }

    await prisma.comment.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

app.get('/api/tags', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true, deleted: false },
      select: { tags: true },
    });

    const tagCount: Record<string, number> = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const sorted = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));

    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { q, scope } = req.query;
    if (!q) {
      res.json([]);
      return;
    }

    const query = (q as string).toLowerCase();

    const scopeFilters: Record<string, object> = {
      tags: { tags: { has: query } },
      users: { authorHandle: { contains: query, mode: 'insensitive' } },
      posts: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
    };

    const where = {
      published: true,
      deleted: false,
      ...(scopeFilters[scope as string] ?? {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { authorHandle: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      }),
    };

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { author: true },
    });

    res.json(posts);
  } catch (error) {
    console.error('GET /api/search error:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

app.get('/api/admin/me', async (req, res) => {
  const did = req.query.did as string | undefined;
  if (!did) {
    res.status(400).json({ error: 'DID required' });
    return;
  }
  try {
    const user = await prisma.userProfile.findUnique({ where: { did } });
    res.json({ isAdmin: user?.isAdmin ?? false });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check admin status' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});