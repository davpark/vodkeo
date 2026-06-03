import express from 'express';
import cors from 'cors';
import { prisma } from './db';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

// Create a post (temporary - no auth yet)
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});