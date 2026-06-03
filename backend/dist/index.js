"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Get all posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await db_1.prisma.post.findMany({
            where: { published: true },
            orderBy: { createdAt: 'desc' },
            include: { author: true },
        });
        res.json(posts);
    }
    catch (error) {
        console.error('GET /api/posts error:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});
// Get a single post by ID
app.get('/api/posts/:id', async (req, res) => {
    try {
        const post = await db_1.prisma.post.findUnique({
            where: { id: Number(req.params.id) },
            include: { author: true, comments: true },
        });
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});
// Create a post (temporary - no auth yet)
app.post('/api/posts', async (req, res) => {
    try {
        const { title, content, tags, authorDid, authorHandle, status, published } = req.body;
        const post = await db_1.prisma.post.create({
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
    }
    catch (error) {
        console.error('POST /api/posts error:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
