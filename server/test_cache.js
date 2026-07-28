import { LRUCache } from './cache/LRUCache.js';

async function runTests() {
  console.log('🧪 Starting Custom LRU Cache Validation Tests...\n');

  // Test 1: Capacity & Eviction
  console.log('=== Test 1: Capacity & Eviction (Capacity = 3) ===');
  const cache = new LRUCache(3);
  cache.set('a', 1);
  cache.set('b', 2);
  cache.set('c', 3);
  
  console.log('Initial stats (expected 3 items):', cache.getStats());
  
  // Access 'a' to make it most recently used
  cache.get('a');
  
  // Insert 'd' which should evict 'b' (since 'b' is the LRU item, 'a' is MRU, 'c' is next)
  console.log("Inserting key 'd'...");
  cache.set('d', 4);
  
  const valB = cache.get('b');
  const valA = cache.get('a');
  const valC = cache.get('c');
  const valD = cache.get('d');
  
  console.log(`Key 'b' (expected null): ${valB}`);
  console.log(`Key 'a' (expected 1): ${valA}`);
  console.log(`Key 'c' (expected 3): ${valC}`);
  console.log(`Key 'd' (expected 4): ${valD}`);
  
  if (valB === null && valA === 1 && valC === 3 && valD === 4) {
    console.log('✅ Test 1 Passed!');
  } else {
    console.error('❌ Test 1 Failed!');
  }
  console.log('----------------------------------------\n');

  // Test 2: TTL Expiration
  console.log('=== Test 2: Lazy TTL Expiration ===');
  const ttlCache = new LRUCache(5);
  ttlCache.set('temp', 'expires in 1s', 1); // 1s TTL
  ttlCache.set('perm', 'lasts 10s', 10);    // 10s TTL

  console.log(`Get 'temp' immediately (expected 'expires in 1s'): ${ttlCache.get('temp')}`);
  console.log('Waiting 1.5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 1500));

  const expiredTemp = ttlCache.get('temp');
  const validPerm = ttlCache.get('perm');
  
  console.log(`Get 'temp' after wait (expected null): ${expiredTemp}`);
  console.log(`Get 'perm' after wait (expected 'lasts 10s'): ${validPerm}`);
  
  if (expiredTemp === null && validPerm === 'lasts 10s') {
    console.log('✅ Test 2 Passed!');
  } else {
    console.error('❌ Test 2 Failed!');
  }
  console.log('----------------------------------------\n');

  // Test 3: Wildcard / Prefix Invalidation
  console.log('=== Test 3: Key Prefix Invalidation ===');
  const invCache = new LRUCache(10);
  invCache.set('feed:trending', 'trending_feed_data');
  invCache.set('feed:new', 'new_feed_data');
  invCache.set('post:101', 'post_101_data');
  invCache.set('post:102', 'post_102_data');

  console.log("Invalidating keys starting with prefix 'feed:'...");
  invCache.invalidate('feed:');

  const feedTrendingVal = invCache.get('feed:trending');
  const feedNewVal = invCache.get('feed:new');
  const post101Val = invCache.get('post:101');
  const post102Val = invCache.get('post:102');

  console.log(`feed:trending (expected null): ${feedTrendingVal}`);
  console.log(`feed:new (expected null): ${feedNewVal}`);
  console.log(`post:101 (expected 'post_101_data'): ${post101Val}`);
  console.log(`post:102 (expected 'post_102_data'): ${post102Val}`);

  if (feedTrendingVal === null && feedNewVal === null && post101Val === 'post_101_data' && post102Val === 'post_102_data') {
    console.log('✅ Test 3 Passed!');
  } else {
    console.error('❌ Test 3 Failed!');
  }
  console.log('\n🎉 Cache Engine validation checks complete.');
}

runTests().catch(console.error);
