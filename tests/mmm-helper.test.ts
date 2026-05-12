/**
 * Tests fuer MMM R-hat Convergence Helper (Welle-41-A Codex-Top-Patch-3) [CRUX-MK].
 */
import { describe, it, expect } from "vitest";
import {
  estimateMmm,
  isConverged,
  improvedPriorMean,
  improvedPriorVariance,
  validateForKZeroDecision,
} from "../lib/mmm_helper";

describe("MMM R-hat Convergence Helper (W41-A)", () => {
  describe("isConverged", () => {
    it("returns true for R-hat < 1.1 and ess > 400", () => {
      expect(isConverged(1.05, 500)).toBe(true);
      expect(isConverged(1.0, 1000)).toBe(true);
    });

    it("returns false for R-hat >= 1.1 (Production-Blocker fix)", () => {
      // W38-Codex-Audit Original-Bug: R-hat 2.9
      expect(isConverged(2.9, 1000)).toBe(false);
      expect(isConverged(1.5, 1000)).toBe(false);
      expect(isConverged(1.1, 1000)).toBe(false);
    });

    it("returns false when ESS < 400 even if R-hat OK", () => {
      expect(isConverged(1.05, 200)).toBe(false);
      expect(isConverged(1.0, 399)).toBe(false);
    });
  });

  describe("estimateMmm with non-convergent R-hat (W38 Fix)", () => {
    it("uses improved-prior-fallback when R-hat between 1.1 and 2.0", () => {
      const est = estimateMmm("TV", 0.5, 1.5, 1000);
      expect(est.converged).toBe(false);
      expect(est.source).toBe("improved-prior-fallback");
      // Posterior wird durch Prior gezogen (Beta(2,5) mean=0.286)
      // Erwartung: zwischen Prior-Mean und Observation, weighted
      const priorMean = improvedPriorMean();
      const expected = priorMean * 0.7 + 0.5 * 0.3;
      expect(est.posteriorMean).toBeCloseTo(expected, 3);
    });

    it("uses conservative-default when R-hat > 2.0 (W38 Original Bug case)", () => {
      // W38 Original: R-hat 2.9 = Production-Blocker
      const est = estimateMmm("Online", 5.0, 2.9, 1000);
      expect(est.converged).toBe(false);
      expect(est.source).toBe("conservative-default");
      expect(est.posteriorMean).toBe(1.0); // Conservative ROAS = 1.0
      // Verhindert dass Marketing-Budget-Allokation auf 5.0 ROAS basiert
      // (epistemisch unzulaessig bei R-hat 2.9)
      expect(est.posteriorMean).toBeLessThan(5.0);
    });

    it("returns convergent estimate when R-hat OK", () => {
      const est = estimateMmm("Print", 1.5, 1.05, 800);
      expect(est.converged).toBe(true);
      expect(est.source).toBe("real-mcmc");
      expect(est.posteriorMean).toBe(1.5);
    });
  });

  describe("validateForKZeroDecision (Marketing-Budget-Allokation)", () => {
    it("blocks K_0 decision wenn ein Channel nicht konvergent (R-hat 2.9 case)", () => {
      const ests = [
        estimateMmm("TV", 1.5, 1.05, 800), // OK
        estimateMmm("Online", 5.0, 2.9, 1000), // BLOCKER (W38 Original Bug)
      ];
      const v = validateForKZeroDecision(ests);
      expect(v.valid).toBe(false);
      expect(v.reason).toContain("K_0-VETO");
      expect(v.reason).toContain("Online");
    });

    it("erlaubt K_0 decision wenn alle Channels konvergent", () => {
      const ests = [
        estimateMmm("TV", 1.5, 1.05, 800),
        estimateMmm("Online", 2.0, 1.02, 1000),
      ];
      const v = validateForKZeroDecision(ests);
      expect(v.valid).toBe(true);
      expect(v.reason).toContain("konvergent");
    });
  });
});
