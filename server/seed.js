import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import User from './models/User.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';

// Fix: Windows DNS Client refuses TCP SRV lookups. Use Google DNS instead.
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const seedData = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cache-news';
    await mongoose.connect(connStr, { family: 4 });
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
      url: 'https://discord.com/blog/why-discord-is-switching-from-go-to-rust',
      content: 'We spent 6 months migrating our core analytics pipeline from Express.js to Axum in Rust. Here is a comprehensive breakdown of memory constraints, thread synchronization, and CPU usage drop.',
      author: alice._id,
      upvotes: [bob._id, charlie._id],
      upvoteCount: 2,
      tags: ['#rust', '#nodejs', '#backend', '#performance'],
      createdAt: new Date(Date.now() - 3 * 3600 * 1000) // 3 hours ago
    });

    const post2 = await Post.create({
      title: 'Building a Custom Javascript O(1) LRU Cache with TTL',
      url: 'https://www.geeksforgeeks.org/dsa/lru-cache-implementation-using-double-linked-lists/',
      content: 'External caches like Redis add extra network hops. Sometimes, a simple in-memory cache utilizing a Map and Doubly Linked List is all you need inside Node.js. This guide walks through Node pointer structures and lazy expiration logic.',
      author: charlie._id,
      upvotes: [alice._id],
      upvoteCount: 1,
      tags: ['#javascript', '#algorithms', '#caching', '#performance'],
      createdAt: new Date(Date.now() - 1 * 3600 * 1000) // 1 hour ago
    });

    const post3 = await Post.create({
      title: 'Show HN: Cache News - open source Hacker News clone with sub-millisecond response rates',
      url: 'https://github.com/n1ghtdev/hackernews',
      content: 'Introducing Cache News! A MERN technology aggregator built to demonstrate Node.js memory performance using custom cache intercepts, glassmorphism UI, real-time Recharts streams, and load test loaders.',
      author: bob._id,
      upvotes: [alice._id, bob._id, charlie._id],
      upvoteCount: 3,
      tags: ['#opensource', '#react', '#vite', '#mongodb'],
      createdAt: new Date(Date.now() - 10 * 3600 * 1000) // 10 hours ago
    });

    const post4 = await Post.create({
      title: 'Trump set for high-stakes talks with Zelenskyy and Netanyahu this week',
      url: 'https://www.npr.org/sections/world/',
      content: 'Both leaders are under pressure back home as they head into separate meetings: Netanyahu faces a tough reelection fight strained by his ties with Trump, while Trump faces domestic pressure to bring an unpopular war to a close. Follow ongoing coverage from NPR\'s World desk.',
      author: alice._id,
      upvotes: [bob._id],
      upvoteCount: 1,
      tags: ['#world', '#politics', '#diplomacy'],
      createdAt: new Date(Date.now() - 5 * 3600 * 1000) // 5 hours ago
    });

    const post5 = await Post.create({
      title: 'India\u2019s economy projected to grow 6.8\u20137.2% in 2026, says Finance Ministry official',
      url: 'https://www.newsonair.gov.in/page/492/?cat=state',
      content: 'The Department of Financial Services Secretary said India remains one of the fastest-growing major economies in the world, addressing a post-budget conference organized by ASSOCHAM in New Delhi.',
      author: charlie._id,
      upvotes: [alice._id, bob._id],
      upvoteCount: 2,
      tags: ['#india', '#economy', '#nationalnews'],
      createdAt: new Date(Date.now() - 7 * 3600 * 1000) // 7 hours ago
    });

    const post6 = await Post.create({
      title: 'DRDO successfully tests Solid Fuel Ducted Ramjet technology from Odisha range',
      url: 'https://www.newsonair.gov.in/page/497/?cat=state',
      content: 'The Defence Research and Development Organisation carried out a successful demonstration of the propulsion technology from the Integrated Test Range at Chandipur, placing India among a small group of nations with the capability.',
      author: bob._id,
      upvotes: [charlie._id],
      upvoteCount: 1,
      tags: ['#india', '#defense', '#nationalnews'],
      createdAt: new Date(Date.now() - 9 * 3600 * 1000) // 9 hours ago
    });

    console.log('Seeded technical and general news stories.');

    // Additional batch of posts for a fuller, scrollable feed
    const extraPostsData = [
      {
        title: 'TechCrunch: Latest startup funding rounds and product launches',
        url: 'https://techcrunch.com',
        content: 'A rolling feed of the newest funding announcements, product launches, and acquisitions across the startup and big tech world.',
        author: alice._id,
        tags: ['#startups', '#tech', '#funding'],
        hoursAgo: 2
      },
      {
        title: 'Ars Technica: Deep dives on chips, space, and software',
        url: 'https://arstechnica.com',
        content: 'Long-form technical reporting covering semiconductors, spaceflight, security research, and software engineering.',
        author: bob._id,
        tags: ['#tech', '#science', '#hardware'],
        hoursAgo: 4
      },
      {
        title: 'BBC World News: Top international headlines today',
        url: 'https://www.bbc.com/news/world',
        content: 'Ongoing coverage of major world events, from diplomacy and conflict to global economics and climate.',
        author: charlie._id,
        tags: ['#world', '#international'],
        hoursAgo: 6
      },
      {
        title: 'Reuters World: Breaking international news coverage',
        url: 'https://www.reuters.com/world/',
        content: 'Wire-service reporting on global politics, markets, and major breaking news as it happens around the world.',
        author: alice._id,
        tags: ['#world', '#news'],
        hoursAgo: 8
      },
      {
        title: 'NDTV: Latest national news from across India',
        url: 'https://www.ndtv.com/india',
        content: 'Coverage of politics, state news, and major developments happening across India today.',
        author: bob._id,
        tags: ['#india', '#nationalnews'],
        hoursAgo: 11
      },
      {
        title: 'Times of India: Top national headlines',
        url: 'https://timesofindia.indiatimes.com/india',
        content: 'National news coverage spanning politics, policy, courts, and major state-level developments across India.',
        author: charlie._id,
        tags: ['#india', '#nationalnews'],
        hoursAgo: 13
      },
      {
        title: 'Bloomberg: Markets, business, and economic news',
        url: 'https://www.bloomberg.com',
        content: 'Global business and financial market coverage, including company earnings, monetary policy, and economic indicators.',
        author: alice._id,
        tags: ['#business', '#markets', '#economy'],
        hoursAgo: 14
      },
      {
        title: 'ESPN Cricinfo: Latest cricket scores and match reports',
        url: 'https://www.espncricinfo.com',
        content: 'Live scores, match reports, and analysis covering international and domestic cricket around the world.',
        author: bob._id,
        tags: ['#sports', '#cricket'],
        hoursAgo: 15
      },
      {
        title: 'Nature News: Latest research and scientific developments',
        url: 'https://www.nature.com/news',
        content: 'Reporting on new peer-reviewed research and major developments across physics, biology, medicine, and climate science.',
        author: charlie._id,
        tags: ['#science', '#research'],
        hoursAgo: 17
      },
      {
        title: 'Variety: Entertainment industry news and reviews',
        url: 'https://variety.com',
        content: 'Coverage of film, television, and streaming industry news, box office numbers, and reviews.',
        author: bob._id,
        tags: ['#entertainment', '#movies'],
        hoursAgo: 18
      }
    ];

    const extraPosts = [];
    for (const data of extraPostsData) {
      const { hoursAgo, ...postFields } = data;
      const created = await Post.create({
        ...postFields,
        upvotes: [],
        upvoteCount: Math.floor(Math.random() * 15),
        createdAt: new Date(Date.now() - hoursAgo * 3600 * 1000)
      });
      extraPosts.push(created);
    }

    console.log(`Seeded ${extraPosts.length} additional general-interest posts.`);


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

    const comment6 = await Comment.create({
      post: post4._id,
      author: charlie._id,
      content: 'Both leaders have a lot riding on this. Curious how the domestic pressure back home shapes what actually gets agreed to.'
    });

    const comment7 = await Comment.create({
      post: post5._id,
      author: alice._id,
      content: 'Growth projections like this always sound great on paper - would love to see the sector-wise breakdown.'
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