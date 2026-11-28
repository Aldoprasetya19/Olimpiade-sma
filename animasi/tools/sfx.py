#!/usr/bin/env python3
"""Efek suara sintetis (numpy) untuk video cerita. sfx.buat(nama) -> array float32 mono 48 kHz.
Daftar nama ada di SFX (lihat bawah). Dipakai oleh tools/mix_audio.py."""
import numpy as np
SR = 48000
rng = np.random.default_rng(7)
def t(d): return np.arange(int(SR * d)) / SR
def env(x, a=0.005, r=0.2):
    n = len(x); e = np.ones(n); na = min(n, max(1, int(a * SR))); nr = min(n, max(1, int(r * SR)))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return x * e
def noise(d): return rng.standard_normal(int(SR * d))
def lp(x, a=0.1):
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x): acc += a * (v - acc); y[i] = acc
    return y
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def dec(d, k): return np.exp(-t(d) * k)
def sine(f, d): return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, int(SR * d)) if np.ndim(f) else np.full(int(SR * d), f)) / SR)
def mix(*parts):
    n = max(len(p) for p in parts); o = np.zeros(n)
    for p in parts: o[:len(p)] += p
    return o
def at(x, s, n): o = np.zeros(n); i = int(s * SR); o[i:i + len(x)] = x[:max(0, n - i)]; return o
def ks(f, d, damp=0.996):  # Karplus-Strong senar
    n = int(SR * d); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n): out[i] = buf[i % p]; buf[i % p] = damp * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out
def strum(freqs, d=1.6, gap=0.018):
    n = int(SR * d); return sum(at(ks(f, d - i * gap), i * gap, n) for i, f in enumerate(freqs)) / len(freqs)

E_MAJ = [82.4, 123.5, 164.8, 207.7, 246.9, 329.6]; A_MIN = [110, 164.8, 220, 261.6, 329.6]; G_MAJ = [98, 123.5, 146.8, 196, 246.9, 392]
def clap(): return env(bp(noise(0.12), 800, 5000) * dec(0.12, 40), 0.001, 0.05)
def crowd(d, k=1.0):
    x = bp(noise(d), 250, 3200); m = 0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t(d)) * np.sin(2 * np.pi * 1.9 * t(d)); return env(x * m * k, 0.3, 0.6)

SFX = {
 'bel': lambda: mix(*[at(env(sum(np.sin(2 * np.pi * f * t(1.6)) * a for f, a in ((880, 1), (1320, .5), (2200, .25))) * dec(1.6, 3)), s, int(SR * 2.4)) for s in (0, 0.7)]),
 'riuh': lambda: crowd(2.5, 0.9),
 'receh': lambda: mix(*[at(np.sin(2 * np.pi * rng.uniform(3000, 6000) * t(0.08)) * dec(0.08, 60), rng.uniform(0, 0.9), SR) for _ in range(9)]),
 'kempis': lambda: env(np.sign(np.sin(2 * np.pi * np.cumsum(np.linspace(380, 150, int(SR * 1.3)) * (1 + 0.03 * np.sin(2 * np.pi * 6 * t(1.3)))) / SR)) * 0.5, 0.02, 0.3),
 'bagasi': lambda: mix(env(lp(noise(0.3), 0.08) * dec(0.3, 15)), np.sin(2 * np.pi * 70 * t(0.5)) * dec(0.5, 9)),
 'spanduk': lambda: env(bp(noise(0.7), 400, 4000) * np.sin(np.pi * t(0.7) / 0.7), 0.05, 0.2),
 'tawa': lambda: mix(*[at(env(bp(noise(0.11), 500, 1800) * 1.5, 0.01, 0.05), i * 0.16, int(SR * 1.2)) for i in range(6)]),
 'kursi': lambda: env(bp(noise(0.5), 300, 1200) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * t(0.5))), 0.02, 0.1),
 'spidol': lambda: mix(*[at(env(np.sin(2 * np.pi * (2100 + 300 * np.sin(2 * np.pi * 9 * t(0.25))) * t(0.25)) * 0.4), i * 0.3, int(SR * 1.2)) for i in range(3)]),
 'gitar': lambda: strum(E_MAJ, 1.8),
 'gitarSedih': lambda: mix(*[at(strum(A_MIN, 2.2, 0.09), s, int(SR * 4.5)) for s in (0, 2.2)]),
 'gitarCeria': lambda: mix(*[at(strum((E_MAJ, G_MAJ, A_MIN)[i % 3], 0.6, 0.012), i * 0.32, int(SR * 4)) for i in range(11)]),
 'jepret': lambda: mix(clap(), at(clap(), 0.07, int(SR * 0.3))),
 'tepuk': lambda: mix(clap() * 2, at(crowd(1.2, 0.8), 0.05, int(SR * 1.3))),
 'jangkrik': lambda: mix(*[at(np.sin(2 * np.pi * 4500 * t(0.05)) * (np.sin(2 * np.pi * 40 * t(0.05)) > 0), s, int(SR * 3)) for s in np.arange(0, 2.9, 0.45)]) * 0.5,
 'getar': lambda: mix(*[at(env(np.sign(np.sin(2 * np.pi * 150 * t(0.35))) * 0.4, 0.01, 0.05), s, int(SR * 1.2)) for s in (0, 0.55)]),
 'ding': lambda: mix(np.sin(2 * np.pi * 988 * t(0.5)) * dec(0.5, 8), at(np.sin(2 * np.pi * 1319 * t(0.6)) * dec(0.6, 7), 0.12, int(SR * 0.8))),
 'bass': lambda: env(np.tanh(3 * np.sin(2 * np.pi * np.cumsum(np.linspace(70, 38, int(SR * 1.6))) / SR)) * dec(1.6, 1.5), 0.005, 0.4),
 'tonggeret': lambda: env(bp(noise(3.0), 5000, 7500) * (0.5 + 0.5 * np.sin(2 * np.pi * 18 * t(3.0))) * 0.6, 0.4, 0.8),
 'gelas': lambda: mix(*[at(bp(noise(0.05), 1500, 6000) * dec(0.05, 50), i * 0.07, int(SR * 0.7)) for i in range(8)]),
 'hela': lambda: env(bp(noise(1.2), 300, 2500) * np.sin(np.pi * t(1.2) / 1.2) * 0.5, 0.1, 0.4),
 'motor': lambda: env(np.tanh(2 * sum(np.sin(2 * np.pi * h * np.cumsum(np.concatenate([np.linspace(45, 110, int(SR * 1.2)), np.linspace(110, 140, int(SR * 1.8))])) / SR) / h for h in (1, 2, 3))) * 0.7 + lp(noise(3.0), 0.2) * 0.15, 0.05, 0.8),
 'motorDatang': lambda: env(np.tanh(2 * sum(np.sin(2 * np.pi * h * np.cumsum(np.concatenate([np.linspace(60, 100, int(SR * 2)), np.linspace(100, 40, int(SR * 0.8))])) / SR) / h for h in (1, 2, 3))) * np.concatenate([np.linspace(0.1, 1, int(SR * 2)), np.ones(int(SR * 0.8))]) * 0.7, 0.05, 0.3),
 'lari': lambda: mix(*[at(lp(noise(0.06), 0.15) * dec(0.06, 40) * 3, s, int(SR * 1.8)) for s in np.arange(0, 1.7, 0.19)]),
 'kertas': lambda: env(bp(noise(0.8), 1500, 8000) * (rng.random(int(SR * 0.8)) > 0.6) * 0.8, 0.02, 0.1),
 'korslet': lambda: mix(*[at(bp(noise(0.03), 2000, 9000) * 2, rng.uniform(0, 0.4), int(SR * 2.6)) for _ in range(14)], at(np.tanh(4 * lp(noise(0.6), 0.05)) * dec(0.6, 5) * 1.5, 0.35, int(SR * 2.6)), at(bp(noise(1.6), 3000, 9000) * dec(1.6, 1.5) * 0.4, 0.8, int(SR * 2.6))),
 'kaget': lambda: env(bp(noise(0.7), 400, 3000) * np.linspace(0.2, 1, int(SR * 0.7)), 0.05, 0.15),
 'cooler': lambda: mix(env(lp(noise(0.08), 0.3) * dec(0.08, 40)), *[at(np.sin(2 * np.pi * rng.uniform(2500, 4500) * t(0.1)) * dec(0.1, 35), 0.15 + i * 0.09, int(SR * 1)) for i in range(7)]),
 'salaman': lambda: clap() * 1.5,
 'lakban': lambda: env(bp(noise(0.5), 800, 6000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 120 * t(0.5)))), 0.01, 0.05),
 'es': lambda: mix(*[at(np.sin(2 * np.pi * rng.uniform(2500, 5000) * t(0.12)) * dec(0.12, 30), i * 0.12, int(SR * 1)) for i in range(6)]),
 'tuang': lambda: env(bp(noise(1.2), 600, 3000) * (0.7 + 0.3 * np.sin(2 * np.pi * 11 * t(1.2))) * 0.6, 0.1, 0.3),
 'kasir': lambda: mix(clap(), at(np.sin(2 * np.pi * 2093 * t(0.8)) * dec(0.8, 5), 0.06, int(SR * 0.9))),
 'ramai': lambda: crowd(4.0, 0.9),
 'mikrofon': lambda: mix(env(lp(noise(0.1), 0.1) * dec(0.1, 30) * 2), at(np.sin(2 * np.pi * 2600 * t(0.6)) * np.linspace(0, 0.5, int(SR * 0.6)), 0.15, int(SR * 0.8))),
 'drumroll': lambda: bp(noise(2.0), 150, 6000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 14 * t(2.0)))) * np.linspace(0.2, 1, int(SR * 2.0)) * 0.8,
 'sorak': lambda: mix(crowd(3.5, 1.4), *[at(clap(), rng.uniform(0.2, 3.2), int(SR * 3.5)) for _ in range(45)]),
 'tepukBahu': lambda: mix(env(lp(noise(0.06), 0.1) * dec(0.06, 50) * 2), at(env(lp(noise(0.06), 0.1) * dec(0.06, 50) * 2), 0.22, int(SR * 0.4))),
 'ceklek': lambda: mix(env(bp(noise(0.03), 1500, 7000) * dec(0.03, 120) * 2.2, 0.001, 0.01), at(env(bp(noise(0.04), 900, 5000) * dec(0.04, 90) * 2.6, 0.001, 0.01), 0.09, int(SR * 0.2))),
 'pecah': lambda: env(np.sign(np.sin(2 * np.pi * np.cumsum(np.concatenate([np.linspace(420, 760, int(SR * 0.22)), np.linspace(980, 620, int(SR * 0.28))])) / SR)) * 0.25 * (1 + 0.6 * np.sin(2 * np.pi * 31 * t(0.5))), 0.01, 0.12),
 'senar': lambda: mix(ks(330, 0.9, 0.993) * 0.9, env(bp(noise(0.06), 2500, 9000) * dec(0.06, 50) * 2.5, 0.001, 0.02), at(sine(np.linspace(1300, 300, int(SR * 0.35)), 0.35) * dec(0.35, 9) * 0.5, 0.02, int(SR * 0.9))),
 'ketuk': lambda: mix(*[at(env(lp(noise(0.08), 0.08) * dec(0.08, 45) * 9, 0.001, 0.02), i * 0.28, int(SR * 0.95)) for i in range(3)]),
 'dengung': lambda: env((sine(2850 + 40 * np.sin(2 * np.pi * 6 * t(1.6)), 1.6) * 0.45 + sine(5700, 1.6) * 0.12) * np.minimum(1, t(1.6) / 0.25), 0.05, 0.35),
 'simbal': lambda: env(bp(noise(2.2), 3000, 14000) * dec(2.2, 1.6) * 1.6, 0.002, 0.3),
 'whoosh': lambda: env(bp(noise(0.5), 500, 5000) * np.sin(np.pi * t(0.5) / 0.5), 0.05, 0.1),
}
def buat(nama):
    x = SFX[nama]().astype(np.float32); m = np.max(np.abs(x)) or 1; return x / m * 0.7
