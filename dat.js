!(function(e) {
  if ("object" == typeof exports && "undefined" != typeof module)
    module.exports = e();
  else if ("function" == typeof define && define.amd) define([], e);
  else {
    ("undefined" != typeof window
      ? window
      : "undefined" != typeof global
      ? global
      : "undefined" != typeof self
      ? self
      : this
    ).datJs = e();
  }
})(function() {
  return (function() {
    return function e(t, n, r) {
      function i(s, a) {
        if (!n[s]) {
          if (!t[s]) {
            var h = "function" == typeof require && require;
            if (!a && h) return h(s, !0);
            if (o) return o(s, !0);
            var u = new Error("Cannot find module '" + s + "'");
            throw ((u.code = "MODULE_NOT_FOUND"), u);
          }
          var c = (n[s] = { exports: {} });
          t[s][0].call(
            c.exports,
            function(e) {
              return i(t[s][1][e] || e);
            },
            c,
            c.exports,
            e,
            t,
            n,
            r
          );
        }
        return n[s].exports;
      }
      for (
        var o = "function" == typeof require && require, s = 0;
        s < r.length;
        s++
      )
        i(r[s]);
      return i;
    };
  })()(
    {
      1: [
        function(e, t, n) {
          (function(n) {
            const r = e("events").EventEmitter,
              i = e("run-parallel"),
              o = e("dat-encoding"),
              s = e("random-access-web"),
              a = e("random-access-memory"),
              h = e("discovery-swarm-web"),
              u = e("hypercore-crypto"),
              c = e("hypercore-protocol"),
              f = e("hyperdrive");
            t.exports = class extends r {
              constructor(e) {
                super(),
                  (this.opts = e || {}),
                  this.opts.id || (this.opts.id = u.randomBytes(32)),
                  (this.archives = []);
                const t = Object.assign(
                  { stream: e => this._replicate(e) },
                  this.opts
                );
                this.swarm = h(t);
                const n = Object.assign(
                  { name: "dats", storeName: "files" },
                  this.opts
                );
                this.persistence = s(n);
              }
              get(e, t) {
                const n = o.decode(e),
                  r = `dat://${o.encode(n)}`,
                  i = this.archives.find(e => e.url === r);
                return i || this._add(r, t);
              }
              _add(e, t) {
                if (this.destroyed) throw new Error("client is destroyed");
                t || (t = {});
                const n = Object.assign({}, this.opts, t);
                let r = null;
                if ((e && (r = o.decode(e)), !r)) {
                  const e = u.keyPair();
                  (r = e.publicKey), (n.secretKey = e.secretKey);
                }
                const i = o.encode(r),
                  s = n.db || (n.persist ? this.persistence : a),
                  h = f(
                    e => s(i + "/" + e),
                    r,
                    Object.assign({ sparse: !0 }, n)
                  );
                return (
                  (h.url = "dat://" + i),
                  this.archives.push(h),
                  h.ready(() => {
                    this.swarm.join(h.discoveryKey), this.emit("archive", h);
                  }),
                  h
                );
              }
              create(e) {
                return this._add(null, e);
              }
              has(e) {
                const t = o.decode(e),
                  n = `dat://${o.encode(t)}`;
                return !!this.archives.find(e => e.url === n);
              }
              _replicate(e) {
                var t = c({ id: this.opts.id, live: !0, encrypt: !0 });
                return (
                  t.on("feed", e => this._replicateFeed(t, e)),
                  t.on("error", e => {
                    this.emit("replication-error", e);
                  }),
                  e.channel && this._replicateFeed(t, e.channel),
                  t
                );
              }
              _replicateFeed(e, t) {
                if (this.destroyed) return void e.end();
                const n = o.encode(t),
                  r = this.archives.find(e => o.encode(e.discoveryKey) === n);
                r && r.replicate({ stream: e, live: !0 });
              }
              close(e) {
                this.destroyed
                  ? e && n.nextTick(e)
                  : ((this.destroyed = !0),
                    this.swarm.close(),
                    e && this.once("close", e),
                    i(
                      this.archives.map(e => t => {
                        e.close(t);
                      }),
                      () => {
                        (this.archives = null), this.emit("close");
                      }
                    ));
              }
              destroy(e) {
                this.close(e);
              }
            };
          }.call(this, e("_process")));
        },
        {
          _process: 175,
          "dat-encoding": 30,
          "discovery-swarm-web": 35,
          events: 170,
          "hypercore-crypto": 42,
          "hypercore-protocol": 44,
          hyperdrive: 59,
          "random-access-memory": 101,
          "random-access-web": 104,
          "run-parallel": 119
        }
      ],
      2: [
        function(e, t, n) {
          (function(n) {
            const r = e("assert"),
              i = e("events"),
              o = e("webrtc-swarm"),
              s = e("pump"),
              a = e("sub-signalhub"),
              h = () => void 0;
            class u extends i {
              constructor(e = {}) {
                super(),
                  r(
                    "function" == typeof e.stream,
                    "A `stream` function prop is required."
                  ),
                  r(e.hub, "A signalhub `hub` instance is required"),
                  (this.id = e.id),
                  (this.stream = e.stream),
                  (this.hub = e.hub),
                  (this.channels = new Map()),
                  (this.destroyed = !1);
              }
              join(e, t = {}) {
                if ((r(e, "A channel name is required."), this.channels.has(e)))
                  return;
                "object" == typeof e && (e = e.toString("hex"));
                const n = a(this.hub, e),
                  i = {
                    peers: new Map(),
                    swarm: o(
                      n,
                      Object.assign({}, { uuid: this.id.toString("hex") }, t)
                    )
                  };
                i.swarm.on("peer", (t, n) => {
                  const r = { id: n, channel: e },
                    o = this.stream(r);
                  this.emit("handshaking", o, r),
                    o.on("handshake", this._handshake.bind(this, i, o, r)),
                    s(t, o, t);
                }),
                  i.swarm.on("disconnect", (t, n) => {
                    const r = { id: n, channel: e };
                    i.peers.delete(n), this.emit("connection-closed", t, r);
                  }),
                  this.channels.set(e, i);
              }
              leave(e) {
                const t = this.channels.get(e);
                t && (t.close(), this.channels.delete(e));
              }
              close(e) {
                return this.destroyed
                  ? n.nextTick(e || h)
                  : ((this.destroyed = !0),
                    e && this.once("close", e),
                    this.channels.size
                      ? void this.channels.forEach((e, t) => {
                          e.swarm.close(() => {
                            this.channels.delete(t),
                              this.channels.size || this.emit("close");
                          });
                        })
                      : n.nextTick(() => {
                          this.emit("close");
                        }));
              }
              destroy(e) {
                this.close(e);
              }
              _handshake(e, t, n) {
                const { id: r } = n;
                if (e.peers.has(r)) {
                  const t = e.peers.get(r);
                  this.emit("redundant-connection", t, n),
                    e.peers.delete(r),
                    t.destroy();
                }
                e.peers.set(r, t), this.emit("connection", t, n);
              }
            }
            t.exports = (...e) => new u(...e);
          }.call(this, e("_process")));
        },
        {
          _process: 175,
          assert: 163,
          events: 170,
          pump: 92,
          "sub-signalhub": 148,
          "webrtc-swarm": 154
        }
      ],
      3: [
        function(e, t, n) {
          (function(n) {
            var r = e("from2"),
              i = e("mutexify"),
              o = e("varint"),
              s = e("./messages"),
              a = e("codecs"),
              h = e("inherits"),
              u = e("events"),
              c = e("array-lru"),
              f = e("process-nextick-args");
            function l(e, t) {
              if (!(this instanceof l)) return new l(e, t);
              t || (t = {}),
                u.EventEmitter.call(this),
                (this._offset = t.offset || 0),
                (this._codec = t.codec || a(t.valueEncoding)),
                (this._head = "number" == typeof t.checkout ? t.checkout : -1),
                (this._lock = i()),
                (this._cache = (function(e) {
                  if (!1 === e.cache) return null;
                  if (!0 === e.cache || !e.cache) {
                    var t = e.cacheSize || 65536;
                    return c(t, { indexedValues: !0 });
                  }
                  return e.cache;
                })(t)),
                (this._wait = !1 !== t.wait),
                (this._cached = !!t.cached),
                (this._asNode = !!t.node),
                (this._readonly = !!t.readonly),
                (this.feed = e),
                (this.version = this._head);
              var n = this;
              this.ready(function(e) {
                e || n.emit("ready");
              });
            }
            function d(e) {
              return "/" + e.join("/");
            }
            function p(e) {
              var t = e.split("/");
              return (
                "" === t[0] && t.shift(), "" === t[t.length - 1] && t.pop(), t
              );
            }
            function g(e) {
              var t = new Error(d(e) + " could not be found");
              return (t.notFound = !0), (t.status = 404), t;
            }
            function y(e, t) {
              for (var n = 0; n < e.length && e[n] === t[n]; ) n++;
              return n;
            }
            function A(e, t) {
              (this.index = t),
                (this.name = e.name),
                (this.value = e.value),
                (this.paths = e.paths);
            }
            (t.exports = l),
              h(l, u.EventEmitter),
              (l.prototype.put = function(e, t, n) {
                var r = this,
                  i = p(e);
                this._lock(function(e) {
                  function o(t) {
                    e(n, t);
                  }
                  r.head(function(e, n, s) {
                    return e
                      ? o(e)
                      : r._readonly
                      ? o(new Error("Cannot delete on a checkout"))
                      : void (n ? r._put(n, s, i, t, o) : r._init(i, t, o));
                  });
                });
              }),
              (l.prototype._put = function(e, t, n, r, i) {
                var o = this,
                  a = 0,
                  h = n.length + 1,
                  u = [],
                  c = o.feed.length;
                !(function f(l, g, y) {
                  if (l) return i(l);
                  if (g) {
                    for (var A = [], b = 0; b < g.length; b++)
                      p(g[b].name)[a - 1] !== n[a - 1] && A.push(y[b]);
                    A.push(c), u.push(A);
                  }
                  if (a === h) {
                    var _ = {
                      name: d(n),
                      value: o._codec.encode(r),
                      paths: o._deflate(c, u)
                    };
                    return (
                      (o.version = o.feed.length),
                      void o.feed.append(s.Node.encode(_), i)
                    );
                  }
                  o._list(e, t, n.slice(0, a++), null, f);
                })(null, null, null);
              }),
              (l.prototype.list = function(e, t, n) {
                if ("function" == typeof t) return this.list(e, null, t);
                t = this._defaultOpts(t);
                var r = this,
                  i = p(e),
                  o = !(!t.node && !t.nodes);
                this.head(t, function(e, s, a) {
                  if (e) return n(e);
                  if (!s) return n(g(i));
                  r._list(s, a, i, t, function(e, t, s) {
                    if (e) return n(e);
                    if (!t.length) return n(g(i));
                    for (var a = [], h = 0; h < t.length; h++) {
                      var u = p(t[h].name);
                      u.length > i.length &&
                        a.push(o ? r._node(t[h], s[h]) : u[i.length]);
                    }
                    n(null, a);
                  });
                });
              }),
              (l.prototype._list = function(e, t, n, r, i) {
                var o;
                try {
                  o = this._inflate(t, e.paths);
                } catch (e) {
                  return i(e);
                }
                var s = y(p(e.name), n),
                  a = s < o.length && o[s];
                return s === n.length
                  ? a && a.length
                    ? void this._getAll(a, r, i)
                    : i(null, [], [])
                  : !a || !a.length || (1 === a.length && a[0] === t)
                  ? i(null, [], [])
                  : void this._closer(n, s, a, r, i);
              }),
              (l.prototype.get = function(e, t, n) {
                if ("function" == typeof t) return this.get(e, null, t);
                t = this._defaultOpts(t);
                var r = p(e),
                  i = this;
                this.head(t, function(e, o, s) {
                  return e
                    ? n(e)
                    : o
                    ? void i._get(o, s, r, null, t, n)
                    : n(g(r));
                });
              }),
              (l.prototype.path = function(e, t, n) {
                if ("function" == typeof t) return this.path(e, null, t);
                t = this._defaultOpts(t);
                var r = p(e),
                  i = [],
                  o = this;
                this.head(t, function(e, s, a) {
                  return e
                    ? n(e)
                    : s
                    ? void o._get(s, a, r, i, t, function(e) {
                        if (e && !e.notFound) return n(e);
                        n(null, i);
                      })
                    : n(g(r));
                });
              }),
              (l.prototype.checkout = function(e, t) {
                return (
                  (t = this._defaultOpts(t)),
                  new l(this.feed, {
                    checkout: e,
                    readonly: !0,
                    offset: this._offset,
                    codec: t.valueEncoding ? a(t.valueEncoding) : this._codec,
                    cache: this._cache || t.cache || !1,
                    node: t.node,
                    wait: t.wait,
                    cached: t.cached
                  })
                );
              }),
              (l.prototype._del = function(e, t, n, r) {
                var i = this,
                  o = 0,
                  a = n.length + 1,
                  h = [],
                  u = i.feed.length,
                  c = d(n);
                !(function r(o, s) {
                  i._list(e, t, n.slice(0, o), null, function(e, t, n) {
                    if (e) return s(e);
                    for (var i = t.length - 1; i >= 0; i--)
                      if (t[i].name !== c && t[i].value)
                        return s(null, t[i], n[i]);
                    if (o <= 0) return s(null, null, -1);
                    r(o - 1, s);
                  });
                })(n.length, function(f, l, g) {
                  if (f) return r(f);
                  var A = l ? p(l.name) : [],
                    b = y(n, A) + 1;
                  !(function f(l, g, y) {
                    if (l) return r(l);
                    if (g && o <= b) {
                      for (var A = [], _ = 0; _ < g.length; _++)
                        p(g[_].name)[o - 1] !== n[o - 1] &&
                          g[_].name !== c &&
                          A.push(y[_]);
                      o < b && A.push(u), h.push(A);
                    }
                    if (o === a) {
                      var v = {
                        name: d(n),
                        value: null,
                        paths: i._deflate(u, h)
                      };
                      return (
                        (i.version = i.feed.length),
                        void i.feed.append(s.Node.encode(v), r)
                      );
                    }
                    i._list(e, t, n.slice(0, o++), null, f);
                  })(null, null, null);
                });
              }),
              (l.prototype.del = function(e, t) {
                var n = this,
                  r = p(e);
                this._lock(function(e) {
                  function i(n) {
                    e(t, n);
                  }
                  n.head(function(e, t, o) {
                    return e
                      ? i(e)
                      : n._readonly
                      ? i(new Error("Cannot delete on a checkout"))
                      : t
                      ? void n._del(t, o, r, i)
                      : i(null);
                  });
                });
              }),
              (l.prototype._get = function(e, t, n, r, i, o) {
                var s,
                  a = this,
                  h = p(e.name),
                  u = y(n, h);
                if ((r && r.push(t), u === h.length && u === n.length))
                  return i.node
                    ? o(null, this._node(e, t))
                    : e.value
                    ? o(null, this._codec.decode(e.value))
                    : o(g(n));
                try {
                  s = this._inflate(t, e.paths);
                } catch (e) {
                  return o(e);
                }
                if (u >= s.length) return o(g(n));
                var c = s[u],
                  f = c.length;
                if ((c[f - 1] === t && f--, !f)) return o(g(n));
                for (
                  var l = u < n.length ? n[u] : null, d = null, A = f, b = 0;
                  b < f;
                  b++
                )
                  this._getAndDecode(c[b], i, _);
                function _(e, t, s) {
                  if ((e && (d = e), t)) {
                    var h = p(t.name);
                    if ((u < h.length ? h[u] : null) === l)
                      return a._get(t, s, n, r, i, o);
                  }
                  --A || o(d || g(n));
                }
              }),
              (l.prototype._closer = function(e, t, n, r, i) {
                for (
                  var o = this, s = e[t], a = null, h = n.length, u = !1, c = 0;
                  c < n.length;
                  c++
                )
                  this._getAndDecode(n[c], r, f);
                function f(n, c, f) {
                  u ||
                    (n && (a = n),
                    c && p(c.name)[t] === s
                      ? o._list(c, f, e, r, i)
                      : --h || i(a, [], []));
                }
              }),
              (l.prototype.head = function(e, t) {
                if ("function" == typeof e) return this.head(null, e);
                if (this._head >= this._offset)
                  return this._getAndDecode(this._head, e, t);
                if (this._readonly) return t(null, null, -1);
                var n = this;
                this.ready(function(r) {
                  if (r) return t(r);
                  n.feed.length > n._offset
                    ? n._getAndDecode(n.feed.length - 1, e, t)
                    : t(null, null, -1);
                });
              }),
              (l.prototype.ready = function(e) {
                var t = this;
                this.feed.ready(function(n) {
                  if (n) return e(n);
                  (-1 === t.version || -1 === t._head) &&
                    t.feed.length > t._offset &&
                    (t.version = t.feed.length - 1),
                    e(null);
                });
              }),
              (l.prototype.history = function(e) {
                (e = this._defaultOpts(e)),
                  this._offset &&
                    (e.start = Math.max(e.start || 0, this._offset)),
                  this._head > -1 && (e.end = this._head + 1);
                var t = e.start || 0,
                  n = this;
                return (
                  (e.valueEncoding = {
                    encode: function() {},
                    decode: function(e) {
                      return n._node(s.Node.decode(e), t++);
                    }
                  }),
                  this.feed.createReadStream(e)
                );
              }),
              (l.prototype.diff = function(e, t) {
                "number" == typeof e && (e = this.checkout(e)),
                  (t = this._defaultOpts(t));
                var n = this,
                  i = !1 !== t.puts,
                  o = !1 !== t.dels,
                  s = ["/"],
                  a = !0,
                  h = {};
                t.reverse && ((n = e), (e = this));
                var u = r.obj(c);
                return u;
                function c(t, r) {
                  return a
                    ? (function(t, n) {
                        (a = !1),
                          e.head(function(e, r) {
                            if (e) return n(e);
                            if (!r || r.value) return c(t, n);
                            for (
                              var i = r.name.split("/"), o = 0;
                              o < i.length;
                              o++
                            )
                              h[i.slice(0, o).join("/") || "/"] = !0;
                            c(t, n);
                          });
                      })(t, r)
                    : s.length
                    ? void (function(t, r) {
                        var i = {};
                        e.list(t, { node: !0 }, function(e, o) {
                          if (e && !e.notFound) return r(e);
                          o || (o = []),
                            n.list(t, { node: !0 }, function(e, n) {
                              if (e && !e.notFound) return r(e);
                              n || (n = []);
                              for (
                                var a = [], u = 0, c = 0;
                                u < o.length && c < n.length;

                              )
                                if (o[u].version === n[c].version) {
                                  var d = l(t, o[u].name);
                                  h.hasOwnProperty(d) &&
                                    !i[d] &&
                                    ((i[d] = !0), s.push(d)),
                                    u++,
                                    c++;
                                } else
                                  o[u].version < n[c].version
                                    ? f(t, !0, o[u++], i, a)
                                    : f(t, !1, n[c++], i, a);
                              for (; u < o.length; u++) f(t, !0, o[u], i, a);
                              for (; c < n.length; c++) f(t, !1, n[c], i, a);
                              r(null, a);
                            });
                        });
                      })(s.pop(), function(e, n) {
                        if (e) return r(e);
                        if (!n.length) return c(t, r);
                        for (var i = 0; i < n.length - 1; i++) u.push(n[i]);
                        r(null, n[n.length - 1]);
                      })
                    : r(null, null);
                }
                function f(e, t, n, r, a) {
                  if ((!t || i) && (t || o)) {
                    var h = n.name,
                      u = l(e, n.name);
                    h === u &&
                      a.push({
                        type: t ? "put" : "del",
                        name: n.name,
                        version: n.version,
                        value: n.value
                      }),
                      r.hasOwnProperty(u) || ((r[u] = !0), s.push(u));
                  }
                }
                function l(e, t) {
                  return (
                    "/" +
                    p(t)
                      .slice(0, p(e).length + 1)
                      .join("/")
                  );
                }
              }),
              (l.prototype._node = function(e, t) {
                return {
                  type: e.value ? "put" : "del",
                  version: t,
                  name: e.name,
                  value: e.value && this._codec.decode(e.value)
                };
              }),
              (l.prototype._init = function(e, t, n) {
                for (var r = []; e.length >= r.length; )
                  r.push([this.feed.length]);
                var i = {
                  name: d(e),
                  value: this._codec.encode(t),
                  paths: this._deflate(this.feed.length, r)
                };
                (this.version = this.feed.length),
                  this.feed.append(s.Node.encode(i), n);
              }),
              (l.prototype._getAndDecode = function(e, t, n) {
                t && t.cached && (t.wait = !1);
                var r = this,
                  i = this._cache && this._cache.get(e);
                if (i) return f(n, null, i, e);
                this.feed.get(e, t, function(t, i) {
                  if (t) return n(t);
                  try {
                    var o = new A(s.Node.decode(i), e);
                  } catch (t) {
                    return n(t);
                  }
                  r._cache && r._cache.set(e, o), n(null, o, e);
                });
              }),
              (l.prototype._getAll = function(e, t, n) {
                t && t.cached && (e = this._onlyCached(e));
                var r = new Array(e.length),
                  i = e.length,
                  o = null;
                if (!i) return n(null, r, e);
                for (var s = 0; s < e.length; s++)
                  this._getAndDecode(e[s], t, a);
                function a(t, s, a) {
                  t ? (o = t) : (r[e.indexOf(a)] = s),
                    --i || (o ? n(o) : n(null, r, e));
                }
              }),
              (l.prototype._onlyCached = function(e) {
                for (var t = [], n = 0; n < e.length; n++)
                  this.feed.has(e[n]) && t.push(e[n]);
                return t;
              }),
              (l.prototype._deflate = function(e, t) {
                var r,
                  i = !0,
                  s = 11,
                  a = 0;
                for (a = 0; a < t.length; a++)
                  (s += 11 * (r = t[a]).length + 11),
                    r[r.length - 1] !== e && (i = !1);
                var h = 0;
                i && (h |= 1);
                var u = new n(s),
                  c = 0;
                for (u[c++] = h, a = 0; a < t.length; a++) {
                  r = t[a];
                  var f = 0,
                    l = i ? r.length - 1 : r.length;
                  o.encode(l, u, c), (c += o.encode.bytes);
                  for (var d = 0; d < l; d++)
                    o.encode(r[d] - f, u, c), (c += o.encode.bytes), (f = r[d]);
                }
                if (c > u.length)
                  throw new Error("Assert error: buffer length too small");
                return u.slice(0, c);
              }),
              (l.prototype._inflate = function(e, t) {
                var n = 0,
                  r = o.decode(t, n);
                n += o.decode.bytes;
                for (var i = !!(1 & r), s = []; n < t.length; ) {
                  var a = o.decode(t, n);
                  n += o.decode.bytes;
                  for (var h = new Array(i ? a + 1 : a), u = 0; u < a; u++) {
                    if (n >= t.length) throw new Error("Invalid index");
                    (h[u] = o.decode(t, n) + (u ? h[u - 1] : 0)),
                      (n += o.decode.bytes);
                  }
                  i && (h[u] = e), s.push(h);
                }
                return s;
              }),
              (l.prototype._defaultOpts = function(e) {
                return e
                  ? (void 0 === e.wait && (e.wait = this._wait),
                    void 0 === e.cached && (e.cached = this._cached),
                    void 0 === e.node && (e.node = this._asNode),
                    e)
                  : {
                      wait: this._wait,
                      cached: this._cached,
                      node: this._asNode
                    };
              });
          }.call(this, e("buffer").Buffer));
        },
        {
          "./messages": 4,
          "array-lru": 11,
          buffer: 169,
          codecs: 26,
          events: 170,
          from2: 40,
          inherits: 64,
          mutexify: 79,
          "process-nextick-args": 5,
          varint: 8
        }
      ],
      4: [
        function(e, t, n) {
          (function(t) {
            var r = e("protocol-buffers-encodings"),
              i = r.varint,
              o = r.skip,
              s = (n.Node = {
                buffer: !0,
                encodingLength: null,
                encode: null,
                decode: null
              });
            function a(e) {
              return null != e && ("number" != typeof e || !isNaN(e));
            }
            !(function() {
              var e = [r.string, r.bytes];
              function n(t) {
                var n = 0;
                if (!a(t.name)) throw new Error("name is required");
                var r = e[0].encodingLength(t.name);
                if (((n += 1 + r), a(t.value))) {
                  var r = e[1].encodingLength(t.value);
                  n += 1 + r;
                }
                if (a(t.paths)) {
                  var r = e[1].encodingLength(t.paths);
                  n += 1 + r;
                }
                return n;
              }
              (s.encodingLength = n),
                (s.encode = function r(i, o, s) {
                  s || (s = 0);
                  o || (o = t.allocUnsafe(n(i)));
                  var h = s;
                  if (!a(i.name)) throw new Error("name is required");
                  o[s++] = 10;
                  e[0].encode(i.name, o, s);
                  s += e[0].encode.bytes;
                  a(i.value) &&
                    ((o[s++] = 18),
                    e[1].encode(i.value, o, s),
                    (s += e[1].encode.bytes));
                  a(i.paths) &&
                    ((o[s++] = 26),
                    e[1].encode(i.paths, o, s),
                    (s += e[1].encode.bytes));
                  r.bytes = s - h;
                  return o;
                }),
                (s.decode = function t(n, r, s) {
                  r || (r = 0);
                  s || (s = n.length);
                  if (!(s <= n.length && r <= n.length))
                    throw new Error("Decoded message is not valid");
                  var a = r;
                  var h = { name: "", value: null, paths: null };
                  var u = !1;
                  for (;;) {
                    if (s <= r) {
                      if (!u) throw new Error("Decoded message is not valid");
                      return (t.bytes = r - a), h;
                    }
                    var c = i.decode(n, r);
                    r += i.decode.bytes;
                    var f = c >> 3;
                    switch (f) {
                      case 1:
                        (h.name = e[0].decode(n, r)),
                          (r += e[0].decode.bytes),
                          (u = !0);
                        break;
                      case 2:
                        (h.value = e[1].decode(n, r)), (r += e[1].decode.bytes);
                        break;
                      case 3:
                        (h.paths = e[1].decode(n, r)), (r += e[1].decode.bytes);
                        break;
                      default:
                        r = o(7 & c, n, r);
                    }
                  }
                });
            })();
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169, "protocol-buffers-encodings": 87 }
      ],
      5: [
        function(e, t, n) {
          (function(e) {
            "use strict";
            !e.version ||
            0 === e.version.indexOf("v0.") ||
            (0 === e.version.indexOf("v1.") && 0 !== e.version.indexOf("v1.8."))
              ? (t.exports = function(t, n, r, i) {
                  if ("function" != typeof t)
                    throw new TypeError(
                      '"callback" argument must be a function'
                    );
                  var o,
                    s,
                    a = arguments.length;
                  switch (a) {
                    case 0:
                    case 1:
                      return e.nextTick(t);
                    case 2:
                      return e.nextTick(function() {
                        t.call(null, n);
                      });
                    case 3:
                      return e.nextTick(function() {
                        t.call(null, n, r);
                      });
                    case 4:
                      return e.nextTick(function() {
                        t.call(null, n, r, i);
                      });
                    default:
                      for (o = new Array(a - 1), s = 0; s < o.length; )
                        o[s++] = arguments[s];
                      return e.nextTick(function() {
                        t.apply(null, o);
                      });
                  }
                })
              : (t.exports = e.nextTick);
          }.call(this, e("_process")));
        },
        { _process: 175 }
      ],
      6: [
        function(e, t, n) {
          t.exports = function e(t, n) {
            var o,
              s = 0,
              n = n || 0,
              a = 0,
              h = n,
              u = t.length;
            do {
              if (h >= u)
                throw ((e.bytes = 0),
                new RangeError("Could not decode varint"));
              (o = t[h++]),
                (s += a < 28 ? (o & i) << a : (o & i) * Math.pow(2, a)),
                (a += 7);
            } while (o >= r);
            e.bytes = h - n;
            return s;
          };
          var r = 128,
            i = 127;
        },
        {}
      ],
      7: [
        function(e, t, n) {
          t.exports = function e(t, n, s) {
            n = n || [];
            s = s || 0;
            var a = s;
            for (; t >= o; ) (n[s++] = (255 & t) | r), (t /= 128);
            for (; t & i; ) (n[s++] = (255 & t) | r), (t >>>= 7);
            n[s] = 0 | t;
            e.bytes = s - a + 1;
            return n;
          };
          var r = 128,
            i = -128,
            o = Math.pow(2, 31);
        },
        {}
      ],
      8: [
        function(e, t, n) {
          t.exports = {
            encode: e("./encode.js"),
            decode: e("./decode.js"),
            encodingLength: e("./length.js")
          };
        },
        { "./decode.js": 6, "./encode.js": 7, "./length.js": 9 }
      ],
      9: [
        function(e, t, n) {
          var r = Math.pow(2, 7),
            i = Math.pow(2, 14),
            o = Math.pow(2, 21),
            s = Math.pow(2, 28),
            a = Math.pow(2, 35),
            h = Math.pow(2, 42),
            u = Math.pow(2, 49),
            c = Math.pow(2, 56),
            f = Math.pow(2, 63);
          t.exports = function(e) {
            return e < r
              ? 1
              : e < i
              ? 2
              : e < o
              ? 3
              : e < s
              ? 4
              : e < a
              ? 5
              : e < h
              ? 6
              : e < u
              ? 7
              : e < c
              ? 8
              : e < f
              ? 9
              : 10;
          };
        },
        {}
      ],
      10: [
        function(e, t, n) {
          var r = [
            0,
            4129,
            8258,
            12387,
            16516,
            20645,
            24774,
            28903,
            33032,
            37161,
            41290,
            45419,
            49548,
            53677,
            57806,
            61935,
            4657,
            528,
            12915,
            8786,
            21173,
            17044,
            29431,
            25302,
            37689,
            33560,
            45947,
            41818,
            54205,
            50076,
            62463,
            58334,
            9314,
            13379,
            1056,
            5121,
            25830,
            29895,
            17572,
            21637,
            42346,
            46411,
            34088,
            38153,
            58862,
            62927,
            50604,
            54669,
            13907,
            9842,
            5649,
            1584,
            30423,
            26358,
            22165,
            18100,
            46939,
            42874,
            38681,
            34616,
            63455,
            59390,
            55197,
            51132,
            18628,
            22757,
            26758,
            30887,
            2112,
            6241,
            10242,
            14371,
            51660,
            55789,
            59790,
            63919,
            35144,
            39273,
            43274,
            47403,
            23285,
            19156,
            31415,
            27286,
            6769,
            2640,
            14899,
            10770,
            56317,
            52188,
            64447,
            60318,
            39801,
            35672,
            47931,
            43802,
            27814,
            31879,
            19684,
            23749,
            11298,
            15363,
            3168,
            7233,
            60846,
            64911,
            52716,
            56781,
            44330,
            48395,
            36200,
            40265,
            32407,
            28342,
            24277,
            20212,
            15891,
            11826,
            7761,
            3696,
            65439,
            61374,
            57309,
            53244,
            48923,
            44858,
            40793,
            36728,
            37256,
            33193,
            45514,
            41451,
            53516,
            49453,
            61774,
            57711,
            4224,
            161,
            12482,
            8419,
            20484,
            16421,
            28742,
            24679,
            33721,
            37784,
            41979,
            46042,
            49981,
            54044,
            58239,
            62302,
            689,
            4752,
            8947,
            13010,
            16949,
            21012,
            25207,
            29270,
            46570,
            42443,
            38312,
            34185,
            62830,
            58703,
            54572,
            50445,
            13538,
            9411,
            5280,
            1153,
            29798,
            25671,
            21540,
            17413,
            42971,
            47098,
            34713,
            38840,
            59231,
            63358,
            50973,
            55100,
            9939,
            14066,
            1681,
            5808,
            26199,
            30326,
            17941,
            22068,
            55628,
            51565,
            63758,
            59695,
            39368,
            35305,
            47498,
            43435,
            22596,
            18533,
            30726,
            26663,
            6336,
            2273,
            14466,
            10403,
            52093,
            56156,
            60223,
            64286,
            35833,
            39896,
            43963,
            48026,
            19061,
            23124,
            27191,
            31254,
            2801,
            6864,
            10931,
            14994,
            64814,
            60687,
            56684,
            52557,
            48554,
            44427,
            40424,
            36297,
            31782,
            27655,
            23652,
            19525,
            15522,
            11395,
            7392,
            3265,
            61215,
            65342,
            53085,
            57212,
            44955,
            49082,
            36825,
            40952,
            28183,
            32310,
            20053,
            24180,
            11923,
            16050,
            3793,
            7920
          ];
          t.exports = function(e) {
            for (var t = 0, n = 0, i = 0; i < 8; i++)
              (e = (e - (n = 255 & e)) / 256),
                (t = 65535 & ((t << 8) ^ r[255 & ((t >> 8) ^ n)]));
            return t;
          };
        },
        {}
      ],
      11: [
        function(e, t, n) {
          var r = e("./crc16");
          function i(e, t) {
            if (!(this instanceof i)) return new i(e, t);
            for (
              t || (t = {}),
                this.collisions = a(t.collisions || t.bucketSize || 4),
                this.buckets =
                  (function(e, t) {
                    e = a(e);
                    for (; e & (t - 1); ) e <<= 1;
                    return e;
                  })(e, this.collisions) / this.collisions;
              this.buckets > 65536;

            )
              (this.buckets >>= 1), (this.collisions <<= 1);
            var n;
            (this.size = this.buckets * this.collisions),
              (this.wrap = !t.indexedValues),
              (this.cache = new Array(this.size)),
              (this.hash =
                65536 === this.buckets
                  ? r
                  : ((n = this.buckets - 1),
                    function(e) {
                      return r(e) & n;
                    })),
              (this.evict = t.evict || null);
          }
          function o(e, t, n, r) {
            for (; n > t; ) e[n] = e[--n];
            e[t] = r;
          }
          function s(e, t) {
            (this.index = e), (this.value = t);
          }
          function a(e) {
            if (e && !(e & (e - 1))) return e;
            for (var t = 1; t < e; ) t <<= 1;
            return t;
          }
          (t.exports = i),
            (i.prototype.set = function(e, t) {
              for (
                var n = this.collisions * this.hash(e),
                  r = n + this.collisions,
                  i = n,
                  a = null;
                i < r;

              ) {
                if (!(a = this.cache[i]))
                  return (
                    (a = this.cache[i] = this.wrap ? new s(e, t) : t),
                    void o(this.cache, n, i, a)
                  );
                if (a.index === e)
                  return (
                    this.wrap ? (a.value = t) : (this.cache[i] = t),
                    void o(this.cache, n, i, a)
                  );
                i++;
              }
              this.wrap
                ? (this.evict && this.evict(a.index, a.value),
                  (a.index = e),
                  (a.value = t))
                : (this.evict && this.evict(a.index, a),
                  (this.cache[i - 1] = t)),
                o(this.cache, n, i - 1, a);
            }),
            (i.prototype.get = function(e) {
              for (
                var t = this.collisions * this.hash(e),
                  n = t + this.collisions,
                  r = t;
                r < n;

              ) {
                var i = this.cache[r++];
                if (!i) return null;
                if (i.index === e)
                  return o(this.cache, t, r - 1, i), this.wrap ? i.value : i;
              }
              return null;
            });
        },
        { "./crc16": 10 }
      ],
      12: [
        function(e, t, n) {
          t.exports = function(e) {
            var t = !1,
              n = null,
              r = null,
              i = null;
            return function(s, a) {
              t
                ? (n || ((n = []), (r = [])),
                  (function(e, t) {
                    Array.isArray(t)
                      ? (function(e, t) {
                          for (var n = 0; n < t.length; n++) e.push(t[n]);
                        })(e, t)
                      : e.push(t);
                  })(n, s),
                  a && r.push(a))
                : (a && (i = [a]), (t = !0), e(Array.isArray(s) ? s : [s], o));
            };
            function o(s) {
              i &&
                (function(e, t) {
                  for (var n = 0; n < e.length; n++) e[n](t);
                })(i, s),
                (t = !1),
                (i = r);
              var a = n;
              if (((n = null), (r = null), !a || !a.length)) {
                if (!i || !i.length) return void (i = null);
                a || (a = []);
              }
              (t = !0), e(a, o);
            }
          };
        },
        {}
      ],
      13: [
        function(e, t, n) {
          var r = e("varint"),
            i = e("buffer-alloc-unsafe");
          t.exports = (function e(t) {
            var n = {};
            n.align = e;
            n.encode = function e(t, n, r) {
              r || (r = 0);
              n || (n = i(s(t)));
              var a = new o(t, n, r);
              h(a);
              e.bytes = a.outputOffset - r;
              return n;
            };
            n.encode.bytes = 0;
            n.encodingLength = s;
            n.decode = function e(t, n) {
              n || (n = 0);
              var o = i(a(t, n));
              var s = 0;
              for (; n < t.length; ) {
                var h = r.decode(t, n),
                  u = 1 & h,
                  c = u ? (h - (3 & h)) / 4 : h / 2;
                (n += r.decode.bytes),
                  u
                    ? o.fill(2 & h ? 255 : 0, s, s + c)
                    : (t.copy(o, s, n, n + c), (n += c)),
                  (s += c);
              }
              o.fill(0, s);
              e.bytes = t.length - n;
              return o;
            };
            n.decode.bytes = 0;
            n.decodingLength = a;
            return n;
            function o(e, t, n) {
              (this.inputOffset = 0),
                (this.inputLength = e.length),
                (this.input = e),
                (this.outputOffset = n),
                (this.output = t);
            }
            function s(e) {
              var t = new o(e, null, 0);
              return h(t), t.outputOffset;
            }
            function a(e, n) {
              n || (n = 0);
              for (var i = 0; n < e.length; ) {
                var o = r.decode(e, n);
                n += r.decode.bytes;
                var s = 1 & o,
                  a = s ? (o - (3 & o)) / 4 : o / 2;
                (i += a), s || (n += a);
              }
              if (n > e.length) throw new Error("Invalid RLE bitfield");
              return i & (t - 1) ? i + (t - (i & (t - 1))) : i;
            }
            function h(e) {
              for (
                var t = 0, n = 0, i = e.input;
                e.inputLength > 0 && !i[e.inputLength - 1];

              )
                e.inputLength--;
              for (var o = 0; o < e.inputLength; o++)
                i[o] !== n
                  ? (t && c(e, o, t, n),
                    0 === i[o] || 255 === i[o]
                      ? ((n = i[o]), (t = 1))
                      : (t = 0))
                  : t++;
              t && c(e, e.inputLength, t, n),
                (function(e) {
                  var t = e.inputLength - e.inputOffset;
                  if (!t) return;
                  e.output
                    ? u(e, e.inputLength)
                    : (e.outputOffset += t + r.encodingLength(2 * t));
                  e.inputOffset = e.inputLength;
                })(e);
            }
            function u(e, t) {
              var n = t - e.inputOffset;
              r.encode(2 * n, e.output, e.outputOffset),
                (e.outputOffset += r.encode.bytes),
                e.input.copy(e.output, e.outputOffset, e.inputOffset, t),
                (e.outputOffset += n);
            }
            function c(e, t, n, i) {
              var o = t - n - e.inputOffset,
                s = o ? r.encodingLength(2 * o) + o : 0,
                a = 4 * n + (i ? 2 : 0) + 1,
                h = s + r.encodingLength(a),
                c =
                  r.encodingLength(2 * (t - e.inputOffset)) + t - e.inputOffset;
              if (!(h >= c)) {
                if (!e.output)
                  return (e.outputOffset += h), void (e.inputOffset = t);
                o && u(e, t - n),
                  r.encode(a, e.output, e.outputOffset),
                  (e.outputOffset += r.encode.bytes),
                  (e.inputOffset = t);
              }
            }
          })(1);
        },
        { "buffer-alloc-unsafe": 21, varint: 16 }
      ],
      14: [
        function(e, t, n) {
          t.exports = function e(t, n) {
            var o,
              s = 0,
              n = n || 0,
              a = 0,
              h = n,
              u = t.length;
            do {
              if (h >= u) return (e.bytes = 0), void (e.bytesRead = 0);
              (o = t[h++]),
                (s += a < 28 ? (o & i) << a : (o & i) * Math.pow(2, a)),
                (a += 7);
            } while (o >= r);
            e.bytes = h - n;
            return s;
          };
          var r = 128,
            i = 127;
        },
        {}
      ],
      15: [
        function(e, t, n) {
          arguments[4][7][0].apply(n, arguments);
        },
        { dup: 7 }
      ],
      16: [
        function(e, t, n) {
          arguments[4][8][0].apply(n, arguments);
        },
        { "./decode.js": 14, "./encode.js": 15, "./length.js": 17, dup: 8 }
      ],
      17: [
        function(e, t, n) {
          arguments[4][9][0].apply(n, arguments);
        },
        { dup: 9 }
      ],
      18: [
        function(e, t, n) {
          function r(t) {
            if (!r.supported) return null;
            var n,
              o = t && t.imports,
              s =
                ((n =
                  "AGFzbQEAAAABEANgAn9/AGADf39/AGABfwADBQQAAQICBQUBAQroBwdNBQZtZW1vcnkCAAxibGFrZTJiX2luaXQAAA5ibGFrZTJiX3VwZGF0ZQABDWJsYWtlMmJfZmluYWwAAhBibGFrZTJiX2NvbXByZXNzAAMK00AElgMAIABCADcDACAAQQhqQgA3AwAgAEEQakIANwMAIABBGGpCADcDACAAQSBqQgA3AwAgAEEoakIANwMAIABBMGpCADcDACAAQThqQgA3AwAgAEHAAGpCADcDACAAQcgAakIANwMAIABB0ABqQgA3AwAgAEHYAGpCADcDACAAQeAAakIANwMAIABB6ABqQgA3AwAgAEHwAGpCADcDACAAQfgAakIANwMAIABBgAFqQoiS853/zPmE6gBBACkDAIU3AwAgAEGIAWpCu86qptjQ67O7f0EIKQMAhTcDACAAQZABakKr8NP0r+68tzxBECkDAIU3AwAgAEGYAWpC8e30+KWn/aelf0EYKQMAhTcDACAAQaABakLRhZrv+s+Uh9EAQSApAwCFNwMAIABBqAFqQp/Y+dnCkdqCm39BKCkDAIU3AwAgAEGwAWpC6/qG2r+19sEfQTApAwCFNwMAIABBuAFqQvnC+JuRo7Pw2wBBOCkDAIU3AwAgAEHAAWpCADcDACAAQcgBakIANwMAIABB0AFqQgA3AwALbQEDfyAAQcABaiEDIABByAFqIQQgBCkDAKchBQJAA0AgASACRg0BIAVBgAFGBEAgAyADKQMAIAWtfDcDAEEAIQUgABADCyAAIAVqIAEtAAA6AAAgBUEBaiEFIAFBAWohAQwACwsgBCAFrTcDAAtkAQN/IABBwAFqIQEgAEHIAWohAiABIAEpAwAgAikDAHw3AwAgAEHQAWpCfzcDACACKQMApyEDAkADQCADQYABRg0BIAAgA2pBADoAACADQQFqIQMMAAsLIAIgA603AwAgABADC+U7AiB+CX8gAEGAAWohISAAQYgBaiEiIABBkAFqISMgAEGYAWohJCAAQaABaiElIABBqAFqISYgAEGwAWohJyAAQbgBaiEoICEpAwAhASAiKQMAIQIgIykDACEDICQpAwAhBCAlKQMAIQUgJikDACEGICcpAwAhByAoKQMAIQhCiJLznf/M+YTqACEJQrvOqqbY0Ouzu38hCkKr8NP0r+68tzwhC0Lx7fT4paf9p6V/IQxC0YWa7/rPlIfRACENQp/Y+dnCkdqCm38hDkLr+obav7X2wR8hD0L5wvibkaOz8NsAIRAgACkDACERIABBCGopAwAhEiAAQRBqKQMAIRMgAEEYaikDACEUIABBIGopAwAhFSAAQShqKQMAIRYgAEEwaikDACEXIABBOGopAwAhGCAAQcAAaikDACEZIABByABqKQMAIRogAEHQAGopAwAhGyAAQdgAaikDACEcIABB4ABqKQMAIR0gAEHoAGopAwAhHiAAQfAAaikDACEfIABB+ABqKQMAISAgDSAAQcABaikDAIUhDSAPIABB0AFqKQMAhSEPIAEgBSARfHwhASANIAGFQiCKIQ0gCSANfCEJIAUgCYVCGIohBSABIAUgEnx8IQEgDSABhUIQiiENIAkgDXwhCSAFIAmFQj+KIQUgAiAGIBN8fCECIA4gAoVCIIohDiAKIA58IQogBiAKhUIYiiEGIAIgBiAUfHwhAiAOIAKFQhCKIQ4gCiAOfCEKIAYgCoVCP4ohBiADIAcgFXx8IQMgDyADhUIgiiEPIAsgD3whCyAHIAuFQhiKIQcgAyAHIBZ8fCEDIA8gA4VCEIohDyALIA98IQsgByALhUI/iiEHIAQgCCAXfHwhBCAQIASFQiCKIRAgDCAQfCEMIAggDIVCGIohCCAEIAggGHx8IQQgECAEhUIQiiEQIAwgEHwhDCAIIAyFQj+KIQggASAGIBl8fCEBIBAgAYVCIIohECALIBB8IQsgBiALhUIYiiEGIAEgBiAafHwhASAQIAGFQhCKIRAgCyAQfCELIAYgC4VCP4ohBiACIAcgG3x8IQIgDSAChUIgiiENIAwgDXwhDCAHIAyFQhiKIQcgAiAHIBx8fCECIA0gAoVCEIohDSAMIA18IQwgByAMhUI/iiEHIAMgCCAdfHwhAyAOIAOFQiCKIQ4gCSAOfCEJIAggCYVCGIohCCADIAggHnx8IQMgDiADhUIQiiEOIAkgDnwhCSAIIAmFQj+KIQggBCAFIB98fCEEIA8gBIVCIIohDyAKIA98IQogBSAKhUIYiiEFIAQgBSAgfHwhBCAPIASFQhCKIQ8gCiAPfCEKIAUgCoVCP4ohBSABIAUgH3x8IQEgDSABhUIgiiENIAkgDXwhCSAFIAmFQhiKIQUgASAFIBt8fCEBIA0gAYVCEIohDSAJIA18IQkgBSAJhUI/iiEFIAIgBiAVfHwhAiAOIAKFQiCKIQ4gCiAOfCEKIAYgCoVCGIohBiACIAYgGXx8IQIgDiAChUIQiiEOIAogDnwhCiAGIAqFQj+KIQYgAyAHIBp8fCEDIA8gA4VCIIohDyALIA98IQsgByALhUIYiiEHIAMgByAgfHwhAyAPIAOFQhCKIQ8gCyAPfCELIAcgC4VCP4ohByAEIAggHnx8IQQgECAEhUIgiiEQIAwgEHwhDCAIIAyFQhiKIQggBCAIIBd8fCEEIBAgBIVCEIohECAMIBB8IQwgCCAMhUI/iiEIIAEgBiASfHwhASAQIAGFQiCKIRAgCyAQfCELIAYgC4VCGIohBiABIAYgHXx8IQEgECABhUIQiiEQIAsgEHwhCyAGIAuFQj+KIQYgAiAHIBF8fCECIA0gAoVCIIohDSAMIA18IQwgByAMhUIYiiEHIAIgByATfHwhAiANIAKFQhCKIQ0gDCANfCEMIAcgDIVCP4ohByADIAggHHx8IQMgDiADhUIgiiEOIAkgDnwhCSAIIAmFQhiKIQggAyAIIBh8fCEDIA4gA4VCEIohDiAJIA58IQkgCCAJhUI/iiEIIAQgBSAWfHwhBCAPIASFQiCKIQ8gCiAPfCEKIAUgCoVCGIohBSAEIAUgFHx8IQQgDyAEhUIQiiEPIAogD3whCiAFIAqFQj+KIQUgASAFIBx8fCEBIA0gAYVCIIohDSAJIA18IQkgBSAJhUIYiiEFIAEgBSAZfHwhASANIAGFQhCKIQ0gCSANfCEJIAUgCYVCP4ohBSACIAYgHXx8IQIgDiAChUIgiiEOIAogDnwhCiAGIAqFQhiKIQYgAiAGIBF8fCECIA4gAoVCEIohDiAKIA58IQogBiAKhUI/iiEGIAMgByAWfHwhAyAPIAOFQiCKIQ8gCyAPfCELIAcgC4VCGIohByADIAcgE3x8IQMgDyADhUIQiiEPIAsgD3whCyAHIAuFQj+KIQcgBCAIICB8fCEEIBAgBIVCIIohECAMIBB8IQwgCCAMhUIYiiEIIAQgCCAefHwhBCAQIASFQhCKIRAgDCAQfCEMIAggDIVCP4ohCCABIAYgG3x8IQEgECABhUIgiiEQIAsgEHwhCyAGIAuFQhiKIQYgASAGIB98fCEBIBAgAYVCEIohECALIBB8IQsgBiALhUI/iiEGIAIgByAUfHwhAiANIAKFQiCKIQ0gDCANfCEMIAcgDIVCGIohByACIAcgF3x8IQIgDSAChUIQiiENIAwgDXwhDCAHIAyFQj+KIQcgAyAIIBh8fCEDIA4gA4VCIIohDiAJIA58IQkgCCAJhUIYiiEIIAMgCCASfHwhAyAOIAOFQhCKIQ4gCSAOfCEJIAggCYVCP4ohCCAEIAUgGnx8IQQgDyAEhUIgiiEPIAogD3whCiAFIAqFQhiKIQUgBCAFIBV8fCEEIA8gBIVCEIohDyAKIA98IQogBSAKhUI/iiEFIAEgBSAYfHwhASANIAGFQiCKIQ0gCSANfCEJIAUgCYVCGIohBSABIAUgGnx8IQEgDSABhUIQiiENIAkgDXwhCSAFIAmFQj+KIQUgAiAGIBR8fCECIA4gAoVCIIohDiAKIA58IQogBiAKhUIYiiEGIAIgBiASfHwhAiAOIAKFQhCKIQ4gCiAOfCEKIAYgCoVCP4ohBiADIAcgHnx8IQMgDyADhUIgiiEPIAsgD3whCyAHIAuFQhiKIQcgAyAHIB18fCEDIA8gA4VCEIohDyALIA98IQsgByALhUI/iiEHIAQgCCAcfHwhBCAQIASFQiCKIRAgDCAQfCEMIAggDIVCGIohCCAEIAggH3x8IQQgECAEhUIQiiEQIAwgEHwhDCAIIAyFQj+KIQggASAGIBN8fCEBIBAgAYVCIIohECALIBB8IQsgBiALhUIYiiEGIAEgBiAXfHwhASAQIAGFQhCKIRAgCyAQfCELIAYgC4VCP4ohBiACIAcgFnx8IQIgDSAChUIgiiENIAwgDXwhDCAHIAyFQhiKIQcgAiAHIBt8fCECIA0gAoVCEIohDSAMIA18IQwgByAMhUI/iiEHIAMgCCAVfHwhAyAOIAOFQiCKIQ4gCSAOfCEJIAggCYVCGIohCCADIAggEXx8IQMgDiADhUIQiiEOIAkgDnwhCSAIIAmFQj+KIQggBCAFICB8fCEEIA8gBIVCIIohDyAKIA98IQogBSAKhUIYiiEFIAQgBSAZfHwhBCAPIASFQhCKIQ8gCiAPfCEKIAUgCoVCP4ohBSABIAUgGnx8IQEgDSABhUIgiiENIAkgDXwhCSAFIAmFQhiKIQUgASAFIBF8fCEBIA0gAYVCEIohDSAJIA18IQkgBSAJhUI/iiEFIAIgBiAWfHwhAiAOIAKFQiCKIQ4gCiAOfCEKIAYgCoVCGIohBiACIAYgGHx8IQIgDiAChUIQiiEOIAogDnwhCiAGIAqFQj+KIQYgAyAHIBN8fCEDIA8gA4VCIIohDyALIA98IQsgByALhUIYiiEHIAMgByAVfHwhAyAPIAOFQhCKIQ8gCyAPfCELIAcgC4VCP4ohByAEIAggG3x8IQQgECAEhUIgiiEQIAwgEHwhDCAIIAyFQhiKIQggBCAIICB8fCEEIBAgBIVCEIohECAMIBB8IQwgCCAMhUI/iiEIIAEgBiAffHwhASAQIAGFQiCKIRAgCyAQfCELIAYgC4VCGIohBiABIAYgEnx8IQEgECABhUIQiiEQIAsgEHwhCyAGIAuFQj+KIQYgAiAHIBx8fCECIA0gAoVCIIohDSAMIA18IQwgByAMhUIYiiEHIAIgByAdfHwhAiANIAKFQhCKIQ0gDCANfCEMIAcgDIVCP4ohByADIAggF3x8IQMgDiADhUIgiiEOIAkgDnwhCSAIIAmFQhiKIQggAyAIIBl8fCEDIA4gA4VCEIohDiAJIA58IQkgCCAJhUI/iiEIIAQgBSAUfHwhBCAPIASFQiCKIQ8gCiAPfCEKIAUgCoVCGIohBSAEIAUgHnx8IQQgDyAEhUIQiiEPIAogD3whCiAFIAqFQj+KIQUgASAFIBN8fCEBIA0gAYVCIIohDSAJIA18IQkgBSAJhUIYiiEFIAEgBSAdfHwhASANIAGFQhCKIQ0gCSANfCEJIAUgCYVCP4ohBSACIAYgF3x8IQIgDiAChUIgiiEOIAogDnwhCiAGIAqFQhiKIQYgAiAGIBt8fCECIA4gAoVCEIohDiAKIA58IQogBiAKhUI/iiEGIAMgByARfHwhAyAPIAOFQiCKIQ8gCyAPfCELIAcgC4VCGIohByADIAcgHHx8IQMgDyADhUIQiiEPIAsgD3whCyAHIAuFQj+KIQcgBCAIIBl8fCEEIBAgBIVCIIohECAMIBB8IQwgCCAMhUIYiiEIIAQgCCAUfHwhBCAQIASFQhCKIRAgDCAQfCEMIAggDIVCP4ohCCABIAYgFXx8IQEgECABhUIgiiEQIAsgEHwhCyAGIAuFQhiKIQYgASAGIB58fCEBIBAgAYVCEIohECALIBB8IQsgBiALhUI/iiEGIAIgByAYfHwhAiANIAKFQiCKIQ0gDCANfCEMIAcgDIVCGIohByACIAcgFnx8IQIgDSAChUIQiiENIAwgDXwhDCAHIAyFQj+KIQcgAyAIICB8fCEDIA4gA4VCIIohDiAJIA58IQkgCCAJhUIYiiEIIAMgCCAffHwhAyAOIAOFQhCKIQ4gCSAOfCEJIAggCYVCP4ohCCAEIAUgEnx8IQQgDyAEhUIgiiEPIAogD3whCiAFIAqFQhiKIQUgBCAFIBp8fCEEIA8gBIVCEIohDyAKIA98IQogBSAKhUI/iiEFIAEgBSAdfHwhASANIAGFQiCKIQ0gCSANfCEJIAUgCYVCGIohBSABIAUgFnx8IQEgDSABhUIQiiENIAkgDXwhCSAFIAmFQj+KIQUgAiAGIBJ8fCECIA4gAoVCIIohDiAKIA58IQogBiAKhUIYiiEGIAIgBiAgfHwhAiAOIAKFQhCKIQ4gCiAOfCEKIAYgCoVCP4ohBiADIAcgH3x8IQMgDyADhUIgiiEPIAsgD3whCyAHIAuFQhiKIQcgAyAHIB58fCEDIA8gA4VCEIohDyALIA98IQsgByALhUI/iiEHIAQgCCAVfHwhBCAQIASFQiCKIRAgDCAQfCEMIAggDIVCGIohCCAEIAggG3x8IQQgECAEhUIQiiEQIAwgEHwhDCAIIAyFQj+KIQggASAGIBF8fCEBIBAgAYVCIIohECALIBB8IQsgBiALhUIYiiEGIAEgBiAYfHwhASAQIAGFQhCKIRAgCyAQfCELIAYgC4VCP4ohBiACIAcgF3x8IQIgDSAChUIgiiENIAwgDXwhDCAHIAyFQhiKIQcgAiAHIBR8fCECIA0gAoVCEIohDSAMIA18IQwgByAMhUI/iiEHIAMgCCAafHwhAyAOIAOFQiCKIQ4gCSAOfCEJIAggCYVCGIohCCADIAggE3x8IQMgDiADhUIQiiEOIAkgDnwhCSAIIAmFQj+KIQggBCAFIBl8fCEEIA8gBIVCIIohDyAKIA98IQogBSAKhUIYiiEFIAQgBSAcfHwhBCAPIASFQhCKIQ8gCiAPfCEKIAUgCoVCP4ohBSABIAUgHnx8IQEgDSABhUIgiiENIAkgDXwhCSAFIAmFQhiKIQUgASAFIBx8fCEBIA0gAYVCEIohDSAJIA18IQkgBSAJhUI/iiEFIAIgBiAYfHwhAiAOIAKFQiCKIQ4gCiAOfCEKIAYgCoVCGIohBiACIAYgH3x8IQIgDiAChUIQiiEOIAogDnwhCiAGIAqFQj+KIQYgAyAHIB18fCEDIA8gA4VCIIohDyALIA98IQsgByALhUIYiiEHIAMgByASfHwhAyAPIAOFQhCKIQ8gCyAPfCELIAcgC4VCP4ohByAEIAggFHx8IQQgECAEhUIgiiEQIAwgEHwhDCAIIAyFQhiKIQggBCAIIBp8fCEEIBAgBIVCEIohECAMIBB8IQwgCCAMhUI/iiEIIAEgBiAWfHwhASAQIAGFQiCKIRAgCyAQfCELIAYgC4VCGIohBiABIAYgEXx8IQEgECABhUIQiiEQIAsgEHwhCyAGIAuFQj+KIQYgAiAHICB8fCECIA0gAoVCIIohDSAMIA18IQwgByAMhUIYiiEHIAIgByAVfHwhAiANIAKFQhCKIQ0gDCANfCEMIAcgDIVCP4ohByADIAggGXx8IQMgDiADhUIgiiEOIAkgDnwhCSAIIAmFQhiKIQggAyAIIBd8fCEDIA4gA4VCEIohDiAJIA58IQkgCCAJhUI/iiEIIAQgBSATfHwhBCAPIASFQiCKIQ8gCiAPfCEKIAUgCoVCGIohBSAEIAUgG3x8IQQgDyAEhUIQiiEPIAogD3whCiAFIAqFQj+KIQUgASAFIBd8fCEBIA0gAYVCIIohDSAJIA18IQkgBSAJhUIYiiEFIAEgBSAgfHwhASANIAGFQhCKIQ0gCSANfCEJIAUgCYVCP4ohBSACIAYgH3x8IQIgDiAChUIgiiEOIAogDnwhCiAGIAqFQhiKIQYgAiAGIBp8fCECIA4gAoVCEIohDiAKIA58IQogBiAKhUI/iiEGIAMgByAcfHwhAyAPIAOFQiCKIQ8gCyAPfCELIAcgC4VCGIohByADIAcgFHx8IQMgDyADhUIQiiEPIAsgD3whCyAHIAuFQj+KIQcgBCAIIBF8fCEEIBAgBIVCIIohECAMIBB8IQwgCCAMhUIYiiEIIAQgCCAZfHwhBCAQIASFQhCKIRAgDCAQfCEMIAggDIVCP4ohCCABIAYgHXx8IQEgECABhUIgiiEQIAsgEHwhCyAGIAuFQhiKIQYgASAGIBN8fCEBIBAgAYVCEIohECALIBB8IQsgBiALhUI/iiEGIAIgByAefHwhAiANIAKFQiCKIQ0gDCANfCEMIAcgDIVCGIohByACIAcgGHx8IQIgDSAChUIQiiENIAwgDXwhDCAHIAyFQj+KIQcgAyAIIBJ8fCEDIA4gA4VCIIohDiAJIA58IQkgCCAJhUIYiiEIIAMgCCAVfHwhAyAOIAOFQhCKIQ4gCSAOfCEJIAggCYVCP4ohCCAEIAUgG3x8IQQgDyAEhUIgiiEPIAogD3whCiAFIAqFQhiKIQUgBCAFIBZ8fCEEIA8gBIVCEIohDyAKIA98IQogBSAKhUI/iiEFIAEgBSAbfHwhASANIAGFQiCKIQ0gCSANfCEJIAUgCYVCGIohBSABIAUgE3x8IQEgDSABhUIQiiENIAkgDXwhCSAFIAmFQj+KIQUgAiAGIBl8fCECIA4gAoVCIIohDiAKIA58IQogBiAKhUIYiiEGIAIgBiAVfHwhAiAOIAKFQhCKIQ4gCiAOfCEKIAYgCoVCP4ohBiADIAcgGHx8IQMgDyADhUIgiiEPIAsgD3whCyAHIAuFQhiKIQcgAyAHIBd8fCEDIA8gA4VCEIohDyALIA98IQsgByALhUI/iiEHIAQgCCASfHwhBCAQIASFQiCKIRAgDCAQfCEMIAggDIVCGIohCCAEIAggFnx8IQQgECAEhUIQiiEQIAwgEHwhDCAIIAyFQj+KIQggASAGICB8fCEBIBAgAYVCIIohECALIBB8IQsgBiALhUIYiiEGIAEgBiAcfHwhASAQIAGFQhCKIRAgCyAQfCELIAYgC4VCP4ohBiACIAcgGnx8IQIgDSAChUIgiiENIAwgDXwhDCAHIAyFQhiKIQcgAiAHIB98fCECIA0gAoVCEIohDSAMIA18IQwgByAMhUI/iiEHIAMgCCAUfHwhAyAOIAOFQiCKIQ4gCSAOfCEJIAggCYVCGIohCCADIAggHXx8IQMgDiADhUIQiiEOIAkgDnwhCSAIIAmFQj+KIQggBCAFIB58fCEEIA8gBIVCIIohDyAKIA98IQogBSAKhUIYiiEFIAQgBSARfHwhBCAPIASFQhCKIQ8gCiAPfCEKIAUgCoVCP4ohBSABIAUgEXx8IQEgDSABhUIgiiENIAkgDXwhCSAFIAmFQhiKIQUgASAFIBJ8fCEBIA0gAYVCEIohDSAJIA18IQkgBSAJhUI/iiEFIAIgBiATfHwhAiAOIAKFQiCKIQ4gCiAOfCEKIAYgCoVCGIohBiACIAYgFHx8IQIgDiAChUIQiiEOIAogDnwhCiAGIAqFQj+KIQYgAyAHIBV8fCEDIA8gA4VCIIohDyALIA98IQsgByALhUIYiiEHIAMgByAWfHwhAyAPIAOFQhCKIQ8gCyAPfCELIAcgC4VCP4ohByAEIAggF3x8IQQgECAEhUIgiiEQIAwgEHwhDCAIIAyFQhiKIQggBCAIIBh8fCEEIBAgBIVCEIohECAMIBB8IQwgCCAMhUI/iiEIIAEgBiAZfHwhASAQIAGFQiCKIRAgCyAQfCELIAYgC4VCGIohBiABIAYgGnx8IQEgECABhUIQiiEQIAsgEHwhCyAGIAuFQj+KIQYgAiAHIBt8fCECIA0gAoVCIIohDSAMIA18IQwgByAMhUIYiiEHIAIgByAcfHwhAiANIAKFQhCKIQ0gDCANfCEMIAcgDIVCP4ohByADIAggHXx8IQMgDiADhUIgiiEOIAkgDnwhCSAIIAmFQhiKIQggAyAIIB58fCEDIA4gA4VCEIohDiAJIA58IQkgCCAJhUI/iiEIIAQgBSAffHwhBCAPIASFQiCKIQ8gCiAPfCEKIAUgCoVCGIohBSAEIAUgIHx8IQQgDyAEhUIQiiEPIAogD3whCiAFIAqFQj+KIQUgASAFIB98fCEBIA0gAYVCIIohDSAJIA18IQkgBSAJhUIYiiEFIAEgBSAbfHwhASANIAGFQhCKIQ0gCSANfCEJIAUgCYVCP4ohBSACIAYgFXx8IQIgDiAChUIgiiEOIAogDnwhCiAGIAqFQhiKIQYgAiAGIBl8fCECIA4gAoVCEIohDiAKIA58IQogBiAKhUI/iiEGIAMgByAafHwhAyAPIAOFQiCKIQ8gCyAPfCELIAcgC4VCGIohByADIAcgIHx8IQMgDyADhUIQiiEPIAsgD3whCyAHIAuFQj+KIQcgBCAIIB58fCEEIBAgBIVCIIohECAMIBB8IQwgCCAMhUIYiiEIIAQgCCAXfHwhBCAQIASFQhCKIRAgDCAQfCEMIAggDIVCP4ohCCABIAYgEnx8IQEgECABhUIgiiEQIAsgEHwhCyAGIAuFQhiKIQYgASAGIB18fCEBIBAgAYVCEIohECALIBB8IQsgBiALhUI/iiEGIAIgByARfHwhAiANIAKFQiCKIQ0gDCANfCEMIAcgDIVCGIohByACIAcgE3x8IQIgDSAChUIQiiENIAwgDXwhDCAHIAyFQj+KIQcgAyAIIBx8fCEDIA4gA4VCIIohDiAJIA58IQkgCCAJhUIYiiEIIAMgCCAYfHwhAyAOIAOFQhCKIQ4gCSAOfCEJIAggCYVCP4ohCCAEIAUgFnx8IQQgDyAEhUIgiiEPIAogD3whCiAFIAqFQhiKIQUgBCAFIBR8fCEEIA8gBIVCEIohDyAKIA98IQogBSAKhUI/iiEFICEgISkDACABIAmFhTcDACAiICIpAwAgAiAKhYU3AwAgIyAjKQMAIAMgC4WFNwMAICQgJCkDACAEIAyFhTcDACAlICUpAwAgBSANhYU3AwAgJiAmKQMAIAYgDoWFNwMAICcgJykDACAHIA+FhTcDACAoICgpAwAgCCAQhYU3AwAL"),
                "function" == typeof atob
                  ? new Uint8Array(
                      atob(n)
                        .split("")
                        .map(i)
                    )
                  : new (e("buffer")).Buffer(n, "base64")),
              a = null,
              h = {
                buffer: s,
                memory: null,
                exports: null,
                realloc: function(e) {
                  h.exports.memory.grow(
                    Math.ceil(Math.abs(e - h.memory.length) / 65536)
                  ),
                    (h.memory = new Uint8Array(h.exports.memory.buffer));
                },
                onload: u
              };
            return u(function() {}), h;
            function u(e) {
              if (h.exports) return e();
              if (a) a.then(e.bind(null, null)).catch(e);
              else {
                try {
                  if (t && t.async) throw new Error("async");
                  c({
                    instance: new WebAssembly.Instance(
                      new WebAssembly.Module(s),
                      o
                    )
                  });
                } catch (e) {
                  a = WebAssembly.instantiate(s, o).then(c);
                }
                u(e);
              }
            }
            function c(e) {
              (h.exports = e.instance.exports),
                (h.memory =
                  h.exports.memory &&
                  h.exports.memory.buffer &&
                  new Uint8Array(h.exports.memory.buffer));
            }
          }
          function i(e) {
            return e.charCodeAt(0);
          }
          (t.exports = r), (r.supported = "undefined" != typeof WebAssembly);
        },
        {}
      ],
      19: [
        function(e, t, n) {
          var r = e("nanoassert"),
            i = e("./blake2b")(),
            o = 64,
            s = [];
          t.exports = d;
          var a = (t.exports.BYTES_MIN = 16),
            h = (t.exports.BYTES_MAX = 64),
            u = ((t.exports.BYTES = 32), (t.exports.KEYBYTES_MIN = 16)),
            c = (t.exports.KEYBYTES_MAX = 64),
            f = ((t.exports.KEYBYTES = 32), (t.exports.SALTBYTES = 16)),
            l = (t.exports.PERSONALBYTES = 16);
          function d(e, t, n, p, g) {
            if (!(this instanceof d)) return new d(e, t, n, p, g);
            if (!i || !i.exports)
              throw new Error("WASM not loaded. Wait for Blake2b.ready(cb)");
            e || (e = 32),
              !0 !== g &&
                (r(
                  e >= a,
                  "digestLength must be at least " + a + ", was given " + e
                ),
                r(
                  e <= h,
                  "digestLength must be at most " + h + ", was given " + e
                ),
                null != t &&
                  r(
                    t.length >= u,
                    "key must be at least " + u + ", was given " + t.length
                  ),
                null != t &&
                  r(
                    t.length <= c,
                    "key must be at least " + c + ", was given " + t.length
                  ),
                null != n &&
                  r(
                    n.length === f,
                    "salt must be exactly " + f + ", was given " + n.length
                  ),
                null != p &&
                  r(
                    p.length === l,
                    "personal must be exactly " + l + ", was given " + p.length
                  )),
              s.length || (s.push(o), (o += 216)),
              (this.digestLength = e),
              (this.finalized = !1),
              (this.pointer = s.pop()),
              i.memory.fill(0, 0, 64),
              (i.memory[0] = this.digestLength),
              (i.memory[1] = t ? t.length : 0),
              (i.memory[2] = 1),
              (i.memory[3] = 1),
              n && i.memory.set(n, 32),
              p && i.memory.set(p, 48),
              this.pointer + 216 > i.memory.length &&
                i.realloc(this.pointer + 216),
              i.exports.blake2b_init(this.pointer, this.digestLength),
              t &&
                (this.update(t),
                i.memory.fill(0, o, o + t.length),
                (i.memory[this.pointer + 200] = 128));
          }
          function p() {}
          function g(e) {
            return e < 16 ? "0" + e.toString(16) : e.toString(16);
          }
          (d.prototype.update = function(e) {
            return (
              r(!1 === this.finalized, "Hash instance finalized"),
              r(e, "input must be TypedArray or Buffer"),
              o + e.length > i.memory.length && i.realloc(o + e.length),
              i.memory.set(e, o),
              i.exports.blake2b_update(this.pointer, o, o + e.length),
              this
            );
          }),
            (d.prototype.digest = function(e) {
              if (
                (r(!1 === this.finalized, "Hash instance finalized"),
                (this.finalized = !0),
                s.push(this.pointer),
                i.exports.blake2b_final(this.pointer),
                !e || "binary" === e)
              )
                return i.memory.slice(
                  this.pointer + 128,
                  this.pointer + 128 + this.digestLength
                );
              if ("hex" === e)
                return (function(e, t, n) {
                  for (var r = "", i = 0; i < n; i++) r += g(e[t + i]);
                  return r;
                })(i.memory, this.pointer + 128, this.digestLength);
              r(
                e.length >= this.digestLength,
                "input must be TypedArray or Buffer"
              );
              for (var t = 0; t < this.digestLength; t++)
                e[t] = i.memory[this.pointer + 128 + t];
              return e;
            }),
            (d.prototype.final = d.prototype.digest),
            (d.WASM = i && i.buffer),
            (d.SUPPORTED = "undefined" != typeof WebAssembly),
            (d.ready = function(e) {
              return (
                e || (e = p),
                i
                  ? new Promise(function(t, n) {
                      i.onload(function(r) {
                        r ? n() : t(), e(r);
                      });
                    })
                  : e(new Error("WebAssembly not supported"))
              );
            }),
            (d.prototype.ready = d.ready);
        },
        { "./blake2b": 18, nanoassert: 80 }
      ],
      20: [
        function(e, t, n) {
          var r = e("nanoassert"),
            i = e("blake2b-wasm");
          function o(e, t, n) {
            var r = e[t] + e[n],
              i = e[t + 1] + e[n + 1];
            r >= 4294967296 && i++, (e[t] = r), (e[t + 1] = i);
          }
          function s(e, t, n, r) {
            var i = e[t] + n;
            n < 0 && (i += 4294967296);
            var o = e[t + 1] + r;
            i >= 4294967296 && o++, (e[t] = i), (e[t + 1] = o);
          }
          function a(e, t) {
            return e[t] ^ (e[t + 1] << 8) ^ (e[t + 2] << 16) ^ (e[t + 3] << 24);
          }
          function h(e, t, n, r, i, a) {
            var h = l[i],
              u = l[i + 1],
              c = l[a],
              d = l[a + 1];
            o(f, e, t), s(f, e, h, u);
            var p = f[r] ^ f[e],
              g = f[r + 1] ^ f[e + 1];
            (f[r] = g),
              (f[r + 1] = p),
              o(f, n, r),
              (p = f[t] ^ f[n]),
              (g = f[t + 1] ^ f[n + 1]),
              (f[t] = (p >>> 24) ^ (g << 8)),
              (f[t + 1] = (g >>> 24) ^ (p << 8)),
              o(f, e, t),
              s(f, e, c, d),
              (p = f[r] ^ f[e]),
              (g = f[r + 1] ^ f[e + 1]),
              (f[r] = (p >>> 16) ^ (g << 16)),
              (f[r + 1] = (g >>> 16) ^ (p << 16)),
              o(f, n, r),
              (p = f[t] ^ f[n]),
              (g = f[t + 1] ^ f[n + 1]),
              (f[t] = (g >>> 31) ^ (p << 1)),
              (f[t + 1] = (p >>> 31) ^ (g << 1));
          }
          var u = new Uint32Array([
              4089235720,
              1779033703,
              2227873595,
              3144134277,
              4271175723,
              1013904242,
              1595750129,
              2773480762,
              2917565137,
              1359893119,
              725511199,
              2600822924,
              4215389547,
              528734635,
              327033209,
              1541459225
            ]),
            c = new Uint8Array(
              [
                0,
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15,
                14,
                10,
                4,
                8,
                9,
                15,
                13,
                6,
                1,
                12,
                0,
                2,
                11,
                7,
                5,
                3,
                11,
                8,
                12,
                0,
                5,
                2,
                15,
                13,
                10,
                14,
                3,
                6,
                7,
                1,
                9,
                4,
                7,
                9,
                3,
                1,
                13,
                12,
                11,
                14,
                2,
                6,
                5,
                10,
                4,
                0,
                15,
                8,
                9,
                0,
                5,
                7,
                2,
                4,
                10,
                15,
                14,
                1,
                11,
                12,
                6,
                8,
                3,
                13,
                2,
                12,
                6,
                10,
                0,
                11,
                8,
                3,
                4,
                13,
                7,
                5,
                15,
                14,
                1,
                9,
                12,
                5,
                1,
                15,
                14,
                13,
                4,
                10,
                0,
                7,
                6,
                3,
                9,
                2,
                8,
                11,
                13,
                11,
                7,
                14,
                12,
                1,
                3,
                9,
                5,
                0,
                15,
                4,
                8,
                6,
                2,
                10,
                6,
                15,
                14,
                9,
                11,
                3,
                0,
                8,
                12,
                2,
                13,
                7,
                1,
                4,
                10,
                5,
                10,
                2,
                8,
                4,
                7,
                6,
                1,
                5,
                15,
                11,
                9,
                14,
                3,
                12,
                13,
                0,
                0,
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15,
                14,
                10,
                4,
                8,
                9,
                15,
                13,
                6,
                1,
                12,
                0,
                2,
                11,
                7,
                5,
                3
              ].map(function(e) {
                return 2 * e;
              })
            ),
            f = new Uint32Array(32),
            l = new Uint32Array(32);
          function d(e, t) {
            var n = 0;
            for (n = 0; n < 16; n++) (f[n] = e.h[n]), (f[n + 16] = u[n]);
            for (
              f[24] = f[24] ^ e.t,
                f[25] = f[25] ^ (e.t / 4294967296),
                t && ((f[28] = ~f[28]), (f[29] = ~f[29])),
                n = 0;
              n < 32;
              n++
            )
              l[n] = a(e.b, 4 * n);
            for (n = 0; n < 12; n++)
              h(0, 8, 16, 24, c[16 * n + 0], c[16 * n + 1]),
                h(2, 10, 18, 26, c[16 * n + 2], c[16 * n + 3]),
                h(4, 12, 20, 28, c[16 * n + 4], c[16 * n + 5]),
                h(6, 14, 22, 30, c[16 * n + 6], c[16 * n + 7]),
                h(0, 10, 20, 30, c[16 * n + 8], c[16 * n + 9]),
                h(2, 12, 22, 24, c[16 * n + 10], c[16 * n + 11]),
                h(4, 14, 16, 26, c[16 * n + 12], c[16 * n + 13]),
                h(6, 8, 18, 28, c[16 * n + 14], c[16 * n + 15]);
            for (n = 0; n < 16; n++) e.h[n] = e.h[n] ^ f[n] ^ f[n + 16];
          }
          var p = new Uint8Array([
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]);
          function g(e, t, n, r) {
            p.fill(0),
              (this.b = new Uint8Array(128)),
              (this.h = new Uint32Array(16)),
              (this.t = 0),
              (this.c = 0),
              (this.outlen = e),
              (p[0] = e),
              t && (p[1] = t.length),
              (p[2] = 1),
              (p[3] = 1),
              n && p.set(n, 32),
              r && p.set(r, 48);
            for (var i = 0; i < 16; i++) this.h[i] = u[i] ^ a(p, 4 * i);
            t && (y(this, t), (this.c = 128));
          }
          function y(e, t) {
            for (var n = 0; n < t.length; n++)
              128 === e.c && ((e.t += e.c), d(e, !1), (e.c = 0)),
                (e.b[e.c++] = t[n]);
          }
          function A(e) {
            return e < 16 ? "0" + e.toString(16) : e.toString(16);
          }
          (g.prototype.update = function(e) {
            return (
              r(null != e, "input must be Uint8Array or Buffer"),
              y(this, e),
              this
            );
          }),
            (g.prototype.digest = function(e) {
              var t =
                e && "binary" !== e && "hex" !== e
                  ? e
                  : new Uint8Array(this.outlen);
              return (
                r(
                  t.length >= this.outlen,
                  "out must have at least outlen bytes of space"
                ),
                (function(e, t) {
                  e.t += e.c;
                  for (; e.c < 128; ) e.b[e.c++] = 0;
                  d(e, !0);
                  for (var n = 0; n < e.outlen; n++)
                    t[n] = e.h[n >> 2] >> (8 * (3 & n));
                })(this, t),
                "hex" === e
                  ? (function(e) {
                      for (var t = "", n = 0; n < e.length; n++) t += A(e[n]);
                      return t;
                    })(t)
                  : t
              );
            }),
            (g.prototype.final = g.prototype.digest),
            (g.ready = function(e) {
              i.ready(function() {
                e();
              });
            });
          var b = g;
          (t.exports = function(e, t, n, i, o) {
            return (
              !0 !== o &&
                (r(e >= _, "outlen must be at least " + _ + ", was given " + e),
                r(e <= v, "outlen must be at most " + v + ", was given " + e),
                null != t &&
                  r(
                    t.length >= w,
                    "key must be at least " + w + ", was given " + t.length
                  ),
                null != t &&
                  r(
                    t.length <= m,
                    "key must be at most " + m + ", was given " + t.length
                  ),
                null != n &&
                  r(
                    n.length === I,
                    "salt must be exactly " + I + ", was given " + n.length
                  ),
                null != i &&
                  r(
                    i.length === E,
                    "personal must be exactly " + E + ", was given " + i.length
                  )),
              new b(e, t, n, i)
            );
          }),
            (t.exports.ready = function(e) {
              i.ready(function() {
                e();
              });
            }),
            (t.exports.WASM_SUPPORTED = i.SUPPORTED),
            (t.exports.WASM_LOADED = !1);
          var _ = (t.exports.BYTES_MIN = 16),
            v = (t.exports.BYTES_MAX = 64),
            w = ((t.exports.BYTES = 32), (t.exports.KEYBYTES_MIN = 16)),
            m = (t.exports.KEYBYTES_MAX = 64),
            I = ((t.exports.KEYBYTES = 32), (t.exports.SALTBYTES = 16)),
            E = (t.exports.PERSONALBYTES = 16);
          i.ready(function(e) {
            e || ((t.exports.WASM_LOADED = !0), (b = i));
          });
        },
        { "blake2b-wasm": 19, nanoassert: 80 }
      ],
      21: [
        function(e, t, n) {
          (function(e) {
            t.exports = function(t) {
              if ("number" != typeof t)
                throw new TypeError('"size" argument must be a number');
              if (t < 0)
                throw new RangeError('"size" argument must not be negative');
              return e.allocUnsafe ? e.allocUnsafe(t) : new e(t);
            };
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169 }
      ],
      22: [
        function(e, t, n) {
          (function(n) {
            var r = e("buffer-fill"),
              i = e("buffer-alloc-unsafe");
            t.exports = function(e, t, o) {
              if ("number" != typeof e)
                throw new TypeError('"size" argument must be a number');
              if (e < 0)
                throw new RangeError('"size" argument must not be negative');
              if (n.alloc) return n.alloc(e, t, o);
              var s = i(e);
              return 0 === e
                ? s
                : void 0 === t
                ? r(s, 0)
                : ("string" != typeof o && (o = void 0), r(s, t, o));
            };
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169, "buffer-alloc-unsafe": 21, "buffer-fill": 23 }
      ],
      23: [
        function(e, t, n) {
          (function(e) {
            var n = (function() {
              try {
                if (!e.isEncoding("latin1")) return !1;
                var t = e.alloc ? e.alloc(4) : new e(4);
                return t.fill("ab", "ucs2"), "61006200" === t.toString("hex");
              } catch (e) {
                return !1;
              }
            })();
            function r(e, t, n, r) {
              if (n < 0 || r > e.length)
                throw new RangeError("Out of range index");
              return (
                (n >>>= 0),
                (r = void 0 === r ? e.length : r >>> 0) > n && e.fill(t, n, r),
                e
              );
            }
            t.exports = function(t, i, o, s, a) {
              if (n) return t.fill(i, o, s, a);
              if ("number" == typeof i) return r(t, i, o, s);
              if ("string" == typeof i) {
                if (
                  ("string" == typeof o
                    ? ((a = o), (o = 0), (s = t.length))
                    : "string" == typeof s && ((a = s), (s = t.length)),
                  void 0 !== a && "string" != typeof a)
                )
                  throw new TypeError("encoding must be a string");
                if (
                  ("latin1" === a && (a = "binary"),
                  "string" == typeof a && !e.isEncoding(a))
                )
                  throw new TypeError("Unknown encoding: " + a);
                if ("" === i) return r(t, 0, o, s);
                if (
                  (function(e) {
                    return 1 === e.length && e.charCodeAt(0) < 256;
                  })(i)
                )
                  return r(t, i.charCodeAt(0), o, s);
                i = new e(i, a);
              }
              return e.isBuffer(i)
                ? (function(e, t, n, r) {
                    if (n < 0 || r > e.length)
                      throw new RangeError("Out of range index");
                    if (r <= n) return e;
                    (n >>>= 0), (r = void 0 === r ? e.length : r >>> 0);
                    for (var i = n, o = t.length; i <= r - o; )
                      t.copy(e, i), (i += o);
                    return i !== r && t.copy(e, i, 0, r - i), e;
                  })(t, i, o, s)
                : r(t, 0, o, s);
            };
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169 }
      ],
      24: [
        function(e, t, n) {
          (function(e) {
            var n = Object.prototype.toString,
              r =
                "function" == typeof e.alloc &&
                "function" == typeof e.allocUnsafe &&
                "function" == typeof e.from;
            t.exports = function(t, i, o) {
              if ("number" == typeof t)
                throw new TypeError('"value" argument must not be a number');
              return (
                (s = t),
                "ArrayBuffer" === n.call(s).slice(8, -1)
                  ? (function(t, n, i) {
                      n >>>= 0;
                      var o = t.byteLength - n;
                      if (o < 0)
                        throw new RangeError("'offset' is out of bounds");
                      if (void 0 === i) i = o;
                      else if ((i >>>= 0) > o)
                        throw new RangeError("'length' is out of bounds");
                      return r
                        ? e.from(t.slice(n, n + i))
                        : new e(new Uint8Array(t.slice(n, n + i)));
                    })(t, i, o)
                  : "string" == typeof t
                  ? (function(t, n) {
                      if (
                        (("string" == typeof n && "" !== n) || (n = "utf8"),
                        !e.isEncoding(n))
                      )
                        throw new TypeError(
                          '"encoding" must be a valid string encoding'
                        );
                      return r ? e.from(t, n) : new e(t, n);
                    })(t, i)
                  : r
                  ? e.from(t)
                  : new e(t)
              );
              var s;
            };
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169 }
      ],
      25: [
        function(e, t, n) {
          var r = e("readable-stream"),
            i = e("inherits"),
            o = e("buffer-from")([0]),
            s = function(e, t, n) {
              if (!(this instanceof s)) return new s(e, t, n);
              "function" == typeof e && ((n = t), (t = e), (e = {})),
                r.Writable.call(this, e),
                (this._worker = t),
                (this._flush = n),
                (this.destroyed = !1);
            };
          i(s, r.Writable),
            (s.obj = function(e, t, n) {
              return "function" == typeof e
                ? s.obj(null, e, t)
                : (e || (e = {}), (e.objectMode = !0), new s(e, t, n));
            }),
            (s.prototype.end = function(e, t, n) {
              return this._flush
                ? "function" == typeof e
                  ? this.end(null, null, e)
                  : "function" == typeof t
                  ? this.end(e, null, t)
                  : (e && this.write(e),
                    this._writableState.ending || this.write(o),
                    r.Writable.prototype.end.call(this, n))
                : r.Writable.prototype.end.apply(this, arguments);
            }),
            (s.prototype.destroy = function(e) {
              this.destroyed ||
                ((this.destroyed = !0),
                e && this.emit("error"),
                this.emit("close"));
            }),
            (s.prototype._write = function(e, t, n) {
              e === o ? this._flush(n) : this._worker([e], n);
            }),
            (s.prototype._writev = function(e, t) {
              var n = e.length;
              if (e[e.length - 1].chunk === o && ((t = this._flusher(t)), !--n))
                return t();
              for (var r = new Array(n), i = 0; i < n; i++) r[i] = e[i].chunk;
              this._worker(r, t);
            }),
            (s.prototype._flusher = function(e) {
              var t = this;
              return function(n) {
                if (n) return e(n);
                t._flush(e);
              };
            }),
            (t.exports = s);
        },
        { "buffer-from": 24, inherits: 64, "readable-stream": 117 }
      ],
      26: [
        function(e, t, n) {
          (function(e) {
            t.exports = r;
            var n = e.from && e.from !== Uint8Array.from ? e.from : e;
            function r(e) {
              if ("object" == typeof e && e && e.encode && e.decode) return e;
              switch (e) {
                case "ndjson":
                  return r.ndjson;
                case "json":
                  return r.json;
                case "ascii":
                  return r.ascii;
                case "utf-8":
                case "utf8":
                  return r.utf8;
                case "hex":
                  return r.hex;
                case "base64":
                  return r.base64;
                case "ucs-2":
                case "ucs2":
                  return r.ucs2;
                case "utf16-le":
                case "utf16le":
                  return r.utf16le;
              }
              return r.binary;
            }
            function i(t) {
              return {
                encode: t
                  ? function(t) {
                      return new e(JSON.stringify(t) + "\n");
                    }
                  : function(t) {
                      return new e(JSON.stringify(t));
                    },
                decode: function(e) {
                  return JSON.parse(e.toString());
                }
              };
            }
            function o(e) {
              return {
                encode: function(t) {
                  return "string" != typeof t && (t = t.toString()), n(t, e);
                },
                decode: function(t) {
                  return t.toString(e);
                }
              };
            }
            (r.ascii = o("ascii")),
              (r.utf8 = o("utf-8")),
              (r.hex = o("hex")),
              (r.base64 = o("base64")),
              (r.ucs2 = o("ucs2")),
              (r.utf16le = o("utf16le")),
              (r.ndjson = i(!0)),
              (r.json = i(!1)),
              (r.binary = {
                encode: function(e) {
                  return "string" == typeof e ? n(e, "utf-8") : e;
                },
                decode: function(e) {
                  return e;
                }
              });
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169 }
      ],
      27: [
        function(e, t, n) {
          (function(e) {
            function t(e) {
              return Object.prototype.toString.call(e);
            }
            (n.isArray = function(e) {
              return Array.isArray
                ? Array.isArray(e)
                : "[object Array]" === t(e);
            }),
              (n.isBoolean = function(e) {
                return "boolean" == typeof e;
              }),
              (n.isNull = function(e) {
                return null === e;
              }),
              (n.isNullOrUndefined = function(e) {
                return null == e;
              }),
              (n.isNumber = function(e) {
                return "number" == typeof e;
              }),
              (n.isString = function(e) {
                return "string" == typeof e;
              }),
              (n.isSymbol = function(e) {
                return "symbol" == typeof e;
              }),
              (n.isUndefined = function(e) {
                return void 0 === e;
              }),
              (n.isRegExp = function(e) {
                return "[object RegExp]" === t(e);
              }),
              (n.isObject = function(e) {
                return "object" == typeof e && null !== e;
              }),
              (n.isDate = function(e) {
                return "[object Date]" === t(e);
              }),
              (n.isError = function(e) {
                return "[object Error]" === t(e) || e instanceof Error;
              }),
              (n.isFunction = function(e) {
                return "function" == typeof e;
              }),
              (n.isPrimitive = function(e) {
                return (
                  null === e ||
                  "boolean" == typeof e ||
                  "number" == typeof e ||
                  "string" == typeof e ||
                  "symbol" == typeof e ||
                  void 0 === e
                );
              }),
              (n.isBuffer = e.isBuffer);
          }.call(this, {
            isBuffer: e("../../../../../../node_modules/is-buffer/index.js")
          }));
        },
        { "../../../../../../node_modules/is-buffer/index.js": 172 }
      ],
      28: [
        function(e, t, n) {
          t.exports = function(e) {
            var t = 32;
            return (
              (e &= -e) && t--,
              65535 & e && (t -= 16),
              16711935 & e && (t -= 8),
              252645135 & e && (t -= 4),
              858993459 & e && (t -= 2),
              1431655765 & e && (t -= 1),
              t
            );
          };
        },
        {}
      ],
      29: [
        function(e, t, n) {
          !(function(e) {
            "use strict";
            var n = 0,
              r = Math.pow(36, 4),
              i = function(e, t) {
                var n = "000000000" + e;
                return n.substr(n.length - t);
              },
              o = function() {
                return i(((Math.random() * r) << 0).toString(36), 4);
              },
              s = function() {
                return (n = n < r ? n : 0), ++n - 1;
              },
              a = function() {
                var e = new Date().getTime().toString(36),
                  t = a.fingerprint(),
                  n = o() + o();
                return "c" + e + i(s().toString(36), 4) + t + n;
              };
            (a.slug = function() {
              var e,
                t = new Date().getTime().toString(36),
                n = a.fingerprint().slice(0, 1) + a.fingerprint().slice(-1),
                r = o().slice(-2);
              return (
                (e = s()
                  .toString(36)
                  .slice(-4)),
                t.slice(-2) + e + n + r
              );
            }),
              (a.globalCount = function() {
                var e = (function() {
                  var e,
                    t = 0;
                  for (e in window) t++;
                  return t;
                })();
                return (
                  (a.globalCount = function() {
                    return e;
                  }),
                  e
                );
              }),
              (a.fingerprint = function() {
                return i(
                  (
                    navigator.mimeTypes.length + navigator.userAgent.length
                  ).toString(36) + a.globalCount().toString(36),
                  4
                );
              }),
              e.register
                ? e.register("cuid", a)
                : void 0 !== t
                ? (t.exports = a)
                : (e.cuid = a);
          })(this.applitude || this);
        },
        {}
      ],
      30: [
        function(e, t, n) {
          "use strict";
          var r = e("safe-buffer").Buffer;
          function i(e) {
            if ("string" == typeof e) return i(o(e));
            if (!r.isBuffer(e)) throw new Error("Not a buffer");
            if (32 !== e.length) throw new Error("Invalid buffer");
            return e.toString("hex");
          }
          function o(e) {
            if (r.isBuffer(e)) return o(i(e));
            if ("string" != typeof e) throw new Error("Not a string");
            var t = /([a-f0-9]{64,65})/i.exec(e);
            if (!t || 64 !== t[1].length) throw new Error("Invalid key");
            return r.from(t[1], "hex");
          }
          (n.encode = n.toStr = i), (n.decode = n.toBuf = o);
        },
        { "safe-buffer": 120 }
      ],
      31: [
        function(e, t, n) {
          (function(n) {
            var r = e("events"),
              i = e("./"),
              o = e("./proxystream");
            t.exports = class extends r {
              constructor(e) {
                super();
                var t = e.connection;
                if (!t)
                  throw new TypeError("Must specify `connection` in options");
                (this.connecting = 0),
                  (this.queued = 0),
                  (this.connected = 0),
                  (this._handleOpen = this._handleOpen.bind(this)),
                  (this._handleEnd = this._handleEnd.bind(this)),
                  e.stream && (this._replicate = e.stream),
                  (this._channels = new Set()),
                  this.reconnect(t);
              }
              reconnect(e) {
                this._protocol &&
                  (this._protocol.removeListener("close", this._handleEnd),
                  this._protocol.end()),
                  (this._protocol = new i(e)),
                  this._protocol.on("swarm:open", this._handleOpen),
                  this._protocol.connect(),
                  this._protocol.once("close", this._handleEnd);
                for (let e of this._channels) this.join(e);
              }
              _handleEnd() {
                (this._protocol = null), this.emit("disconnected");
              }
              _handleOpen(e, t) {
                var n = new o(this._protocol, e),
                  r = {
                    type: "proxy",
                    initiator: !1,
                    id: null,
                    host: e.toString("hex"),
                    port: -1,
                    channel: t
                  },
                  i = this._replicate(r),
                  s = this;
                s.emit("handshaking", n, r),
                  i.once("handshake", function(e) {
                    if (e) {
                      var t = e.toString("hex");
                      r.id = t;
                    }
                    s.emit("connection", n, r);
                  }),
                  i.pipe(n).pipe(i);
              }
              join(e, t, r) {
                "string" == typeof e && (e = n.from(e, "hex")),
                  r || "function" != typeof t || (r = t),
                  this._protocol.join(e),
                  this._channels.add(e.toString("hex")),
                  r && r();
              }
              leave(e, t) {
                "string" == typeof e && (e = n.from(e, "hex")),
                  this._protocol.leave(e),
                  this._channels.delete(e.toString("hex")),
                  t && t();
              }
              listen() {}
              close(e) {
                this._protocol.end(e);
              }
              _replicate(e) {
                throw new Error("Missing `stream` in options");
              }
            };
          }.call(this, e("buffer").Buffer));
        },
        { "./": 32, "./proxystream": 34, buffer: 169, events: 170 }
      ],
      32: [
        function(e, t, n) {
          var r = e("readable-stream").Duplex,
            i = e("length-prefixed-stream"),
            o = e("./messages");
          t.exports = class extends r {
            constructor(e) {
              super(),
                this.setMaxListeners(256),
                e
                  .pipe(i.decode())
                  .pipe(this)
                  .pipe(i.encode())
                  .pipe(e);
            }
            sendEvent(e, t, n) {
              this.push(
                o.SwarmEvent.encode({ type: o.EventType[e], id: t, data: n })
              );
            }
            connect() {
              this.sendEvent("CONNECT");
            }
            join(e) {
              this.sendEvent("JOIN", e);
            }
            leave(e) {
              this.sendEvent("LEAVE", e);
            }
            openStream(e, t) {
              this.sendEvent("OPEN", e, t);
            }
            closeStream(e) {
              this.sendEvent("CLOSE", e);
            }
            streamData(e, t) {
              this.sendEvent("DATA", e, t);
            }
            _write(e, t, n) {
              try {
                var r = o.SwarmEvent.decode(e);
                switch (r.type) {
                  case o.EventType.CONNECT:
                    this.emit("swarm:connect");
                    break;
                  case o.EventType.JOIN:
                    this.emit("swarm:join", r.id);
                    break;
                  case o.EventType.LEAVE:
                    this.emit("swarm:leave", r.id);
                    break;
                  case o.EventType.OPEN:
                    this.emit("swarm:open", r.id, r.data);
                    break;
                  case o.EventType.CLOSE:
                    this.emit("swarm:close", r.id);
                    break;
                  case o.EventType.DATA:
                    this.emit("swarm:data", r.id, r.data);
                }
                n();
              } catch (e) {
                n(e);
              }
            }
            _read() {}
          };
        },
        {
          "./messages": 33,
          "length-prefixed-stream": 71,
          "readable-stream": 117
        }
      ],
      33: [
        function(e, t, n) {
          (function(t) {
            var r = e("protocol-buffers-encodings"),
              i = r.varint,
              o = r.skip;
            n.EventType = {
              CONNECT: 1,
              JOIN: 2,
              LEAVE: 3,
              OPEN: 4,
              CLOSE: 5,
              DATA: 6
            };
            var s = (n.SwarmEvent = {
              buffer: !0,
              encodingLength: null,
              encode: null,
              decode: null
            });
            function a(e) {
              return null != e && ("number" != typeof e || !isNaN(e));
            }
            !(function() {
              var e = [r.enum, r.bytes];
              function n(t) {
                var n = 0;
                if (!a(t.type)) throw new Error("type is required");
                var r = e[0].encodingLength(t.type);
                if (((n += 1 + r), a(t.id))) {
                  var r = e[1].encodingLength(t.id);
                  n += 1 + r;
                }
                if (a(t.data)) {
                  var r = e[1].encodingLength(t.data);
                  n += 1 + r;
                }
                return n;
              }
              (s.encodingLength = n),
                (s.encode = function r(i, o, s) {
                  s || (s = 0);
                  o || (o = t.allocUnsafe(n(i)));
                  var h = s;
                  if (!a(i.type)) throw new Error("type is required");
                  o[s++] = 8;
                  e[0].encode(i.type, o, s);
                  s += e[0].encode.bytes;
                  a(i.id) &&
                    ((o[s++] = 18),
                    e[1].encode(i.id, o, s),
                    (s += e[1].encode.bytes));
                  a(i.data) &&
                    ((o[s++] = 26),
                    e[1].encode(i.data, o, s),
                    (s += e[1].encode.bytes));
                  r.bytes = s - h;
                  return o;
                }),
                (s.decode = function t(n, r, s) {
                  r || (r = 0);
                  s || (s = n.length);
                  if (!(s <= n.length && r <= n.length))
                    throw new Error("Decoded message is not valid");
                  var a = r;
                  var h = { type: 1, id: null, data: null };
                  var u = !1;
                  for (;;) {
                    if (s <= r) {
                      if (!u) throw new Error("Decoded message is not valid");
                      return (t.bytes = r - a), h;
                    }
                    var c = i.decode(n, r);
                    r += i.decode.bytes;
                    var f = c >> 3;
                    switch (f) {
                      case 1:
                        (h.type = e[0].decode(n, r)),
                          (r += e[0].decode.bytes),
                          (u = !0);
                        break;
                      case 2:
                        (h.id = e[1].decode(n, r)), (r += e[1].decode.bytes);
                        break;
                      case 3:
                        (h.data = e[1].decode(n, r)), (r += e[1].decode.bytes);
                        break;
                      default:
                        r = o(7 & c, n, r);
                    }
                  }
                });
            })();
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169, "protocol-buffers-encodings": 87 }
      ],
      34: [
        function(e, t, n) {
          var r = e("readable-stream").Duplex;
          t.exports = class extends r {
            constructor(e, t) {
              super(),
                (this._id = t),
                (this._protocol = e),
                (this._isClosed = !1),
                (this._handle_data = this._handleData.bind(this)),
                (this._handle_close = this._handleClose.bind(this)),
                this._protocol.on("swarm:data", this._handle_data),
                this._protocol.on("swarm:close", this._handle_close);
            }
            _handleData(e, t) {
              this._isId(e) && this.push(t);
            }
            _handleClose(e) {
              this._isId(e) &&
                (this.end(), this.emit("close"), this._cleanup());
            }
            _cleanup() {
              (this._isClosed = !0),
                this._protocol.removeListener("swarm:data", this._handle_data),
                this._protocol.removeListener(
                  "swarm:close",
                  this._handle_close
                );
            }
            _isId(e) {
              return e.toString("hex") === this._id.toString("hex");
            }
            _read() {}
            _write(e, t, n) {
              this._protocol.streamData(this._id, e), n();
            }
            _final(e) {
              this._isClosed ||
                (this._protocol.closeStream(this._id), this._cleanup()),
                e();
            }
          };
        },
        { "readable-stream": 117 }
      ],
      35: [
        function(e, t, n) {
          const r = e("signalhubws"),
            i = e("@geut/discovery-swarm-webrtc"),
            o = e("discovery-swarm-stream/client"),
            s = e("websocket-stream"),
            a = e("randombytes"),
            h = e("events"),
            u = ["wss://signalhubws.mauve.moe"],
            c = "wss://discoveryswarm.mauve.moe",
            f = "ws://localhost:3472",
            l = "discovery-swarm-web",
            d = 1 / 0,
            p = 2e3,
            g = 5e3,
            y = e =>
              `Could not connect to local gateway at ${f}, trying remote gateway at ${e}.\nThis isn't an error unless you're trying to use a local gateway. 😁`,
            A = self.location.href.startsWith("https");
          class b extends h {
            constructor(e = {}) {
              super();
              const t = e.signalhub || u,
                n = e.discovery || c,
                o = e.id || a(32),
                s = e.stream;
              (this.id = o),
                (this.stream = s),
                (this.maxConnections = e.maxConnections || d);
              const h =
                "object" == typeof t && !Array.isArray(t) ? t : r(l, t.map(v));
              (this.channels = new Map()),
                (this.hub = h),
                (this.webrtc = i({ id: o, stream: s, hub: h })),
                (this.dss = new _({ id: o, stream: s, discovery: v(n) })),
                this.webrtc.on("connection", (e, t) =>
                  this._handleConnection(e, t)
                ),
                this.dss.on("connection", (e, t) =>
                  this._handleConnection(e, t)
                );
            }
            _handleConnection(e, t) {
              const n = t.channel.toString("hex"),
                r = this.channels.get(n);
              if (r >= this.maxConnections) e.end();
              else {
                this.channels.set(n, r + 1);
                let i = !1;
                const o = () => {
                  if (i) return;
                  if (((i = !0), !this.channels.has(n))) return;
                  const e = this.channels.get(n);
                  this.channels.set(n, e - 1),
                    e || (this.leave(n), this.join(n));
                };
                e.once("close", o),
                  e.once("error", o),
                  this.emit("connection", e, t);
              }
            }
            join(e, t = {}) {
              const n = e.toString("hex");
              if (this.channels.has(n)) return;
              this.channels.set(n, 0), this.webrtc.join(e, t);
              const r = () => {
                  this.channels.has(n) &&
                    (this.removeListener("connection", i), this.dss.join(e, t));
                },
                i = (e, t) => {
                  t.channel.toString("hex") === n &&
                    (this.removeListener("connection", i),
                    clearTimeout(o),
                    (o = setTimeout(r, g)));
                };
              let o = setTimeout(r, p);
              this.on("connection", i);
            }
            leave(e) {
              const t = e.toString("hex");
              this.channels.has(t) &&
                (this.channels.delete(t),
                this.webrtc.leave(e),
                this.dss.leave(e));
            }
            listen() {
              setTimeout(() => {
                this.emit("listening");
              }, 0);
            }
            address() {
              return { port: -1 };
            }
            close(e) {
              this.dss.close(() => {
                this.webrtc.close(e);
              });
            }
            destroy(e) {
              this.close(e);
            }
          }
          class _ extends o {
            constructor(e) {
              const t = e.discovery,
                n = e.stream,
                r = e.id;
              let i = null;
              try {
                i = s(f);
              } catch (e) {
                console.warn(y(t), e), (i = s(t));
              }
              super({ id: r, connection: i, stream: n }),
                (this.connection = i),
                (this._handleDisconnected = () => {
                  this._reconnect();
                }),
                (this.discoveryURL = t),
                this.connection.once("error", this._handleDisconnected),
                this.on("disconnected", this._handleDisconnected);
            }
            _reconnect() {
              (this.connection = s(this.discoveryURL)),
                this.reconnect(this.connection);
            }
            close(e) {
              this.removeListener("disconnected", this._handleDisconnected),
                (this.connection = null),
                super.close(e);
            }
          }
          function v(e) {
            return A
              ? e.startsWith("http:")
                ? "https:" + e.slice(6)
                : e.startsWith("ws:")
                ? "wss:" + e.slice(3)
                : e
              : e.startsWith("https:")
              ? "http:" + e.slice(7)
              : e.startsWith("wss:")
              ? "ws:" + e.slice(4)
              : e;
          }
          (t.exports = e => new b(e)),
            (t.exports.DiscoverySwarmWeb = b),
            (t.exports.DiscoverySwarmStreamWebsocket = _);
        },
        {
          "@geut/discovery-swarm-webrtc": 2,
          "discovery-swarm-stream/client": 31,
          events: 170,
          randombytes: 107,
          signalhubws: 121,
          "websocket-stream": 157
        }
      ],
      36: [
        function(e, t, n) {
          (function(n, r) {
            var i = e("readable-stream"),
              o = e("end-of-stream"),
              s = e("inherits"),
              a = e("stream-shift"),
              h =
                r.from && r.from !== Uint8Array.from ? r.from([0]) : new r([0]),
              u = function(e, t) {
                e._corked ? e.once("uncork", t) : t();
              },
              c = function(e, t) {
                return function(n) {
                  n
                    ? (function(e, t) {
                        e._autoDestroy && e.destroy(t);
                      })(e, "premature close" === n.message ? null : n)
                    : t && !e._ended && e.end();
                };
              },
              f = function(e, t, n) {
                if (!(this instanceof f)) return new f(e, t, n);
                i.Duplex.call(this, n),
                  (this._writable = null),
                  (this._readable = null),
                  (this._readable2 = null),
                  (this._autoDestroy = !n || !1 !== n.autoDestroy),
                  (this._forwardDestroy = !n || !1 !== n.destroy),
                  (this._forwardEnd = !n || !1 !== n.end),
                  (this._corked = 1),
                  (this._ondrain = null),
                  (this._drained = !1),
                  (this._forwarding = !1),
                  (this._unwrite = null),
                  (this._unread = null),
                  (this._ended = !1),
                  (this.destroyed = !1),
                  e && this.setWritable(e),
                  t && this.setReadable(t);
              };
            s(f, i.Duplex),
              (f.obj = function(e, t, n) {
                return (
                  n || (n = {}),
                  (n.objectMode = !0),
                  (n.highWaterMark = 16),
                  new f(e, t, n)
                );
              }),
              (f.prototype.cork = function() {
                1 == ++this._corked && this.emit("cork");
              }),
              (f.prototype.uncork = function() {
                this._corked && 0 == --this._corked && this.emit("uncork");
              }),
              (f.prototype.setWritable = function(e) {
                if ((this._unwrite && this._unwrite(), this.destroyed))
                  e && e.destroy && e.destroy();
                else if (null !== e && !1 !== e) {
                  var t = this,
                    r = o(
                      e,
                      { writable: !0, readable: !1 },
                      c(this, this._forwardEnd)
                    ),
                    i = function() {
                      var e = t._ondrain;
                      (t._ondrain = null), e && e();
                    };
                  this._unwrite && n.nextTick(i),
                    (this._writable = e),
                    this._writable.on("drain", i),
                    (this._unwrite = function() {
                      t._writable.removeListener("drain", i), r();
                    }),
                    this.uncork();
                } else this.end();
              }),
              (f.prototype.setReadable = function(e) {
                if ((this._unread && this._unread(), this.destroyed))
                  e && e.destroy && e.destroy();
                else {
                  if (null === e || !1 === e)
                    return this.push(null), void this.resume();
                  var t,
                    n = this,
                    r = o(e, { writable: !1, readable: !0 }, c(this)),
                    s = function() {
                      n._forward();
                    },
                    a = function() {
                      n.push(null);
                    };
                  (this._drained = !0),
                    (this._readable = e),
                    (this._readable2 = e._readableState
                      ? e
                      : ((t = e),
                        new i.Readable({
                          objectMode: !0,
                          highWaterMark: 16
                        }).wrap(t))),
                    this._readable2.on("readable", s),
                    this._readable2.on("end", a),
                    (this._unread = function() {
                      n._readable2.removeListener("readable", s),
                        n._readable2.removeListener("end", a),
                        r();
                    }),
                    this._forward();
                }
              }),
              (f.prototype._read = function() {
                (this._drained = !0), this._forward();
              }),
              (f.prototype._forward = function() {
                if (!this._forwarding && this._readable2 && this._drained) {
                  var e;
                  for (
                    this._forwarding = !0;
                    this._drained && null !== (e = a(this._readable2));

                  )
                    this.destroyed || (this._drained = this.push(e));
                  this._forwarding = !1;
                }
              }),
              (f.prototype.destroy = function(e) {
                if (!this.destroyed) {
                  this.destroyed = !0;
                  var t = this;
                  n.nextTick(function() {
                    t._destroy(e);
                  });
                }
              }),
              (f.prototype._destroy = function(e) {
                if (e) {
                  var t = this._ondrain;
                  (this._ondrain = null), t ? t(e) : this.emit("error", e);
                }
                this._forwardDestroy &&
                  (this._readable &&
                    this._readable.destroy &&
                    this._readable.destroy(),
                  this._writable &&
                    this._writable.destroy &&
                    this._writable.destroy()),
                  this.emit("close");
              }),
              (f.prototype._write = function(e, t, n) {
                return this.destroyed
                  ? n()
                  : this._corked
                  ? u(this, this._write.bind(this, e, t, n))
                  : e === h
                  ? this._finish(n)
                  : this._writable
                  ? void (!1 === this._writable.write(e)
                      ? (this._ondrain = n)
                      : n())
                  : n();
              }),
              (f.prototype._finish = function(e) {
                var t = this;
                this.emit("preend"),
                  u(this, function() {
                    var n, r;
                    (n = t._forwardEnd && t._writable),
                      (r = function() {
                        !1 === t._writableState.prefinished &&
                          (t._writableState.prefinished = !0),
                          t.emit("prefinish"),
                          u(t, e);
                      }),
                      n
                        ? n._writableState && n._writableState.finished
                          ? r()
                          : n._writableState
                          ? n.end(r)
                          : (n.end(), r())
                        : r();
                  });
              }),
              (f.prototype.end = function(e, t, n) {
                return "function" == typeof e
                  ? this.end(null, null, e)
                  : "function" == typeof t
                  ? this.end(e, null, t)
                  : ((this._ended = !0),
                    e && this.write(e),
                    this._writableState.ending || this.write(h),
                    i.Writable.prototype.end.call(this, n));
              }),
              (t.exports = f);
          }.call(this, e("_process"), e("buffer").Buffer));
        },
        {
          _process: 175,
          buffer: 169,
          "end-of-stream": 37,
          inherits: 64,
          "readable-stream": 117,
          "stream-shift": 145
        }
      ],
      37: [
        function(e, t, n) {
          (function(n) {
            var r = e("once"),
              i = function() {},
              o = function(e, t, s) {
                if ("function" == typeof t) return o(e, null, t);
                t || (t = {}), (s = r(s || i));
                var a = e._writableState,
                  h = e._readableState,
                  u = t.readable || (!1 !== t.readable && e.readable),
                  c = t.writable || (!1 !== t.writable && e.writable),
                  f = !1,
                  l = function() {
                    e.writable || d();
                  },
                  d = function() {
                    (c = !1), u || s.call(e);
                  },
                  p = function() {
                    (u = !1), c || s.call(e);
                  },
                  g = function(t) {
                    s.call(
                      e,
                      t ? new Error("exited with error code: " + t) : null
                    );
                  },
                  y = function(t) {
                    s.call(e, t);
                  },
                  A = function() {
                    n.nextTick(b);
                  },
                  b = function() {
                    if (!f)
                      return (!u || (h && h.ended && !h.destroyed)) &&
                        (!c || (a && a.ended && !a.destroyed))
                        ? void 0
                        : s.call(e, new Error("premature close"));
                  },
                  _ = function() {
                    e.req.on("finish", d);
                  };
                return (
                  !(function(e) {
                    return e.setHeader && "function" == typeof e.abort;
                  })(e)
                    ? c && !a && (e.on("end", l), e.on("close", l))
                    : (e.on("complete", d),
                      e.on("abort", A),
                      e.req ? _() : e.on("request", _)),
                  (function(e) {
                    return (
                      e.stdio && Array.isArray(e.stdio) && 3 === e.stdio.length
                    );
                  })(e) && e.on("exit", g),
                  e.on("end", p),
                  e.on("finish", d),
                  !1 !== t.error && e.on("error", y),
                  e.on("close", A),
                  function() {
                    (f = !0),
                      e.removeListener("complete", d),
                      e.removeListener("abort", A),
                      e.removeListener("request", _),
                      e.req && e.req.removeListener("finish", d),
                      e.removeListener("end", l),
                      e.removeListener("close", l),
                      e.removeListener("finish", d),
                      e.removeListener("exit", g),
                      e.removeListener("end", p),
                      e.removeListener("error", y),
                      e.removeListener("close", A);
                  }
                );
              };
            t.exports = o;
          }.call(this, e("_process")));
        },
        { _process: 175, once: 84 }
      ],
      38: [
        function(e, t, n) {
          "use strict";
          const r = e("count-trailing-zeros");
          t.exports = () => new c();
          class i {
            constructor(e) {
              const t = new Uint8Array(e ? 8456 : 4360),
                n = t.byteOffset;
              (this.buffer = t),
                (this.bits = e ? null : new Uint32Array(t.buffer, n, 1024)),
                (this.children = e ? new Array(32768) : null),
                (this.level = e),
                (this.allOne = e
                  ? [
                      new Uint32Array(t.buffer, n, 1024),
                      new Uint32Array(t.buffer, n + 4096, 32),
                      new Uint32Array(t.buffer, n + 4224, 1)
                    ]
                  : [
                      this.bits,
                      new Uint32Array(t.buffer, n + 4096, 32),
                      new Uint32Array(t.buffer, n + 4224, 1)
                    ]),
                (this.oneOne = e
                  ? [
                      new Uint32Array(t.buffer, n + 4228, 1024),
                      new Uint32Array(t.buffer, n + 8324, 32),
                      new Uint32Array(t.buffer, n + 8452, 1)
                    ]
                  : [
                      this.bits,
                      new Uint32Array(t.buffer, n + 4228, 32),
                      new Uint32Array(t.buffer, n + 4356, 1)
                    ]);
            }
          }
          const o = [new i(0), new i(1), new i(2), new i(3)],
            s = new Uint32Array(32),
            a = new Uint32Array(32);
          for (var h = 0; h < 32; h++)
            (s[h] = Math.pow(2, 31 - h) - 1), (a[h] = Math.pow(2, 32 - h) - 1);
          const u = 255 === new Uint8Array(s.buffer, s.byteOffset, 1)[0];
          class c {
            constructor() {
              (this.length = 32768),
                (this.littleEndian = u),
                (this._path = new Uint16Array(5)),
                (this._offsets = new Uint16Array(
                  this._path.buffer,
                  this._path.byteOffset + 2,
                  4
                )),
                (this._parents = new Array(4).fill(null)),
                (this._page = new i(0)),
                (this._allocs = 1);
            }
            last() {
              for (var e = this._page, t = 0; ; ) {
                for (var n = 2; n >= 0; n--) {
                  const i = r(e.oneOne[n][t]);
                  if (32 === i) return -1;
                  t = 31 - i + (t << 5);
                }
                if (((this._path[e.level] = t), !e.level)) return l(this._path);
                (e = e.children[t]), (t = 0);
              }
            }
            set(e, t) {
              const n = this._getPage(e, t);
              if (!n) return !1;
              const r = this._path[0],
                i = 31 & r,
                o = r >>> 5,
                s = n.bits[o];
              n.bits[o] = t ? s | (2147483648 >>> i) : s & ~(2147483648 >>> i);
              const a = n.bits[o];
              return (
                a !== s &&
                (this._updateAllOne(n, o, a), this._updateOneOne(n, o, a), !0)
              );
            }
            get(e) {
              const t = this._getPage(e, !1);
              if (!t) return !1;
              const n = this._path[0],
                r = 31 & n;
              return 0 != (t.bits[n >>> 5] & (2147483648 >>> r));
            }
            iterator() {
              return new f(this);
            }
            fill(e, t, n) {
              return (
                t || (t = 0),
                !0 === e
                  ? this._fillBit(!0, t, 0 === n ? n : n || this.length)
                  : !1 === e
                  ? this._fillBit(!1, t, 0 === n ? n : n || this.length)
                  : void this._fillBuffer(
                      e,
                      t,
                      0 === n ? n : n || t + 8 * e.length
                    )
              );
            }
            grow() {
              if (3 === this._page.level)
                throw new Error("Cannot grow beyond " + this.length);
              const e = this._page;
              (this._page = new i(e.level + 1)),
                (this._page.children[0] = e),
                3 === this._page.level
                  ? (this.length = Number.MAX_SAFE_INTEGER)
                  : (this.length *= 32768);
            }
            _fillBuffer(e, t, n) {
              if (7 & t || 7 & n)
                throw new Error("Offsets must be a multiple of 8");
              for (t /= 8; n > this.length; ) this.grow();
              n /= 8;
              const r = t;
              for (var i = this._getPage(8 * t, !0); t < n; ) {
                const o = n - t < 4096 ? n - t : 4096,
                  s = t - r;
                (t += this._setPageBuffer(
                  i,
                  e.subarray(s, s + o),
                  1023 & t
                )) !== n && (i = this._nextPage(i, 8 * t));
              }
            }
            _fillBit(e, t, n) {
              for (var r = this._getPage(t, e); t < n; ) {
                const i = n - t < 32768 ? n - t : 32768;
                (t += this._setPageBits(r, e, 32767 & t, i)) !== n &&
                  (r = this._nextPage(r, t));
              }
            }
            _nextPage(e, t) {
              const n = ++this._offsets[e.level];
              return 32768 === n
                ? this._getPage(t, !0)
                : this._parents[e.level].children[n] ||
                    this._addPage(this._parents[e.level], n);
            }
            _setPageBuffer(e, t, n) {
              return (
                new Uint8Array(
                  e.bits.buffer,
                  e.bits.byteOffset,
                  4 * e.bits.length
                ).set(t, n),
                (n >>>= 2),
                this._update(
                  e,
                  n,
                  n + (t.length >>> 2) + (3 & t.length ? 1 : 0)
                ),
                t.length
              );
            }
            _setPageBits(e, t, n, r) {
              const i = n >>> 5,
                o = r >>> 5,
                s = 4294967295 >>> (31 & n),
                a = ~(4294967295 >>> (31 & r));
              return i === o
                ? ((e.bits[i] = t ? e.bits[i] | (s & a) : e.bits[i] & ~(s & a)),
                  this._update(e, i, i + 1),
                  r - n)
                : ((e.bits[i] = t ? e.bits[i] | s : e.bits[i] & ~s),
                  o - i > 2 && e.bits.fill(t ? 4294967295 : 0, i + 1, o - 1),
                  1024 === o
                    ? ((e.bits[o - 1] = t ? 4294967295 : 0),
                      this._update(e, i, o),
                      r - n)
                    : ((e.bits[o] = t ? e.bits[o] | a : e.bits[o] & ~a),
                      this._update(e, i, o + 1),
                      r - n));
            }
            _update(e, t, n) {
              for (; t < n; t++) {
                const n = e.bits[t];
                this._updateAllOne(e, t, n), this._updateOneOne(e, t, n);
              }
            }
            _updateAllOne(e, t, n) {
              var r = 1;
              do {
                for (; r < 3; r++) {
                  const i = e.allOne[r],
                    o = 31 & t,
                    s = i[(t >>>= 5)];
                  if (
                    ((i[t] =
                      4294967295 === n
                        ? s | (2147483648 >>> o)
                        : s & ~(2147483648 >>> o)),
                    (n = i[t]) === s)
                  )
                    return;
                }
                (t += this._offsets[e.level]),
                  (e = this._parents[e.level]),
                  (r = 0);
              } while (e);
            }
            _updateOneOne(e, t, n) {
              var r = 1;
              do {
                for (; r < 3; r++) {
                  const i = e.oneOne[r],
                    o = 31 & t,
                    s = i[(t >>>= 5)];
                  if (
                    ((i[t] =
                      0 !== n
                        ? s | (2147483648 >>> o)
                        : s & ~(2147483648 >>> o)),
                    (n = i[t]) === s)
                  )
                    return;
                }
                (t += this._offsets[e.level]),
                  (e = this._parents[e.level]),
                  (r = 0),
                  0 === n &&
                    e &&
                    (e.children[this._offsets[e.level - 1]] = void 0);
              } while (e);
            }
            _getPage(e, t) {
              for (d(e, this._path); e >= this.length; ) {
                if (!t) return null;
                this.grow();
              }
              for (var n = this._page, r = n.level; r > 0 && n; r--) {
                const e = this._path[r];
                (this._parents[r - 1] = n),
                  (n = n.children[e] || (t ? this._addPage(n, e) : null));
              }
              return n;
            }
            _addPage(e, t) {
              return this._allocs++, (e = e.children[t] = new i(e.level - 1));
            }
          }
          class f {
            constructor(e) {
              (this._bitfield = e),
                (this._path = new Uint16Array(5)),
                (this._offsets = new Uint16Array(
                  this._path.buffer,
                  this._path.byteOffset + 2,
                  4
                )),
                (this._parents = new Array(4).fill(null)),
                (this._page = null),
                (this._allocs = e._allocs),
                this.seek(0);
            }
            seek(e) {
              if (
                ((this._allocs = this._bitfield._allocs),
                e >= this._bitfield.length)
              )
                return (this._page = null), this;
              d(e, this._path), (this._page = this._bitfield._page);
              for (var t = this._page.level; t > 0; t--)
                (this._parents[t - 1] = this._page),
                  (this._page = this._page.children[this._path[t]] || o[t - 1]);
              return this;
            }
            next(e) {
              return e ? this.nextTrue() : this.nextFalse();
            }
            nextFalse() {
              this._allocs !== this._bitfield._allocs &&
                this.seek(l(this._path));
              for (var e = this._page, t = this._path[0], n = a; e; ) {
                for (var r = 0; r < 3; r++) {
                  const i = 31 & t,
                    o = Math.clz32(~e.allOne[r][(t >>>= 5)] & n[i]);
                  if (32 !== o) return this._downLeftFalse(e, r, t, o);
                  n = s;
                }
                (t = this._offsets[e.level]), (e = this._parents[e.level]);
              }
              return -1;
            }
            _downLeftFalse(e, t, n, r) {
              for (;;) {
                for (; t; )
                  (n = (n << 5) + r), (r = Math.clz32(~e.allOne[--t][n]));
                if (((n = (n << 5) + r), !e.level)) break;
                (this._parents[e.level - 1] = e),
                  (this._path[e.level] = n),
                  (e = e.children[n]),
                  (t = 3),
                  (r = n = 0);
              }
              return (this._page = e), (this._path[0] = n), this._inc();
            }
            nextTrue() {
              for (var e = this._page, t = this._path[0], n = a; e; ) {
                for (var r = 0; r < 3; r++) {
                  const i = 31 & t,
                    o = Math.clz32(e.oneOne[r][(t >>>= 5)] & n[i]);
                  if (32 !== o) return this._downLeftTrue(e, r, t, o);
                  n = s;
                }
                (t = this._offsets[e.level]), (e = this._parents[e.level]);
              }
              return -1;
            }
            _downLeftTrue(e, t, n, r) {
              for (;;) {
                for (; t; )
                  (n = (n << 5) + r), (r = Math.clz32(e.oneOne[--t][n]));
                if (((n = (n << 5) + r), !e.level)) break;
                (this._parents[e.level - 1] = e),
                  (this._path[e.level] = n),
                  (e = e.children[n]),
                  (t = 3),
                  (r = n = 0);
              }
              return (this._page = e), (this._path[0] = n), this._inc();
            }
            _inc() {
              const e = l(this._path);
              return (
                this._path[0] < 32767 ? this._path[0]++ : this.seek(e + 1), e
              );
            }
          }
          function l(e) {
            return 32768 * (32768 * (32768 * e[3] + e[2]) + e[1]) + e[0];
          }
          function d(e, t) {
            (e =
              ((e = (e - (t[0] = 32767 & e)) / 32768) - (t[1] = 32767 & e)) /
              32768),
              (t[3] = ((e - (t[2] = 32767 & e)) / 32768) & 32767);
          }
        },
        { "count-trailing-zeros": 28 }
      ],
      39: [
        function(e, t, n) {
          function r(e) {
            return e < 31 ? 1 << e : (1 << 30) * (1 << (e - 30));
          }
          function i(e) {
            return (e - (1 & e)) / 2;
          }
          function o(e) {
            (this.index = 0), (this.offset = 0), (this.factor = 0);
          }
          (n.fullRoots = function(e, t) {
            if (1 & e)
              throw new Error("You can only look up roots for depth(0) blocks");
            t || (t = []), (e /= 2);
            for (var n = 0, r = 1; ; ) {
              if (!e) return t;
              for (; 2 * r <= e; ) r *= 2;
              t.push(n + r - 1), (n += 2 * r), (e -= r), (r = 1);
            }
          }),
            (n.depth = function(e) {
              var t = 0;
              for (e += 1; !(1 & e); ) t++, (e = i(e));
              return t;
            }),
            (n.sibling = function(e, t) {
              t || (t = n.depth(e));
              var r = n.offset(e, t);
              return n.index(t, 1 & r ? r - 1 : r + 1);
            }),
            (n.parent = function(e, t) {
              t || (t = n.depth(e));
              var r = n.offset(e, t);
              return n.index(t + 1, i(r));
            }),
            (n.leftChild = function(e, t) {
              return 1 & e
                ? (t || (t = n.depth(e)), n.index(t - 1, 2 * n.offset(e, t)))
                : -1;
            }),
            (n.rightChild = function(e, t) {
              return 1 & e
                ? (t || (t = n.depth(e)),
                  n.index(t - 1, 1 + 2 * n.offset(e, t)))
                : -1;
            }),
            (n.children = function(e, t) {
              if (!(1 & e)) return null;
              t || (t = n.depth(e));
              var r = 2 * n.offset(e, t);
              return [n.index(t - 1, r), n.index(t - 1, r + 1)];
            }),
            (n.leftSpan = function(e, t) {
              return 1 & e
                ? (t || (t = n.depth(e)), n.offset(e, t) * r(t + 1))
                : e;
            }),
            (n.rightSpan = function(e, t) {
              return 1 & e
                ? (t || (t = n.depth(e)), (n.offset(e, t) + 1) * r(t + 1) - 2)
                : e;
            }),
            (n.count = function(e, t) {
              return 1 & e ? (t || (t = n.depth(e)), r(t + 1) - 1) : 1;
            }),
            (n.spans = function(e, t) {
              if (!(1 & e)) return [e, e];
              t || (t = n.depth(e));
              var i = n.offset(e, t),
                o = r(t + 1);
              return [i * o, (i + 1) * o - 2];
            }),
            (n.index = function(e, t) {
              return (1 + 2 * t) * r(e) - 1;
            }),
            (n.offset = function(e, t) {
              return 1 & e
                ? (t || (t = n.depth(e)), ((e + 1) / r(t) - 1) / 2)
                : e / 2;
            }),
            (n.iterator = function(e) {
              var t = new o();
              return t.seek(e || 0), t;
            }),
            (o.prototype.seek = function(e) {
              (this.index = e),
                1 & this.index
                  ? ((this.offset = n.offset(e)),
                    (this.factor = r(n.depth(e) + 1)))
                  : ((this.offset = e / 2), (this.factor = 2));
            }),
            (o.prototype.isLeft = function() {
              return !(1 & this.offset);
            }),
            (o.prototype.isRight = function() {
              return !this.isLeft();
            }),
            (o.prototype.prev = function() {
              return this.offset
                ? (this.offset--, (this.index -= this.factor), this.index)
                : this.index;
            }),
            (o.prototype.next = function() {
              return this.offset++, (this.index += this.factor), this.index;
            }),
            (o.prototype.sibling = function() {
              return this.isLeft() ? this.next() : this.prev();
            }),
            (o.prototype.parent = function() {
              return (
                1 & this.offset
                  ? ((this.index -= this.factor / 2),
                    (this.offset = (this.offset - 1) / 2))
                  : ((this.index += this.factor / 2), (this.offset /= 2)),
                (this.factor *= 2),
                this.index
              );
            }),
            (o.prototype.leftSpan = function() {
              return (
                (this.index = this.index - this.factor / 2 + 1),
                (this.offset = this.index / 2),
                (this.factor = 2),
                this.index
              );
            }),
            (o.prototype.rightSpan = function() {
              return (
                (this.index = this.index + this.factor / 2 - 1),
                (this.offset = this.index / 2),
                (this.factor = 2),
                this.index
              );
            }),
            (o.prototype.leftChild = function() {
              return 2 === this.factor
                ? this.index
                : ((this.factor /= 2),
                  (this.index -= this.factor / 2),
                  (this.offset *= 2),
                  this.index);
            }),
            (o.prototype.rightChild = function() {
              return 2 === this.factor
                ? this.index
                : ((this.factor /= 2),
                  (this.index += this.factor / 2),
                  (this.offset = 2 * this.offset + 1),
                  this.index);
            });
        },
        {}
      ],
      40: [
        function(e, t, n) {
          (function(n) {
            var r = e("readable-stream").Readable,
              i = e("inherits");
            (t.exports = s),
              (s.ctor = a),
              (s.obj = function(e, t) {
                ("function" == typeof e || Array.isArray(e)) &&
                  ((t = e), (e = {}));
                return (
                  ((e = u(e)).objectMode = !0), (e.highWaterMark = 16), s(e, t)
                );
              });
            var o = a();
            function s(e, t) {
              ("object" != typeof e || Array.isArray(e)) && ((t = e), (e = {}));
              var n,
                r = new o(e);
              return (
                (r._from = Array.isArray(t)
                  ? ((n = (n = t).slice()),
                    function(e, t) {
                      var r = null,
                        i = n.length ? n.shift() : null;
                      i instanceof Error && ((r = i), (i = null)), t(r, i);
                    })
                  : t || h),
                r
              );
            }
            function a(e, t) {
              function o(t) {
                if (!(this instanceof o)) return new o(t);
                (this._reading = !1),
                  (this._callback = function(e, t) {
                    if (n.destroyed) return;
                    if (e) return n.destroy(e);
                    if (null === t) return n.push(null);
                    (n._reading = !1), n.push(t) && n._read(i);
                  }),
                  (this.destroyed = !1),
                  r.call(this, t || e);
                var n = this,
                  i = this._readableState.highWaterMark;
              }
              return (
                "function" == typeof e && ((t = e), (e = {})),
                (e = u(e)),
                i(o, r),
                (o.prototype._from = t || h),
                (o.prototype._read = function(e) {
                  this._reading ||
                    this.destroyed ||
                    ((this._reading = !0), this._from(e, this._callback));
                }),
                (o.prototype.destroy = function(e) {
                  if (!this.destroyed) {
                    this.destroyed = !0;
                    var t = this;
                    n.nextTick(function() {
                      e && t.emit("error", e), t.emit("close");
                    });
                  }
                }),
                o
              );
            }
            function h() {}
            function u(e) {
              return (e = e || {});
            }
          }.call(this, e("_process")));
        },
        { _process: 175, inherits: 64, "readable-stream": 117 }
      ],
      41: [
        function(e, t, n) {
          t.exports = function() {
            if ("undefined" == typeof window) return null;
            var e = {
              RTCPeerConnection:
                window.RTCPeerConnection ||
                window.mozRTCPeerConnection ||
                window.webkitRTCPeerConnection,
              RTCSessionDescription:
                window.RTCSessionDescription ||
                window.mozRTCSessionDescription ||
                window.webkitRTCSessionDescription,
              RTCIceCandidate:
                window.RTCIceCandidate ||
                window.mozRTCIceCandidate ||
                window.webkitRTCIceCandidate
            };
            return e.RTCPeerConnection ? e : null;
          };
        },
        {}
      ],
      42: [
        function(e, t, n) {
          var r = e("sodium-universal"),
            i = e("uint64be"),
            o = e("buffer-from"),
            s = e("buffer-alloc-unsafe"),
            a = o([0]),
            h = o([1]),
            u = o([2]),
            c = o("hypercore");
          function f(e) {
            return i.encode(e, s(8));
          }
          function l(e) {
            var t = s(32);
            return r.crypto_generichash_batch(t, e), t;
          }
          (n.keyPair = function(e) {
            var t = s(r.crypto_sign_PUBLICKEYBYTES),
              n = s(r.crypto_sign_SECRETKEYBYTES);
            return (
              e
                ? r.crypto_sign_seed_keypair(t, n, e)
                : r.crypto_sign_keypair(t, n),
              { publicKey: t, secretKey: n }
            );
          }),
            (n.sign = function(e, t) {
              var n = s(r.crypto_sign_BYTES);
              return r.crypto_sign_detached(n, e, t), n;
            }),
            (n.verify = function(e, t, n) {
              return r.crypto_sign_verify_detached(t, e, n);
            }),
            (n.data = function(e) {
              return l([a, f(e.length), e]);
            }),
            (n.leaf = function(e) {
              return n.data(e.data);
            }),
            (n.parent = function(e, t) {
              if (e.index > t.index) {
                var n = e;
                (e = t), (t = n);
              }
              return l([h, f(e.size + t.size), e.hash, t.hash]);
            }),
            (n.tree = function(e) {
              var t = new Array(3 * e.length + 1),
                n = 0;
              t[n++] = u;
              for (var r = 0; r < e.length; r++) {
                var i = e[r];
                (t[n++] = i.hash), (t[n++] = f(i.index)), (t[n++] = f(i.size));
              }
              return l(t);
            }),
            (n.randomBytes = function(e) {
              var t = s(e);
              return r.randombytes_buf(t), t;
            }),
            (n.discoveryKey = function(e) {
              var t = s(32);
              return r.crypto_generichash(t, c, e), t;
            });
        },
        {
          "buffer-alloc-unsafe": 21,
          "buffer-from": 24,
          "sodium-universal": 140,
          uint64be: 150
        }
      ],
      43: [
        function(e, t, n) {
          (function(n) {
            var r = e("events"),
              i = e("inherits"),
              o = e("varint"),
              s = e("./messages"),
              a = e("buffer-alloc-unsafe");
            function h(e) {
              if (!(this instanceof h)) return new h(e);
              r.EventEmitter.call(this),
                (this.key = null),
                (this.discoveryKey = null),
                (this.stream = e),
                (this.peer = null),
                (this.id = -1),
                (this.remoteId = -1),
                (this.header = 0),
                (this.headerLength = 0),
                (this.closed = !1),
                (this._buffer = []);
            }
            function u(e, t, n, r) {
              try {
                return e.decode(t, n, r);
              } catch (e) {
                return null;
              }
            }
            (t.exports = h),
              i(h, r.EventEmitter),
              (h.prototype.handshake = function(e) {
                return this._send(1, s.Handshake, e);
              }),
              (h.prototype.info = function(e) {
                return this._send(2, s.Info, e);
              }),
              (h.prototype.have = function(e) {
                return this._send(3, s.Have, e);
              }),
              (h.prototype.unhave = function(e) {
                return this._send(4, s.Unhave, e);
              }),
              (h.prototype.want = function(e) {
                return this._send(5, s.Want, e);
              }),
              (h.prototype.unwant = function(e) {
                return this._send(6, s.Unwant, e);
              }),
              (h.prototype.request = function(e) {
                return this._send(7, s.Request, e);
              }),
              (h.prototype.cancel = function(e) {
                return this._send(8, s.Cancel, e);
              }),
              (h.prototype.data = function(e) {
                return this._send(9, s.Data, e);
              }),
              (h.prototype.extension = function(e, t) {
                var n = this.stream.extensions.indexOf(e);
                if (-1 === n) return !1;
                var r = 15 | this.header,
                  i = this.headerLength + o.encodingLength(n) + t.length,
                  s = a(o.encodingLength(i) + i),
                  h = 0;
                return (
                  o.encode(i, s, h),
                  (h += o.encode.bytes),
                  o.encode(r, s, h),
                  (h += o.encode.bytes),
                  o.encode(n, s, h),
                  (h += o.encode.bytes),
                  t.copy(s, h),
                  this.stream._push(s)
                );
              }),
              (h.prototype.remoteSupports = function(e) {
                return this.stream.remoteSupports(e);
              }),
              (h.prototype.destroy = function(e) {
                this.stream.destroy(e);
              }),
              (h.prototype.close = function() {
                var e = this.stream.feeds.indexOf(this);
                if (e > -1) {
                  if (
                    ((this.stream.feeds[e] = this.stream.feeds[
                      this.stream.feeds.length - 1
                    ]),
                    this.stream.feeds.pop(),
                    (this.stream._localFeeds[this.id] = null),
                    (this.id = -1),
                    this.stream.destroyed)
                  )
                    return;
                  if (
                    this.stream.expectedFeeds <= 0 ||
                    --this.stream.expectedFeeds
                  )
                    return;
                  this.stream._prefinalize();
                }
              }),
              (h.prototype._onclose = function() {
                if (!this.closed) {
                  if (((this.closed = !0), !this.stream.destroyed)) {
                    this.close(),
                      this.remoteId > -1 &&
                        (this.stream._remoteFeeds[this.remoteId] = null);
                    var e = this.discoveryKey.toString("hex");
                    this.stream._feeds[e] === this &&
                      delete this.stream._feeds[e];
                  }
                  this.peer ? this.peer.onclose() : this.emit("close");
                }
              }),
              (h.prototype._resume = function() {
                var e = this;
                n.nextTick(function() {
                  for (; e._buffer.length; ) {
                    var t = e._buffer.shift();
                    e._emit(t.type, t.message);
                  }
                  e._buffer = null;
                });
              }),
              (h.prototype._onextension = function(e, t, n) {
                if (!(n <= t)) {
                  var r = o.decode(e, t),
                    i = this.stream.remoteExtensions,
                    s = !i || r >= i.length ? -1 : i[r];
                  if (-1 !== s) {
                    var a = e.slice(t + o.decode.bytes, n),
                      h = this.stream.extensions[s];
                    this.peer && this.peer.onextension
                      ? this.peer.onextension(h, a)
                      : this.emit("extension", h, a);
                  }
                }
              }),
              (h.prototype._onmessage = function(e, t, n, r) {
                var i = (function(e, t, n, r) {
                  switch (e) {
                    case 1:
                      return u(s.Handshake, t, n, r);
                    case 2:
                      return u(s.Info, t, n, r);
                    case 3:
                      return u(s.Have, t, n, r);
                    case 4:
                      return u(s.Unhave, t, n, r);
                    case 5:
                      return u(s.Want, t, n, r);
                    case 6:
                      return u(s.Unwant, t, n, r);
                    case 7:
                      return u(s.Request, t, n, r);
                    case 8:
                      return u(s.Cancel, t, n, r);
                    case 9:
                      return u(s.Data, t, n, r);
                  }
                })(e, t, n, r);
                if (i && !this.closed)
                  return 1 === e
                    ? this.stream._onhandshake(i)
                    : void (this._buffer
                        ? this._buffer.length > 16
                          ? this.destroy(
                              new Error(
                                "Remote sent too many messages on an unopened feed"
                              )
                            )
                          : this._buffer.push({ type: e, message: i })
                        : this._emit(e, i));
              }),
              (h.prototype._emit = function(e, t) {
                if (this.peer)
                  switch (e) {
                    case 2:
                      return this.peer.oninfo(t);
                    case 3:
                      return this.peer.onhave(t);
                    case 4:
                      return this.peer.onunhave(t);
                    case 5:
                      return this.peer.onwant(t);
                    case 6:
                      return this.peer.onunwant(t);
                    case 7:
                      return this.peer.onrequest(t);
                    case 8:
                      return this.peer.oncancel(t);
                    case 9:
                      return this.peer.ondata(t);
                  }
                else
                  switch (e) {
                    case 2:
                      return this.emit("info", t);
                    case 3:
                      return this.emit("have", t);
                    case 4:
                      return this.emit("unhave", t);
                    case 5:
                      return this.emit("want", t);
                    case 6:
                      return this.emit("unwant", t);
                    case 7:
                      return this.emit("request", t);
                    case 8:
                      return this.emit("cancel", t);
                    case 9:
                      return this.emit("data", t);
                  }
              }),
              (h.prototype._send = function(e, t, n) {
                var r = this.header | e,
                  i = this.headerLength + t.encodingLength(n),
                  s = a(o.encodingLength(i) + i),
                  h = 0;
                return (
                  o.encode(i, s, h),
                  (h += o.encode.bytes),
                  o.encode(r, s, h),
                  (h += o.encode.bytes),
                  t.encode(n, s, h),
                  this.stream._push(s)
                );
              });
          }.call(this, e("_process")));
        },
        {
          "./messages": 45,
          _process: 175,
          "buffer-alloc-unsafe": 21,
          events: 170,
          inherits: 64,
          varint: 48
        }
      ],
      44: [
        function(e, t, n) {
          (function(n) {
            var r = e("readable-stream"),
              i = e("inherits"),
              o = e("varint"),
              s = e("sodium-universal"),
              a = e("sorted-indexof"),
              h = e("./feed"),
              u = e("./messages"),
              c = e("buffer-alloc-unsafe"),
              f = e("buffer-from");
            function l(e) {
              if (!(this instanceof l)) return new l(e);
              e || (e = {}), r.Duplex.call(this);
              var t = this;
              (this.id = e.id || p(32)),
                (this.live = !!e.live),
                (this.ack = !!e.ack),
                (this.userData = e.userData || null),
                (this.remoteId = null),
                (this.remoteLive = !1),
                (this.remoteUserData = null),
                (this.destroyed = !1),
                (this.encrypted = !1 !== e.encrypt),
                (this.key = null),
                (this.discoveryKey = null),
                (this.remoteDiscoveryKey = null),
                (this.feeds = []),
                (this.expectedFeeds = e.expectedFeeds || 0),
                (this.extensions = e.extensions || []),
                (this.remoteExtensions = null),
                (this.maxFeeds = e.maxFeeds || 256),
                (this._localFeeds = []),
                (this._remoteFeeds = []),
                (this._feeds = {}),
                (this._nonce = null),
                (this._remoteNonce = null),
                (this._xor = null),
                (this._remoteXor = null),
                (this._needsKey = !1),
                (this._length = c(o.encodingLength(8388608))),
                (this._missing = 0),
                (this._buf = null),
                (this._pointer = 0),
                (this._data = null),
                (this._start = 0),
                (this._cb = null),
                (this._interval = null),
                (this._keepAlive = 0),
                (this._remoteKeepAlive = 0),
                (this._maybeFinalize = function(e) {
                  if (e) return t.destroy(e);
                  t.expectedFeeds || t.finalize();
                }),
                (this._utp = null),
                0 !== e.timeout &&
                  !1 !== e.timeout &&
                  this.setTimeout(e.timeout || 5e3, this._ontimeout),
                this.on("finish", this.finalize),
                this.on("pipe", this._onpipe);
            }
            function d(e) {
              var t = c(32);
              return s.crypto_generichash(t, f("hypercore"), e), t;
            }
            function p(e) {
              var t = c(e);
              return s.randombytes_buf(t), t;
            }
            (t.exports = l),
              i(l, r.Duplex),
              (l.prototype._onpipe = function(e) {
                "function" == typeof e.setContentSize && (this._utp = e);
              }),
              (l.prototype._prefinalize = function() {
                this.emit("prefinalize", this._maybeFinalize) ||
                  this.finalize();
              }),
              (l.prototype.setTimeout = function(e, t) {
                if (!this.destroyed) {
                  t && this.once("timeout", t);
                  var n = this;
                  (this._keepAlive = 0),
                    (this._remoteKeepAlive = 0),
                    clearInterval(this._interval),
                    e &&
                      ((this._interval = setInterval(function() {
                        n._kick();
                      }, (e / 4) | 0)),
                      this._interval.unref && this._interval.unref());
                }
              }),
              (l.prototype.has = function(e) {
                var t = d(e).toString("hex");
                return !!this._feeds[t];
              }),
              (l.prototype.feed = function(e, t) {
                if (this.destroyed) return null;
                t || (t = {});
                var n = t.discoveryKey || d(e),
                  r = this._feed(n);
                if (r.id > -1) return t.peer && (r.peer = t.peer), r;
                if (this._localFeeds.length >= this.maxFeeds)
                  return this._tooManyFeeds(), null;
                (r.id = this._localFeeds.push(r) - 1),
                  (r.header = r.id << 4),
                  (r.headerLength = o.encodingLength(r.header)),
                  (r.key = e),
                  (r.discoveryKey = n),
                  t.peer && (r.peer = t.peer),
                  this.feeds.push(r);
                var i = !this.key,
                  a = { discoveryKey: n, nonce: null };
                if (i) {
                  if (
                    ((this.key = e), (this.discoveryKey = n), !this._sameKey())
                  )
                    return null;
                  this.encrypted &&
                    ((a.nonce = this._nonce = p(24)),
                    (this._xor = s.crypto_stream_xor_instance(
                      this._nonce,
                      this.key
                    )),
                    this._remoteNonce &&
                      (this._remoteXor = s.crypto_stream_xor_instance(
                        this._remoteNonce,
                        this.key
                      ))),
                    this._needsKey && ((this._needsKey = !1), this._resume());
                }
                var h = (function(e, t) {
                  var n = t << 4,
                    r = o.encodingLength(n) + u.Feed.encodingLength(e),
                    i = c(o.encodingLength(r) + r),
                    s = 0;
                  return (
                    o.encode(r, i, s),
                    (s += o.encode.bytes),
                    o.encode(n, i, s),
                    (s += o.encode.bytes),
                    u.Feed.encode(e, i, s),
                    i
                  );
                })(a, r.id);
                return (
                  !a.nonce && this.encrypted && this._xor.update(h, h),
                  (this._keepAlive = 0),
                  this.push(h),
                  this.destroyed
                    ? null
                    : (i &&
                        r.handshake({
                          id: this.id,
                          live: this.live,
                          userData: this.userData,
                          extensions: this.extensions,
                          ack: this.ack
                        }),
                      r._buffer.length ? r._resume() : (r._buffer = null),
                      r)
                );
              }),
              (l.prototype._resume = function() {
                var e = this;
                n.nextTick(function() {
                  if (!e._data) return;
                  var t = e._data,
                    n = e._start,
                    r = e._cb;
                  (e._data = null),
                    (e._start = 0),
                    (e._cb = null),
                    e._parse(t, n, r);
                });
              }),
              (l.prototype._kick = function() {
                if (this._remoteKeepAlive > 4)
                  return (
                    clearInterval(this._interval), void this.emit("timeout")
                  );
                for (var e = 0; e < this.feeds.length; e++) {
                  var t = this.feeds[e];
                  t.peer ? t.peer.ontick() : t.emit("tick");
                }
                this._remoteKeepAlive++,
                  this._keepAlive > 2
                    ? (this.ping(), (this._keepAlive = 0))
                    : this._keepAlive++;
              }),
              (l.prototype.ping = function() {
                if (!this.key) return !0;
                var e = f([0]);
                return this._xor && this._xor.update(e, e), this.push(e);
              }),
              (l.prototype.destroy = function(e) {
                this.destroyed ||
                  ((this.destroyed = !0),
                  e && this.emit("error", e),
                  this._close(),
                  this.emit("close"));
              }),
              (l.prototype.finalize = function() {
                this.destroyed ||
                  ((this.destroyed = !0), this._close(), this.push(null));
              }),
              (l.prototype._close = function() {
                clearInterval(this._interval);
                var e = this.feeds;
                this.feeds = [];
                for (var t = 0; t < e.length; t++) e[t]._onclose();
                this._xor && (this._xor.final(), (this._xor = null));
              }),
              (l.prototype._read = function() {}),
              (l.prototype._push = function(e) {
                if (!this.destroyed)
                  return (
                    (this._keepAlive = 0),
                    this._xor && this._xor.update(e, e),
                    this.push(e)
                  );
              }),
              (l.prototype._write = function(e, t, n) {
                (this._remoteKeepAlive = 0), this._parse(e, 0, n);
              }),
              (l.prototype._feed = function(e) {
                var t = e.toString("hex"),
                  n = this._feeds[t];
                return n || (n = this._feeds[t] = h(this));
              }),
              (l.prototype.remoteSupports = function(e) {
                var t = this.extensions.indexOf(e);
                return (
                  t > -1 &&
                  !!this.remoteExtensions &&
                  this.remoteExtensions.indexOf(t) > -1
                );
              }),
              (l.prototype._onhandshake = function(e) {
                this.remoteId ||
                  ((this.remoteId = e.id || p(32)),
                  (this.remoteLive = e.live),
                  (this.remoteUserData = e.userData),
                  (this.remoteExtensions = a(this.extensions, e.extensions)),
                  (this.remoteAck = e.ack),
                  this.emit("handshake"));
              }),
              (l.prototype._onopen = function(e, t, n, r) {
                var i = (function(e, t, n) {
                  var r = null;
                  try {
                    r = u.Feed.decode(e, t, n);
                  } catch (e) {
                    return null;
                  }
                  return 32 !== r.discoveryKey.length
                    ? null
                    : r.nonce && 24 !== r.nonce.length
                    ? null
                    : r;
                })(t, n, r);
                if (!i) return this._badFeed();
                if (!this.remoteDiscoveryKey) {
                  if (
                    ((this.remoteDiscoveryKey = i.discoveryKey),
                    !this._sameKey())
                  )
                    return;
                  if (this.encrypted && !this._remoteNonce) {
                    if (!i.nonce)
                      return void this.destroy(
                        new Error("Remote did not include a nonce")
                      );
                    this._remoteNonce = i.nonce;
                  }
                  this.encrypted &&
                    this.key &&
                    !this._remoteXor &&
                    (this._remoteXor = s.crypto_stream_xor_instance(
                      this._remoteNonce,
                      this.key
                    ));
                }
                (this._remoteFeeds[e] = this._feed(i.discoveryKey)),
                  (this._remoteFeeds[e].remoteId = e),
                  this.emit("feed", i.discoveryKey);
              }),
              (l.prototype._onmessage = function(e, t, n) {
                if (!(n - t < 2)) {
                  var r = (function(e, t) {
                    try {
                      return o.decode(e, t);
                    } catch (e) {
                      return -1;
                    }
                  })(e, t);
                  if (-1 === r)
                    return this.destroy(
                      new Error("Remote sent invalid header")
                    );
                  t += o.decode.bytes;
                  var i = r >> 4,
                    s = 15 & r;
                  if (i >= this.maxFeeds) return this._tooManyFeeds();
                  for (; this._remoteFeeds.length < i; )
                    this._remoteFeeds.push(null);
                  var a = this._remoteFeeds[i];
                  return 0 === s
                    ? (a && a._onclose(), this._onopen(i, e, t, n))
                    : a
                    ? 15 === s
                      ? a._onextension(e, t, n)
                      : void a._onmessage(s, e, t, n)
                    : this._badFeed();
                }
              }),
              (l.prototype._parse = function(e, t, n) {
                var r = !!this._remoteXor;
                for (
                  t && ((e = e.slice(t)), (t = 0)),
                    this._remoteXor && this._remoteXor.update(e, e);
                  t < e.length && !this.destroyed;

                ) {
                  if (
                    ((t = this._missing
                      ? this._parseMessage(e, t)
                      : this._parseLength(e, t)),
                    this._needsKey)
                  )
                    return (
                      (this._data = e), (this._start = t), void (this._cb = n)
                    );
                  if (!r && this._remoteXor) return this._parse(e, t, n);
                }
                n();
              }),
              (l.prototype._parseMessage = function(e, t) {
                var n = t + this._missing;
                if (n <= e.length) {
                  var r = n;
                  return (
                    this._buf &&
                      (e.copy(this._buf, this._pointer, t),
                      (t = 0),
                      (n = (e = this._buf).length),
                      (this._buf = null)),
                    (this._missing = 0),
                    (this._pointer = 0),
                    this.encrypted && !this.key && (this._needsKey = !0),
                    this._onmessage(e, t, n),
                    r
                  );
                }
                this._buf ||
                  ((this._buf = c(this._missing)), (this._pointer = 0));
                var i = e.length - t;
                return (
                  e.copy(this._buf, this._pointer, t),
                  (this._pointer += i),
                  (this._missing -= i),
                  e.length
                );
              }),
              (l.prototype._parseLength = function(e, t) {
                for (; !this._missing && t < e.length; ) {
                  if (!(128 & (this._length[this._pointer++] = e[t++]))) {
                    if (
                      ((this._missing = o.decode(this._length)),
                      (this._pointer = 0),
                      this._missing > 8388608)
                    )
                      return this._tooBig(e.length);
                    if (this._utp) {
                      var n = this._missing - (e.length - t);
                      n > 0 && !this._needsKey && this._utp.setContentSize(n);
                    }
                    return t;
                  }
                  if (this._pointer >= this._length.length)
                    return this._tooBig(e.length);
                }
                return t;
              }),
              (l.prototype._sameKey = function() {
                return (
                  !this.encrypted ||
                  (!this.discoveryKey ||
                    !this.remoteDiscoveryKey ||
                    (this.remoteDiscoveryKey.toString("hex") ===
                      this.discoveryKey.toString("hex") ||
                      (this.destroy(
                        new Error("First shared hypercore must be the same")
                      ),
                      !1)))
                );
              }),
              (l.prototype._tooManyFeeds = function() {
                this.destroy(
                  new Error(
                    "Only " +
                      this.maxFeeds +
                      " feeds currently supported. Open a Github issue if you need more"
                  )
                );
              }),
              (l.prototype._tooBig = function(e) {
                return (
                  this.destroy(
                    new Error("Remote message is larger than 8MB (max allowed)")
                  ),
                  e
                );
              }),
              (l.prototype._badFeed = function() {
                this.destroy(new Error("Remote sent invalid feed message"));
              }),
              (l.prototype._ontimeout = function() {
                this.destroy(new Error("Remote timed out"));
              });
          }.call(this, e("_process")));
        },
        {
          "./feed": 43,
          "./messages": 45,
          _process: 175,
          "buffer-alloc-unsafe": 21,
          "buffer-from": 24,
          inherits: 64,
          "readable-stream": 117,
          "sodium-universal": 140,
          "sorted-indexof": 141,
          varint: 48
        }
      ],
      45: [
        function(e, t, n) {
          (function(t) {
            var r = e("protocol-buffers-encodings"),
              i = r.varint,
              o = r.skip,
              s = (n.Feed = {
                buffer: !0,
                encodingLength: null,
                encode: null,
                decode: null
              }),
              a = (n.Handshake = {
                buffer: !0,
                encodingLength: null,
                encode: null,
                decode: null
              }),
              h = (n.Info = {
                buffer: !0,
                encodingLength: null,
                encode: null,
                decode: null
              }),
              u = (n.Have = {
                buffer: !0,
                encodingLength: null,
                encode: null,
                decode: null
              }),
              c = (n.Unhave = {
                buffer: !0,
                encodingLength: null,
                encode: null,
                decode: null
              }),
              f = (n.Want = {
                buffer: !0,
                encodingLength: null,
                encode: null,
                decode: null
              }),
              l = (n.Unwant = {
                buffer: !0,
                encodingLength: null,
                encode: null,
                decode: null
              }),
              d = (n.Request = {
                buffer: !0,
                encodingLength: null,
                encode: null,
                decode: null
              }),
              p = (n.Cancel = {
                buffer: !0,
                encodingLength: null,
                encode: null,
                decode: null
              }),
              g = (n.Data = {
                buffer: !0,
                encodingLength: null,
                encode: null,
                decode: null
              });
            function y(e) {
              return null != e && ("number" != typeof e || !isNaN(e));
            }
            !(function() {
              var e = [r.bytes];
              function n(t) {
                var n = 0;
                if (!y(t.discoveryKey))
                  throw new Error("discoveryKey is required");
                var r = e[0].encodingLength(t.discoveryKey);
                if (((n += 1 + r), y(t.nonce))) {
                  var r = e[0].encodingLength(t.nonce);
                  n += 1 + r;
                }
                return n;
              }
              (s.encodingLength = n),
                (s.encode = function r(i, o, s) {
                  s || (s = 0);
                  o || (o = t.allocUnsafe(n(i)));
                  var a = s;
                  if (!y(i.discoveryKey))
                    throw new Error("discoveryKey is required");
                  o[s++] = 10;
                  e[0].encode(i.discoveryKey, o, s);
                  s += e[0].encode.bytes;
                  y(i.nonce) &&
                    ((o[s++] = 18),
                    e[0].encode(i.nonce, o, s),
                    (s += e[0].encode.bytes));
                  r.bytes = s - a;
                  return o;
                }),
                (s.decode = function t(n, r, s) {
                  r || (r = 0);
                  s || (s = n.length);
                  if (!(s <= n.length && r <= n.length))
                    throw new Error("Decoded message is not valid");
                  var a = r;
                  var h = { discoveryKey: null, nonce: null };
                  var u = !1;
                  for (;;) {
                    if (s <= r) {
                      if (!u) throw new Error("Decoded message is not valid");
                      return (t.bytes = r - a), h;
                    }
                    var c = i.decode(n, r);
                    r += i.decode.bytes;
                    var f = c >> 3;
                    switch (f) {
                      case 1:
                        (h.discoveryKey = e[0].decode(n, r)),
                          (r += e[0].decode.bytes),
                          (u = !0);
                        break;
                      case 2:
                        (h.nonce = e[0].decode(n, r)), (r += e[0].decode.bytes);
                        break;
                      default:
                        r = o(7 & c, n, r);
                    }
                  }
                });
            })(),
              (function() {
                var e = [r.bytes, r.bool, r.string];
                function n(t) {
                  var n = 0;
                  if (y(t.id)) {
                    var r = e[0].encodingLength(t.id);
                    n += 1 + r;
                  }
                  if (y(t.live)) {
                    var r = e[1].encodingLength(t.live);
                    n += 1 + r;
                  }
                  if (y(t.userData)) {
                    var r = e[0].encodingLength(t.userData);
                    n += 1 + r;
                  }
                  if (y(t.extensions))
                    for (var i = 0; i < t.extensions.length; i++)
                      if (y(t.extensions[i])) {
                        var r = e[2].encodingLength(t.extensions[i]);
                        n += 1 + r;
                      }
                  if (y(t.ack)) {
                    var r = e[1].encodingLength(t.ack);
                    n += 1 + r;
                  }
                  return n;
                }
                (a.encodingLength = n),
                  (a.encode = function r(i, o, s) {
                    s || (s = 0);
                    o || (o = t.allocUnsafe(n(i)));
                    var a = s;
                    y(i.id) &&
                      ((o[s++] = 10),
                      e[0].encode(i.id, o, s),
                      (s += e[0].encode.bytes));
                    y(i.live) &&
                      ((o[s++] = 16),
                      e[1].encode(i.live, o, s),
                      (s += e[1].encode.bytes));
                    y(i.userData) &&
                      ((o[s++] = 26),
                      e[0].encode(i.userData, o, s),
                      (s += e[0].encode.bytes));
                    if (y(i.extensions))
                      for (var h = 0; h < i.extensions.length; h++)
                        y(i.extensions[h]) &&
                          ((o[s++] = 34),
                          e[2].encode(i.extensions[h], o, s),
                          (s += e[2].encode.bytes));
                    y(i.ack) &&
                      ((o[s++] = 40),
                      e[1].encode(i.ack, o, s),
                      (s += e[1].encode.bytes));
                    r.bytes = s - a;
                    return o;
                  }),
                  (a.decode = function t(n, r, s) {
                    r || (r = 0);
                    s || (s = n.length);
                    if (!(s <= n.length && r <= n.length))
                      throw new Error("Decoded message is not valid");
                    var a = r;
                    var h = {
                      id: null,
                      live: !1,
                      userData: null,
                      extensions: [],
                      ack: !1
                    };
                    for (;;) {
                      if (s <= r) return (t.bytes = r - a), h;
                      var u = i.decode(n, r);
                      r += i.decode.bytes;
                      var c = u >> 3;
                      switch (c) {
                        case 1:
                          (h.id = e[0].decode(n, r)), (r += e[0].decode.bytes);
                          break;
                        case 2:
                          (h.live = e[1].decode(n, r)),
                            (r += e[1].decode.bytes);
                          break;
                        case 3:
                          (h.userData = e[0].decode(n, r)),
                            (r += e[0].decode.bytes);
                          break;
                        case 4:
                          h.extensions.push(e[2].decode(n, r)),
                            (r += e[2].decode.bytes);
                          break;
                        case 5:
                          (h.ack = e[1].decode(n, r)), (r += e[1].decode.bytes);
                          break;
                        default:
                          r = o(7 & u, n, r);
                      }
                    }
                  });
              })(),
              (function() {
                var e = [r.bool];
                function n(t) {
                  var n = 0;
                  if (y(t.uploading)) {
                    var r = e[0].encodingLength(t.uploading);
                    n += 1 + r;
                  }
                  if (y(t.downloading)) {
                    var r = e[0].encodingLength(t.downloading);
                    n += 1 + r;
                  }
                  return n;
                }
                (h.encodingLength = n),
                  (h.encode = function r(i, o, s) {
                    s || (s = 0);
                    o || (o = t.allocUnsafe(n(i)));
                    var a = s;
                    y(i.uploading) &&
                      ((o[s++] = 8),
                      e[0].encode(i.uploading, o, s),
                      (s += e[0].encode.bytes));
                    y(i.downloading) &&
                      ((o[s++] = 16),
                      e[0].encode(i.downloading, o, s),
                      (s += e[0].encode.bytes));
                    r.bytes = s - a;
                    return o;
                  }),
                  (h.decode = function t(n, r, s) {
                    r || (r = 0);
                    s || (s = n.length);
                    if (!(s <= n.length && r <= n.length))
                      throw new Error("Decoded message is not valid");
                    var a = r;
                    var h = { uploading: !1, downloading: !1 };
                    for (;;) {
                      if (s <= r) return (t.bytes = r - a), h;
                      var u = i.decode(n, r);
                      r += i.decode.bytes;
                      var c = u >> 3;
                      switch (c) {
                        case 1:
                          (h.uploading = e[0].decode(n, r)),
                            (r += e[0].decode.bytes);
                          break;
                        case 2:
                          (h.downloading = e[0].decode(n, r)),
                            (r += e[0].decode.bytes);
                          break;
                        default:
                          r = o(7 & u, n, r);
                      }
                    }
                  });
              })(),
              (function() {
                var e = [r.varint, r.bytes, r.bool];
                function n(t) {
                  var n = 0;
                  if (!y(t.start)) throw new Error("start is required");
                  var r = e[0].encodingLength(t.start);
                  if (((n += 1 + r), y(t.length))) {
                    var r = e[0].encodingLength(t.length);
                    n += 1 + r;
                  }
                  if (y(t.bitfield)) {
                    var r = e[1].encodingLength(t.bitfield);
                    n += 1 + r;
                  }
                  if (y(t.ack)) {
                    var r = e[2].encodingLength(t.ack);
                    n += 1 + r;
                  }
                  return n;
                }
                (u.encodingLength = n),
                  (u.encode = function r(i, o, s) {
                    s || (s = 0);
                    o || (o = t.allocUnsafe(n(i)));
                    var a = s;
                    if (!y(i.start)) throw new Error("start is required");
                    o[s++] = 8;
                    e[0].encode(i.start, o, s);
                    s += e[0].encode.bytes;
                    y(i.length) &&
                      ((o[s++] = 16),
                      e[0].encode(i.length, o, s),
                      (s += e[0].encode.bytes));
                    y(i.bitfield) &&
                      ((o[s++] = 26),
                      e[1].encode(i.bitfield, o, s),
                      (s += e[1].encode.bytes));
                    y(i.ack) &&
                      ((o[s++] = 32),
                      e[2].encode(i.ack, o, s),
                      (s += e[2].encode.bytes));
                    r.bytes = s - a;
                    return o;
                  }),
                  (u.decode = function t(n, r, s) {
                    r || (r = 0);
                    s || (s = n.length);
                    if (!(s <= n.length && r <= n.length))
                      throw new Error("Decoded message is not valid");
                    var a = r;
                    var h = { start: 0, length: 1, bitfield: null, ack: !1 };
                    var u = !1;
                    for (;;) {
                      if (s <= r) {
                        if (!u) throw new Error("Decoded message is not valid");
                        return (t.bytes = r - a), h;
                      }
                      var c = i.decode(n, r);
                      r += i.decode.bytes;
                      var f = c >> 3;
                      switch (f) {
                        case 1:
                          (h.start = e[0].decode(n, r)),
                            (r += e[0].decode.bytes),
                            (u = !0);
                          break;
                        case 2:
                          (h.length = e[0].decode(n, r)),
                            (r += e[0].decode.bytes);
                          break;
                        case 3:
                          (h.bitfield = e[1].decode(n, r)),
                            (r += e[1].decode.bytes);
                          break;
                        case 4:
                          (h.ack = e[2].decode(n, r)), (r += e[2].decode.bytes);
                          break;
                        default:
                          r = o(7 & c, n, r);
                      }
                    }
                  });
              })(),
              (function() {
                var e = [r.varint];
                function n(t) {
                  var n = 0;
                  if (!y(t.start)) throw new Error("start is required");
                  var r = e[0].encodingLength(t.start);
                  if (((n += 1 + r), y(t.length))) {
                    var r = e[0].encodingLength(t.length);
                    n += 1 + r;
                  }
                  return n;
                }
                (c.encodingLength = n),
                  (c.encode = function r(i, o, s) {
                    s || (s = 0);
                    o || (o = t.allocUnsafe(n(i)));
                    var a = s;
                    if (!y(i.start)) throw new Error("start is required");
                    o[s++] = 8;
                    e[0].encode(i.start, o, s);
                    s += e[0].encode.bytes;
                    y(i.length) &&
                      ((o[s++] = 16),
                      e[0].encode(i.length, o, s),
                      (s += e[0].encode.bytes));
                    r.bytes = s - a;
                    return o;
                  }),
                  (c.decode = function t(n, r, s) {
                    r || (r = 0);
                    s || (s = n.length);
                    if (!(s <= n.length && r <= n.length))
                      throw new Error("Decoded message is not valid");
                    var a = r;
                    var h = { start: 0, length: 1 };
                    var u = !1;
                    for (;;) {
                      if (s <= r) {
                        if (!u) throw new Error("Decoded message is not valid");
                        return (t.bytes = r - a), h;
                      }
                      var c = i.decode(n, r);
                      r += i.decode.bytes;
                      var f = c >> 3;
                      switch (f) {
                        case 1:
                          (h.start = e[0].decode(n, r)),
                            (r += e[0].decode.bytes),
                            (u = !0);
                          break;
                        case 2:
                          (h.length = e[0].decode(n, r)),
                            (r += e[0].decode.bytes);
                          break;
                        default:
                          r = o(7 & c, n, r);
                      }
                    }
                  });
              })(),
              (function() {
                var e = [r.varint];
                function n(t) {
                  var n = 0;
                  if (!y(t.start)) throw new Error("start is required");
                  var r = e[0].encodingLength(t.start);
                  if (((n += 1 + r), y(t.length))) {
                    var r = e[0].encodingLength(t.length);
                    n += 1 + r;
                  }
                  return n;
                }
                (f.encodingLength = n),
                  (f.encode = function r(i, o, s) {
                    s || (s = 0);
                    o || (o = t.allocUnsafe(n(i)));
                    var a = s;
                    if (!y(i.start)) throw new Error("start is required");
                    o[s++] = 8;
                    e[0].encode(i.start, o, s);
                    s += e[0].encode.bytes;
                    y(i.length) &&
                      ((o[s++] = 16),
                      e[0].encode(i.length, o, s),
                      (s += e[0].encode.bytes));
                    r.bytes = s - a;
                    return o;
                  }),
                  (f.decode = function t(n, r, s) {
                    r || (r = 0);
                    s || (s = n.length);
                    if (!(s <= n.length && r <= n.length))
                      throw new Error("Decoded message is not valid");
                    var a = r;
                    var h = { start: 0, length: 0 };
                    var u = !1;
                    for (;;) {
                      if (s <= r) {
                        if (!u) throw new Error("Decoded message is not valid");
                        return (t.bytes = r - a), h;
                      }
                      var c = i.decode(n, r);
                      r += i.decode.bytes;
                      var f = c >> 3;
                      switch (f) {
                        case 1:
                          (h.start = e[0].decode(n, r)),
                            (r += e[0].decode.bytes),
                            (u = !0);
                          break;
                        case 2:
                          (h.length = e[0].decode(n, r)),
                            (r += e[0].decode.bytes);
                          break;
                        default:
                          r = o(7 & c, n, r);
                      }
                    }
                  });
              })(),
              (function() {
                var e = [r.varint];
                function n(t) {
                  var n = 0;
                  if (!y(t.start)) throw new Error("start is required");
                  var r = e[0].encodingLength(t.start);
                  if (((n += 1 + r), y(t.length))) {
                    var r = e[0].encodingLength(t.length);
                    n += 1 + r;
                  }
                  return n;
                }
                (l.encodingLength = n),
                  (l.encode = function r(i, o, s) {
                    s || (s = 0);
                    o || (o = t.allocUnsafe(n(i)));
                    var a = s;
                    if (!y(i.start)) throw new Error("start is required");
                    o[s++] = 8;
                    e[0].encode(i.start, o, s);
                    s += e[0].encode.bytes;
                    y(i.length) &&
                      ((o[s++] = 16),
                      e[0].encode(i.length, o, s),
                      (s += e[0].encode.bytes));
                    r.bytes = s - a;
                    return o;
                  }),
                  (l.decode = function t(n, r, s) {
                    r || (r = 0);
                    s || (s = n.length);
                    if (!(s <= n.length && r <= n.length))
                      throw new Error("Decoded message is not valid");
                    var a = r;
                    var h = { start: 0, length: 0 };
                    var u = !1;
                    for (;;) {
                      if (s <= r) {
                        if (!u) throw new Error("Decoded message is not valid");
                        return (t.bytes = r - a), h;
                      }
                      var c = i.decode(n, r);
                      r += i.decode.bytes;
                      var f = c >> 3;
                      switch (f) {
                        case 1:
                          (h.start = e[0].decode(n, r)),
                            (r += e[0].decode.bytes),
                            (u = !0);
                          break;
                        case 2:
                          (h.length = e[0].decode(n, r)),
                            (r += e[0].decode.bytes);
                          break;
                        default:
                          r = o(7 & c, n, r);
                      }
                    }
                  });
              })(),
              (function() {
                var e = [r.varint, r.bool];
                function n(t) {
                  var n = 0;
                  if (!y(t.index)) throw new Error("index is required");
                  var r = e[0].encodingLength(t.index);
                  if (((n += 1 + r), y(t.bytes))) {
                    var r = e[0].encodingLength(t.bytes);
                    n += 1 + r;
                  }
                  if (y(t.hash)) {
                    var r = e[1].encodingLength(t.hash);
                    n += 1 + r;
                  }
                  if (y(t.nodes)) {
                    var r = e[0].encodingLength(t.nodes);
                    n += 1 + r;
                  }
                  return n;
                }
                (d.encodingLength = n),
                  (d.encode = function r(i, o, s) {
                    s || (s = 0);
                    o || (o = t.allocUnsafe(n(i)));
                    var a = s;
                    if (!y(i.index)) throw new Error("index is required");
                    o[s++] = 8;
                    e[0].encode(i.index, o, s);
                    s += e[0].encode.bytes;
                    y(i.bytes) &&
                      ((o[s++] = 16),
                      e[0].encode(i.bytes, o, s),
                      (s += e[0].encode.bytes));
                    y(i.hash) &&
                      ((o[s++] = 24),
                      e[1].encode(i.hash, o, s),
                      (s += e[1].encode.bytes));
                    y(i.nodes) &&
                      ((o[s++] = 32),
                      e[0].encode(i.nodes, o, s),
                      (s += e[0].encode.bytes));
                    r.bytes = s - a;
                    return o;
                  }),
                  (d.decode = function t(n, r, s) {
                    r || (r = 0);
                    s || (s = n.length);
                    if (!(s <= n.length && r <= n.length))
                      throw new Error("Decoded message is not valid");
                    var a = r;
                    var h = { index: 0, bytes: 0, hash: !1, nodes: 0 };
                    var u = !1;
                    for (;;) {
                      if (s <= r) {
                        if (!u) throw new Error("Decoded message is not valid");
                        return (t.bytes = r - a), h;
                      }
                      var c = i.decode(n, r);
                      r += i.decode.bytes;
                      var f = c >> 3;
                      switch (f) {
                        case 1:
                          (h.index = e[0].decode(n, r)),
                            (r += e[0].decode.bytes),
                            (u = !0);
                          break;
                        case 2:
                          (h.bytes = e[0].decode(n, r)),
                            (r += e[0].decode.bytes);
                          break;
                        case 3:
                          (h.hash = e[1].decode(n, r)),
                            (r += e[1].decode.bytes);
                          break;
                        case 4:
                          (h.nodes = e[0].decode(n, r)),
                            (r += e[0].decode.bytes);
                          break;
                        default:
                          r = o(7 & c, n, r);
                      }
                    }
                  });
              })(),
              (function() {
                var e = [r.varint, r.bool];
                function n(t) {
                  var n = 0;
                  if (!y(t.index)) throw new Error("index is required");
                  var r = e[0].encodingLength(t.index);
                  if (((n += 1 + r), y(t.bytes))) {
                    var r = e[0].encodingLength(t.bytes);
                    n += 1 + r;
                  }
                  if (y(t.hash)) {
                    var r = e[1].encodingLength(t.hash);
                    n += 1 + r;
                  }
                  return n;
                }
                (p.encodingLength = n),
                  (p.encode = function r(i, o, s) {
                    s || (s = 0);
                    o || (o = t.allocUnsafe(n(i)));
                    var a = s;
                    if (!y(i.index)) throw new Error("index is required");
                    o[s++] = 8;
                    e[0].encode(i.index, o, s);
                    s += e[0].encode.bytes;
                    y(i.bytes) &&
                      ((o[s++] = 16),
                      e[0].encode(i.bytes, o, s),
                      (s += e[0].encode.bytes));
                    y(i.hash) &&
                      ((o[s++] = 24),
                      e[1].encode(i.hash, o, s),
                      (s += e[1].encode.bytes));
                    r.bytes = s - a;
                    return o;
                  }),
                  (p.decode = function t(n, r, s) {
                    r || (r = 0);
                    s || (s = n.length);
                    if (!(s <= n.length && r <= n.length))
                      throw new Error("Decoded message is not valid");
                    var a = r;
                    var h = { index: 0, bytes: 0, hash: !1 };
                    var u = !1;
                    for (;;) {
                      if (s <= r) {
                        if (!u) throw new Error("Decoded message is not valid");
                        return (t.bytes = r - a), h;
                      }
                      var c = i.decode(n, r);
                      r += i.decode.bytes;
                      var f = c >> 3;
                      switch (f) {
                        case 1:
                          (h.index = e[0].decode(n, r)),
                            (r += e[0].decode.bytes),
                            (u = !0);
                          break;
                        case 2:
                          (h.bytes = e[0].decode(n, r)),
                            (r += e[0].decode.bytes);
                          break;
                        case 3:
                          (h.hash = e[1].decode(n, r)),
                            (r += e[1].decode.bytes);
                          break;
                        default:
                          r = o(7 & c, n, r);
                      }
                    }
                  });
              })(),
              (function() {
                var e = (g.Node = {
                  buffer: !0,
                  encodingLength: null,
                  encode: null,
                  decode: null
                });
                !(function() {
                  var n = [r.varint, r.bytes];
                  function s(e) {
                    var t = 0;
                    if (!y(e.index)) throw new Error("index is required");
                    var r = n[0].encodingLength(e.index);
                    if (((t += 1 + r), !y(e.hash)))
                      throw new Error("hash is required");
                    var r = n[1].encodingLength(e.hash);
                    if (((t += 1 + r), !y(e.size)))
                      throw new Error("size is required");
                    var r = n[0].encodingLength(e.size);
                    return (t += 1 + r);
                  }
                  (e.encodingLength = s),
                    (e.encode = function e(r, i, o) {
                      o || (o = 0);
                      i || (i = t.allocUnsafe(s(r)));
                      var a = o;
                      if (!y(r.index)) throw new Error("index is required");
                      i[o++] = 8;
                      n[0].encode(r.index, i, o);
                      o += n[0].encode.bytes;
                      if (!y(r.hash)) throw new Error("hash is required");
                      i[o++] = 18;
                      n[1].encode(r.hash, i, o);
                      o += n[1].encode.bytes;
                      if (!y(r.size)) throw new Error("size is required");
                      i[o++] = 24;
                      n[0].encode(r.size, i, o);
                      o += n[0].encode.bytes;
                      e.bytes = o - a;
                      return i;
                    }),
                    (e.decode = function e(t, r, s) {
                      r || (r = 0);
                      s || (s = t.length);
                      if (!(s <= t.length && r <= t.length))
                        throw new Error("Decoded message is not valid");
                      var a = r;
                      var h = { index: 0, hash: null, size: 0 };
                      var u = !1;
                      var c = !1;
                      var f = !1;
                      for (;;) {
                        if (s <= r) {
                          if (!u || !c || !f)
                            throw new Error("Decoded message is not valid");
                          return (e.bytes = r - a), h;
                        }
                        var l = i.decode(t, r);
                        r += i.decode.bytes;
                        var d = l >> 3;
                        switch (d) {
                          case 1:
                            (h.index = n[0].decode(t, r)),
                              (r += n[0].decode.bytes),
                              (u = !0);
                            break;
                          case 2:
                            (h.hash = n[1].decode(t, r)),
                              (r += n[1].decode.bytes),
                              (c = !0);
                            break;
                          case 3:
                            (h.size = n[0].decode(t, r)),
                              (r += n[0].decode.bytes),
                              (f = !0);
                            break;
                          default:
                            r = o(7 & l, t, r);
                        }
                      }
                    });
                })();
                var n = [r.varint, r.bytes, e];
                function s(e) {
                  var t = 0;
                  if (!y(e.index)) throw new Error("index is required");
                  var r = n[0].encodingLength(e.index);
                  if (((t += 1 + r), y(e.value))) {
                    var r = n[1].encodingLength(e.value);
                    t += 1 + r;
                  }
                  if (y(e.nodes))
                    for (var o = 0; o < e.nodes.length; o++)
                      if (y(e.nodes[o])) {
                        var r = n[2].encodingLength(e.nodes[o]);
                        (t += i.encodingLength(r)), (t += 1 + r);
                      }
                  if (y(e.signature)) {
                    var r = n[1].encodingLength(e.signature);
                    t += 1 + r;
                  }
                  return t;
                }
                (g.encodingLength = s),
                  (g.encode = function e(r, o, a) {
                    a || (a = 0);
                    o || (o = t.allocUnsafe(s(r)));
                    var h = a;
                    if (!y(r.index)) throw new Error("index is required");
                    o[a++] = 8;
                    n[0].encode(r.index, o, a);
                    a += n[0].encode.bytes;
                    y(r.value) &&
                      ((o[a++] = 18),
                      n[1].encode(r.value, o, a),
                      (a += n[1].encode.bytes));
                    if (y(r.nodes))
                      for (var u = 0; u < r.nodes.length; u++)
                        y(r.nodes[u]) &&
                          ((o[a++] = 26),
                          i.encode(n[2].encodingLength(r.nodes[u]), o, a),
                          (a += i.encode.bytes),
                          n[2].encode(r.nodes[u], o, a),
                          (a += n[2].encode.bytes));
                    y(r.signature) &&
                      ((o[a++] = 34),
                      n[1].encode(r.signature, o, a),
                      (a += n[1].encode.bytes));
                    e.bytes = a - h;
                    return o;
                  }),
                  (g.decode = function e(t, r, s) {
                    r || (r = 0);
                    s || (s = t.length);
                    if (!(s <= t.length && r <= t.length))
                      throw new Error("Decoded message is not valid");
                    var a = r;
                    var h = {
                      index: 0,
                      value: null,
                      nodes: [],
                      signature: null
                    };
                    var u = !1;
                    for (;;) {
                      if (s <= r) {
                        if (!u) throw new Error("Decoded message is not valid");
                        return (e.bytes = r - a), h;
                      }
                      var c = i.decode(t, r);
                      r += i.decode.bytes;
                      var f = c >> 3;
                      switch (f) {
                        case 1:
                          (h.index = n[0].decode(t, r)),
                            (r += n[0].decode.bytes),
                            (u = !0);
                          break;
                        case 2:
                          (h.value = n[1].decode(t, r)),
                            (r += n[1].decode.bytes);
                          break;
                        case 3:
                          var l = i.decode(t, r);
                          (r += i.decode.bytes),
                            h.nodes.push(n[2].decode(t, r, r + l)),
                            (r += n[2].decode.bytes);
                          break;
                        case 4:
                          (h.signature = n[1].decode(t, r)),
                            (r += n[1].decode.bytes);
                          break;
                        default:
                          r = o(7 & c, t, r);
                      }
                    }
                  });
              })();
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169, "protocol-buffers-encodings": 87 }
      ],
      46: [
        function(e, t, n) {
          arguments[4][6][0].apply(n, arguments);
        },
        { dup: 6 }
      ],
      47: [
        function(e, t, n) {
          arguments[4][7][0].apply(n, arguments);
        },
        { dup: 7 }
      ],
      48: [
        function(e, t, n) {
          arguments[4][8][0].apply(n, arguments);
        },
        { "./decode.js": 46, "./encode.js": 47, "./length.js": 49, dup: 8 }
      ],
      49: [
        function(e, t, n) {
          arguments[4][9][0].apply(n, arguments);
        },
        { dup: 9 }
      ],
      50: [
        function(e, t, n) {
          (function(n, r) {
            var i = e("last-one-wins"),
              o = e("unordered-array-remove"),
              s = e("unordered-set"),
              a = e("merkle-tree-stream/generator"),
              h = e("flat-tree"),
              u = e("bulk-write-stream"),
              c = e("from2"),
              f = e("codecs"),
              l = e("thunky"),
              d = e("atomic-batcher"),
              p = e("inherits"),
              g = e("events"),
              y = e("random-access-file"),
              A = e("./lib/bitfield"),
              b = e("sparse-bitfield"),
              _ = e("./lib/tree-index"),
              v = e("./lib/storage"),
              w = e("hypercore-crypto"),
              m = e("inspect-custom-symbol"),
              I = e("pretty-hash"),
              E = e("nanoguard"),
              C = e("./lib/safe-buffer-equals"),
              B = null,
              x = {
                sign: (e, t, n) => n(null, w.sign(e, t)),
                verify: (e, t, n, r) => r(null, w.verify(e, t, n))
              };
            function k(t, n, o) {
              if (!(this instanceof k)) return new k(t, n, o);
              var s;
              if (
                (g.EventEmitter.call(this),
                "string" == typeof t &&
                  ((s = t),
                  (t = function(t) {
                    try {
                      var n = "bitfield" === t ? e("fd-lock") : null;
                    } catch (e) {}
                    return y(t, { directory: s, lock: n });
                  })),
                "function" != typeof t)
              )
                throw new Error("Storage should be a function or string");
              "string" == typeof n && (n = r.from(n, "hex")),
                r.isBuffer(n) || o || ((o = n), (n = null)),
                o || (o = {});
              var a = this,
                h = o.secretKey || null;
              "string" == typeof h && (h = r.from(h, "hex")),
                (this.id = o.id || w.randomBytes(32)),
                (this.live = !1 !== o.live),
                (this.sparse = !!o.sparse),
                (this.length = 0),
                (this.byteLength = 0),
                (this.maxRequests = o.maxRequests || 16),
                (this.key = n || o.key || null),
                (this.discoveryKey = this.key && w.discoveryKey(this.key)),
                (this.secretKey = h),
                (this.bitfield = null),
                (this.tree = null),
                (this.writable = !!o.writable),
                (this.readable = !0),
                (this.opened = !1),
                (this.closed = !1),
                (this.allowPush = !!o.allowPush),
                (this.peers = []),
                (this.ifAvailable = new E()),
                (this.extensions = (o.extensions || []).sort()),
                (this.crypto = o.crypto || x),
                (this._onwrite = o.onwrite || null),
                (this._ready = l(function(e) {
                  a._open(e);
                })),
                (this._indexing = !!o.indexing),
                (this._createIfMissing = !1 !== o.createIfMissing),
                (this._overwrite = !!o.overwrite),
                (this._storeSecretKey = !1 !== o.storeSecretKey),
                (this._merkle = null),
                (this._storage = v(t, o.storageCacheSize)),
                (this._batch = d(
                  this._onwrite
                    ? function e(t, n) {
                        if (!a._merkle)
                          return a._reloadMerkleStateBeforeAppend(e, t, n);
                        a._appendHook(t, n);
                      }
                    : function e(t, n) {
                        if (!a._merkle)
                          return a._reloadMerkleStateBeforeAppend(e, t, n);
                        a._append(t, n);
                      }
                )),
                (this._seq = 0),
                (this._waiting = []),
                (this._selections = []),
                (this._reserved = b()),
                (this._synced = null),
                (this._stats =
                  void 0 === o.stats || o.stats
                    ? {
                        downloadedBlocks: 0,
                        downloadedBytes: 0,
                        uploadedBlocks: 0,
                        uploadedBytes: 0
                      }
                    : null),
                (this._codec = U(o.valueEncoding)),
                (this._sync = i(function(e, t) {
                  a._syncBitfield(t);
                })),
                this.sparse || this.download({ start: 0, end: -1 }),
                this.sparse &&
                  o.eagerUpdate &&
                  this.update(function e(t) {
                    t && this.emit("update-error", t), a.update(e);
                  }),
                this._ready(function(e) {
                  e && a.emit("error", e);
                });
            }
            function S() {}
            function Q(e, t) {
              return (
                e && e.index === t.index && 0 === r.compare(e.hash, t.hash)
              );
            }
            function D(e, t) {
              return e + t.size;
            }
            function M(e) {
              return 0 == (1 & e);
            }
            function U(e) {
              return f("json" === e ? "ndjson" : e);
            }
            function L(e, t) {
              return function(n, r) {
                if (n) return t(n);
                try {
                  r = e.decode(r);
                } catch (n) {
                  return t(n);
                }
                t(null, r);
              };
            }
            function T(e, t) {
              var n = !1,
                r = setTimeout(function() {
                  n = !0;
                  var t = new Error("ETIMEDOUT");
                  (t.code = "ETIMEDOUT"), e(t);
                }, t);
              return function(t, i) {
                if (n) return;
                clearTimeout(r), e(t, i);
              };
            }
            function F(e) {
              return 1024 * Math.floor(e / 1024 / 1024) * 1024;
            }
            function O(e, t, n) {
              var r = new Error(n);
              return (r.code = e), (r.errno = t), r;
            }
            (t.exports = k),
              p(k, g.EventEmitter),
              (k.discoveryKey = w.discoveryKey),
              (k.prototype[m] = function(e, t) {
                var n = "";
                if ("number" == typeof t.indentationLvl)
                  for (; n.length < t.indentationLvl; ) n += " ";
                return (
                  "Hypercore(\n" +
                  n +
                  "  key: " +
                  t.stylize(this.key && I(this.key), "string") +
                  "\n" +
                  n +
                  "  discoveryKey: " +
                  t.stylize(
                    this.discoveryKey && I(this.discoveryKey),
                    "string"
                  ) +
                  "\n" +
                  n +
                  "  opened: " +
                  t.stylize(this.opened, "boolean") +
                  "\n" +
                  n +
                  "  sparse: " +
                  t.stylize(this.sparse, "boolean") +
                  "\n" +
                  n +
                  "  writable: " +
                  t.stylize(this.writable, "boolean") +
                  "\n" +
                  n +
                  "  length: " +
                  t.stylize(this.length, "number") +
                  "\n" +
                  n +
                  "  byteLength: " +
                  t.stylize(this.byteLength, "number") +
                  "\n" +
                  n +
                  "  peers: " +
                  t.stylize(this.peers.length, "number") +
                  "\n" +
                  n +
                  ")"
                );
              }),
              Object.defineProperty(k.prototype, "remoteLength", {
                enumerable: !0,
                get: function() {
                  for (var e = 0, t = 0; t < this.peers.length; t++) {
                    var n = this.peers[t].remoteLength;
                    n > e && (e = n);
                  }
                  return e;
                }
              }),
              Object.defineProperty(k.prototype, "stats", {
                enumerable: !0,
                get: function() {
                  if (!this._stats) return null;
                  for (var e = [], t = 0; t < this.peers.length; t++) {
                    var n = this.peers[t];
                    e[t] = n._stats;
                  }
                  return { peers: e, totals: this._stats };
                }
              }),
              (k.prototype.replicate = function(t) {
                B || (B = e("./lib/replicate")),
                  (this._selections.length && -1 === this._selections[0].end) ||
                    this.sparse ||
                    (t && t.live) ||
                    this.download({ start: 0, end: -1 }),
                  ((t = t || {}).stats = !!this._stats),
                  t.extensions || (t.extensions = this.extensions);
                var n = B(this, t);
                return this.emit("replicating", n), n;
              }),
              (k.prototype.ready = function(e) {
                this._ready(function(t) {
                  t || e();
                });
              }),
              (k.prototype.update = function(e, t) {
                if ("function" == typeof e) return this.update(-1, e);
                "number" == typeof e && (e = { minLength: e }),
                  e || (e = {}),
                  t || (t = S);
                var n = this,
                  r = "number" == typeof e.minLength ? e.minLength : -1;
                this.ready(function(i) {
                  if (i) return t(i);
                  if ((-1 === r && (r = n.length + 1), n.length >= r))
                    return t(null);
                  n.writable && (t = n._writeStateReloader(t));
                  var o = {
                    hash: !1 !== e.hash,
                    bytes: 0,
                    index: r - 1,
                    update: !0,
                    options: e,
                    callback: t
                  };
                  n._waiting.push(o),
                    e.ifAvailable && n._ifAvailable(o, r),
                    n._updatePeers();
                });
              }),
              (k.prototype._ifAvailable = function(e, t) {
                var n = e.callback,
                  r = !1,
                  i = this;
                function o(t) {
                  if (!r) {
                    r = !0;
                    var o = i._waiting.indexOf(e);
                    o > -1 && i._waiting.splice(o, 1), n(t);
                  }
                }
                (e.callback = o),
                  this.ifAvailable.ready(function() {
                    if (i.closed) return o(new Error("Closed"));
                    i.length >= t ||
                      i.remoteLength >= t ||
                      o(new Error("No update available from peers"));
                  });
              }),
              (k.prototype._ifAvailableGet = function(e) {
                var t = e.callback,
                  n = !1,
                  r = this;
                function i(i, o) {
                  if (!n) {
                    n = !0;
                    var s = r._waiting.indexOf(e);
                    s > -1 && r._waiting.splice(s, 1), t(i, o);
                  }
                }
                (e.callback = i),
                  this.ifAvailable.ready(function() {
                    if (r.closed) return i(new Error("Closed"));
                    for (var t = 0; t < r.peers.length; t++) {
                      if (r.peers[t].remoteBitfield.get(e.index)) return;
                    }
                    i(new Error("Block not available from peers"));
                  });
              }),
              (k.prototype._writeStateReloader = function(e) {
                var t = this;
                return function(n) {
                  if (n) return e(n);
                  t._reloadMerkleState(e);
                };
              }),
              (k.prototype._reloadMerkleState = function(e) {
                var t = this;
                this._roots(t.length, function(n, r) {
                  if (n) return e(n);
                  (t._merkle = a(w, r)), e(null);
                });
              }),
              (k.prototype._reloadMerkleStateBeforeAppend = function(e, t, n) {
                this._reloadMerkleState(function(r) {
                  if (r) return n(r);
                  e(t, n);
                });
              }),
              (k.prototype._open = function(e) {
                var t = this,
                  n = !1,
                  i = !0;
                function o(o, s) {
                  if (o) return e(o);
                  if (
                    (!s.key && s.bitfield.length && (t._overwrite = !0),
                    t._overwrite &&
                      ((s.bitfield = []), (s.key = s.secretKey = null)),
                    (t.bitfield = A(s.bitfieldPageSize, s.bitfield)),
                    (t.tree = _(t.bitfield.tree)),
                    (t.length = t.tree.blocks()),
                    (t._seq = t.length),
                    s.key && t.key && 0 !== r.compare(s.key, t.key))
                  )
                    return t._forceCloseAndError(
                      e,
                      new Error("Another hypercore is stored here")
                    );
                  if (
                    (s.key && (t.key = s.key),
                    s.secretKey && (t.secretKey = s.secretKey),
                    !t.length)
                  )
                    return h(null, null);
                  function h(r, o) {
                    if (
                      (t.length && (t.live = !!o),
                      (n || !t.key) && !t._createIfMissing)
                    )
                      return t._forceCloseAndError(
                        e,
                        new Error("No hypercore is stored here")
                      );
                    if (!t.key && t.live) {
                      var u = w.keyPair();
                      (t.secretKey = u.secretKey), (t.key = u.publicKey);
                    }
                    var c = !!t.secretKey || null === t.key;
                    if (!c && t.writable)
                      return t._forceCloseAndError(
                        e,
                        new Error("Feed is not writable")
                      );
                    (t.writable = c),
                      (t.discoveryKey = t.key && w.discoveryKey(t.key)),
                      t._storeSecretKey &&
                        !t.secretKey &&
                        (t._storeSecretKey = !1);
                    var f = n || !C(t.key, s.key),
                      l =
                        t._storeSecretKey &&
                        (n || !C(t.secretKey, s.secretKey)),
                      d =
                        1 + (f ? 1 : 0) + (l ? 1 : 0) + (t._overwrite ? 1 : 0),
                      p = null;
                    function g(n) {
                      if ((n && (p = n), !--d))
                        return p
                          ? t._forceCloseAndError(e, p)
                          : void t._roots(t.length, y);
                    }
                    function y(n, r) {
                      return n && i
                        ? ((i = !1),
                          t.length--,
                          void t._storage.getSignature(t.length - 1, h))
                        : n
                        ? t._forceCloseAndError(e, n)
                        : ((t._merkle = a(w, r)),
                          (t.byteLength = r.reduce(D, 0)),
                          (t.opened = !0),
                          t.emit("ready"),
                          void e(null));
                    }
                    f && t._storage.key.write(0, t.key, g),
                      l && t._storage.secretKey.write(0, t.secretKey, g),
                      t._overwrite && t._storage.bitfield.del(32, 1 / 0, g),
                      g(null);
                  }
                  t._storage.getSignature(t.length - 1, h);
                }
                this._storage.openKey(function(e, r) {
                  if (
                    (!r || t._overwrite || t.key || (t.key = r),
                    !t.key && t.live)
                  ) {
                    var i = w.keyPair();
                    (t.secretKey = i.secretKey),
                      (t.key = i.publicKey),
                      (n = !0);
                  }
                  (t.discoveryKey = t.key && w.discoveryKey(t.key)),
                    t._storage.open(
                      { key: t.key, discoveryKey: t.discoveryKey },
                      o
                    );
                });
              }),
              (k.prototype.download = function(e, t) {
                if ("function" == typeof e) return this.download(null, e);
                if (
                  ("number" == typeof e && (e = { start: e, end: e + 1 }),
                  e || (e = {}),
                  t || (t = S),
                  !this.readable)
                )
                  return t(new Error("Feed is closed"));
                var n = {
                  _index: this._selections.length,
                  hash: !!e.hash,
                  iterator: null,
                  start: e.start || 0,
                  end: e.end || -1,
                  want: 0,
                  linear: !!e.linear,
                  callback: t
                };
                return (
                  (n.want = F(n.start)),
                  this._selections.push(n),
                  this._updatePeers(),
                  n
                );
              }),
              (k.prototype.undownload = function(e) {
                if (
                  ("number" == typeof e && (e = { start: e, end: e + 1 }),
                  e || (e = {}),
                  e.callback && e._index > -1)
                )
                  return (
                    s.remove(this._selections, e),
                    void n.nextTick(
                      e.callback,
                      O("ECANCELED", -11, "Download was cancelled")
                    )
                  );
                for (
                  var t = e.start || 0,
                    r = e.end || -1,
                    i = !!e.hash,
                    o = !!e.linear,
                    a = 0;
                  a < this._selections.length;
                  a++
                ) {
                  var h = this._selections[a];
                  if (
                    h.start === t &&
                    h.end === r &&
                    h.hash === i &&
                    h.linear === o
                  )
                    return (
                      s.remove(this._selections, h),
                      void n.nextTick(
                        e.callback,
                        O("ECANCELED", -11, "Download was cancelled")
                      )
                    );
                }
              }),
              (k.prototype.digest = function(e) {
                return this.tree.digest(2 * e);
              }),
              (k.prototype.proof = function(e, t, n) {
                if ("function" == typeof t) return this.proof(e, null, t);
                if (!this.opened) return this._readyAndProof(e, t, n);
                t || (t = {});
                var r = this.tree.proof(2 * e, t);
                if (!r)
                  return n(new Error("No proof available for this index"));
                var i = this.live && !!r.verifiedBy,
                  o = r.nodes.length + (i ? 1 : 0),
                  s = null,
                  a = null,
                  h = new Array(r.nodes.length);
                if (!o) return n(null, { nodes: h, signature: null });
                for (var u = 0; u < r.nodes.length; u++)
                  this._storage.getNode(r.nodes[u], c);
                function c(e, t) {
                  if (
                    (e && (s = e), t && (h[r.nodes.indexOf(t.index)] = t), !--o)
                  )
                    return s ? n(s) : void n(null, { nodes: h, signature: a });
                }
                i &&
                  this._storage.getSignature(r.verifiedBy / 2 - 1, function(
                    e,
                    t
                  ) {
                    t && (a = t);
                    c(e, null);
                  });
              }),
              (k.prototype._readyAndProof = function(e, t, n) {
                var r = this;
                this._ready(function(i) {
                  if (i) return n(i);
                  r.proof(e, t, n);
                });
              }),
              (k.prototype.put = function(e, t, n, r) {
                if (!this.opened) return this._readyAndPut(e, t, n, r);
                this._putBuffer(e, this._codec.encode(t), n, null, r);
              }),
              (k.prototype.cancel = function(e, t) {
                t || (t = e + 1);
                for (var n = this._selections.length - 1; n >= 0; n--) {
                  var r = this._selections[n];
                  e <= r.start && r.end <= t && this.undownload(r);
                }
                this.opened ? this._cancel(e, t) : this._readyAndCancel(e, t);
              }),
              (k.prototype._cancel = function(e, t) {
                var r = 0;
                for (r = e; r < t; r++) this._reserved.set(r, !1);
                for (r = this._waiting.length - 1; r >= 0; r--) {
                  var i = this._waiting[r];
                  ((e <= i.start && i.end <= t) ||
                    (e <= i.index && i.index < t)) &&
                    (o(this._waiting, r),
                    i.callback &&
                      n.nextTick(i.callback, new Error("Request cancelled")));
                }
              }),
              (k.prototype.clear = function(e, t, r, i) {
                if ("function" == typeof t)
                  return this.clear(e, e + 1, null, t);
                if ("function" == typeof r) return this.clear(e, t, null, r);
                r || (r = {}), t || (t = e + 1), i || (i = S);
                var o = this,
                  s =
                    0 === e
                      ? 0
                      : "number" == typeof r.byteOffset
                      ? r.byteOffset
                      : -1,
                  a = "number" == typeof r.byteLength ? r.byteLength : -1;
                this._ready(function(h) {
                  if (h) return i(h);
                  for (var u = !1, c = e; c < t; c++)
                    o.bitfield.set(c, !1) && (u = !0);
                  if (!u) return n.nextTick(i);
                  if (
                    (o._unannounce({ start: e, length: t - e }),
                    !1 === r.delete || o._indexing)
                  )
                    return f();
                  if (s > -1) return l(null, s);
                  function f() {
                    o.emit("clear", e, t), o._sync(null, i);
                  }
                  function l(e, n) {
                    return e
                      ? i(e)
                      : ((s = n),
                        a > -1
                          ? d(null, a + s)
                          : t === o.length
                          ? d(null, o.byteLength)
                          : void o._storage.dataOffset(t, [], d));
                  }
                  function d(e, t) {
                    return e
                      ? i(e)
                      : o._storage.data.del
                      ? void o._storage.data.del(s, t - s, f)
                      : f();
                  }
                  o._storage.dataOffset(e, [], l);
                });
              }),
              (k.prototype.signature = function(e, t) {
                return "function" == typeof e
                  ? this.signature(this.length - 1, e)
                  : e < 0 || e >= this.length
                  ? t(new Error("No signature available for this index"))
                  : void this._storage.nextSignature(e, t);
              }),
              (k.prototype.verify = function(e, t, n) {
                var r = this;
                this.rootHashes(e, function(e, i) {
                  if (e) return n(e);
                  var o = w.tree(i);
                  r.crypto.verify(o, t, r.key, function(e, t) {
                    return e
                      ? n(e)
                      : t
                      ? n(null, !0)
                      : n(new Error("Signature verification failed"));
                  });
                });
              }),
              (k.prototype.rootHashes = function(e, t) {
                this._getRootsToVerify(2 * e + 2, {}, [], t);
              }),
              (k.prototype.seek = function(e, t, r) {
                if ("function" == typeof t) return this.seek(e, null, t);
                if ((t || (t = {}), !this.opened))
                  return this._readyAndSeek(e, t, r);
                var i = this;
                if (e === this.byteLength)
                  return n.nextTick(r, null, this.length, 0);
                this._seek(e, function(n, o, s) {
                  if (!n && M(o))
                    return (function(t, n) {
                      for (var o = 0; o < i.peers.length; o++)
                        i.peers[o].haveBytes(e);
                      r(null, t, n);
                    })(o / 2, s);
                  if (!1 === t.wait)
                    return r(n || new Error("Unable to seek to this offset"));
                  var a = t.start || 0,
                    u = t.end || -1;
                  if (!n) {
                    var c = h.leftSpan(o) / 2,
                      f = h.rightSpan(o) / 2 + 1;
                    c > a && (a = c), (f < u || -1 === u) && (u = f);
                  }
                  if (u > -1 && u <= a)
                    return r(new Error("Unable to seek to this offset"));
                  i._waiting.push({
                    hash: !1 !== t.hash,
                    bytes: e,
                    index: -1,
                    start: a,
                    end: u,
                    want: F(a),
                    callback: r || S
                  }),
                    i._updatePeers();
                });
              }),
              (k.prototype._seek = function(e, t) {
                if (0 === e) return t(null, 0, 0);
                var n = this,
                  r = h.fullRoots(2 * this.length),
                  i = 0;
                function o(r) {
                  if (M(r)) return t(null, i, e);
                  for (var o = h.leftChild(r); !n.tree.get(o); ) {
                    if (M(o)) return t(null, i, e);
                    o = h.leftChild(o);
                  }
                  n._storage.getNode(o, s);
                }
                function s(n, r) {
                  if (n) return t(n);
                  r.size > e
                    ? ((i = r.index), o(r.index))
                    : ((e -= r.size),
                      h.parent(r.index) === i
                        ? o((i = h.sibling(r.index)))
                        : o(h.sibling(r.index)));
                }
                !(function s(a, h) {
                  if (a) return t(a);
                  if (h) {
                    if (h.size > e) return (i = h.index), o(h.index);
                    e -= h.size;
                  }
                  if (!r.length) return t(new Error("Out of bounds"));
                  n._storage.getNode(r.shift(), s);
                })(null, null);
              }),
              (k.prototype._readyAndSeek = function(e, t, n) {
                var r = this;
                this._ready(function(i) {
                  if (i) return n(i);
                  r.seek(e, t, n);
                });
              }),
              (k.prototype._getBuffer = function(e, t) {
                this._storage.getData(e, t);
              }),
              (k.prototype._putBuffer = function(e, t, n, r, i) {
                for (
                  var o = this, s = -1, a = [], u = 2 * e, c = t ? 0 : 1;
                  ;

                ) {
                  if (this.tree.get(u)) {
                    s = u;
                    break;
                  }
                  var f = h.sibling(u);
                  if (
                    ((u = h.parent(u)),
                    c < n.nodes.length && n.nodes[c].index === f)
                  )
                    c++;
                  else {
                    if (!this.tree.get(f)) break;
                    a.push(f);
                  }
                }
                -1 === s && this.tree.get(u) && (s = u);
                var l = null,
                  d = null,
                  p = new Array(a.length),
                  g = a.length + (s > -1 ? 1 : 0);
                for (c = 0; c < a.length; c++) this._storage.getNode(a[c], y);
                function y(e, t) {
                  e && (l = e), t && (p[a.indexOf(t.index)] = t), --g || A(l);
                }
                function A(s) {
                  if (s) return i(s);
                  o._verifyAndWrite(e, t, n, p, d, r, i);
                }
                s > -1 &&
                  this._storage.getNode(s, function(e, t) {
                    e && (l = e);
                    t && (d = t);
                    --g || A(l);
                  }),
                  a.length || -1 !== s || A(null);
              }),
              (k.prototype._readyAndPut = function(e, t, n, r) {
                var i = this;
                this._ready(function(o) {
                  if (o) return r(o);
                  i.put(e, t, n, r);
                });
              }),
              (k.prototype._write = function(e, t, n, r, i, o) {
                if (!this._onwrite)
                  return this._writeAfterHook(e, t, n, r, i, o);
                this._onwrite(
                  e,
                  t,
                  i,
                  (function(e, t, n, r, i, o, s) {
                    return function(a) {
                      if (a) return s(a);
                      e._writeAfterHook(t, n, r, i, o, s);
                    };
                  })(this, e, t, n, r, i, o)
                );
              }),
              (k.prototype._writeAfterHook = function(e, t, n, r, i, o) {
                for (
                  var s = this, a = n.length + 1 + (r ? 1 : 0), h = null, u = 0;
                  u < n.length;
                  u++
                )
                  this._storage.putNode(n[u].index, n[u], c);
                function c(r) {
                  if ((r && (h = r), !--a))
                    return h ? o(h) : void s._writeDone(e, t, n, i, o);
                }
                t ? this._storage.putData(e, t, n, c) : c(),
                  r && this._storage.putSignature(r.index, r.signature, c);
              }),
              (k.prototype._writeDone = function(e, t, n, r, i) {
                for (var o = 0; o < n.length; o++) this.tree.set(n[o].index);
                this.tree.set(2 * e),
                  t &&
                    (this.bitfield.set(e, !0) &&
                      (this._stats &&
                        ((this._stats.downloadedBlocks += 1),
                        (this._stats.downloadedBytes += t.length)),
                      this.emit("download", e, t, r)),
                    this.peers.length && this._announce({ start: e }, r),
                    this.writable ||
                      (this._synced ||
                        (this._synced = this.bitfield.iterator(0, this.length)),
                      -1 === this._synced.next() &&
                        (this._synced.range(0, this.length),
                        this._synced.seek(0),
                        -1 === this._synced.next() && this.emit("sync")))),
                  this._sync(null, i);
              }),
              (k.prototype._verifyAndWrite = function(e, t, n, r, i, o, s) {
                var a = [],
                  u = n.nodes,
                  c = t ? new v.Node(2 * e, w.data(t), t.length) : u.shift();
                if (Q(i, c)) this._write(e, t, a, null, o, s);
                else
                  for (;;) {
                    var f = null,
                      l = h.sibling(c.index);
                    if (u.length && u[0].index === l)
                      (f = u.shift()), a.push(f);
                    else {
                      if (!r.length || r[0].index !== l)
                        return void this._verifyRootsAndWrite(
                          e,
                          t,
                          c,
                          n,
                          a,
                          o,
                          s
                        );
                      f = r.shift();
                    }
                    if (
                      (a.push(c),
                      Q(
                        i,
                        (c = new v.Node(
                          h.parent(c.index),
                          w.parent(c, f),
                          c.size + f.size
                        ))
                      ))
                    )
                      return void this._write(e, t, a, null, o, s);
                  }
              }),
              (k.prototype._verifyRootsAndWrite = function(
                e,
                t,
                n,
                i,
                o,
                s,
                a
              ) {
                var u = i.nodes,
                  c = u.length ? u[u.length - 1].index : n.index,
                  f = Math.max(h.rightSpan(n.index), h.rightSpan(c)) + 2,
                  l = this;
                this._getRootsToVerify(f, n, u, function(n, h, u) {
                  if (n) return a(n);
                  var c = w.tree(h),
                    d = null;
                  if (l.length && l.live && !i.signature)
                    return a(new Error("Remote did not include a signature"));
                  if (i.signature)
                    l.crypto.verify(c, i.signature, l.key, function(e, t) {
                      return e
                        ? a(e)
                        : t
                        ? ((d = { index: f / 2 - 1, signature: i.signature }),
                          void p())
                        : a(
                            new Error("Remote signature could not be verified")
                          );
                    });
                  else {
                    if (0 !== r.compare(c, l.key))
                      return a(new Error("Remote checksum failed"));
                    p();
                  }
                  function p() {
                    l.live = !!d;
                    var n = f / 2;
                    n > l.length &&
                      (l.writable && (l._merkle = null),
                      (l.length = n),
                      (l._seq = n),
                      (l.byteLength = h.reduce(D, 0)),
                      l._synced && l._synced.seek(0, l.length),
                      l.emit("append")),
                      l._write(e, t, o.concat(u), d, s, a);
                  }
                });
              }),
              (k.prototype._getRootsToVerify = function(e, t, n, r) {
                for (
                  var i = h.fullRoots(e),
                    o = new Array(i.length),
                    s = [],
                    a = null,
                    u = o.length,
                    c = 0;
                  c < i.length;
                  c++
                )
                  i[c] === t.index
                    ? (s.push(t), f(null, t))
                    : n.length && i[c] === n[0].index
                    ? (s.push(n[0]), f(null, n.shift()))
                    : this.tree.get(i[c])
                    ? this._storage.getNode(i[c], f)
                    : f(new Error("Missing tree roots needed for verify"));
                function f(e, t) {
                  e && (a = e),
                    t && (o[i.indexOf(t.index)] = t),
                    --u ||
                      (function(e) {
                        if (e) return r(e);
                        r(null, o, s);
                      })(a);
                }
              }),
              (k.prototype._announce = function(e, t) {
                for (var n = 0; n < this.peers.length; n++) {
                  var r = this.peers[n];
                  r !== t && r.have(e);
                }
              }),
              (k.prototype._unannounce = function(e) {
                for (var t = 0; t < this.peers.length; t++)
                  this.peers[t].unhave(e);
              }),
              (k.prototype.downloaded = function(e, t) {
                return this.bitfield.total(e, t);
              }),
              (k.prototype.has = function(e, t) {
                return void 0 === t
                  ? this.bitfield.get(e)
                  : t - e === this.bitfield.total(e, t);
              }),
              (k.prototype.head = function(e, t) {
                if ("function" == typeof e) return this.head({}, e);
                var n = this;
                this._ready(function(r) {
                  if (r) return t(r);
                  0 === n.length
                    ? t(new Error("feed is empty"))
                    : n.get(n.length - 1, e, t);
                });
              }),
              (k.prototype.get = function(e, t, n) {
                if ("function" == typeof t) return this.get(e, null, t);
                if (!this.opened) return this._readyAndGet(e, t, n);
                if (!this.readable) return n(new Error("Feed is closed"));
                if (
                  (t && t.timeout && (n = T(n, t.timeout)),
                  !this.bitfield.get(e))
                ) {
                  if (t && !1 === t.wait)
                    return n(new Error("Block not downloaded"));
                  var r = {
                    bytes: 0,
                    hash: !1,
                    index: e,
                    options: t,
                    callback: n
                  };
                  return (
                    this._waiting.push(r),
                    t && t.ifAvailable && this._ifAvailableGet(r),
                    void this._updatePeers()
                  );
                }
                t && t.valueEncoding
                  ? (n = L(U(t.valueEncoding), n))
                  : this._codec !== f.binary && (n = L(this._codec, n)),
                  this._getBuffer(e, n);
              }),
              (k.prototype._readyAndGet = function(e, t, n) {
                var r = this;
                this._ready(function(i) {
                  if (i) return n(i);
                  r.get(e, t, n);
                });
              }),
              (k.prototype.getBatch = function(e, t, n, r) {
                if ("function" == typeof n) return this.getBatch(e, t, null, n);
                if (!this.opened) return this._readyAndGetBatch(e, t, n, r);
                var i = this,
                  o = !n || !1 !== n.wait;
                return this.has(e, t)
                  ? this._getBatch(e, t, n, r)
                  : o
                  ? (n && n.timeout && (r = T(r, n.timeout)),
                    void this.download({ start: e, end: t }, function(o) {
                      if (o) return r(o);
                      i._getBatch(e, t, n, r);
                    }))
                  : r(new Error("Block not downloaded"));
              }),
              (k.prototype._getBatch = function(e, t, n, r) {
                var i = n && n.valueEncoding,
                  o = i ? U(i) : this._codec;
                this._storage.getDataBatch(e, t - e, function(e, t) {
                  if (e) return r(e);
                  for (var n = new Array(t.length), i = 0; i < t.length; i++)
                    try {
                      n[i] = o ? o.decode(t[i]) : t[i];
                    } catch (e) {
                      return r(e);
                    }
                  r(null, n);
                });
              }),
              (k.prototype._readyAndGetBatch = function(e, t, n, r) {
                var i = this;
                this._ready(function(o) {
                  if (o) return r(o);
                  i.getBatch(e, t, n, r);
                });
              }),
              (k.prototype._updatePeers = function() {
                for (var e = 0; e < this.peers.length; e++)
                  this.peers[e].update();
              }),
              (k.prototype.createWriteStream = function() {
                var e = this;
                return u.obj(function(t, n) {
                  e.append(t, n);
                });
              }),
              (k.prototype.createReadStream = function(e) {
                e || (e = {});
                var t = this,
                  n = e.start || 0,
                  r = "number" == typeof e.end ? e.end : -1,
                  i = !!e.live,
                  o = !1 !== e.snapshot,
                  s = !0,
                  a = this.download({ start: n, end: r, linear: !0 });
                return c
                  .obj(h)
                  .on("end", u)
                  .on("close", u);
                function h(u, c) {
                  if (!t.opened)
                    return (function(e, n) {
                      t._ready(function(t) {
                        if (t) return n(t);
                        h(e, n);
                      });
                    })(u, c);
                  if (!t.readable) return c(new Error("Feed is closed"));
                  if (s) {
                    if (
                      -1 === r &&
                      (i ? (r = 1 / 0) : o && (r = t.length), n > r)
                    )
                      return c(null, null);
                    e.tail && (n = t.length), (s = !1);
                  }
                  if (n === r || (-1 === r && n === t.length))
                    return c(null, null);
                  a.start++, a.iterator && a.iterator.start++, t.get(n++, e, c);
                }
                function u() {
                  a && (t.undownload(a), (a = null));
                }
              }),
              (k.prototype.finalize = function(e) {
                this.key ||
                  ((this.key = w.tree(this._merkle.roots)),
                  (this.discoveryKey = w.discoveryKey(this.key))),
                  this._storage.key.write(0, this.key, e);
              }),
              (k.prototype.append = function(e, t) {
                t || (t = S);
                var n = this,
                  r = Array.isArray(e) ? e : [e];
                this._batch(r, function(e) {
                  if (e) return t(e);
                  var i = n._seq;
                  (n._seq += r.length), t(null, i);
                });
              }),
              (k.prototype.flush = function(e) {
                this.append([], e);
              }),
              (k.prototype.close = function(e) {
                var t = this;
                this._ready(function() {
                  t._forceCloseAndError(e, null);
                });
              }),
              (k.prototype._forceCloseAndError = function(e, t) {
                var n = this;
                (this.writable = !1),
                  (this.readable = !1),
                  this._storage.close(function(r) {
                    r || (r = t), n.closed || r || n._onclose(), e && e(r);
                  });
              }),
              (k.prototype._onclose = function() {
                for (
                  this.ifAvailable.destroy(), this.closed = !0;
                  this._waiting.length;

                )
                  this._waiting.pop().callback(new Error("Feed is closed"));
                for (; this._selections.length; )
                  this._selections.pop().callback(new Error("Feed is closed"));
                this.emit("close");
              }),
              (k.prototype._appendHook = function(e, t) {
                var n = this,
                  r = e.length,
                  i = null;
                if (!r) return this._append(e, t);
                for (var o = 0; o < e.length; o++)
                  this._onwrite(o + this.length, e[o], null, s);
                function s(o) {
                  if ((o && (i = o), !--r))
                    return i ? t(i) : void n._append(e, t);
                }
              }),
              (k.prototype._append = function(e, t) {
                if (!this.opened) return this._readyAndAppend(e, t);
                if (!this.writable)
                  return t(
                    new Error("This feed is not writable. Did you create it?")
                  );
                var n = this,
                  i = 1,
                  o = 0,
                  s = null,
                  a = new Array(e.length ? 2 * e.length - 1 : 0),
                  h = 2 * this.length,
                  u = new Array(e.length);
                if (!i) return t();
                for (var c = 0; c < e.length; c++) {
                  var f = this._codec.encode(e[c]),
                    l = this._merkle.next(f);
                  (o += f.length), (u[c] = f);
                  for (var d = 0; d < l.length; d++) {
                    var p = l[d];
                    p.index >= h && p.index - h < a.length
                      ? (a[p.index - h] = p)
                      : (i++, this._storage.putNode(p.index, p, g));
                  }
                }
                function g(r) {
                  if ((r && (s = r), !--i)) {
                    if (s) return t(s);
                    var a = n.length;
                    n.byteLength += o;
                    for (var h = 0; h < e.length; h++)
                      n.bitfield.set(n.length, !0), n.tree.set(2 * n.length++);
                    n.emit("append");
                    var u =
                      n.length - a > 1
                        ? { start: a, length: n.length - a }
                        : { start: a };
                    n.peers.length && n._announce(u), n._sync(null, t);
                  }
                }
                this.live &&
                  e.length &&
                  (i++,
                  this.crypto.sign(
                    w.tree(this._merkle.roots),
                    this.secretKey,
                    function(t, r) {
                      if (t) return g(t);
                      n._storage.putSignature(n.length + e.length - 1, r, g);
                    }
                  )),
                  this._indexing ||
                    (i++,
                    1 === u.length
                      ? this._storage.data.write(this.byteLength, u[0], g)
                      : this._storage.data.write(
                          this.byteLength,
                          r.concat(u),
                          g
                        )),
                  this._storage.putNodeBatch(h, a, g);
              }),
              (k.prototype._readyAndAppend = function(e, t) {
                var n = this;
                this._ready(function(r) {
                  if (r) return t(r);
                  n._append(e, t);
                });
              }),
              (k.prototype._readyAndCancel = function(e, t) {
                var n = this;
                this.ready(function() {
                  n._cancel(e, t);
                });
              }),
              (k.prototype._pollWaiting = function() {
                for (var e = this._waiting.length, t = 0; t < e; t++) {
                  var n = this._waiting[t];
                  (n.bytes || this.bitfield.get(n.index)) &&
                    (o(this._waiting, t--),
                    e--,
                    n.bytes
                      ? this.seek(n.bytes, n, n.callback)
                      : n.update
                      ? this.update(n.index + 1, n.callback)
                      : this.get(n.index, n.options, n.callback));
                }
              }),
              (k.prototype._syncBitfield = function(e) {
                var t = this.bitfield.pages.updates.length,
                  n = null,
                  r = null;
                if (!t) return this._pollWaiting(), e(null);
                for (; null !== (n = this.bitfield.pages.lastUpdate()); )
                  this._storage.putBitfield(n.offset, n.buffer, i);
                function i(n) {
                  n && (r = n), --t || e(r);
                }
                this._pollWaiting();
              }),
              (k.prototype._roots = function(e, t) {
                var n = h.fullRoots(2 * e),
                  r = new Array(n.length),
                  i = n.length,
                  o = null;
                if (!i) return t(null, r);
                for (var s = 0; s < n.length; s++)
                  this._storage.getNode(n[s], a);
                function a(e, s) {
                  if ((e && (o = e), s && (r[n.indexOf(s.index)] = s), !--i))
                    return o ? t(o) : void t(null, r);
                }
              }),
              (k.prototype.audit = function(e) {
                e || (e = S);
                var t = this,
                  n = { valid: 0, invalid: 0 };
                this.ready(function(r) {
                  if (r) return e(r);
                  var i = 0,
                    o = t.length;
                  function s(e, r) {
                    if (e) return o(null, null);
                    function o(e, o) {
                      var s = o && w.data(o).equals(r.hash);
                      s ? n.valid++ : n.invalid++,
                        t.bitfield.set(i, s),
                        i++,
                        a();
                    }
                    t._storage.getData(i, o);
                  }
                  function a() {
                    for (; i < o && !t.bitfield.get(i); ) i++;
                    i >= o
                      ? t._sync(null, function(t) {
                          if (t) return e(t);
                          e(null, n);
                        })
                      : t._storage.getNode(2 * i, s);
                  }
                  a();
                });
              }),
              (k.prototype.extension = function(e, t) {
                for (var n = this.peers, r = 0; r < n.length; r++)
                  n[r].extension(e, t);
              });
          }.call(this, e("_process"), e("buffer").Buffer));
        },
        {
          "./lib/bitfield": 51,
          "./lib/replicate": 52,
          "./lib/safe-buffer-equals": 53,
          "./lib/storage": 54,
          "./lib/tree-index": 55,
          _process: 175,
          "atomic-batcher": 12,
          buffer: 169,
          "bulk-write-stream": 25,
          codecs: 56,
          events: 170,
          "fd-lock": 168,
          "flat-tree": 39,
          from2: 40,
          "hypercore-crypto": 42,
          inherits: 64,
          "inspect-custom-symbol": 65,
          "last-one-wins": 68,
          "merkle-tree-stream/generator": 77,
          nanoguard: 81,
          "pretty-hash": 85,
          "random-access-file": 94,
          "sparse-bitfield": 142,
          thunky: 57,
          "unordered-array-remove": 152,
          "unordered-set": 58
        }
      ],
      51: [
        function(e, t, n) {
          (function(n) {
            for (
              var r = e("flat-tree"),
                i = e("bitfield-rle"),
                o = e("memory-pager"),
                s = e("sparse-bitfield"),
                a = [63, 207, 243, 252],
                h = [0, 192, 240, 252],
                u = [128, 192, 224, 240, 248, 252, 254, 255],
                c = [127, 191, 223, 239, 247, 251, 253, 254],
                f = new Array(256),
                l = new Array(256),
                d = new Array(256),
                p = new Array(256),
                g = new Array(256),
                y = 0;
              y < 256;
              y++
            ) {
              var A = (240 & y) >> 4,
                b = 15 & y,
                _ = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
              (f[y] =
                ((15 === A ? 3 : 0 === A ? 0 : 1) << 2) |
                (15 === b ? 3 : 0 === b ? 0 : 1)),
                (l[y] = f[y] << 4),
                (d[y] =
                  255 === y
                    ? -1
                    : 8 - Math.ceil(Math.log(256 - y) / Math.log(2))),
                (p[y] = 255 === y ? -1 : Math.floor(d[y] / 2)),
                (g[y] = _[y >> 4] + _[15 & y]);
            }
            function v(e, t) {
              if (!(this instanceof v)) return new v(e, t);
              e || (e = 3584);
              var i = n.allocUnsafe(e);
              if (
                (i.fill(255),
                (this.indexSize = e - 2048 - 1024),
                (this.pages = o(e, { deduplicate: i })),
                t)
              )
                for (var a = 0; a < t.length; a++) this.pages.set(a, t[a]);
              (this.data = s({
                pageSize: 1024,
                pageOffset: 0,
                pages: this.pages,
                trackUpdates: !0
              })),
                (this.tree = s({
                  pageSize: 2048,
                  pageOffset: 1024,
                  pages: this.pages,
                  trackUpdates: !0
                })),
                (this.index = s({
                  pageSize: this.indexSize,
                  pageOffset: 3072,
                  pages: this.pages,
                  trackUpdates: !0
                })),
                (this.length = this.data.length),
                (this._iterator = r.iterator(0));
            }
            function w(e, t, n) {
              return !(8 * t >= e.length) && e.setByte(t, n);
            }
            function m(e) {
              (this.start = 0),
                (this.end = 0),
                (this._indexEnd = 0),
                (this._pos = 0),
                (this._byte = 0),
                (this._bitfield = e);
            }
            function I(e) {
              return e.index + e.factor / 2 - 1;
            }
            function E(e) {
              return 1 & e.index;
            }
            (t.exports = v),
              (v.prototype.set = function(e, t) {
                var n = 7 & e;
                e = (e - n) / 8;
                var r = t
                  ? this.data.getByte(e) | (128 >> n)
                  : this.data.getByte(e) & c[n];
                return (
                  !!this.data.setByte(e, r) &&
                  ((this.length = this.data.length), this._setIndex(e, r), !0)
                );
              }),
              (v.prototype.get = function(e) {
                return this.data.get(e);
              }),
              (v.prototype.total = function(e, t) {
                if (
                  ((!e || e < 0) && (e = 0), t || (t = this.data.length), t < e)
                )
                  return 0;
                t > this.data.length && this._expand(t);
                var n = 7 & e,
                  r = 7 & t,
                  i = (e - n) / 8,
                  o = (t - r) / 8,
                  s = 255 - (n ? u[n - 1] : 0),
                  a = r ? u[r - 1] : 0,
                  h = this.data.getByte(i);
                if (i === o) return g[h & s & a];
                for (var c = g[h & s], f = i + 1; f < o; f++)
                  c += g[this.data.getByte(f)];
                return (c += g[this.data.getByte(o) & a]);
              }),
              (v.prototype.compress = function(e, t) {
                if (!e && !t) return i.encode(this.data.toBuffer());
                for (
                  var r = n.alloc(t),
                    o = e / this.data.pageSize / 8,
                    s = o + t / this.data.pageSize / 8,
                    a = o * this.data.pageSize;
                  o < s;
                  o++
                ) {
                  var h = this.data.pages.get(o, !0);
                  h &&
                    h.buffer &&
                    h.buffer.copy(
                      r,
                      o * this.data.pageSize - a,
                      this.data.pageOffset,
                      this.data.pageOffset + this.data.pageSize
                    );
                }
                return i.encode(r);
              }),
              (v.prototype._setIndex = function(e, t) {
                var n = 3 & e;
                e = (e - n) / 4;
                var r = this.index,
                  i = this._iterator,
                  o = 2 * e,
                  s =
                    (r.getByte(o) & a[n]) |
                    ((function(e) {
                      switch (e) {
                        case 255:
                          return 192;
                        case 0:
                          return 0;
                        default:
                          return 64;
                      }
                    })(t) >>
                      (2 * n)),
                  h = r.length,
                  u = this.pages.length * this.indexSize;
                for (i.seek(o); i.index < u && r.setByte(i.index, s); )
                  (s = i.isLeft()
                    ? l[s] | f[r.getByte(i.sibling())]
                    : f[s] | l[r.getByte(i.sibling())]),
                    i.parent();
                return h !== r.length && this._expand(h), i.index !== o;
              }),
              (v.prototype._expand = function(e) {
                for (
                  var t = r.fullRoots(2 * e),
                    n = this.index,
                    i = this._iterator,
                    o = 0,
                    s = 0;
                  s < t.length;
                  s++
                ) {
                  i.seek(t[s]), (o = n.getByte(i.index));
                  do {
                    o = i.isLeft()
                      ? l[o] | f[n.getByte(i.sibling())]
                      : f[o] | l[n.getByte(i.sibling())];
                  } while (w(n, i.parent(), o));
                }
              }),
              (v.prototype.iterator = function(e, t) {
                var n = new m(this);
                return n.range(e || 0, t || this.length), n.seek(0), n;
              }),
              (m.prototype.range = function(e, t) {
                return (
                  (this.start = e),
                  (this.end = t),
                  (this._indexEnd = 2 * Math.ceil(t / 32)),
                  this.end > this._bitfield.length &&
                    this._bitfield._expand(this.end),
                  this
                );
              }),
              (m.prototype.seek = function(e) {
                if (
                  ((e += this.start) < this.start && (e = this.start),
                  e >= this.end)
                )
                  return (this._pos = -1), this;
                var t = 7 & e;
                return (
                  (this._pos = (e - t) / 8),
                  (this._byte =
                    this._bitfield.data.getByte(this._pos) |
                    (t ? u[t - 1] : 0)),
                  this
                );
              }),
              (m.prototype.random = function() {
                var e = this.seek(
                  Math.floor(Math.random() * (this.end - this.start))
                ).next();
                return -1 === e ? this.seek(0).next() : e;
              }),
              (m.prototype.next = function() {
                if (-1 === this._pos) return -1;
                for (var e = this._bitfield.data, t = d[this._byte]; -1 === t; )
                  if (
                    ((this._byte = e.getByte(++this._pos)),
                    -1 === (t = d[this._byte]))
                  ) {
                    if (
                      ((this._pos = this._skipAhead(this._pos)),
                      -1 === this._pos)
                    )
                      return -1;
                    (this._byte = e.getByte(this._pos)), (t = d[this._byte]);
                  }
                this._byte |= u[t];
                var n = 8 * this._pos + t;
                return n < this.end ? n : -1;
              }),
              (m.prototype.peek = function() {
                if (-1 === this._pos) return -1;
                var e = d[this._byte],
                  t = 8 * this._pos + e;
                return t < this.end ? t : -1;
              }),
              (m.prototype._skipAhead = function(e) {
                var t = this._bitfield.index,
                  n = this._indexEnd,
                  r = this._bitfield._iterator,
                  i = 3 & e;
                r.seek(((e - i) / 4) * 2);
                for (var o = t.getByte(r.index) | h[i]; -1 === p[o]; ) {
                  if (
                    (r.isLeft() ? r.next() : (r.next(), r.parent()), I(r) >= n)
                  ) {
                    for (; I(r) >= n && E(r); ) r.leftChild();
                    if (I(r) >= n) return -1;
                  }
                  o = t.getByte(r.index);
                }
                for (; r.factor > 2; )
                  p[o] < 2 ? r.leftChild() : r.rightChild(),
                    (o = t.getByte(r.index));
                var s = p[o];
                -1 === s && (s = 4);
                var a = 2 * r.index + s;
                return a <= e ? e + 1 : a;
              });
          }.call(this, e("buffer").Buffer));
        },
        {
          "bitfield-rle": 13,
          buffer: 169,
          "flat-tree": 39,
          "memory-pager": 76,
          "sparse-bitfield": 142
        }
      ],
      52: [
        function(e, t, n) {
          var r = e("hypercore-protocol"),
            i = e("fast-bitfield"),
            o = e("unordered-set"),
            s = e("bitfield-rle").align(4),
            a = e("./safe-buffer-equals"),
            h = e("./tree-index"),
            u = new Uint8Array(1024);
          function c(e, t) {
            (this.feed = e),
              (this.stream = null),
              (this.remoteId = null),
              (this.wants = i()),
              (this.remoteBitfield = i()),
              (this.remoteLength = 0),
              (this.remoteWant = !1),
              (this.remoteTree = null),
              (this.remoteAck = !1),
              (this.live = !!t.live),
              (this.sparse = e.sparse),
              (this.ack = !!t.ack),
              (this.remoteDownloading = !0),
              (this.downloading =
                "boolean" == typeof t.download ? t.download : !e.writable),
              (this.uploading = !0),
              (this.updated = !1),
              (this.maxRequests = t.maxRequests || e.maxRequests || 16),
              (this.inflightRequests = []),
              (this.inflightWants = 0),
              (this._index = -1),
              (this._lastBytes = 0),
              (this._first = !0),
              (this._closed = !1),
              (this._destroyed = !1),
              (this._defaultDownloading = this.downloading),
              (this._iterator = this.remoteBitfield.iterator()),
              (this._stats = t.stats
                ? {
                    uploadedBytes: 0,
                    uploadedBlocks: 0,
                    downloadedBytes: 0,
                    downloadedBlocks: 0
                  }
                : null);
          }
          function f(e) {
            var t = e ? e.buffer : u;
            return new DataView(t.buffer, t.byteOffset, 1024);
          }
          (t.exports = function(e, t) {
            e.ifAvailable.wait();
            var n = t.stream;
            n ||
              (t.expectedFeeds || (t.expectedFeeds = 1),
              t.id || (t.id = e.id),
              (n = r(t)));
            e.opened ? i(null) : e.ready(i);
            return n;
            function i(r) {
              if ((e.ifAvailable.continue(), r)) return n.destroy(r);
              if (!n.destroyed) {
                var i = e.ifAvailable.waitAndContinue(),
                  o = new c(e, t);
                (o.feed = e),
                  (o.stream = n.feed(e.key, { peer: o })),
                  (o.remoteId = n.remoteId),
                  n.setMaxListeners(0),
                  n.on("handshake", function() {
                    a(o.remoteId, n.remoteId) ||
                      ((o.remoteId = n.remoteId),
                      h() || o.feed.emit("remote-update", o),
                      (o.remoteAck = n.remoteAck));
                  }),
                  n.on("close", i),
                  n.on("end", i),
                  n.on("error", i);
                var s = !0;
                h();
              }
              function h() {
                return (
                  !(!s || !o.remoteId) &&
                  ((s = !1), !n.destroyed && (i(), o.ready(), !0))
                );
              }
            }
          }),
            (c.prototype.onwant = function(e) {
              if (!(8191 & e.start || 8191 & e.length)) {
                !this.remoteWant &&
                  this.feed.length &&
                  this.feed.bitfield.get(this.feed.length - 1) &&
                  this.stream.have({ start: this.feed.length - 1 }),
                  (this.remoteWant = !0);
                var t = this.feed.bitfield.compress(e.start, e.length);
                this.stream.have({
                  start: e.start,
                  length: e.length,
                  bitfield: t
                });
              }
            }),
            (c.prototype.ondata = function(e) {
              var t = this;
              if (
                !(this.feed.allowPush || !e.value) &&
                !this.feed._reserved.get(e.index)
              )
                return (
                  t.feed.bitfield.get(e.index) || t.unhave({ start: e.index }),
                  void t._clear(e.index, !e.value)
                );
              this.feed._putBuffer(e.index, e.value, e, this, function(n) {
                if (n) return t.destroy(n);
                e.value && t.remoteBitfield.set(e.index, !1),
                  t.remoteAck &&
                    t.stream.have({ start: e.index, length: 1, ack: !0 }),
                  t._stats &&
                    e.value &&
                    ((t._stats.downloadedBlocks += 1),
                    (t._stats.downloadedBytes += e.value.length)),
                  t._clear(e.index, !e.value);
              });
            }),
            (c.prototype._clear = function(e, t) {
              for (var n = 0; n < this.inflightRequests.length; n++)
                this.inflightRequests[n].index === e &&
                  (this.inflightRequests.splice(n, 1), n--);
              this.feed._reserved.set(e, !1), this.feed._updatePeers();
            }),
            (c.prototype.onrequest = function(e) {
              if (e.bytes) return this._onbytes(e);
              this.remoteTree || (this.remoteTree = h());
              var t = this,
                n = { digest: e.nodes, hash: e.hash, tree: this.remoteTree };
              this.feed.proof(e.index, n, function(n, r) {
                if (n) return t.destroy(n);
                e.hash
                  ? i(null, null)
                  : t.feed.bitfield.get(e.index) &&
                    t.feed._getBuffer(e.index, i);
                function i(n, i) {
                  if (n) return t.destroy(n);
                  i &&
                    (t._stats &&
                      ((t._stats.uploadedBlocks += 1),
                      (t._stats.uploadedBytes += i.length),
                      (t.feed._stats.uploadedBlocks += 1),
                      (t.feed._stats.uploadedBytes += i.length)),
                    t.feed.emit("upload", e.index, i, t)),
                    e.index + 1 > t.remoteLength &&
                      ((t.remoteLength = e.index + 1), t._updateEnd()),
                    t.stream.data({
                      index: e.index,
                      value: i,
                      nodes: r.nodes,
                      signature: r.signature
                    });
                }
              });
            }),
            (c.prototype._onbytes = function(e) {
              var t = this;
              this.feed.seek(e.bytes, { wait: !1 }, function(n, r) {
                if (n) return (e.bytes = 0), void t.onrequest(e);
                t._lastBytes !== e.bytes &&
                  ((t._lastBytes = e.bytes),
                  (e.bytes = 0),
                  (e.index = r),
                  (e.nodes = 0),
                  t.onrequest(e));
              });
            }),
            (c.prototype.ontick = function() {
              if (this.inflightRequests.length) {
                var e = this.inflightRequests[0];
                if (!--e.tick)
                  return (e.hash
                  ? this.feed.tree.get(2 * e.index)
                  : this.feed.bitfield.get(e.index))
                    ? (this.inflightRequests.shift(),
                      void this.feed._reserved.set(e.index, !1))
                    : void this.destroy(new Error("Request timeout"));
              }
            }),
            (c.prototype.onhave = function(e) {
              if (
                this.ack &&
                e.ack &&
                !e.bitfield &&
                this.feed.bitfield.get(e.start)
              )
                this.stream.stream.emit("ack", e);
              else {
                var t = this._first;
                if (
                  (this._first && (this._first = !1),
                  1048576 === e.length &&
                    (this.feed.ifAvailable.continue(), this.inflightWants--),
                  e.bitfield)
                ) {
                  (0 !== e.length && 1 !== e.length) || (this.wants = null);
                  var n = s.decode(e.bitfield),
                    r = 8 * n.length;
                  !(function(e, t, n, r) {
                    for (
                      var i = new DataView(t.buffer, t.byteOffset),
                        o = Math.floor(t.length / 4),
                        s = new Uint32Array(t.buffer, t.byteOffset, o),
                        a = r / 8192,
                        h = 0,
                        u = f(e.pages.get(a++, !0)),
                        c = 0;
                      c < o;
                      c++
                    )
                      (s[c] =
                        i.getUint32(4 * c, !n) & ~u.getUint32(4 * h++, !n)),
                        256 === h && ((u = f(e.pages.get(a++, !0))), (h = 0));
                  })(
                    this.feed.bitfield,
                    n,
                    this.remoteBitfield.littleEndian,
                    e.start
                  ),
                    this.remoteBitfield.fill(n, e.start),
                    r > this.remoteLength &&
                      ((this.remoteLength = this.remoteBitfield.last() + 1),
                      (t = !0));
                } else {
                  for (var i = e.start, o = e.length || 1; o--; )
                    this.remoteBitfield.set(i, !this.feed.bitfield.get(i++));
                  i > this.remoteLength && ((this.remoteLength = i), (t = !0));
                }
                t &&
                  ((this.updated = !0), this.feed.emit("remote-update", this)),
                  this._updateEnd(),
                  this.update();
              }
            }),
            (c.prototype._updateEnd = function() {
              if (
                !this.live &&
                !this.feed.sparse &&
                this.feed._selections.length
              ) {
                for (
                  var e = this.feed._selections[0],
                    t = this.feed.length || -1,
                    n = 0;
                  n < this.feed.peers.length;
                  n++
                )
                  this.feed.peers[n].remoteLength > t &&
                    (t = this.feed.peers[n].remoteLength);
                e.end = t;
              }
            }),
            (c.prototype.onextension = function(e, t) {
              this.feed.emit("extension", e, t, this);
            }),
            (c.prototype.oninfo = function(e) {
              (this.remoteDownloading = e.downloading),
                e.downloading ||
                  this.live ||
                  (this.update(),
                  (this.feed._selections.length && this.downloading) ||
                    this.end());
            }),
            (c.prototype.onunhave = function(e) {
              var t = e.start,
                n = e.length || 1;
              if (0 === t && n >= this.remoteLength)
                return (
                  (this.remoteLength = 0), void (this.remoteBitfield = i())
                );
              for (; n--; ) this.remoteBitfield.set(t++, !1);
            }),
            (c.prototype.onunwant = c.prototype.oncancel = function() {}),
            (c.prototype.onclose = function() {
              this.destroy();
            }),
            (c.prototype.have = function(e) {
              this.stream && this.remoteWant && this.stream.have(e);
              for (var t = e.start, n = e.length; n--; )
                this.remoteBitfield.set(t++, !1);
            }),
            (c.prototype.unhave = function(e) {
              this.stream && this.remoteWant && this.stream.unhave(e);
            }),
            (c.prototype.haveBytes = function(e) {
              for (var t = 0; t < this.inflightRequests.length; t++)
                this.inflightRequests[t].bytes === e &&
                  (this.feed._reserved.set(this.inflightRequests[t].index, !1),
                  this.inflightRequests.splice(t, 1),
                  t--);
              this.update();
            }),
            (c.prototype.update = function() {
              for (; this._update(); );
              this._sendWantsMaybe();
            }),
            (c.prototype._update = function() {
              if (!this.downloading) return !1;
              for (
                var e = this.feed._selections,
                  t = this.feed._waiting,
                  n = t.length,
                  r = e.length,
                  i = this.inflightRequests.length,
                  o = 0,
                  s = 0;
                i < this.maxRequests;

              ) {
                for (
                  o = Math.floor(Math.random() * t.length), s = 0;
                  s < t.length;
                  s++
                ) {
                  var a = t[o++];
                  if (
                    (o === t.length && (o = 0),
                    this._downloadWaiting(a),
                    t.length !== n)
                  )
                    return !0;
                  if (this.inflightRequests.length >= this.maxRequests)
                    return !1;
                }
                if (i === this.inflightRequests.length) break;
                i = this.inflightRequests.length;
              }
              for (; i < this.maxRequests; ) {
                for (
                  o = Math.floor(Math.random() * e.length), s = 0;
                  s < e.length;
                  s++
                ) {
                  var h = e[o++];
                  if (
                    (o === e.length && (o = 0),
                    h.iterator ||
                      (h.iterator = this.feed.bitfield.iterator(
                        h.start,
                        h.end
                      )),
                    this._downloadRange(h),
                    e.length !== r)
                  )
                    return !0;
                  if (this.inflightRequests.length >= this.maxRequests)
                    return !1;
                }
                if (i === this.inflightRequests.length) return !1;
                i = this.inflightRequests.length;
              }
              return !1;
            }),
            (c.prototype.ready = function() {
              o.add(this.feed.peers, this),
                this._sendWants(),
                this.feed.emit("peer-add", this);
            }),
            (c.prototype.end = function() {
              if (!this.downloading && !this.remoteDownloading && !this.live)
                return (
                  this._defaultDownloading ||
                    this.stream.info({ downloading: !1, uploading: !1 }),
                  void this._close()
                );
              this._closed
                ? this.live || this._close()
                : ((this._closed = !0),
                  (this.downloading = !1),
                  this.stream.info({ downloading: !1, uploading: !0 }));
            }),
            (c.prototype._close = function() {
              if (-1 !== this._index) {
                this._destroyed ||
                  (this.stream.close(), (this._destroyed = !0)),
                  o.remove(this.feed.peers, this),
                  (this._index = -1);
                for (var e = 0; e < this.inflightRequests.length; e++)
                  this.feed._reserved.set(this.inflightRequests[e].index, !1);
                for (
                  this._updateEnd(),
                    this.remoteWant = !1,
                    this.feed._updatePeers(),
                    this.feed.emit("peer-remove", this),
                    e = 0;
                  e < this.inflightWants;
                  e++
                )
                  this.feed.ifAvailable.continue();
              }
            }),
            (c.prototype.destroy = function(e) {
              -1 === this._index ||
                this._destroyed ||
                (this.stream.destroy(e), (this._destroyed = !0), this._close());
            }),
            (c.prototype._sendWantsMaybe = function() {
              this.inflightRequests.length < this.maxRequests &&
                this._sendWants();
            }),
            (c.prototype._sendWants = function() {
              if (
                this.wants &&
                this.downloading &&
                !(this.inflightWants >= 16)
              ) {
                var e;
                for (e = 0; e < this.feed._waiting.length; e++) {
                  var t = this.feed._waiting[e];
                  if (
                    (-1 === t.index
                      ? this._sendWantRange(t)
                      : this._sendWant(t.index),
                    this.inflightWants >= 16)
                  )
                    return;
                }
                for (e = 0; e < this.feed._selections.length; e++) {
                  var n = this.feed._selections[e];
                  if ((this._sendWantRange(n), this.inflightWants >= 16))
                    return;
                }
                this._sendWant(0);
              }
            }),
            (c.prototype._sendWantRange = function(e) {
              for (var t = 0; ; ) {
                if (t >= this.remoteLength) return;
                if (-1 !== e.end && t >= e.end) return;
                if (this._sendWant(t)) return;
                if (!this.wants.get(Math.floor(t / 1024 / 1024))) return;
                t += 1048576;
              }
            }),
            (c.prototype._sendWant = function(e) {
              var t = Math.floor(e / 1048576);
              return (
                !this.wants.get(t) &&
                (this.wants.set(t, !0),
                this.inflightWants++,
                this.feed.ifAvailable.wait(),
                this.stream.want({ start: 1048576 * t, length: 1048576 }),
                !0)
              );
            }),
            (c.prototype._downloadWaiting = function(e) {
              if (e.bytes) this._downloadRange(e);
              else {
                if (
                  !this.remoteBitfield.get(e.index) ||
                  !this.feed._reserved.set(e.index, !0)
                )
                  return;
                this._request(e.index, 0, !1);
              }
            }),
            (c.prototype._downloadRange = function(e) {
              e.iterator ||
                (e.iterator = this.feed.bitfield.iterator(e.start, e.end));
              var t = this.feed._reserved,
                n = this._iterator,
                r = Math.min(
                  -1 === e.end ? this.remoteLength : e.end,
                  this.remoteLength
                ),
                i = e.linear
                  ? n.seek(e.start).next(!0)
                  : (function(e, t, n) {
                      var r = n - t,
                        i = e.seek(Math.floor(Math.random() * r) + t).next(!0);
                      return -1 === i || i >= n ? e.seek(t).next(!0) : i;
                    })(n, e.start, r),
                s = i;
              if (-1 === i || i >= r)
                !e.bytes &&
                  e.end > -1 &&
                  this.feed.length >= e.end &&
                  -1 === e.iterator.seek(0).next() &&
                  (o.remove(this.feed._selections, e),
                  e.callback(null),
                  this.live ||
                    this.sparse ||
                    this.feed._selections.length ||
                    this.end());
              else {
                for (; (e.hash && this.feed.tree.get(2 * i)) || !t.set(i, !0); )
                  if (
                    !((i = n.next(!0)) > -1 && i < r) &&
                    (e.linear ||
                      0 === s ||
                      ((s = 0),
                      !((i = n.seek(e.start).next(!0)) > -1 && i < r)))
                  ) {
                    if (e.hash) {
                      for (var a = e.start; a < r; a++)
                        if (!this.feed.tree.get(2 * a)) return;
                      e.bytes ||
                        (o.remove(this.feed._selections, e), e.callback(null));
                    }
                    return;
                  }
                this._request(i, e.bytes || 0, e.hash);
              }
            }),
            (c.prototype._request = function(e, t, n) {
              var r = {
                tick: 6,
                bytes: t,
                index: e,
                hash: n,
                nodes: this.feed.digest(e)
              };
              this.inflightRequests.push(r), this.stream.request(r);
            }),
            (c.prototype.extension = function(e, t) {
              this.stream.extension(e, t);
            });
        },
        {
          "./safe-buffer-equals": 53,
          "./tree-index": 55,
          "bitfield-rle": 13,
          "fast-bitfield": 38,
          "hypercore-protocol": 44,
          "unordered-set": 58
        }
      ],
      53: [
        function(e, t, n) {
          (function(e) {
            t.exports = function(t, n) {
              return t ? (n ? 0 === e.compare(t, n) : !t) : !n;
            };
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169 }
      ],
      54: [
        function(e, t, n) {
          (function(n) {
            var r = e("uint64be"),
              i = e("flat-tree"),
              o = e("array-lru");
            t.exports = a;
            var s = [];
            function a(e, t) {
              if (!(this instanceof a)) return new a(e, t);
              (t = void 0 === t ? 65536 : t),
                (this.cache = t > 0 ? o(t, { indexedValues: !0 }) : null),
                (this.key = null),
                (this.secretKey = null),
                (this.tree = null),
                (this.data = null),
                (this.bitfield = null),
                (this.signatures = null),
                (this.create = e);
            }
            function h() {}
            function u(e, t, r) {
              var i = n.alloc(32);
              return (
                (i[0] = 5),
                (i[1] = 2),
                (i[2] = 87),
                (i[3] = e),
                (i[4] = 0),
                i.writeUInt16BE(t, 5),
                r && ((i[7] = r.length), i.write(r, 8)),
                i
              );
            }
            function c(e, t, n) {
              (this.index = e), (this.hash = t), (this.size = n);
            }
            function f(e, t) {
              for (var n = 0; n < e.length; n++)
                if (e[n].index === t) return e[n];
              return null;
            }
            function l(e) {
              for (var t = 0; t < e.length; t++) if (e[t]) return !1;
              return !0;
            }
            function d(e, t) {
              e.close ? e.close(t) : t();
            }
            (a.prototype.putData = function(e, t, n, r) {
              r || (r = h);
              var i = this;
              if (!t.length) return r(null);
              this.dataOffset(e, n, function(e, n, o) {
                return e
                  ? r(e)
                  : o !== t.length
                  ? r(new Error("Unexpected data size"))
                  : void i.data.write(n, t, r);
              });
            }),
              (a.prototype.getData = function(e, t) {
                var n = this;
                this.dataOffset(e, s, function(e, r, i) {
                  if (e) return t(e);
                  n.data.read(r, i, t);
                });
              }),
              (a.prototype.nextSignature = function(e, t) {
                var n = this;
                this._getSignature(e, function(r, i) {
                  return r
                    ? t(r)
                    : l(i)
                    ? n.nextSignature(e + 1, t)
                    : void t(null, { index: e, signature: i });
                });
              }),
              (a.prototype.getSignature = function(e, t) {
                this._getSignature(e, function(e, n) {
                  return e
                    ? t(e)
                    : l(n)
                    ? t(new Error("No signature found"))
                    : void t(null, n);
                });
              }),
              (a.prototype._getSignature = function(e, t) {
                this.signatures.read(32 + 64 * e, 64, t);
              }),
              (a.prototype.putSignature = function(e, t, n) {
                this.signatures.write(32 + 64 * e, t, n);
              }),
              (a.prototype.dataOffset = function(e, t, n) {
                var r = i.fullRoots(2 * e),
                  o = this,
                  s = 0,
                  a = r.length,
                  h = null,
                  u = 2 * e;
                if (!a) return (a = 1), void p(null, null);
                for (var c = 0; c < r.length; c++) {
                  var l = f(t, r[c]);
                  l ? p(null, l) : this.getNode(r[c], p);
                }
                function d(e, t) {
                  if (e) return n(e);
                  n(null, s, t.size);
                }
                function p(e, r) {
                  if ((e && (h = e), r && (s += r.size), !--a)) {
                    if (h) return n(h);
                    var i = f(t, u);
                    i ? d(null, i) : o.getNode(u, d);
                  }
                }
              }),
              (a.prototype.getDataBatch = function(e, t, n) {
                var i = new Array(t),
                  o = new Array(t),
                  a = this;
                this.dataOffset(e, s, function(s, h, u) {
                  if (s) return n(s);
                  if ((e++, --t <= 0)) return c(null, null);
                  function c(e, t) {
                    if (e) return n(e);
                    var i = (o[0] = u);
                    if (t)
                      for (var s = 1; s < o.length; s++)
                        (o[s] = r.decode(t, 32 + 80 * (s - 1))), (i += o[s]);
                    a.data.read(h, i, f);
                  }
                  function f(e, t) {
                    if (e) return n(e);
                    for (var r = 0, s = 0; s < i.length; s++)
                      i[s] = t.slice(r, (r += o[s]));
                    n(null, i);
                  }
                  a.tree.read(32 + 80 * e, 80 * t - 40, c);
                });
              }),
              (a.prototype.getNode = function(e, t) {
                if (this.cache) {
                  var n = this.cache.get(e);
                  if (n) return t(null, n);
                }
                var i = this;
                this.tree.read(32 + 40 * e, 40, function(n, o) {
                  if (n) return t(n);
                  var s = o.slice(0, 32),
                    a = r.decode(o, 32);
                  if (!a && l(s)) return t(new Error("No node found"));
                  var h = new c(e, s, a, null);
                  i.cache && i.cache.set(e, h), t(null, h);
                });
              }),
              (a.prototype.putNodeBatch = function(e, t, i) {
                i || (i = h);
                for (var o = n.alloc(40 * t.length), s = 0; s < t.length; s++) {
                  var a = 40 * s,
                    u = t[s];
                  u && (u.hash.copy(o, a), r.encode(u.size, o, 32 + a));
                }
                this.tree.write(32 + 40 * e, o, i);
              }),
              (a.prototype.putNode = function(e, t, i) {
                i || (i = h);
                var o = n.allocUnsafe(40);
                t.hash.copy(o, 0),
                  r.encode(t.size, o, 32),
                  this.tree.write(32 + 40 * e, o, i);
              }),
              (a.prototype.putBitfield = function(e, t, n) {
                this.bitfield.write(32 + e, t, n);
              }),
              (a.prototype.close = function(e) {
                e || (e = h);
                var t = 6,
                  n = null;
                function r(r) {
                  r && (n = r), --t || e(n);
                }
                d(this.bitfield, r),
                  d(this.tree, r),
                  d(this.data, r),
                  d(this.key, r),
                  d(this.secretKey, r),
                  d(this.signatures, r);
              }),
              (a.prototype.openKey = function(e, t) {
                if ("function" == typeof e) return this.openKey({}, e);
                this.key || (this.key = this.create("key", e)),
                  this.key.read(0, 32, t);
              }),
              (a.prototype.open = function(e, t) {
                if ("function" == typeof e) return this.open({}, e);
                var n = this,
                  r = null,
                  i = 5;
                this.key || (this.key = this.create("key", e)),
                  this.secretKey ||
                    (this.secretKey = this.create("secret_key", e)),
                  this.tree || (this.tree = this.create("tree", e)),
                  this.data || (this.data = this.create("data", e)),
                  this.bitfield || (this.bitfield = this.create("bitfield", e)),
                  this.signatures ||
                    (this.signatures = this.create("signatures", e));
                var o = {
                  bitfield: [],
                  bitfieldPageSize: 3584,
                  secretKey: null,
                  key: null
                };
                function s(e) {
                  e && (r = e), --i || (r ? t(r) : t(null, o));
                }
                this.bitfield.read(0, 32, function(e, r) {
                  r && (o.bitfieldPageSize = r.readUInt16BE(5)),
                    n.bitfield.write(
                      0,
                      u(0, o.bitfieldPageSize, null),
                      function(e) {
                        if (e) return t(e);
                        !(function(e, t, n, r) {
                          if (!0 === e.statable)
                            return (function(e, t, n, r) {
                              e.stat(function(i, o) {
                                if (i) return r(null, []);
                                var s = [];
                                !(function i(a, h) {
                                  if (a) return r(a);
                                  if (h) {
                                    t += h.length;
                                    for (var u = 0; u < h.length; u += n)
                                      s.push(h.slice(u, u + n));
                                  }
                                  var c = Math.min(o.size - t, 32 * n);
                                  if (!c) return r(null, s);
                                  e.read(t, c, i);
                                })(null, null);
                              });
                            })(e, t, n, r);
                          var i = [];
                          e.read(t, n, function o(s, a) {
                            if (s) return r(null, i);
                            i.push(a);
                            e.read(t + i.length * n, n, o);
                          });
                        })(n.bitfield, 32, o.bitfieldPageSize, function(e, t) {
                          t && (o.bitfield = t), s(e);
                        });
                      }
                    );
                }),
                  this.signatures.write(0, u(1, 64, "Ed25519"), s),
                  this.tree.write(0, u(2, 40, "BLAKE2b"), s),
                  this.secretKey.read(0, 64, function(e, t) {
                    t && (o.secretKey = t), s(null);
                  }),
                  this.key.read(0, 32, function(e, t) {
                    t && (o.key = t), s(null);
                  });
              }),
              (a.Node = c);
          }.call(this, e("buffer").Buffer));
        },
        { "array-lru": 11, buffer: 169, "flat-tree": 39, uint64be: 150 }
      ],
      55: [
        function(e, t, n) {
          var r = e("flat-tree"),
            i = e("sparse-bitfield");
          function o(e) {
            if (!(this instanceof o)) return new o(e);
            this.bitfield = e || i();
          }
          function s(e) {
            return (e - (1 & e)) / 2;
          }
          function a(e, t, n, i) {
            for (var o = r.fullRoots(e), s = 0; s < o.length; s++)
              o[s] === n || i.get(o[s]) || t.push(o[s]);
          }
          (t.exports = o),
            (o.prototype.proof = function(e, t) {
              t || (t = {});
              var n = [],
                i = t.tree || new o(),
                h = t.digest || 0;
              if (!this.get(e)) return null;
              if ((t.hash && n.push(e), 1 === h))
                return { nodes: n, verifiedBy: 0 };
              var u = null,
                c = e,
                f = e,
                l = 1 & h;
              for (h = s(h); h; ) {
                if (1 === h && l) {
                  this.get(f) && i.set(f),
                    r.sibling(f) < f && (f = r.sibling(f)),
                    (u = r.fullRoots(r.rightSpan(f) + 2));
                  for (var d = 0; d < u.length; d++)
                    this.get(u[d]) && i.set(u[d]);
                  break;
                }
                (c = r.sibling(f)),
                  1 & h && this.get(c) && i.set(c),
                  (f = r.parent(f)),
                  (h = s(h));
              }
              for (f = e; !i.get(f); ) {
                if (((c = r.sibling(f)), !this.get(c))) {
                  var p = this.verifiedBy(f);
                  return a(p, n, f, i), { nodes: n, verifiedBy: p };
                }
                i.get(c) || n.push(c), (f = r.parent(f));
              }
              return { nodes: n, verifiedBy: 0 };
            }),
            (o.prototype.digest = function(e) {
              if (this.get(e)) return 1;
              for (
                var t = 0,
                  n = r.sibling(e),
                  i = Math.max(n + 2, this.bitfield.length),
                  o = 2,
                  s = r.depth(e),
                  a = r.parent(n, s++);
                r.rightSpan(n) < i || r.leftSpan(a) > 0;

              ) {
                if ((this.get(n) && (t += o), this.get(a)))
                  return 1 & (t += 2 * o) || (t += 1), t + 1 === 4 * o ? 1 : t;
                (n = r.sibling(a)), (a = r.parent(n, s++)), (o *= 2);
              }
              return t;
            }),
            (o.prototype.blocks = function() {
              for (
                var e = 0, t = 0, n = this.bitfield.length;
                r.rightSpan(t) < n;

              )
                (t = r.parent(t)), this.get(t) && (e = t);
              return (this.get(e) ? this.verifiedBy(e) : 0) / 2;
            }),
            (o.prototype.roots = function() {
              return r.fullRoots(2 * this.blocks());
            }),
            (o.prototype.verifiedBy = function(e, t) {
              if (!this.get(e)) return 0;
              for (
                var n = r.depth(e), i = e, o = r.parent(i, n++);
                this.get(o) && this.get(r.sibling(i));

              )
                (i = o), (o = r.parent(i, n++));
              for (n--; n; ) {
                for (
                  i = r.leftChild(r.index(n, r.offset(i, n) + 1), n), n--;
                  !this.get(i) && n;

                )
                  i = r.leftChild(i, n--);
                t && this.get(i) && t.push(i);
              }
              return this.get(i) ? i + 2 : i;
            }),
            (o.prototype.get = function(e) {
              return this.bitfield.get(e);
            }),
            (o.prototype.set = function(e) {
              if (!this.bitfield.set(e, !0)) return !1;
              for (
                ;
                this.bitfield.get(r.sibling(e)) &&
                ((e = r.parent(e)), this.bitfield.set(e, !0));

              );
              return !0;
            });
        },
        { "flat-tree": 39, "sparse-bitfield": 142 }
      ],
      56: [
        function(e, t, n) {
          (function(e) {
            function n(e) {
              if ("object" == typeof e && e && e.encode && e.decode) return e;
              switch (e) {
                case "ndjson":
                  return n.ndjson;
                case "json":
                  return n.json;
                case "ascii":
                  return n.ascii;
                case "utf-8":
                case "utf8":
                  return n.utf8;
                case "hex":
                  return n.hex;
                case "base64":
                  return n.base64;
                case "ucs-2":
                case "ucs2":
                  return n.ucs2;
                case "utf16-le":
                case "utf16le":
                  return n.utf16le;
              }
              return n.binary;
            }
            function r(t) {
              return {
                encode: t
                  ? function(t) {
                      return e.from(JSON.stringify(t) + "\n");
                    }
                  : function(t) {
                      return e.from(JSON.stringify(t));
                    },
                decode: function(e) {
                  return JSON.parse(e.toString());
                }
              };
            }
            function i(t) {
              return {
                encode: function(n) {
                  return (
                    "string" != typeof n && (n = n.toString()), e.from(n, t)
                  );
                },
                decode: function(e) {
                  return e.toString(t);
                }
              };
            }
            (t.exports = n),
              (n.ascii = i("ascii")),
              (n.utf8 = i("utf-8")),
              (n.hex = i("hex")),
              (n.base64 = i("base64")),
              (n.ucs2 = i("ucs2")),
              (n.utf16le = i("utf16le")),
              (n.ndjson = r(!0)),
              (n.json = r(!1)),
              (n.binary = {
                encode: function(t) {
                  return "string" == typeof t ? e.from(t, "utf-8") : t;
                },
                decode: function(e) {
                  return e;
                }
              });
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169 }
      ],
      57: [
        function(e, t, n) {
          (function(e) {
            "use strict";
            var n = function(t, n, r) {
              e.nextTick(function() {
                t(n, r);
              });
            };
            function r() {}
            function i(e, t) {
              e.apply(null, t);
            }
            e.nextTick(function(t) {
              42 === t && (n = e.nextTick);
            }, 42),
              (t.exports = function(e) {
                var t = function(r) {
                  var s = [r];
                  t = function(e) {
                    s.push(e);
                  };
                  e(function(e) {
                    var r = arguments;
                    t = (function(e) {
                      return (
                        "[object Error]" === Object.prototype.toString.call(e)
                      );
                    })(e)
                      ? o
                      : a;
                    for (; s.length; ) a(s.shift());
                    function a(e) {
                      n(i, e, r);
                    }
                  });
                };
                return function(e) {
                  t(e || r);
                };
                function o(r) {
                  var s = [r];
                  (t = function(e) {
                    s.push(e);
                  }),
                    e(function(e) {
                      var r = arguments;
                      t = (function(e) {
                        return (
                          "[object Error]" === Object.prototype.toString.call(e)
                        );
                      })(e)
                        ? o
                        : a;
                      for (; s.length; ) a(s.shift());
                      function a(e) {
                        n(i, e, r);
                      }
                    });
                }
              });
          }.call(this, e("_process")));
        },
        { _process: 175 }
      ],
      58: [
        function(e, t, n) {
          function r(e, t) {
            return t._index < e.length && e[t._index] === t;
          }
          (n.add = function(e, t) {
            return r(e, t) ? t : ((t._index = e.length), e.push(t), t);
          }),
            (n.has = r),
            (n.remove = function(e, t) {
              if (!r(e, t)) return null;
              var n = e.pop();
              n !== t && ((e[t._index] = n), (n._index = t._index));
              return t;
            }),
            (n.swap = function(e, t, n) {
              if (!r(e, t) || !r(e, n)) return;
              var i = t._index;
              (t._index = n._index),
                (e[t._index] = t),
                (n._index = i),
                (e[n._index] = n);
            });
        },
        {}
      ],
      59: [
        function(e, t, n) {
          (function(n, r) {
            var i = e("hypercore"),
              o = e("mutexify"),
              s = e("random-access-file"),
              a = e("thunky"),
              h = e("append-tree"),
              u = e("stream-collector"),
              c = e("sodium-universal"),
              f = e("inherits"),
              l = e("events"),
              d = e("duplexify"),
              p = e("from2"),
              g = e("stream-each"),
              y = e("uint64be"),
              A = e("unixify"),
              b = e("path").posix,
              _ = e("./lib/messages"),
              v = e("./lib/stat"),
              w = e("./lib/cursor"),
              m = 420;
            function I(e, t, n) {
              if (!(this instanceof I)) return new I(e, t, n);
              var u;
              l.EventEmitter.call(this),
                (u = t) &&
                  "string" != typeof u &&
                  !r.isBuffer(u) &&
                  ((n = t), (t = null)),
                n || (n = {}),
                (this.key = null),
                (this.discoveryKey = null),
                (this.live = !0),
                (this.latest = !!n.latest),
                (this._storages = (function(e, t, n) {
                  var r = "";
                  if ("object" == typeof t && t)
                    return (function(e, t) {
                      return {
                        metadata: function(n, r) {
                          return t.metadata(n, r, e);
                        },
                        content: function(n, r) {
                          return t.content(n, r, e);
                        }
                      };
                    })(e, t);
                  "string" == typeof t && ((r = t), (t = s));
                  return {
                    metadata: function(e) {
                      return t(b.join(r, "metadata", e));
                    },
                    content: function(e) {
                      return t(b.join(r, "content", e));
                    }
                  };
                })(this, e)),
                (this.metadata =
                  n.metadata ||
                  i(this._storages.metadata, t, {
                    secretKey: n.secretKey,
                    sparse: n.sparseMetadata,
                    createIfMissing: n.createIfMissing,
                    storageCacheSize: n.metadataStorageCacheSize,
                    extensions: n.extensions
                  })),
                (this.content = n.content || null),
                (this.maxRequests = n.maxRequests || 16),
                (this.readable = !0),
                (this.storage = e),
                (this.tree = h(this.metadata, {
                  offset: 1,
                  valueEncoding: _.Stat,
                  cache: 0 !== n.treeCacheSize,
                  cacheSize: n.treeCacheSize
                })),
                "number" == typeof n.version &&
                  (this.tree = this.tree.checkout(n.version)),
                (this.sparse = !!n.sparse),
                (this.sparseMetadata = !!n.sparseMetadata),
                (this.indexing = !!n.indexing),
                (this.contentStorageCacheSize = n.contentStorageCacheSize),
                (this._latestSynced = 0),
                (this._latestVersion = 0),
                (this._latestStorage = this.latest
                  ? this._storages.metadata("latest")
                  : null),
                (this._checkout = n._checkout),
                (this._lock = o()),
                (this._openFiles = []),
                (this._emittedContent = !1),
                (this._closed = !1);
              var c = this;
              function f(e) {
                e && c.emit("error", e);
              }
              this.metadata.on("append", function() {
                c.emit("update");
              }),
                this.metadata.on("extension", function(e, t, n) {
                  c.emit("extension", e, t, n);
                }),
                this.metadata.on("error", f),
                this.metadata.once("close", function() {
                  c.emit("close");
                }),
                (this.ready = a(function(e) {
                  c._open(e);
                })),
                this.ready(function(e) {
                  if (e) return f(e);
                  c.emit("ready"),
                    c._oncontent(),
                    c.latest &&
                      !c.metadata.writable &&
                      c._trackLatest(function(e) {
                        c._closed || f(e);
                      });
                });
            }
            function E(e, t) {
              return {
                sparse: e.sparse || e.latest,
                maxRequests: e.maxRequests,
                secretKey: t,
                storeSecretKey: !1,
                indexing: e.metadata.writable && e.indexing,
                storageCacheSize: e.contentStorageCacheSize
              };
            }
            function C() {}
            function B(e) {
              return "number" == typeof e ? e : e ? e.getTime() : Date.now();
            }
            function x(e) {
              return A(b.resolve("/", e));
            }
            function k(e) {
              for (var t = 0; t < e.length; t++)
                if (!S(e[t])) return e.filter(S);
              return e;
            }
            function S(e) {
              return ".." !== e && "." !== e;
            }
            function Q(e) {
              var t = new r(c.crypto_sign_SEEDBYTES),
                n = new r("hyperdri"),
                i = {
                  publicKey: new r(c.crypto_sign_PUBLICKEYBYTES),
                  secretKey: new r(c.crypto_sign_SECRETKEYBYTES)
                };
              return (
                c.crypto_kdf_derive_from_key(t, 1, n, e),
                c.crypto_sign_seed_keypair(i.publicKey, i.secretKey, t),
                t.fill && t.fill(0),
                i
              );
            }
            (t.exports = I),
              f(I, l.EventEmitter),
              Object.defineProperty(I.prototype, "version", {
                enumerable: !0,
                get: function() {
                  return this._checkout
                    ? this.tree.version
                    : this.metadata.length
                    ? this.metadata.length - 1
                    : 0;
                }
              }),
              Object.defineProperty(I.prototype, "writable", {
                enumerable: !0,
                get: function() {
                  return this.metadata.writable;
                }
              }),
              (I.prototype._oncontent = function() {
                this.content &&
                  !this._emittedContent &&
                  ((this._emittedContent = !0), this.emit("content"));
              }),
              (I.prototype._trackLatest = function(e) {
                var t = this;
                function n(o) {
                  return o
                    ? e(o)
                    : i()
                    ? (function() {
                        if (t.sparse)
                          return i() ? t.metadata.update(n) : n(null);
                        t.emit("syncing"),
                          t._fetchVersion(t._latestSynced, function(r, i) {
                            return r
                              ? e(r)
                              : i
                              ? ((t._latestSynced = t._latestVersion),
                                t.emit("sync"),
                                void (t._checkout || t.metadata.update(n)))
                              : void n(null);
                          });
                      })()
                    : void t._clearDangling(t._latestVersion, t.version, r);
                }
                function r(r, i) {
                  if (r) return e(r);
                  (t._latestVersion = i),
                    t._latestStorage.write(0, y.encode(t._latestVersion), n);
                }
                function i() {
                  var e = t.version;
                  return e < 0 || t._latestVersion === e;
                }
                this.ready(function(r) {
                  if (r) return e(r);
                  t._latestStorage.read(0, 8, function(e, r) {
                    (t._latestVersion = r ? y.decode(r) : 0), n();
                  });
                });
              }),
              (I.prototype._fetchVersion = function(e, t) {
                var r = this,
                  i = r.version,
                  o = !1,
                  s = !1,
                  a = null,
                  h = null,
                  u = 0,
                  c = 64,
                  f = null,
                  l = null;
                function d(e, t) {
                  if (o || a) return p(t, new Error("Out of date"));
                  if (u >= c) return (f = e), void (l = t);
                  var i = e.value.offset,
                    s = i + e.value.blocks;
                  if (i === s) return p(t, null);
                  u++,
                    r.content.download({ start: i, end: s }, function(n) {
                      return o && !l
                        ? y()
                        : (o || u--,
                          l
                            ? ((e = f),
                              (f = null),
                              (t = l),
                              (l = null),
                              d(e, t))
                            : (n && (h.destroy(n), (a = n)), void y()));
                    }),
                    n.nextTick(t);
                }
                function p(e, t) {
                  e(t), y();
                }
                function y() {
                  if (s && !u)
                    return (
                      (u = -1),
                      o ? t(null, !1) : a ? t(a) : void t(null, i === r.version)
                    );
                }
                function A(e) {
                  e && (a = e), (s = !0), y();
                }
                this.metadata.update(function() {
                  (o = !0), u > 0 && (u = 0), h && h.destroy(), y();
                }),
                  this._ensureContent(function(n) {
                    return n
                      ? t(n)
                      : o
                      ? t(null, !1)
                      : ((h = r.tree
                          .checkout(e)
                          .diff(i, { puts: !0, dels: !1 })),
                        void g(h, d, A));
                  });
              }),
              (I.prototype._clearDangling = function(e, t, n) {
                var r = this.tree.checkout(e, { cached: !0 }),
                  i = this.tree.checkout(t),
                  o = r.diff(i, { dels: !0, puts: !1 }),
                  s = this;
                function a(e) {
                  if (e) return n(e);
                  n(null, t);
                }
                function h(e, t) {
                  var n = e.value;
                  s.content.cancel(n.offset, n.offset + n.blocks),
                    s.content.clear(
                      n.offset,
                      n.offset + n.blocks,
                      { byteOffset: n.byteOffset, byteLength: n.size },
                      t
                    );
                }
                this._ensureContent(function(e) {
                  if (e) return n(e);
                  g(o, h, a);
                });
              }),
              (I.prototype.replicate = function(e) {
                e || (e = {}), (e.expectedFeeds = 2);
                var t = this,
                  n = this.metadata.replicate(e);
                return (
                  this._ensureContent(function(r) {
                    if (r) return n.destroy(r);
                    n.destroyed ||
                      t.content.replicate({
                        live: e.live,
                        download: e.download,
                        upload: e.upload,
                        stream: n
                      });
                  }),
                  n
                );
              }),
              (I.prototype.checkout = function(e, t) {
                return (
                  t || (t = {}),
                  (t._checkout = this._checkout || this),
                  (t.metadata = this.metadata),
                  (t.version = e),
                  I(null, null, t)
                );
              }),
              (I.prototype.createDiffStream = function(e, t) {
                return (
                  e || (e = 0),
                  "number" == typeof e && (e = this.checkout(e)),
                  this.tree.diff(e.tree, t)
                );
              }),
              (I.prototype.download = function(e, t) {
                if ("function" == typeof e) return this.download("/", e);
                var n = 1,
                  r = this;
                function i(e) {
                  r.stat(e, function(o, s) {
                    var a;
                    if (!o)
                      return s.isDirectory()
                        ? ((a = e),
                          void r.readdir(a, function(e, r) {
                            e
                              ? t && t(e)
                              : ((n -= 1),
                                (n += r.length),
                                r.forEach(function(e) {
                                  i(b.join(a, e));
                                }),
                                n <= 0 && t && t());
                          }))
                        : s.isFile()
                        ? (function(e, i) {
                            var o = i.offset,
                              s = i.offset + i.blocks;
                            if (0 === o && 0 === s) return;
                            r.content.download(
                              { start: o, end: s },
                              function() {
                                (n -= 1) <= 0 && t && t();
                              }
                            );
                          })(0, s)
                        : void 0;
                    t && t(o);
                  });
                }
                i(e || "/");
              }),
              (I.prototype.history = function(e) {
                return this.tree.history(e);
              }),
              (I.prototype.createCursor = function(e, t) {
                return w(this, e, t);
              }),
              (I.prototype.open = function(e, t, n, r, i) {
                if ("object" == typeof n && n) return this.open(e, t, 0, n, r);
                if ("function" == typeof n) return this.open(e, t, 0, n);
                if ("function" == typeof r) return this.open(e, t, n, null, r);
                var o = this.createCursor(e, r),
                  s = this;
                o.open(function(e) {
                  if (e) return i(e);
                  var t = s._openFiles.indexOf(null);
                  -1 === t && (t = s._openFiles.push(null) - 1),
                    (s._openFiles[t] = o),
                    i(null, t + 20);
                });
              }),
              (I.prototype.read = function(e, t, n, r, i, o) {
                var s = this._openFiles[e - 20];
                if (!s) return o(new Error("Bad file descriptor"));
                null !== i && s.seek(i),
                  s.next(function(e, a) {
                    return e
                      ? o(e)
                      : a
                      ? (a.length > r && ((a = a.slice(0, r)), s.seek(i + r)),
                        a.copy(t, n, 0, r),
                        void o(null, a.length, t))
                      : o(null, 0, t);
                  });
              }),
              (I.prototype.createReadStream = function(e, t) {
                t || (t = {}), (e = x(e));
                var n = this,
                  r = !1,
                  i = !0,
                  o = 0,
                  s = 0,
                  a = 0,
                  h =
                    "number" == typeof t.end
                      ? 1 + t.end - (t.start || 0)
                      : "number" == typeof t.length
                      ? t.length
                      : -1,
                  u = null,
                  c = !1,
                  f = p(g),
                  l = t && !!t.cached;
                return f.on("close", d), f.on("end", d), f;
                function d() {
                  u && n.content.undownload(u, C), (u = null), (c = !0);
                }
                function g(d, p) {
                  return i
                    ? (function(l, d) {
                        (i = !1),
                          n._ensureContent(function(i) {
                            if (i) return d(i);
                            n.tree.get(e, function(e, i) {
                              if (e) return d(e);
                              if (c || f.destroyed) return;
                              (o = i.offset), (s = i.offset + i.blocks);
                              var p = i.byteOffset,
                                y = 1;
                              t.start
                                ? n.content.seek(
                                    p + t.start,
                                    { start: o, end: s },
                                    b
                                  )
                                : b(null, o, 0);
                              function A(e, t) {
                                !e &&
                                  u &&
                                  (c ||
                                    f.destroyed ||
                                    (y++,
                                    n.content.undownload(u),
                                    (u = n.content.download(
                                      { start: o, end: t, linear: !0 },
                                      _
                                    ))));
                              }
                              function b(e, t, r) {
                                if (e) return d(e);
                                c ||
                                  f.destroyed ||
                                  ((a = r),
                                  (o = t),
                                  (u = n.content.download(
                                    { start: o, end: s, linear: !0 },
                                    _
                                  )),
                                  h > -1 &&
                                    h < i.size &&
                                    n.content.seek(
                                      p + h,
                                      { start: o, end: s },
                                      A
                                    ),
                                  g(l, d));
                              }
                              function _(e) {
                                --y || (!e || c || r ? (r = !0) : f.destroy(e));
                              }
                            });
                          });
                      })(d, p)
                    : o === s || 0 === h
                    ? p(null, null)
                    : void n.content.get(o++, { wait: !r && !l }, function(
                        e,
                        t
                      ) {
                        if (e) return p(e);
                        a && (t = t.slice(a)),
                          (a = 0),
                          h > -1 &&
                            (h < t.length && (t = t.slice(0, h)),
                            (h -= t.length)),
                          p(null, t);
                      });
                }
              }),
              (I.prototype.readFile = function(e, t, n) {
                if ("function" == typeof t) return this.readFile(e, null, t);
                "string" == typeof t && (t = { encoding: t }),
                  t || (t = {}),
                  (e = x(e)),
                  u(this.createReadStream(e, t), function(e, i) {
                    if (e) return n(e);
                    var o = 1 === i.length ? i[0] : r.concat(i);
                    n(
                      null,
                      t.encoding && "binary" !== t.encoding
                        ? o.toString(t.encoding)
                        : o
                    );
                  });
              }),
              (I.prototype.createWriteStream = function(e, t) {
                t || (t = {}), (e = x(e));
                var n = this,
                  r = d();
                return (
                  r.setReadable(!1),
                  this._ensureContent(function(i) {
                    return i
                      ? r.destroy(i)
                      : n._checkout
                      ? r.destroy(new Error("Cannot write to a checkout"))
                      : void (
                          r.destroyed ||
                          n._lock(function(i) {
                            if (!n.latest || r.destroyed) return o(null);
                            function o(o) {
                              if ((o && r.destroy(o), r.destroyed)) return i();
                              var a = n.content.byteLength,
                                h = n.content.length;
                              n.emit("appending", e, t);
                              var u = n.content.createWriteStream();
                              r.on("close", s),
                                r.on("finish", s),
                                r.setWritable(u),
                                r.on("prefinish", function() {
                                  var i = {
                                    mode: (t.mode || m) | v.IFREG,
                                    uid: t.uid || 0,
                                    gid: t.gid || 0,
                                    size: n.content.byteLength - a,
                                    blocks: n.content.length - h,
                                    offset: h,
                                    byteOffset: a,
                                    mtime: B(t.mtime),
                                    ctime: B(t.ctime)
                                  };
                                  r.cork(),
                                    n.tree.put(e, i, function(i) {
                                      if (i) return r.destroy(i);
                                      n.emit("append", e, t), r.uncork();
                                    });
                                });
                            }
                            function s() {
                              r.removeListener("close", s),
                                r.removeListener("finish", s),
                                i();
                            }
                            n.tree.get(e, function(e, t) {
                              return e && e.notFound
                                ? o(null)
                                : e
                                ? o(e)
                                : t.size
                                ? void n.content.clear(
                                    t.offset,
                                    t.offset + t.blocks,
                                    o
                                  )
                                : o(null);
                            });
                          })
                        );
                  }),
                  r
                );
              }),
              (I.prototype.writeFile = function(e, t, n, i) {
                if ("function" == typeof n)
                  return this.writeFile(e, t, null, n);
                "string" == typeof n && (n = { encoding: n }),
                  n || (n = {}),
                  "string" == typeof t && (t = new r(t, n.encoding || "utf-8")),
                  i || (i = C),
                  (e = x(e));
                var o = (function(e) {
                    for (var t = [], n = 0; n < e.length; n += 65536)
                      t.push(e.slice(n, n + 65536));
                    return t;
                  })(t),
                  s = this.createWriteStream(e, n);
                s.on("error", i), s.on("finish", i);
                for (var a = 0; a < o.length; a++) s.write(o[a]);
                s.end();
              }),
              (I.prototype.mkdir = function(e, t, n) {
                if ("function" == typeof t) return this.mkdir(e, null, t);
                "number" == typeof t && (t = { mode: t }),
                  t || (t = {}),
                  n || (n = C),
                  (e = x(e));
                var r = this;
                this.ready(function(i) {
                  return i
                    ? n(i)
                    : r._checkout
                    ? n(new Error("Cannot write to a checkout"))
                    : void r._lock(function(i) {
                        var o = {
                          mode: (t.mode || 493) | v.IFDIR,
                          uid: t.uid,
                          gid: t.gid,
                          mtime: B(t.mtime),
                          ctime: B(t.ctime),
                          offset: r.content.length,
                          byteOffset: r.content.byteLength
                        };
                        r.tree.put(e, o, function(e) {
                          i(n, e);
                        });
                      });
                });
              }),
              (I.prototype._statDirectory = function(e, t, n) {
                this.tree.list(e, t, function(t, r) {
                  if ("/" !== e && (t || !r.length))
                    return n(t || new Error(e + " could not be found"));
                  var i = v();
                  (i.mode = 493 | v.IFDIR), n(null, i);
                });
              }),
              (I.prototype.access = function(e, t, n) {
                if ("function" == typeof t) return this.access(e, null, t);
                t || (t = {}),
                  (e = x(e)),
                  this.stat(e, t, function(e) {
                    n(e);
                  });
              }),
              (I.prototype.exists = function(e, t, n) {
                if ("function" == typeof t) return this.exists(e, null, t);
                t || (t = {}),
                  this.access(e, t, function(e) {
                    n(!e);
                  });
              }),
              (I.prototype.lstat = function(e, t, n) {
                if ("function" == typeof t) return this.lstat(e, null, t);
                t || (t = {});
                var r = this;
                (e = x(e)),
                  this.tree.get(e, t, function(i, o) {
                    if (i) return r._statDirectory(e, t, n);
                    n(null, v(o));
                  });
              }),
              (I.prototype.stat = function(e, t, n) {
                if ("function" == typeof t) return this.stat(e, null, t);
                t || (t = {}), this.lstat(e, t, n);
              }),
              (I.prototype.readdir = function(e, t, n) {
                return "function" == typeof t
                  ? this.readdir(e, null, t)
                  : "/" === (e = x(e))
                  ? this._readdirRoot(t, n)
                  : void this.tree.list(e, t, function(e, t) {
                      if (e) return n(e);
                      n(null, k(t));
                    });
              }),
              (I.prototype._readdirRoot = function(e, t) {
                this.tree.list("/", e, function(e, n) {
                  if (n) return t(null, k(n));
                  t(null, []);
                });
              }),
              (I.prototype.unlink = function(e, t) {
                (e = x(e)), this._del(e, t || C);
              }),
              (I.prototype.rmdir = function(e, t) {
                t || (t = C), (e = x(e));
                var n = this;
                this.readdir(e, function(r, i) {
                  return r
                    ? t(r)
                    : i.length
                    ? t(new Error("Directory is not empty"))
                    : void n._del(e, t);
                });
              }),
              (I.prototype._del = function(e, t) {
                var n = this;
                this._ensureContent(function(r) {
                  if (r) return t(r);
                  n._lock(function(r) {
                    if (!n.latest) return i(null);
                    function i(t) {
                      if (t) return o(t);
                      n.tree.del(e, o);
                    }
                    function o(e) {
                      r(t, e);
                    }
                    n.tree.get(e, function(e, t) {
                      if (e) return o(e);
                      n.content.clear(t.offset, t.offset + t.blocks, i);
                    });
                  });
                });
              }),
              (I.prototype._closeFile = function(e, t) {
                var n = this._openFiles[e - 20];
                if (!n) return t(new Error("Bad file descriptor"));
                (this._openFiles[e - 20] = null), n.close(t);
              }),
              (I.prototype.close = function(e, t) {
                if ("number" == typeof e) return this._closeFile(e, t || C);
                (t = e) || (t = C);
                var n = this;
                this.ready(function(e) {
                  if (e) return t(e);
                  (n._closed = !0),
                    n.metadata.close(function(e) {
                      if (!n.content) return t(e);
                      n.content.close(t);
                    });
                });
              }),
              (I.prototype._ensureContent = function(e) {
                var t = this;
                this.ready(function(n) {
                  return n ? e(n) : t.content ? void e(null) : t._loadIndex(e);
                });
              }),
              (I.prototype._loadIndex = function(e) {
                var t = this;
                function n(n, r) {
                  if (n) return e(n);
                  if (t.content) return t.content.ready(e);
                  var o = t.metadata.writable && Q(t.metadata.secretKey),
                    s = E(t, o && o.secretKey);
                  (t.content = t._checkout
                    ? t._checkout.content
                    : i(t._storages.content, r.content, s)),
                    t.content.on("error", function(e) {
                      t.emit("error", e);
                    }),
                    t.content.ready(function(n) {
                      if (n) return e(n);
                      t._oncontent(), e();
                    });
                }
                this._checkout
                  ? this._checkout._loadIndex(n)
                  : this.metadata.get(0, { valueEncoding: _.Index }, n);
              }),
              (I.prototype._open = function(e) {
                var t = this;
                this.tree.ready(function(n) {
                  if (n) return e(n);
                  t.metadata.ready(function(n) {
                    return n
                      ? e(n)
                      : t.content
                      ? e(null)
                      : ((t.key = t.metadata.key),
                        (t.discoveryKey = t.metadata.discoveryKey),
                        void (!t.metadata.writable || t._checkout
                          ? (function() {
                              if (t.metadata.has(0)) return t._loadIndex(e);
                              t._loadIndex(C), e();
                            })()
                          : (function() {
                              if (t.metadata.has(0)) return t._loadIndex(e);
                              if (!t.content) {
                                var n = Q(t.metadata.secretKey),
                                  r = E(t, n.secretKey);
                                (t.content = i(
                                  t._storages.content,
                                  n.publicKey,
                                  r
                                )),
                                  t.content.on("error", function(e) {
                                    t.emit("error", e);
                                  });
                              }
                              t.content.ready(function() {
                                if (t.metadata.has(0))
                                  return e(new Error("Index already written"));
                                t.metadata.append(
                                  _.Index.encode({
                                    type: "hyperdrive",
                                    content: t.content.key
                                  }),
                                  e
                                );
                              });
                            })()));
                  });
                });
              }),
              (I.prototype.extension = function(e, t) {
                this.metadata.extension(e, t);
              });
          }.call(this, e("_process"), e("buffer").Buffer));
        },
        {
          "./lib/cursor": 60,
          "./lib/messages": 61,
          "./lib/stat": 62,
          _process: 175,
          "append-tree": 3,
          buffer: 169,
          duplexify: 36,
          events: 170,
          from2: 40,
          hypercore: 50,
          inherits: 64,
          mutexify: 79,
          path: 174,
          "random-access-file": 94,
          "sodium-universal": 140,
          "stream-collector": 143,
          "stream-each": 144,
          thunky: 63,
          uint64be: 150,
          unixify: 151
        }
      ],
      60: [
        function(e, t, n) {
          var r = e("thunky");
          function i(e, t, n) {
            if (!(this instanceof i)) return new i(e, t, n);
            var o = this;
            (this.name = t),
              (this.opened = !1),
              (this.position = 0),
              (this.index = 0),
              (this.offset = 0),
              (this.open = r(function(n) {
                e.stat(t, function(t, r) {
                  if (t) return n(t);
                  e._ensureContent(function(t) {
                    return t
                      ? n(t)
                      : r.isFile()
                      ? ((o._content = e.content),
                        (o._stat = r),
                        (o._start = r.offset),
                        (o._end = r.offset + r.blocks),
                        0 === o._seekTo &&
                          o._download &&
                          (o._range = o._content.download({
                            start: o._start,
                            end: o._end,
                            linear: !0
                          })),
                        void n(null))
                      : n(new Error("Not a file"));
                  });
                });
              })),
              (this._content = null),
              (this._stat = null),
              (this._seekTo = 0),
              (this._seeking = !0),
              (this._start = 0),
              (this._end = 0),
              (this._range = null),
              (this._download = !n || !1 !== n.download),
              this.open();
          }
          function o() {}
          (t.exports = i),
            (i.prototype.seek = function(e) {
              return e === this.position && -1 === this._seekTo
                ? this
                : ((this._seeking = !0), (this._seekTo = e), this);
            }),
            (i.prototype._seek = function(e, t) {
              var n = this;
              function r(n, r, i) {
                if (n) return t(n);
                t(null, e, r, i);
              }
              this.open(function(i) {
                if (i) return t(i);
                e < 0 && (e += n._stat.size),
                  e < 0 && (e = 0),
                  e > n._stat.size && (e = n._stat.size);
                var o = n._stat,
                  s = { start: n._start, end: n._end };
                return 0 === e
                  ? r(null, n._start, 0)
                  : e === n._stat.size
                  ? r(n._end, 0)
                  : void n._content.seek(o.byteOffset + e, s, r);
              });
            }),
            (i.prototype.next = function(e) {
              this._seeking
                ? this._seekAndNext(e)
                : this._next(this.position, this.index, this.offset, e);
            }),
            (i.prototype.close = function(e) {
              e || (e = o);
              var t = this;
              this.open(function(n) {
                if (n) return e(n);
                t._range && t._content.undownload(t._range), e();
              });
            }),
            (i.prototype._next = function(e, t, n, r) {
              if (t < this._start || t >= this._end) return r(null, null);
              var i = this;
              this._content.get(this.index, function(t, o) {
                if (t) return r(t);
                n && (o = o.slice(n)),
                  (i.position = e + o.length),
                  (i.offset = 0),
                  i.index++,
                  r(null, o);
              });
            }),
            (i.prototype._seekAndNext = function(e) {
              var t = this,
                n = this._seekTo;
              this._seek(n, function(r, i, o, s) {
                if (r) return e(r);
                n === t._seekTo &&
                  ((t._seeking = !1),
                  (t._seekTo = -1),
                  (t.position = i),
                  (t.index = o),
                  (t.offset = s),
                  t._download &&
                    (t._range && t._content.undownload(t._range),
                    (t._range = t._content.download({
                      start: t.index,
                      end: t._end,
                      linear: !0
                    })))),
                  t._next(i, o, s, e);
              });
            });
        },
        { thunky: 63 }
      ],
      61: [
        function(e, t, n) {
          (function(t) {
            var r = e("protocol-buffers-encodings"),
              i = r.varint,
              o = r.skip,
              s = (n.Index = {
                buffer: !0,
                encodingLength: null,
                encode: null,
                decode: null
              }),
              a = (n.Stat = {
                buffer: !0,
                encodingLength: null,
                encode: null,
                decode: null
              });
            function h(e) {
              return null != e && ("number" != typeof e || !isNaN(e));
            }
            !(function() {
              var e = [r.string, r.bytes];
              function n(t) {
                var n = 0;
                if (!h(t.type)) throw new Error("type is required");
                var r = e[0].encodingLength(t.type);
                if (((n += 1 + r), h(t.content))) {
                  var r = e[1].encodingLength(t.content);
                  n += 1 + r;
                }
                return n;
              }
              (s.encodingLength = n),
                (s.encode = function r(i, o, s) {
                  s || (s = 0);
                  o || (o = t.allocUnsafe(n(i)));
                  var a = s;
                  if (!h(i.type)) throw new Error("type is required");
                  o[s++] = 10;
                  e[0].encode(i.type, o, s);
                  s += e[0].encode.bytes;
                  h(i.content) &&
                    ((o[s++] = 18),
                    e[1].encode(i.content, o, s),
                    (s += e[1].encode.bytes));
                  r.bytes = s - a;
                  return o;
                }),
                (s.decode = function t(n, r, s) {
                  r || (r = 0);
                  s || (s = n.length);
                  if (!(s <= n.length && r <= n.length))
                    throw new Error("Decoded message is not valid");
                  var a = r;
                  var h = { type: "", content: null };
                  var u = !1;
                  for (;;) {
                    if (s <= r) {
                      if (!u) throw new Error("Decoded message is not valid");
                      return (t.bytes = r - a), h;
                    }
                    var c = i.decode(n, r);
                    r += i.decode.bytes;
                    var f = c >> 3;
                    switch (f) {
                      case 1:
                        (h.type = e[0].decode(n, r)),
                          (r += e[0].decode.bytes),
                          (u = !0);
                        break;
                      case 2:
                        (h.content = e[1].decode(n, r)),
                          (r += e[1].decode.bytes);
                        break;
                      default:
                        r = o(7 & c, n, r);
                    }
                  }
                });
            })(),
              (function() {
                var e = [r.varint];
                function n(t) {
                  var n = 0;
                  if (!h(t.mode)) throw new Error("mode is required");
                  var r = e[0].encodingLength(t.mode);
                  if (((n += 1 + r), h(t.uid))) {
                    var r = e[0].encodingLength(t.uid);
                    n += 1 + r;
                  }
                  if (h(t.gid)) {
                    var r = e[0].encodingLength(t.gid);
                    n += 1 + r;
                  }
                  if (h(t.size)) {
                    var r = e[0].encodingLength(t.size);
                    n += 1 + r;
                  }
                  if (h(t.blocks)) {
                    var r = e[0].encodingLength(t.blocks);
                    n += 1 + r;
                  }
                  if (h(t.offset)) {
                    var r = e[0].encodingLength(t.offset);
                    n += 1 + r;
                  }
                  if (h(t.byteOffset)) {
                    var r = e[0].encodingLength(t.byteOffset);
                    n += 1 + r;
                  }
                  if (h(t.mtime)) {
                    var r = e[0].encodingLength(t.mtime);
                    n += 1 + r;
                  }
                  if (h(t.ctime)) {
                    var r = e[0].encodingLength(t.ctime);
                    n += 1 + r;
                  }
                  return n;
                }
                (a.encodingLength = n),
                  (a.encode = function r(i, o, s) {
                    s || (s = 0);
                    o || (o = t.allocUnsafe(n(i)));
                    var a = s;
                    if (!h(i.mode)) throw new Error("mode is required");
                    o[s++] = 8;
                    e[0].encode(i.mode, o, s);
                    s += e[0].encode.bytes;
                    h(i.uid) &&
                      ((o[s++] = 16),
                      e[0].encode(i.uid, o, s),
                      (s += e[0].encode.bytes));
                    h(i.gid) &&
                      ((o[s++] = 24),
                      e[0].encode(i.gid, o, s),
                      (s += e[0].encode.bytes));
                    h(i.size) &&
                      ((o[s++] = 32),
                      e[0].encode(i.size, o, s),
                      (s += e[0].encode.bytes));
                    h(i.blocks) &&
                      ((o[s++] = 40),
                      e[0].encode(i.blocks, o, s),
                      (s += e[0].encode.bytes));
                    h(i.offset) &&
                      ((o[s++] = 48),
                      e[0].encode(i.offset, o, s),
                      (s += e[0].encode.bytes));
                    h(i.byteOffset) &&
                      ((o[s++] = 56),
                      e[0].encode(i.byteOffset, o, s),
                      (s += e[0].encode.bytes));
                    h(i.mtime) &&
                      ((o[s++] = 64),
                      e[0].encode(i.mtime, o, s),
                      (s += e[0].encode.bytes));
                    h(i.ctime) &&
                      ((o[s++] = 72),
                      e[0].encode(i.ctime, o, s),
                      (s += e[0].encode.bytes));
                    r.bytes = s - a;
                    return o;
                  }),
                  (a.decode = function t(n, r, s) {
                    r || (r = 0);
                    s || (s = n.length);
                    if (!(s <= n.length && r <= n.length))
                      throw new Error("Decoded message is not valid");
                    var a = r;
                    var h = {
                      mode: 0,
                      uid: 0,
                      gid: 0,
                      size: 0,
                      blocks: 0,
                      offset: 0,
                      byteOffset: 0,
                      mtime: 0,
                      ctime: 0
                    };
                    var u = !1;
                    for (;;) {
                      if (s <= r) {
                        if (!u) throw new Error("Decoded message is not valid");
                        return (t.bytes = r - a), h;
                      }
                      var c = i.decode(n, r);
                      r += i.decode.bytes;
                      var f = c >> 3;
                      switch (f) {
                        case 1:
                          (h.mode = e[0].decode(n, r)),
                            (r += e[0].decode.bytes),
                            (u = !0);
                          break;
                        case 2:
                          (h.uid = e[0].decode(n, r)), (r += e[0].decode.bytes);
                          break;
                        case 3:
                          (h.gid = e[0].decode(n, r)), (r += e[0].decode.bytes);
                          break;
                        case 4:
                          (h.size = e[0].decode(n, r)),
                            (r += e[0].decode.bytes);
                          break;
                        case 5:
                          (h.blocks = e[0].decode(n, r)),
                            (r += e[0].decode.bytes);
                          break;
                        case 6:
                          (h.offset = e[0].decode(n, r)),
                            (r += e[0].decode.bytes);
                          break;
                        case 7:
                          (h.byteOffset = e[0].decode(n, r)),
                            (r += e[0].decode.bytes);
                          break;
                        case 8:
                          (h.mtime = e[0].decode(n, r)),
                            (r += e[0].decode.bytes);
                          break;
                        case 9:
                          (h.ctime = e[0].decode(n, r)),
                            (r += e[0].decode.bytes);
                          break;
                        default:
                          r = o(7 & c, n, r);
                      }
                    }
                  });
              })();
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169, "protocol-buffers-encodings": 87 }
      ],
      62: [
        function(e, t, n) {
          function r(e) {
            if (!(this instanceof r)) return new r(e);
            (this.dev = 0),
              (this.nlink = 1),
              (this.rdev = 0),
              (this.blksize = 0),
              (this.ino = 0),
              (this.mode = e ? e.mode : 0),
              (this.uid = e ? e.uid : 0),
              (this.gid = e ? e.gid : 0),
              (this.size = e ? e.size : 0),
              (this.offset = e ? e.offset : 0),
              (this.byteOffset = e ? e.byteOffset : 0),
              (this.blocks = e ? e.blocks : 0),
              (this.atime = new Date(e ? e.mtime : 0)),
              (this.mtime = new Date(e ? e.mtime : 0)),
              (this.ctime = new Date(e ? e.ctime : 0)),
              (this.linkname = e ? e.linkname : null);
          }
          function i(e) {
            return function() {
              return (e & this.mode) === e;
            };
          }
          (t.exports = r),
            (r.IFSOCK = 49152),
            (r.IFLNK = 40960),
            (r.IFREG = 32768),
            (r.IFBLK = 24576),
            (r.IFDIR = 16384),
            (r.IFCHR = 8192),
            (r.IFIFO = 4096),
            (r.prototype.isSocket = i(r.IFSOCK)),
            (r.prototype.isSymbolicLink = i(r.IFLNK)),
            (r.prototype.isFile = i(r.IFREG)),
            (r.prototype.isBlockDevice = i(r.IFBLK)),
            (r.prototype.isDirectory = i(r.IFDIR)),
            (r.prototype.isCharacterDevice = i(r.IFCHR)),
            (r.prototype.isFIFO = i(r.IFIFO));
        },
        {}
      ],
      63: [
        function(e, t, n) {
          arguments[4][57][0].apply(n, arguments);
        },
        { _process: 175, dup: 57 }
      ],
      64: [
        function(e, t, n) {
          "function" == typeof Object.create
            ? (t.exports = function(e, t) {
                t &&
                  ((e.super_ = t),
                  (e.prototype = Object.create(t.prototype, {
                    constructor: {
                      value: e,
                      enumerable: !1,
                      writable: !0,
                      configurable: !0
                    }
                  })));
              })
            : (t.exports = function(e, t) {
                if (t) {
                  e.super_ = t;
                  var n = function() {};
                  (n.prototype = t.prototype),
                    (e.prototype = new n()),
                    (e.prototype.constructor = e);
                }
              });
        },
        {}
      ],
      65: [
        function(e, t, n) {
          t.exports = Symbol.for("nodejs.util.inspect.custom");
        },
        {}
      ],
      66: [
        function(e, t, n) {
          (function(e) {
            t.exports = function(t) {
              return "object" == typeof t && t && !e.isBuffer(t);
            };
          }.call(this, {
            isBuffer: e("../../../../../node_modules/is-buffer/index.js")
          }));
        },
        { "../../../../../node_modules/is-buffer/index.js": 172 }
      ],
      67: [
        function(e, t, n) {
          var r = {}.toString;
          t.exports =
            Array.isArray ||
            function(e) {
              return "[object Array]" == r.call(e);
            };
        },
        {}
      ],
      68: [
        function(e, t, n) {
          function r(e) {}
          t.exports = function(e) {
            var t = null,
              n = null,
              i = null,
              o = null;
            return function(e, t) {
              (o = e), s(t || r);
            };
            function s(r) {
              if (n) return t || (t = []), void t.push(r);
              var i = o;
              (o = null), (n = r), e(i, a);
            }
            function a(e) {
              var o = n,
                a = i;
              if (((i = null), (n = null), t && ((i = t), (t = null), s(r)), a))
                for (var h = 0; h < a.length; h++) a[h](e);
              o(e);
            }
          };
        },
        {}
      ],
      69: [
        function(e, t, n) {
          var r = e("varint"),
            i = e("readable-stream"),
            o = e("util"),
            s = e("buffer-alloc-unsafe"),
            a = function(e) {
              if (!(this instanceof a)) return new a(e);
              i.Transform.call(this),
                (this._destroyed = !1),
                (this._missing = 0),
                (this._message = null),
                (this._limit = (e && e.limit) || 0),
                (this._allowEmpty = !(!e || !e.allowEmpty)),
                (this._prefix = s(
                  this._limit ? r.encodingLength(this._limit) : 100
                )),
                (this._ptr = 0),
                this._allowEmpty &&
                  ((this._readableState.highWaterMark = 16),
                  (this._readableState.objectMode = !0));
            };
          o.inherits(a, i.Transform),
            (a.prototype._push = function(e) {
              (this._ptr = 0),
                (this._missing = 0),
                (this._message = null),
                this.push(e);
            }),
            (a.prototype._parseLength = function(e, t) {
              for (; t < e.length; t++) {
                if (this._ptr >= this._prefix.length)
                  return this._prefixError(e);
                if (((this._prefix[this._ptr++] = e[t]), !(128 & e[t])))
                  return (
                    (this._missing = r.decode(this._prefix)),
                    this._limit && this._missing > this._limit
                      ? this._prefixError(e)
                      : (!this._missing && this._allowEmpty && this._push(s(0)),
                        (this._ptr = 0),
                        t + 1)
                  );
              }
              return e.length;
            }),
            (a.prototype._prefixError = function(e) {
              return (
                this.destroy(new Error("Message is larger than max length")),
                e.length
              );
            }),
            (a.prototype._parseMessage = function(e, t) {
              var n = e.length - t,
                r = this._missing;
              if (!this._message) {
                if (r <= n) return this._push(e.slice(t, t + r)), t + r;
                this._message = s(r);
              }
              return (
                e.copy(this._message, this._ptr, t, t + r),
                r <= n
                  ? (this._push(this._message), t + r)
                  : ((this._missing -= n), (this._ptr += n), e.length)
              );
            }),
            (a.prototype._transform = function(e, t, n) {
              for (var r = 0; !this._destroyed && r < e.length; )
                r = this._missing
                  ? this._parseMessage(e, r)
                  : this._parseLength(e, r);
              n();
            }),
            (a.prototype.destroy = function(e) {
              this._destroyed ||
                ((this._destroyed = !0),
                e && this.emit("error", e),
                this.emit("close"));
            }),
            (t.exports = a);
        },
        {
          "buffer-alloc-unsafe": 21,
          "readable-stream": 117,
          util: 179,
          varint: 74
        }
      ],
      70: [
        function(e, t, n) {
          var r = e("varint"),
            i = e("readable-stream"),
            o = e("util"),
            s = e("buffer-alloc-unsafe"),
            a = s(10240),
            h = 0,
            u = function() {
              if (!(this instanceof u)) return new u();
              i.Transform.call(this), (this._destroyed = !1);
            };
          o.inherits(u, i.Transform),
            (u.prototype._transform = function(e, t, n) {
              if (this._destroyed) return n();
              r.encode(e.length, a, h),
                (h += r.encode.bytes),
                this.push(a.slice(h - r.encode.bytes, h)),
                this.push(e),
                a.length - h < 100 && ((a = s(10240)), (h = 0)),
                n();
            }),
            (u.prototype.destroy = function(e) {
              this._destroyed ||
                ((this._destroyed = !0),
                e && this.emit("error", e),
                this.emit("close"));
            }),
            (t.exports = u);
        },
        {
          "buffer-alloc-unsafe": 21,
          "readable-stream": 117,
          util: 179,
          varint: 74
        }
      ],
      71: [
        function(e, t, n) {
          (n.encode = e("./encode")), (n.decode = e("./decode"));
        },
        { "./decode": 69, "./encode": 70 }
      ],
      72: [
        function(e, t, n) {
          arguments[4][6][0].apply(n, arguments);
        },
        { dup: 6 }
      ],
      73: [
        function(e, t, n) {
          arguments[4][7][0].apply(n, arguments);
        },
        { dup: 7 }
      ],
      74: [
        function(e, t, n) {
          arguments[4][8][0].apply(n, arguments);
        },
        { "./decode.js": 72, "./encode.js": 73, "./length.js": 75, dup: 8 }
      ],
      75: [
        function(e, t, n) {
          arguments[4][9][0].apply(n, arguments);
        },
        { dup: 9 }
      ],
      76: [
        function(e, t, n) {
          (function(e) {
            function n(e, t) {
              if (!(this instanceof n)) return new n(e, t);
              (this.length = 0),
                (this.updates = []),
                (this.path = new Uint16Array(4)),
                (this.pages = new Array(32768)),
                (this.maxPages = this.pages.length),
                (this.level = 0),
                (this.pageSize = e || 1024),
                (this.deduplicate = t ? t.deduplicate : null),
                (this.zeros = this.deduplicate
                  ? r(this.deduplicate.length)
                  : null);
            }
            function r(t) {
              if (e.alloc) return e.alloc(t);
              var n = new e(t);
              return n.fill(0), n;
            }
            function i(e, t) {
              (this.offset = e * t.length),
                (this.buffer = t),
                (this.updated = !1),
                (this.deduplicate = 0);
            }
            (t.exports = n),
              (n.prototype.updated = function(e) {
                for (
                  ;
                  this.deduplicate &&
                  e.buffer[e.deduplicate] === this.deduplicate[e.deduplicate];

                )
                  if (
                    (e.deduplicate++, e.deduplicate === this.deduplicate.length)
                  ) {
                    (e.deduplicate = 0),
                      e.buffer.equals &&
                        e.buffer.equals(this.deduplicate) &&
                        (e.buffer = this.deduplicate);
                    break;
                  }
                !e.updated &&
                  this.updates &&
                  ((e.updated = !0), this.updates.push(e));
              }),
              (n.prototype.lastUpdate = function() {
                if (!this.updates || !this.updates.length) return null;
                var e = this.updates.pop();
                return (e.updated = !1), e;
              }),
              (n.prototype._array = function(e, t) {
                if (e >= this.maxPages) {
                  if (t) return;
                  !(function(e, t) {
                    for (; e.maxPages < t; ) {
                      var n = e.pages;
                      (e.pages = new Array(32768)),
                        (e.pages[0] = n),
                        e.level++,
                        (e.maxPages *= 32768);
                    }
                  })(this, e);
                }
                var n, r;
                (n = e),
                  (r = this.path),
                  (n =
                    ((n = (n - (r[0] = 32767 & n)) / 32768) -
                      (r[1] = 32767 & n)) /
                    32768),
                  (r[3] = ((n - (r[2] = 32767 & n)) / 32768) & 32767);
                for (var i = this.pages, o = this.level; o > 0; o--) {
                  var s = this.path[o],
                    a = i[s];
                  if (!a) {
                    if (t) return;
                    a = i[s] = new Array(32768);
                  }
                  i = a;
                }
                return i;
              }),
              (n.prototype.get = function(t, n) {
                var o,
                  s,
                  a = this._array(t, n),
                  h = this.path[0],
                  u = a && a[h];
                return (
                  u ||
                    n ||
                    ((u = a[h] = new i(t, r(this.pageSize))),
                    t >= this.length && (this.length = t + 1)),
                  u &&
                    u.buffer === this.deduplicate &&
                    this.deduplicate &&
                    !n &&
                    ((u.buffer =
                      ((o = u.buffer),
                      (s = e.allocUnsafe
                        ? e.allocUnsafe(o.length)
                        : new e(o.length)),
                      o.copy(s),
                      s)),
                    (u.deduplicate = 0)),
                  u
                );
              }),
              (n.prototype.set = function(e, t) {
                var n = this._array(e, !1),
                  o = this.path[0];
                if (
                  (e >= this.length && (this.length = e + 1),
                  !t || (this.zeros && t.equals && t.equals(this.zeros)))
                )
                  n[o] = void 0;
                else {
                  this.deduplicate &&
                    t.equals &&
                    t.equals(this.deduplicate) &&
                    (t = this.deduplicate);
                  var s = n[o],
                    a = (function(e, t) {
                      if (e.length === t) return e;
                      if (e.length > t) return e.slice(0, t);
                      var n = r(t);
                      return e.copy(n), n;
                    })(t, this.pageSize);
                  s ? (s.buffer = a) : (n[o] = new i(e, a));
                }
              }),
              (n.prototype.toBuffer = function() {
                for (
                  var t = new Array(this.length), n = r(this.pageSize), i = 0;
                  i < t.length;

                )
                  for (
                    var o = this._array(i, !0), s = 0;
                    s < 32768 && i < t.length;
                    s++
                  )
                    t[i++] = o && o[s] ? o[s].buffer : n;
                return e.concat(t);
              });
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169 }
      ],
      77: [
        function(e, t, n) {
          (function(n) {
            var r = e("flat-tree");
            function i(e, t) {
              if (!(this instanceof i)) return new i(e, t);
              if (!e || !e.leaf || !e.parent)
                throw new Error("opts.leaf and opts.parent required");
              (this.roots = t || e.roots || []),
                (this.blocks = this.roots.length
                  ? 1 + r.rightSpan(this.roots[this.roots.length - 1].index) / 2
                  : 0);
              for (var n = 0; n < this.roots.length; n++) {
                var o = this.roots[n];
                o && !o.parent && (o.parent = r.parent(o.index));
              }
              (this._leaf = e.leaf), (this._parent = e.parent);
            }
            (t.exports = i),
              (i.prototype.next = function(e, t) {
                n.isBuffer(e) || (e = new n(e)), t || (t = []);
                var i = 2 * this.blocks++,
                  o = {
                    index: i,
                    parent: r.parent(i),
                    hash: null,
                    size: e.length,
                    data: e
                  };
                for (
                  o.hash = this._leaf(o, this.roots),
                    this.roots.push(o),
                    t.push(o);
                  this.roots.length > 1;

                ) {
                  var s = this.roots[this.roots.length - 2],
                    a = this.roots[this.roots.length - 1];
                  if (s.parent !== a.parent) break;
                  this.roots.pop(),
                    (this.roots[this.roots.length - 1] = o = {
                      index: s.parent,
                      parent: r.parent(s.parent),
                      hash: this._parent(s, a),
                      size: s.size + a.size,
                      data: null
                    }),
                    t.push(o);
                }
                return t;
              });
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169, "flat-tree": 39 }
      ],
      78: [
        function(e, t, n) {
          var r = 1e3,
            i = 60 * r,
            o = 60 * i,
            s = 24 * o,
            a = 365.25 * s;
          function h(e, t, n) {
            if (!(e < t))
              return e < 1.5 * t
                ? Math.floor(e / t) + " " + n
                : Math.ceil(e / t) + " " + n + "s";
          }
          t.exports = function(e, t) {
            t = t || {};
            var n,
              u = typeof e;
            if ("string" === u && e.length > 0)
              return (function(e) {
                if ((e = String(e)).length > 100) return;
                var t = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
                  e
                );
                if (!t) return;
                var n = parseFloat(t[1]);
                switch ((t[2] || "ms").toLowerCase()) {
                  case "years":
                  case "year":
                  case "yrs":
                  case "yr":
                  case "y":
                    return n * a;
                  case "days":
                  case "day":
                  case "d":
                    return n * s;
                  case "hours":
                  case "hour":
                  case "hrs":
                  case "hr":
                  case "h":
                    return n * o;
                  case "minutes":
                  case "minute":
                  case "mins":
                  case "min":
                  case "m":
                    return n * i;
                  case "seconds":
                  case "second":
                  case "secs":
                  case "sec":
                  case "s":
                    return n * r;
                  case "milliseconds":
                  case "millisecond":
                  case "msecs":
                  case "msec":
                  case "ms":
                    return n;
                  default:
                    return;
                }
              })(e);
            if ("number" === u && !1 === isNaN(e))
              return t.long
                ? h((n = e), s, "day") ||
                    h(n, o, "hour") ||
                    h(n, i, "minute") ||
                    h(n, r, "second") ||
                    n + " ms"
                : (function(e) {
                    if (e >= s) return Math.round(e / s) + "d";
                    if (e >= o) return Math.round(e / o) + "h";
                    if (e >= i) return Math.round(e / i) + "m";
                    if (e >= r) return Math.round(e / r) + "s";
                    return e + "ms";
                  })(e);
            throw new Error(
              "val is not a non-empty string or a valid number. val=" +
                JSON.stringify(e)
            );
          };
        },
        {}
      ],
      79: [
        function(e, t, n) {
          (function(e) {
            t.exports = function() {
              var t = [],
                n = null,
                r = function() {
                  n(o);
                },
                i = function(o) {
                  return n
                    ? t.push(o)
                    : ((n = o), (i.locked = !0), e.nextTick(r), 0);
                };
              i.locked = !1;
              var o = function(e, r, o) {
                (n = null),
                  (i.locked = !1),
                  t.length && i(t.shift()),
                  e && e(r, o);
              };
              return i;
            };
          }.call(this, e("_process")));
        },
        { _process: 175 }
      ],
      80: [
        function(e, t, n) {
          function r(e, t) {
            if (!e) throw new Error(t || "AssertionError");
          }
          (r.notEqual = function(e, t, n) {
            r(e != t, n);
          }),
            (r.notOk = function(e, t) {
              r(!e, t);
            }),
            (r.equal = function(e, t, n) {
              r(e == t, n);
            }),
            (r.ok = r),
            (t.exports = r);
        },
        {}
      ],
      81: [
        function(e, t, n) {
          (function(e) {
            function n(e) {
              e.continueSync();
            }
            t.exports = class {
              constructor() {
                (this._tick = 0), (this._fns = []);
              }
              get waiting() {
                return this._tick > 0;
              }
              wait() {
                this._tick++;
              }
              continue(t, r, i) {
                1 === this._tick ? e.nextTick(n, this) : this._tick--,
                  t && t(r, i);
              }
              waitAndContinue() {
                let e = !1;
                return this.wait(), () => !e && ((e = !0), this.continue(), !0);
              }
              continueSync(e, t, n) {
                if (!--this._tick) {
                  for (; null !== this._fns && this._fns.length; )
                    this._fns.pop()();
                  e && e(t, n);
                }
              }
              destroy() {
                const e = this._fns;
                if (!e) for (this._fns = null; e.length; ) e.pop()();
              }
              ready(e) {
                null === this._fns || 0 === this._tick
                  ? e()
                  : this._fns.push(e);
              }
            };
          }.call(this, e("_process")));
        },
        { _process: 175 }
      ],
      82: [
        function(e, t, n) {
          (function(e, n) {
            "use strict";
            var r, i;
            (r = function(e) {
              if ("function" != typeof e)
                throw new TypeError(e + " is not a function");
              return e;
            }),
              (i = function(e) {
                var t,
                  n,
                  i = document.createTextNode(""),
                  o = 0;
                return (
                  new e(function() {
                    var e;
                    if (t) n && (t = n.concat(t));
                    else {
                      if (!n) return;
                      t = n;
                    }
                    if (((n = t), (t = null), "function" == typeof n))
                      return (e = n), (n = null), void e();
                    for (i.data = o = ++o % 2; n; )
                      (e = n.shift()), n.length || (n = null), e();
                  }).observe(i, { characterData: !0 }),
                  function(e) {
                    r(e),
                      t
                        ? "function" == typeof t
                          ? (t = [t, e])
                          : t.push(e)
                        : ((t = e), (i.data = o = ++o % 2));
                  }
                );
              }),
              (t.exports = (function() {
                if (
                  "object" == typeof e &&
                  e &&
                  "function" == typeof e.nextTick
                )
                  return e.nextTick;
                if ("object" == typeof document && document) {
                  if ("function" == typeof MutationObserver)
                    return i(MutationObserver);
                  if ("function" == typeof WebKitMutationObserver)
                    return i(WebKitMutationObserver);
                }
                return "function" == typeof n
                  ? function(e) {
                      n(r(e));
                    }
                  : "function" == typeof setTimeout ||
                    "object" == typeof setTimeout
                  ? function(e) {
                      setTimeout(r(e), 0);
                    }
                  : null;
              })());
          }.call(this, e("_process"), e("timers").setImmediate));
        },
        { _process: 175, timers: 176 }
      ],
      83: [
        function(e, t, n) {
          var r = e("remove-trailing-separator");
          t.exports = function(e, t) {
            if ("string" != typeof e) throw new TypeError("expected a string");
            return (e = e.replace(/[\\\/]+/g, "/")), !1 !== t && (e = r(e)), e;
          };
        },
        { "remove-trailing-separator": 118 }
      ],
      84: [
        function(e, t, n) {
          var r = e("wrappy");
          function i(e) {
            var t = function() {
              return t.called
                ? t.value
                : ((t.called = !0), (t.value = e.apply(this, arguments)));
            };
            return (t.called = !1), t;
          }
          function o(e) {
            var t = function() {
                if (t.called) throw new Error(t.onceError);
                return (t.called = !0), (t.value = e.apply(this, arguments));
              },
              n = e.name || "Function wrapped with `once`";
            return (
              (t.onceError = n + " shouldn't be called more than once"),
              (t.called = !1),
              t
            );
          }
          (t.exports = r(i)),
            (t.exports.strict = r(o)),
            (i.proto = i(function() {
              Object.defineProperty(Function.prototype, "once", {
                value: function() {
                  return i(this);
                },
                configurable: !0
              }),
                Object.defineProperty(Function.prototype, "onceStrict", {
                  value: function() {
                    return o(this);
                  },
                  configurable: !0
                });
            }));
        },
        { wrappy: 159 }
      ],
      85: [
        function(e, t, n) {
          (function(e) {
            t.exports = function(t) {
              return (
                e.isBuffer(t) && (t = t.toString("hex")),
                "string" == typeof t && t.length > 8
                  ? t.slice(0, 6) + ".." + t.slice(-2)
                  : t
              );
            };
          }.call(this, {
            isBuffer: e("../../../../../node_modules/is-buffer/index.js")
          }));
        },
        { "../../../../../node_modules/is-buffer/index.js": 172 }
      ],
      86: [
        function(e, t, n) {
          (function(e) {
            "use strict";
            void 0 === e ||
            !e.version ||
            0 === e.version.indexOf("v0.") ||
            (0 === e.version.indexOf("v1.") && 0 !== e.version.indexOf("v1.8."))
              ? (t.exports = {
                  nextTick: function(t, n, r, i) {
                    if ("function" != typeof t)
                      throw new TypeError(
                        '"callback" argument must be a function'
                      );
                    var o,
                      s,
                      a = arguments.length;
                    switch (a) {
                      case 0:
                      case 1:
                        return e.nextTick(t);
                      case 2:
                        return e.nextTick(function() {
                          t.call(null, n);
                        });
                      case 3:
                        return e.nextTick(function() {
                          t.call(null, n, r);
                        });
                      case 4:
                        return e.nextTick(function() {
                          t.call(null, n, r, i);
                        });
                      default:
                        for (o = new Array(a - 1), s = 0; s < o.length; )
                          o[s++] = arguments[s];
                        return e.nextTick(function() {
                          t.apply(null, o);
                        });
                    }
                  }
                })
              : (t.exports = e);
          }.call(this, e("_process")));
        },
        { _process: 175 }
      ],
      87: [
        function(e, t, n) {
          (function(t) {
            var r = e("varint"),
              i = e("signed-varint");
            function o(e, t, n, r) {
              return (
                (t.bytes = n.bytes = 0),
                { type: e, encode: t, decode: n, encodingLength: r }
              );
            }
            function s(e) {
              return t.isBuffer(e) ? e.length : t.byteLength(e);
            }
            (n.make = o),
              (n.name = function(e) {
                for (var t = Object.keys(n), r = 0; r < t.length; r++)
                  if (n[t[r]] === e) return t[r];
                return null;
              }),
              (n.skip = function(e, t, n) {
                switch (e) {
                  case 0:
                    return r.decode(t, n), n + r.decode.bytes;
                  case 1:
                    return n + 8;
                  case 2:
                    var i = r.decode(t, n);
                    return n + r.decode.bytes + i;
                  case 3:
                  case 4:
                    throw new Error("Groups are not supported");
                  case 5:
                    return n + 4;
                }
                throw new Error("Unknown wire type: " + e);
              }),
              (n.bytes = o(
                2,
                function e(n, i, o) {
                  var a = o,
                    h = s(n);
                  return (
                    r.encode(h, i, o),
                    (o += r.encode.bytes),
                    t.isBuffer(n) ? n.copy(i, o) : i.write(n, o, h),
                    (e.bytes = (o += h) - a),
                    i
                  );
                },
                function e(t, n) {
                  var i = n,
                    o = r.decode(t, n);
                  n += r.decode.bytes;
                  var s = t.slice(n, n + o);
                  return (n += s.length), (e.bytes = n - i), s;
                },
                function(e) {
                  var t = s(e);
                  return r.encodingLength(t) + t;
                }
              )),
              (n.string = o(
                2,
                function e(n, i, o) {
                  var s = o,
                    a = t.byteLength(n);
                  return (
                    r.encode(a, i, o, "utf-8"),
                    (o += r.encode.bytes),
                    i.write(n, o, a),
                    (e.bytes = (o += a) - s),
                    i
                  );
                },
                function e(t, n) {
                  var i = n,
                    o = r.decode(t, n);
                  n += r.decode.bytes;
                  var s = t.toString("utf-8", n, n + o);
                  return (e.bytes = (n += o) - i), s;
                },
                function(e) {
                  var n = t.byteLength(e);
                  return r.encodingLength(n) + n;
                }
              )),
              (n.bool = o(
                0,
                function e(t, n, r) {
                  return (n[r] = t ? 1 : 0), (e.bytes = 1), n;
                },
                function e(t, n) {
                  var r = t[n] > 0;
                  return (e.bytes = 1), r;
                },
                function() {
                  return 1;
                }
              )),
              (n.int32 = o(
                0,
                function e(t, n, i) {
                  return (
                    r.encode(t < 0 ? t + 4294967296 : t, n, i),
                    (e.bytes = r.encode.bytes),
                    n
                  );
                },
                function e(t, n) {
                  var i = r.decode(t, n);
                  return (
                    (e.bytes = r.decode.bytes),
                    i > 2147483647 ? i - 4294967296 : i
                  );
                },
                function(e) {
                  return r.encodingLength(e < 0 ? e + 4294967296 : e);
                }
              )),
              (n.int64 = o(
                0,
                function e(t, n, i) {
                  if (t < 0) {
                    var o = i + 9;
                    for (
                      r.encode(-1 * t, n, i),
                        n[(i += r.encode.bytes - 1)] = 128 | n[i];
                      i < o - 1;

                    )
                      n[++i] = 255;
                    (n[o] = 1), (e.bytes = 10);
                  } else r.encode(t, n, i), (e.bytes = r.encode.bytes);
                  return n;
                },
                function e(n, i) {
                  var o = r.decode(n, i);
                  if (o >= Math.pow(2, 63)) {
                    for (var s = 9; 255 === n[i + s - 1]; ) s--;
                    s = s || 9;
                    var a = t.allocUnsafe(s);
                    n.copy(a, 0, i, i + s),
                      (a[s - 1] = 127 & a[s - 1]),
                      (o = -1 * r.decode(a, 0)),
                      (e.bytes = 10);
                  } else e.bytes = r.decode.bytes;
                  return o;
                },
                function(e) {
                  return e < 0 ? 10 : r.encodingLength(e);
                }
              )),
              (n.sint32 = n.sint64 = o(
                0,
                i.encode,
                i.decode,
                i.encodingLength
              )),
              (n.uint32 = n.uint64 = n.enum = n.varint = o(
                0,
                r.encode,
                r.decode,
                r.encodingLength
              )),
              (n.fixed64 = n.sfixed64 = o(
                1,
                function e(t, n, r) {
                  return t.copy(n, r), (e.bytes = 8), n;
                },
                function e(t, n) {
                  var r = t.slice(n, n + 8);
                  return (e.bytes = 8), r;
                },
                function() {
                  return 8;
                }
              )),
              (n.double = o(
                1,
                function e(t, n, r) {
                  return n.writeDoubleLE(t, r), (e.bytes = 8), n;
                },
                function e(t, n) {
                  var r = t.readDoubleLE(n);
                  return (e.bytes = 8), r;
                },
                function() {
                  return 8;
                }
              )),
              (n.fixed32 = o(
                5,
                function e(t, n, r) {
                  return n.writeUInt32LE(t, r), (e.bytes = 4), n;
                },
                function e(t, n) {
                  var r = t.readUInt32LE(n);
                  return (e.bytes = 4), r;
                },
                function() {
                  return 4;
                }
              )),
              (n.sfixed32 = o(
                5,
                function e(t, n, r) {
                  return n.writeInt32LE(t, r), (e.bytes = 4), n;
                },
                function e(t, n) {
                  var r = t.readInt32LE(n);
                  return (e.bytes = 4), r;
                },
                function() {
                  return 4;
                }
              )),
              (n.float = o(
                5,
                function e(t, n, r) {
                  return n.writeFloatLE(t, r), (e.bytes = 4), n;
                },
                function e(t, n) {
                  var r = t.readFloatLE(n);
                  return (e.bytes = 4), r;
                },
                function() {
                  return 4;
                }
              ));
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169, "signed-varint": 123, varint: 90 }
      ],
      88: [
        function(e, t, n) {
          arguments[4][6][0].apply(n, arguments);
        },
        { dup: 6 }
      ],
      89: [
        function(e, t, n) {
          arguments[4][7][0].apply(n, arguments);
        },
        { dup: 7 }
      ],
      90: [
        function(e, t, n) {
          arguments[4][8][0].apply(n, arguments);
        },
        { "./decode.js": 88, "./encode.js": 89, "./length.js": 91, dup: 8 }
      ],
      91: [
        function(e, t, n) {
          arguments[4][9][0].apply(n, arguments);
        },
        { dup: 9 }
      ],
      92: [
        function(e, t, n) {
          (function(n) {
            var r = e("once"),
              i = e("end-of-stream"),
              o = e("fs"),
              s = function() {},
              a = /^v?\.0/.test(n.version),
              h = function(e) {
                return "function" == typeof e;
              },
              u = function(e, t, n, u) {
                u = r(u);
                var c = !1;
                e.on("close", function() {
                  c = !0;
                }),
                  i(e, { readable: t, writable: n }, function(e) {
                    if (e) return u(e);
                    (c = !0), u();
                  });
                var f = !1;
                return function(t) {
                  if (!c && !f)
                    return (
                      (f = !0),
                      (function(e) {
                        return (
                          !!a &&
                          !!o &&
                          (e instanceof (o.ReadStream || s) ||
                            e instanceof (o.WriteStream || s)) &&
                          h(e.close)
                        );
                      })(e)
                        ? e.close(s)
                        : (function(e) {
                            return e.setHeader && h(e.abort);
                          })(e)
                        ? e.abort()
                        : h(e.destroy)
                        ? e.destroy()
                        : void u(t || new Error("stream was destroyed"))
                    );
                };
              },
              c = function(e) {
                e();
              },
              f = function(e, t) {
                return e.pipe(t);
              };
            t.exports = function() {
              var e,
                t = Array.prototype.slice.call(arguments),
                n = (h(t[t.length - 1] || s) && t.pop()) || s;
              if ((Array.isArray(t[0]) && (t = t[0]), t.length < 2))
                throw new Error("pump requires two streams per minimum");
              var r = t.map(function(i, o) {
                var s = o < t.length - 1;
                return u(i, s, o > 0, function(t) {
                  e || (e = t), t && r.forEach(c), s || (r.forEach(c), n(e));
                });
              });
              return t.reduce(f);
            };
          }.call(this, e("_process")));
        },
        { _process: 175, "end-of-stream": 37, fs: 168, once: 84 }
      ],
      93: [
        function(e, t, n) {
          (function(n) {
            const r = e("random-access-storage"),
              i = { type: "octet/stream" },
              o = window.requestFileSystem || window.webkitRequestFileSystem,
              s =
                navigator.persistentStorage ||
                navigator.webkitPersistentStorage,
              a = window.FileReader,
              h = window.Blob;
            function u(e, t, n) {
              if ("function" == typeof t) return u(e, !0, t);
              s.queryUsageAndQuota(function(r, i) {
                if (i && !t) return n(null, i);
                s.requestQuota(
                  e,
                  function(e) {
                    n(null, e);
                  },
                  n
                );
              }, n);
            }
            function c(e, t) {
              t || (t = {});
              const n = t.maxSize || c.DEFAULT_MAX_SIZE,
                i = new d();
              var s = null,
                a = null,
                h = null,
                g = null,
                y = [],
                A = [];
              return r({
                read: function(e) {
                  (y.pop() || new p(y, a, h, i)).run(e);
                },
                write: function(e) {
                  (A.pop() || new l(A, a, h, i)).run(e);
                },
                open: function(t) {
                  function r(e) {
                    (s = a = h = null), t.callback(e);
                  }
                  u(n, !1, function(n, i) {
                    if (n) return r(n);
                    o(
                      window.PERSISTENT,
                      i,
                      function(n) {
                        (s = n),
                          (function e(t, n) {
                            if (!t) return n();
                            s.root.getDirectory(
                              t,
                              { create: !0 },
                              n,
                              function() {
                                e(f(t), function() {
                                  s.root.getDirectory(t, { create: !0 }, n, n);
                                });
                              }
                            );
                          })(f(e), function() {
                            s.root.getFile(
                              e,
                              { create: !0 },
                              function(e) {
                                (h = g = e).file(function(e) {
                                  (a = e), t.callback(null);
                                }, r);
                              },
                              r
                            );
                          });
                      },
                      r
                    );
                  });
                },
                stat: function(e) {
                  e.callback(null, a);
                },
                close: function(e) {
                  (y = A = h = a = s = null), e.callback(null);
                },
                destroy: function(e) {
                  g.remove(
                    function() {
                      (g = null), e.callback(null, null);
                    },
                    function(t) {
                      (g = null), e.callback(t, null);
                    }
                  );
                }
              });
            }
            function f(e) {
              const t = e.lastIndexOf("/"),
                n = e.lastIndexOf("\\"),
                r = e.slice(0, Math.max(0, t, n));
              return /^\w:$/.test(r) ? "" : r;
            }
            function l(e, t, n, r) {
              (this.writer = null),
                (this.entry = n),
                (this.file = t),
                (this.req = null),
                (this.pool = e),
                (this.mutex = r),
                (this.locked = !1),
                (this.truncating = !1);
            }
            function d() {
              this.queued = null;
            }
            function p(e, t, r, i) {
              (this.reader = new a()),
                (this.file = t),
                (this.req = null),
                (this.pool = e),
                (this.retry = !0),
                (this.mutex = i),
                (this.locked = !1);
              const o = this;
              (this.reader.onerror = function() {
                o.onread(this.error, null);
              }),
                (this.reader.onload = function() {
                  const e = n.from(this.result);
                  o.onread(null, e);
                });
            }
            (c.DEFAULT_MAX_SIZE = Number.MAX_SAFE_INTEGER),
              (c.requestQuota = u),
              (t.exports = c),
              (l.prototype.makeWriter = function() {
                const e = this;
                this.entry.createWriter(function(t) {
                  (e.writer = t),
                    (t.onwriteend = function() {
                      e.onwrite(null);
                    }),
                    (t.onerror = function(t) {
                      e.onwrite(t);
                    }),
                    e.run(e.req);
                });
              }),
              (l.prototype.onwrite = function(e) {
                const t = this.req;
                if (
                  ((this.req = null),
                  this.locked && ((this.locked = !1), this.mutex.release()),
                  this.truncating && ((this.truncating = !1), !e))
                )
                  return this.run(t);
                this.pool.push(this), t.callback(e, null);
              }),
              (l.prototype.truncate = function() {
                (this.truncating = !0), this.writer.truncate(this.req.offset);
              }),
              (l.prototype.lock = function() {
                return (
                  !!this.locked ||
                  ((this.locked = this.mutex.lock(this)), this.locked)
                );
              }),
              (l.prototype.run = function(e) {
                if (
                  ((this.req = e),
                  !this.writer || this.writer.length !== this.file.size)
                )
                  return this.makeWriter();
                if (!(e.offset + e.size > this.file.size) || this.lock()) {
                  if (e.offset > this.writer.length)
                    return e.offset > this.file.size
                      ? this.truncate()
                      : this.makeWriter();
                  this.writer.seek(e.offset),
                    this.writer.write(new h([e.data], i));
                }
              }),
              (d.prototype.release = function() {
                const e = this.queued;
                this.queued = null;
                for (var t = 0; t < e.length; t++) e[t].run(e[t].req);
              }),
              (d.prototype.lock = function(e) {
                return this.queued
                  ? (this.queued.push(e), !1)
                  : ((this.queued = []), !0);
              }),
              (p.prototype.lock = function() {
                return (
                  !!this.locked ||
                  ((this.locked = this.mutex.lock(this)), this.locked)
                );
              }),
              (p.prototype.onread = function(e, t) {
                const n = this.req;
                if (e && this.retry)
                  return (
                    (this.retry = !1), void (this.lock(this) && this.run(n))
                  );
                (this.req = null),
                  this.pool.push(this),
                  (this.retry = !0),
                  this.locked && ((this.locked = !1), this.mutex.release()),
                  n.callback(e, t);
              }),
              (p.prototype.run = function(e) {
                const t = e.offset + e.size;
                if (((this.req = e), t > this.file.size))
                  return this.onread(
                    new Error("Could not satisfy length"),
                    null
                  );
                this.reader.readAsArrayBuffer(this.file.slice(e.offset, t));
              });
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169, "random-access-storage": 103 }
      ],
      94: [
        function(e, t, n) {
          t.exports = function() {
            throw new Error(
              "random-access-file is not supported in the browser"
            );
          };
        },
        {}
      ],
      95: [
        function(e, t, n) {
          "use strict";
          Object.defineProperty(n, "__esModule", { value: !0 });
          n.indexedDB = window.indexedDB;
        },
        {}
      ],
      96: [
        function(e, t, n) {
          "use strict";
          Object.defineProperty(n, "__esModule", { value: !0 });
          var r,
            i = e("random-access-storage"),
            o = (r = i) && r.__esModule ? r : { default: r },
            s = e("./IndexedDB"),
            a = e("buffer");
          const h = e =>
            new Promise((t, n) => {
              (e.onsuccess = () => t(e.result)), (e.onerror = () => n(e.error));
            });
          class u {
            constructor(e, t, n, r, i) {
              (this.db = e),
                (this.name = t),
                (this.version = n),
                (this.storeName = r),
                (this.options = i);
            }
            store() {
              const { db: e, storeName: t } = this;
              return e.transaction([t], "readwrite").objectStore(t);
            }
            async delete(e) {
              return await h(this.store().delete(e));
            }
            async save(e, t) {
              return await h(this.store().put(t, e));
            }
            async open(e, t) {
              const n = await h(this.store().get(e));
              if (n) return n;
              if ("readwrite" === t) {
                const t = await h(
                  this.db.createMutableFile(e, "binary/random")
                );
                return await this.save(e, t), t;
              }
              throw new RangeError(`File ${e} does not exist`);
            }
            mount(e, t) {
              return new c(this, `/${e}`, t);
            }
          }
          class c extends o.default {
            static async mount(e = {}) {
              if (self.IDBMutableFile) {
                const t = e.name || "RandomAccess",
                  n = e.version || 1,
                  r = e.storeName || "IDBMutableFile",
                  i = s.indexedDB.open(t, n);
                i.onupgradeneeded = () => {
                  const e = i.result;
                  e.objectStoreNames.contains(r) || e.createObjectStore(r);
                };
                const o = await h(i),
                  a = new u(o, t, n, r, e);
                return (e, t) => a.mount(e, t);
              }
              throw Error(
                "Runtime does not supports IDBMutableFile https://developer.mozilla.org/en-US/docs/Web/API/IDBMutableFile"
              );
            }
            static async open(e, t) {
              const { options: n } = e,
                r = t.preferReadonly ? "readonly" : "readwrite";
              if (
                (e.debug && console.log(`>> open ${e.url} ${r}`),
                (!e.file || (e.mode !== r && "readwrite" === r)) &&
                  ((e.mode = r), (e.file = await e.volume.open(e.url, r))),
                "readonly" !== r && n.truncate)
              ) {
                const t = e.activate();
                await h(t.truncate(n.size || 0));
              }
              e.debug && console.log(`<< open ${e.url} ${r}`);
            }
            static async read(e, { data: t, offset: n, size: r }) {
              e.debug && console.log(`>> read ${e.url} <${n}, ${r}>`);
              const i = t || a.Buffer.allocUnsafe(r);
              if (0 === r) return i;
              const o = e.activate();
              o.location = n;
              const s = await h(o.readAsArrayBuffer(r));
              if (s.byteLength !== r)
                throw new Error("Could not satisfy length");
              return (
                a.Buffer.from(s).copy(i),
                e.debug && console.log(`<< read ${e.url} <${n}, ${r}>`, i),
                i
              );
            }
            static async write(e, { data: t, offset: n, size: r }) {
              e.debug && console.log(`>> write ${e.url} <${n}, ${r}>`, t);
              const { byteLength: i, byteOffset: o } = t,
                s = i === r ? t : t.slice(0, r),
                a = e.activate();
              a.location = n;
              const u = await h(a.write(s));
              return (
                e.debug && console.log(`<< write ${e.url} <${n}, ${r}>`), u
              );
            }
            static async delete(e, { offset: t, size: n }) {
              if (
                (e.debug && console.log(`>> delete ${e.url} <${t}, ${n}>`),
                t + n >= (await this.stat(e)).size)
              ) {
                const n = e.activate();
                await h(n.truncate(t));
              }
              e.debug && console.log(`<< delete ${e.url} <${t}, ${n}>`);
            }
            static async stat(e) {
              e.debug && console.log(`>> stat ${e.url}`);
              const t = e.activate(),
                n = await h(t.getMetadata());
              return (
                e.debug && console.log(`<< stat {size:${n.size}} ${e.url} `), n
              );
            }
            static async close(e) {
              e.debug && console.log(`>> close ${e.url}`);
              const { lockedFile: t } = e;
              t && t.active && (await h(t.flush())),
                (e.lockedFile = null),
                (e.file = null),
                e.debug && console.log(`<< close ${e.url}`);
            }
            static async destroy(e) {
              e.debug && console.log(`>> destroy ${e.url}`),
                await e.volume.delete(e.url),
                e.debug && console.log(`<< destroy ${e.url}`);
            }
            static async awake(e) {
              const { workQueue: t } = e;
              e.isIdle = !1;
              let n = 0;
              for (; n < t.length; ) {
                const r = t[n++];
                await this.perform(e, r);
              }
              (t.length = 0), (e.isIdle = !0);
            }
            static schedule(e, t) {
              e.workQueue.push(t), e.isIdle && this.awake(e);
            }
            static async perform(e, t) {
              try {
                switch (t.type) {
                  case f.open:
                    return t.callback(null, await this.open(e, t));
                  case f.read:
                    return t.callback(null, await this.read(e, t));
                  case f.write:
                    return t.callback(null, await this.write(e, t));
                  case f.delete:
                    return t.callback(null, await this.delete(e, t));
                  case f.stat:
                    return t.callback(null, await this.stat(e));
                  case f.close:
                    return t.callback(null, await this.close(e));
                  case f.destroy:
                    return t.callback(null, await this.destroy(e));
                }
              } catch (e) {
                t.callback(e);
              }
            }
            _open(e) {
              c.schedule(this, e);
            }
            _openReadonly(e) {
              c.schedule(this, e);
            }
            _write(e) {
              c.schedule(this, e);
            }
            _read(e) {
              c.schedule(this, e);
            }
            _del(e) {
              c.schedule(this, e);
            }
            _stat(e) {
              c.perform(this, e);
            }
            _close(e) {
              c.schedule(this, e);
            }
            _destroy(e) {
              c.schedule(this, e);
            }
            constructor(e, t, n = {}) {
              super(),
                (this.volume = e),
                (this.url = t),
                (this.options = n),
                (this.mode = "readonly"),
                (this.file = null),
                (this.lockedFile = null),
                (this.workQueue = []),
                (this.isIdle = !0),
                (this.debug = !!e.options.debug);
            }
            activate() {
              const { lockedFile: e, file: t, mode: n } = this;
              if (e && e.active) return e;
              if (t) {
                const e = t.open(n);
                return (this.lockedFile = e), e;
              }
              throw new RangeError(
                "Unable to activate file, likely provider was destroyed"
              );
            }
          }
          const f = {
            open: 0,
            read: 1,
            write: 2,
            delete: 3,
            stat: 4,
            close: 5,
            destroy: 6
          };
          (n.default = c), (t.exports = n.default);
        },
        { "./IndexedDB": 95, buffer: 169, "random-access-storage": 97 }
      ],
      97: [
        function(e, t, n) {
          (function(n) {
            var r = e("events"),
              i = e("inherits"),
              o = g(new Error("Not readable")),
              s = g(new Error("Not writable")),
              a = g(new Error("Not deletable")),
              h = g(new Error("Not statable")),
              u = g(new Error("No readonly open"));
            function c(e) {
              if (!(this instanceof c)) return new c(e);
              r.EventEmitter.call(this),
                (this._queued = []),
                (this._pending = 0),
                (this._needsOpen = !0),
                (this.opened = !1),
                (this.closed = !1),
                (this.destroyed = !1),
                e &&
                  (e.openReadonly && (this._openReadonly = e.openReadonly),
                  e.open && (this._open = e.open),
                  e.read && (this._read = e.read),
                  e.write && (this._write = e.write),
                  e.del && (this._del = e.del),
                  e.stat && (this._stat = e.stat),
                  e.close && (this._close = e.close),
                  e.destroy && (this._destroy = e.destroy)),
                (this.preferReadonly = this._openReadonly !== u),
                (this.readable = this._read !== o),
                (this.writable = this._write !== s),
                (this.deletable = this._del !== a),
                (this.statable = this._stat !== h);
            }
            function f() {}
            function l(e, t, n, r, i, o) {
              (this.type = t),
                (this.offset = n),
                (this.data = i),
                (this.size = r),
                (this.storage = e),
                (this._sync = !1),
                (this._callback = o),
                (this._openError = null);
            }
            function d(e, t) {
              e._queued.push(t), e._pending || t._run();
            }
            function p(e) {
              e.preferReadonly &&
                ((e._needsOpen = !0), (e.preferReadonly = !1));
            }
            function g(e) {
              return function(t) {
                y(t, e);
              };
            }
            function y(e, t, r) {
              n.nextTick(A, e, t, r);
            }
            function A(e, t, n) {
              e.callback(t, n);
            }
            (t.exports = c),
              i(c, r.EventEmitter),
              (c.prototype.open = function(e) {
                if ((e || (e = f), this.opened && !this._needsOpen))
                  return n.nextTick(e, null);
                d(this, new l(this, 0, 0, 0, null, e));
              }),
              (c.prototype._open = g(null)),
              (c.prototype._openReadonly = u),
              (c.prototype.read = function(e, t, n) {
                this.run(new l(this, 1, e, t, null, n));
              }),
              (c.prototype._read = o),
              (c.prototype.write = function(e, t, n) {
                n || (n = f),
                  p(this),
                  this.run(new l(this, 2, e, t.length, t, n));
              }),
              (c.prototype._write = s),
              (c.prototype.del = function(e, t, n) {
                n || (n = f), p(this), this.run(new l(this, 3, e, t, null, n));
              }),
              (c.prototype._del = a),
              (c.prototype.stat = function(e) {
                this.run(new l(this, 4, 0, 0, null, e));
              }),
              (c.prototype._stat = h),
              (c.prototype.close = function(e) {
                if ((e || (e = f), this.closed)) return n.nextTick(e, null);
                d(this, new l(this, 5, 0, 0, null, e));
              }),
              (c.prototype._close = g(null)),
              (c.prototype.destroy = function(e) {
                e || (e = f),
                  this.closed || this.close(f),
                  d(this, new l(this, 6, 0, 0, null, e));
              }),
              (c.prototype._destroy = g(null)),
              (c.prototype.run = function(e) {
                this._needsOpen && this.open(f),
                  this._queued.length ? this._queued.push(e) : e._run();
              }),
              (l.prototype._maybeOpenError = function(e) {
                if (0 === this.type)
                  for (var t = this.storage._queued, n = 0; n < t.length; n++)
                    t[n]._openError = e;
              }),
              (l.prototype._unqueue = function(e) {
                var t = this.storage,
                  n = t._queued;
                if (e) this._maybeOpenError(e);
                else
                  switch (this.type) {
                    case 0:
                      t.opened || ((t.opened = !0), t.emit("open"));
                      break;
                    case 5:
                      t.closed || ((t.closed = !0), t.emit("close"));
                      break;
                    case 6:
                      t.destroyed || ((t.destroyed = !0), t.emit("destroy"));
                  }
                n.length && n[0] === this && n.shift(),
                  !--t._pending && n.length && n[0]._run();
              }),
              (l.prototype.callback = function(e, t) {
                if (this._sync) return y(this, e, t);
                this._unqueue(e), this._callback(e, t);
              }),
              (l.prototype._openAndNotClosed = function() {
                var e = this.storage;
                return (
                  !(!e.opened || e.closed) ||
                  (e.opened
                    ? e.closed && y(this, new Error("Closed"))
                    : y(this, this._openError || new Error("Not opened")),
                  !1)
                );
              }),
              (l.prototype._open = function() {
                var e = this.storage;
                return e.opened && !e._needsOpen
                  ? y(this, null)
                  : e.closed
                  ? y(this, new Error("Closed"))
                  : ((e._needsOpen = !1),
                    void (e.preferReadonly
                      ? e._openReadonly(this)
                      : e._open(this)));
              }),
              (l.prototype._run = function() {
                var e = this.storage;
                switch ((e._pending++, (this._sync = !0), this.type)) {
                  case 0:
                    this._open();
                    break;
                  case 1:
                    this._openAndNotClosed() && e._read(this);
                    break;
                  case 2:
                    this._openAndNotClosed() && e._write(this);
                    break;
                  case 3:
                    this._openAndNotClosed() && e._del(this);
                    break;
                  case 4:
                    this._openAndNotClosed() && e._stat(this);
                    break;
                  case 5:
                    e.closed || !e.opened ? y(this, null) : e._close(this);
                    break;
                  case 6:
                    e.destroyed ? y(this, null) : e._destroy(this);
                }
                this._sync = !1;
              });
          }.call(this, e("_process")));
        },
        { _process: 175, events: 170, inherits: 64 }
      ],
      98: [
        function(e, t, n) {
          (function(n) {
            var r = e("random-access-storage"),
              i = e("inherits"),
              o = e("next-tick"),
              s = e("once"),
              a = e("./lib/blocks.js"),
              h = e("buffer-from"),
              u = e("buffer-alloc"),
              c = "\0",
              f =
                "undefined" != typeof window
                  ? window
                  : "undefined" != typeof self
                  ? self
                  : {};
            function l(e) {
              if (!(this instanceof l)) return new l(e);
              r.call(this),
                e || (e = {}),
                "string" == typeof e && (e = { name: e }),
                (this.size = e.size || 4096),
                (this.name = e.name),
                (this.length = e.length || 0),
                (this._getdb = e.db);
            }
            function d(e, t) {
              e.addEventListener("success", function(e) {
                t(null, e);
              }),
                e.addEventListener("error", t);
            }
            (t.exports = function(e, t) {
              t || (t = {});
              var n =
                t.idb ||
                (void 0 !== f
                  ? f.indexedDB ||
                    f.mozIndexedDB ||
                    f.webkitIndexedDB ||
                    f.msIndexedDB
                  : null);
              if (!n) throw new Error("indexedDB not present and not given");
              var r = null,
                i = [];
              if ("function" == typeof n.open) {
                var s = n.open(e);
                s.addEventListener("upgradeneeded", function() {
                  (r = s.result).createObjectStore("data");
                }),
                  s.addEventListener("success", function() {
                    (r = s.result),
                      i.forEach(function(e) {
                        e(r);
                      }),
                      (i = null);
                  });
              } else r = n;
              return function(e, n) {
                return (
                  "object" == typeof e && (e = (n = e).name),
                  n || (n = {}),
                  (n.name = e),
                  new l(Object.assign({ db: a }, t, n))
                );
              };
              function a(e) {
                r
                  ? o(function() {
                      e(r);
                    })
                  : i.push(e);
              }
            }),
              i(l, r),
              (l.prototype._blocks = function(e, t) {
                return a(this.size, e, t);
              }),
              (l.prototype._read = function(e) {
                var t = this,
                  r = [];
                t._store("readonly", function(i, o) {
                  if ((t.length || 0) < e.offset + e.size)
                    return e.callback(new Error("Could not satisfy length"));
                  if (i) return e.callback(i);
                  for (
                    var s = t._blocks(e.offset, e.offset + e.size),
                      a = s.length + 1,
                      f = s.length > 0 ? s[0].block : 0,
                      l = 0;
                    l < s.length;
                    l++
                  )
                    !(function(i) {
                      var s = t.name + c + i.block;
                      d(o.get(s), function(t, o) {
                        if (t) return e.callback(t);
                        (r[i.block - f] = o.target.result
                          ? h(o.target.result.subarray(i.start, i.end))
                          : u(i.end - i.start)),
                          0 == --a && e.callback(null, n.concat(r));
                      });
                    })(s[l]);
                  0 == --a && e.callback(null, n.concat(r));
                });
              }),
              (l.prototype._write = function(e) {
                var t = this;
                function n(n, r, i) {
                  for (var o = 0, s = 0; o < r.length; o++) {
                    var a = r[o],
                      u = a.end - a.start;
                    u === t.size
                      ? (block = h(e.data.slice(s, s + u)))
                      : ((block = i[o]), e.data.copy(block, a.start, s, s + u)),
                      n.put(block, t.name + c + a.block),
                      (s += u);
                  }
                  var f = Math.max(t.length || 0, e.offset + e.data.length);
                  n.put(f, t.name + c + "length"),
                    n.transaction.addEventListener("complete", function() {
                      (t.length = f), e.callback(null);
                    }),
                    n.transaction.addEventListener("error", function(t) {
                      e.callback(t);
                    });
                }
                t._store("readwrite", function(r, i) {
                  if (r) return e.callback(r);
                  for (
                    var o = t._blocks(e.offset, e.offset + e.data.length),
                      s = 1,
                      a = {},
                      f = 0;
                    f < o.length;
                    f++
                  )
                    !(function(r, f) {
                      if (r.end - r.start !== t.size) {
                        s++;
                        var l = t.name + c + r.block;
                        d(i.get(l), function(r, c) {
                          if (r) return e.callback(r);
                          (a[f] = h(c.target.result || u(t.size))),
                            0 == --s && n(i, o, a);
                        });
                      }
                    })(o[f], f);
                  0 == --s && n(i, o, a);
                });
              }),
              (l.prototype._store = function(e, t) {
                t = s(t);
                this._getdb(function(n) {
                  var r = n.transaction(["data"], e),
                    i = r.objectStore("data");
                  r.addEventListener("error", t), t(null, i);
                });
              }),
              (l.prototype._open = function(e) {
                var t = this;
                this._getdb(function(n) {
                  t._store("readonly", function(n, r) {
                    d(r.get(t.name + c + "length"), function(n, r) {
                      (t.length = r.target.result || 0), e.callback(null);
                    });
                  });
                });
              }),
              (l.prototype._close = function(e) {
                this._getdb(function(t) {
                  t.close(), e.callback();
                });
              }),
              (l.prototype._stat = function(e) {
                var t = this;
                o(function() {
                  e.callback(null, { size: t.length });
                });
              });
          }.call(this, e("buffer").Buffer));
        },
        {
          "./lib/blocks.js": 99,
          buffer: 169,
          "buffer-alloc": 22,
          "buffer-from": 100,
          inherits: 64,
          "next-tick": 82,
          once: 84,
          "random-access-storage": 103
        }
      ],
      99: [
        function(e, t, n) {
          t.exports = function(e, t, n) {
            for (var r = [], i = Math.floor(t / e) * e; i < n; i += e)
              r.push({
                block: Math.floor(i / e),
                start: Math.max(i, t) % e,
                end: Math.min(i + e, n) % e || e
              });
            return r;
          };
        },
        {}
      ],
      100: [
        function(e, t, n) {
          arguments[4][24][0].apply(n, arguments);
        },
        { buffer: 169, dup: 24 }
      ],
      101: [
        function(e, t, n) {
          (function(n) {
            var r = e("process-nextick-args");
            function i(e, t) {
              if (!(this instanceof i)) return new i(e, t);
              n.isBuffer(e) &&
                (t || (t = {}), (t.buffer = e), (e = t.buffer.length)),
                "object" == typeof e && ((t = e), (e = 0)),
                t || (t = {}),
                "number" != typeof e && (e = 0),
                (this.pageSize = e || t.pageSize || 1048576),
                (this.length = e || 0),
                (this.buffers = []),
                t.buffer && this.buffers.push(t.buffer);
            }
            function o(e) {
              if (n.alloc) return n.alloc(e);
              var t = new n(e);
              return t.fill(0), t;
            }
            (t.exports = i),
              (i.prototype.open = function(e) {
                e && r(e);
              }),
              (i.prototype.write = function(e, t, n) {
                e + t.length > this.length && (this.length = t.length + e);
                for (
                  var i = Math.floor(e / this.pageSize),
                    s = e - i * this.pageSize;
                  t.length;

                ) {
                  var a =
                      s + t.length > this.pageSize
                        ? t.slice(0, this.pageSize - s)
                        : t,
                    h = this.buffers[i];
                  if (
                    (h ||
                      ((h =
                        0 === s && a.length === this.pageSize
                          ? a
                          : o(this.pageSize)),
                      (this.buffers[i] = h)),
                    h !== a && a.copy(h, s),
                    a === t)
                  )
                    break;
                  i++, (s = 0), (t = t.slice(a.length));
                }
                n && r(n);
              }),
              (i.prototype.read = function(e, t, i) {
                if (e + t > this.length)
                  return r(i, new Error("Could not satisfy length"));
                for (
                  var o = new n(t),
                    s = 0,
                    a = Math.floor(e / this.pageSize),
                    h = e - a * this.pageSize;
                  s < o.length;

                ) {
                  var u = this.buffers[a],
                    c = this.pageSize - h;
                  u ? u.copy(o, s, h) : o.fill(0, s, Math.min(o.length, s + c)),
                    (s += c),
                    a++,
                    (h = 0);
                }
                r(i, null, o);
              }),
              (i.prototype.del = function(e, t, n) {
                var i = e % this.pageSize,
                  o = i && this.pageSize - i;
                if (o < t)
                  for (
                    var s = (e += o) + (t -= i), a = e / this.pageSize;
                    e + this.pageSize <= s && a < this.buffers.length;

                  )
                    (this.buffers[a++] = void 0), (e += this.pageSize);
                n && r(n);
              }),
              (i.prototype.close = function(e) {
                e && r(e);
              }),
              (i.prototype.destroy = function(e) {
                (this.buffers = []), e && r(e);
              }),
              (i.prototype.toBuffer = function() {
                var e =
                  1 === this.buffers.length
                    ? this.buffers[0]
                    : n.concat(this.buffers);
                return e.length === this.length ? e : e.slice(0, this.length);
              });
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169, "process-nextick-args": 102 }
      ],
      102: [
        function(e, t, n) {
          arguments[4][5][0].apply(n, arguments);
        },
        { _process: 175, dup: 5 }
      ],
      103: [
        function(e, t, n) {
          (function(n) {
            var r = e("events"),
              i = e("inherits"),
              o = g(new Error("Not readable")),
              s = g(new Error("Not writable")),
              a = g(new Error("Not deletable")),
              h = g(new Error("Not statable")),
              u = g(new Error("No readonly open"));
            function c(e) {
              if (!(this instanceof c)) return new c(e);
              r.EventEmitter.call(this),
                (this._queued = []),
                (this._pending = 0),
                (this._needsOpen = !0),
                (this.opened = !1),
                (this.closed = !1),
                (this.destroyed = !1),
                e &&
                  (e.openReadonly && (this._openReadonly = e.openReadonly),
                  e.open && (this._open = e.open),
                  e.read && (this._read = e.read),
                  e.write && (this._write = e.write),
                  e.del && (this._del = e.del),
                  e.stat && (this._stat = e.stat),
                  e.close && (this._close = e.close),
                  e.destroy && (this._destroy = e.destroy)),
                (this.preferReadonly = this._openReadonly !== u),
                (this.readable = this._read !== o),
                (this.writable = this._write !== s),
                (this.deletable = this._del !== a),
                (this.statable = this._stat !== h);
            }
            function f() {}
            function l(e, t, n, r, i, o) {
              (this.type = t),
                (this.offset = n),
                (this.data = i),
                (this.size = r),
                (this.storage = e),
                (this._sync = !1),
                (this._callback = o),
                (this._openError = null);
            }
            function d(e, t) {
              e._queued.push(t), e._pending || t._run();
            }
            function p(e) {
              e.preferReadonly &&
                ((e._needsOpen = !0), (e.preferReadonly = !1));
            }
            function g(e) {
              return function(t) {
                y(t, e);
              };
            }
            function y(e, t, r) {
              n.nextTick(A, e, t, r);
            }
            function A(e, t, n) {
              e.callback(t, n);
            }
            (t.exports = c),
              i(c, r.EventEmitter),
              (c.prototype.read = function(e, t, n) {
                this.run(new l(this, 0, e, t, null, n));
              }),
              (c.prototype._read = o),
              (c.prototype.write = function(e, t, n) {
                n || (n = f),
                  p(this),
                  this.run(new l(this, 1, e, t.length, t, n));
              }),
              (c.prototype._write = s),
              (c.prototype.del = function(e, t, n) {
                n || (n = f), p(this), this.run(new l(this, 2, e, t, null, n));
              }),
              (c.prototype._del = a),
              (c.prototype.stat = function(e) {
                this.run(new l(this, 3, 0, 0, null, e));
              }),
              (c.prototype._stat = h),
              (c.prototype.open = function(e) {
                if ((e || (e = f), this.opened && !this._needsOpen))
                  return n.nextTick(e, null);
                d(this, new l(this, 4, 0, 0, null, e));
              }),
              (c.prototype._open = g(null)),
              (c.prototype._openReadonly = u),
              (c.prototype.close = function(e) {
                if ((e || (e = f), this.closed)) return n.nextTick(e, null);
                d(this, new l(this, 5, 0, 0, null, e));
              }),
              (c.prototype._close = g(null)),
              (c.prototype.destroy = function(e) {
                e || (e = f),
                  this.closed || this.close(f),
                  d(this, new l(this, 6, 0, 0, null, e));
              }),
              (c.prototype._destroy = g(null)),
              (c.prototype.run = function(e) {
                this._needsOpen && this.open(f),
                  this._queued.length ? this._queued.push(e) : e._run();
              }),
              (l.prototype._maybeOpenError = function(e) {
                if (4 === this.type)
                  for (var t = this.storage._queued, n = 0; n < t.length; n++)
                    t[n]._openError = e;
              }),
              (l.prototype._unqueue = function(e) {
                var t = this.storage,
                  n = t._queued;
                if (e) this._maybeOpenError(e);
                else
                  switch (this.type) {
                    case 4:
                      t.opened || ((t.opened = !0), t.emit("open"));
                      break;
                    case 5:
                      t.closed || ((t.closed = !0), t.emit("close"));
                      break;
                    case 6:
                      t.destroyed || ((t.destroyed = !0), t.emit("destroy"));
                  }
                n.length && n[0] === this && n.shift(),
                  --t._pending ||
                    (function(e) {
                      var t = e._queued;
                      for (; t.length > 0; ) {
                        if ((t[0]._run(), t[0].type > 3)) return;
                        t.shift();
                      }
                    })(t);
              }),
              (l.prototype.callback = function(e, t) {
                if (this._sync) return y(this, e, t);
                this._unqueue(e), this._callback(e, t);
              }),
              (l.prototype._openAndNotClosed = function() {
                var e = this.storage;
                return (
                  !(!e.opened || e.closed) ||
                  (e.opened
                    ? e.closed && y(this, new Error("Closed"))
                    : y(this, this._openError || new Error("Not opened")),
                  !1)
                );
              }),
              (l.prototype._open = function() {
                var e = this.storage;
                return e.opened && !e._needsOpen
                  ? y(this, null)
                  : e.closed
                  ? y(this, new Error("Closed"))
                  : ((e._needsOpen = !1),
                    void (e.preferReadonly
                      ? e._openReadonly(this)
                      : e._open(this)));
              }),
              (l.prototype._run = function() {
                var e = this.storage;
                switch ((e._pending++, (this._sync = !0), this.type)) {
                  case 0:
                    this._openAndNotClosed() && e._read(this);
                    break;
                  case 1:
                    this._openAndNotClosed() && e._write(this);
                    break;
                  case 2:
                    this._openAndNotClosed() && e._del(this);
                    break;
                  case 3:
                    this._openAndNotClosed() && e._stat(this);
                    break;
                  case 4:
                    this._open();
                    break;
                  case 5:
                    e.closed || !e.opened ? y(this, null) : e._close(this);
                    break;
                  case 6:
                    e.destroyed ? y(this, null) : e._destroy(this);
                }
                this._sync = !1;
              });
          }.call(this, e("_process")));
        },
        { _process: 175, events: 170, inherits: 64 }
      ],
      104: [
        function(e, t, n) {
          const r = "undefined" != typeof window ? window : self,
            i = r.requestFileSystem || r.webkitRequestFileSystem,
            o = r.IDBMutableFile,
            s = r.indexedDB;
          let a = () => e("random-access-memory");
          i
            ? (a = t => {
                const n = e("random-access-chrome-file");
                return (
                  "object" == typeof t &&
                    t.maxSize &&
                    (n.DEFAULT_MAX_SIZE = t.maxSize),
                  n
                );
              })
            : o
            ? (a = (t = {}) => (
                "string" == typeof t && (t = { name: t }),
                e("./mutable-file-wrapper.js")(t)
              ))
            : s &&
              (a = (t = {}) => {
                "string" == typeof t && (t = { name: t });
                const n = t.name || "random-access-web";
                return e("random-access-idb")(n, t);
              }),
            (t.exports = a);
        },
        {
          "./mutable-file-wrapper.js": 105,
          "random-access-chrome-file": 93,
          "random-access-idb": 98,
          "random-access-memory": 106
        }
      ],
      105: [
        function(e, t, n) {
          t.exports = function(t) {
            const n = e("random-access-storage"),
              r = e("random-access-idb-mutable-file");
            let i = null,
              o = null;
            return e => {
              let s = null;
              return n({
                open: function(n) {
                  i ||
                    o ||
                    (o = r.mount(t).then(e => {
                      (i = e), (o = null);
                    })),
                    o
                      ? o.then(
                          () => {
                            this._open(n);
                          },
                          e => {
                            n.callback(e);
                          }
                        )
                      : ((s = i(e)), n.callback());
                },
                write: function(e) {
                  s.write(e.offset, e.data, function(t, n) {
                    e.callback(t, n);
                  });
                },
                read: function(e) {
                  s.read(e.offset, e.size, function(t, n) {
                    e.callback(t, n);
                  });
                },
                del: function(e) {
                  s.del(e.offset, e.size, function(t, n) {
                    e.callback(t, n);
                  });
                },
                stat: function(e) {
                  s.stat(function(t, n) {
                    e.callback(t, n);
                  });
                },
                close: function(e) {
                  s.close(function(t, n) {
                    e.callback(t, n);
                  });
                },
                destroy: function(e) {
                  s.destroy(function(t, n) {
                    e.callback(t, n);
                  });
                }
              });
            };
          };
        },
        { "random-access-idb-mutable-file": 96, "random-access-storage": 103 }
      ],
      106: [
        function(e, t, n) {
          (function(n, r) {
            const i = e("random-access-storage"),
              o = e("is-options"),
              s = e("inherits"),
              a = 1048576;
            function h(e) {
              if (!(this instanceof h)) return new h(e);
              "number" == typeof e && (e = { length: e }),
                e || (e = {}),
                i.call(this),
                r.isBuffer(e) && (e = { length: e.length, buffer: e }),
                o(e) || (e = {}),
                (this.length = e.length || 0),
                (this.pageSize = e.length || e.pageSize || a),
                (this.buffers = []),
                e.buffer && this.buffers.push(e.buffer);
            }
            function u(e, t, r) {
              n.nextTick(c, e, t, r);
            }
            function c(e, t, n) {
              e.callback(t, n);
            }
            (t.exports = h),
              s(h, i),
              (h.prototype._stat = function(e) {
                u(e, null, { size: this.length });
              }),
              (h.prototype._write = function(e) {
                var t = Math.floor(e.offset / this.pageSize),
                  n = e.offset - t * this.pageSize,
                  r = 0;
                const i = e.offset + e.size;
                for (i > this.length && (this.length = i); r < e.size; ) {
                  const i = this._page(t++, !0),
                    o = this.pageSize - n,
                    s = o < e.size - r ? r + o : e.size;
                  e.data.copy(i, n, r, s), (r = s), (n = 0);
                }
                u(e, null, null);
              }),
              (h.prototype._read = function(e) {
                var t = Math.floor(e.offset / this.pageSize),
                  n = e.offset - t * this.pageSize,
                  i = 0;
                if (e.offset + e.size > this.length)
                  return u(e, new Error("Could not satisfy length"), null);
                const o = r.alloc(e.size);
                for (; i < e.size; ) {
                  const r = this._page(t++, !1),
                    s = this.pageSize - n,
                    a = e.size - i,
                    h = s < a ? s : a;
                  r && r.copy(o, i, n, n + h), (i += h), (n = 0);
                }
                u(e, null, o);
              }),
              (h.prototype._del = function(e) {
                var t = Math.floor(e.offset / this.pageSize),
                  n = e.offset - t * this.pageSize,
                  r = 0;
                for (
                  e.offset + e.size > this.length &&
                  (e.size = Math.max(0, this.length - e.offset));
                  r < e.size;

                )
                  0 === n &&
                    e.size - r >= this.pageSize &&
                    (this.buffers[t++] = void 0),
                    (n = 0),
                    (r += this.pageSize - n);
                e.offset + e.size >= this.length && (this.length = e.offset),
                  u(e, null, null);
              }),
              (h.prototype._destroy = function(e) {
                (this._buffers = []), (this.length = 0), u(e, null, null);
              }),
              (h.prototype._page = function(e, t) {
                var n = this.buffers[e];
                return n || !t
                  ? n
                  : (n = this.buffers[e] = r.alloc(this.pageSize));
              }),
              (h.prototype.toBuffer = function() {
                const e = r.alloc(this.length);
                for (var t = 0; t < this.buffers.length; t++)
                  this.buffers[t] && this.buffers[t].copy(e, t * this.pageSize);
                return e;
              });
          }.call(this, e("_process"), e("buffer").Buffer));
        },
        {
          _process: 175,
          buffer: 169,
          inherits: 64,
          "is-options": 66,
          "random-access-storage": 103
        }
      ],
      107: [
        function(e, t, n) {
          (function(n, r) {
            "use strict";
            var i = 65536,
              o = 4294967295;
            var s = e("safe-buffer").Buffer,
              a = r.crypto || r.msCrypto;
            a && a.getRandomValues
              ? (t.exports = function(e, t) {
                  if (e > o)
                    throw new RangeError("requested too many random bytes");
                  var r = s.allocUnsafe(e);
                  if (e > 0)
                    if (e > i)
                      for (var h = 0; h < e; h += i)
                        a.getRandomValues(r.slice(h, h + i));
                    else a.getRandomValues(r);
                  if ("function" == typeof t)
                    return n.nextTick(function() {
                      t(null, r);
                    });
                  return r;
                })
              : (t.exports = function() {
                  throw new Error(
                    "Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11"
                  );
                });
          }.call(
            this,
            e("_process"),
            "undefined" != typeof global
              ? global
              : "undefined" != typeof self
              ? self
              : "undefined" != typeof window
              ? window
              : {}
          ));
        },
        { _process: 175, "safe-buffer": 120 }
      ],
      108: [
        function(e, t, n) {
          "use strict";
          var r = e("process-nextick-args"),
            i =
              Object.keys ||
              function(e) {
                var t = [];
                for (var n in e) t.push(n);
                return t;
              };
          t.exports = f;
          var o = e("core-util-is");
          o.inherits = e("inherits");
          var s = e("./_stream_readable"),
            a = e("./_stream_writable");
          o.inherits(f, s);
          for (var h = i(a.prototype), u = 0; u < h.length; u++) {
            var c = h[u];
            f.prototype[c] || (f.prototype[c] = a.prototype[c]);
          }
          function f(e) {
            if (!(this instanceof f)) return new f(e);
            s.call(this, e),
              a.call(this, e),
              e && !1 === e.readable && (this.readable = !1),
              e && !1 === e.writable && (this.writable = !1),
              (this.allowHalfOpen = !0),
              e && !1 === e.allowHalfOpen && (this.allowHalfOpen = !1),
              this.once("end", l);
          }
          function l() {
            this.allowHalfOpen ||
              this._writableState.ended ||
              r.nextTick(d, this);
          }
          function d(e) {
            e.end();
          }
          Object.defineProperty(f.prototype, "writableHighWaterMark", {
            enumerable: !1,
            get: function() {
              return this._writableState.highWaterMark;
            }
          }),
            Object.defineProperty(f.prototype, "destroyed", {
              get: function() {
                return (
                  void 0 !== this._readableState &&
                  void 0 !== this._writableState &&
                  (this._readableState.destroyed &&
                    this._writableState.destroyed)
                );
              },
              set: function(e) {
                void 0 !== this._readableState &&
                  void 0 !== this._writableState &&
                  ((this._readableState.destroyed = e),
                  (this._writableState.destroyed = e));
              }
            }),
            (f.prototype._destroy = function(e, t) {
              this.push(null), this.end(), r.nextTick(t, e);
            });
        },
        {
          "./_stream_readable": 110,
          "./_stream_writable": 112,
          "core-util-is": 27,
          inherits: 64,
          "process-nextick-args": 86
        }
      ],
      109: [
        function(e, t, n) {
          "use strict";
          t.exports = o;
          var r = e("./_stream_transform"),
            i = e("core-util-is");
          function o(e) {
            if (!(this instanceof o)) return new o(e);
            r.call(this, e);
          }
          (i.inherits = e("inherits")),
            i.inherits(o, r),
            (o.prototype._transform = function(e, t, n) {
              n(null, e);
            });
        },
        { "./_stream_transform": 111, "core-util-is": 27, inherits: 64 }
      ],
      110: [
        function(e, t, n) {
          (function(n, r) {
            "use strict";
            var i = e("process-nextick-args");
            t.exports = _;
            var o,
              s = e("isarray");
            _.ReadableState = b;
            e("events").EventEmitter;
            var a = function(e, t) {
                return e.listeners(t).length;
              },
              h = e("./internal/streams/stream"),
              u = e("safe-buffer").Buffer,
              c = r.Uint8Array || function() {};
            var f = e("core-util-is");
            f.inherits = e("inherits");
            var l = e("util"),
              d = void 0;
            d = l && l.debuglog ? l.debuglog("stream") : function() {};
            var p,
              g = e("./internal/streams/BufferList"),
              y = e("./internal/streams/destroy");
            f.inherits(_, h);
            var A = ["error", "close", "destroy", "pause", "resume"];
            function b(t, n) {
              t = t || {};
              var r = n instanceof (o = o || e("./_stream_duplex"));
              (this.objectMode = !!t.objectMode),
                r &&
                  (this.objectMode = this.objectMode || !!t.readableObjectMode);
              var i = t.highWaterMark,
                s = t.readableHighWaterMark,
                a = this.objectMode ? 16 : 16384;
              (this.highWaterMark =
                i || 0 === i ? i : r && (s || 0 === s) ? s : a),
                (this.highWaterMark = Math.floor(this.highWaterMark)),
                (this.buffer = new g()),
                (this.length = 0),
                (this.pipes = null),
                (this.pipesCount = 0),
                (this.flowing = null),
                (this.ended = !1),
                (this.endEmitted = !1),
                (this.reading = !1),
                (this.sync = !0),
                (this.needReadable = !1),
                (this.emittedReadable = !1),
                (this.readableListening = !1),
                (this.resumeScheduled = !1),
                (this.destroyed = !1),
                (this.defaultEncoding = t.defaultEncoding || "utf8"),
                (this.awaitDrain = 0),
                (this.readingMore = !1),
                (this.decoder = null),
                (this.encoding = null),
                t.encoding &&
                  (p || (p = e("string_decoder/").StringDecoder),
                  (this.decoder = new p(t.encoding)),
                  (this.encoding = t.encoding));
            }
            function _(t) {
              if (((o = o || e("./_stream_duplex")), !(this instanceof _)))
                return new _(t);
              (this._readableState = new b(t, this)),
                (this.readable = !0),
                t &&
                  ("function" == typeof t.read && (this._read = t.read),
                  "function" == typeof t.destroy &&
                    (this._destroy = t.destroy)),
                h.call(this);
            }
            function v(e, t, n, r, i) {
              var o,
                s = e._readableState;
              null === t
                ? ((s.reading = !1),
                  (function(e, t) {
                    if (t.ended) return;
                    if (t.decoder) {
                      var n = t.decoder.end();
                      n &&
                        n.length &&
                        (t.buffer.push(n),
                        (t.length += t.objectMode ? 1 : n.length));
                    }
                    (t.ended = !0), E(e);
                  })(e, s))
                : (i ||
                    (o = (function(e, t) {
                      var n;
                      (r = t),
                        u.isBuffer(r) ||
                          r instanceof c ||
                          "string" == typeof t ||
                          void 0 === t ||
                          e.objectMode ||
                          (n = new TypeError(
                            "Invalid non-string/buffer chunk"
                          ));
                      var r;
                      return n;
                    })(s, t)),
                  o
                    ? e.emit("error", o)
                    : s.objectMode || (t && t.length > 0)
                    ? ("string" == typeof t ||
                        s.objectMode ||
                        Object.getPrototypeOf(t) === u.prototype ||
                        (t = (function(e) {
                          return u.from(e);
                        })(t)),
                      r
                        ? s.endEmitted
                          ? e.emit(
                              "error",
                              new Error("stream.unshift() after end event")
                            )
                          : w(e, s, t, !0)
                        : s.ended
                        ? e.emit("error", new Error("stream.push() after EOF"))
                        : ((s.reading = !1),
                          s.decoder && !n
                            ? ((t = s.decoder.write(t)),
                              s.objectMode || 0 !== t.length
                                ? w(e, s, t, !1)
                                : B(e, s))
                            : w(e, s, t, !1)))
                    : r || (s.reading = !1));
              return (function(e) {
                return (
                  !e.ended &&
                  (e.needReadable ||
                    e.length < e.highWaterMark ||
                    0 === e.length)
                );
              })(s);
            }
            function w(e, t, n, r) {
              t.flowing && 0 === t.length && !t.sync
                ? (e.emit("data", n), e.read(0))
                : ((t.length += t.objectMode ? 1 : n.length),
                  r ? t.buffer.unshift(n) : t.buffer.push(n),
                  t.needReadable && E(e)),
                B(e, t);
            }
            Object.defineProperty(_.prototype, "destroyed", {
              get: function() {
                return (
                  void 0 !== this._readableState &&
                  this._readableState.destroyed
                );
              },
              set: function(e) {
                this._readableState && (this._readableState.destroyed = e);
              }
            }),
              (_.prototype.destroy = y.destroy),
              (_.prototype._undestroy = y.undestroy),
              (_.prototype._destroy = function(e, t) {
                this.push(null), t(e);
              }),
              (_.prototype.push = function(e, t) {
                var n,
                  r = this._readableState;
                return (
                  r.objectMode
                    ? (n = !0)
                    : "string" == typeof e &&
                      ((t = t || r.defaultEncoding) !== r.encoding &&
                        ((e = u.from(e, t)), (t = "")),
                      (n = !0)),
                  v(this, e, t, !1, n)
                );
              }),
              (_.prototype.unshift = function(e) {
                return v(this, e, null, !0, !1);
              }),
              (_.prototype.isPaused = function() {
                return !1 === this._readableState.flowing;
              }),
              (_.prototype.setEncoding = function(t) {
                return (
                  p || (p = e("string_decoder/").StringDecoder),
                  (this._readableState.decoder = new p(t)),
                  (this._readableState.encoding = t),
                  this
                );
              });
            var m = 8388608;
            function I(e, t) {
              return e <= 0 || (0 === t.length && t.ended)
                ? 0
                : t.objectMode
                ? 1
                : e != e
                ? t.flowing && t.length
                  ? t.buffer.head.data.length
                  : t.length
                : (e > t.highWaterMark &&
                    (t.highWaterMark = (function(e) {
                      return (
                        e >= m
                          ? (e = m)
                          : (e--,
                            (e |= e >>> 1),
                            (e |= e >>> 2),
                            (e |= e >>> 4),
                            (e |= e >>> 8),
                            (e |= e >>> 16),
                            e++),
                        e
                      );
                    })(e)),
                  e <= t.length
                    ? e
                    : t.ended
                    ? t.length
                    : ((t.needReadable = !0), 0));
            }
            function E(e) {
              var t = e._readableState;
              (t.needReadable = !1),
                t.emittedReadable ||
                  (d("emitReadable", t.flowing),
                  (t.emittedReadable = !0),
                  t.sync ? i.nextTick(C, e) : C(e));
            }
            function C(e) {
              d("emit readable"), e.emit("readable"), Q(e);
            }
            function B(e, t) {
              t.readingMore || ((t.readingMore = !0), i.nextTick(x, e, t));
            }
            function x(e, t) {
              for (
                var n = t.length;
                !t.reading &&
                !t.flowing &&
                !t.ended &&
                t.length < t.highWaterMark &&
                (d("maybeReadMore read 0"), e.read(0), n !== t.length);

              )
                n = t.length;
              t.readingMore = !1;
            }
            function k(e) {
              d("readable nexttick read 0"), e.read(0);
            }
            function S(e, t) {
              t.reading || (d("resume read 0"), e.read(0)),
                (t.resumeScheduled = !1),
                (t.awaitDrain = 0),
                e.emit("resume"),
                Q(e),
                t.flowing && !t.reading && e.read(0);
            }
            function Q(e) {
              var t = e._readableState;
              for (d("flow", t.flowing); t.flowing && null !== e.read(); );
            }
            function D(e, t) {
              return 0 === t.length
                ? null
                : (t.objectMode
                    ? (n = t.buffer.shift())
                    : !e || e >= t.length
                    ? ((n = t.decoder
                        ? t.buffer.join("")
                        : 1 === t.buffer.length
                        ? t.buffer.head.data
                        : t.buffer.concat(t.length)),
                      t.buffer.clear())
                    : (n = (function(e, t, n) {
                        var r;
                        e < t.head.data.length
                          ? ((r = t.head.data.slice(0, e)),
                            (t.head.data = t.head.data.slice(e)))
                          : (r =
                              e === t.head.data.length
                                ? t.shift()
                                : n
                                ? (function(e, t) {
                                    var n = t.head,
                                      r = 1,
                                      i = n.data;
                                    e -= i.length;
                                    for (; (n = n.next); ) {
                                      var o = n.data,
                                        s = e > o.length ? o.length : e;
                                      if (
                                        (s === o.length
                                          ? (i += o)
                                          : (i += o.slice(0, e)),
                                        0 === (e -= s))
                                      ) {
                                        s === o.length
                                          ? (++r,
                                            n.next
                                              ? (t.head = n.next)
                                              : (t.head = t.tail = null))
                                          : ((t.head = n),
                                            (n.data = o.slice(s)));
                                        break;
                                      }
                                      ++r;
                                    }
                                    return (t.length -= r), i;
                                  })(e, t)
                                : (function(e, t) {
                                    var n = u.allocUnsafe(e),
                                      r = t.head,
                                      i = 1;
                                    r.data.copy(n), (e -= r.data.length);
                                    for (; (r = r.next); ) {
                                      var o = r.data,
                                        s = e > o.length ? o.length : e;
                                      if (
                                        (o.copy(n, n.length - e, 0, s),
                                        0 === (e -= s))
                                      ) {
                                        s === o.length
                                          ? (++i,
                                            r.next
                                              ? (t.head = r.next)
                                              : (t.head = t.tail = null))
                                          : ((t.head = r),
                                            (r.data = o.slice(s)));
                                        break;
                                      }
                                      ++i;
                                    }
                                    return (t.length -= i), n;
                                  })(e, t));
                        return r;
                      })(e, t.buffer, t.decoder)),
                  n);
              var n;
            }
            function M(e) {
              var t = e._readableState;
              if (t.length > 0)
                throw new Error('"endReadable()" called on non-empty stream');
              t.endEmitted || ((t.ended = !0), i.nextTick(U, t, e));
            }
            function U(e, t) {
              e.endEmitted ||
                0 !== e.length ||
                ((e.endEmitted = !0), (t.readable = !1), t.emit("end"));
            }
            function L(e, t) {
              for (var n = 0, r = e.length; n < r; n++)
                if (e[n] === t) return n;
              return -1;
            }
            (_.prototype.read = function(e) {
              d("read", e), (e = parseInt(e, 10));
              var t = this._readableState,
                n = e;
              if (
                (0 !== e && (t.emittedReadable = !1),
                0 === e &&
                  t.needReadable &&
                  (t.length >= t.highWaterMark || t.ended))
              )
                return (
                  d("read: emitReadable", t.length, t.ended),
                  0 === t.length && t.ended ? M(this) : E(this),
                  null
                );
              if (0 === (e = I(e, t)) && t.ended)
                return 0 === t.length && M(this), null;
              var r,
                i = t.needReadable;
              return (
                d("need readable", i),
                (0 === t.length || t.length - e < t.highWaterMark) &&
                  d("length less than watermark", (i = !0)),
                t.ended || t.reading
                  ? d("reading or ended", (i = !1))
                  : i &&
                    (d("do read"),
                    (t.reading = !0),
                    (t.sync = !0),
                    0 === t.length && (t.needReadable = !0),
                    this._read(t.highWaterMark),
                    (t.sync = !1),
                    t.reading || (e = I(n, t))),
                null === (r = e > 0 ? D(e, t) : null)
                  ? ((t.needReadable = !0), (e = 0))
                  : (t.length -= e),
                0 === t.length &&
                  (t.ended || (t.needReadable = !0),
                  n !== e && t.ended && M(this)),
                null !== r && this.emit("data", r),
                r
              );
            }),
              (_.prototype._read = function(e) {
                this.emit("error", new Error("_read() is not implemented"));
              }),
              (_.prototype.pipe = function(e, t) {
                var r = this,
                  o = this._readableState;
                switch (o.pipesCount) {
                  case 0:
                    o.pipes = e;
                    break;
                  case 1:
                    o.pipes = [o.pipes, e];
                    break;
                  default:
                    o.pipes.push(e);
                }
                (o.pipesCount += 1),
                  d("pipe count=%d opts=%j", o.pipesCount, t);
                var h =
                  (!t || !1 !== t.end) && e !== n.stdout && e !== n.stderr
                    ? c
                    : _;
                function u(t, n) {
                  d("onunpipe"),
                    t === r &&
                      n &&
                      !1 === n.hasUnpiped &&
                      ((n.hasUnpiped = !0),
                      d("cleanup"),
                      e.removeListener("close", A),
                      e.removeListener("finish", b),
                      e.removeListener("drain", f),
                      e.removeListener("error", y),
                      e.removeListener("unpipe", u),
                      r.removeListener("end", c),
                      r.removeListener("end", _),
                      r.removeListener("data", g),
                      (l = !0),
                      !o.awaitDrain ||
                        (e._writableState && !e._writableState.needDrain) ||
                        f());
                }
                function c() {
                  d("onend"), e.end();
                }
                o.endEmitted ? i.nextTick(h) : r.once("end", h),
                  e.on("unpipe", u);
                var f = (function(e) {
                  return function() {
                    var t = e._readableState;
                    d("pipeOnDrain", t.awaitDrain),
                      t.awaitDrain && t.awaitDrain--,
                      0 === t.awaitDrain &&
                        a(e, "data") &&
                        ((t.flowing = !0), Q(e));
                  };
                })(r);
                e.on("drain", f);
                var l = !1;
                var p = !1;
                function g(t) {
                  d("ondata"),
                    (p = !1),
                    !1 !== e.write(t) ||
                      p ||
                      (((1 === o.pipesCount && o.pipes === e) ||
                        (o.pipesCount > 1 && -1 !== L(o.pipes, e))) &&
                        !l &&
                        (d(
                          "false write response, pause",
                          r._readableState.awaitDrain
                        ),
                        r._readableState.awaitDrain++,
                        (p = !0)),
                      r.pause());
                }
                function y(t) {
                  d("onerror", t),
                    _(),
                    e.removeListener("error", y),
                    0 === a(e, "error") && e.emit("error", t);
                }
                function A() {
                  e.removeListener("finish", b), _();
                }
                function b() {
                  d("onfinish"), e.removeListener("close", A), _();
                }
                function _() {
                  d("unpipe"), r.unpipe(e);
                }
                return (
                  r.on("data", g),
                  (function(e, t, n) {
                    if ("function" == typeof e.prependListener)
                      return e.prependListener(t, n);
                    e._events && e._events[t]
                      ? s(e._events[t])
                        ? e._events[t].unshift(n)
                        : (e._events[t] = [n, e._events[t]])
                      : e.on(t, n);
                  })(e, "error", y),
                  e.once("close", A),
                  e.once("finish", b),
                  e.emit("pipe", r),
                  o.flowing || (d("pipe resume"), r.resume()),
                  e
                );
              }),
              (_.prototype.unpipe = function(e) {
                var t = this._readableState,
                  n = { hasUnpiped: !1 };
                if (0 === t.pipesCount) return this;
                if (1 === t.pipesCount)
                  return e && e !== t.pipes
                    ? this
                    : (e || (e = t.pipes),
                      (t.pipes = null),
                      (t.pipesCount = 0),
                      (t.flowing = !1),
                      e && e.emit("unpipe", this, n),
                      this);
                if (!e) {
                  var r = t.pipes,
                    i = t.pipesCount;
                  (t.pipes = null), (t.pipesCount = 0), (t.flowing = !1);
                  for (var o = 0; o < i; o++) r[o].emit("unpipe", this, n);
                  return this;
                }
                var s = L(t.pipes, e);
                return -1 === s
                  ? this
                  : (t.pipes.splice(s, 1),
                    (t.pipesCount -= 1),
                    1 === t.pipesCount && (t.pipes = t.pipes[0]),
                    e.emit("unpipe", this, n),
                    this);
              }),
              (_.prototype.on = function(e, t) {
                var n = h.prototype.on.call(this, e, t);
                if ("data" === e)
                  !1 !== this._readableState.flowing && this.resume();
                else if ("readable" === e) {
                  var r = this._readableState;
                  r.endEmitted ||
                    r.readableListening ||
                    ((r.readableListening = r.needReadable = !0),
                    (r.emittedReadable = !1),
                    r.reading ? r.length && E(this) : i.nextTick(k, this));
                }
                return n;
              }),
              (_.prototype.addListener = _.prototype.on),
              (_.prototype.resume = function() {
                var e = this._readableState;
                return (
                  e.flowing ||
                    (d("resume"),
                    (e.flowing = !0),
                    (function(e, t) {
                      t.resumeScheduled ||
                        ((t.resumeScheduled = !0), i.nextTick(S, e, t));
                    })(this, e)),
                  this
                );
              }),
              (_.prototype.pause = function() {
                return (
                  d("call pause flowing=%j", this._readableState.flowing),
                  !1 !== this._readableState.flowing &&
                    (d("pause"),
                    (this._readableState.flowing = !1),
                    this.emit("pause")),
                  this
                );
              }),
              (_.prototype.wrap = function(e) {
                var t = this,
                  n = this._readableState,
                  r = !1;
                for (var i in (e.on("end", function() {
                  if ((d("wrapped end"), n.decoder && !n.ended)) {
                    var e = n.decoder.end();
                    e && e.length && t.push(e);
                  }
                  t.push(null);
                }),
                e.on("data", function(i) {
                  (d("wrapped data"),
                  n.decoder && (i = n.decoder.write(i)),
                  n.objectMode && null == i) ||
                    ((n.objectMode || (i && i.length)) &&
                      (t.push(i) || ((r = !0), e.pause())));
                }),
                e))
                  void 0 === this[i] &&
                    "function" == typeof e[i] &&
                    (this[i] = (function(t) {
                      return function() {
                        return e[t].apply(e, arguments);
                      };
                    })(i));
                for (var o = 0; o < A.length; o++)
                  e.on(A[o], this.emit.bind(this, A[o]));
                return (
                  (this._read = function(t) {
                    d("wrapped _read", t), r && ((r = !1), e.resume());
                  }),
                  this
                );
              }),
              Object.defineProperty(_.prototype, "readableHighWaterMark", {
                enumerable: !1,
                get: function() {
                  return this._readableState.highWaterMark;
                }
              }),
              (_._fromList = D);
          }.call(
            this,
            e("_process"),
            "undefined" != typeof global
              ? global
              : "undefined" != typeof self
              ? self
              : "undefined" != typeof window
              ? window
              : {}
          ));
        },
        {
          "./_stream_duplex": 108,
          "./internal/streams/BufferList": 113,
          "./internal/streams/destroy": 114,
          "./internal/streams/stream": 115,
          _process: 175,
          "core-util-is": 27,
          events: 170,
          inherits: 64,
          isarray: 67,
          "process-nextick-args": 86,
          "safe-buffer": 116,
          "string_decoder/": 146,
          util: 168
        }
      ],
      111: [
        function(e, t, n) {
          "use strict";
          t.exports = s;
          var r = e("./_stream_duplex"),
            i = e("core-util-is");
          function o(e, t) {
            var n = this._transformState;
            n.transforming = !1;
            var r = n.writecb;
            if (!r)
              return this.emit(
                "error",
                new Error("write callback called multiple times")
              );
            (n.writechunk = null),
              (n.writecb = null),
              null != t && this.push(t),
              r(e);
            var i = this._readableState;
            (i.reading = !1),
              (i.needReadable || i.length < i.highWaterMark) &&
                this._read(i.highWaterMark);
          }
          function s(e) {
            if (!(this instanceof s)) return new s(e);
            r.call(this, e),
              (this._transformState = {
                afterTransform: o.bind(this),
                needTransform: !1,
                transforming: !1,
                writecb: null,
                writechunk: null,
                writeencoding: null
              }),
              (this._readableState.needReadable = !0),
              (this._readableState.sync = !1),
              e &&
                ("function" == typeof e.transform &&
                  (this._transform = e.transform),
                "function" == typeof e.flush && (this._flush = e.flush)),
              this.on("prefinish", a);
          }
          function a() {
            var e = this;
            "function" == typeof this._flush
              ? this._flush(function(t, n) {
                  h(e, t, n);
                })
              : h(this, null, null);
          }
          function h(e, t, n) {
            if (t) return e.emit("error", t);
            if ((null != n && e.push(n), e._writableState.length))
              throw new Error("Calling transform done when ws.length != 0");
            if (e._transformState.transforming)
              throw new Error("Calling transform done when still transforming");
            return e.push(null);
          }
          (i.inherits = e("inherits")),
            i.inherits(s, r),
            (s.prototype.push = function(e, t) {
              return (
                (this._transformState.needTransform = !1),
                r.prototype.push.call(this, e, t)
              );
            }),
            (s.prototype._transform = function(e, t, n) {
              throw new Error("_transform() is not implemented");
            }),
            (s.prototype._write = function(e, t, n) {
              var r = this._transformState;
              if (
                ((r.writecb = n),
                (r.writechunk = e),
                (r.writeencoding = t),
                !r.transforming)
              ) {
                var i = this._readableState;
                (r.needTransform ||
                  i.needReadable ||
                  i.length < i.highWaterMark) &&
                  this._read(i.highWaterMark);
              }
            }),
            (s.prototype._read = function(e) {
              var t = this._transformState;
              null !== t.writechunk && t.writecb && !t.transforming
                ? ((t.transforming = !0),
                  this._transform(
                    t.writechunk,
                    t.writeencoding,
                    t.afterTransform
                  ))
                : (t.needTransform = !0);
            }),
            (s.prototype._destroy = function(e, t) {
              var n = this;
              r.prototype._destroy.call(this, e, function(e) {
                t(e), n.emit("close");
              });
            });
        },
        { "./_stream_duplex": 108, "core-util-is": 27, inherits: 64 }
      ],
      112: [
        function(e, t, n) {
          (function(n, r, i) {
            "use strict";
            var o = e("process-nextick-args");
            function s(e) {
              var t = this;
              (this.next = null),
                (this.entry = null),
                (this.finish = function() {
                  !(function(e, t, n) {
                    var r = e.entry;
                    e.entry = null;
                    for (; r; ) {
                      var i = r.callback;
                      t.pendingcb--, i(n), (r = r.next);
                    }
                    t.corkedRequestsFree
                      ? (t.corkedRequestsFree.next = e)
                      : (t.corkedRequestsFree = e);
                  })(t, e);
                });
            }
            t.exports = b;
            var a,
              h =
                !n.browser &&
                ["v0.10", "v0.9."].indexOf(n.version.slice(0, 5)) > -1
                  ? i
                  : o.nextTick;
            b.WritableState = A;
            var u = e("core-util-is");
            u.inherits = e("inherits");
            var c = { deprecate: e("util-deprecate") },
              f = e("./internal/streams/stream"),
              l = e("safe-buffer").Buffer,
              d = r.Uint8Array || function() {};
            var p,
              g = e("./internal/streams/destroy");
            function y() {}
            function A(t, n) {
              (a = a || e("./_stream_duplex")), (t = t || {});
              var r = n instanceof a;
              (this.objectMode = !!t.objectMode),
                r &&
                  (this.objectMode = this.objectMode || !!t.writableObjectMode);
              var i = t.highWaterMark,
                u = t.writableHighWaterMark,
                c = this.objectMode ? 16 : 16384;
              (this.highWaterMark =
                i || 0 === i ? i : r && (u || 0 === u) ? u : c),
                (this.highWaterMark = Math.floor(this.highWaterMark)),
                (this.finalCalled = !1),
                (this.needDrain = !1),
                (this.ending = !1),
                (this.ended = !1),
                (this.finished = !1),
                (this.destroyed = !1);
              var f = !1 === t.decodeStrings;
              (this.decodeStrings = !f),
                (this.defaultEncoding = t.defaultEncoding || "utf8"),
                (this.length = 0),
                (this.writing = !1),
                (this.corked = 0),
                (this.sync = !0),
                (this.bufferProcessing = !1),
                (this.onwrite = function(e) {
                  !(function(e, t) {
                    var n = e._writableState,
                      r = n.sync,
                      i = n.writecb;
                    if (
                      ((function(e) {
                        (e.writing = !1),
                          (e.writecb = null),
                          (e.length -= e.writelen),
                          (e.writelen = 0);
                      })(n),
                      t)
                    )
                      !(function(e, t, n, r, i) {
                        --t.pendingcb,
                          n
                            ? (o.nextTick(i, r),
                              o.nextTick(E, e, t),
                              (e._writableState.errorEmitted = !0),
                              e.emit("error", r))
                            : (i(r),
                              (e._writableState.errorEmitted = !0),
                              e.emit("error", r),
                              E(e, t));
                      })(e, n, r, t, i);
                    else {
                      var s = m(n);
                      s ||
                        n.corked ||
                        n.bufferProcessing ||
                        !n.bufferedRequest ||
                        w(e, n),
                        r ? h(v, e, n, s, i) : v(e, n, s, i);
                    }
                  })(n, e);
                }),
                (this.writecb = null),
                (this.writelen = 0),
                (this.bufferedRequest = null),
                (this.lastBufferedRequest = null),
                (this.pendingcb = 0),
                (this.prefinished = !1),
                (this.errorEmitted = !1),
                (this.bufferedRequestCount = 0),
                (this.corkedRequestsFree = new s(this));
            }
            function b(t) {
              if (
                ((a = a || e("./_stream_duplex")),
                !(p.call(b, this) || this instanceof a))
              )
                return new b(t);
              (this._writableState = new A(t, this)),
                (this.writable = !0),
                t &&
                  ("function" == typeof t.write && (this._write = t.write),
                  "function" == typeof t.writev && (this._writev = t.writev),
                  "function" == typeof t.destroy && (this._destroy = t.destroy),
                  "function" == typeof t.final && (this._final = t.final)),
                f.call(this);
            }
            function _(e, t, n, r, i, o, s) {
              (t.writelen = r),
                (t.writecb = s),
                (t.writing = !0),
                (t.sync = !0),
                n ? e._writev(i, t.onwrite) : e._write(i, o, t.onwrite),
                (t.sync = !1);
            }
            function v(e, t, n, r) {
              n ||
                (function(e, t) {
                  0 === t.length &&
                    t.needDrain &&
                    ((t.needDrain = !1), e.emit("drain"));
                })(e, t),
                t.pendingcb--,
                r(),
                E(e, t);
            }
            function w(e, t) {
              t.bufferProcessing = !0;
              var n = t.bufferedRequest;
              if (e._writev && n && n.next) {
                var r = t.bufferedRequestCount,
                  i = new Array(r),
                  o = t.corkedRequestsFree;
                o.entry = n;
                for (var a = 0, h = !0; n; )
                  (i[a] = n), n.isBuf || (h = !1), (n = n.next), (a += 1);
                (i.allBuffers = h),
                  _(e, t, !0, t.length, i, "", o.finish),
                  t.pendingcb++,
                  (t.lastBufferedRequest = null),
                  o.next
                    ? ((t.corkedRequestsFree = o.next), (o.next = null))
                    : (t.corkedRequestsFree = new s(t)),
                  (t.bufferedRequestCount = 0);
              } else {
                for (; n; ) {
                  var u = n.chunk,
                    c = n.encoding,
                    f = n.callback;
                  if (
                    (_(e, t, !1, t.objectMode ? 1 : u.length, u, c, f),
                    (n = n.next),
                    t.bufferedRequestCount--,
                    t.writing)
                  )
                    break;
                }
                null === n && (t.lastBufferedRequest = null);
              }
              (t.bufferedRequest = n), (t.bufferProcessing = !1);
            }
            function m(e) {
              return (
                e.ending &&
                0 === e.length &&
                null === e.bufferedRequest &&
                !e.finished &&
                !e.writing
              );
            }
            function I(e, t) {
              e._final(function(n) {
                t.pendingcb--,
                  n && e.emit("error", n),
                  (t.prefinished = !0),
                  e.emit("prefinish"),
                  E(e, t);
              });
            }
            function E(e, t) {
              var n = m(t);
              return (
                n &&
                  (!(function(e, t) {
                    t.prefinished ||
                      t.finalCalled ||
                      ("function" == typeof e._final
                        ? (t.pendingcb++,
                          (t.finalCalled = !0),
                          o.nextTick(I, e, t))
                        : ((t.prefinished = !0), e.emit("prefinish")));
                  })(e, t),
                  0 === t.pendingcb && ((t.finished = !0), e.emit("finish"))),
                n
              );
            }
            u.inherits(b, f),
              (A.prototype.getBuffer = function() {
                for (var e = this.bufferedRequest, t = []; e; )
                  t.push(e), (e = e.next);
                return t;
              }),
              (function() {
                try {
                  Object.defineProperty(A.prototype, "buffer", {
                    get: c.deprecate(
                      function() {
                        return this.getBuffer();
                      },
                      "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.",
                      "DEP0003"
                    )
                  });
                } catch (e) {}
              })(),
              "function" == typeof Symbol &&
              Symbol.hasInstance &&
              "function" == typeof Function.prototype[Symbol.hasInstance]
                ? ((p = Function.prototype[Symbol.hasInstance]),
                  Object.defineProperty(b, Symbol.hasInstance, {
                    value: function(e) {
                      return (
                        !!p.call(this, e) ||
                        (this === b && (e && e._writableState instanceof A))
                      );
                    }
                  }))
                : (p = function(e) {
                    return e instanceof this;
                  }),
              (b.prototype.pipe = function() {
                this.emit("error", new Error("Cannot pipe, not readable"));
              }),
              (b.prototype.write = function(e, t, n) {
                var r,
                  i = this._writableState,
                  s = !1,
                  a =
                    !i.objectMode && ((r = e), l.isBuffer(r) || r instanceof d);
                return (
                  a &&
                    !l.isBuffer(e) &&
                    (e = (function(e) {
                      return l.from(e);
                    })(e)),
                  "function" == typeof t && ((n = t), (t = null)),
                  a ? (t = "buffer") : t || (t = i.defaultEncoding),
                  "function" != typeof n && (n = y),
                  i.ended
                    ? (function(e, t) {
                        var n = new Error("write after end");
                        e.emit("error", n), o.nextTick(t, n);
                      })(this, n)
                    : (a ||
                        (function(e, t, n, r) {
                          var i = !0,
                            s = !1;
                          return (
                            null === n
                              ? (s = new TypeError(
                                  "May not write null values to stream"
                                ))
                              : "string" == typeof n ||
                                void 0 === n ||
                                t.objectMode ||
                                (s = new TypeError(
                                  "Invalid non-string/buffer chunk"
                                )),
                            s &&
                              (e.emit("error", s), o.nextTick(r, s), (i = !1)),
                            i
                          );
                        })(this, i, e, n)) &&
                      (i.pendingcb++,
                      (s = (function(e, t, n, r, i, o) {
                        if (!n) {
                          var s = (function(e, t, n) {
                            e.objectMode ||
                              !1 === e.decodeStrings ||
                              "string" != typeof t ||
                              (t = l.from(t, n));
                            return t;
                          })(t, r, i);
                          r !== s && ((n = !0), (i = "buffer"), (r = s));
                        }
                        var a = t.objectMode ? 1 : r.length;
                        t.length += a;
                        var h = t.length < t.highWaterMark;
                        h || (t.needDrain = !0);
                        if (t.writing || t.corked) {
                          var u = t.lastBufferedRequest;
                          (t.lastBufferedRequest = {
                            chunk: r,
                            encoding: i,
                            isBuf: n,
                            callback: o,
                            next: null
                          }),
                            u
                              ? (u.next = t.lastBufferedRequest)
                              : (t.bufferedRequest = t.lastBufferedRequest),
                            (t.bufferedRequestCount += 1);
                        } else _(e, t, !1, a, r, i, o);
                        return h;
                      })(this, i, a, e, t, n))),
                  s
                );
              }),
              (b.prototype.cork = function() {
                this._writableState.corked++;
              }),
              (b.prototype.uncork = function() {
                var e = this._writableState;
                e.corked &&
                  (e.corked--,
                  e.writing ||
                    e.corked ||
                    e.finished ||
                    e.bufferProcessing ||
                    !e.bufferedRequest ||
                    w(this, e));
              }),
              (b.prototype.setDefaultEncoding = function(e) {
                if (
                  ("string" == typeof e && (e = e.toLowerCase()),
                  !(
                    [
                      "hex",
                      "utf8",
                      "utf-8",
                      "ascii",
                      "binary",
                      "base64",
                      "ucs2",
                      "ucs-2",
                      "utf16le",
                      "utf-16le",
                      "raw"
                    ].indexOf((e + "").toLowerCase()) > -1
                  ))
                )
                  throw new TypeError("Unknown encoding: " + e);
                return (this._writableState.defaultEncoding = e), this;
              }),
              Object.defineProperty(b.prototype, "writableHighWaterMark", {
                enumerable: !1,
                get: function() {
                  return this._writableState.highWaterMark;
                }
              }),
              (b.prototype._write = function(e, t, n) {
                n(new Error("_write() is not implemented"));
              }),
              (b.prototype._writev = null),
              (b.prototype.end = function(e, t, n) {
                var r = this._writableState;
                "function" == typeof e
                  ? ((n = e), (e = null), (t = null))
                  : "function" == typeof t && ((n = t), (t = null)),
                  null != e && this.write(e, t),
                  r.corked && ((r.corked = 1), this.uncork()),
                  r.ending ||
                    r.finished ||
                    (function(e, t, n) {
                      (t.ending = !0),
                        E(e, t),
                        n && (t.finished ? o.nextTick(n) : e.once("finish", n));
                      (t.ended = !0), (e.writable = !1);
                    })(this, r, n);
              }),
              Object.defineProperty(b.prototype, "destroyed", {
                get: function() {
                  return (
                    void 0 !== this._writableState &&
                    this._writableState.destroyed
                  );
                },
                set: function(e) {
                  this._writableState && (this._writableState.destroyed = e);
                }
              }),
              (b.prototype.destroy = g.destroy),
              (b.prototype._undestroy = g.undestroy),
              (b.prototype._destroy = function(e, t) {
                this.end(), t(e);
              });
          }.call(
            this,
            e("_process"),
            "undefined" != typeof global
              ? global
              : "undefined" != typeof self
              ? self
              : "undefined" != typeof window
              ? window
              : {},
            e("timers").setImmediate
          ));
        },
        {
          "./_stream_duplex": 108,
          "./internal/streams/destroy": 114,
          "./internal/streams/stream": 115,
          _process: 175,
          "core-util-is": 27,
          inherits: 64,
          "process-nextick-args": 86,
          "safe-buffer": 116,
          timers: 176,
          "util-deprecate": 153
        }
      ],
      113: [
        function(e, t, n) {
          "use strict";
          var r = e("safe-buffer").Buffer,
            i = e("util");
          (t.exports = (function() {
            function e() {
              !(function(e, t) {
                if (!(e instanceof t))
                  throw new TypeError("Cannot call a class as a function");
              })(this, e),
                (this.head = null),
                (this.tail = null),
                (this.length = 0);
            }
            return (
              (e.prototype.push = function(e) {
                var t = { data: e, next: null };
                this.length > 0 ? (this.tail.next = t) : (this.head = t),
                  (this.tail = t),
                  ++this.length;
              }),
              (e.prototype.unshift = function(e) {
                var t = { data: e, next: this.head };
                0 === this.length && (this.tail = t),
                  (this.head = t),
                  ++this.length;
              }),
              (e.prototype.shift = function() {
                if (0 !== this.length) {
                  var e = this.head.data;
                  return (
                    1 === this.length
                      ? (this.head = this.tail = null)
                      : (this.head = this.head.next),
                    --this.length,
                    e
                  );
                }
              }),
              (e.prototype.clear = function() {
                (this.head = this.tail = null), (this.length = 0);
              }),
              (e.prototype.join = function(e) {
                if (0 === this.length) return "";
                for (var t = this.head, n = "" + t.data; (t = t.next); )
                  n += e + t.data;
                return n;
              }),
              (e.prototype.concat = function(e) {
                if (0 === this.length) return r.alloc(0);
                if (1 === this.length) return this.head.data;
                for (
                  var t, n, i, o = r.allocUnsafe(e >>> 0), s = this.head, a = 0;
                  s;

                )
                  (t = s.data),
                    (n = o),
                    (i = a),
                    t.copy(n, i),
                    (a += s.data.length),
                    (s = s.next);
                return o;
              }),
              e
            );
          })()),
            i &&
              i.inspect &&
              i.inspect.custom &&
              (t.exports.prototype[i.inspect.custom] = function() {
                var e = i.inspect({ length: this.length });
                return this.constructor.name + " " + e;
              });
        },
        { "safe-buffer": 116, util: 168 }
      ],
      114: [
        function(e, t, n) {
          "use strict";
          var r = e("process-nextick-args");
          function i(e, t) {
            e.emit("error", t);
          }
          t.exports = {
            destroy: function(e, t) {
              var n = this,
                o = this._readableState && this._readableState.destroyed,
                s = this._writableState && this._writableState.destroyed;
              return o || s
                ? (t
                    ? t(e)
                    : !e ||
                      (this._writableState &&
                        this._writableState.errorEmitted) ||
                      r.nextTick(i, this, e),
                  this)
                : (this._readableState && (this._readableState.destroyed = !0),
                  this._writableState && (this._writableState.destroyed = !0),
                  this._destroy(e || null, function(e) {
                    !t && e
                      ? (r.nextTick(i, n, e),
                        n._writableState &&
                          (n._writableState.errorEmitted = !0))
                      : t && t(e);
                  }),
                  this);
            },
            undestroy: function() {
              this._readableState &&
                ((this._readableState.destroyed = !1),
                (this._readableState.reading = !1),
                (this._readableState.ended = !1),
                (this._readableState.endEmitted = !1)),
                this._writableState &&
                  ((this._writableState.destroyed = !1),
                  (this._writableState.ended = !1),
                  (this._writableState.ending = !1),
                  (this._writableState.finished = !1),
                  (this._writableState.errorEmitted = !1));
            }
          };
        },
        { "process-nextick-args": 86 }
      ],
      115: [
        function(e, t, n) {
          t.exports = e("events").EventEmitter;
        },
        { events: 170 }
      ],
      116: [
        function(e, t, n) {
          var r = e("buffer"),
            i = r.Buffer;
          function o(e, t) {
            for (var n in e) t[n] = e[n];
          }
          function s(e, t, n) {
            return i(e, t, n);
          }
          i.from && i.alloc && i.allocUnsafe && i.allocUnsafeSlow
            ? (t.exports = r)
            : (o(r, n), (n.Buffer = s)),
            o(i, s),
            (s.from = function(e, t, n) {
              if ("number" == typeof e)
                throw new TypeError("Argument must not be a number");
              return i(e, t, n);
            }),
            (s.alloc = function(e, t, n) {
              if ("number" != typeof e)
                throw new TypeError("Argument must be a number");
              var r = i(e);
              return (
                void 0 !== t
                  ? "string" == typeof n
                    ? r.fill(t, n)
                    : r.fill(t)
                  : r.fill(0),
                r
              );
            }),
            (s.allocUnsafe = function(e) {
              if ("number" != typeof e)
                throw new TypeError("Argument must be a number");
              return i(e);
            }),
            (s.allocUnsafeSlow = function(e) {
              if ("number" != typeof e)
                throw new TypeError("Argument must be a number");
              return r.SlowBuffer(e);
            });
        },
        { buffer: 169 }
      ],
      117: [
        function(e, t, n) {
          ((n = t.exports = e("./lib/_stream_readable.js")).Stream = n),
            (n.Readable = n),
            (n.Writable = e("./lib/_stream_writable.js")),
            (n.Duplex = e("./lib/_stream_duplex.js")),
            (n.Transform = e("./lib/_stream_transform.js")),
            (n.PassThrough = e("./lib/_stream_passthrough.js"));
        },
        {
          "./lib/_stream_duplex.js": 108,
          "./lib/_stream_passthrough.js": 109,
          "./lib/_stream_readable.js": 110,
          "./lib/_stream_transform.js": 111,
          "./lib/_stream_writable.js": 112
        }
      ],
      118: [
        function(e, t, n) {
          (function(e) {
            var n = "win32" === e.platform;
            function r(e, t) {
              var r = e[t];
              return t > 0 && ("/" === r || (n && "\\" === r));
            }
            t.exports = function(e) {
              var t = e.length - 1;
              if (t < 2) return e;
              for (; r(e, t); ) t--;
              return e.substr(0, t + 1);
            };
          }.call(this, e("_process")));
        },
        { _process: 175 }
      ],
      119: [
        function(e, t, n) {
          (function(e) {
            t.exports = function(t, n) {
              var r,
                i,
                o,
                s = !0;
              Array.isArray(t)
                ? ((r = []), (i = t.length))
                : ((o = Object.keys(t)), (r = {}), (i = o.length));
              function a(t) {
                function i() {
                  n && n(t, r), (n = null);
                }
                s ? e.nextTick(i) : i();
              }
              function h(e, t, n) {
                (r[e] = n), (0 == --i || t) && a(t);
              }
              i
                ? o
                  ? o.forEach(function(e) {
                      t[e](function(t, n) {
                        h(e, t, n);
                      });
                    })
                  : t.forEach(function(e, t) {
                      e(function(e, n) {
                        h(t, e, n);
                      });
                    })
                : a(null);
              s = !1;
            };
          }.call(this, e("_process")));
        },
        { _process: 175 }
      ],
      120: [
        function(e, t, n) {
          var r = e("buffer"),
            i = r.Buffer;
          function o(e, t) {
            for (var n in e) t[n] = e[n];
          }
          function s(e, t, n) {
            return i(e, t, n);
          }
          i.from && i.alloc && i.allocUnsafe && i.allocUnsafeSlow
            ? (t.exports = r)
            : (o(r, n), (n.Buffer = s)),
            (s.prototype = Object.create(i.prototype)),
            o(i, s),
            (s.from = function(e, t, n) {
              if ("number" == typeof e)
                throw new TypeError("Argument must not be a number");
              return i(e, t, n);
            }),
            (s.alloc = function(e, t, n) {
              if ("number" != typeof e)
                throw new TypeError("Argument must be a number");
              var r = i(e);
              return (
                void 0 !== t
                  ? "string" == typeof n
                    ? r.fill(t, n)
                    : r.fill(t)
                  : r.fill(0),
                r
              );
            }),
            (s.allocUnsafe = function(e) {
              if ("number" != typeof e)
                throw new TypeError("Argument must be a number");
              return i(e);
            }),
            (s.allocUnsafeSlow = function(e) {
              if ("number" != typeof e)
                throw new TypeError("Argument must be a number");
              return r.SlowBuffer(e);
            });
        },
        { buffer: 169 }
      ],
      121: [
        function(e, t, n) {
          (function(n) {
            const r = e("events"),
              i = e("through2"),
              o = e("inherits"),
              s =
                "undefined" != typeof window && window.WebSocket
                  ? window.WebSocket
                  : null;
            function a(e, t, n) {
              (this.opened = !1), (this.sockets = []), (this.app = e);
              const r = (this.channels = new Map());
              if (
                ((this.subscribers = {
                  get length() {
                    return r.size;
                  }
                }),
                !t || (Array.isArray(t) && 0 === t.length))
              )
                throw Error("No URL specified");
              Array.isArray(t) || (t = [t]),
                (t = t.map(function(e) {
                  return -1 === (e = e.replace(/\/$/, "")).indexOf("://")
                    ? "ws://" + e
                    : e;
                }));
              let i = 0;
              for (let r = 0; r < t.length; r++) {
                const o = new n(`${t[r]}/${e}`);
                this.sockets.push(o),
                  o.addEventListener("open", () => {
                    if (++i === t.length) {
                      (this.opened = !0), this.emit("open");
                      for (let e of this.channels.values()) e.emit("open");
                    }
                  }),
                  o.addEventListener("message", e => {
                    this.onMessage(e);
                  }),
                  o.addEventListener("error", e => {
                    this.listeners("error").length > 0
                      ? this.emit("error", { event: e, url: t[r] })
                      : console.error(e);
                  });
              }
            }
            o(a, r.EventEmitter),
              (a.prototype.subscribe = function(e) {
                if (this.closed)
                  throw new Error("Cannot subscribe after close");
                return this.channels.has(e)
                  ? this.channels.get(e)
                  : (this.channels.set(e, i.obj()),
                    this.channels.get(e).on("close", () => {
                      this.channels.delete(e);
                    }),
                    this.opened &&
                      n.nextTick(() => {
                        this.channels.has(e) &&
                          this.channels.get(e).emit("open");
                      }),
                    this.channels.get(e));
              }),
              (a.prototype.broadcast = function(e, t, n) {
                if (this.closed)
                  throw new Error("Cannot broadcast after close");
                const r = { app: this.app, channel: e, message: t };
                this.sockets.forEach(e => {
                  e.send(JSON.stringify(r));
                }),
                  n && n();
              }),
              (a.prototype.onMessage = function(e) {
                e = JSON.parse(e.data);
                for (let t of this.channels.keys())
                  if (e.channel !== t) {
                    if (Array.isArray(t))
                      for (let n = 0; n < t.length; n++)
                        t[n] === e.channel &&
                          this.channels.get(t).write(e.message);
                  } else this.channels.get(t).write(e.message);
              }),
              (a.prototype.close = function(e) {
                if (this.closed) return void (e && n.nextTick(e));
                this.once("close", () => {
                  e && e(), (this.closed = !0);
                });
                const t = this.sockets.length;
                if (0 === t) return void this.emit("close");
                this.once("close:socket", () => {
                  this._closeChannels();
                });
                let r = 0;
                this.sockets.forEach(e => {
                  e.addEventListener("close", () => {
                    ++r === t && this.emit("close:socket");
                  }),
                    n.nextTick(function() {
                      e.close();
                    });
                });
              }),
              (a.prototype._closeChannels = function() {
                const e = this.channels.size;
                if (0 === e) return void this.emit("close");
                let t = 0;
                for (let r of this.channels.values())
                  n.nextTick(() => {
                    r.end(() => {
                      ++t === e && (this.channels.clear(), this.emit("close"));
                    });
                  });
              }),
              (t.exports = function(e, t, n = s) {
                if (!n) throw TypeError("No WebSocket class given.");
                return new a(e, t, n);
              });
          }.call(this, e("_process")));
        },
        { _process: 175, events: 170, inherits: 64, through2: 122 }
      ],
      122: [
        function(e, t, n) {
          (function(n) {
            var r = e("readable-stream").Transform,
              i = e("util").inherits;
            function o(e) {
              r.call(this, e), (this._destroyed = !1);
            }
            function s(e, t, n) {
              n(null, e);
            }
            function a(e) {
              return function(t, n, r) {
                return (
                  "function" == typeof t && ((r = n), (n = t), (t = {})),
                  "function" != typeof n && (n = s),
                  "function" != typeof r && (r = null),
                  e(t, n, r)
                );
              };
            }
            i(o, r),
              (o.prototype.destroy = function(e) {
                if (!this._destroyed) {
                  this._destroyed = !0;
                  var t = this;
                  n.nextTick(function() {
                    e && t.emit("error", e), t.emit("close");
                  });
                }
              }),
              (t.exports = a(function(e, t, n) {
                var r = new o(e);
                return (r._transform = t), n && (r._flush = n), r;
              })),
              (t.exports.ctor = a(function(e, t, n) {
                function r(t) {
                  if (!(this instanceof r)) return new r(t);
                  (this.options = Object.assign({}, e, t)),
                    o.call(this, this.options);
                }
                return (
                  i(r, o),
                  (r.prototype._transform = t),
                  n && (r.prototype._flush = n),
                  r
                );
              })),
              (t.exports.obj = a(function(e, t, n) {
                var r = new o(
                  Object.assign({ objectMode: !0, highWaterMark: 16 }, e)
                );
                return (r._transform = t), n && (r._flush = n), r;
              }));
          }.call(this, e("_process")));
        },
        { _process: 175, "readable-stream": 117, util: 179 }
      ],
      123: [
        function(e, t, n) {
          var r = e("varint");
          (n.encode = function e(t, n, i) {
            t = t >= 0 ? 2 * t : -2 * t - 1;
            var o = r.encode(t, n, i);
            return (e.bytes = r.encode.bytes), o;
          }),
            (n.decode = function e(t, n) {
              var i = r.decode(t, n);
              return (e.bytes = r.decode.bytes), 1 & i ? (i + 1) / -2 : i / 2;
            }),
            (n.encodingLength = function(e) {
              return r.encodingLength(e >= 0 ? 2 * e : -2 * e - 1);
            });
        },
        { varint: 126 }
      ],
      124: [
        function(e, t, n) {
          arguments[4][6][0].apply(n, arguments);
        },
        { dup: 6 }
      ],
      125: [
        function(e, t, n) {
          arguments[4][7][0].apply(n, arguments);
        },
        { dup: 7 }
      ],
      126: [
        function(e, t, n) {
          arguments[4][8][0].apply(n, arguments);
        },
        { "./decode.js": 124, "./encode.js": 125, "./length.js": 127, dup: 8 }
      ],
      127: [
        function(e, t, n) {
          arguments[4][9][0].apply(n, arguments);
        },
        { dup: 9 }
      ],
      128: [
        function(e, t, n) {
          (function(n) {
            t.exports = h;
            var r = e("debug")("simple-peer"),
              i = e("get-browser-rtc"),
              o = e("inherits"),
              s = e("randombytes"),
              a = e("readable-stream");
            function h(e) {
              var t = this;
              if (!(t instanceof h)) return new h(e);
              if (
                ((t._id = s(4)
                  .toString("hex")
                  .slice(0, 7)),
                t._debug("new peer %o", e),
                (e = Object.assign({ allowHalfOpen: !1 }, e)),
                a.Duplex.call(t, e),
                (t.channelName = e.initiator
                  ? e.channelName || s(20).toString("hex")
                  : null),
                (t._isChromium =
                  "undefined" != typeof window &&
                  !!window.webkitRTCPeerConnection),
                (t.initiator = e.initiator || !1),
                (t.channelConfig = e.channelConfig || h.channelConfig),
                (t.config = e.config || h.config),
                (t.constraints = t._transformConstraints(
                  e.constraints || h.constraints
                )),
                (t.offerConstraints = t._transformConstraints(
                  e.offerConstraints || {}
                )),
                (t.answerConstraints = t._transformConstraints(
                  e.answerConstraints || {}
                )),
                (t.reconnectTimer = e.reconnectTimer || !1),
                (t.sdpTransform =
                  e.sdpTransform ||
                  function(e) {
                    return e;
                  }),
                (t.stream = e.stream || !1),
                (t.trickle = void 0 === e.trickle || e.trickle),
                (t.destroyed = !1),
                (t.connected = !1),
                (t.remoteAddress = void 0),
                (t.remoteFamily = void 0),
                (t.remotePort = void 0),
                (t.localAddress = void 0),
                (t.localPort = void 0),
                (t._wrtc = e.wrtc && "object" == typeof e.wrtc ? e.wrtc : i()),
                !t._wrtc)
              )
                throw "undefined" == typeof window
                  ? new Error(
                      "No WebRTC support: Specify `opts.wrtc` option in this environment"
                    )
                  : new Error("No WebRTC support: Not a supported browser");
              if (
                ((t._pcReady = !1),
                (t._channelReady = !1),
                (t._iceComplete = !1),
                (t._channel = null),
                (t._pendingCandidates = []),
                (t._previousStreams = []),
                (t._chunk = null),
                (t._cb = null),
                (t._interval = null),
                (t._reconnectTimeout = null),
                (t._pc = new t._wrtc.RTCPeerConnection(
                  t.config,
                  t.constraints
                )),
                (t._isWrtc = Array.isArray(t._pc.RTCIceConnectionStates)),
                (t._isReactNativeWebrtc =
                  "number" == typeof t._pc._peerConnectionId),
                (t._pc.oniceconnectionstatechange = function() {
                  t._onIceConnectionStateChange();
                }),
                (t._pc.onsignalingstatechange = function() {
                  t._onSignalingStateChange();
                }),
                (t._pc.onicecandidate = function(e) {
                  t._onIceCandidate(e);
                }),
                t.initiator)
              ) {
                var n = !1;
                (t._pc.onnegotiationneeded = function() {
                  n || t._createOffer(), (n = !0);
                }),
                  t._setupData({
                    channel: t._pc.createDataChannel(
                      t.channelName,
                      t.channelConfig
                    )
                  });
              } else
                t._pc.ondatachannel = function(e) {
                  t._setupData(e);
                };
              "addTrack" in t._pc
                ? (t.stream &&
                    t.stream.getTracks().forEach(function(e) {
                      t._pc.addTrack(e, t.stream);
                    }),
                  (t._pc.ontrack = function(e) {
                    t._onTrack(e);
                  }))
                : (t.stream && t._pc.addStream(t.stream),
                  (t._pc.onaddstream = function(e) {
                    t._onAddStream(e);
                  })),
                t.initiator && t._isWrtc && t._pc.onnegotiationneeded(),
                (t._onFinishBound = function() {
                  t._onFinish();
                }),
                t.once("finish", t._onFinishBound);
            }
            function u() {}
            o(h, a.Duplex),
              (h.WEBRTC_SUPPORT = !!i()),
              (h.config = {
                iceServers: [
                  { urls: "stun:stun.l.google.com:19302" },
                  { urls: "stun:global.stun.twilio.com:3478?transport=udp" }
                ]
              }),
              (h.constraints = {}),
              (h.channelConfig = {}),
              Object.defineProperty(h.prototype, "bufferSize", {
                get: function() {
                  return (this._channel && this._channel.bufferedAmount) || 0;
                }
              }),
              (h.prototype.address = function() {
                return {
                  port: this.localPort,
                  family: "IPv4",
                  address: this.localAddress
                };
              }),
              (h.prototype.signal = function(e) {
                var t = this;
                if (t.destroyed)
                  throw new Error("cannot signal after peer is destroyed");
                if ("string" == typeof e)
                  try {
                    e = JSON.parse(e);
                  } catch (t) {
                    e = {};
                  }
                t._debug("signal()"),
                  e.candidate &&
                    (t._pc.remoteDescription
                      ? t._addIceCandidate(e.candidate)
                      : t._pendingCandidates.push(e.candidate)),
                  e.sdp &&
                    t._pc.setRemoteDescription(
                      new t._wrtc.RTCSessionDescription(e),
                      function() {
                        t.destroyed ||
                          (t._pendingCandidates.forEach(function(e) {
                            t._addIceCandidate(e);
                          }),
                          (t._pendingCandidates = []),
                          "offer" === t._pc.remoteDescription.type &&
                            t._createAnswer());
                      },
                      function(e) {
                        t._onError(e);
                      }
                    ),
                  e.sdp ||
                    e.candidate ||
                    t._destroy(
                      new Error("signal() called with invalid signal data")
                    );
              }),
              (h.prototype._addIceCandidate = function(e) {
                var t = this;
                try {
                  t._pc.addIceCandidate(
                    new t._wrtc.RTCIceCandidate(e),
                    u,
                    function(e) {
                      t._onError(e);
                    }
                  );
                } catch (e) {
                  t._destroy(new Error("error adding candidate: " + e.message));
                }
              }),
              (h.prototype.send = function(e) {
                this._isWrtc && n.isBuffer(e) && (e = new Uint8Array(e)),
                  this._channel.send(e);
              }),
              (h.prototype.destroy = function(e) {
                this._destroy(null, e);
              }),
              (h.prototype._destroy = function(e, t) {
                if (!this.destroyed) {
                  if (
                    (t && this.once("close", t),
                    this._debug("destroy (error: %s)", e && e.message),
                    (this.readable = this.writable = !1),
                    this._readableState.ended || this.push(null),
                    this._writableState.finished || this.end(),
                    (this.destroyed = !0),
                    (this.connected = !1),
                    (this._pcReady = !1),
                    (this._channelReady = !1),
                    (this._previousStreams = null),
                    clearInterval(this._interval),
                    clearTimeout(this._reconnectTimeout),
                    (this._interval = null),
                    (this._reconnectTimeout = null),
                    (this._chunk = null),
                    (this._cb = null),
                    this._onFinishBound &&
                      this.removeListener("finish", this._onFinishBound),
                    (this._onFinishBound = null),
                    this._pc)
                  ) {
                    try {
                      this._pc.close();
                    } catch (e) {}
                    (this._pc.oniceconnectionstatechange = null),
                      (this._pc.onsignalingstatechange = null),
                      (this._pc.onicecandidate = null),
                      "addTrack" in this._pc
                        ? (this._pc.ontrack = null)
                        : (this._pc.onaddstream = null),
                      (this._pc.onnegotiationneeded = null),
                      (this._pc.ondatachannel = null);
                  }
                  if (this._channel) {
                    try {
                      this._channel.close();
                    } catch (e) {}
                    (this._channel.onmessage = null),
                      (this._channel.onopen = null),
                      (this._channel.onclose = null);
                  }
                  (this._pc = null),
                    (this._channel = null),
                    e && this.emit("error", e),
                    this.emit("close");
                }
              }),
              (h.prototype._setupData = function(e) {
                var t = this;
                (t._channel = e.channel),
                  (t._channel.binaryType = "arraybuffer"),
                  "number" == typeof t._channel.bufferedAmountLowThreshold &&
                    (t._channel.bufferedAmountLowThreshold = 65536),
                  (t.channelName = t._channel.label),
                  (t._channel.onmessage = function(e) {
                    t._onChannelMessage(e);
                  }),
                  (t._channel.onbufferedamountlow = function() {
                    t._onChannelBufferedAmountLow();
                  }),
                  (t._channel.onopen = function() {
                    t._onChannelOpen();
                  }),
                  (t._channel.onclose = function() {
                    t._onChannelClose();
                  });
              }),
              (h.prototype._read = function() {}),
              (h.prototype._write = function(e, t, n) {
                if (this.destroyed)
                  return n(new Error("cannot write after peer is destroyed"));
                if (this.connected) {
                  try {
                    this.send(e);
                  } catch (e) {
                    return this._onError(e);
                  }
                  this._channel.bufferedAmount > 65536
                    ? (this._debug(
                        "start backpressure: bufferedAmount %d",
                        this._channel.bufferedAmount
                      ),
                      (this._cb = n))
                    : n(null);
                } else
                  this._debug("write before connect"),
                    (this._chunk = e),
                    (this._cb = n);
              }),
              (h.prototype._onFinish = function() {
                var e = this;
                function t() {
                  setTimeout(function() {
                    e._destroy();
                  }, 100);
                }
                e.destroyed || (e.connected ? t() : e.once("connect", t));
              }),
              (h.prototype._createOffer = function() {
                var e = this;
                e.destroyed ||
                  e._pc.createOffer(
                    function(t) {
                      if (!e.destroyed) {
                        (t.sdp = e.sdpTransform(t.sdp)),
                          e._pc.setLocalDescription(t, u, function(t) {
                            e._onError(t);
                          });
                        var n = function() {
                          var n = e._pc.localDescription || t;
                          e._debug("signal"),
                            e.emit("signal", { type: n.type, sdp: n.sdp });
                        };
                        e.trickle || e._iceComplete
                          ? n()
                          : e.once("_iceComplete", n);
                      }
                    },
                    function(t) {
                      e._onError(t);
                    },
                    e.offerConstraints
                  );
              }),
              (h.prototype._createAnswer = function() {
                var e = this;
                e.destroyed ||
                  e._pc.createAnswer(
                    function(t) {
                      function n() {
                        var n = e._pc.localDescription || t;
                        e._debug("signal"),
                          e.emit("signal", { type: n.type, sdp: n.sdp });
                      }
                      e.destroyed ||
                        ((t.sdp = e.sdpTransform(t.sdp)),
                        e._pc.setLocalDescription(t, u, function(t) {
                          e._onError(t);
                        }),
                        e.trickle || e._iceComplete
                          ? n()
                          : e.once("_iceComplete", n));
                    },
                    function(t) {
                      e._onError(t);
                    },
                    e.answerConstraints
                  );
              }),
              (h.prototype._onIceConnectionStateChange = function() {
                var e = this;
                if (!e.destroyed) {
                  var t = e._pc.iceGatheringState,
                    n = e._pc.iceConnectionState;
                  e._debug("iceConnectionStateChange %s %s", t, n),
                    e.emit("iceConnectionStateChange", t, n),
                    ("connected" !== n && "completed" !== n) ||
                      (clearTimeout(e._reconnectTimeout),
                      (e._pcReady = !0),
                      e._maybeReady()),
                    "disconnected" === n &&
                      (e.reconnectTimer
                        ? (clearTimeout(e._reconnectTimeout),
                          (e._reconnectTimeout = setTimeout(function() {
                            e._destroy();
                          }, e.reconnectTimer)))
                        : e._destroy()),
                    "failed" === n &&
                      e._destroy(new Error("Ice connection failed.")),
                    "closed" === n && e._destroy();
                }
              }),
              (h.prototype.getStats = function(e) {
                var t = this;
                0 === t._pc.getStats.length
                  ? t._pc.getStats().then(
                      function(t) {
                        var n = [];
                        t.forEach(function(e) {
                          n.push(e);
                        }),
                          e(n);
                      },
                      function(e) {
                        t._onError(e);
                      }
                    )
                  : t._isReactNativeWebrtc
                  ? t._pc.getStats(
                      null,
                      function(t) {
                        var n = [];
                        t.forEach(function(e) {
                          n.push(e);
                        }),
                          e(n);
                      },
                      function(e) {
                        t._onError(e);
                      }
                    )
                  : t._pc.getStats.length > 0
                  ? t._pc.getStats(
                      function(t) {
                        var n = [];
                        t.result().forEach(function(e) {
                          var t = {};
                          e.names().forEach(function(n) {
                            t[n] = e.stat(n);
                          }),
                            (t.id = e.id),
                            (t.type = e.type),
                            (t.timestamp = e.timestamp),
                            n.push(t);
                        }),
                          e(n);
                      },
                      function(e) {
                        t._onError(e);
                      }
                    )
                  : e([]);
              }),
              (h.prototype._maybeReady = function() {
                var e = this;
                e._debug(
                  "maybeReady pc %s channel %s",
                  e._pcReady,
                  e._channelReady
                ),
                  !e.connected &&
                    !e._connecting &&
                    e._pcReady &&
                    e._channelReady &&
                    ((e._connecting = !0),
                    e.getStats(function(t) {
                      (e._connecting = !1), (e.connected = !0);
                      var n = {},
                        r = {},
                        i = {};
                      function o(t) {
                        var i = r[t.localCandidateId];
                        i && i.ip
                          ? ((e.localAddress = i.ip),
                            (e.localPort = Number(i.port)))
                          : i && i.ipAddress
                          ? ((e.localAddress = i.ipAddress),
                            (e.localPort = Number(i.portNumber)))
                          : "string" == typeof t.googLocalAddress &&
                            ((i = t.googLocalAddress.split(":")),
                            (e.localAddress = i[0]),
                            (e.localPort = Number(i[1])));
                        var o = n[t.remoteCandidateId];
                        o && o.ip
                          ? ((e.remoteAddress = o.ip),
                            (e.remotePort = Number(o.port)))
                          : o && o.ipAddress
                          ? ((e.remoteAddress = o.ipAddress),
                            (e.remotePort = Number(o.portNumber)))
                          : "string" == typeof t.googRemoteAddress &&
                            ((o = t.googRemoteAddress.split(":")),
                            (e.remoteAddress = o[0]),
                            (e.remotePort = Number(o[1]))),
                          (e.remoteFamily = "IPv4"),
                          e._debug(
                            "connect local: %s:%s remote: %s:%s",
                            e.localAddress,
                            e.localPort,
                            e.remoteAddress,
                            e.remotePort
                          );
                      }
                      if (
                        (t.forEach(function(e) {
                          ("remotecandidate" !== e.type &&
                            "remote-candidate" !== e.type) ||
                            (n[e.id] = e),
                            ("localcandidate" !== e.type &&
                              "local-candidate" !== e.type) ||
                              (r[e.id] = e),
                            ("candidatepair" !== e.type &&
                              "candidate-pair" !== e.type) ||
                              (i[e.id] = e);
                        }),
                        t.forEach(function(e) {
                          "transport" === e.type &&
                            o(i[e.selectedCandidatePairId]),
                            (("googCandidatePair" === e.type &&
                              "true" === e.googActiveConnection) ||
                              (("candidatepair" === e.type ||
                                "candidate-pair" === e.type) &&
                                e.selected)) &&
                              o(e);
                        }),
                        e._chunk)
                      ) {
                        try {
                          e.send(e._chunk);
                        } catch (t) {
                          return e._onError(t);
                        }
                        (e._chunk = null),
                          e._debug('sent chunk from "write before connect"');
                        var s = e._cb;
                        (e._cb = null), s(null);
                      }
                      "number" !=
                        typeof e._channel.bufferedAmountLowThreshold &&
                        ((e._interval = setInterval(function() {
                          e._onInterval();
                        }, 150)),
                        e._interval.unref && e._interval.unref()),
                        e._debug("connect"),
                        e.emit("connect");
                    }));
              }),
              (h.prototype._onInterval = function() {
                !this._cb ||
                  !this._channel ||
                  this._channel.bufferedAmount > 65536 ||
                  this._onChannelBufferedAmountLow();
              }),
              (h.prototype._onSignalingStateChange = function() {
                this.destroyed ||
                  (this._debug(
                    "signalingStateChange %s",
                    this._pc.signalingState
                  ),
                  this.emit("signalingStateChange", this._pc.signalingState));
              }),
              (h.prototype._onIceCandidate = function(e) {
                this.destroyed ||
                  (e.candidate && this.trickle
                    ? this.emit("signal", {
                        candidate: {
                          candidate: e.candidate.candidate,
                          sdpMLineIndex: e.candidate.sdpMLineIndex,
                          sdpMid: e.candidate.sdpMid
                        }
                      })
                    : e.candidate ||
                      ((this._iceComplete = !0), this.emit("_iceComplete")));
              }),
              (h.prototype._onChannelMessage = function(e) {
                if (!this.destroyed) {
                  var t = e.data;
                  t instanceof ArrayBuffer && (t = new n(t)), this.push(t);
                }
              }),
              (h.prototype._onChannelBufferedAmountLow = function() {
                if (!this.destroyed && this._cb) {
                  this._debug(
                    "ending backpressure: bufferedAmount %d",
                    this._channel.bufferedAmount
                  );
                  var e = this._cb;
                  (this._cb = null), e(null);
                }
              }),
              (h.prototype._onChannelOpen = function() {
                this.connected ||
                  this.destroyed ||
                  (this._debug("on channel open"),
                  (this._channelReady = !0),
                  this._maybeReady());
              }),
              (h.prototype._onChannelClose = function() {
                this.destroyed ||
                  (this._debug("on channel close"), this._destroy());
              }),
              (h.prototype._onAddStream = function(e) {
                this.destroyed ||
                  (this._debug("on add stream"), this.emit("stream", e.stream));
              }),
              (h.prototype._onTrack = function(e) {
                if (!this.destroyed) {
                  this._debug("on track");
                  var t = e.streams[0].id;
                  -1 === this._previousStreams.indexOf(t) &&
                    (this._previousStreams.push(t),
                    this.emit("stream", e.streams[0]));
                }
              }),
              (h.prototype._onError = function(e) {
                this.destroyed ||
                  (this._debug("error %s", e.message || e), this._destroy(e));
              }),
              (h.prototype._debug = function() {
                var e = [].slice.call(arguments);
                (e[0] = "[" + this._id + "] " + e[0]), r.apply(null, e);
              }),
              (h.prototype._transformConstraints = function(e) {
                if (0 === Object.keys(e).length) return e;
                if ((e.mandatory || e.optional) && !this._isChromium) {
                  var t = Object.assign({}, e.optional, e.mandatory);
                  return (
                    void 0 !== t.OfferToReceiveVideo &&
                      ((t.offerToReceiveVideo = t.OfferToReceiveVideo),
                      delete t.OfferToReceiveVideo),
                    void 0 !== t.OfferToReceiveAudio &&
                      ((t.offerToReceiveAudio = t.OfferToReceiveAudio),
                      delete t.OfferToReceiveAudio),
                    t
                  );
                }
                return e.mandatory || e.optional || !this._isChromium
                  ? e
                  : (void 0 !== e.offerToReceiveVideo &&
                      ((e.OfferToReceiveVideo = e.offerToReceiveVideo),
                      delete e.offerToReceiveVideo),
                    void 0 !== e.offerToReceiveAudio &&
                      ((e.OfferToReceiveAudio = e.offerToReceiveAudio),
                      delete e.offerToReceiveAudio),
                    { mandatory: e });
              });
          }.call(this, e("buffer").Buffer));
        },
        {
          buffer: 169,
          debug: 129,
          "get-browser-rtc": 41,
          inherits: 64,
          randombytes: 107,
          "readable-stream": 117
        }
      ],
      129: [
        function(e, t, n) {
          (function(r) {
            function i() {
              var e;
              try {
                e = n.storage.debug;
              } catch (e) {}
              return !e && void 0 !== r && "env" in r && (e = r.env.DEBUG), e;
            }
            ((n = t.exports = e("./debug")).log = function() {
              return (
                "object" == typeof console &&
                console.log &&
                Function.prototype.apply.call(console.log, console, arguments)
              );
            }),
              (n.formatArgs = function(e) {
                var t = this.useColors;
                if (
                  ((e[0] =
                    (t ? "%c" : "") +
                    this.namespace +
                    (t ? " %c" : " ") +
                    e[0] +
                    (t ? "%c " : " ") +
                    "+" +
                    n.humanize(this.diff)),
                  !t)
                )
                  return;
                var r = "color: " + this.color;
                e.splice(1, 0, r, "color: inherit");
                var i = 0,
                  o = 0;
                e[0].replace(/%[a-zA-Z%]/g, function(e) {
                  "%%" !== e && (i++, "%c" === e && (o = i));
                }),
                  e.splice(o, 0, r);
              }),
              (n.save = function(e) {
                try {
                  null == e
                    ? n.storage.removeItem("debug")
                    : (n.storage.debug = e);
                } catch (e) {}
              }),
              (n.load = i),
              (n.useColors = function() {
                if (
                  "undefined" != typeof window &&
                  window.process &&
                  "renderer" === window.process.type
                )
                  return !0;
                return (
                  ("undefined" != typeof document &&
                    document.documentElement &&
                    document.documentElement.style &&
                    document.documentElement.style.WebkitAppearance) ||
                  ("undefined" != typeof window &&
                    window.console &&
                    (window.console.firebug ||
                      (window.console.exception && window.console.table))) ||
                  ("undefined" != typeof navigator &&
                    navigator.userAgent &&
                    navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) &&
                    parseInt(RegExp.$1, 10) >= 31) ||
                  ("undefined" != typeof navigator &&
                    navigator.userAgent &&
                    navigator.userAgent
                      .toLowerCase()
                      .match(/applewebkit\/(\d+)/))
                );
              }),
              (n.storage =
                "undefined" != typeof chrome && void 0 !== chrome.storage
                  ? chrome.storage.local
                  : (function() {
                      try {
                        return window.localStorage;
                      } catch (e) {}
                    })()),
              (n.colors = [
                "lightseagreen",
                "forestgreen",
                "goldenrod",
                "dodgerblue",
                "darkorchid",
                "crimson"
              ]),
              (n.formatters.j = function(e) {
                try {
                  return JSON.stringify(e);
                } catch (e) {
                  return "[UnexpectedJSONParseError]: " + e.message;
                }
              }),
              n.enable(i());
          }.call(this, e("_process")));
        },
        { "./debug": 130, _process: 175 }
      ],
      130: [
        function(e, t, n) {
          var r;
          function i(e) {
            function t() {
              if (t.enabled) {
                var e = t,
                  i = +new Date(),
                  o = i - (r || i);
                (e.diff = o), (e.prev = r), (e.curr = i), (r = i);
                for (
                  var s = new Array(arguments.length), a = 0;
                  a < s.length;
                  a++
                )
                  s[a] = arguments[a];
                (s[0] = n.coerce(s[0])),
                  "string" != typeof s[0] && s.unshift("%O");
                var h = 0;
                (s[0] = s[0].replace(/%([a-zA-Z%])/g, function(t, r) {
                  if ("%%" === t) return t;
                  h++;
                  var i = n.formatters[r];
                  if ("function" == typeof i) {
                    var o = s[h];
                    (t = i.call(e, o)), s.splice(h, 1), h--;
                  }
                  return t;
                })),
                  n.formatArgs.call(e, s),
                  (t.log || n.log || console.log.bind(console)).apply(e, s);
              }
            }
            return (
              (t.namespace = e),
              (t.enabled = n.enabled(e)),
              (t.useColors = n.useColors()),
              (t.color = (function(e) {
                var t,
                  r = 0;
                for (t in e) (r = (r << 5) - r + e.charCodeAt(t)), (r |= 0);
                return n.colors[Math.abs(r) % n.colors.length];
              })(e)),
              "function" == typeof n.init && n.init(t),
              t
            );
          }
          ((n = t.exports = i.debug = i.default = i).coerce = function(e) {
            return e instanceof Error ? e.stack || e.message : e;
          }),
            (n.disable = function() {
              n.enable("");
            }),
            (n.enable = function(e) {
              n.save(e), (n.names = []), (n.skips = []);
              for (
                var t = ("string" == typeof e ? e : "").split(/[\s,]+/),
                  r = t.length,
                  i = 0;
                i < r;
                i++
              )
                t[i] &&
                  ("-" === (e = t[i].replace(/\*/g, ".*?"))[0]
                    ? n.skips.push(new RegExp("^" + e.substr(1) + "$"))
                    : n.names.push(new RegExp("^" + e + "$")));
            }),
            (n.enabled = function(e) {
              var t, r;
              for (t = 0, r = n.skips.length; t < r; t++)
                if (n.skips[t].test(e)) return !1;
              for (t = 0, r = n.names.length; t < r; t++)
                if (n.names[t].test(e)) return !0;
              return !1;
            }),
            (n.humanize = e("ms")),
            (n.names = []),
            (n.skips = []),
            (n.formatters = {});
        },
        { ms: 78 }
      ],
      131: [
        function(e, t, n) {
          function r(e, t) {
            var n = e.l + t.l,
              r = { h: (e.h + t.h + ((n / 2) >>> 31)) >>> 0, l: n >>> 0 };
            (e.h = r.h), (e.l = r.l);
          }
          function i(e, t) {
            (e.h ^= t.h), (e.h >>>= 0), (e.l ^= t.l), (e.l >>>= 0);
          }
          function o(e, t) {
            var n = {
              h: (e.h << t) | (e.l >>> (32 - t)),
              l: (e.l << t) | (e.h >>> (32 - t))
            };
            (e.h = n.h), (e.l = n.l);
          }
          function s(e) {
            var t = e.l;
            (e.l = e.h), (e.h = t);
          }
          function a(e, t, n, a) {
            r(e, t),
              r(n, a),
              o(t, 13),
              o(a, 16),
              i(t, e),
              i(a, n),
              s(e),
              r(n, t),
              r(e, a),
              o(t, 17),
              o(a, 21),
              i(t, n),
              i(a, e),
              s(n);
          }
          function h(e, t) {
            return (e[t + 3] << 24) | (e[t + 2] << 16) | (e[t + 1] << 8) | e[t];
          }
          t.exports = function(e, t, n) {
            var r,
              o = { h: h(n, 4), l: h(n, 0) },
              s = { h: h(n, 12), l: h(n, 8) },
              u = { h: o.h, l: o.l },
              c = o,
              f = { h: s.h, l: s.l },
              l = s,
              d = 0,
              p = t.length,
              g = p - 7,
              y = new Uint8Array(new ArrayBuffer(8));
            i(u, { h: 1936682341, l: 1886610805 }),
              i(f, { h: 1685025377, l: 1852075885 }),
              i(c, { h: 1819895653, l: 1852142177 }),
              i(l, { h: 1952801890, l: 2037671283 });
            for (; d < g; )
              (r = { h: h(t, d + 4), l: h(t, d) }),
                i(l, r),
                a(u, f, c, l),
                a(u, f, c, l),
                i(u, r),
                (d += 8);
            y[7] = p;
            var A = 0;
            for (; d < p; ) y[A++] = t[d++];
            for (; A < 7; ) y[A++] = 0;
            (r = {
              h: (y[7] << 24) | (y[6] << 16) | (y[5] << 8) | y[4],
              l: (y[3] << 24) | (y[2] << 16) | (y[1] << 8) | y[0]
            }),
              i(l, r),
              a(u, f, c, l),
              a(u, f, c, l),
              i(u, r),
              i(c, { h: 0, l: 255 }),
              a(u, f, c, l),
              a(u, f, c, l),
              a(u, f, c, l),
              a(u, f, c, l);
            var b = u;
            i(b, f),
              i(b, c),
              i(b, l),
              (e[0] = 255 & b.l),
              (e[1] = (b.l >> 8) & 255),
              (e[2] = (b.l >> 16) & 255),
              (e[3] = (b.l >> 24) & 255),
              (e[4] = 255 & b.h),
              (e[5] = (b.h >> 8) & 255),
              (e[6] = (b.h >> 16) & 255),
              (e[7] = (b.h >> 24) & 255);
          };
        },
        {}
      ],
      132: [
        function(e, t, n) {
          var r = e("./siphash24"),
            i = e("./fallback"),
            o = e("nanoassert");
          t.exports = u;
          var s = (u.BYTES = 8),
            a = (u.KEYBYTES = 16),
            h = r();
          function u(e, t, n, r) {
            return (
              n || (n = new Uint8Array(8)),
              !0 !== r &&
                (o(n.length >= s, "output must be at least " + s),
                o(t.length >= a, "key must be at least " + a)),
              h && h.exports
                ? (e.length + 24 > h.memory.length && h.realloc(e.length + 24),
                  h.memory.set(t, 8),
                  h.memory.set(e, 24),
                  h.exports.siphash(24, e.length),
                  n.set(h.memory.subarray(0, 8)))
                : i(n, e, t),
              n
            );
          }
          (u.WASM_SUPPORTED = "undefined" != typeof WebAssembly),
            (u.WASM_LOADED = !1),
            h &&
              h.onload(function(e) {
                u.WASM_LOADED = !e;
              });
        },
        { "./fallback": 131, "./siphash24": 133, nanoassert: 80 }
      ],
      133: [
        function(e, t, n) {
          function r(t) {
            if (!r.supported) return null;
            var n,
              o = t && t.imports,
              s =
                ((n =
                  "AGFzbQEAAAABBgFgAn9/AAMCAQAFBQEBCpBOBxQCBm1lbW9yeQIAB3NpcGhhc2gAAArdCAHaCAIIfgJ/QvXKzYPXrNu38wAhAkLt3pHzlszct+QAIQNC4eSV89bs2bzsACEEQvPK0cunjNmy9AAhBUEIKQMAIQdBECkDACEIIAGtQjiGIQYgAUEHcSELIAAgAWogC2shCiAFIAiFIQUgBCAHhSEEIAMgCIUhAyACIAeFIQICQANAIAAgCkYNASAAKQMAIQkgBSAJhSEFIAIgA3whAiADQg2JIQMgAyAChSEDIAJCIIkhAiAEIAV8IQQgBUIQiSEFIAUgBIUhBSACIAV8IQIgBUIViSEFIAUgAoUhBSAEIAN8IQQgA0IRiSEDIAMgBIUhAyAEQiCJIQQgAiADfCECIANCDYkhAyADIAKFIQMgAkIgiSECIAQgBXwhBCAFQhCJIQUgBSAEhSEFIAIgBXwhAiAFQhWJIQUgBSAChSEFIAQgA3whBCADQhGJIQMgAyAEhSEDIARCIIkhBCACIAmFIQIgAEEIaiEADAALCwJAAkACQAJAAkACQAJAAkAgCw4HBwYFBAMCAQALIAYgADEABkIwhoQhBgsgBiAAMQAFQiiGhCEGCyAGIAAxAARCIIaEIQYLIAYgADEAA0IYhoQhBgsgBiAAMQACQhCGhCEGCyAGIAAxAAFCCIaEIQYLIAYgADEAAIQhBgsgBSAGhSEFIAIgA3whAiADQg2JIQMgAyAChSEDIAJCIIkhAiAEIAV8IQQgBUIQiSEFIAUgBIUhBSACIAV8IQIgBUIViSEFIAUgAoUhBSAEIAN8IQQgA0IRiSEDIAMgBIUhAyAEQiCJIQQgAiADfCECIANCDYkhAyADIAKFIQMgAkIgiSECIAQgBXwhBCAFQhCJIQUgBSAEhSEFIAIgBXwhAiAFQhWJIQUgBSAChSEFIAQgA3whBCADQhGJIQMgAyAEhSEDIARCIIkhBCACIAaFIQIgBEL/AYUhBCACIAN8IQIgA0INiSEDIAMgAoUhAyACQiCJIQIgBCAFfCEEIAVCEIkhBSAFIASFIQUgAiAFfCECIAVCFYkhBSAFIAKFIQUgBCADfCEEIANCEYkhAyADIASFIQMgBEIgiSEEIAIgA3whAiADQg2JIQMgAyAChSEDIAJCIIkhAiAEIAV8IQQgBUIQiSEFIAUgBIUhBSACIAV8IQIgBUIViSEFIAUgAoUhBSAEIAN8IQQgA0IRiSEDIAMgBIUhAyAEQiCJIQQgAiADfCECIANCDYkhAyADIAKFIQMgAkIgiSECIAQgBXwhBCAFQhCJIQUgBSAEhSEFIAIgBXwhAiAFQhWJIQUgBSAChSEFIAQgA3whBCADQhGJIQMgAyAEhSEDIARCIIkhBCACIAN8IQIgA0INiSEDIAMgAoUhAyACQiCJIQIgBCAFfCEEIAVCEIkhBSAFIASFIQUgAiAFfCECIAVCFYkhBSAFIAKFIQUgBCADfCEEIANCEYkhAyADIASFIQMgBEIgiSEEQQAgAiADIAQgBYWFhTcDAAs="),
                "function" == typeof atob
                  ? new Uint8Array(
                      atob(n)
                        .split("")
                        .map(i)
                    )
                  : new (e("buffer")).Buffer(n, "base64")),
              a = null,
              h = {
                buffer: s,
                memory: null,
                exports: null,
                realloc: function(e) {
                  h.exports.memory.grow(
                    Math.max(
                      0,
                      Math.ceil(Math.abs(e - h.memory.length) / 65536)
                    )
                  ),
                    (h.memory = new Uint8Array(h.exports.memory.buffer));
                },
                onload: u
              };
            return u(function() {}), h;
            function u(e) {
              if (h.exports) return e();
              if (a) a.then(e.bind(null, null)).catch(e);
              else {
                try {
                  if (t && t.async) throw new Error("async");
                  c({
                    instance: new WebAssembly.Instance(
                      new WebAssembly.Module(s),
                      o
                    )
                  });
                } catch (e) {
                  a = WebAssembly.instantiate(s, o).then(c);
                }
                u(e);
              }
            }
            function c(e) {
              (h.exports = e.instance.exports),
                (h.memory =
                  h.exports.memory &&
                  h.exports.memory.buffer &&
                  new Uint8Array(h.exports.memory.buffer));
            }
          }
          function i(e) {
            return e.charCodeAt(0);
          }
          (t.exports = r), (r.supported = "undefined" != typeof WebAssembly);
        },
        {}
      ],
      134: [
        function(e, t, n) {
          var r = e("blake2b");
          (t.exports.crypto_generichash_PRIMITIVE = "blake2b"),
            (t.exports.crypto_generichash_BYTES_MIN = r.BYTES_MIN),
            (t.exports.crypto_generichash_BYTES_MAX = r.BYTES_MAX),
            (t.exports.crypto_generichash_BYTES = r.BYTES),
            (t.exports.crypto_generichash_KEYBYTES_MIN = r.KEYBYTES_MIN),
            (t.exports.crypto_generichash_KEYBYTES_MAX = r.KEYBYTES_MAX),
            (t.exports.crypto_generichash_KEYBYTES = r.KEYBYTES),
            (t.exports.crypto_generichash_WASM_SUPPORTED = r.WASM_SUPPORTED),
            (t.exports.crypto_generichash_WASM_LOADED = !1),
            (t.exports.crypto_generichash = function(e, t, n) {
              r(e.length, n)
                .update(t)
                .final(e);
            }),
            (t.exports.crypto_generichash_ready = r.ready),
            (t.exports.crypto_generichash_batch = function(e, t, n) {
              for (var i = r(e.length, n), o = 0; o < t.length; o++)
                i.update(t[o]);
              i.final(e);
            }),
            (t.exports.crypto_generichash_instance = function(e, n) {
              return (
                null == n && (n = t.exports.crypto_generichash_BYTES), r(n, e)
              );
            }),
            r.ready(function(e) {
              t.exports.crypto_generichash_WASM_LOADED = r.WASM_LOADED;
            });
        },
        { blake2b: 20 }
      ],
      135: [
        function(e, t, n) {
          var r = e("nanoassert"),
            i = e("./randombytes").randombytes_buf,
            o = e("blake2b");
          (t.exports.crypto_kdf_PRIMITIVE = "blake2b"),
            (t.exports.crypto_kdf_BYTES_MIN = 16),
            (t.exports.crypto_kdf_BYTES_MAX = 64),
            (t.exports.crypto_kdf_CONTEXTBYTES = 8),
            (t.exports.crypto_kdf_KEYBYTES = 32),
            (t.exports.crypto_kdf_derive_from_key = function(e, n, i, s) {
              r(
                e.length >= t.exports.crypto_kdf_BYTES_MIN,
                "subkey must be at least crypto_kdf_BYTES_MIN"
              ),
                r(
                  n >= 0 && n <= 9007199254740991,
                  "subkey_id must be safe integer"
                ),
                r(
                  i.length >= t.exports.crypto_kdf_CONTEXTBYTES,
                  "context must be at least crypto_kdf_CONTEXTBYTES"
                );
              var a = new Uint8Array(o.PERSONALBYTES),
                h = new Uint8Array(o.SALTBYTES);
              a.set(i, 0, t.exports.crypto_kdf_CONTEXTBYTES),
                (function(e, t) {
                  var n = 1,
                    r = 0;
                  for (e[0] = 255 & t; ++r < 8 && (n *= 256); )
                    e[r] = (t / n) & 255;
                })(h, n);
              var u = Math.min(e.length, t.exports.crypto_kdf_BYTES_MAX);
              o(
                u,
                s.subarray(0, t.exports.crypto_kdf_KEYBYTES),
                h,
                a,
                !0
              ).final(e);
            }),
            (t.exports.crypto_kdf_keygen = function(e) {
              r(
                e.length >= t.exports.crypto_kdf_KEYBYTES,
                "out.length must be crypto_kdf_KEYBYTES"
              ),
                i(e.subarray(0, t.exports.crypto_kdf_KEYBYTES));
            });
        },
        { "./randombytes": 139, blake2b: 20, nanoassert: 80 }
      ],
      136: [
        function(e, t, n) {
          var r = e("siphash24");
          (n.crypto_shorthash_PRIMITIVE = "siphash24"),
            (n.crypto_shorthash_BYTES = r.BYTES),
            (n.crypto_shorthash_KEYBYTES = r.KEYBYTES),
            (n.crypto_shorthash_WASM_SUPPORTED = r.WASM_SUPPORTED),
            (n.crypto_shorthash_WASM_LOADED = r.WASM_LOADED),
            (n.crypto_shorthash = function(e, t, n, i) {
              r(t, n, e, i);
            });
        },
        { siphash24: 132 }
      ],
      137: [
        function(e, t, n) {
          var r = e("xsalsa20");
          function i(e, t) {
            this._instance = r(e, t);
          }
          (n.crypto_stream_KEYBYTES = 32),
            (n.crypto_stream_NONCEBYTES = 24),
            (n.crypto_stream_PRIMITIVE = "xsalsa20"),
            (n.crypto_stream = function(e, t, r) {
              e.fill(0), n.crypto_stream_xor(e, e, t, r);
            }),
            (n.crypto_stream_xor = function(e, t, n, i) {
              var o = r(n, i);
              o.update(t, e), o.final();
            }),
            (n.crypto_stream_xor_instance = function(e, t) {
              return new i(e, t);
            }),
            (i.prototype.update = function(e, t) {
              this._instance.update(t, e);
            }),
            (i.prototype.final = function() {
              this._instance.finalize(), (this._instance = null);
            });
        },
        { xsalsa20: 160 }
      ],
      138: [
        function(e, t, n) {
          "use strict";
          var r = t.exports,
            i = e("./crypto_stream"),
            o = function(e) {
              var t,
                n = new Float64Array(16);
              if (e) for (t = 0; t < e.length; t++) n[t] = e[t];
              return n;
            },
            s = e("./randombytes").randombytes,
            a = (new Uint8Array(16), new Uint8Array(32));
          a[0] = 9;
          var h = o(),
            u = o([1]),
            c = o([56129, 1]),
            f = o([
              30883,
              4953,
              19914,
              30187,
              55467,
              16705,
              2637,
              112,
              59544,
              30585,
              16505,
              36039,
              65139,
              11119,
              27886,
              20995
            ]),
            l = o([
              61785,
              9906,
              39828,
              60374,
              45398,
              33411,
              5274,
              224,
              53552,
              61171,
              33010,
              6542,
              64743,
              22239,
              55772,
              9222
            ]),
            d = o([
              54554,
              36645,
              11616,
              51542,
              42930,
              38181,
              51040,
              26924,
              56412,
              64982,
              57905,
              49316,
              21502,
              52590,
              14035,
              8553
            ]),
            p = o([
              26200,
              26214,
              26214,
              26214,
              26214,
              26214,
              26214,
              26214,
              26214,
              26214,
              26214,
              26214,
              26214,
              26214,
              26214,
              26214
            ]),
            g = o([
              41136,
              18958,
              6951,
              50414,
              58488,
              44335,
              6150,
              12099,
              55207,
              15867,
              153,
              11085,
              57099,
              20417,
              9344,
              11139
            ]);
          function y(e, t, n, r) {
            (e[t] = (n >> 24) & 255),
              (e[t + 1] = (n >> 16) & 255),
              (e[t + 2] = (n >> 8) & 255),
              (e[t + 3] = 255 & n),
              (e[t + 4] = (r >> 24) & 255),
              (e[t + 5] = (r >> 16) & 255),
              (e[t + 6] = (r >> 8) & 255),
              (e[t + 7] = 255 & r);
          }
          function A(e, t, n, r, i) {
            var o,
              s = 0;
            for (o = 0; o < i; o++) s |= e[t + o] ^ n[r + o];
            return (1 & ((s - 1) >>> 8)) - 1;
          }
          function b(e, t, n, r) {
            return A(e, t, n, r, 32);
          }
          var _ = function(e) {
            var t, n, r, i, o, s, a, h;
            (this.buffer = new Uint8Array(16)),
              (this.r = new Uint16Array(10)),
              (this.h = new Uint16Array(10)),
              (this.pad = new Uint16Array(8)),
              (this.leftover = 0),
              (this.fin = 0),
              (t = (255 & e[0]) | ((255 & e[1]) << 8)),
              (this.r[0] = 8191 & t),
              (n = (255 & e[2]) | ((255 & e[3]) << 8)),
              (this.r[1] = 8191 & ((t >>> 13) | (n << 3))),
              (r = (255 & e[4]) | ((255 & e[5]) << 8)),
              (this.r[2] = 7939 & ((n >>> 10) | (r << 6))),
              (i = (255 & e[6]) | ((255 & e[7]) << 8)),
              (this.r[3] = 8191 & ((r >>> 7) | (i << 9))),
              (o = (255 & e[8]) | ((255 & e[9]) << 8)),
              (this.r[4] = 255 & ((i >>> 4) | (o << 12))),
              (this.r[5] = (o >>> 1) & 8190),
              (s = (255 & e[10]) | ((255 & e[11]) << 8)),
              (this.r[6] = 8191 & ((o >>> 14) | (s << 2))),
              (a = (255 & e[12]) | ((255 & e[13]) << 8)),
              (this.r[7] = 8065 & ((s >>> 11) | (a << 5))),
              (h = (255 & e[14]) | ((255 & e[15]) << 8)),
              (this.r[8] = 8191 & ((a >>> 8) | (h << 8))),
              (this.r[9] = (h >>> 5) & 127),
              (this.pad[0] = (255 & e[16]) | ((255 & e[17]) << 8)),
              (this.pad[1] = (255 & e[18]) | ((255 & e[19]) << 8)),
              (this.pad[2] = (255 & e[20]) | ((255 & e[21]) << 8)),
              (this.pad[3] = (255 & e[22]) | ((255 & e[23]) << 8)),
              (this.pad[4] = (255 & e[24]) | ((255 & e[25]) << 8)),
              (this.pad[5] = (255 & e[26]) | ((255 & e[27]) << 8)),
              (this.pad[6] = (255 & e[28]) | ((255 & e[29]) << 8)),
              (this.pad[7] = (255 & e[30]) | ((255 & e[31]) << 8));
          };
          function v(e, t, n, r, o, s, a) {
            i.crypto_stream_xor(e, n, s, a);
          }
          function w(e, t, n, r, i, o) {
            var s = new _(o);
            return s.update(n, r, i), s.finish(e, t), 0;
          }
          function m(e, t, n, r, i, o) {
            var s = new Uint8Array(16);
            return (
              w(s, 0, n, r, i, o),
              (function(e, t, n, r) {
                return A(e, t, n, r, 16);
              })(e, t, s, 0)
            );
          }
          function I(e, t, n, r, o) {
            var s,
              a = new Uint8Array(32);
            if (n < 32) return -1;
            if (
              ((function(e, t, n, r, o) {
                i.crypto_stream(e, r, o);
              })(a, 0, 0, r, o),
              0 !== m(t, 16, t, 32, n - 32, a))
            )
              return -1;
            for (v(e, 0, t, 0, 0, r, o), s = 0; s < 32; s++) e[s] = 0;
            return 0;
          }
          function E(e, t) {
            var n;
            for (n = 0; n < 16; n++) e[n] = 0 | t[n];
          }
          function C(e) {
            var t,
              n,
              r = 1;
            for (t = 0; t < 16; t++)
              (n = e[t] + r + 65535),
                (r = Math.floor(n / 65536)),
                (e[t] = n - 65536 * r);
            e[0] += r - 1 + 37 * (r - 1);
          }
          function B(e, t, n) {
            for (var r, i = ~(n - 1), o = 0; o < 16; o++)
              (r = i & (e[o] ^ t[o])), (e[o] ^= r), (t[o] ^= r);
          }
          function x(e, t) {
            var n,
              r,
              i,
              s = o(),
              a = o();
            for (n = 0; n < 16; n++) a[n] = t[n];
            for (C(a), C(a), C(a), r = 0; r < 2; r++) {
              for (s[0] = a[0] - 65517, n = 1; n < 15; n++)
                (s[n] = a[n] - 65535 - ((s[n - 1] >> 16) & 1)),
                  (s[n - 1] &= 65535);
              (s[15] = a[15] - 32767 - ((s[14] >> 16) & 1)),
                (i = (s[15] >> 16) & 1),
                (s[14] &= 65535),
                B(a, s, 1 - i);
            }
            for (n = 0; n < 16; n++)
              (e[2 * n] = 255 & a[n]), (e[2 * n + 1] = a[n] >> 8);
          }
          function k(e, t) {
            var n = new Uint8Array(32),
              r = new Uint8Array(32);
            return x(n, e), x(r, t), b(n, 0, r, 0);
          }
          function S(e) {
            var t = new Uint8Array(32);
            return x(t, e), 1 & t[0];
          }
          function Q(e, t) {
            var n;
            for (n = 0; n < 16; n++) e[n] = t[2 * n] + (t[2 * n + 1] << 8);
            e[15] &= 32767;
          }
          function D(e, t, n) {
            for (var r = 0; r < 16; r++) e[r] = t[r] + n[r];
          }
          function M(e, t, n) {
            for (var r = 0; r < 16; r++) e[r] = t[r] - n[r];
          }
          function U(e, t, n) {
            var r,
              i,
              o = 0,
              s = 0,
              a = 0,
              h = 0,
              u = 0,
              c = 0,
              f = 0,
              l = 0,
              d = 0,
              p = 0,
              g = 0,
              y = 0,
              A = 0,
              b = 0,
              _ = 0,
              v = 0,
              w = 0,
              m = 0,
              I = 0,
              E = 0,
              C = 0,
              B = 0,
              x = 0,
              k = 0,
              S = 0,
              Q = 0,
              D = 0,
              M = 0,
              U = 0,
              L = 0,
              T = 0,
              F = n[0],
              O = n[1],
              K = n[2],
              R = n[3],
              N = n[4],
              j = n[5],
              q = n[6],
              z = n[7],
              Y = n[8],
              P = n[9],
              H = n[10],
              G = n[11],
              V = n[12],
              W = n[13],
              J = n[14],
              X = n[15];
            (o += (r = t[0]) * F),
              (s += r * O),
              (a += r * K),
              (h += r * R),
              (u += r * N),
              (c += r * j),
              (f += r * q),
              (l += r * z),
              (d += r * Y),
              (p += r * P),
              (g += r * H),
              (y += r * G),
              (A += r * V),
              (b += r * W),
              (_ += r * J),
              (v += r * X),
              (s += (r = t[1]) * F),
              (a += r * O),
              (h += r * K),
              (u += r * R),
              (c += r * N),
              (f += r * j),
              (l += r * q),
              (d += r * z),
              (p += r * Y),
              (g += r * P),
              (y += r * H),
              (A += r * G),
              (b += r * V),
              (_ += r * W),
              (v += r * J),
              (w += r * X),
              (a += (r = t[2]) * F),
              (h += r * O),
              (u += r * K),
              (c += r * R),
              (f += r * N),
              (l += r * j),
              (d += r * q),
              (p += r * z),
              (g += r * Y),
              (y += r * P),
              (A += r * H),
              (b += r * G),
              (_ += r * V),
              (v += r * W),
              (w += r * J),
              (m += r * X),
              (h += (r = t[3]) * F),
              (u += r * O),
              (c += r * K),
              (f += r * R),
              (l += r * N),
              (d += r * j),
              (p += r * q),
              (g += r * z),
              (y += r * Y),
              (A += r * P),
              (b += r * H),
              (_ += r * G),
              (v += r * V),
              (w += r * W),
              (m += r * J),
              (I += r * X),
              (u += (r = t[4]) * F),
              (c += r * O),
              (f += r * K),
              (l += r * R),
              (d += r * N),
              (p += r * j),
              (g += r * q),
              (y += r * z),
              (A += r * Y),
              (b += r * P),
              (_ += r * H),
              (v += r * G),
              (w += r * V),
              (m += r * W),
              (I += r * J),
              (E += r * X),
              (c += (r = t[5]) * F),
              (f += r * O),
              (l += r * K),
              (d += r * R),
              (p += r * N),
              (g += r * j),
              (y += r * q),
              (A += r * z),
              (b += r * Y),
              (_ += r * P),
              (v += r * H),
              (w += r * G),
              (m += r * V),
              (I += r * W),
              (E += r * J),
              (C += r * X),
              (f += (r = t[6]) * F),
              (l += r * O),
              (d += r * K),
              (p += r * R),
              (g += r * N),
              (y += r * j),
              (A += r * q),
              (b += r * z),
              (_ += r * Y),
              (v += r * P),
              (w += r * H),
              (m += r * G),
              (I += r * V),
              (E += r * W),
              (C += r * J),
              (B += r * X),
              (l += (r = t[7]) * F),
              (d += r * O),
              (p += r * K),
              (g += r * R),
              (y += r * N),
              (A += r * j),
              (b += r * q),
              (_ += r * z),
              (v += r * Y),
              (w += r * P),
              (m += r * H),
              (I += r * G),
              (E += r * V),
              (C += r * W),
              (B += r * J),
              (x += r * X),
              (d += (r = t[8]) * F),
              (p += r * O),
              (g += r * K),
              (y += r * R),
              (A += r * N),
              (b += r * j),
              (_ += r * q),
              (v += r * z),
              (w += r * Y),
              (m += r * P),
              (I += r * H),
              (E += r * G),
              (C += r * V),
              (B += r * W),
              (x += r * J),
              (k += r * X),
              (p += (r = t[9]) * F),
              (g += r * O),
              (y += r * K),
              (A += r * R),
              (b += r * N),
              (_ += r * j),
              (v += r * q),
              (w += r * z),
              (m += r * Y),
              (I += r * P),
              (E += r * H),
              (C += r * G),
              (B += r * V),
              (x += r * W),
              (k += r * J),
              (S += r * X),
              (g += (r = t[10]) * F),
              (y += r * O),
              (A += r * K),
              (b += r * R),
              (_ += r * N),
              (v += r * j),
              (w += r * q),
              (m += r * z),
              (I += r * Y),
              (E += r * P),
              (C += r * H),
              (B += r * G),
              (x += r * V),
              (k += r * W),
              (S += r * J),
              (Q += r * X),
              (y += (r = t[11]) * F),
              (A += r * O),
              (b += r * K),
              (_ += r * R),
              (v += r * N),
              (w += r * j),
              (m += r * q),
              (I += r * z),
              (E += r * Y),
              (C += r * P),
              (B += r * H),
              (x += r * G),
              (k += r * V),
              (S += r * W),
              (Q += r * J),
              (D += r * X),
              (A += (r = t[12]) * F),
              (b += r * O),
              (_ += r * K),
              (v += r * R),
              (w += r * N),
              (m += r * j),
              (I += r * q),
              (E += r * z),
              (C += r * Y),
              (B += r * P),
              (x += r * H),
              (k += r * G),
              (S += r * V),
              (Q += r * W),
              (D += r * J),
              (M += r * X),
              (b += (r = t[13]) * F),
              (_ += r * O),
              (v += r * K),
              (w += r * R),
              (m += r * N),
              (I += r * j),
              (E += r * q),
              (C += r * z),
              (B += r * Y),
              (x += r * P),
              (k += r * H),
              (S += r * G),
              (Q += r * V),
              (D += r * W),
              (M += r * J),
              (U += r * X),
              (_ += (r = t[14]) * F),
              (v += r * O),
              (w += r * K),
              (m += r * R),
              (I += r * N),
              (E += r * j),
              (C += r * q),
              (B += r * z),
              (x += r * Y),
              (k += r * P),
              (S += r * H),
              (Q += r * G),
              (D += r * V),
              (M += r * W),
              (U += r * J),
              (L += r * X),
              (v += (r = t[15]) * F),
              (s += 38 * (m += r * K)),
              (a += 38 * (I += r * R)),
              (h += 38 * (E += r * N)),
              (u += 38 * (C += r * j)),
              (c += 38 * (B += r * q)),
              (f += 38 * (x += r * z)),
              (l += 38 * (k += r * Y)),
              (d += 38 * (S += r * P)),
              (p += 38 * (Q += r * H)),
              (g += 38 * (D += r * G)),
              (y += 38 * (M += r * V)),
              (A += 38 * (U += r * W)),
              (b += 38 * (L += r * J)),
              (_ += 38 * (T += r * X)),
              (o =
                (r = (o += 38 * (w += r * O)) + (i = 1) + 65535) -
                65536 * (i = Math.floor(r / 65536))),
              (s = (r = s + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (a = (r = a + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (h = (r = h + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (u = (r = u + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (c = (r = c + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (f = (r = f + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (l = (r = l + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (d = (r = d + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (p = (r = p + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (g = (r = g + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (y = (r = y + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (A = (r = A + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (b = (r = b + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (_ = (r = _ + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (v = (r = v + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (o =
                (r = (o += i - 1 + 37 * (i - 1)) + (i = 1) + 65535) -
                65536 * (i = Math.floor(r / 65536))),
              (s = (r = s + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (a = (r = a + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (h = (r = h + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (u = (r = u + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (c = (r = c + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (f = (r = f + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (l = (r = l + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (d = (r = d + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (p = (r = p + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (g = (r = g + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (y = (r = y + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (A = (r = A + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (b = (r = b + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (_ = (r = _ + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (v = (r = v + i + 65535) - 65536 * (i = Math.floor(r / 65536))),
              (o += i - 1 + 37 * (i - 1)),
              (e[0] = o),
              (e[1] = s),
              (e[2] = a),
              (e[3] = h),
              (e[4] = u),
              (e[5] = c),
              (e[6] = f),
              (e[7] = l),
              (e[8] = d),
              (e[9] = p),
              (e[10] = g),
              (e[11] = y),
              (e[12] = A),
              (e[13] = b),
              (e[14] = _),
              (e[15] = v);
          }
          function L(e, t) {
            U(e, t, t);
          }
          function T(e, t) {
            var n,
              r = o();
            for (n = 0; n < 16; n++) r[n] = t[n];
            for (n = 253; n >= 0; n--)
              L(r, r), 2 !== n && 4 !== n && U(r, r, t);
            for (n = 0; n < 16; n++) e[n] = r[n];
          }
          function F(e, t, n) {
            ue(e, ie), ue(t, oe), ue(n, ie);
            var r,
              i,
              s = new Uint8Array(32),
              a = new Float64Array(80),
              h = o(),
              u = o(),
              f = o(),
              l = o(),
              d = o(),
              p = o();
            for (i = 0; i < 31; i++) s[i] = t[i];
            for (
              s[31] = (127 & t[31]) | 64, s[0] &= 248, Q(a, n), i = 0;
              i < 16;
              i++
            )
              (u[i] = a[i]), (l[i] = h[i] = f[i] = 0);
            for (h[0] = l[0] = 1, i = 254; i >= 0; --i)
              B(h, u, (r = (s[i >>> 3] >>> (7 & i)) & 1)),
                B(f, l, r),
                D(d, h, f),
                M(h, h, f),
                D(f, u, l),
                M(u, u, l),
                L(l, d),
                L(p, h),
                U(h, f, h),
                U(f, u, d),
                D(d, h, f),
                M(h, h, f),
                L(u, h),
                M(f, l, p),
                U(h, f, c),
                D(h, h, l),
                U(f, f, h),
                U(h, l, p),
                U(l, u, a),
                L(u, d),
                B(h, u, r),
                B(f, l, r);
            for (i = 0; i < 16; i++)
              (a[i + 16] = h[i]),
                (a[i + 32] = f[i]),
                (a[i + 48] = u[i]),
                (a[i + 64] = l[i]);
            var g = a.subarray(32),
              y = a.subarray(16);
            return T(g, g), U(y, y, g), x(e, y), 0;
          }
          (_.prototype.blocks = function(e, t, n) {
            for (
              var r,
                i,
                o,
                s,
                a,
                h,
                u,
                c,
                f,
                l,
                d,
                p,
                g,
                y,
                A,
                b,
                _,
                v,
                w,
                m = this.fin ? 0 : 2048,
                I = this.h[0],
                E = this.h[1],
                C = this.h[2],
                B = this.h[3],
                x = this.h[4],
                k = this.h[5],
                S = this.h[6],
                Q = this.h[7],
                D = this.h[8],
                M = this.h[9],
                U = this.r[0],
                L = this.r[1],
                T = this.r[2],
                F = this.r[3],
                O = this.r[4],
                K = this.r[5],
                R = this.r[6],
                N = this.r[7],
                j = this.r[8],
                q = this.r[9];
              n >= 16;

            )
              (l = f = 0),
                (l +=
                  (I +=
                    8191 & (r = (255 & e[t + 0]) | ((255 & e[t + 1]) << 8))) *
                  U),
                (l +=
                  (E +=
                    8191 &
                    ((r >>> 13) |
                      ((i = (255 & e[t + 2]) | ((255 & e[t + 3]) << 8)) <<
                        3))) *
                  (5 * q)),
                (l +=
                  (C +=
                    8191 &
                    ((i >>> 10) |
                      ((o = (255 & e[t + 4]) | ((255 & e[t + 5]) << 8)) <<
                        6))) *
                  (5 * j)),
                (l +=
                  (B +=
                    8191 &
                    ((o >>> 7) |
                      ((s = (255 & e[t + 6]) | ((255 & e[t + 7]) << 8)) <<
                        9))) *
                  (5 * N)),
                (f =
                  (l +=
                    (x +=
                      8191 &
                      ((s >>> 4) |
                        ((a = (255 & e[t + 8]) | ((255 & e[t + 9]) << 8)) <<
                          12))) *
                    (5 * R)) >>> 13),
                (l &= 8191),
                (l += (k += (a >>> 1) & 8191) * (5 * K)),
                (l +=
                  (S +=
                    8191 &
                    ((a >>> 14) |
                      ((h = (255 & e[t + 10]) | ((255 & e[t + 11]) << 8)) <<
                        2))) *
                  (5 * O)),
                (l +=
                  (Q +=
                    8191 &
                    ((h >>> 11) |
                      ((u = (255 & e[t + 12]) | ((255 & e[t + 13]) << 8)) <<
                        5))) *
                  (5 * F)),
                (l +=
                  (D +=
                    8191 &
                    ((u >>> 8) |
                      ((c = (255 & e[t + 14]) | ((255 & e[t + 15]) << 8)) <<
                        8))) *
                  (5 * T)),
                (d = f += (l += (M += (c >>> 5) | m) * (5 * L)) >>> 13),
                (d += I * L),
                (d += E * U),
                (d += C * (5 * q)),
                (d += B * (5 * j)),
                (f = (d += x * (5 * N)) >>> 13),
                (d &= 8191),
                (d += k * (5 * R)),
                (d += S * (5 * K)),
                (d += Q * (5 * O)),
                (d += D * (5 * F)),
                (f += (d += M * (5 * T)) >>> 13),
                (d &= 8191),
                (p = f),
                (p += I * T),
                (p += E * L),
                (p += C * U),
                (p += B * (5 * q)),
                (f = (p += x * (5 * j)) >>> 13),
                (p &= 8191),
                (p += k * (5 * N)),
                (p += S * (5 * R)),
                (p += Q * (5 * K)),
                (p += D * (5 * O)),
                (g = f += (p += M * (5 * F)) >>> 13),
                (g += I * F),
                (g += E * T),
                (g += C * L),
                (g += B * U),
                (f = (g += x * (5 * q)) >>> 13),
                (g &= 8191),
                (g += k * (5 * j)),
                (g += S * (5 * N)),
                (g += Q * (5 * R)),
                (g += D * (5 * K)),
                (y = f += (g += M * (5 * O)) >>> 13),
                (y += I * O),
                (y += E * F),
                (y += C * T),
                (y += B * L),
                (f = (y += x * U) >>> 13),
                (y &= 8191),
                (y += k * (5 * q)),
                (y += S * (5 * j)),
                (y += Q * (5 * N)),
                (y += D * (5 * R)),
                (A = f += (y += M * (5 * K)) >>> 13),
                (A += I * K),
                (A += E * O),
                (A += C * F),
                (A += B * T),
                (f = (A += x * L) >>> 13),
                (A &= 8191),
                (A += k * U),
                (A += S * (5 * q)),
                (A += Q * (5 * j)),
                (A += D * (5 * N)),
                (b = f += (A += M * (5 * R)) >>> 13),
                (b += I * R),
                (b += E * K),
                (b += C * O),
                (b += B * F),
                (f = (b += x * T) >>> 13),
                (b &= 8191),
                (b += k * L),
                (b += S * U),
                (b += Q * (5 * q)),
                (b += D * (5 * j)),
                (_ = f += (b += M * (5 * N)) >>> 13),
                (_ += I * N),
                (_ += E * R),
                (_ += C * K),
                (_ += B * O),
                (f = (_ += x * F) >>> 13),
                (_ &= 8191),
                (_ += k * T),
                (_ += S * L),
                (_ += Q * U),
                (_ += D * (5 * q)),
                (v = f += (_ += M * (5 * j)) >>> 13),
                (v += I * j),
                (v += E * N),
                (v += C * R),
                (v += B * K),
                (f = (v += x * O) >>> 13),
                (v &= 8191),
                (v += k * F),
                (v += S * T),
                (v += Q * L),
                (v += D * U),
                (w = f += (v += M * (5 * q)) >>> 13),
                (w += I * q),
                (w += E * j),
                (w += C * N),
                (w += B * R),
                (f = (w += x * K) >>> 13),
                (w &= 8191),
                (w += k * O),
                (w += S * F),
                (w += Q * T),
                (w += D * L),
                (I = l =
                  8191 &
                  (f =
                    ((f = (((f += (w += M * U) >>> 13) << 2) + f) | 0) +
                      (l &= 8191)) |
                    0)),
                (E = d += f >>>= 13),
                (C = p &= 8191),
                (B = g &= 8191),
                (x = y &= 8191),
                (k = A &= 8191),
                (S = b &= 8191),
                (Q = _ &= 8191),
                (D = v &= 8191),
                (M = w &= 8191),
                (t += 16),
                (n -= 16);
            (this.h[0] = I),
              (this.h[1] = E),
              (this.h[2] = C),
              (this.h[3] = B),
              (this.h[4] = x),
              (this.h[5] = k),
              (this.h[6] = S),
              (this.h[7] = Q),
              (this.h[8] = D),
              (this.h[9] = M);
          }),
            (_.prototype.finish = function(e, t) {
              var n,
                r,
                i,
                o,
                s = new Uint16Array(10);
              if (this.leftover) {
                for (o = this.leftover, this.buffer[o++] = 1; o < 16; o++)
                  this.buffer[o] = 0;
                (this.fin = 1), this.blocks(this.buffer, 0, 16);
              }
              for (n = this.h[1] >>> 13, this.h[1] &= 8191, o = 2; o < 10; o++)
                (this.h[o] += n), (n = this.h[o] >>> 13), (this.h[o] &= 8191);
              for (
                this.h[0] += 5 * n,
                  n = this.h[0] >>> 13,
                  this.h[0] &= 8191,
                  this.h[1] += n,
                  n = this.h[1] >>> 13,
                  this.h[1] &= 8191,
                  this.h[2] += n,
                  s[0] = this.h[0] + 5,
                  n = s[0] >>> 13,
                  s[0] &= 8191,
                  o = 1;
                o < 10;
                o++
              )
                (s[o] = this.h[o] + n), (n = s[o] >>> 13), (s[o] &= 8191);
              for (s[9] -= 8192, r = (1 ^ n) - 1, o = 0; o < 10; o++) s[o] &= r;
              for (r = ~r, o = 0; o < 10; o++)
                this.h[o] = (this.h[o] & r) | s[o];
              for (
                this.h[0] = 65535 & (this.h[0] | (this.h[1] << 13)),
                  this.h[1] = 65535 & ((this.h[1] >>> 3) | (this.h[2] << 10)),
                  this.h[2] = 65535 & ((this.h[2] >>> 6) | (this.h[3] << 7)),
                  this.h[3] = 65535 & ((this.h[3] >>> 9) | (this.h[4] << 4)),
                  this.h[4] =
                    65535 &
                    ((this.h[4] >>> 12) | (this.h[5] << 1) | (this.h[6] << 14)),
                  this.h[5] = 65535 & ((this.h[6] >>> 2) | (this.h[7] << 11)),
                  this.h[6] = 65535 & ((this.h[7] >>> 5) | (this.h[8] << 8)),
                  this.h[7] = 65535 & ((this.h[8] >>> 8) | (this.h[9] << 5)),
                  i = this.h[0] + this.pad[0],
                  this.h[0] = 65535 & i,
                  o = 1;
                o < 8;
                o++
              )
                (i = (((this.h[o] + this.pad[o]) | 0) + (i >>> 16)) | 0),
                  (this.h[o] = 65535 & i);
              (e[t + 0] = (this.h[0] >>> 0) & 255),
                (e[t + 1] = (this.h[0] >>> 8) & 255),
                (e[t + 2] = (this.h[1] >>> 0) & 255),
                (e[t + 3] = (this.h[1] >>> 8) & 255),
                (e[t + 4] = (this.h[2] >>> 0) & 255),
                (e[t + 5] = (this.h[2] >>> 8) & 255),
                (e[t + 6] = (this.h[3] >>> 0) & 255),
                (e[t + 7] = (this.h[3] >>> 8) & 255),
                (e[t + 8] = (this.h[4] >>> 0) & 255),
                (e[t + 9] = (this.h[4] >>> 8) & 255),
                (e[t + 10] = (this.h[5] >>> 0) & 255),
                (e[t + 11] = (this.h[5] >>> 8) & 255),
                (e[t + 12] = (this.h[6] >>> 0) & 255),
                (e[t + 13] = (this.h[6] >>> 8) & 255),
                (e[t + 14] = (this.h[7] >>> 0) & 255),
                (e[t + 15] = (this.h[7] >>> 8) & 255);
            }),
            (_.prototype.update = function(e, t, n) {
              var r, i;
              if (this.leftover) {
                for ((i = 16 - this.leftover) > n && (i = n), r = 0; r < i; r++)
                  this.buffer[this.leftover + r] = e[t + r];
                if (
                  ((n -= i), (t += i), (this.leftover += i), this.leftover < 16)
                )
                  return;
                this.blocks(this.buffer, 0, 16), (this.leftover = 0);
              }
              if (
                (n >= 16 &&
                  ((i = n - (n % 16)),
                  this.blocks(e, t, i),
                  (t += i),
                  (n -= i)),
                n)
              ) {
                for (r = 0; r < n; r++)
                  this.buffer[this.leftover + r] = e[t + r];
                this.leftover += n;
              }
            });
          var O = [
            1116352408,
            3609767458,
            1899447441,
            602891725,
            3049323471,
            3964484399,
            3921009573,
            2173295548,
            961987163,
            4081628472,
            1508970993,
            3053834265,
            2453635748,
            2937671579,
            2870763221,
            3664609560,
            3624381080,
            2734883394,
            310598401,
            1164996542,
            607225278,
            1323610764,
            1426881987,
            3590304994,
            1925078388,
            4068182383,
            2162078206,
            991336113,
            2614888103,
            633803317,
            3248222580,
            3479774868,
            3835390401,
            2666613458,
            4022224774,
            944711139,
            264347078,
            2341262773,
            604807628,
            2007800933,
            770255983,
            1495990901,
            1249150122,
            1856431235,
            1555081692,
            3175218132,
            1996064986,
            2198950837,
            2554220882,
            3999719339,
            2821834349,
            766784016,
            2952996808,
            2566594879,
            3210313671,
            3203337956,
            3336571891,
            1034457026,
            3584528711,
            2466948901,
            113926993,
            3758326383,
            338241895,
            168717936,
            666307205,
            1188179964,
            773529912,
            1546045734,
            1294757372,
            1522805485,
            1396182291,
            2643833823,
            1695183700,
            2343527390,
            1986661051,
            1014477480,
            2177026350,
            1206759142,
            2456956037,
            344077627,
            2730485921,
            1290863460,
            2820302411,
            3158454273,
            3259730800,
            3505952657,
            3345765771,
            106217008,
            3516065817,
            3606008344,
            3600352804,
            1432725776,
            4094571909,
            1467031594,
            275423344,
            851169720,
            430227734,
            3100823752,
            506948616,
            1363258195,
            659060556,
            3750685593,
            883997877,
            3785050280,
            958139571,
            3318307427,
            1322822218,
            3812723403,
            1537002063,
            2003034995,
            1747873779,
            3602036899,
            1955562222,
            1575990012,
            2024104815,
            1125592928,
            2227730452,
            2716904306,
            2361852424,
            442776044,
            2428436474,
            593698344,
            2756734187,
            3733110249,
            3204031479,
            2999351573,
            3329325298,
            3815920427,
            3391569614,
            3928383900,
            3515267271,
            566280711,
            3940187606,
            3454069534,
            4118630271,
            4000239992,
            116418474,
            1914138554,
            174292421,
            2731055270,
            289380356,
            3203993006,
            460393269,
            320620315,
            685471733,
            587496836,
            852142971,
            1086792851,
            1017036298,
            365543100,
            1126000580,
            2618297676,
            1288033470,
            3409855158,
            1501505948,
            4234509866,
            1607167915,
            987167468,
            1816402316,
            1246189591
          ];
          function K(e, t, n, r) {
            for (
              var i,
                o,
                s,
                a,
                h,
                u,
                c,
                f,
                l,
                d,
                p,
                g,
                y,
                A,
                b,
                _,
                v,
                w,
                m,
                I,
                E,
                C,
                B,
                x,
                k,
                S,
                Q = new Int32Array(16),
                D = new Int32Array(16),
                M = e[0],
                U = e[1],
                L = e[2],
                T = e[3],
                F = e[4],
                K = e[5],
                R = e[6],
                N = e[7],
                j = t[0],
                q = t[1],
                z = t[2],
                Y = t[3],
                P = t[4],
                H = t[5],
                G = t[6],
                V = t[7],
                W = 0;
              r >= 128;

            ) {
              for (m = 0; m < 16; m++)
                (I = 8 * m + W),
                  (Q[m] =
                    (n[I + 0] << 24) |
                    (n[I + 1] << 16) |
                    (n[I + 2] << 8) |
                    n[I + 3]),
                  (D[m] =
                    (n[I + 4] << 24) |
                    (n[I + 5] << 16) |
                    (n[I + 6] << 8) |
                    n[I + 7]);
              for (m = 0; m < 80; m++)
                if (
                  ((i = M),
                  (o = U),
                  (s = L),
                  (a = T),
                  (h = F),
                  (u = K),
                  (c = R),
                  N,
                  (l = j),
                  (d = q),
                  (p = z),
                  (g = Y),
                  (y = P),
                  (A = H),
                  (b = G),
                  V,
                  (B = 65535 & (C = V)),
                  (x = C >>> 16),
                  (k = 65535 & (E = N)),
                  (S = E >>> 16),
                  (B +=
                    65535 &
                    (C =
                      ((P >>> 14) | (F << 18)) ^
                      ((P >>> 18) | (F << 14)) ^
                      ((F >>> 9) | (P << 23)))),
                  (x += C >>> 16),
                  (k +=
                    65535 &
                    (E =
                      ((F >>> 14) | (P << 18)) ^
                      ((F >>> 18) | (P << 14)) ^
                      ((P >>> 9) | (F << 23)))),
                  (S += E >>> 16),
                  (B += 65535 & (C = (P & H) ^ (~P & G))),
                  (x += C >>> 16),
                  (k += 65535 & (E = (F & K) ^ (~F & R))),
                  (S += E >>> 16),
                  (E = O[2 * m]),
                  (B += 65535 & (C = O[2 * m + 1])),
                  (x += C >>> 16),
                  (k += 65535 & E),
                  (S += E >>> 16),
                  (E = Q[m % 16]),
                  (x += (C = D[m % 16]) >>> 16),
                  (k += 65535 & E),
                  (S += E >>> 16),
                  (k += (x += (B += 65535 & C) >>> 16) >>> 16),
                  (B = 65535 & (C = w = (65535 & B) | (x << 16))),
                  (x = C >>> 16),
                  (k = 65535 & (E = v = (65535 & k) | ((S += k >>> 16) << 16))),
                  (S = E >>> 16),
                  (B +=
                    65535 &
                    (C =
                      ((j >>> 28) | (M << 4)) ^
                      ((M >>> 2) | (j << 30)) ^
                      ((M >>> 7) | (j << 25)))),
                  (x += C >>> 16),
                  (k +=
                    65535 &
                    (E =
                      ((M >>> 28) | (j << 4)) ^
                      ((j >>> 2) | (M << 30)) ^
                      ((j >>> 7) | (M << 25)))),
                  (S += E >>> 16),
                  (x += (C = (j & q) ^ (j & z) ^ (q & z)) >>> 16),
                  (k += 65535 & (E = (M & U) ^ (M & L) ^ (U & L))),
                  (S += E >>> 16),
                  (f =
                    (65535 & (k += (x += (B += 65535 & C) >>> 16) >>> 16)) |
                    ((S += k >>> 16) << 16)),
                  (_ = (65535 & B) | (x << 16)),
                  (B = 65535 & (C = g)),
                  (x = C >>> 16),
                  (k = 65535 & (E = a)),
                  (S = E >>> 16),
                  (x += (C = w) >>> 16),
                  (k += 65535 & (E = v)),
                  (S += E >>> 16),
                  (U = i),
                  (L = o),
                  (T = s),
                  (F = a =
                    (65535 & (k += (x += (B += 65535 & C) >>> 16) >>> 16)) |
                    ((S += k >>> 16) << 16)),
                  (K = h),
                  (R = u),
                  (N = c),
                  (M = f),
                  (q = l),
                  (z = d),
                  (Y = p),
                  (P = g = (65535 & B) | (x << 16)),
                  (H = y),
                  (G = A),
                  (V = b),
                  (j = _),
                  m % 16 == 15)
                )
                  for (I = 0; I < 16; I++)
                    (E = Q[I]),
                      (B = 65535 & (C = D[I])),
                      (x = C >>> 16),
                      (k = 65535 & E),
                      (S = E >>> 16),
                      (E = Q[(I + 9) % 16]),
                      (B += 65535 & (C = D[(I + 9) % 16])),
                      (x += C >>> 16),
                      (k += 65535 & E),
                      (S += E >>> 16),
                      (v = Q[(I + 1) % 16]),
                      (B +=
                        65535 &
                        (C =
                          (((w = D[(I + 1) % 16]) >>> 1) | (v << 31)) ^
                          ((w >>> 8) | (v << 24)) ^
                          ((w >>> 7) | (v << 25)))),
                      (x += C >>> 16),
                      (k +=
                        65535 &
                        (E =
                          ((v >>> 1) | (w << 31)) ^
                          ((v >>> 8) | (w << 24)) ^
                          (v >>> 7))),
                      (S += E >>> 16),
                      (v = Q[(I + 14) % 16]),
                      (x +=
                        (C =
                          (((w = D[(I + 14) % 16]) >>> 19) | (v << 13)) ^
                          ((v >>> 29) | (w << 3)) ^
                          ((w >>> 6) | (v << 26))) >>> 16),
                      (k +=
                        65535 &
                        (E =
                          ((v >>> 19) | (w << 13)) ^
                          ((w >>> 29) | (v << 3)) ^
                          (v >>> 6))),
                      (S += E >>> 16),
                      (S +=
                        (k += (x += (B += 65535 & C) >>> 16) >>> 16) >>> 16),
                      (Q[I] = (65535 & k) | (S << 16)),
                      (D[I] = (65535 & B) | (x << 16));
              (B = 65535 & (C = j)),
                (x = C >>> 16),
                (k = 65535 & (E = M)),
                (S = E >>> 16),
                (E = e[0]),
                (x += (C = t[0]) >>> 16),
                (k += 65535 & E),
                (S += E >>> 16),
                (S += (k += (x += (B += 65535 & C) >>> 16) >>> 16) >>> 16),
                (e[0] = M = (65535 & k) | (S << 16)),
                (t[0] = j = (65535 & B) | (x << 16)),
                (B = 65535 & (C = q)),
                (x = C >>> 16),
                (k = 65535 & (E = U)),
                (S = E >>> 16),
                (E = e[1]),
                (x += (C = t[1]) >>> 16),
                (k += 65535 & E),
                (S += E >>> 16),
                (S += (k += (x += (B += 65535 & C) >>> 16) >>> 16) >>> 16),
                (e[1] = U = (65535 & k) | (S << 16)),
                (t[1] = q = (65535 & B) | (x << 16)),
                (B = 65535 & (C = z)),
                (x = C >>> 16),
                (k = 65535 & (E = L)),
                (S = E >>> 16),
                (E = e[2]),
                (x += (C = t[2]) >>> 16),
                (k += 65535 & E),
                (S += E >>> 16),
                (S += (k += (x += (B += 65535 & C) >>> 16) >>> 16) >>> 16),
                (e[2] = L = (65535 & k) | (S << 16)),
                (t[2] = z = (65535 & B) | (x << 16)),
                (B = 65535 & (C = Y)),
                (x = C >>> 16),
                (k = 65535 & (E = T)),
                (S = E >>> 16),
                (E = e[3]),
                (x += (C = t[3]) >>> 16),
                (k += 65535 & E),
                (S += E >>> 16),
                (S += (k += (x += (B += 65535 & C) >>> 16) >>> 16) >>> 16),
                (e[3] = T = (65535 & k) | (S << 16)),
                (t[3] = Y = (65535 & B) | (x << 16)),
                (B = 65535 & (C = P)),
                (x = C >>> 16),
                (k = 65535 & (E = F)),
                (S = E >>> 16),
                (E = e[4]),
                (x += (C = t[4]) >>> 16),
                (k += 65535 & E),
                (S += E >>> 16),
                (S += (k += (x += (B += 65535 & C) >>> 16) >>> 16) >>> 16),
                (e[4] = F = (65535 & k) | (S << 16)),
                (t[4] = P = (65535 & B) | (x << 16)),
                (B = 65535 & (C = H)),
                (x = C >>> 16),
                (k = 65535 & (E = K)),
                (S = E >>> 16),
                (E = e[5]),
                (x += (C = t[5]) >>> 16),
                (k += 65535 & E),
                (S += E >>> 16),
                (S += (k += (x += (B += 65535 & C) >>> 16) >>> 16) >>> 16),
                (e[5] = K = (65535 & k) | (S << 16)),
                (t[5] = H = (65535 & B) | (x << 16)),
                (B = 65535 & (C = G)),
                (x = C >>> 16),
                (k = 65535 & (E = R)),
                (S = E >>> 16),
                (E = e[6]),
                (x += (C = t[6]) >>> 16),
                (k += 65535 & E),
                (S += E >>> 16),
                (S += (k += (x += (B += 65535 & C) >>> 16) >>> 16) >>> 16),
                (e[6] = R = (65535 & k) | (S << 16)),
                (t[6] = G = (65535 & B) | (x << 16)),
                (B = 65535 & (C = V)),
                (x = C >>> 16),
                (k = 65535 & (E = N)),
                (S = E >>> 16),
                (E = e[7]),
                (x += (C = t[7]) >>> 16),
                (k += 65535 & E),
                (S += E >>> 16),
                (S += (k += (x += (B += 65535 & C) >>> 16) >>> 16) >>> 16),
                (e[7] = N = (65535 & k) | (S << 16)),
                (t[7] = V = (65535 & B) | (x << 16)),
                (W += 128),
                (r -= 128);
            }
            return r;
          }
          function R(e, t, n) {
            var r,
              i = new Int32Array(8),
              o = new Int32Array(8),
              s = new Uint8Array(256),
              a = n;
            for (
              i[0] = 1779033703,
                i[1] = 3144134277,
                i[2] = 1013904242,
                i[3] = 2773480762,
                i[4] = 1359893119,
                i[5] = 2600822924,
                i[6] = 528734635,
                i[7] = 1541459225,
                o[0] = 4089235720,
                o[1] = 2227873595,
                o[2] = 4271175723,
                o[3] = 1595750129,
                o[4] = 2917565137,
                o[5] = 725511199,
                o[6] = 4215389547,
                o[7] = 327033209,
                K(i, o, t, n),
                n %= 128,
                r = 0;
              r < n;
              r++
            )
              s[r] = t[a - n + r];
            for (
              s[n] = 128,
                s[(n = 256 - 128 * (n < 112 ? 1 : 0)) - 9] = 0,
                y(s, n - 8, (a / 536870912) | 0, a << 3),
                K(i, o, s, n),
                r = 0;
              r < 8;
              r++
            )
              y(e, 8 * r, i[r], o[r]);
            return 0;
          }
          function N(e, t) {
            var n = o(),
              r = o(),
              i = o(),
              s = o(),
              a = o(),
              h = o(),
              u = o(),
              c = o(),
              f = o();
            M(n, e[1], e[0]),
              M(f, t[1], t[0]),
              U(n, n, f),
              D(r, e[0], e[1]),
              D(f, t[0], t[1]),
              U(r, r, f),
              U(i, e[3], t[3]),
              U(i, i, l),
              U(s, e[2], t[2]),
              D(s, s, s),
              M(a, r, n),
              M(h, s, i),
              D(u, s, i),
              D(c, r, n),
              U(e[0], a, h),
              U(e[1], c, u),
              U(e[2], u, h),
              U(e[3], a, c);
          }
          function j(e, t, n) {
            var r;
            for (r = 0; r < 4; r++) B(e[r], t[r], n);
          }
          function q(e, t) {
            var n = o(),
              r = o(),
              i = o();
            T(i, t[2]),
              U(n, t[0], i),
              U(r, t[1], i),
              x(e, r),
              (e[31] ^= S(n) << 7);
          }
          function z(e, t, n) {
            var r, i;
            for (
              E(e[0], h), E(e[1], u), E(e[2], u), E(e[3], h), i = 255;
              i >= 0;
              --i
            )
              j(e, t, (r = (n[(i / 8) | 0] >> (7 & i)) & 1)),
                N(t, e),
                N(e, e),
                j(e, t, r);
          }
          function Y(e, t) {
            var n = [o(), o(), o(), o()];
            E(n[0], d), E(n[1], p), E(n[2], u), U(n[3], d, p), z(e, n, t);
          }
          function P(e, t, n) {
            ue(e, r.crypto_sign_PUBLICKEYBYTES),
              ue(t, r.crypto_sign_SECRETKEYBYTES);
            var i,
              a = new Uint8Array(64),
              h = [o(), o(), o(), o()];
            for (
              n || s(t, 32),
                R(a, t, 32),
                a[0] &= 248,
                a[31] &= 127,
                a[31] |= 64,
                Y(h, a),
                q(e, h),
                i = 0;
              i < 32;
              i++
            )
              t[i + 32] = e[i];
            return 0;
          }
          var H = new Float64Array([
            237,
            211,
            245,
            92,
            26,
            99,
            18,
            88,
            214,
            156,
            247,
            162,
            222,
            249,
            222,
            20,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            16
          ]);
          function G(e, t) {
            var n, r, i, o;
            for (r = 63; r >= 32; --r) {
              for (n = 0, i = r - 32, o = r - 12; i < o; ++i)
                (t[i] += n - 16 * t[r] * H[i - (r - 32)]),
                  (n = (t[i] + 128) >> 8),
                  (t[i] -= 256 * n);
              (t[i] += n), (t[r] = 0);
            }
            for (n = 0, i = 0; i < 32; i++)
              (t[i] += n - (t[31] >> 4) * H[i]), (n = t[i] >> 8), (t[i] &= 255);
            for (i = 0; i < 32; i++) t[i] -= n * H[i];
            for (r = 0; r < 32; r++)
              (t[r + 1] += t[r] >> 8), (e[r] = 255 & t[r]);
          }
          function V(e) {
            var t,
              n = new Float64Array(64);
            for (t = 0; t < 64; t++) n[t] = e[t];
            for (t = 0; t < 64; t++) e[t] = 0;
            G(e, n);
          }
          function W(e, t, n) {
            ue(e, se + t.length), ue(t, 0), ue(n, he);
            var r,
              i,
              s = t.length,
              a = new Uint8Array(64),
              h = new Uint8Array(64),
              u = new Uint8Array(64),
              c = new Float64Array(64),
              f = [o(), o(), o(), o()];
            R(a, n, 32), (a[0] &= 248), (a[31] &= 127), (a[31] |= 64);
            for (r = 0; r < s; r++) e[64 + r] = t[r];
            for (r = 0; r < 32; r++) e[32 + r] = a[32 + r];
            for (
              R(u, e.subarray(32), s + 32), V(u), Y(f, u), q(e, f), r = 32;
              r < 64;
              r++
            )
              e[r] = n[r];
            for (R(h, e, s + 64), V(h), r = 0; r < 64; r++) c[r] = 0;
            for (r = 0; r < 32; r++) c[r] = u[r];
            for (r = 0; r < 32; r++)
              for (i = 0; i < 32; i++) c[r + i] += h[r] * a[i];
            G(e.subarray(32), c);
          }
          function J(e, t) {
            var n = o(),
              r = o(),
              i = o(),
              s = o(),
              a = o(),
              c = o(),
              l = o();
            return (
              E(e[2], u),
              Q(e[1], t),
              L(i, e[1]),
              U(s, i, f),
              M(i, i, e[2]),
              D(s, e[2], s),
              L(a, s),
              L(c, a),
              U(l, c, a),
              U(n, l, i),
              U(n, n, s),
              (function(e, t) {
                var n,
                  r = o();
                for (n = 0; n < 16; n++) r[n] = t[n];
                for (n = 250; n >= 0; n--) L(r, r), 1 !== n && U(r, r, t);
                for (n = 0; n < 16; n++) e[n] = r[n];
              })(n, n),
              U(n, n, i),
              U(n, n, s),
              U(n, n, s),
              U(e[0], n, s),
              L(r, e[0]),
              U(r, r, s),
              k(r, i) && U(e[0], e[0], g),
              L(r, e[0]),
              U(r, r, s),
              k(r, i)
                ? -1
                : (S(e[0]) === t[31] >> 7 && M(e[0], h, e[0]),
                  U(e[3], e[0], e[1]),
                  0)
            );
          }
          function X(e, t, n) {
            ue(e, t.length - se), ue(t, se), ue(n, ae);
            var r,
              i = t.length,
              s = new Uint8Array(t.length),
              a = new Uint8Array(32),
              h = new Uint8Array(64),
              u = [o(), o(), o(), o()],
              c = [o(), o(), o(), o()];
            if ((-1, i < 64)) return !1;
            if (J(c, n)) return !1;
            for (r = 0; r < i; r++) s[r] = t[r];
            for (r = 0; r < 32; r++) s[r + 32] = n[r];
            if (
              (R(h, s, i),
              V(h),
              z(u, c, h),
              Y(c, t.subarray(32)),
              N(u, c),
              q(a, u),
              (i -= 64),
              b(t, 0, a, 0))
            ) {
              for (r = 0; r < i; r++) s[r] = 0;
              return !1;
            }
            for (r = 0; r < i; r++) e[r] = t[r + 64];
            return i, !0;
          }
          function $(e, t, n, i) {
            var o;
            ue(t, 0),
              ue(e, t.length + r.crypto_secretbox_MACBYTES),
              ue(n, te),
              ue(i, ee);
            var s = new Uint8Array(ne + t.length),
              a = new Uint8Array(s.length);
            for (o = 0; o < t.length; o++) s[o + ne] = t[o];
            for (
              (function(e, t, n, r, i) {
                var o;
                if (n < 32) return -1;
                for (
                  v(e, 0, t, 0, 0, r, i), w(e, 16, e, 32, n - 32, e), o = 0;
                  o < 16;
                  o++
                )
                  e[o] = 0;
              })(a, s, s.length, n, i),
                o = re;
              o < a.length;
              o++
            )
              e[o - re] = a[o];
          }
          function Z(e, t, n, i) {
            var o;
            ue(t, r.crypto_secretbox_MACBYTES),
              ue(e, t.length - r.crypto_secretbox_MACBYTES),
              ue(n, te),
              ue(i, ee);
            var s = new Uint8Array(re + t.length),
              a = new Uint8Array(s.length);
            for (o = 0; o < t.length; o++) s[o + re] = t[o];
            if (s.length < 32) return !1;
            if (0 !== I(a, s, s.length, n, i)) return !1;
            for (o = ne; o < a.length; o++) e[o - ne] = a[o];
            return !0;
          }
          var ee = 32,
            te = 24,
            ne = 32,
            re = 16,
            ie = 32,
            oe = 32,
            se = 64,
            ae = 32,
            he = 64;
          function ue(e, t) {
            if (!e || (t && e.length < t))
              throw new Error(
                "Argument must be a buffer" + (t ? " of length " + t : "")
              );
          }
          function ce(e) {
            Object.keys(e).forEach(function(n) {
              t.exports[n] = e[n];
            });
          }
          (r.memzero = function(e, t) {
            for (var n = t; n < e; n++) arr[n] = 0;
          }),
            (r.crypto_sign_BYTES = se),
            (r.crypto_sign_PUBLICKEYBYTES = ae),
            (r.crypto_sign_SECRETKEYBYTES = he),
            (r.crypto_sign_SEEDBYTES = 32),
            (r.crypto_sign_keypair = P),
            (r.crypto_sign_seed_keypair = function(e, t, n) {
              ue(n, r.crypto_sign_SEEDBYTES), n.copy(t), P(e, t, !0);
            }),
            (r.crypto_sign = W),
            (r.crypto_sign_open = X),
            (r.crypto_sign_detached = function(e, t, n) {
              var r = new Uint8Array(t.length + se);
              W(r, t, n);
              for (var i = 0; i < se; i++) e[i] = r[i];
            }),
            (r.crypto_sign_verify_detached = function(e, t, n) {
              ue(e, se);
              var r = new Uint8Array(t.length + se),
                i = 0;
              for (i = 0; i < se; i++) r[i] = e[i];
              for (i = 0; i < t.length; i++) r[i + se] = t[i];
              return X(t, r, n);
            }),
            ce(e("./crypto_generichash")),
            ce(e("./crypto_kdf")),
            ce(e("./crypto_shorthash")),
            ce(e("./randombytes")),
            ce(e("./crypto_stream")),
            (r.crypto_scalarmult_BYTES = ie),
            (r.crypto_scalarmult_SCALARBYTES = oe),
            (r.crypto_scalarmult_base = function(e, t) {
              return F(e, t, a);
            }),
            (r.crypto_scalarmult = F),
            (r.crypto_secretbox_KEYBYTES = ee),
            (r.crypto_secretbox_NONCEBYTES = te),
            (r.crypto_secretbox_MACBYTES = 16),
            (r.crypto_secretbox_easy = $),
            (r.crypto_secretbox_open_easy = Z),
            (r.crypto_secretbox_detached = function(e, t, n, i, o) {
              ue(t, r.crypto_secretbox_MACBYTES);
              var s = new Uint8Array(n.length + t.length);
              $(s, n, i, o),
                e.set(s.subarray(0, n.length)),
                t.set(s.subarray(n.length));
            }),
            (r.crypto_secretbox_open_detached = function(e, t, n, i, o) {
              ue(n, r.crypto_secretbox_MACBYTES);
              var s = new Uint8Array(t.length + n.length);
              return s.set(t), s.set(n, e.length), Z(e, s, i, o);
            });
        },
        {
          "./crypto_generichash": 134,
          "./crypto_kdf": 135,
          "./crypto_shorthash": 136,
          "./crypto_stream": 137,
          "./randombytes": 139
        }
      ],
      139: [
        function(e, t, n) {
          (function(n) {
            var r = e("nanoassert"),
              i = (function() {
                var t = 65536,
                  r = void 0 !== n ? (r = n.crypto || n.msCrypto) : null;
                return r && r.getRandomValues
                  ? function(e, n) {
                      for (var i = 0; i < n; i += t)
                        r.getRandomValues(
                          e.subarray(i, i + Math.min(n - i, t))
                        );
                    }
                  : void 0 !== e && (r = e("crypto")) && r.randomBytes
                  ? function(e, t) {
                      e.set(r.randomBytes(t));
                    }
                  : function() {
                      throw new Error(
                        "No secure random number generator available"
                      );
                    };
              })();
            Object.defineProperty(t.exports, "randombytes", { value: i }),
              (t.exports.randombytes_buf = function(e) {
                r(e, "out must be given"), i(e, e.length);
              });
          }.call(
            this,
            "undefined" != typeof global
              ? global
              : "undefined" != typeof self
              ? self
              : "undefined" != typeof window
              ? window
              : {}
          ));
        },
        { crypto: 168, nanoassert: 80 }
      ],
      140: [
        function(e, t, n) {
          t.exports = e("sodium-javascript");
        },
        { "sodium-javascript": 138 }
      ],
      141: [
        function(e, t, n) {
          t.exports = function(e, t) {
            var n = new Array(t.length),
              r = 0,
              i = 0;
            for (; r < e.length && i < t.length; ) {
              var o = e[r],
                s = t[i];
              o !== s ? (o < s ? r++ : (n[i++] = -1)) : (n[i++] = r);
            }
            for (; i < t.length; i++) n[i] = -1;
            return n;
          };
        },
        {}
      ],
      142: [
        function(e, t, n) {
          (function(n) {
            var r = e("memory-pager");
            function i(e) {
              if (!(this instanceof i)) return new i(e);
              if (
                (e || (e = {}),
                n.isBuffer(e) && (e = { buffer: e }),
                (this.pageOffset = e.pageOffset || 0),
                (this.pageSize = e.pageSize || 1024),
                (this.pages = e.pages || r(this.pageSize)),
                (this.byteLength = this.pages.length * this.pageSize),
                (this.length = 8 * this.byteLength),
                (t = this.pageSize) & (t - 1))
              )
                throw new Error("The page size should be a power of two");
              var t;
              if (
                ((this._trackUpdates = !!e.trackUpdates),
                (this._pageMask = this.pageSize - 1),
                e.buffer)
              ) {
                for (var o = 0; o < e.buffer.length; o += this.pageSize)
                  this.pages.set(
                    o / this.pageSize,
                    e.buffer.slice(o, o + this.pageSize)
                  );
                (this.byteLength = e.buffer.length),
                  (this.length = 8 * this.byteLength);
              }
            }
            (t.exports = i),
              (i.prototype.get = function(e) {
                var t = 7 & e,
                  n = (e - t) / 8;
                return !!(this.getByte(n) & (128 >> t));
              }),
              (i.prototype.getByte = function(e) {
                var t = e & this._pageMask,
                  n = (e - t) / this.pageSize,
                  r = this.pages.get(n, !0);
                return r ? r.buffer[t + this.pageOffset] : 0;
              }),
              (i.prototype.set = function(e, t) {
                var n = 7 & e,
                  r = (e - n) / 8,
                  i = this.getByte(r);
                return this.setByte(
                  r,
                  t ? i | (128 >> n) : i & (255 ^ (128 >> n))
                );
              }),
              (i.prototype.toBuffer = function() {
                for (
                  var e = (function(e) {
                      if (n.alloc) return n.alloc(e);
                      var t = new n(e);
                      return t.fill(0), t;
                    })(this.pages.length * this.pageSize),
                    t = 0;
                  t < this.pages.length;
                  t++
                ) {
                  var r = this.pages.get(t, !0),
                    i = t * this.pageSize;
                  r &&
                    r.buffer.copy(
                      e,
                      i,
                      this.pageOffset,
                      this.pageOffset + this.pageSize
                    );
                }
                return e;
              }),
              (i.prototype.setByte = function(e, t) {
                var n = e & this._pageMask,
                  r = (e - n) / this.pageSize,
                  i = this.pages.get(r, !1);
                return (
                  (n += this.pageOffset),
                  i.buffer[n] !== t &&
                    ((i.buffer[n] = t),
                    e >= this.byteLength &&
                      ((this.byteLength = e + 1),
                      (this.length = 8 * this.byteLength)),
                    this._trackUpdates && this.pages.updated(i),
                    !0)
                );
              });
          }.call(this, e("buffer").Buffer));
        },
        { buffer: 169, "memory-pager": 76 }
      ],
      143: [
        function(e, t, n) {
          var r = e("once");
          t.exports = function(e, t) {
            if (!t) return e;
            var n = [];
            return (
              (t = r(t)),
              e.on("data", function(e) {
                n.push(e);
              }),
              e.on("end", function() {
                t(null, n);
              }),
              e.on("close", function() {
                t(new Error("Premature close"));
              }),
              e.on("error", t),
              e
            );
          };
        },
        { once: 84 }
      ],
      144: [
        function(e, t, n) {
          var r = e("end-of-stream"),
            i = e("stream-shift");
          t.exports = function(e, t, n) {
            var o = !0,
              s = null,
              a = !1,
              h = !1,
              u = !1;
            e.on("readable", c),
              c(),
              n &&
                r(e, { readable: !0, writable: !1 }, function(e) {
                  s || (s = e);
                  (a = !0), h || n(s);
                });
            return e;
            function c() {
              o && l();
            }
            function f(t) {
              return (
                (h = !1),
                t
                  ? ((s = t), a ? n(s) : void e.destroy(t))
                  : a
                  ? n(s)
                  : void (u || l())
              );
            }
            function l() {
              for (; !h && !a; ) {
                o = !1;
                var n = i(e);
                if (a) return;
                if (null === n) return void (o = !0);
                (h = !0), (u = !0), t(n, f), (u = !1);
              }
            }
          };
        },
        { "end-of-stream": 37, "stream-shift": 145 }
      ],
      145: [
        function(e, t, n) {
          t.exports = function(e) {
            var t = e._readableState;
            return t
              ? t.objectMode
                ? e.read()
                : e.read(
                    ((n = t),
                    n.buffer.length
                      ? n.buffer.head
                        ? n.buffer.head.data.length
                        : n.buffer[0].length
                      : n.length)
                  )
              : null;
            var n;
          };
        },
        {}
      ],
      146: [
        function(e, t, n) {
          "use strict";
          var r = e("safe-buffer").Buffer,
            i =
              r.isEncoding ||
              function(e) {
                switch ((e = "" + e) && e.toLowerCase()) {
                  case "hex":
                  case "utf8":
                  case "utf-8":
                  case "ascii":
                  case "binary":
                  case "base64":
                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                  case "raw":
                    return !0;
                  default:
                    return !1;
                }
              };
          function o(e) {
            var t;
            switch (
              ((this.encoding = (function(e) {
                var t = (function(e) {
                  if (!e) return "utf8";
                  for (var t; ; )
                    switch (e) {
                      case "utf8":
                      case "utf-8":
                        return "utf8";
                      case "ucs2":
                      case "ucs-2":
                      case "utf16le":
                      case "utf-16le":
                        return "utf16le";
                      case "latin1":
                      case "binary":
                        return "latin1";
                      case "base64":
                      case "ascii":
                      case "hex":
                        return e;
                      default:
                        if (t) return;
                        (e = ("" + e).toLowerCase()), (t = !0);
                    }
                })(e);
                if ("string" != typeof t && (r.isEncoding === i || !i(e)))
                  throw new Error("Unknown encoding: " + e);
                return t || e;
              })(e)),
              this.encoding)
            ) {
              case "utf16le":
                (this.text = h), (this.end = u), (t = 4);
                break;
              case "utf8":
                (this.fillLast = a), (t = 4);
                break;
              case "base64":
                (this.text = c), (this.end = f), (t = 3);
                break;
              default:
                return (this.write = l), void (this.end = d);
            }
            (this.lastNeed = 0),
              (this.lastTotal = 0),
              (this.lastChar = r.allocUnsafe(t));
          }
          function s(e) {
            return e <= 127
              ? 0
              : e >> 5 == 6
              ? 2
              : e >> 4 == 14
              ? 3
              : e >> 3 == 30
              ? 4
              : e >> 6 == 2
              ? -1
              : -2;
          }
          function a(e) {
            var t = this.lastTotal - this.lastNeed,
              n = (function(e, t, n) {
                if (128 != (192 & t[0])) return (e.lastNeed = 0), "�";
                if (e.lastNeed > 1 && t.length > 1) {
                  if (128 != (192 & t[1])) return (e.lastNeed = 1), "�";
                  if (e.lastNeed > 2 && t.length > 2 && 128 != (192 & t[2]))
                    return (e.lastNeed = 2), "�";
                }
              })(this, e);
            return void 0 !== n
              ? n
              : this.lastNeed <= e.length
              ? (e.copy(this.lastChar, t, 0, this.lastNeed),
                this.lastChar.toString(this.encoding, 0, this.lastTotal))
              : (e.copy(this.lastChar, t, 0, e.length),
                void (this.lastNeed -= e.length));
          }
          function h(e, t) {
            if ((e.length - t) % 2 == 0) {
              var n = e.toString("utf16le", t);
              if (n) {
                var r = n.charCodeAt(n.length - 1);
                if (r >= 55296 && r <= 56319)
                  return (
                    (this.lastNeed = 2),
                    (this.lastTotal = 4),
                    (this.lastChar[0] = e[e.length - 2]),
                    (this.lastChar[1] = e[e.length - 1]),
                    n.slice(0, -1)
                  );
              }
              return n;
            }
            return (
              (this.lastNeed = 1),
              (this.lastTotal = 2),
              (this.lastChar[0] = e[e.length - 1]),
              e.toString("utf16le", t, e.length - 1)
            );
          }
          function u(e) {
            var t = e && e.length ? this.write(e) : "";
            if (this.lastNeed) {
              var n = this.lastTotal - this.lastNeed;
              return t + this.lastChar.toString("utf16le", 0, n);
            }
            return t;
          }
          function c(e, t) {
            var n = (e.length - t) % 3;
            return 0 === n
              ? e.toString("base64", t)
              : ((this.lastNeed = 3 - n),
                (this.lastTotal = 3),
                1 === n
                  ? (this.lastChar[0] = e[e.length - 1])
                  : ((this.lastChar[0] = e[e.length - 2]),
                    (this.lastChar[1] = e[e.length - 1])),
                e.toString("base64", t, e.length - n));
          }
          function f(e) {
            var t = e && e.length ? this.write(e) : "";
            return this.lastNeed
              ? t + this.lastChar.toString("base64", 0, 3 - this.lastNeed)
              : t;
          }
          function l(e) {
            return e.toString(this.encoding);
          }
          function d(e) {
            return e && e.length ? this.write(e) : "";
          }
          (n.StringDecoder = o),
            (o.prototype.write = function(e) {
              if (0 === e.length) return "";
              var t, n;
              if (this.lastNeed) {
                if (void 0 === (t = this.fillLast(e))) return "";
                (n = this.lastNeed), (this.lastNeed = 0);
              } else n = 0;
              return n < e.length
                ? t
                  ? t + this.text(e, n)
                  : this.text(e, n)
                : t || "";
            }),
            (o.prototype.end = function(e) {
              var t = e && e.length ? this.write(e) : "";
              return this.lastNeed ? t + "�" : t;
            }),
            (o.prototype.text = function(e, t) {
              var n = (function(e, t, n) {
                var r = t.length - 1;
                if (r < n) return 0;
                var i = s(t[r]);
                if (i >= 0) return i > 0 && (e.lastNeed = i - 1), i;
                if (--r < n || -2 === i) return 0;
                if ((i = s(t[r])) >= 0) return i > 0 && (e.lastNeed = i - 2), i;
                if (--r < n || -2 === i) return 0;
                if ((i = s(t[r])) >= 0)
                  return i > 0 && (2 === i ? (i = 0) : (e.lastNeed = i - 3)), i;
                return 0;
              })(this, e, t);
              if (!this.lastNeed) return e.toString("utf8", t);
              this.lastTotal = n;
              var r = e.length - (n - this.lastNeed);
              return e.copy(this.lastChar, 0, r), e.toString("utf8", t, r);
            }),
            (o.prototype.fillLast = function(e) {
              if (this.lastNeed <= e.length)
                return (
                  e.copy(
                    this.lastChar,
                    this.lastTotal - this.lastNeed,
                    0,
                    this.lastNeed
                  ),
                  this.lastChar.toString(this.encoding, 0, this.lastTotal)
                );
              e.copy(
                this.lastChar,
                this.lastTotal - this.lastNeed,
                0,
                e.length
              ),
                (this.lastNeed -= e.length);
            });
        },
        { "safe-buffer": 147 }
      ],
      147: [
        function(e, t, n) {
          arguments[4][116][0].apply(n, arguments);
        },
        { buffer: 169, dup: 116 }
      ],
      148: [
        function(e, t, n) {
          t.exports = function(e, t) {
            return new r(e, t);
          };
          class r {
            constructor(e, t) {
              (this._instance = e),
                (this._prefix = t),
                (this.app = e.app + this._prefix);
            }
            subscribe(e) {
              return this._instance.subscribe(this._prefix + e);
            }
            broadcast(e, t, n) {
              return this._instance.broadcast(this._prefix + e, t, n);
            }
            close(e) {
              return this._instance.close(e);
            }
          }
        },
        {}
      ],
      149: [
        function(e, t, n) {
          (function(n) {
            var r = e("readable-stream").Transform,
              i = e("util").inherits,
              o = e("xtend");
            function s(e) {
              r.call(this, e), (this._destroyed = !1);
            }
            function a(e, t, n) {
              n(null, e);
            }
            function h(e) {
              return function(t, n, r) {
                return (
                  "function" == typeof t && ((r = n), (n = t), (t = {})),
                  "function" != typeof n && (n = a),
                  "function" != typeof r && (r = null),
                  e(t, n, r)
                );
              };
            }
            i(s, r),
              (s.prototype.destroy = function(e) {
                if (!this._destroyed) {
                  this._destroyed = !0;
                  var t = this;
                  n.nextTick(function() {
                    e && t.emit("error", e), t.emit("close");
                  });
                }
              }),
              (t.exports = h(function(e, t, n) {
                var r = new s(e);
                return (r._transform = t), n && (r._flush = n), r;
              })),
              (t.exports.ctor = h(function(e, t, n) {
                function r(t) {
                  if (!(this instanceof r)) return new r(t);
                  (this.options = o(e, t)), s.call(this, this.options);
                }
                return (
                  i(r, s),
                  (r.prototype._transform = t),
                  n && (r.prototype._flush = n),
                  r
                );
              })),
              (t.exports.obj = h(function(e, t, n) {
                var r = new s(o({ objectMode: !0, highWaterMark: 16 }, e));
                return (r._transform = t), n && (r._flush = n), r;
              }));
          }.call(this, e("_process")));
        },
        { _process: 175, "readable-stream": 117, util: 179, xtend: 162 }
      ],
      150: [
        function(e, t, n) {
          var r = e("buffer-alloc"),
            i = Math.pow(2, 32);
          (n.encodingLength = function() {
            return 8;
          }),
            (n.encode = function(e, t, n) {
              t || (t = r(8)), n || (n = 0);
              var o = Math.floor(e / i),
                s = e - o * i;
              return t.writeUInt32BE(o, n), t.writeUInt32BE(s, n + 4), t;
            }),
            (n.decode = function(e, t) {
              t || (t = 0);
              var n = e.readUInt32BE(t),
                r = e.readUInt32BE(t + 4);
              return n * i + r;
            }),
            (n.encode.bytes = 8),
            (n.decode.bytes = 8);
        },
        { "buffer-alloc": 22 }
      ],
      151: [
        function(e, t, n) {
          "use strict";
          var r = e("normalize-path");
          t.exports = function(e, t) {
            return (e = r(e, t)).replace(/^([a-zA-Z]+:|\.\/)/, "");
          };
        },
        { "normalize-path": 83 }
      ],
      152: [
        function(e, t, n) {
          t.exports = function(e, t) {
            if (t >= e.length || t < 0) return;
            var n = e.pop();
            if (t < e.length) {
              var r = e[t];
              return (e[t] = n), r;
            }
            return n;
          };
        },
        {}
      ],
      153: [
        function(e, t, n) {
          (function(e) {
            function n(t) {
              try {
                if (!e.localStorage) return !1;
              } catch (e) {
                return !1;
              }
              var n = e.localStorage[t];
              return null != n && "true" === String(n).toLowerCase();
            }
            t.exports = function(e, t) {
              if (n("noDeprecation")) return e;
              var r = !1;
              return function() {
                if (!r) {
                  if (n("throwDeprecation")) throw new Error(t);
                  n("traceDeprecation") ? console.trace(t) : console.warn(t),
                    (r = !0);
                }
                return e.apply(this, arguments);
              };
            };
          }.call(
            this,
            "undefined" != typeof global
              ? global
              : "undefined" != typeof self
              ? self
              : "undefined" != typeof window
              ? window
              : {}
          ));
        },
        {}
      ],
      154: [
        function(e, t, n) {
          (function(n) {
            var r = e("simple-peer"),
              i = e("inherits"),
              o = e("events"),
              s = e("through2"),
              a = e("cuid"),
              h = e("once"),
              u = e("debug")("webrtc-swarm");
            function c(e, t) {
              if (!(this instanceof c)) return new c(e, t);
              if (!e) throw new Error("SignalHub instance required");
              t || (t = {}),
                o.EventEmitter.call(this),
                this.setMaxListeners(0),
                (this.hub = e),
                (this.wrtc = t.wrtc),
                (this.channelConfig = t.channelConfig),
                (this.config = t.config),
                (this.stream = t.stream),
                (this.wrap =
                  t.wrap ||
                  function(e) {
                    return e;
                  }),
                (this.unwrap =
                  t.unwrap ||
                  function(e) {
                    return e;
                  }),
                (this.offerConstraints = t.offerConstraints || {}),
                (this.maxPeers = t.maxPeers || 1 / 0),
                (this.me = t.uuid || a()),
                u("my uuid:", this.me),
                (this.remotes = {}),
                (this.peers = []),
                (this.closed = !1),
                (function(e, t) {
                  t.subscribe("all").pipe(
                    s.obj(function(t, n, i) {
                      if (((t = e.unwrap(t, "all")), e.closed || !t))
                        return i();
                      if ((u("/all", t), t.from === e.me))
                        return u("skipping self", t.from), i();
                      if ("connect" === t.type) {
                        if (e.peers.length >= e.maxPeers)
                          return (
                            u("skipping because maxPeers is met", t.from), i()
                          );
                        if (e.remotes[t.from])
                          return u("skipping existing remote", t.from), i();
                        u("connecting to new peer (as initiator)", t.from);
                        var o = new r({
                          wrtc: e.wrtc,
                          initiator: !0,
                          channelConfig: e.channelConfig,
                          config: e.config,
                          stream: e.stream,
                          offerConstraints: e.offerConstraints
                        });
                        f(e, o, t.from), (e.remotes[t.from] = o);
                      }
                      i();
                    })
                  ),
                    t
                      .subscribe(e.me)
                      .once(
                        "open",
                        function e(t, n) {
                          if (t.closed || t.peers.length >= t.maxPeers) return;
                          var r = { type: "connect", from: t.me };
                          r = t.wrap(r, "all");
                          n.broadcast("all", r, function() {
                            setTimeout(
                              e.bind(null, t, n),
                              Math.floor(2e3 * Math.random()) +
                                (t.peers.length ? 13e3 : 3e3)
                            );
                          });
                        }.bind(null, e, t)
                      )
                      .pipe(
                        s.obj(function(t, n, i) {
                          if (((t = e.unwrap(t, e.me)), e.closed || !t))
                            return i();
                          var o = e.remotes[t.from];
                          if (!o) {
                            if (!t.signal || "offer" !== t.signal.type)
                              return u("skipping non-offer", t), i();
                            u(
                              "connecting to new peer (as not initiator)",
                              t.from
                            ),
                              (o = e.remotes[t.from] = new r({
                                wrtc: e.wrtc,
                                channelConfig: e.channelConfig,
                                config: e.config,
                                stream: e.stream,
                                offerConstraints: e.offerConstraints
                              })),
                              f(e, o, t.from);
                          }
                          u("signalling", t.from, t.signal),
                            o.signal(t.signal),
                            i();
                        })
                      );
                })(this, e);
            }
            function f(e, t, n) {
              t.on("connect", function() {
                u("connected to peer", n),
                  e.peers.push(t),
                  e.emit("peer", t, n),
                  e.emit("connect", t, n);
              });
              var r = h(function(r) {
                  u("disconnected from peer", n, r),
                    e.remotes[n] === t && delete e.remotes[n];
                  var i = e.peers.indexOf(t);
                  i > -1 && e.peers.splice(i, 1), e.emit("disconnect", t, n);
                }),
                i = [],
                o = !1;
              t.on("signal", function(t) {
                i.push(t),
                  (function t() {
                    if (!e.closed && !o && i.length) {
                      o = !0;
                      var r = { from: e.me, signal: i.shift() };
                      (r = e.wrap(r, n)),
                        e.hub.broadcast(n, r, function() {
                          (o = !1), t();
                        });
                    }
                  })();
              }),
                t.on("error", r),
                t.once("close", r);
            }
            (t.exports = c),
              i(c, o.EventEmitter),
              (c.WEBRTC_SUPPORT = r.WEBRTC_SUPPORT),
              (c.prototype.close = function(e) {
                if (!this.closed) {
                  (this.closed = !0), e && this.once("close", e);
                  var t = this;
                  this.hub.close(function() {
                    var e = t.peers.length;
                    if (e > 0) {
                      var r = 0;
                      t.peers.forEach(function(i) {
                        i.once("close", function() {
                          ++r === e && t.emit("close");
                        }),
                          n.nextTick(function() {
                            i.destroy();
                          });
                      });
                    } else t.emit("close");
                  });
                }
              });
          }.call(this, e("_process")));
        },
        {
          _process: 175,
          cuid: 29,
          debug: 155,
          events: 170,
          inherits: 64,
          once: 84,
          "simple-peer": 128,
          through2: 149
        }
      ],
      155: [
        function(e, t, n) {
          arguments[4][129][0].apply(n, arguments);
        },
        { "./debug": 156, _process: 175, dup: 129 }
      ],
      156: [
        function(e, t, n) {
          arguments[4][130][0].apply(n, arguments);
        },
        { dup: 130, ms: 78 }
      ],
      157: [
        function(e, t, n) {
          (function(n, r) {
            "use strict";
            var i = e("readable-stream").Transform,
              o = e("duplexify"),
              s = e("ws"),
              a = e("safe-buffer").Buffer;
            t.exports = function(e, t, h) {
              var u,
                c,
                f = "browser" === n.title,
                l = !!r.WebSocket,
                d = f
                  ? function e(t, n, r) {
                      if (c.bufferedAmount > g)
                        return void setTimeout(e, y, t, n, r);
                      A && "string" == typeof t && (t = a.from(t, "utf8"));
                      try {
                        c.send(t);
                      } catch (e) {
                        return r(e);
                      }
                      r();
                    }
                  : function(e, t, n) {
                      if (c.readyState !== c.OPEN) return void n();
                      A && "string" == typeof e && (e = a.from(e, "utf8"));
                      c.send(e, n);
                    };
              t &&
                !Array.isArray(t) &&
                "object" == typeof t &&
                ((h = t),
                (t = null),
                ("string" == typeof h.protocol || Array.isArray(h.protocol)) &&
                  (t = h.protocol));
              h || (h = {});
              void 0 === h.objectMode &&
                (h.objectMode = !(!0 === h.binary || void 0 === h.binary));
              var p = (function(e, t, n) {
                var r = new i({ objectMode: e.objectMode });
                return (r._write = t), (r._flush = n), r;
              })(h, d, function(e) {
                c.close(), e();
              });
              h.objectMode || (p._writev = b);
              var g = h.browserBufferSize || 524288,
                y = h.browserBufferTimeout || 1e3;
              "object" == typeof e
                ? (c = e)
                : ((c = l && f ? new s(e, t) : new s(e, t, h)).binaryType =
                    "arraybuffer");
              c.readyState === c.OPEN
                ? (u = p)
                : ((u = u = o(void 0, void 0, h)),
                  h.objectMode || (u._writev = b),
                  (c.onopen = function() {
                    u.setReadable(p), u.setWritable(p), u.emit("connect");
                  }));
              (u.socket = c),
                (c.onclose = function() {
                  u.end(), u.destroy();
                }),
                (c.onerror = function(e) {
                  u.destroy(e);
                }),
                (c.onmessage = function(e) {
                  var t = e.data;
                  t = t instanceof ArrayBuffer ? a.from(t) : a.from(t, "utf8");
                  p.push(t);
                }),
                p.on("close", function() {
                  c.close();
                });
              var A = !h.objectMode;
              function b(e, t) {
                for (var n = new Array(e.length), r = 0; r < e.length; r++)
                  "string" == typeof e[r].chunk
                    ? (n[r] = a.from(e[r], "utf8"))
                    : (n[r] = e[r].chunk);
                this._write(a.concat(n), "binary", t);
              }
              return u;
            };
          }.call(
            this,
            e("_process"),
            "undefined" != typeof global
              ? global
              : "undefined" != typeof self
              ? self
              : "undefined" != typeof window
              ? window
              : {}
          ));
        },
        {
          _process: 175,
          duplexify: 36,
          "readable-stream": 117,
          "safe-buffer": 120,
          ws: 158
        }
      ],
      158: [
        function(e, t, n) {
          var r = null;
          "undefined" != typeof WebSocket
            ? (r = WebSocket)
            : "undefined" != typeof MozWebSocket
            ? (r = MozWebSocket)
            : "undefined" != typeof window &&
              (r = window.WebSocket || window.MozWebSocket),
            (t.exports = r);
        },
        {}
      ],
      159: [
        function(e, t, n) {
          t.exports = function e(t, n) {
            if (t && n) return e(t)(n);
            if ("function" != typeof t)
              throw new TypeError("need wrapper function");
            Object.keys(t).forEach(function(e) {
              r[e] = t[e];
            });
            return r;
            function r() {
              for (
                var e = new Array(arguments.length), n = 0;
                n < e.length;
                n++
              )
                e[n] = arguments[n];
              var r = t.apply(this, e),
                i = e[e.length - 1];
              return (
                "function" == typeof r &&
                  r !== i &&
                  Object.keys(i).forEach(function(e) {
                    r[e] = i[e];
                  }),
                r
              );
            }
          };
        },
        {}
      ],
      160: [
        function(e, t, n) {
          var r = e("./xsalsa20")(),
            i = new Uint8Array([
              101,
              120,
              112,
              97,
              110,
              100,
              32,
              51,
              50,
              45,
              98,
              121,
              116,
              101,
              32,
              107
            ]),
            o = 144,
            s = o,
            a = [];
          function h(e, t) {
            if (!(this instanceof h)) return new h(e, t);
            if (!e || e.length < 24)
              throw new Error("nonce must be at least 24 bytes");
            if (!t || t.length < 32)
              throw new Error("key must be at least 32 bytes");
            this._xor = r && r.exports ? new u(e, t) : new c(e, t);
          }
          function u(e, t) {
            a.length || (a.push(o), (o += 64)),
              (this._pointer = a.pop()),
              (this._nonce = this._pointer + 8),
              (this._key = this._nonce + 24),
              (this._overflow = 0),
              r.memory.fill(0, this._pointer, this._pointer + 8),
              r.memory.set(e, this._nonce),
              r.memory.set(t, this._key);
          }
          function c(e, t) {
            (this._s = new Uint8Array(32)),
              (this._z = new Uint8Array(16)),
              (this._overflow = 0),
              l(this._s, e, t, i);
            for (var n = 0; n < 8; n++) this._z[n] = e[n + 16];
          }
          function f(e, t, n, r) {
            for (
              var i,
                o =
                  (255 & r[0]) |
                  ((255 & r[1]) << 8) |
                  ((255 & r[2]) << 16) |
                  ((255 & r[3]) << 24),
                s =
                  (255 & n[0]) |
                  ((255 & n[1]) << 8) |
                  ((255 & n[2]) << 16) |
                  ((255 & n[3]) << 24),
                a =
                  (255 & n[4]) |
                  ((255 & n[5]) << 8) |
                  ((255 & n[6]) << 16) |
                  ((255 & n[7]) << 24),
                h =
                  (255 & n[8]) |
                  ((255 & n[9]) << 8) |
                  ((255 & n[10]) << 16) |
                  ((255 & n[11]) << 24),
                u =
                  (255 & n[12]) |
                  ((255 & n[13]) << 8) |
                  ((255 & n[14]) << 16) |
                  ((255 & n[15]) << 24),
                c =
                  (255 & r[4]) |
                  ((255 & r[5]) << 8) |
                  ((255 & r[6]) << 16) |
                  ((255 & r[7]) << 24),
                f =
                  (255 & t[0]) |
                  ((255 & t[1]) << 8) |
                  ((255 & t[2]) << 16) |
                  ((255 & t[3]) << 24),
                l =
                  (255 & t[4]) |
                  ((255 & t[5]) << 8) |
                  ((255 & t[6]) << 16) |
                  ((255 & t[7]) << 24),
                d =
                  (255 & t[8]) |
                  ((255 & t[9]) << 8) |
                  ((255 & t[10]) << 16) |
                  ((255 & t[11]) << 24),
                p =
                  (255 & t[12]) |
                  ((255 & t[13]) << 8) |
                  ((255 & t[14]) << 16) |
                  ((255 & t[15]) << 24),
                g =
                  (255 & r[8]) |
                  ((255 & r[9]) << 8) |
                  ((255 & r[10]) << 16) |
                  ((255 & r[11]) << 24),
                y =
                  (255 & n[16]) |
                  ((255 & n[17]) << 8) |
                  ((255 & n[18]) << 16) |
                  ((255 & n[19]) << 24),
                A =
                  (255 & n[20]) |
                  ((255 & n[21]) << 8) |
                  ((255 & n[22]) << 16) |
                  ((255 & n[23]) << 24),
                b =
                  (255 & n[24]) |
                  ((255 & n[25]) << 8) |
                  ((255 & n[26]) << 16) |
                  ((255 & n[27]) << 24),
                _ =
                  (255 & n[28]) |
                  ((255 & n[29]) << 8) |
                  ((255 & n[30]) << 16) |
                  ((255 & n[31]) << 24),
                v =
                  (255 & r[12]) |
                  ((255 & r[13]) << 8) |
                  ((255 & r[14]) << 16) |
                  ((255 & r[15]) << 24),
                w = o,
                m = s,
                I = a,
                E = h,
                C = u,
                B = c,
                x = f,
                k = l,
                S = d,
                Q = p,
                D = g,
                M = y,
                U = A,
                L = b,
                T = _,
                F = v,
                O = 0;
              O < 20;
              O += 2
            )
              (w ^=
                ((i =
                  ((U ^=
                    ((i =
                      ((S ^=
                        ((i =
                          ((C ^= ((i = (w + U) | 0) << 7) | (i >>> 25)) + w) |
                          0) <<
                          9) |
                        (i >>> 23)) +
                        C) |
                      0) <<
                      13) |
                    (i >>> 19)) +
                    S) |
                  0) <<
                  18) |
                (i >>> 14)),
                (B ^=
                  ((i =
                    ((m ^=
                      ((i =
                        ((L ^=
                          ((i =
                            ((Q ^= ((i = (B + m) | 0) << 7) | (i >>> 25)) + B) |
                            0) <<
                            9) |
                          (i >>> 23)) +
                          Q) |
                        0) <<
                        13) |
                      (i >>> 19)) +
                      L) |
                    0) <<
                    18) |
                  (i >>> 14)),
                (D ^=
                  ((i =
                    ((x ^=
                      ((i =
                        ((I ^=
                          ((i =
                            ((T ^= ((i = (D + x) | 0) << 7) | (i >>> 25)) + D) |
                            0) <<
                            9) |
                          (i >>> 23)) +
                          T) |
                        0) <<
                        13) |
                      (i >>> 19)) +
                      I) |
                    0) <<
                    18) |
                  (i >>> 14)),
                (F ^=
                  ((i =
                    ((M ^=
                      ((i =
                        ((k ^=
                          ((i =
                            ((E ^= ((i = (F + M) | 0) << 7) | (i >>> 25)) + F) |
                            0) <<
                            9) |
                          (i >>> 23)) +
                          E) |
                        0) <<
                        13) |
                      (i >>> 19)) +
                      k) |
                    0) <<
                    18) |
                  (i >>> 14)),
                (w ^=
                  ((i =
                    ((E ^=
                      ((i =
                        ((I ^=
                          ((i =
                            ((m ^= ((i = (w + E) | 0) << 7) | (i >>> 25)) + w) |
                            0) <<
                            9) |
                          (i >>> 23)) +
                          m) |
                        0) <<
                        13) |
                      (i >>> 19)) +
                      I) |
                    0) <<
                    18) |
                  (i >>> 14)),
                (B ^=
                  ((i =
                    ((C ^=
                      ((i =
                        ((k ^=
                          ((i =
                            ((x ^= ((i = (B + C) | 0) << 7) | (i >>> 25)) + B) |
                            0) <<
                            9) |
                          (i >>> 23)) +
                          x) |
                        0) <<
                        13) |
                      (i >>> 19)) +
                      k) |
                    0) <<
                    18) |
                  (i >>> 14)),
                (D ^=
                  ((i =
                    ((Q ^=
                      ((i =
                        ((S ^=
                          ((i =
                            ((M ^= ((i = (D + Q) | 0) << 7) | (i >>> 25)) + D) |
                            0) <<
                            9) |
                          (i >>> 23)) +
                          M) |
                        0) <<
                        13) |
                      (i >>> 19)) +
                      S) |
                    0) <<
                    18) |
                  (i >>> 14)),
                (F ^=
                  ((i =
                    ((T ^=
                      ((i =
                        ((L ^=
                          ((i =
                            ((U ^= ((i = (F + T) | 0) << 7) | (i >>> 25)) + F) |
                            0) <<
                            9) |
                          (i >>> 23)) +
                          U) |
                        0) <<
                        13) |
                      (i >>> 19)) +
                      L) |
                    0) <<
                    18) |
                  (i >>> 14));
            (w = (w + o) | 0),
              (m = (m + s) | 0),
              (I = (I + a) | 0),
              (E = (E + h) | 0),
              (C = (C + u) | 0),
              (B = (B + c) | 0),
              (x = (x + f) | 0),
              (k = (k + l) | 0),
              (S = (S + d) | 0),
              (Q = (Q + p) | 0),
              (D = (D + g) | 0),
              (M = (M + y) | 0),
              (U = (U + A) | 0),
              (L = (L + b) | 0),
              (T = (T + _) | 0),
              (F = (F + v) | 0),
              (e[0] = (w >>> 0) & 255),
              (e[1] = (w >>> 8) & 255),
              (e[2] = (w >>> 16) & 255),
              (e[3] = (w >>> 24) & 255),
              (e[4] = (m >>> 0) & 255),
              (e[5] = (m >>> 8) & 255),
              (e[6] = (m >>> 16) & 255),
              (e[7] = (m >>> 24) & 255),
              (e[8] = (I >>> 0) & 255),
              (e[9] = (I >>> 8) & 255),
              (e[10] = (I >>> 16) & 255),
              (e[11] = (I >>> 24) & 255),
              (e[12] = (E >>> 0) & 255),
              (e[13] = (E >>> 8) & 255),
              (e[14] = (E >>> 16) & 255),
              (e[15] = (E >>> 24) & 255),
              (e[16] = (C >>> 0) & 255),
              (e[17] = (C >>> 8) & 255),
              (e[18] = (C >>> 16) & 255),
              (e[19] = (C >>> 24) & 255),
              (e[20] = (B >>> 0) & 255),
              (e[21] = (B >>> 8) & 255),
              (e[22] = (B >>> 16) & 255),
              (e[23] = (B >>> 24) & 255),
              (e[24] = (x >>> 0) & 255),
              (e[25] = (x >>> 8) & 255),
              (e[26] = (x >>> 16) & 255),
              (e[27] = (x >>> 24) & 255),
              (e[28] = (k >>> 0) & 255),
              (e[29] = (k >>> 8) & 255),
              (e[30] = (k >>> 16) & 255),
              (e[31] = (k >>> 24) & 255),
              (e[32] = (S >>> 0) & 255),
              (e[33] = (S >>> 8) & 255),
              (e[34] = (S >>> 16) & 255),
              (e[35] = (S >>> 24) & 255),
              (e[36] = (Q >>> 0) & 255),
              (e[37] = (Q >>> 8) & 255),
              (e[38] = (Q >>> 16) & 255),
              (e[39] = (Q >>> 24) & 255),
              (e[40] = (D >>> 0) & 255),
              (e[41] = (D >>> 8) & 255),
              (e[42] = (D >>> 16) & 255),
              (e[43] = (D >>> 24) & 255),
              (e[44] = (M >>> 0) & 255),
              (e[45] = (M >>> 8) & 255),
              (e[46] = (M >>> 16) & 255),
              (e[47] = (M >>> 24) & 255),
              (e[48] = (U >>> 0) & 255),
              (e[49] = (U >>> 8) & 255),
              (e[50] = (U >>> 16) & 255),
              (e[51] = (U >>> 24) & 255),
              (e[52] = (L >>> 0) & 255),
              (e[53] = (L >>> 8) & 255),
              (e[54] = (L >>> 16) & 255),
              (e[55] = (L >>> 24) & 255),
              (e[56] = (T >>> 0) & 255),
              (e[57] = (T >>> 8) & 255),
              (e[58] = (T >>> 16) & 255),
              (e[59] = (T >>> 24) & 255),
              (e[60] = (F >>> 0) & 255),
              (e[61] = (F >>> 8) & 255),
              (e[62] = (F >>> 16) & 255),
              (e[63] = (F >>> 24) & 255);
          }
          function l(e, t, n, r) {
            for (
              var i,
                o =
                  (255 & r[0]) |
                  ((255 & r[1]) << 8) |
                  ((255 & r[2]) << 16) |
                  ((255 & r[3]) << 24),
                s =
                  (255 & n[0]) |
                  ((255 & n[1]) << 8) |
                  ((255 & n[2]) << 16) |
                  ((255 & n[3]) << 24),
                a =
                  (255 & n[4]) |
                  ((255 & n[5]) << 8) |
                  ((255 & n[6]) << 16) |
                  ((255 & n[7]) << 24),
                h =
                  (255 & n[8]) |
                  ((255 & n[9]) << 8) |
                  ((255 & n[10]) << 16) |
                  ((255 & n[11]) << 24),
                u =
                  (255 & n[12]) |
                  ((255 & n[13]) << 8) |
                  ((255 & n[14]) << 16) |
                  ((255 & n[15]) << 24),
                c =
                  (255 & r[4]) |
                  ((255 & r[5]) << 8) |
                  ((255 & r[6]) << 16) |
                  ((255 & r[7]) << 24),
                f =
                  (255 & t[0]) |
                  ((255 & t[1]) << 8) |
                  ((255 & t[2]) << 16) |
                  ((255 & t[3]) << 24),
                l =
                  (255 & t[4]) |
                  ((255 & t[5]) << 8) |
                  ((255 & t[6]) << 16) |
                  ((255 & t[7]) << 24),
                d =
                  (255 & t[8]) |
                  ((255 & t[9]) << 8) |
                  ((255 & t[10]) << 16) |
                  ((255 & t[11]) << 24),
                p =
                  (255 & t[12]) |
                  ((255 & t[13]) << 8) |
                  ((255 & t[14]) << 16) |
                  ((255 & t[15]) << 24),
                g =
                  (255 & r[8]) |
                  ((255 & r[9]) << 8) |
                  ((255 & r[10]) << 16) |
                  ((255 & r[11]) << 24),
                y =
                  (255 & n[16]) |
                  ((255 & n[17]) << 8) |
                  ((255 & n[18]) << 16) |
                  ((255 & n[19]) << 24),
                A =
                  (255 & n[20]) |
                  ((255 & n[21]) << 8) |
                  ((255 & n[22]) << 16) |
                  ((255 & n[23]) << 24),
                b =
                  (255 & n[24]) |
                  ((255 & n[25]) << 8) |
                  ((255 & n[26]) << 16) |
                  ((255 & n[27]) << 24),
                _ =
                  (255 & n[28]) |
                  ((255 & n[29]) << 8) |
                  ((255 & n[30]) << 16) |
                  ((255 & n[31]) << 24),
                v =
                  (255 & r[12]) |
                  ((255 & r[13]) << 8) |
                  ((255 & r[14]) << 16) |
                  ((255 & r[15]) << 24),
                w = 0;
              w < 20;
              w += 2
            )
              (o ^=
                ((i =
                  ((A ^=
                    ((i =
                      ((d ^=
                        ((i =
                          ((u ^= ((i = (o + A) | 0) << 7) | (i >>> 25)) + o) |
                          0) <<
                          9) |
                        (i >>> 23)) +
                        u) |
                      0) <<
                      13) |
                    (i >>> 19)) +
                    d) |
                  0) <<
                  18) |
                (i >>> 14)),
                (c ^=
                  ((i =
                    ((s ^=
                      ((i =
                        ((b ^=
                          ((i =
                            ((p ^= ((i = (c + s) | 0) << 7) | (i >>> 25)) + c) |
                            0) <<
                            9) |
                          (i >>> 23)) +
                          p) |
                        0) <<
                        13) |
                      (i >>> 19)) +
                      b) |
                    0) <<
                    18) |
                  (i >>> 14)),
                (g ^=
                  ((i =
                    ((f ^=
                      ((i =
                        ((a ^=
                          ((i =
                            ((_ ^= ((i = (g + f) | 0) << 7) | (i >>> 25)) + g) |
                            0) <<
                            9) |
                          (i >>> 23)) +
                          _) |
                        0) <<
                        13) |
                      (i >>> 19)) +
                      a) |
                    0) <<
                    18) |
                  (i >>> 14)),
                (v ^=
                  ((i =
                    ((y ^=
                      ((i =
                        ((l ^=
                          ((i =
                            ((h ^= ((i = (v + y) | 0) << 7) | (i >>> 25)) + v) |
                            0) <<
                            9) |
                          (i >>> 23)) +
                          h) |
                        0) <<
                        13) |
                      (i >>> 19)) +
                      l) |
                    0) <<
                    18) |
                  (i >>> 14)),
                (o ^=
                  ((i =
                    ((h ^=
                      ((i =
                        ((a ^=
                          ((i =
                            ((s ^= ((i = (o + h) | 0) << 7) | (i >>> 25)) + o) |
                            0) <<
                            9) |
                          (i >>> 23)) +
                          s) |
                        0) <<
                        13) |
                      (i >>> 19)) +
                      a) |
                    0) <<
                    18) |
                  (i >>> 14)),
                (c ^=
                  ((i =
                    ((u ^=
                      ((i =
                        ((l ^=
                          ((i =
                            ((f ^= ((i = (c + u) | 0) << 7) | (i >>> 25)) + c) |
                            0) <<
                            9) |
                          (i >>> 23)) +
                          f) |
                        0) <<
                        13) |
                      (i >>> 19)) +
                      l) |
                    0) <<
                    18) |
                  (i >>> 14)),
                (g ^=
                  ((i =
                    ((p ^=
                      ((i =
                        ((d ^=
                          ((i =
                            ((y ^= ((i = (g + p) | 0) << 7) | (i >>> 25)) + g) |
                            0) <<
                            9) |
                          (i >>> 23)) +
                          y) |
                        0) <<
                        13) |
                      (i >>> 19)) +
                      d) |
                    0) <<
                    18) |
                  (i >>> 14)),
                (v ^=
                  ((i =
                    ((_ ^=
                      ((i =
                        ((b ^=
                          ((i =
                            ((A ^= ((i = (v + _) | 0) << 7) | (i >>> 25)) + v) |
                            0) <<
                            9) |
                          (i >>> 23)) +
                          A) |
                        0) <<
                        13) |
                      (i >>> 19)) +
                      b) |
                    0) <<
                    18) |
                  (i >>> 14));
            (e[0] = (o >>> 0) & 255),
              (e[1] = (o >>> 8) & 255),
              (e[2] = (o >>> 16) & 255),
              (e[3] = (o >>> 24) & 255),
              (e[4] = (c >>> 0) & 255),
              (e[5] = (c >>> 8) & 255),
              (e[6] = (c >>> 16) & 255),
              (e[7] = (c >>> 24) & 255),
              (e[8] = (g >>> 0) & 255),
              (e[9] = (g >>> 8) & 255),
              (e[10] = (g >>> 16) & 255),
              (e[11] = (g >>> 24) & 255),
              (e[12] = (v >>> 0) & 255),
              (e[13] = (v >>> 8) & 255),
              (e[14] = (v >>> 16) & 255),
              (e[15] = (v >>> 24) & 255),
              (e[16] = (f >>> 0) & 255),
              (e[17] = (f >>> 8) & 255),
              (e[18] = (f >>> 16) & 255),
              (e[19] = (f >>> 24) & 255),
              (e[20] = (l >>> 0) & 255),
              (e[21] = (l >>> 8) & 255),
              (e[22] = (l >>> 16) & 255),
              (e[23] = (l >>> 24) & 255),
              (e[24] = (d >>> 0) & 255),
              (e[25] = (d >>> 8) & 255),
              (e[26] = (d >>> 16) & 255),
              (e[27] = (d >>> 24) & 255),
              (e[28] = (p >>> 0) & 255),
              (e[29] = (p >>> 8) & 255),
              (e[30] = (p >>> 16) & 255),
              (e[31] = (p >>> 24) & 255);
          }
          (t.exports = h),
            (h.NONCEBYTES = 24),
            (h.KEYBYTES = 32),
            (h.core_hsalsa20 = l),
            (h.SIGMA = i),
            (h.prototype.update = function(e, t) {
              if (!e) throw new Error("input must be Uint8Array or Buffer");
              return (
                t || (t = new Uint8Array(e.length)),
                e.length && this._xor.update(e, t),
                t
              );
            }),
            (h.prototype.final = h.prototype.finalize = function() {
              this._xor.finalize(), (this._xor = null);
            }),
            (u.prototype.update = function(e, t) {
              var n = this._overflow + e.length,
                i = o + this._overflow;
              (s = o + n) >= r.memory.length && r.realloc(s),
                r.memory.set(e, i),
                r.exports.xsalsa20_xor(
                  this._pointer,
                  o,
                  o,
                  n,
                  this._nonce,
                  this._key
                ),
                t.set(r.memory.subarray(i, o + n)),
                (this._overflow = 63 & n);
            }),
            (u.prototype.finalize = function() {
              r.memory.fill(0, this._pointer, this._key + 32),
                s > o && (r.memory.fill(0, o, s), (s = 0)),
                a.push(this._pointer);
            }),
            (c.prototype.update = function(e, t) {
              for (
                var n = new Uint8Array(64),
                  r = 0,
                  o = this._overflow,
                  s = e.length + this._overflow,
                  a = this._z,
                  h = -this._overflow,
                  u = -this._overflow;
                s >= 64;

              ) {
                for (f(n, a, this._s, i); o < 64; o++)
                  t[u + o] = e[h + o] ^ n[o];
                for (r = 1, o = 8; o < 16; o++)
                  (r += (255 & a[o]) | 0), (a[o] = 255 & r), (r >>>= 8);
                (s -= 64), (u += 64), (h += 64), (o = 0);
              }
              if (s > 0)
                for (f(n, a, this._s, i); o < s; o++)
                  t[u + o] = e[h + o] ^ n[o];
              this._overflow = 63 & s;
            }),
            (c.prototype.finalize = function() {
              this._s.fill(0), this._z.fill(0);
            });
        },
        { "./xsalsa20": 161 }
      ],
      161: [
        function(e, t, n) {
          function r(t) {
            if (!r.supported) return null;
            var n,
              o = t && t.imports,
              s =
                ((n =
                  "AGFzbQEAAAABGgNgBn9/f39/fwBgBn9/f39+fwF+YAN/f38AAwcGAAEBAgICBQUBAQroBwcoAwZtZW1vcnkCAAx4c2Fsc2EyMF94b3IAAAxjb3JlX3NhbHNhMjAABArqEQYYACAAIAEgAiADIAQgACkDACAFEAE3AwALPQBB8AAgAyAFEAMgACABIAIgA0EQaiAEQfAAEAJB8ABCADcDAEH4AEIANwMAQYABQgA3AwBBiAFCADcDAAuHBQEBfyACQQBGBEBCAA8LQdAAIAUpAwA3AwBB2AAgBUEIaikDADcDAEHgACAFQRBqKQMANwMAQegAIAVBGGopAwA3AwBBACADKQMANwMAQQggBDcDAAJAA0AgAkHAAEkNAUEQQQBB0AAQBSAAIAEpAwBBECkDAIU3AwAgAEEIaiABQQhqKQMAQRgpAwCFNwMAIABBEGogAUEQaikDAEEgKQMAhTcDACAAQRhqIAFBGGopAwBBKCkDAIU3AwAgAEEgaiABQSBqKQMAQTApAwCFNwMAIABBKGogAUEoaikDAEE4KQMAhTcDACAAQTBqIAFBMGopAwBBwAApAwCFNwMAIABBOGogAUE4aikDAEHIACkDAIU3AwBBCEEIKQMAQgF8NwMAIABBwABqIQAgAUHAAGohASACQcAAayECDAALC0EIKQMAIQQgAkEASwRAQRBBAEHQABAFAkACQAJAAkACQAJAAkACQCACQQhuDgcHBgUEAwIBAAsgAEE4aiABQThqKQMAQcgAKQMAhTcDAAsgAEEwaiABQTBqKQMAQcAAKQMAhTcDAAsgAEEoaiABQShqKQMAQTgpAwCFNwMACyAAQSBqIAFBIGopAwBBMCkDAIU3AwALIABBGGogAUEYaikDAEEoKQMAhTcDAAsgAEEQaiABQRBqKQMAQSApAwCFNwMACyAAQQhqIAFBCGopAwBBGCkDAIU3AwALIAAgASkDAEEQKQMAhTcDAAtBEEIANwMAQRhCADcDAEEgQgA3AwBBKEIANwMAQTBCADcDAEE4QgA3AwBBwABCADcDAEHIAEIANwMAQdAAQgA3AwBB2ABCADcDAEHgAEIANwMAQegAQgA3AwAgBA8LnQUBEX9B5fDBiwYhA0HuyIGZAyEIQbLaiMsHIQ1B9MqB2QYhEiACKAIAIQQgAkEEaigCACEFIAJBCGooAgAhBiACQQxqKAIAIQcgAkEQaigCACEOIAJBFGooAgAhDyACQRhqKAIAIRAgAkEcaigCACERIAEoAgAhCSABQQRqKAIAIQogAUEIaigCACELIAFBDGooAgAhDEEUIRMCQANAIBNBAEYNASAHIAMgD2pBB3dzIQcgCyAHIANqQQl3cyELIA8gCyAHakENd3MhDyADIA8gC2pBEndzIQMgDCAIIARqQQd3cyEMIBAgDCAIakEJd3MhECAEIBAgDGpBDXdzIQQgCCAEIBBqQRJ3cyEIIBEgDSAJakEHd3MhESAFIBEgDWpBCXdzIQUgCSAFIBFqQQ13cyEJIA0gCSAFakESd3MhDSAGIBIgDmpBB3dzIQYgCiAGIBJqQQl3cyEKIA4gCiAGakENd3MhDiASIA4gCmpBEndzIRIgBCADIAZqQQd3cyEEIAUgBCADakEJd3MhBSAGIAUgBGpBDXdzIQYgAyAGIAVqQRJ3cyEDIAkgCCAHakEHd3MhCSAKIAkgCGpBCXdzIQogByAKIAlqQQ13cyEHIAggByAKakESd3MhCCAOIA0gDGpBB3dzIQ4gCyAOIA1qQQl3cyELIAwgCyAOakENd3MhDCANIAwgC2pBEndzIQ0gDyASIBFqQQd3cyEPIBAgDyASakEJd3MhECARIBAgD2pBDXdzIREgEiARIBBqQRJ3cyESIBNBAmshEwwACwsgACADNgIAIABBBGogCDYCACAAQQhqIA02AgAgAEEMaiASNgIAIABBEGogCTYCACAAQRRqIAo2AgAgAEEYaiALNgIAIABBHGogDDYCAAsKACAAIAEgAhAFC90GASF/QeXwwYsGIQNB7siBmQMhCEGy2ojLByENQfTKgdkGIRIgAigCACEEIAJBBGooAgAhBSACQQhqKAIAIQYgAkEMaigCACEHIAJBEGooAgAhDiACQRRqKAIAIQ8gAkEYaigCACEQIAJBHGooAgAhESABKAIAIQkgAUEEaigCACEKIAFBCGooAgAhCyABQQxqKAIAIQwgAyETIAQhFCAFIRUgBiEWIAchFyAIIRggCSEZIAohGiALIRsgDCEcIA0hHSAOIR4gDyEfIBAhICARISEgEiEiQRQhIwJAA0AgI0EARg0BIAcgAyAPakEHd3MhByALIAcgA2pBCXdzIQsgDyALIAdqQQ13cyEPIAMgDyALakESd3MhAyAMIAggBGpBB3dzIQwgECAMIAhqQQl3cyEQIAQgECAMakENd3MhBCAIIAQgEGpBEndzIQggESANIAlqQQd3cyERIAUgESANakEJd3MhBSAJIAUgEWpBDXdzIQkgDSAJIAVqQRJ3cyENIAYgEiAOakEHd3MhBiAKIAYgEmpBCXdzIQogDiAKIAZqQQ13cyEOIBIgDiAKakESd3MhEiAEIAMgBmpBB3dzIQQgBSAEIANqQQl3cyEFIAYgBSAEakENd3MhBiADIAYgBWpBEndzIQMgCSAIIAdqQQd3cyEJIAogCSAIakEJd3MhCiAHIAogCWpBDXdzIQcgCCAHIApqQRJ3cyEIIA4gDSAMakEHd3MhDiALIA4gDWpBCXdzIQsgDCALIA5qQQ13cyEMIA0gDCALakESd3MhDSAPIBIgEWpBB3dzIQ8gECAPIBJqQQl3cyEQIBEgECAPakENd3MhESASIBEgEGpBEndzIRIgI0ECayEjDAALCyAAIAMgE2o2AgAgAEEEaiAEIBRqNgIAIABBCGogBSAVajYCACAAQQxqIAYgFmo2AgAgAEEQaiAHIBdqNgIAIABBFGogCCAYajYCACAAQRhqIAkgGWo2AgAgAEEcaiAKIBpqNgIAIABBIGogCyAbajYCACAAQSRqIAwgHGo2AgAgAEEoaiANIB1qNgIAIABBLGogDiAeajYCACAAQTBqIA8gH2o2AgAgAEE0aiAQICBqNgIAIABBOGogESAhajYCACAAQTxqIBIgImo2AgAL"),
                "function" == typeof atob
                  ? new Uint8Array(
                      atob(n)
                        .split("")
                        .map(i)
                    )
                  : new (e("buffer")).Buffer(n, "base64")),
              a = null,
              h = {
                buffer: s,
                memory: null,
                exports: null,
                realloc: function(e) {
                  h.exports.memory.grow(
                    Math.ceil(Math.abs(e - h.memory.length) / 65536)
                  ),
                    (h.memory = new Uint8Array(h.exports.memory.buffer));
                },
                onload: u
              };
            return u(function() {}), h;
            function u(e) {
              if (h.exports) return e();
              if (a) a.then(e.bind(null, null)).catch(e);
              else {
                try {
                  if (t && t.async) throw new Error("async");
                  c({
                    instance: new WebAssembly.Instance(
                      new WebAssembly.Module(s),
                      o
                    )
                  });
                } catch (e) {
                  a = WebAssembly.instantiate(s, o).then(c);
                }
                u(e);
              }
            }
            function c(e) {
              (h.exports = e.instance.exports),
                (h.memory =
                  h.exports.memory &&
                  h.exports.memory.buffer &&
                  new Uint8Array(h.exports.memory.buffer));
            }
          }
          function i(e) {
            return e.charCodeAt(0);
          }
          (t.exports = r), (r.supported = "undefined" != typeof WebAssembly);
        },
        {}
      ],
      162: [
        function(e, t, n) {
          t.exports = function() {
            for (var e = {}, t = 0; t < arguments.length; t++) {
              var n = arguments[t];
              for (var i in n) r.call(n, i) && (e[i] = n[i]);
            }
            return e;
          };
          var r = Object.prototype.hasOwnProperty;
        },
        {}
      ],
      163: [
        function(e, t, n) {
          (function(n) {
            "use strict";
            var r = e("object-assign");
            function i(e, t) {
              if (e === t) return 0;
              for (
                var n = e.length, r = t.length, i = 0, o = Math.min(n, r);
                i < o;
                ++i
              )
                if (e[i] !== t[i]) {
                  (n = e[i]), (r = t[i]);
                  break;
                }
              return n < r ? -1 : r < n ? 1 : 0;
            }
            function o(e) {
              return n.Buffer && "function" == typeof n.Buffer.isBuffer
                ? n.Buffer.isBuffer(e)
                : !(null == e || !e._isBuffer);
            }
            var s = e("util/"),
              a = Object.prototype.hasOwnProperty,
              h = Array.prototype.slice,
              u = "foo" === function() {}.name;
            function c(e) {
              return Object.prototype.toString.call(e);
            }
            function f(e) {
              return (
                !o(e) &&
                ("function" == typeof n.ArrayBuffer &&
                  ("function" == typeof ArrayBuffer.isView
                    ? ArrayBuffer.isView(e)
                    : !!e &&
                      (e instanceof DataView ||
                        !!(e.buffer && e.buffer instanceof ArrayBuffer))))
              );
            }
            var l = (t.exports = b),
              d = /\s*function\s+([^\(\s]*)\s*/;
            function p(e) {
              if (s.isFunction(e)) {
                if (u) return e.name;
                var t = e.toString().match(d);
                return t && t[1];
              }
            }
            function g(e, t) {
              return "string" == typeof e
                ? e.length < t
                  ? e
                  : e.slice(0, t)
                : e;
            }
            function y(e) {
              if (u || !s.isFunction(e)) return s.inspect(e);
              var t = p(e);
              return "[Function" + (t ? ": " + t : "") + "]";
            }
            function A(e, t, n, r, i) {
              throw new l.AssertionError({
                message: n,
                actual: e,
                expected: t,
                operator: r,
                stackStartFunction: i
              });
            }
            function b(e, t) {
              e || A(e, !0, t, "==", l.ok);
            }
            function _(e, t, n, r) {
              if (e === t) return !0;
              if (o(e) && o(t)) return 0 === i(e, t);
              if (s.isDate(e) && s.isDate(t))
                return e.getTime() === t.getTime();
              if (s.isRegExp(e) && s.isRegExp(t))
                return (
                  e.source === t.source &&
                  e.global === t.global &&
                  e.multiline === t.multiline &&
                  e.lastIndex === t.lastIndex &&
                  e.ignoreCase === t.ignoreCase
                );
              if (
                (null !== e && "object" == typeof e) ||
                (null !== t && "object" == typeof t)
              ) {
                if (
                  f(e) &&
                  f(t) &&
                  c(e) === c(t) &&
                  !(e instanceof Float32Array || e instanceof Float64Array)
                )
                  return (
                    0 === i(new Uint8Array(e.buffer), new Uint8Array(t.buffer))
                  );
                if (o(e) !== o(t)) return !1;
                var a = (r = r || { actual: [], expected: [] }).actual.indexOf(
                  e
                );
                return (
                  (-1 !== a && a === r.expected.indexOf(t)) ||
                  (r.actual.push(e),
                  r.expected.push(t),
                  (function(e, t, n, r) {
                    if (null == e || null == t) return !1;
                    if (s.isPrimitive(e) || s.isPrimitive(t)) return e === t;
                    if (
                      n &&
                      Object.getPrototypeOf(e) !== Object.getPrototypeOf(t)
                    )
                      return !1;
                    var i = v(e),
                      o = v(t);
                    if ((i && !o) || (!i && o)) return !1;
                    if (i) return (e = h.call(e)), (t = h.call(t)), _(e, t, n);
                    var a,
                      u,
                      c = I(e),
                      f = I(t);
                    if (c.length !== f.length) return !1;
                    for (c.sort(), f.sort(), u = c.length - 1; u >= 0; u--)
                      if (c[u] !== f[u]) return !1;
                    for (u = c.length - 1; u >= 0; u--)
                      if (((a = c[u]), !_(e[a], t[a], n, r))) return !1;
                    return !0;
                  })(e, t, n, r))
                );
              }
              return n ? e === t : e == t;
            }
            function v(e) {
              return "[object Arguments]" == Object.prototype.toString.call(e);
            }
            function w(e, t) {
              if (!e || !t) return !1;
              if ("[object RegExp]" == Object.prototype.toString.call(t))
                return t.test(e);
              try {
                if (e instanceof t) return !0;
              } catch (e) {}
              return !Error.isPrototypeOf(t) && !0 === t.call({}, e);
            }
            function m(e, t, n, r) {
              var i;
              if ("function" != typeof t)
                throw new TypeError('"block" argument must be a function');
              "string" == typeof n && ((r = n), (n = null)),
                (i = (function(e) {
                  var t;
                  try {
                    e();
                  } catch (e) {
                    t = e;
                  }
                  return t;
                })(t)),
                (r =
                  (n && n.name ? " (" + n.name + ")." : ".") +
                  (r ? " " + r : ".")),
                e && !i && A(i, n, "Missing expected exception" + r);
              var o = "string" == typeof r,
                a = !e && i && !n;
              if (
                (((!e && s.isError(i) && o && w(i, n)) || a) &&
                  A(i, n, "Got unwanted exception" + r),
                (e && i && n && !w(i, n)) || (!e && i))
              )
                throw i;
            }
            (l.AssertionError = function(e) {
              var t;
              (this.name = "AssertionError"),
                (this.actual = e.actual),
                (this.expected = e.expected),
                (this.operator = e.operator),
                e.message
                  ? ((this.message = e.message), (this.generatedMessage = !1))
                  : ((this.message =
                      g(y((t = this).actual), 128) +
                      " " +
                      t.operator +
                      " " +
                      g(y(t.expected), 128)),
                    (this.generatedMessage = !0));
              var n = e.stackStartFunction || A;
              if (Error.captureStackTrace) Error.captureStackTrace(this, n);
              else {
                var r = new Error();
                if (r.stack) {
                  var i = r.stack,
                    o = p(n),
                    s = i.indexOf("\n" + o);
                  if (s >= 0) {
                    var a = i.indexOf("\n", s + 1);
                    i = i.substring(a + 1);
                  }
                  this.stack = i;
                }
              }
            }),
              s.inherits(l.AssertionError, Error),
              (l.fail = A),
              (l.ok = b),
              (l.equal = function(e, t, n) {
                e != t && A(e, t, n, "==", l.equal);
              }),
              (l.notEqual = function(e, t, n) {
                e == t && A(e, t, n, "!=", l.notEqual);
              }),
              (l.deepEqual = function(e, t, n) {
                _(e, t, !1) || A(e, t, n, "deepEqual", l.deepEqual);
              }),
              (l.deepStrictEqual = function(e, t, n) {
                _(e, t, !0) || A(e, t, n, "deepStrictEqual", l.deepStrictEqual);
              }),
              (l.notDeepEqual = function(e, t, n) {
                _(e, t, !1) && A(e, t, n, "notDeepEqual", l.notDeepEqual);
              }),
              (l.notDeepStrictEqual = function e(t, n, r) {
                _(t, n, !0) && A(t, n, r, "notDeepStrictEqual", e);
              }),
              (l.strictEqual = function(e, t, n) {
                e !== t && A(e, t, n, "===", l.strictEqual);
              }),
              (l.notStrictEqual = function(e, t, n) {
                e === t && A(e, t, n, "!==", l.notStrictEqual);
              }),
              (l.throws = function(e, t, n) {
                m(!0, e, t, n);
              }),
              (l.doesNotThrow = function(e, t, n) {
                m(!1, e, t, n);
              }),
              (l.ifError = function(e) {
                if (e) throw e;
              }),
              (l.strict = r(
                function e(t, n) {
                  t || A(t, !0, n, "==", e);
                },
                l,
                {
                  equal: l.strictEqual,
                  deepEqual: l.deepStrictEqual,
                  notEqual: l.notStrictEqual,
                  notDeepEqual: l.notDeepStrictEqual
                }
              )),
              (l.strict.strict = l.strict);
            var I =
              Object.keys ||
              function(e) {
                var t = [];
                for (var n in e) a.call(e, n) && t.push(n);
                return t;
              };
          }.call(
            this,
            "undefined" != typeof global
              ? global
              : "undefined" != typeof self
              ? self
              : "undefined" != typeof window
              ? window
              : {}
          ));
        },
        { "object-assign": 173, "util/": 166 }
      ],
      164: [
        function(e, t, n) {
          "function" == typeof Object.create
            ? (t.exports = function(e, t) {
                (e.super_ = t),
                  (e.prototype = Object.create(t.prototype, {
                    constructor: {
                      value: e,
                      enumerable: !1,
                      writable: !0,
                      configurable: !0
                    }
                  }));
              })
            : (t.exports = function(e, t) {
                e.super_ = t;
                var n = function() {};
                (n.prototype = t.prototype),
                  (e.prototype = new n()),
                  (e.prototype.constructor = e);
              });
        },
        {}
      ],
      165: [
        function(e, t, n) {
          t.exports = function(e) {
            return (
              e &&
              "object" == typeof e &&
              "function" == typeof e.copy &&
              "function" == typeof e.fill &&
              "function" == typeof e.readUInt8
            );
          };
        },
        {}
      ],
      166: [
        function(e, t, n) {
          (function(t, r) {
            var i = /%[sdj%]/g;
            (n.format = function(e) {
              if (!A(e)) {
                for (var t = [], n = 0; n < arguments.length; n++)
                  t.push(a(arguments[n]));
                return t.join(" ");
              }
              n = 1;
              for (
                var r = arguments,
                  o = r.length,
                  s = String(e).replace(i, function(e) {
                    if ("%%" === e) return "%";
                    if (n >= o) return e;
                    switch (e) {
                      case "%s":
                        return String(r[n++]);
                      case "%d":
                        return Number(r[n++]);
                      case "%j":
                        try {
                          return JSON.stringify(r[n++]);
                        } catch (e) {
                          return "[Circular]";
                        }
                      default:
                        return e;
                    }
                  }),
                  h = r[n];
                n < o;
                h = r[++n]
              )
                g(h) || !v(h) ? (s += " " + h) : (s += " " + a(h));
              return s;
            }),
              (n.deprecate = function(e, i) {
                if (b(r.process))
                  return function() {
                    return n.deprecate(e, i).apply(this, arguments);
                  };
                if (!0 === t.noDeprecation) return e;
                var o = !1;
                return function() {
                  if (!o) {
                    if (t.throwDeprecation) throw new Error(i);
                    t.traceDeprecation ? console.trace(i) : console.error(i),
                      (o = !0);
                  }
                  return e.apply(this, arguments);
                };
              });
            var o,
              s = {};
            function a(e, t) {
              var r = { seen: [], stylize: u };
              return (
                arguments.length >= 3 && (r.depth = arguments[2]),
                arguments.length >= 4 && (r.colors = arguments[3]),
                p(t) ? (r.showHidden = t) : t && n._extend(r, t),
                b(r.showHidden) && (r.showHidden = !1),
                b(r.depth) && (r.depth = 2),
                b(r.colors) && (r.colors = !1),
                b(r.customInspect) && (r.customInspect = !0),
                r.colors && (r.stylize = h),
                c(r, e, r.depth)
              );
            }
            function h(e, t) {
              var n = a.styles[t];
              return n
                ? "[" + a.colors[n][0] + "m" + e + "[" + a.colors[n][1] + "m"
                : e;
            }
            function u(e, t) {
              return e;
            }
            function c(e, t, r) {
              if (
                e.customInspect &&
                t &&
                I(t.inspect) &&
                t.inspect !== n.inspect &&
                (!t.constructor || t.constructor.prototype !== t)
              ) {
                var i = t.inspect(r, e);
                return A(i) || (i = c(e, i, r)), i;
              }
              var o = (function(e, t) {
                if (b(t)) return e.stylize("undefined", "undefined");
                if (A(t)) {
                  var n =
                    "'" +
                    JSON.stringify(t)
                      .replace(/^"|"$/g, "")
                      .replace(/'/g, "\\'")
                      .replace(/\\"/g, '"') +
                    "'";
                  return e.stylize(n, "string");
                }
                if (y(t)) return e.stylize("" + t, "number");
                if (p(t)) return e.stylize("" + t, "boolean");
                if (g(t)) return e.stylize("null", "null");
              })(e, t);
              if (o) return o;
              var s = Object.keys(t),
                a = (function(e) {
                  var t = {};
                  return (
                    e.forEach(function(e, n) {
                      t[e] = !0;
                    }),
                    t
                  );
                })(s);
              if (
                (e.showHidden && (s = Object.getOwnPropertyNames(t)),
                m(t) &&
                  (s.indexOf("message") >= 0 || s.indexOf("description") >= 0))
              )
                return f(t);
              if (0 === s.length) {
                if (I(t)) {
                  var h = t.name ? ": " + t.name : "";
                  return e.stylize("[Function" + h + "]", "special");
                }
                if (_(t))
                  return e.stylize(RegExp.prototype.toString.call(t), "regexp");
                if (w(t))
                  return e.stylize(Date.prototype.toString.call(t), "date");
                if (m(t)) return f(t);
              }
              var u,
                v = "",
                E = !1,
                C = ["{", "}"];
              (d(t) && ((E = !0), (C = ["[", "]"])), I(t)) &&
                (v = " [Function" + (t.name ? ": " + t.name : "") + "]");
              return (
                _(t) && (v = " " + RegExp.prototype.toString.call(t)),
                w(t) && (v = " " + Date.prototype.toUTCString.call(t)),
                m(t) && (v = " " + f(t)),
                0 !== s.length || (E && 0 != t.length)
                  ? r < 0
                    ? _(t)
                      ? e.stylize(RegExp.prototype.toString.call(t), "regexp")
                      : e.stylize("[Object]", "special")
                    : (e.seen.push(t),
                      (u = E
                        ? (function(e, t, n, r, i) {
                            for (var o = [], s = 0, a = t.length; s < a; ++s)
                              x(t, String(s))
                                ? o.push(l(e, t, n, r, String(s), !0))
                                : o.push("");
                            return (
                              i.forEach(function(i) {
                                i.match(/^\d+$/) ||
                                  o.push(l(e, t, n, r, i, !0));
                              }),
                              o
                            );
                          })(e, t, r, a, s)
                        : s.map(function(n) {
                            return l(e, t, r, a, n, E);
                          })),
                      e.seen.pop(),
                      (function(e, t, n) {
                        if (
                          e.reduce(function(e, t) {
                            return (
                              0,
                              t.indexOf("\n") >= 0 && 0,
                              e + t.replace(/\u001b\[\d\d?m/g, "").length + 1
                            );
                          }, 0) > 60
                        )
                          return (
                            n[0] +
                            ("" === t ? "" : t + "\n ") +
                            " " +
                            e.join(",\n  ") +
                            " " +
                            n[1]
                          );
                        return n[0] + t + " " + e.join(", ") + " " + n[1];
                      })(u, v, C))
                  : C[0] + v + C[1]
              );
            }
            function f(e) {
              return "[" + Error.prototype.toString.call(e) + "]";
            }
            function l(e, t, n, r, i, o) {
              var s, a, h;
              if (
                ((h = Object.getOwnPropertyDescriptor(t, i) || { value: t[i] })
                  .get
                  ? (a = h.set
                      ? e.stylize("[Getter/Setter]", "special")
                      : e.stylize("[Getter]", "special"))
                  : h.set && (a = e.stylize("[Setter]", "special")),
                x(r, i) || (s = "[" + i + "]"),
                a ||
                  (e.seen.indexOf(h.value) < 0
                    ? (a = g(n)
                        ? c(e, h.value, null)
                        : c(e, h.value, n - 1)).indexOf("\n") > -1 &&
                      (a = o
                        ? a
                            .split("\n")
                            .map(function(e) {
                              return "  " + e;
                            })
                            .join("\n")
                            .substr(2)
                        : "\n" +
                          a
                            .split("\n")
                            .map(function(e) {
                              return "   " + e;
                            })
                            .join("\n"))
                    : (a = e.stylize("[Circular]", "special"))),
                b(s))
              ) {
                if (o && i.match(/^\d+$/)) return a;
                (s = JSON.stringify("" + i)).match(
                  /^"([a-zA-Z_][a-zA-Z_0-9]*)"$/
                )
                  ? ((s = s.substr(1, s.length - 2)),
                    (s = e.stylize(s, "name")))
                  : ((s = s
                      .replace(/'/g, "\\'")
                      .replace(/\\"/g, '"')
                      .replace(/(^"|"$)/g, "'")),
                    (s = e.stylize(s, "string")));
              }
              return s + ": " + a;
            }
            function d(e) {
              return Array.isArray(e);
            }
            function p(e) {
              return "boolean" == typeof e;
            }
            function g(e) {
              return null === e;
            }
            function y(e) {
              return "number" == typeof e;
            }
            function A(e) {
              return "string" == typeof e;
            }
            function b(e) {
              return void 0 === e;
            }
            function _(e) {
              return v(e) && "[object RegExp]" === E(e);
            }
            function v(e) {
              return "object" == typeof e && null !== e;
            }
            function w(e) {
              return v(e) && "[object Date]" === E(e);
            }
            function m(e) {
              return v(e) && ("[object Error]" === E(e) || e instanceof Error);
            }
            function I(e) {
              return "function" == typeof e;
            }
            function E(e) {
              return Object.prototype.toString.call(e);
            }
            function C(e) {
              return e < 10 ? "0" + e.toString(10) : e.toString(10);
            }
            (n.debuglog = function(e) {
              if (
                (b(o) && (o = t.env.NODE_DEBUG || ""),
                (e = e.toUpperCase()),
                !s[e])
              )
                if (new RegExp("\\b" + e + "\\b", "i").test(o)) {
                  var r = t.pid;
                  s[e] = function() {
                    var t = n.format.apply(n, arguments);
                    console.error("%s %d: %s", e, r, t);
                  };
                } else s[e] = function() {};
              return s[e];
            }),
              (n.inspect = a),
              (a.colors = {
                bold: [1, 22],
                italic: [3, 23],
                underline: [4, 24],
                inverse: [7, 27],
                white: [37, 39],
                grey: [90, 39],
                black: [30, 39],
                blue: [34, 39],
                cyan: [36, 39],
                green: [32, 39],
                magenta: [35, 39],
                red: [31, 39],
                yellow: [33, 39]
              }),
              (a.styles = {
                special: "cyan",
                number: "yellow",
                boolean: "yellow",
                undefined: "grey",
                null: "bold",
                string: "green",
                date: "magenta",
                regexp: "red"
              }),
              (n.isArray = d),
              (n.isBoolean = p),
              (n.isNull = g),
              (n.isNullOrUndefined = function(e) {
                return null == e;
              }),
              (n.isNumber = y),
              (n.isString = A),
              (n.isSymbol = function(e) {
                return "symbol" == typeof e;
              }),
              (n.isUndefined = b),
              (n.isRegExp = _),
              (n.isObject = v),
              (n.isDate = w),
              (n.isError = m),
              (n.isFunction = I),
              (n.isPrimitive = function(e) {
                return (
                  null === e ||
                  "boolean" == typeof e ||
                  "number" == typeof e ||
                  "string" == typeof e ||
                  "symbol" == typeof e ||
                  void 0 === e
                );
              }),
              (n.isBuffer = e("./support/isBuffer"));
            var B = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec"
            ];
            function x(e, t) {
              return Object.prototype.hasOwnProperty.call(e, t);
            }
            (n.log = function() {
              var e, t;
              console.log(
                "%s - %s",
                ((e = new Date()),
                (t = [
                  C(e.getHours()),
                  C(e.getMinutes()),
                  C(e.getSeconds())
                ].join(":")),
                [e.getDate(), B[e.getMonth()], t].join(" ")),
                n.format.apply(n, arguments)
              );
            }),
              (n.inherits = e("inherits")),
              (n._extend = function(e, t) {
                if (!t || !v(t)) return e;
                for (var n = Object.keys(t), r = n.length; r--; )
                  e[n[r]] = t[n[r]];
                return e;
              });
          }.call(
            this,
            e("_process"),
            "undefined" != typeof global
              ? global
              : "undefined" != typeof self
              ? self
              : "undefined" != typeof window
              ? window
              : {}
          ));
        },
        { "./support/isBuffer": 165, _process: 175, inherits: 164 }
      ],
      167: [
        function(e, t, n) {
          "use strict";
          (n.byteLength = function(e) {
            var t = u(e),
              n = t[0],
              r = t[1];
            return (3 * (n + r)) / 4 - r;
          }),
            (n.toByteArray = function(e) {
              var t,
                n,
                r = u(e),
                s = r[0],
                a = r[1],
                h = new o(
                  (function(e, t, n) {
                    return (3 * (t + n)) / 4 - n;
                  })(0, s, a)
                ),
                c = 0,
                f = a > 0 ? s - 4 : s;
              for (n = 0; n < f; n += 4)
                (t =
                  (i[e.charCodeAt(n)] << 18) |
                  (i[e.charCodeAt(n + 1)] << 12) |
                  (i[e.charCodeAt(n + 2)] << 6) |
                  i[e.charCodeAt(n + 3)]),
                  (h[c++] = (t >> 16) & 255),
                  (h[c++] = (t >> 8) & 255),
                  (h[c++] = 255 & t);
              2 === a &&
                ((t =
                  (i[e.charCodeAt(n)] << 2) | (i[e.charCodeAt(n + 1)] >> 4)),
                (h[c++] = 255 & t));
              1 === a &&
                ((t =
                  (i[e.charCodeAt(n)] << 10) |
                  (i[e.charCodeAt(n + 1)] << 4) |
                  (i[e.charCodeAt(n + 2)] >> 2)),
                (h[c++] = (t >> 8) & 255),
                (h[c++] = 255 & t));
              return h;
            }),
            (n.fromByteArray = function(e) {
              for (
                var t, n = e.length, i = n % 3, o = [], s = 0, a = n - i;
                s < a;
                s += 16383
              )
                o.push(c(e, s, s + 16383 > a ? a : s + 16383));
              1 === i
                ? ((t = e[n - 1]), o.push(r[t >> 2] + r[(t << 4) & 63] + "=="))
                : 2 === i &&
                  ((t = (e[n - 2] << 8) + e[n - 1]),
                  o.push(
                    r[t >> 10] + r[(t >> 4) & 63] + r[(t << 2) & 63] + "="
                  ));
              return o.join("");
            });
          for (
            var r = [],
              i = [],
              o = "undefined" != typeof Uint8Array ? Uint8Array : Array,
              s =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
              a = 0,
              h = s.length;
            a < h;
            ++a
          )
            (r[a] = s[a]), (i[s.charCodeAt(a)] = a);
          function u(e) {
            var t = e.length;
            if (t % 4 > 0)
              throw new Error("Invalid string. Length must be a multiple of 4");
            var n = e.indexOf("=");
            return -1 === n && (n = t), [n, n === t ? 0 : 4 - (n % 4)];
          }
          function c(e, t, n) {
            for (var i, o, s = [], a = t; a < n; a += 3)
              (i =
                ((e[a] << 16) & 16711680) +
                ((e[a + 1] << 8) & 65280) +
                (255 & e[a + 2])),
                s.push(
                  r[((o = i) >> 18) & 63] +
                    r[(o >> 12) & 63] +
                    r[(o >> 6) & 63] +
                    r[63 & o]
                );
            return s.join("");
          }
          (i["-".charCodeAt(0)] = 62), (i["_".charCodeAt(0)] = 63);
        },
        {}
      ],
      168: [function(e, t, n) {}, {}],
      169: [
        function(e, t, n) {
          (function(t) {
            "use strict";
            var r = e("base64-js"),
              i = e("ieee754");
            (n.Buffer = t),
              (n.SlowBuffer = function(e) {
                +e != e && (e = 0);
                return t.alloc(+e);
              }),
              (n.INSPECT_MAX_BYTES = 50);
            var o = 2147483647;
            function s(e) {
              if (e > o)
                throw new RangeError(
                  'The value "' + e + '" is invalid for option "size"'
                );
              var n = new Uint8Array(e);
              return (n.__proto__ = t.prototype), n;
            }
            function t(e, t, n) {
              if ("number" == typeof e) {
                if ("string" == typeof t)
                  throw new TypeError(
                    'The "string" argument must be of type string. Received type number'
                  );
                return u(e);
              }
              return a(e, t, n);
            }
            function a(e, n, r) {
              if ("string" == typeof e)
                return (function(e, n) {
                  ("string" == typeof n && "" !== n) || (n = "utf8");
                  if (!t.isEncoding(n))
                    throw new TypeError("Unknown encoding: " + n);
                  var r = 0 | l(e, n),
                    i = s(r),
                    o = i.write(e, n);
                  o !== r && (i = i.slice(0, o));
                  return i;
                })(e, n);
              if (ArrayBuffer.isView(e)) return c(e);
              if (null == e)
                throw TypeError(
                  "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " +
                    typeof e
                );
              if (R(e, ArrayBuffer) || (e && R(e.buffer, ArrayBuffer)))
                return (function(e, n, r) {
                  if (n < 0 || e.byteLength < n)
                    throw new RangeError(
                      '"offset" is outside of buffer bounds'
                    );
                  if (e.byteLength < n + (r || 0))
                    throw new RangeError(
                      '"length" is outside of buffer bounds'
                    );
                  var i;
                  i =
                    void 0 === n && void 0 === r
                      ? new Uint8Array(e)
                      : void 0 === r
                      ? new Uint8Array(e, n)
                      : new Uint8Array(e, n, r);
                  return (i.__proto__ = t.prototype), i;
                })(e, n, r);
              if ("number" == typeof e)
                throw new TypeError(
                  'The "value" argument must not be of type number. Received type number'
                );
              var i = e.valueOf && e.valueOf();
              if (null != i && i !== e) return t.from(i, n, r);
              var o = (function(e) {
                if (t.isBuffer(e)) {
                  var n = 0 | f(e.length),
                    r = s(n);
                  return 0 === r.length ? r : (e.copy(r, 0, 0, n), r);
                }
                if (void 0 !== e.length)
                  return "number" != typeof e.length || N(e.length)
                    ? s(0)
                    : c(e);
                if ("Buffer" === e.type && Array.isArray(e.data))
                  return c(e.data);
              })(e);
              if (o) return o;
              if (
                "undefined" != typeof Symbol &&
                null != Symbol.toPrimitive &&
                "function" == typeof e[Symbol.toPrimitive]
              )
                return t.from(e[Symbol.toPrimitive]("string"), n, r);
              throw new TypeError(
                "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " +
                  typeof e
              );
            }
            function h(e) {
              if ("number" != typeof e)
                throw new TypeError('"size" argument must be of type number');
              if (e < 0)
                throw new RangeError(
                  'The value "' + e + '" is invalid for option "size"'
                );
            }
            function u(e) {
              return h(e), s(e < 0 ? 0 : 0 | f(e));
            }
            function c(e) {
              for (
                var t = e.length < 0 ? 0 : 0 | f(e.length), n = s(t), r = 0;
                r < t;
                r += 1
              )
                n[r] = 255 & e[r];
              return n;
            }
            function f(e) {
              if (e >= o)
                throw new RangeError(
                  "Attempt to allocate Buffer larger than maximum size: 0x" +
                    o.toString(16) +
                    " bytes"
                );
              return 0 | e;
            }
            function l(e, n) {
              if (t.isBuffer(e)) return e.length;
              if (ArrayBuffer.isView(e) || R(e, ArrayBuffer))
                return e.byteLength;
              if ("string" != typeof e)
                throw new TypeError(
                  'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' +
                    typeof e
                );
              var r = e.length,
                i = arguments.length > 2 && !0 === arguments[2];
              if (!i && 0 === r) return 0;
              for (var o = !1; ; )
                switch (n) {
                  case "ascii":
                  case "latin1":
                  case "binary":
                    return r;
                  case "utf8":
                  case "utf-8":
                    return F(e).length;
                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                    return 2 * r;
                  case "hex":
                    return r >>> 1;
                  case "base64":
                    return O(e).length;
                  default:
                    if (o) return i ? -1 : F(e).length;
                    (n = ("" + n).toLowerCase()), (o = !0);
                }
            }
            function d(e, t, n) {
              var r = e[t];
              (e[t] = e[n]), (e[n] = r);
            }
            function p(e, n, r, i, o) {
              if (0 === e.length) return -1;
              if (
                ("string" == typeof r
                  ? ((i = r), (r = 0))
                  : r > 2147483647
                  ? (r = 2147483647)
                  : r < -2147483648 && (r = -2147483648),
                N((r = +r)) && (r = o ? 0 : e.length - 1),
                r < 0 && (r = e.length + r),
                r >= e.length)
              ) {
                if (o) return -1;
                r = e.length - 1;
              } else if (r < 0) {
                if (!o) return -1;
                r = 0;
              }
              if (("string" == typeof n && (n = t.from(n, i)), t.isBuffer(n)))
                return 0 === n.length ? -1 : g(e, n, r, i, o);
              if ("number" == typeof n)
                return (
                  (n &= 255),
                  "function" == typeof Uint8Array.prototype.indexOf
                    ? o
                      ? Uint8Array.prototype.indexOf.call(e, n, r)
                      : Uint8Array.prototype.lastIndexOf.call(e, n, r)
                    : g(e, [n], r, i, o)
                );
              throw new TypeError("val must be string, number or Buffer");
            }
            function g(e, t, n, r, i) {
              var o,
                s = 1,
                a = e.length,
                h = t.length;
              if (
                void 0 !== r &&
                ("ucs2" === (r = String(r).toLowerCase()) ||
                  "ucs-2" === r ||
                  "utf16le" === r ||
                  "utf-16le" === r)
              ) {
                if (e.length < 2 || t.length < 2) return -1;
                (s = 2), (a /= 2), (h /= 2), (n /= 2);
              }
              function u(e, t) {
                return 1 === s ? e[t] : e.readUInt16BE(t * s);
              }
              if (i) {
                var c = -1;
                for (o = n; o < a; o++)
                  if (u(e, o) === u(t, -1 === c ? 0 : o - c)) {
                    if ((-1 === c && (c = o), o - c + 1 === h)) return c * s;
                  } else -1 !== c && (o -= o - c), (c = -1);
              } else
                for (n + h > a && (n = a - h), o = n; o >= 0; o--) {
                  for (var f = !0, l = 0; l < h; l++)
                    if (u(e, o + l) !== u(t, l)) {
                      f = !1;
                      break;
                    }
                  if (f) return o;
                }
              return -1;
            }
            function y(e, t, n, r) {
              n = Number(n) || 0;
              var i = e.length - n;
              r ? (r = Number(r)) > i && (r = i) : (r = i);
              var o = t.length;
              r > o / 2 && (r = o / 2);
              for (var s = 0; s < r; ++s) {
                var a = parseInt(t.substr(2 * s, 2), 16);
                if (N(a)) return s;
                e[n + s] = a;
              }
              return s;
            }
            function A(e, t, n, r) {
              return K(F(t, e.length - n), e, n, r);
            }
            function b(e, t, n, r) {
              return K(
                (function(e) {
                  for (var t = [], n = 0; n < e.length; ++n)
                    t.push(255 & e.charCodeAt(n));
                  return t;
                })(t),
                e,
                n,
                r
              );
            }
            function _(e, t, n, r) {
              return b(e, t, n, r);
            }
            function v(e, t, n, r) {
              return K(O(t), e, n, r);
            }
            function w(e, t, n, r) {
              return K(
                (function(e, t) {
                  for (
                    var n, r, i, o = [], s = 0;
                    s < e.length && !((t -= 2) < 0);
                    ++s
                  )
                    (n = e.charCodeAt(s)),
                      (r = n >> 8),
                      (i = n % 256),
                      o.push(i),
                      o.push(r);
                  return o;
                })(t, e.length - n),
                e,
                n,
                r
              );
            }
            function m(e, t, n) {
              return 0 === t && n === e.length
                ? r.fromByteArray(e)
                : r.fromByteArray(e.slice(t, n));
            }
            function I(e, t, n) {
              n = Math.min(e.length, n);
              for (var r = [], i = t; i < n; ) {
                var o,
                  s,
                  a,
                  h,
                  u = e[i],
                  c = null,
                  f = u > 239 ? 4 : u > 223 ? 3 : u > 191 ? 2 : 1;
                if (i + f <= n)
                  switch (f) {
                    case 1:
                      u < 128 && (c = u);
                      break;
                    case 2:
                      128 == (192 & (o = e[i + 1])) &&
                        (h = ((31 & u) << 6) | (63 & o)) > 127 &&
                        (c = h);
                      break;
                    case 3:
                      (o = e[i + 1]),
                        (s = e[i + 2]),
                        128 == (192 & o) &&
                          128 == (192 & s) &&
                          (h = ((15 & u) << 12) | ((63 & o) << 6) | (63 & s)) >
                            2047 &&
                          (h < 55296 || h > 57343) &&
                          (c = h);
                      break;
                    case 4:
                      (o = e[i + 1]),
                        (s = e[i + 2]),
                        (a = e[i + 3]),
                        128 == (192 & o) &&
                          128 == (192 & s) &&
                          128 == (192 & a) &&
                          (h =
                            ((15 & u) << 18) |
                            ((63 & o) << 12) |
                            ((63 & s) << 6) |
                            (63 & a)) > 65535 &&
                          h < 1114112 &&
                          (c = h);
                  }
                null === c
                  ? ((c = 65533), (f = 1))
                  : c > 65535 &&
                    ((c -= 65536),
                    r.push(((c >>> 10) & 1023) | 55296),
                    (c = 56320 | (1023 & c))),
                  r.push(c),
                  (i += f);
              }
              return (function(e) {
                var t = e.length;
                if (t <= E) return String.fromCharCode.apply(String, e);
                var n = "",
                  r = 0;
                for (; r < t; )
                  n += String.fromCharCode.apply(String, e.slice(r, (r += E)));
                return n;
              })(r);
            }
            (n.kMaxLength = o),
              (t.TYPED_ARRAY_SUPPORT = (function() {
                try {
                  var e = new Uint8Array(1);
                  return (
                    (e.__proto__ = {
                      __proto__: Uint8Array.prototype,
                      foo: function() {
                        return 42;
                      }
                    }),
                    42 === e.foo()
                  );
                } catch (e) {
                  return !1;
                }
              })()),
              t.TYPED_ARRAY_SUPPORT ||
                "undefined" == typeof console ||
                "function" != typeof console.error ||
                console.error(
                  "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
                ),
              Object.defineProperty(t.prototype, "parent", {
                enumerable: !0,
                get: function() {
                  if (t.isBuffer(this)) return this.buffer;
                }
              }),
              Object.defineProperty(t.prototype, "offset", {
                enumerable: !0,
                get: function() {
                  if (t.isBuffer(this)) return this.byteOffset;
                }
              }),
              "undefined" != typeof Symbol &&
                null != Symbol.species &&
                t[Symbol.species] === t &&
                Object.defineProperty(t, Symbol.species, {
                  value: null,
                  configurable: !0,
                  enumerable: !1,
                  writable: !1
                }),
              (t.poolSize = 8192),
              (t.from = function(e, t, n) {
                return a(e, t, n);
              }),
              (t.prototype.__proto__ = Uint8Array.prototype),
              (t.__proto__ = Uint8Array),
              (t.alloc = function(e, t, n) {
                return (function(e, t, n) {
                  return (
                    h(e),
                    e <= 0
                      ? s(e)
                      : void 0 !== t
                      ? "string" == typeof n
                        ? s(e).fill(t, n)
                        : s(e).fill(t)
                      : s(e)
                  );
                })(e, t, n);
              }),
              (t.allocUnsafe = function(e) {
                return u(e);
              }),
              (t.allocUnsafeSlow = function(e) {
                return u(e);
              }),
              (t.isBuffer = function(e) {
                return null != e && !0 === e._isBuffer && e !== t.prototype;
              }),
              (t.compare = function(e, n) {
                if (
                  (R(e, Uint8Array) && (e = t.from(e, e.offset, e.byteLength)),
                  R(n, Uint8Array) && (n = t.from(n, n.offset, n.byteLength)),
                  !t.isBuffer(e) || !t.isBuffer(n))
                )
                  throw new TypeError(
                    'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
                  );
                if (e === n) return 0;
                for (
                  var r = e.length, i = n.length, o = 0, s = Math.min(r, i);
                  o < s;
                  ++o
                )
                  if (e[o] !== n[o]) {
                    (r = e[o]), (i = n[o]);
                    break;
                  }
                return r < i ? -1 : i < r ? 1 : 0;
              }),
              (t.isEncoding = function(e) {
                switch (String(e).toLowerCase()) {
                  case "hex":
                  case "utf8":
                  case "utf-8":
                  case "ascii":
                  case "latin1":
                  case "binary":
                  case "base64":
                  case "ucs2":
                  case "ucs-2":
                  case "utf16le":
                  case "utf-16le":
                    return !0;
                  default:
                    return !1;
                }
              }),
              (t.concat = function(e, n) {
                if (!Array.isArray(e))
                  throw new TypeError(
                    '"list" argument must be an Array of Buffers'
                  );
                if (0 === e.length) return t.alloc(0);
                var r;
                if (void 0 === n)
                  for (n = 0, r = 0; r < e.length; ++r) n += e[r].length;
                var i = t.allocUnsafe(n),
                  o = 0;
                for (r = 0; r < e.length; ++r) {
                  var s = e[r];
                  if ((R(s, Uint8Array) && (s = t.from(s)), !t.isBuffer(s)))
                    throw new TypeError(
                      '"list" argument must be an Array of Buffers'
                    );
                  s.copy(i, o), (o += s.length);
                }
                return i;
              }),
              (t.byteLength = l),
              (t.prototype._isBuffer = !0),
              (t.prototype.swap16 = function() {
                var e = this.length;
                if (e % 2 != 0)
                  throw new RangeError(
                    "Buffer size must be a multiple of 16-bits"
                  );
                for (var t = 0; t < e; t += 2) d(this, t, t + 1);
                return this;
              }),
              (t.prototype.swap32 = function() {
                var e = this.length;
                if (e % 4 != 0)
                  throw new RangeError(
                    "Buffer size must be a multiple of 32-bits"
                  );
                for (var t = 0; t < e; t += 4)
                  d(this, t, t + 3), d(this, t + 1, t + 2);
                return this;
              }),
              (t.prototype.swap64 = function() {
                var e = this.length;
                if (e % 8 != 0)
                  throw new RangeError(
                    "Buffer size must be a multiple of 64-bits"
                  );
                for (var t = 0; t < e; t += 8)
                  d(this, t, t + 7),
                    d(this, t + 1, t + 6),
                    d(this, t + 2, t + 5),
                    d(this, t + 3, t + 4);
                return this;
              }),
              (t.prototype.toString = function() {
                var e = this.length;
                return 0 === e
                  ? ""
                  : 0 === arguments.length
                  ? I(this, 0, e)
                  : function(e, t, n) {
                      var r = !1;
                      if (((void 0 === t || t < 0) && (t = 0), t > this.length))
                        return "";
                      if (
                        ((void 0 === n || n > this.length) && (n = this.length),
                        n <= 0)
                      )
                        return "";
                      if ((n >>>= 0) <= (t >>>= 0)) return "";
                      for (e || (e = "utf8"); ; )
                        switch (e) {
                          case "hex":
                            return x(this, t, n);
                          case "utf8":
                          case "utf-8":
                            return I(this, t, n);
                          case "ascii":
                            return C(this, t, n);
                          case "latin1":
                          case "binary":
                            return B(this, t, n);
                          case "base64":
                            return m(this, t, n);
                          case "ucs2":
                          case "ucs-2":
                          case "utf16le":
                          case "utf-16le":
                            return k(this, t, n);
                          default:
                            if (r)
                              throw new TypeError("Unknown encoding: " + e);
                            (e = (e + "").toLowerCase()), (r = !0);
                        }
                    }.apply(this, arguments);
              }),
              (t.prototype.toLocaleString = t.prototype.toString),
              (t.prototype.equals = function(e) {
                if (!t.isBuffer(e))
                  throw new TypeError("Argument must be a Buffer");
                return this === e || 0 === t.compare(this, e);
              }),
              (t.prototype.inspect = function() {
                var e = "",
                  t = n.INSPECT_MAX_BYTES;
                return (
                  (e = this.toString("hex", 0, t)
                    .replace(/(.{2})/g, "$1 ")
                    .trim()),
                  this.length > t && (e += " ... "),
                  "<Buffer " + e + ">"
                );
              }),
              (t.prototype.compare = function(e, n, r, i, o) {
                if (
                  (R(e, Uint8Array) && (e = t.from(e, e.offset, e.byteLength)),
                  !t.isBuffer(e))
                )
                  throw new TypeError(
                    'The "target" argument must be one of type Buffer or Uint8Array. Received type ' +
                      typeof e
                  );
                if (
                  (void 0 === n && (n = 0),
                  void 0 === r && (r = e ? e.length : 0),
                  void 0 === i && (i = 0),
                  void 0 === o && (o = this.length),
                  n < 0 || r > e.length || i < 0 || o > this.length)
                )
                  throw new RangeError("out of range index");
                if (i >= o && n >= r) return 0;
                if (i >= o) return -1;
                if (n >= r) return 1;
                if (this === e) return 0;
                for (
                  var s = (o >>>= 0) - (i >>>= 0),
                    a = (r >>>= 0) - (n >>>= 0),
                    h = Math.min(s, a),
                    u = this.slice(i, o),
                    c = e.slice(n, r),
                    f = 0;
                  f < h;
                  ++f
                )
                  if (u[f] !== c[f]) {
                    (s = u[f]), (a = c[f]);
                    break;
                  }
                return s < a ? -1 : a < s ? 1 : 0;
              }),
              (t.prototype.includes = function(e, t, n) {
                return -1 !== this.indexOf(e, t, n);
              }),
              (t.prototype.indexOf = function(e, t, n) {
                return p(this, e, t, n, !0);
              }),
              (t.prototype.lastIndexOf = function(e, t, n) {
                return p(this, e, t, n, !1);
              }),
              (t.prototype.write = function(e, t, n, r) {
                if (void 0 === t) (r = "utf8"), (n = this.length), (t = 0);
                else if (void 0 === n && "string" == typeof t)
                  (r = t), (n = this.length), (t = 0);
                else {
                  if (!isFinite(t))
                    throw new Error(
                      "Buffer.write(string, encoding, offset[, length]) is no longer supported"
                    );
                  (t >>>= 0),
                    isFinite(n)
                      ? ((n >>>= 0), void 0 === r && (r = "utf8"))
                      : ((r = n), (n = void 0));
                }
                var i = this.length - t;
                if (
                  ((void 0 === n || n > i) && (n = i),
                  (e.length > 0 && (n < 0 || t < 0)) || t > this.length)
                )
                  throw new RangeError(
                    "Attempt to write outside buffer bounds"
                  );
                r || (r = "utf8");
                for (var o = !1; ; )
                  switch (r) {
                    case "hex":
                      return y(this, e, t, n);
                    case "utf8":
                    case "utf-8":
                      return A(this, e, t, n);
                    case "ascii":
                      return b(this, e, t, n);
                    case "latin1":
                    case "binary":
                      return _(this, e, t, n);
                    case "base64":
                      return v(this, e, t, n);
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                      return w(this, e, t, n);
                    default:
                      if (o) throw new TypeError("Unknown encoding: " + r);
                      (r = ("" + r).toLowerCase()), (o = !0);
                  }
              }),
              (t.prototype.toJSON = function() {
                return {
                  type: "Buffer",
                  data: Array.prototype.slice.call(this._arr || this, 0)
                };
              });
            var E = 4096;
            function C(e, t, n) {
              var r = "";
              n = Math.min(e.length, n);
              for (var i = t; i < n; ++i) r += String.fromCharCode(127 & e[i]);
              return r;
            }
            function B(e, t, n) {
              var r = "";
              n = Math.min(e.length, n);
              for (var i = t; i < n; ++i) r += String.fromCharCode(e[i]);
              return r;
            }
            function x(e, t, n) {
              var r = e.length;
              (!t || t < 0) && (t = 0), (!n || n < 0 || n > r) && (n = r);
              for (var i = "", o = t; o < n; ++o) i += T(e[o]);
              return i;
            }
            function k(e, t, n) {
              for (var r = e.slice(t, n), i = "", o = 0; o < r.length; o += 2)
                i += String.fromCharCode(r[o] + 256 * r[o + 1]);
              return i;
            }
            function S(e, t, n) {
              if (e % 1 != 0 || e < 0)
                throw new RangeError("offset is not uint");
              if (e + t > n)
                throw new RangeError("Trying to access beyond buffer length");
            }
            function Q(e, n, r, i, o, s) {
              if (!t.isBuffer(e))
                throw new TypeError(
                  '"buffer" argument must be a Buffer instance'
                );
              if (n > o || n < s)
                throw new RangeError('"value" argument is out of bounds');
              if (r + i > e.length) throw new RangeError("Index out of range");
            }
            function D(e, t, n, r, i, o) {
              if (n + r > e.length) throw new RangeError("Index out of range");
              if (n < 0) throw new RangeError("Index out of range");
            }
            function M(e, t, n, r, o) {
              return (
                (t = +t),
                (n >>>= 0),
                o || D(e, 0, n, 4),
                i.write(e, t, n, r, 23, 4),
                n + 4
              );
            }
            function U(e, t, n, r, o) {
              return (
                (t = +t),
                (n >>>= 0),
                o || D(e, 0, n, 8),
                i.write(e, t, n, r, 52, 8),
                n + 8
              );
            }
            (t.prototype.slice = function(e, n) {
              var r = this.length;
              (e = ~~e) < 0 ? (e += r) < 0 && (e = 0) : e > r && (e = r),
                (n = void 0 === n ? r : ~~n) < 0
                  ? (n += r) < 0 && (n = 0)
                  : n > r && (n = r),
                n < e && (n = e);
              var i = this.subarray(e, n);
              return (i.__proto__ = t.prototype), i;
            }),
              (t.prototype.readUIntLE = function(e, t, n) {
                (e >>>= 0), (t >>>= 0), n || S(e, t, this.length);
                for (var r = this[e], i = 1, o = 0; ++o < t && (i *= 256); )
                  r += this[e + o] * i;
                return r;
              }),
              (t.prototype.readUIntBE = function(e, t, n) {
                (e >>>= 0), (t >>>= 0), n || S(e, t, this.length);
                for (var r = this[e + --t], i = 1; t > 0 && (i *= 256); )
                  r += this[e + --t] * i;
                return r;
              }),
              (t.prototype.readUInt8 = function(e, t) {
                return (e >>>= 0), t || S(e, 1, this.length), this[e];
              }),
              (t.prototype.readUInt16LE = function(e, t) {
                return (
                  (e >>>= 0),
                  t || S(e, 2, this.length),
                  this[e] | (this[e + 1] << 8)
                );
              }),
              (t.prototype.readUInt16BE = function(e, t) {
                return (
                  (e >>>= 0),
                  t || S(e, 2, this.length),
                  (this[e] << 8) | this[e + 1]
                );
              }),
              (t.prototype.readUInt32LE = function(e, t) {
                return (
                  (e >>>= 0),
                  t || S(e, 4, this.length),
                  (this[e] | (this[e + 1] << 8) | (this[e + 2] << 16)) +
                    16777216 * this[e + 3]
                );
              }),
              (t.prototype.readUInt32BE = function(e, t) {
                return (
                  (e >>>= 0),
                  t || S(e, 4, this.length),
                  16777216 * this[e] +
                    ((this[e + 1] << 16) | (this[e + 2] << 8) | this[e + 3])
                );
              }),
              (t.prototype.readIntLE = function(e, t, n) {
                (e >>>= 0), (t >>>= 0), n || S(e, t, this.length);
                for (var r = this[e], i = 1, o = 0; ++o < t && (i *= 256); )
                  r += this[e + o] * i;
                return r >= (i *= 128) && (r -= Math.pow(2, 8 * t)), r;
              }),
              (t.prototype.readIntBE = function(e, t, n) {
                (e >>>= 0), (t >>>= 0), n || S(e, t, this.length);
                for (var r = t, i = 1, o = this[e + --r]; r > 0 && (i *= 256); )
                  o += this[e + --r] * i;
                return o >= (i *= 128) && (o -= Math.pow(2, 8 * t)), o;
              }),
              (t.prototype.readInt8 = function(e, t) {
                return (
                  (e >>>= 0),
                  t || S(e, 1, this.length),
                  128 & this[e] ? -1 * (255 - this[e] + 1) : this[e]
                );
              }),
              (t.prototype.readInt16LE = function(e, t) {
                (e >>>= 0), t || S(e, 2, this.length);
                var n = this[e] | (this[e + 1] << 8);
                return 32768 & n ? 4294901760 | n : n;
              }),
              (t.prototype.readInt16BE = function(e, t) {
                (e >>>= 0), t || S(e, 2, this.length);
                var n = this[e + 1] | (this[e] << 8);
                return 32768 & n ? 4294901760 | n : n;
              }),
              (t.prototype.readInt32LE = function(e, t) {
                return (
                  (e >>>= 0),
                  t || S(e, 4, this.length),
                  this[e] |
                    (this[e + 1] << 8) |
                    (this[e + 2] << 16) |
                    (this[e + 3] << 24)
                );
              }),
              (t.prototype.readInt32BE = function(e, t) {
                return (
                  (e >>>= 0),
                  t || S(e, 4, this.length),
                  (this[e] << 24) |
                    (this[e + 1] << 16) |
                    (this[e + 2] << 8) |
                    this[e + 3]
                );
              }),
              (t.prototype.readFloatLE = function(e, t) {
                return (
                  (e >>>= 0),
                  t || S(e, 4, this.length),
                  i.read(this, e, !0, 23, 4)
                );
              }),
              (t.prototype.readFloatBE = function(e, t) {
                return (
                  (e >>>= 0),
                  t || S(e, 4, this.length),
                  i.read(this, e, !1, 23, 4)
                );
              }),
              (t.prototype.readDoubleLE = function(e, t) {
                return (
                  (e >>>= 0),
                  t || S(e, 8, this.length),
                  i.read(this, e, !0, 52, 8)
                );
              }),
              (t.prototype.readDoubleBE = function(e, t) {
                return (
                  (e >>>= 0),
                  t || S(e, 8, this.length),
                  i.read(this, e, !1, 52, 8)
                );
              }),
              (t.prototype.writeUIntLE = function(e, t, n, r) {
                ((e = +e), (t >>>= 0), (n >>>= 0), r) ||
                  Q(this, e, t, n, Math.pow(2, 8 * n) - 1, 0);
                var i = 1,
                  o = 0;
                for (this[t] = 255 & e; ++o < n && (i *= 256); )
                  this[t + o] = (e / i) & 255;
                return t + n;
              }),
              (t.prototype.writeUIntBE = function(e, t, n, r) {
                ((e = +e), (t >>>= 0), (n >>>= 0), r) ||
                  Q(this, e, t, n, Math.pow(2, 8 * n) - 1, 0);
                var i = n - 1,
                  o = 1;
                for (this[t + i] = 255 & e; --i >= 0 && (o *= 256); )
                  this[t + i] = (e / o) & 255;
                return t + n;
              }),
              (t.prototype.writeUInt8 = function(e, t, n) {
                return (
                  (e = +e),
                  (t >>>= 0),
                  n || Q(this, e, t, 1, 255, 0),
                  (this[t] = 255 & e),
                  t + 1
                );
              }),
              (t.prototype.writeUInt16LE = function(e, t, n) {
                return (
                  (e = +e),
                  (t >>>= 0),
                  n || Q(this, e, t, 2, 65535, 0),
                  (this[t] = 255 & e),
                  (this[t + 1] = e >>> 8),
                  t + 2
                );
              }),
              (t.prototype.writeUInt16BE = function(e, t, n) {
                return (
                  (e = +e),
                  (t >>>= 0),
                  n || Q(this, e, t, 2, 65535, 0),
                  (this[t] = e >>> 8),
                  (this[t + 1] = 255 & e),
                  t + 2
                );
              }),
              (t.prototype.writeUInt32LE = function(e, t, n) {
                return (
                  (e = +e),
                  (t >>>= 0),
                  n || Q(this, e, t, 4, 4294967295, 0),
                  (this[t + 3] = e >>> 24),
                  (this[t + 2] = e >>> 16),
                  (this[t + 1] = e >>> 8),
                  (this[t] = 255 & e),
                  t + 4
                );
              }),
              (t.prototype.writeUInt32BE = function(e, t, n) {
                return (
                  (e = +e),
                  (t >>>= 0),
                  n || Q(this, e, t, 4, 4294967295, 0),
                  (this[t] = e >>> 24),
                  (this[t + 1] = e >>> 16),
                  (this[t + 2] = e >>> 8),
                  (this[t + 3] = 255 & e),
                  t + 4
                );
              }),
              (t.prototype.writeIntLE = function(e, t, n, r) {
                if (((e = +e), (t >>>= 0), !r)) {
                  var i = Math.pow(2, 8 * n - 1);
                  Q(this, e, t, n, i - 1, -i);
                }
                var o = 0,
                  s = 1,
                  a = 0;
                for (this[t] = 255 & e; ++o < n && (s *= 256); )
                  e < 0 && 0 === a && 0 !== this[t + o - 1] && (a = 1),
                    (this[t + o] = (((e / s) >> 0) - a) & 255);
                return t + n;
              }),
              (t.prototype.writeIntBE = function(e, t, n, r) {
                if (((e = +e), (t >>>= 0), !r)) {
                  var i = Math.pow(2, 8 * n - 1);
                  Q(this, e, t, n, i - 1, -i);
                }
                var o = n - 1,
                  s = 1,
                  a = 0;
                for (this[t + o] = 255 & e; --o >= 0 && (s *= 256); )
                  e < 0 && 0 === a && 0 !== this[t + o + 1] && (a = 1),
                    (this[t + o] = (((e / s) >> 0) - a) & 255);
                return t + n;
              }),
              (t.prototype.writeInt8 = function(e, t, n) {
                return (
                  (e = +e),
                  (t >>>= 0),
                  n || Q(this, e, t, 1, 127, -128),
                  e < 0 && (e = 255 + e + 1),
                  (this[t] = 255 & e),
                  t + 1
                );
              }),
              (t.prototype.writeInt16LE = function(e, t, n) {
                return (
                  (e = +e),
                  (t >>>= 0),
                  n || Q(this, e, t, 2, 32767, -32768),
                  (this[t] = 255 & e),
                  (this[t + 1] = e >>> 8),
                  t + 2
                );
              }),
              (t.prototype.writeInt16BE = function(e, t, n) {
                return (
                  (e = +e),
                  (t >>>= 0),
                  n || Q(this, e, t, 2, 32767, -32768),
                  (this[t] = e >>> 8),
                  (this[t + 1] = 255 & e),
                  t + 2
                );
              }),
              (t.prototype.writeInt32LE = function(e, t, n) {
                return (
                  (e = +e),
                  (t >>>= 0),
                  n || Q(this, e, t, 4, 2147483647, -2147483648),
                  (this[t] = 255 & e),
                  (this[t + 1] = e >>> 8),
                  (this[t + 2] = e >>> 16),
                  (this[t + 3] = e >>> 24),
                  t + 4
                );
              }),
              (t.prototype.writeInt32BE = function(e, t, n) {
                return (
                  (e = +e),
                  (t >>>= 0),
                  n || Q(this, e, t, 4, 2147483647, -2147483648),
                  e < 0 && (e = 4294967295 + e + 1),
                  (this[t] = e >>> 24),
                  (this[t + 1] = e >>> 16),
                  (this[t + 2] = e >>> 8),
                  (this[t + 3] = 255 & e),
                  t + 4
                );
              }),
              (t.prototype.writeFloatLE = function(e, t, n) {
                return M(this, e, t, !0, n);
              }),
              (t.prototype.writeFloatBE = function(e, t, n) {
                return M(this, e, t, !1, n);
              }),
              (t.prototype.writeDoubleLE = function(e, t, n) {
                return U(this, e, t, !0, n);
              }),
              (t.prototype.writeDoubleBE = function(e, t, n) {
                return U(this, e, t, !1, n);
              }),
              (t.prototype.copy = function(e, n, r, i) {
                if (!t.isBuffer(e))
                  throw new TypeError("argument should be a Buffer");
                if (
                  (r || (r = 0),
                  i || 0 === i || (i = this.length),
                  n >= e.length && (n = e.length),
                  n || (n = 0),
                  i > 0 && i < r && (i = r),
                  i === r)
                )
                  return 0;
                if (0 === e.length || 0 === this.length) return 0;
                if (n < 0) throw new RangeError("targetStart out of bounds");
                if (r < 0 || r >= this.length)
                  throw new RangeError("Index out of range");
                if (i < 0) throw new RangeError("sourceEnd out of bounds");
                i > this.length && (i = this.length),
                  e.length - n < i - r && (i = e.length - n + r);
                var o = i - r;
                if (
                  this === e &&
                  "function" == typeof Uint8Array.prototype.copyWithin
                )
                  this.copyWithin(n, r, i);
                else if (this === e && r < n && n < i)
                  for (var s = o - 1; s >= 0; --s) e[s + n] = this[s + r];
                else Uint8Array.prototype.set.call(e, this.subarray(r, i), n);
                return o;
              }),
              (t.prototype.fill = function(e, n, r, i) {
                if ("string" == typeof e) {
                  if (
                    ("string" == typeof n
                      ? ((i = n), (n = 0), (r = this.length))
                      : "string" == typeof r && ((i = r), (r = this.length)),
                    void 0 !== i && "string" != typeof i)
                  )
                    throw new TypeError("encoding must be a string");
                  if ("string" == typeof i && !t.isEncoding(i))
                    throw new TypeError("Unknown encoding: " + i);
                  if (1 === e.length) {
                    var o = e.charCodeAt(0);
                    (("utf8" === i && o < 128) || "latin1" === i) && (e = o);
                  }
                } else "number" == typeof e && (e &= 255);
                if (n < 0 || this.length < n || this.length < r)
                  throw new RangeError("Out of range index");
                if (r <= n) return this;
                var s;
                if (
                  ((n >>>= 0),
                  (r = void 0 === r ? this.length : r >>> 0),
                  e || (e = 0),
                  "number" == typeof e)
                )
                  for (s = n; s < r; ++s) this[s] = e;
                else {
                  var a = t.isBuffer(e) ? e : t.from(e, i),
                    h = a.length;
                  if (0 === h)
                    throw new TypeError(
                      'The value "' + e + '" is invalid for argument "value"'
                    );
                  for (s = 0; s < r - n; ++s) this[s + n] = a[s % h];
                }
                return this;
              });
            var L = /[^+\/0-9A-Za-z-_]/g;
            function T(e) {
              return e < 16 ? "0" + e.toString(16) : e.toString(16);
            }
            function F(e, t) {
              var n;
              t = t || 1 / 0;
              for (var r = e.length, i = null, o = [], s = 0; s < r; ++s) {
                if ((n = e.charCodeAt(s)) > 55295 && n < 57344) {
                  if (!i) {
                    if (n > 56319) {
                      (t -= 3) > -1 && o.push(239, 191, 189);
                      continue;
                    }
                    if (s + 1 === r) {
                      (t -= 3) > -1 && o.push(239, 191, 189);
                      continue;
                    }
                    i = n;
                    continue;
                  }
                  if (n < 56320) {
                    (t -= 3) > -1 && o.push(239, 191, 189), (i = n);
                    continue;
                  }
                  n = 65536 + (((i - 55296) << 10) | (n - 56320));
                } else i && (t -= 3) > -1 && o.push(239, 191, 189);
                if (((i = null), n < 128)) {
                  if ((t -= 1) < 0) break;
                  o.push(n);
                } else if (n < 2048) {
                  if ((t -= 2) < 0) break;
                  o.push((n >> 6) | 192, (63 & n) | 128);
                } else if (n < 65536) {
                  if ((t -= 3) < 0) break;
                  o.push(
                    (n >> 12) | 224,
                    ((n >> 6) & 63) | 128,
                    (63 & n) | 128
                  );
                } else {
                  if (!(n < 1114112)) throw new Error("Invalid code point");
                  if ((t -= 4) < 0) break;
                  o.push(
                    (n >> 18) | 240,
                    ((n >> 12) & 63) | 128,
                    ((n >> 6) & 63) | 128,
                    (63 & n) | 128
                  );
                }
              }
              return o;
            }
            function O(e) {
              return r.toByteArray(
                (function(e) {
                  if (
                    (e = (e = e.split("=")[0]).trim().replace(L, "")).length < 2
                  )
                    return "";
                  for (; e.length % 4 != 0; ) e += "=";
                  return e;
                })(e)
              );
            }
            function K(e, t, n, r) {
              for (
                var i = 0;
                i < r && !(i + n >= t.length || i >= e.length);
                ++i
              )
                t[i + n] = e[i];
              return i;
            }
            function R(e, t) {
              return (
                e instanceof t ||
                (null != e &&
                  null != e.constructor &&
                  null != e.constructor.name &&
                  e.constructor.name === t.name)
              );
            }
            function N(e) {
              return e != e;
            }
          }.call(this, e("buffer").Buffer));
        },
        { "base64-js": 167, buffer: 169, ieee754: 171 }
      ],
      170: [
        function(e, t, n) {
          var r =
              Object.create ||
              function(e) {
                var t = function() {};
                return (t.prototype = e), new t();
              },
            i =
              Object.keys ||
              function(e) {
                var t = [];
                for (var n in e)
                  Object.prototype.hasOwnProperty.call(e, n) && t.push(n);
                return n;
              },
            o =
              Function.prototype.bind ||
              function(e) {
                var t = this;
                return function() {
                  return t.apply(e, arguments);
                };
              };
          function s() {
            (this._events &&
              Object.prototype.hasOwnProperty.call(this, "_events")) ||
              ((this._events = r(null)), (this._eventsCount = 0)),
              (this._maxListeners = this._maxListeners || void 0);
          }
          (t.exports = s),
            (s.EventEmitter = s),
            (s.prototype._events = void 0),
            (s.prototype._maxListeners = void 0);
          var a,
            h = 10;
          try {
            var u = {};
            Object.defineProperty &&
              Object.defineProperty(u, "x", { value: 0 }),
              (a = 0 === u.x);
          } catch (e) {
            a = !1;
          }
          function c(e) {
            return void 0 === e._maxListeners
              ? s.defaultMaxListeners
              : e._maxListeners;
          }
          function f(e, t, n, i) {
            var o, s, a;
            if ("function" != typeof n)
              throw new TypeError('"listener" argument must be a function');
            if (
              ((s = e._events)
                ? (s.newListener &&
                    (e.emit("newListener", t, n.listener ? n.listener : n),
                    (s = e._events)),
                  (a = s[t]))
                : ((s = e._events = r(null)), (e._eventsCount = 0)),
              a)
            ) {
              if (
                ("function" == typeof a
                  ? (a = s[t] = i ? [n, a] : [a, n])
                  : i
                  ? a.unshift(n)
                  : a.push(n),
                !a.warned && (o = c(e)) && o > 0 && a.length > o)
              ) {
                a.warned = !0;
                var h = new Error(
                  "Possible EventEmitter memory leak detected. " +
                    a.length +
                    ' "' +
                    String(t) +
                    '" listeners added. Use emitter.setMaxListeners() to increase limit.'
                );
                (h.name = "MaxListenersExceededWarning"),
                  (h.emitter = e),
                  (h.type = t),
                  (h.count = a.length),
                  "object" == typeof console &&
                    console.warn &&
                    console.warn("%s: %s", h.name, h.message);
              }
            } else (a = s[t] = n), ++e._eventsCount;
            return e;
          }
          function l() {
            if (!this.fired)
              switch (
                (this.target.removeListener(this.type, this.wrapFn),
                (this.fired = !0),
                arguments.length)
              ) {
                case 0:
                  return this.listener.call(this.target);
                case 1:
                  return this.listener.call(this.target, arguments[0]);
                case 2:
                  return this.listener.call(
                    this.target,
                    arguments[0],
                    arguments[1]
                  );
                case 3:
                  return this.listener.call(
                    this.target,
                    arguments[0],
                    arguments[1],
                    arguments[2]
                  );
                default:
                  for (
                    var e = new Array(arguments.length), t = 0;
                    t < e.length;
                    ++t
                  )
                    e[t] = arguments[t];
                  this.listener.apply(this.target, e);
              }
          }
          function d(e, t, n) {
            var r = {
                fired: !1,
                wrapFn: void 0,
                target: e,
                type: t,
                listener: n
              },
              i = o.call(l, r);
            return (i.listener = n), (r.wrapFn = i), i;
          }
          function p(e, t, n) {
            var r = e._events;
            if (!r) return [];
            var i = r[t];
            return i
              ? "function" == typeof i
                ? n
                  ? [i.listener || i]
                  : [i]
                : n
                ? (function(e) {
                    for (var t = new Array(e.length), n = 0; n < t.length; ++n)
                      t[n] = e[n].listener || e[n];
                    return t;
                  })(i)
                : y(i, i.length)
              : [];
          }
          function g(e) {
            var t = this._events;
            if (t) {
              var n = t[e];
              if ("function" == typeof n) return 1;
              if (n) return n.length;
            }
            return 0;
          }
          function y(e, t) {
            for (var n = new Array(t), r = 0; r < t; ++r) n[r] = e[r];
            return n;
          }
          a
            ? Object.defineProperty(s, "defaultMaxListeners", {
                enumerable: !0,
                get: function() {
                  return h;
                },
                set: function(e) {
                  if ("number" != typeof e || e < 0 || e != e)
                    throw new TypeError(
                      '"defaultMaxListeners" must be a positive number'
                    );
                  h = e;
                }
              })
            : (s.defaultMaxListeners = h),
            (s.prototype.setMaxListeners = function(e) {
              if ("number" != typeof e || e < 0 || isNaN(e))
                throw new TypeError('"n" argument must be a positive number');
              return (this._maxListeners = e), this;
            }),
            (s.prototype.getMaxListeners = function() {
              return c(this);
            }),
            (s.prototype.emit = function(e) {
              var t,
                n,
                r,
                i,
                o,
                s,
                a = "error" === e;
              if ((s = this._events)) a = a && null == s.error;
              else if (!a) return !1;
              if (a) {
                if (
                  (arguments.length > 1 && (t = arguments[1]),
                  t instanceof Error)
                )
                  throw t;
                var h = new Error('Unhandled "error" event. (' + t + ")");
                throw ((h.context = t), h);
              }
              if (!(n = s[e])) return !1;
              var u = "function" == typeof n;
              switch ((r = arguments.length)) {
                case 1:
                  !(function(e, t, n) {
                    if (t) e.call(n);
                    else
                      for (var r = e.length, i = y(e, r), o = 0; o < r; ++o)
                        i[o].call(n);
                  })(n, u, this);
                  break;
                case 2:
                  !(function(e, t, n, r) {
                    if (t) e.call(n, r);
                    else
                      for (var i = e.length, o = y(e, i), s = 0; s < i; ++s)
                        o[s].call(n, r);
                  })(n, u, this, arguments[1]);
                  break;
                case 3:
                  !(function(e, t, n, r, i) {
                    if (t) e.call(n, r, i);
                    else
                      for (var o = e.length, s = y(e, o), a = 0; a < o; ++a)
                        s[a].call(n, r, i);
                  })(n, u, this, arguments[1], arguments[2]);
                  break;
                case 4:
                  !(function(e, t, n, r, i, o) {
                    if (t) e.call(n, r, i, o);
                    else
                      for (var s = e.length, a = y(e, s), h = 0; h < s; ++h)
                        a[h].call(n, r, i, o);
                  })(n, u, this, arguments[1], arguments[2], arguments[3]);
                  break;
                default:
                  for (i = new Array(r - 1), o = 1; o < r; o++)
                    i[o - 1] = arguments[o];
                  !(function(e, t, n, r) {
                    if (t) e.apply(n, r);
                    else
                      for (var i = e.length, o = y(e, i), s = 0; s < i; ++s)
                        o[s].apply(n, r);
                  })(n, u, this, i);
              }
              return !0;
            }),
            (s.prototype.addListener = function(e, t) {
              return f(this, e, t, !1);
            }),
            (s.prototype.on = s.prototype.addListener),
            (s.prototype.prependListener = function(e, t) {
              return f(this, e, t, !0);
            }),
            (s.prototype.once = function(e, t) {
              if ("function" != typeof t)
                throw new TypeError('"listener" argument must be a function');
              return this.on(e, d(this, e, t)), this;
            }),
            (s.prototype.prependOnceListener = function(e, t) {
              if ("function" != typeof t)
                throw new TypeError('"listener" argument must be a function');
              return this.prependListener(e, d(this, e, t)), this;
            }),
            (s.prototype.removeListener = function(e, t) {
              var n, i, o, s, a;
              if ("function" != typeof t)
                throw new TypeError('"listener" argument must be a function');
              if (!(i = this._events)) return this;
              if (!(n = i[e])) return this;
              if (n === t || n.listener === t)
                0 == --this._eventsCount
                  ? (this._events = r(null))
                  : (delete i[e],
                    i.removeListener &&
                      this.emit("removeListener", e, n.listener || t));
              else if ("function" != typeof n) {
                for (o = -1, s = n.length - 1; s >= 0; s--)
                  if (n[s] === t || n[s].listener === t) {
                    (a = n[s].listener), (o = s);
                    break;
                  }
                if (o < 0) return this;
                0 === o
                  ? n.shift()
                  : (function(e, t) {
                      for (
                        var n = t, r = n + 1, i = e.length;
                        r < i;
                        n += 1, r += 1
                      )
                        e[n] = e[r];
                      e.pop();
                    })(n, o),
                  1 === n.length && (i[e] = n[0]),
                  i.removeListener && this.emit("removeListener", e, a || t);
              }
              return this;
            }),
            (s.prototype.removeAllListeners = function(e) {
              var t, n, o;
              if (!(n = this._events)) return this;
              if (!n.removeListener)
                return (
                  0 === arguments.length
                    ? ((this._events = r(null)), (this._eventsCount = 0))
                    : n[e] &&
                      (0 == --this._eventsCount
                        ? (this._events = r(null))
                        : delete n[e]),
                  this
                );
              if (0 === arguments.length) {
                var s,
                  a = i(n);
                for (o = 0; o < a.length; ++o)
                  "removeListener" !== (s = a[o]) && this.removeAllListeners(s);
                return (
                  this.removeAllListeners("removeListener"),
                  (this._events = r(null)),
                  (this._eventsCount = 0),
                  this
                );
              }
              if ("function" == typeof (t = n[e])) this.removeListener(e, t);
              else if (t)
                for (o = t.length - 1; o >= 0; o--)
                  this.removeListener(e, t[o]);
              return this;
            }),
            (s.prototype.listeners = function(e) {
              return p(this, e, !0);
            }),
            (s.prototype.rawListeners = function(e) {
              return p(this, e, !1);
            }),
            (s.listenerCount = function(e, t) {
              return "function" == typeof e.listenerCount
                ? e.listenerCount(t)
                : g.call(e, t);
            }),
            (s.prototype.listenerCount = g),
            (s.prototype.eventNames = function() {
              return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
            });
        },
        {}
      ],
      171: [
        function(e, t, n) {
          (n.read = function(e, t, n, r, i) {
            var o,
              s,
              a = 8 * i - r - 1,
              h = (1 << a) - 1,
              u = h >> 1,
              c = -7,
              f = n ? i - 1 : 0,
              l = n ? -1 : 1,
              d = e[t + f];
            for (
              f += l, o = d & ((1 << -c) - 1), d >>= -c, c += a;
              c > 0;
              o = 256 * o + e[t + f], f += l, c -= 8
            );
            for (
              s = o & ((1 << -c) - 1), o >>= -c, c += r;
              c > 0;
              s = 256 * s + e[t + f], f += l, c -= 8
            );
            if (0 === o) o = 1 - u;
            else {
              if (o === h) return s ? NaN : (1 / 0) * (d ? -1 : 1);
              (s += Math.pow(2, r)), (o -= u);
            }
            return (d ? -1 : 1) * s * Math.pow(2, o - r);
          }),
            (n.write = function(e, t, n, r, i, o) {
              var s,
                a,
                h,
                u = 8 * o - i - 1,
                c = (1 << u) - 1,
                f = c >> 1,
                l = 23 === i ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
                d = r ? 0 : o - 1,
                p = r ? 1 : -1,
                g = t < 0 || (0 === t && 1 / t < 0) ? 1 : 0;
              for (
                t = Math.abs(t),
                  isNaN(t) || t === 1 / 0
                    ? ((a = isNaN(t) ? 1 : 0), (s = c))
                    : ((s = Math.floor(Math.log(t) / Math.LN2)),
                      t * (h = Math.pow(2, -s)) < 1 && (s--, (h *= 2)),
                      (t += s + f >= 1 ? l / h : l * Math.pow(2, 1 - f)) * h >=
                        2 && (s++, (h /= 2)),
                      s + f >= c
                        ? ((a = 0), (s = c))
                        : s + f >= 1
                        ? ((a = (t * h - 1) * Math.pow(2, i)), (s += f))
                        : ((a = t * Math.pow(2, f - 1) * Math.pow(2, i)),
                          (s = 0)));
                i >= 8;
                e[n + d] = 255 & a, d += p, a /= 256, i -= 8
              );
              for (
                s = (s << i) | a, u += i;
                u > 0;
                e[n + d] = 255 & s, d += p, s /= 256, u -= 8
              );
              e[n + d - p] |= 128 * g;
            });
        },
        {}
      ],
      172: [
        function(e, t, n) {
          function r(e) {
            return (
              !!e.constructor &&
              "function" == typeof e.constructor.isBuffer &&
              e.constructor.isBuffer(e)
            );
          }
          t.exports = function(e) {
            return (
              null != e &&
              (r(e) ||
                (function(e) {
                  return (
                    "function" == typeof e.readFloatLE &&
                    "function" == typeof e.slice &&
                    r(e.slice(0, 0))
                  );
                })(e) ||
                !!e._isBuffer)
            );
          };
        },
        {}
      ],
      173: [
        function(e, t, n) {
          "use strict";
          var r = Object.getOwnPropertySymbols,
            i = Object.prototype.hasOwnProperty,
            o = Object.prototype.propertyIsEnumerable;
          t.exports = (function() {
            try {
              if (!Object.assign) return !1;
              var e = new String("abc");
              if (((e[5] = "de"), "5" === Object.getOwnPropertyNames(e)[0]))
                return !1;
              for (var t = {}, n = 0; n < 10; n++)
                t["_" + String.fromCharCode(n)] = n;
              if (
                "0123456789" !==
                Object.getOwnPropertyNames(t)
                  .map(function(e) {
                    return t[e];
                  })
                  .join("")
              )
                return !1;
              var r = {};
              return (
                "abcdefghijklmnopqrst".split("").forEach(function(e) {
                  r[e] = e;
                }),
                "abcdefghijklmnopqrst" ===
                  Object.keys(Object.assign({}, r)).join("")
              );
            } catch (e) {
              return !1;
            }
          })()
            ? Object.assign
            : function(e, t) {
                for (
                  var n,
                    s,
                    a = (function(e) {
                      if (null == e)
                        throw new TypeError(
                          "Object.assign cannot be called with null or undefined"
                        );
                      return Object(e);
                    })(e),
                    h = 1;
                  h < arguments.length;
                  h++
                ) {
                  for (var u in (n = Object(arguments[h])))
                    i.call(n, u) && (a[u] = n[u]);
                  if (r) {
                    s = r(n);
                    for (var c = 0; c < s.length; c++)
                      o.call(n, s[c]) && (a[s[c]] = n[s[c]]);
                  }
                }
                return a;
              };
        },
        {}
      ],
      174: [
        function(e, t, n) {
          (function(e) {
            function t(e, t) {
              for (var n = 0, r = e.length - 1; r >= 0; r--) {
                var i = e[r];
                "." === i
                  ? e.splice(r, 1)
                  : ".." === i
                  ? (e.splice(r, 1), n++)
                  : n && (e.splice(r, 1), n--);
              }
              if (t) for (; n--; n) e.unshift("..");
              return e;
            }
            function r(e, t) {
              if (e.filter) return e.filter(t);
              for (var n = [], r = 0; r < e.length; r++)
                t(e[r], r, e) && n.push(e[r]);
              return n;
            }
            (n.resolve = function() {
              for (
                var n = "", i = !1, o = arguments.length - 1;
                o >= -1 && !i;
                o--
              ) {
                var s = o >= 0 ? arguments[o] : e.cwd();
                if ("string" != typeof s)
                  throw new TypeError(
                    "Arguments to path.resolve must be strings"
                  );
                s && ((n = s + "/" + n), (i = "/" === s.charAt(0)));
              }
              return (
                (i ? "/" : "") +
                  (n = t(
                    r(n.split("/"), function(e) {
                      return !!e;
                    }),
                    !i
                  ).join("/")) || "."
              );
            }),
              (n.normalize = function(e) {
                var o = n.isAbsolute(e),
                  s = "/" === i(e, -1);
                return (
                  (e = t(
                    r(e.split("/"), function(e) {
                      return !!e;
                    }),
                    !o
                  ).join("/")) ||
                    o ||
                    (e = "."),
                  e && s && (e += "/"),
                  (o ? "/" : "") + e
                );
              }),
              (n.isAbsolute = function(e) {
                return "/" === e.charAt(0);
              }),
              (n.join = function() {
                var e = Array.prototype.slice.call(arguments, 0);
                return n.normalize(
                  r(e, function(e, t) {
                    if ("string" != typeof e)
                      throw new TypeError(
                        "Arguments to path.join must be strings"
                      );
                    return e;
                  }).join("/")
                );
              }),
              (n.relative = function(e, t) {
                function r(e) {
                  for (var t = 0; t < e.length && "" === e[t]; t++);
                  for (var n = e.length - 1; n >= 0 && "" === e[n]; n--);
                  return t > n ? [] : e.slice(t, n - t + 1);
                }
                (e = n.resolve(e).substr(1)), (t = n.resolve(t).substr(1));
                for (
                  var i = r(e.split("/")),
                    o = r(t.split("/")),
                    s = Math.min(i.length, o.length),
                    a = s,
                    h = 0;
                  h < s;
                  h++
                )
                  if (i[h] !== o[h]) {
                    a = h;
                    break;
                  }
                var u = [];
                for (h = a; h < i.length; h++) u.push("..");
                return (u = u.concat(o.slice(a))).join("/");
              }),
              (n.sep = "/"),
              (n.delimiter = ":"),
              (n.dirname = function(e) {
                if (("string" != typeof e && (e += ""), 0 === e.length))
                  return ".";
                for (
                  var t = e.charCodeAt(0),
                    n = 47 === t,
                    r = -1,
                    i = !0,
                    o = e.length - 1;
                  o >= 1;
                  --o
                )
                  if (47 === (t = e.charCodeAt(o))) {
                    if (!i) {
                      r = o;
                      break;
                    }
                  } else i = !1;
                return -1 === r
                  ? n
                    ? "/"
                    : "."
                  : n && 1 === r
                  ? "/"
                  : e.slice(0, r);
              }),
              (n.basename = function(e, t) {
                var n = (function(e) {
                  "string" != typeof e && (e += "");
                  var t,
                    n = 0,
                    r = -1,
                    i = !0;
                  for (t = e.length - 1; t >= 0; --t)
                    if (47 === e.charCodeAt(t)) {
                      if (!i) {
                        n = t + 1;
                        break;
                      }
                    } else -1 === r && ((i = !1), (r = t + 1));
                  return -1 === r ? "" : e.slice(n, r);
                })(e);
                return (
                  t &&
                    n.substr(-1 * t.length) === t &&
                    (n = n.substr(0, n.length - t.length)),
                  n
                );
              }),
              (n.extname = function(e) {
                "string" != typeof e && (e += "");
                for (
                  var t = -1, n = 0, r = -1, i = !0, o = 0, s = e.length - 1;
                  s >= 0;
                  --s
                ) {
                  var a = e.charCodeAt(s);
                  if (47 !== a)
                    -1 === r && ((i = !1), (r = s + 1)),
                      46 === a
                        ? -1 === t
                          ? (t = s)
                          : 1 !== o && (o = 1)
                        : -1 !== t && (o = -1);
                  else if (!i) {
                    n = s + 1;
                    break;
                  }
                }
                return -1 === t ||
                  -1 === r ||
                  0 === o ||
                  (1 === o && t === r - 1 && t === n + 1)
                  ? ""
                  : e.slice(t, r);
              });
            var i =
              "b" === "ab".substr(-1)
                ? function(e, t, n) {
                    return e.substr(t, n);
                  }
                : function(e, t, n) {
                    return t < 0 && (t = e.length + t), e.substr(t, n);
                  };
          }.call(this, e("_process")));
        },
        { _process: 175 }
      ],
      175: [
        function(e, t, n) {
          var r,
            i,
            o = (t.exports = {});
          function s() {
            throw new Error("setTimeout has not been defined");
          }
          function a() {
            throw new Error("clearTimeout has not been defined");
          }
          function h(e) {
            if (r === setTimeout) return setTimeout(e, 0);
            if ((r === s || !r) && setTimeout)
              return (r = setTimeout), setTimeout(e, 0);
            try {
              return r(e, 0);
            } catch (t) {
              try {
                return r.call(null, e, 0);
              } catch (t) {
                return r.call(this, e, 0);
              }
            }
          }
          !(function() {
            try {
              r = "function" == typeof setTimeout ? setTimeout : s;
            } catch (e) {
              r = s;
            }
            try {
              i = "function" == typeof clearTimeout ? clearTimeout : a;
            } catch (e) {
              i = a;
            }
          })();
          var u,
            c = [],
            f = !1,
            l = -1;
          function d() {
            f &&
              u &&
              ((f = !1),
              u.length ? (c = u.concat(c)) : (l = -1),
              c.length && p());
          }
          function p() {
            if (!f) {
              var e = h(d);
              f = !0;
              for (var t = c.length; t; ) {
                for (u = c, c = []; ++l < t; ) u && u[l].run();
                (l = -1), (t = c.length);
              }
              (u = null),
                (f = !1),
                (function(e) {
                  if (i === clearTimeout) return clearTimeout(e);
                  if ((i === a || !i) && clearTimeout)
                    return (i = clearTimeout), clearTimeout(e);
                  try {
                    i(e);
                  } catch (t) {
                    try {
                      return i.call(null, e);
                    } catch (t) {
                      return i.call(this, e);
                    }
                  }
                })(e);
            }
          }
          function g(e, t) {
            (this.fun = e), (this.array = t);
          }
          function y() {}
          (o.nextTick = function(e) {
            var t = new Array(arguments.length - 1);
            if (arguments.length > 1)
              for (var n = 1; n < arguments.length; n++)
                t[n - 1] = arguments[n];
            c.push(new g(e, t)), 1 !== c.length || f || h(p);
          }),
            (g.prototype.run = function() {
              this.fun.apply(null, this.array);
            }),
            (o.title = "browser"),
            (o.browser = !0),
            (o.env = {}),
            (o.argv = []),
            (o.version = ""),
            (o.versions = {}),
            (o.on = y),
            (o.addListener = y),
            (o.once = y),
            (o.off = y),
            (o.removeListener = y),
            (o.removeAllListeners = y),
            (o.emit = y),
            (o.prependListener = y),
            (o.prependOnceListener = y),
            (o.listeners = function(e) {
              return [];
            }),
            (o.binding = function(e) {
              throw new Error("process.binding is not supported");
            }),
            (o.cwd = function() {
              return "/";
            }),
            (o.chdir = function(e) {
              throw new Error("process.chdir is not supported");
            }),
            (o.umask = function() {
              return 0;
            });
        },
        {}
      ],
      176: [
        function(e, t, n) {
          (function(t, r) {
            var i = e("process/browser.js").nextTick,
              o = Function.prototype.apply,
              s = Array.prototype.slice,
              a = {},
              h = 0;
            function u(e, t) {
              (this._id = e), (this._clearFn = t);
            }
            (n.setTimeout = function() {
              return new u(o.call(setTimeout, window, arguments), clearTimeout);
            }),
              (n.setInterval = function() {
                return new u(
                  o.call(setInterval, window, arguments),
                  clearInterval
                );
              }),
              (n.clearTimeout = n.clearInterval = function(e) {
                e.close();
              }),
              (u.prototype.unref = u.prototype.ref = function() {}),
              (u.prototype.close = function() {
                this._clearFn.call(window, this._id);
              }),
              (n.enroll = function(e, t) {
                clearTimeout(e._idleTimeoutId), (e._idleTimeout = t);
              }),
              (n.unenroll = function(e) {
                clearTimeout(e._idleTimeoutId), (e._idleTimeout = -1);
              }),
              (n._unrefActive = n.active = function(e) {
                clearTimeout(e._idleTimeoutId);
                var t = e._idleTimeout;
                t >= 0 &&
                  (e._idleTimeoutId = setTimeout(function() {
                    e._onTimeout && e._onTimeout();
                  }, t));
              }),
              (n.setImmediate =
                "function" == typeof t
                  ? t
                  : function(e) {
                      var t = h++,
                        r = !(arguments.length < 2) && s.call(arguments, 1);
                      return (
                        (a[t] = !0),
                        i(function() {
                          a[t] &&
                            (r ? e.apply(null, r) : e.call(null),
                            n.clearImmediate(t));
                        }),
                        t
                      );
                    }),
              (n.clearImmediate =
                "function" == typeof r
                  ? r
                  : function(e) {
                      delete a[e];
                    });
          }.call(this, e("timers").setImmediate, e("timers").clearImmediate));
        },
        { "process/browser.js": 175, timers: 176 }
      ],
      177: [
        function(e, t, n) {
          arguments[4][164][0].apply(n, arguments);
        },
        { dup: 164 }
      ],
      178: [
        function(e, t, n) {
          arguments[4][165][0].apply(n, arguments);
        },
        { dup: 165 }
      ],
      179: [
        function(e, t, n) {
          arguments[4][166][0].apply(n, arguments);
        },
        { "./support/isBuffer": 178, _process: 175, dup: 166, inherits: 177 }
      ]
    },
    {},
    [1]
  )(1);
});
