const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const crypto = require('node:crypto');

function excerpt(file, start, end) {
  const source = readFileSync(path.join(__dirname, '..', 'docs', file), 'utf8');
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  assert.ok(from >= 0 && to > from, `Cannot locate example in ${file}`);
  return source.slice(from, to);
}

function evaluate(code, expression, globals = {}) {
  return vm.runInNewContext(`${code}\n${expression}`, globals);
}

test('cache requests share work, preserve false values, and retry after failure', async () => {
  const code = excerpt('caching.mdx', 'class StampedeProtectedCache {', '\n```');
  const entries = new Map();
  const cache = evaluate(code, 'new StampedeProtectedCache(adapter)', {
    adapter: {
      get: async (key) => (entries.has(key) ? entries.get(key) : null),
      set: async (key, value) => entries.set(key, value),
    },
  });
  let calls = 0;
  const compute = async () => {
    calls++;
    await new Promise((resolve) => setImmediate(resolve));
    return false;
  };
  assert.deepEqual(
    await Promise.all(Array.from({ length: 20 }, () => cache.getOrCompute('shared', compute))),
    Array(20).fill(false),
  );
  assert.equal(calls, 1);
  assert.equal(await cache.getOrCompute('shared', compute), false);
  assert.equal(calls, 1);
  await assert.rejects(
    cache.getOrCompute('retry', async () => {
      throw new Error('temporary failure');
    }),
  );
  assert.equal(await cache.getOrCompute('retry', async () => 42), 42);
  assert.equal(cache.pendingRequests.size, 0);
  assert.equal(await cache.getOrCompute('another', async () => 7), 7);
});

test('cache serialization preserves dates, maps, and nested dates', () => {
  const code = excerpt('caching.mdx', 'class CacheSerializer {', "\nawait cache.set('user', CacheSerializer");
  const serializer = evaluate(code, 'CacheSerializer', { Date, Map });
  const value = {
    createdAt: new Date('2026-09-30T12:00:00Z'),
    settings: new Map([['updatedAt', new Date('2026-01-01')]]),
  };
  const roundTrip = serializer.deserialize(serializer.serialize(value));
  assert.equal(roundTrip.createdAt.toISOString(), value.createdAt.toISOString());
  assert.ok(roundTrip.settings instanceof Map);
  assert.equal(roundTrip.settings.get('updatedAt').toISOString(), value.settings.get('updatedAt').toISOString());
  assert.equal(
    serializer.deserialize(serializer.serialize(value.createdAt)).toISOString(),
    value.createdAt.toISOString(),
  );
});

test('webhook signatures reject malformed or tampered input without throwing', () => {
  const code = excerpt(
    'api-design-patterns.mdx',
    'function verifySignature(rawBody, signature) {',
    '\n// Receive webhook',
  );
  const secret = 'example-test-secret';
  const verify = evaluate(code, 'verifySignature', { crypto, Buffer, WEBHOOK_SECRET: secret });
  const body = Buffer.from('{"event":"payment.completed"}');
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
  assert.equal(verify(body, signature), true);
  assert.equal(verify(body, signature.toUpperCase()), true);
  for (const invalid of [undefined, '', 'short', 'g'.repeat(64), 123, ['a']]) {
    assert.equal(verify(body, invalid), false);
  }
  assert.equal(verify(Buffer.from('{ "event":"payment.completed"}'), signature), false);
  assert.equal(verify(body.toString(), signature), false);
});

test('request validation enforces number limits without losing zero or mixing sources', () => {
  const code = excerpt('security-best-practices.mdx', 'function validateRequest(schema, source', '\n// Usage');
  const validate = evaluate(code, 'validateRequest');
  const middleware = validate({ age: { required: true, type: 'number', min: 0, max: 120 } });
  function accepts(body, query = {}) {
    let accepted = false;
    const response = { status: () => response, json: () => undefined };
    middleware({ body, query }, response, () => {
      accepted = true;
    });
    return accepted;
  }
  assert.equal(accepts({ age: 0 }), true);
  assert.equal(accepts({ age: 120 }), true);
  for (const age of [-1, 121, Infinity, NaN, false, '20', { $gt: 0 }, null]) {
    assert.equal(accepts({ age }), false);
  }
  assert.equal(accepts({}, { age: 20 }), false);
});

test('security alert counters expire, bound memory, and alert once per window', () => {
  const code = excerpt('security-best-practices.mdx', 'class AnomalyDetector {', '\n```');
  const alerts = [];
  let now = 0;
  const detector = evaluate(code, 'new AnomalyDetector(1000, 2)', {
    Date: { now: () => now },
    SecurityEvents: { SUSPICIOUS_ACTIVITY: 'suspicious.activity' },
    logSecurityEvent: (type, details) => alerts.push({ type, ...details }),
    console: { log: () => undefined },
  });
  for (let i = 0; i < 150; i++) detector.trackRequest('ip-1', '/login');
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].requestCount, 101);
  now = 1000;
  detector.trackRequest('ip-1', '/login');
  assert.equal(detector.requestCounts.get('ip-1:/login').count, 1);
  for (let i = 0; i < 100; i++) detector.trackRequest('ip-1', '/login');
  assert.equal(alerts.length, 2);
  detector.trackRequest('ip-2', '/login');
  detector.trackRequest('ip-3', '/login');
  assert.equal(detector.requestCounts.size, 2);
  assert.equal(detector.requestCounts.has('ip-1:/login'), false);
});

test('query-builder chaining works and keeps ordering and limits', () => {
  const code = excerpt('design-patterns.mdx', 'class Query {', '\n// Usage');
  const Builder = evaluate(code, 'QueryBuilder');
  const query = new Builder()
    .from('users')
    .select('id', 'name')
    .where('age > 18')
    .orderBy('name', 'ASC')
    .limit(10)
    .build();
  assert.equal(query.toString(), 'SELECT id, name FROM users WHERE age > 18 ORDER BY name ASC LIMIT 10');
  assert.equal(new Builder().from('users').limit(0).build().toString(), 'SELECT * FROM users LIMIT 0');
  assert.throws(() => new Builder().build(), /Table name is required/);
});

test('subscriptions use separate user topics and mutations update only the caller scope', async () => {
  const code = excerpt('graphql-best-practices.mdx', "const ORDER_UPDATED = 'ORDER_UPDATED';", '\n```');
  const published = [];
  const { Subscription, Mutation } = evaluate(code, '({ Subscription, Mutation })', {
    GraphQLError: Error,
    pubsub: { asyncIterableIterator: (topics) => topics, publish: async (...args) => published.push(args) },
  });
  assert.throws(
    () => Subscription.orderUpdated.subscribe(null, { userId: 'other' }, { user: { id: 'owner' } }),
    /Not authorized/,
  );
  assert.equal(
    Subscription.orderUpdated.subscribe(null, { userId: 'owner' }, { user: { id: 'owner' } })[0],
    'ORDER_UPDATED:owner',
  );
  let update;
  const context = {
    user: { id: 'owner' },
    db: {
      orders: {
        updateForUser: async (value) => {
          update = value;
          return { id: value.id, userId: value.userId, status: value.status };
        },
      },
    },
  };
  await Mutation.updateOrder(null, { id: 'order-1', input: { status: 'shipped', userId: 'attacker' } }, context);
  assert.equal(update.userId, 'owner');
  assert.equal(published[0][0], 'ORDER_UPDATED:owner');
  await assert.rejects(Mutation.updateOrder(null, { id: 'order-1', input: {} }, { user: null }), /Not authenticated/);
});
