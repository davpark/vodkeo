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
    await prisma.comment.deleteMany({ where: { authorDid: did as string } })
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
    const { tag, sort } = req.query

    const posts = await prisma.post.findMany({
      where: {
        published: true,
        ...(tag ? { tags: { has: tag as string } } : {}),
      },
      orderBy: sort === 'popular'
        ? { score: 'desc' }
        : { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        status: true,
        tags: true,
        authorDid: true,
        authorHandle: true,
        createdAt: true,
        author: true,
      },
    })
    res.json(posts)
  } catch (error) {
    console.error('GET /api/posts error:', error)
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
})

app.post('/api/posts/:id/view', async (req, res) => {
  try {
    const id = Number(req.params.id)

    const post = await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: { comments: true },
    })

    // Recalculate score
    const ageInHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60)
    const score = (post.comments.length * 2 + post.views * 1) / Math.pow(ageInHours + 2, 1.5)

    await prisma.post.update({
      where: { id },
      data: { score },
    })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to increment view' })
  }
})

// Get a random post
app.get('/api/posts/random', async (req, res) => {
  try {
    const count = await prisma.post.count({ where: { published: true } })
    if (count === 0) {
      res.status(404).json({ error: 'No posts found' })
      return
    }
    const skip = Math.floor(Math.random() * count)
    const post = await prisma.post.findFirst({
      where: { published: true },
      skip,
    })
    res.json(post)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch random post' })
  }
})

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(req.params.id) },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        status: true,
        tags: true,
        authorDid: true,
        authorHandle: true,
        createdAt: true,
        author: true,
        comments: true,
      },
    })
    if (!post) {
      res.status(404).json({ error: 'Post not found' })
      return
    }
    res.json(post)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' })
  }
})

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

app.get('/api/tags', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { tags: true },
    })

    // Count tag frequency
    const tagCount: Record<string, number> = {}
    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      })
    })

    // Sort by frequency
    const sorted = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }))

    res.json(sorted)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' })
  }
})

app.get('/api/search', async (req, res) => {
  try {
    const { q, scope } = req.query
    if (!q) {
      res.json([])
      return
    }

    const query = (q as string).toLowerCase()

    if (scope === 'tags') {
      const posts = await prisma.post.findMany({
        where: {
          published: true,
          tags: { has: query },
        },
        orderBy: { createdAt: 'desc' },
        include: { author: true },
      })
      res.json(posts)
      return
    }

    if (scope === 'users') {
      const posts = await prisma.post.findMany({
        where: {
          published: true,
          authorHandle: { contains: query, mode: 'insensitive' },
        },
        orderBy: { createdAt: 'desc' },
        include: { author: true },
      })
      res.json(posts)
      return
    }

    if (scope === 'posts') {
      const posts = await prisma.post.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: { author: true },
      })
      res.json(posts)
      return
    }

    // Default: all
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { authorHandle: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { author: true },
    })
    res.json(posts)
  } catch (error) {
    console.error('GET /api/search error:', error)
    res.status(500).json({ error: 'Failed to search' })
  }
})

// Get comments for a post
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: Number(req.params.id) },
      orderBy: { createdAt: 'asc' },
      include: {
        author: true,
        parent: {
          include: { author: true }
        },
      },
    })
    res.json(comments)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

// Create a comment
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const { content, authorDid, authorHandle, parentId } = req.body

    if (!content || !authorDid || !authorHandle) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    if (content.length > 500) {
      res.status(400).json({ error: 'Comment must be 500 characters or fewer' })
      return
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        post: { connect: { id: Number(req.params.id) } },
        author: { connect: { did: authorDid } },
        ...(parentId ? { parent: { connect: { id: Number(parentId) } } } : {}),
      },
      include: {
        author: true,
        parent: {
          include: { author: true }
        },
      },
    })

    // Recalculate post score
    const post = await prisma.post.findUnique({
      where: { id: Number(req.params.id) },
      include: { comments: true },
    })
    if (post) {
      const ageInHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60)
      const score = (post.comments.length * 2 + post.views * 1) / Math.pow(ageInHours + 2, 1.5)
      await prisma.post.update({ where: { id: post.id }, data: { score } })
    }

    res.json(comment)
  } catch (error) {
    console.error('POST /api/posts/:id/comments error:', error)
    res.status(500).json({ error: 'Failed to create comment' })
  }
})

// Delete a comment
app.delete('/api/comments/:id', async (req, res) => {
  try {
    const { authorDid } = req.body
    const comment = await prisma.comment.findUnique({
      where: { id: Number(req.params.id) },
    })

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' })
      return
    }

    if (comment.authorDid !== authorDid) {
      res.status(403).json({ error: 'Not authorized to delete this comment' })
      return
    }

    await prisma.comment.delete({ where: { id: Number(req.params.id) } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});