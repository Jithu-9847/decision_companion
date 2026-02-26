from dataclasses import dataclass, field
from typing import List, Dict, Optional
import uuid

@dataclass
class Criterion:
    name: str
    weight: float
    id: str = field(default_factory=lambda : str(uuid.uuid4()))

@dataclass
class Option:
    name: str
    scores: Dict[str, float] = field(default_factory=dict)
    id: str = field(default_factory=lambda : str(uuid.uuid4()))

@dataclass
class Decision:
    name: str
    description: str = ''
    criteria: List[Criterion] = field(default_factory=list)
    options: List[Option] = field(default_factory=list)
    id: str = field(default_factory=lambda : str(uuid.uuid4()))

    def get_criterion_by_name(self, name: str) -> Optional[Criterion]:
        for c in self.criteria:
            if c.name.lower() == name.lower():
                return c
        return None

    def get_option_by_name(self, name: str) -> Optional[Option]:
        for o in self.options:
            if o.name.lower() == name.lower():
                return o
        return None

@dataclass
class UserProfile:
    learned_weights: Dict[str, float] = field(default_factory=dict)
    decision_history: List[Decision] = field(default_factory=list)

    def update_learned_weight(self, criterion_name: str, new_observed_weight: float, learning_rate: float=0.2):
        key = criterion_name.lower().strip()
        if key in self.learned_weights:
            old_weight = self.learned_weights[key]
            updated_weight = learning_rate * new_observed_weight + (1 - learning_rate) * old_weight
            self.learned_weights[key] = max(1.0, min(10.0, updated_weight))
        else:
            self.learned_weights[key] = new_observed_weight
