import numpy as np

import time as time

f0 = np.zeros ((512, 512)) .transpose ()
f1 = np.zeros ((512, 512)) .transpose ()
c0 = np.zeros ((512, 512))
c1 = np.zeros ((512, 512))

ones = np.ones ((512, 512))

def test (a, b):
    a [:] = a + (b*0.5) + ones

def bench (a, b, n):
    start = time.time ()
    for _ in range (0, n):
        test (a, b)
    end = time.time ()
    print (end - start)

bench (c0, c1, 1000)
bench (f0, f1, 1000)
bench (c0, f1, 1000)
bench (f0, c1, 1000)
