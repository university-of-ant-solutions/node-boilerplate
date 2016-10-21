import test from 'tape';

test('timing test', (t) => {
  t.plan(1);
  t.equal(typeof Date.now, 'function');
});
