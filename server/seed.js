import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';

dotenv.config();

const seedData = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cache-news';
    await mongoose.connect(connStr);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing records
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    console.log('Cleared existing collection documents.');

    // Seed mock users
    const alice = await User.create({
      username: 'alice_dev',
      email: 'alice@example.com',
      password: 'password123',
      karma: 45
    });

    const bob = await User.create({
      username: 'bob_builder',
      email: 'bob@example.com',
      password: 'password123',
      karma: 22
    });

    const charlie = await User.create({
      username: 'charlie_rust',
      email: 'charlie@example.com',
      password: 'password123',
      karma: 95
    });

    console.log('Seeded developer user credentials.');

    // Seed mock posts
    const post1 = await Post.create({
      title: 'Why we rewrote our high-throughput Node.js microservice in Rust',
      url: 'https://example.com/rust-rewrite',
      content: 'We spent 6 months migrating our core analytics pipeline from Express.js to Axum in Rust. Here is a comprehensive breakdown of memory constraints, thread synchronization, and CPU usage drop.',
      author: alice._id,
      upvotes: [bob._id, charlie._id],
      upvoteCount: 2,
      tags: ['#rust', '#nodejs', '#backend', '#performance'],
      createdAt: new Date(Date.now() - 3 * 3600 * 1000) // 3 hours ago
    });

    const post2 = await Post.create({
      title: 'Building a Custom Javascript O(1) LRU Cache with TTL',
      content: 'External caches like Redis add extra network hops. Sometimes, a simple in-memory cache utilizing a Map and Doubly Linked List is all you need inside Node.js. This guide walks through Node pointer structures and lazy expiration logic.',
      author: charlie._id,
      upvotes: [alice._id],
      upvoteCount: 1,
      tags: ['#javascript', '#algorithms', '#caching', '#performance'],
      createdAt: new Date(Date.now() - 1 * 3600 * 1000) // 1 hour ago
    });

    const post3 = await Post.create({
      title: 'Show HN: Cache News - open source Hacker News clone with sub-millisecond response rates',
      url: 'https://github.com/antigravity/cache-news',
      content: 'Introducing Cache News! A MERN technology aggregator built to demonstrate Node.js memory performance using custom cache intercepts, glassmorphism UI, real-time Recharts streams, and load test loaders.',
      author: bob._id,
      upvotes: [alice._id, bob._id, charlie._id],
      upvoteCount: 3,
      tags: ['#opensource', '#react', '#vite', '#mongodb'],
      createdAt: new Date(Date.now() - 10 * 3600 * 1000) // 10 hours ago
    });

    console.log('Seeded technical stories.');

    // Seed nested comments tree
    const comment1 = await Comment.create({
      post: post1._id,
      author: bob._id,
      content: 'This is a fantastic write-up. How did your team handle the learning curve of the borrow checker in production?'
    });

    const comment2 = await Comment.create({
      post: post1._id,
      author: alice._id,
      parentComment: comment1._id,
      content: 'It was definitely a struggle for the first 2-3 weeks, but once the syntax clicked, compile-time safety allowed us to deploy with complete confidence.'
    });

    const comment3 = await Comment.create({
      post: post1._id,
      author: charlie._id,
      parentComment: comment2._id,
      content: 'Agreed. Eliminating entire classes of runtime exceptions makes the initial development tax well worth it.'
    });

    const comment4 = await Comment.create({
      post: post1._id,
      author: charlie._id,
      content: 'Interesting. For most applications, Node is still fast enough, but Rust is unmatched when scaling heavy concurrency.'
    });

    const comment5 = await Comment.create({
      post: post2._id,
      author: alice._id,
      content: 'Implementing doubly linked list nodes is a classic interview question, but applying it to cache eviction is super cool!'
    });

    console.log('Seeded recursive comment reply trees.');
    console.log('🎉 Seeding successfully completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
