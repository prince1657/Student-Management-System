/* ==========================================================================
   API status

   What this talks to, and what it deliberately does not:

   The Express + MongoDB API in `src/` is real, seeded and serves the whole
   REST surface (see the endpoint table in the README). This client checks
   whether it is up and reports that in the topbar.

   It does not write through to it, because the two halves do not share an id
   space: the browser store keys rows `stu-1` / `cls-10a`, while Mongo issues
   ObjectIds. Posting a student with `classId: "cls-10a"` fails Mongoose's
   cast before it reaches the collection, so a write-through would look like
   it worked and quietly change nothing. Unifying the ids (string `_id`s in
   the models, seeded to the same keys) is the change that would make live
   writes real; until then the UI owns its data and says so.

   The previous client raced a 1.2s AbortController on every request, so any
   page could stall for seconds before falling back. This probes once.
   ========================================================================== */

class Api {
  constructor() {
    this.base = '/api';
    this.online = false;
    this.ready = this.probe();
  }

  async probe() {
    try {
      const res = await fetch(`${this.base}/health`, { signal: AbortSignal.timeout(2500) });
      const body = await res.json();
      this.online = res.ok && body.database === 'connected';
      console.info(this.online
        ? 'API up, database connected. REST endpoints are live under /api.'
        : 'API reachable but the database is offline.');
    } catch (err) {
      this.online = false;
      console.info('API not reachable. The UI runs on its browser-local store.');
    }
    window.dispatchEvent(new CustomEvent('api:status', { detail: { online: this.online } }));
    return this.online;
  }

  async get(path) {
    try {
      const res = await fetch(`${this.base}${path}`);
      return res.ok ? await res.json() : null;
    } catch (err) {
      return null;
    }
  }
}

window.Api = new Api();
