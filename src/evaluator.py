from typing import List, Dict, Tuple, Optional
from src.models import Decision, Option, Criterion, UserProfile

class FuzzyEvaluator:
    OUT_VP = 0.0
    OUT_P = 25.0
    OUT_A = 50.0
    OUT_G = 75.0
    OUT_VG = 100.0

    @staticmethod
    def _mu_poor(x: float) -> float:
        return max(0.0, (5.0 - x) / 5.0) if x <= 5.0 else 0.0

    @staticmethod
    def _mu_average(x: float) -> float:
        return max(0.0, min(x / 5.0, (10.0 - x) / 5.0))

    @staticmethod
    def _mu_excellent(x: float) -> float:
        return max(0.0, (x - 5.0) / 5.0) if x >= 5.0 else 0.0

    @staticmethod
    def evaluate(decision: Decision, user_profile: Optional[UserProfile]=None) -> List[Tuple[Option, float, str]]:
        results = []
        for option in decision.options:
            total_score = 0.0
            breakdown = []
            for criterion in decision.criteria:
                score = option.scores.get(criterion.id, 0.0)
                weight = criterion.weight
                if user_profile:
                    key = criterion.name.lower().strip()
                    if key in user_profile.learned_weights:
                        historical_weight = user_profile.learned_weights[key]
                        weight = 0.7 * weight + 0.3 * historical_weight
                s_poor = FuzzyEvaluator._mu_poor(score)
                s_avg = FuzzyEvaluator._mu_average(score)
                s_exc = FuzzyEvaluator._mu_excellent(score)
                w_low = FuzzyEvaluator._mu_poor(weight)
                w_med = FuzzyEvaluator._mu_average(weight)
                w_high = FuzzyEvaluator._mu_excellent(weight)
                rules = [(min(s_poor, w_low), FuzzyEvaluator.OUT_VP, 'Poor rating & Low importance'), (min(s_poor, w_med), FuzzyEvaluator.OUT_VP, 'Poor rating & Medium importance'), (min(s_poor, w_high), FuzzyEvaluator.OUT_P, 'Poor rating & High importance'), (min(s_avg, w_low), FuzzyEvaluator.OUT_P, 'Average rating & Low importance'), (min(s_avg, w_med), FuzzyEvaluator.OUT_A, 'Average rating & Medium importance'), (min(s_avg, w_high), FuzzyEvaluator.OUT_G, 'Average rating & High importance'), (min(s_exc, w_low), FuzzyEvaluator.OUT_A, 'Excellent rating & Low importance'), (min(s_exc, w_med), FuzzyEvaluator.OUT_G, 'Excellent rating & Medium importance'), (min(s_exc, w_high), FuzzyEvaluator.OUT_VG, 'Excellent rating & High importance')]
                numerator = sum((firing_strength * out_val for (firing_strength, out_val, _) in rules))
                denominator = sum((firing_strength for (firing_strength, _, _) in rules))
                crisp_value = numerator / denominator if denominator > 0 else 0.0
                total_score += crisp_value
                dominant_rule = max(rules, key=lambda r: r[0])
                breakdown.append((criterion, crisp_value, dominant_rule[2]))
            breakdown.sort(key=lambda x: x[1], reverse=True)
            explanation_parts = [f'{option.name} scored {total_score:.2f} overall via fuzzy logic.']
            if breakdown:
                top_c = breakdown[0][0]
                top_c_val = breakdown[0][1]
                top_rule_desc = breakdown[0][2]
                explanation_parts.append(f"Strongest criteria was '{top_c.name}' (Fuzzy Value: {top_c_val:.2f}/100) driven by rule: [{top_rule_desc}].")
            results.append((option, total_score, ' '.join(explanation_parts)))
        results.sort(key=lambda x: x[1], reverse=True)
        return results

class Evaluator(FuzzyEvaluator):
    pass
