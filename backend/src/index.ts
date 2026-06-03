import express from 'express';
import cors from 'cors';
import { prisma } from './db';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Create user profile
app.post('/api/users', async (req, res) => {
  try {
    const { did, handle, birthday } = req.body

    if (!did || !handle || !birthday) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const existing = await prisma.userProfile.findUnique({ where: { did } })

    if (existing) {
      const profile = await prisma.userProfile.update({
        where: { did },
        data: { handle },
      })
      res.json(profile)
    } else {
      if (!birthday) {
        res.status(400).json({ error: 'Birthday required for new accounts' })
        return
      }

      const profile = await prisma.userProfile.create({
        data: {
          did,
          handle,
          birthday: new Date(birthday),
        },
      })
      res.json(profile)
    }
  } catch (error) {
    console.error('POST /api/users error:', error)
    res.status(500).json({ error: 'Failed to create user profile' })
  }
})

app.get('/api/users', async (req, res) => {
  const { did } = req.query
  if (!did) {
    res.status(400).json({ error: 'DID required' })
    return
  }
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { did: did as string },
    })
    if (!profile) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json(profile)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

app.get('/api/users/posts', async (req, res) => {
  const { did } = req.query
  if (!did) {
    res.status(400).json({ error: 'DID required' })
    return
  }
  try {
    const posts = await prisma.post.findMany({
      where: { authorDid: did as string },
      orderBy: { createdAt: 'desc' },
    })
    res.json(posts)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
})

app.delete('/api/users', async (req, res) => {
  const { did } = req.query
  if (!did) {
    res.status(400).json({ error: 'DID required' })
    return
  }
  try {
    await prisma.post.deleteMany({ where: { authorDid: did as string } })
    await prisma.userProfile.delete({ where: { did: did as string } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      include: { author: true },
    });
    res.json(posts);
  } catch (error) {
    console.error('GET /api/posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get a single post by ID
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(req.params.id) },
      include: { author: true, comments: true },
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

// Create post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, tags, authorDid, authorHandle, status, published } = req.body
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
    })
    res.json(post)
  } catch (error) {
    console.error('POST /api/posts error:', error)
    res.status(500).json({ error: 'Failed to create post' })
  }
})

// Public profile by handle
app.get('/api/u/:handle', async (req, res) => {
  try {
    const profile = await prisma.userProfile.findFirst({
      where: { handle: req.params.handle },
      select: {
        did: true,
        handle: true,
        createdAt: true,
        // deliberately exclude birthday and email
      },
    })
    if (!profile) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json(profile)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});