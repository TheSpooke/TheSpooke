async function test() {
  try {
    const res = await fetch('http://216.173.77.115:30120/info.json', { signal: AbortSignal.timeout(3000) });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data:', data);
  } catch (e) {
    console.log('Error:', e.message);
  }
}

test();
