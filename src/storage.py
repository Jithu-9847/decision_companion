import json
import os
from src.models import Decision, Criterion, Option, UserProfile

class Storage:

    @staticmethod
    def save_profile(profile: UserProfile, filepath: str):
        data = {'learned_weights': profile.learned_weights, 'decision_history': []}
        for decision in profile.decision_history:
            d_data = {'name': decision.name, 'description': decision.description, 'id': decision.id, 'criteria': [{'name': c.name, 'weight': c.weight, 'id': c.id} for c in decision.criteria], 'options': [{'name': o.name, 'scores': o.scores, 'id': o.id} for o in decision.options]}
            data['decision_history'].append(d_data)
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=4)
        print(f'User Profile saved to {filepath}')

    @staticmethod
    def load_profile(filepath: str) -> UserProfile:
        if not os.path.exists(filepath):
            raise FileNotFoundError(f'File {filepath} not found.')
        with open(filepath, 'r') as f:
            data = json.load(f)
        profile = UserProfile()
        if 'decision_history' not in data:
            decision = Decision(name=data.get('name', 'Legacy Decision'), description=data.get('description', ''), id=data.get('id'))
            for c_data in data.get('criteria', []):
                decision.criteria.append(Criterion(name=c_data['name'], weight=c_data['weight'], id=c_data.get('id')))
            for o_data in data.get('options', []):
                decision.options.append(Option(name=o_data['name'], scores=o_data.get('scores', {}), id=o_data.get('id')))
            profile.decision_history.append(decision)
            return profile
        profile.learned_weights = data.get('learned_weights', {})
        for d_data in data.get('decision_history', []):
            decision = Decision(name=d_data['name'], description=d_data.get('description', ''), id=d_data['id'])
            for c_data in d_data.get('criteria', []):
                decision.criteria.append(Criterion(name=c_data['name'], weight=c_data['weight'], id=c_data['id']))
            for o_data in d_data.get('options', []):
                decision.options.append(Option(name=o_data['name'], scores=o_data.get('scores', {}), id=o_data['id']))
            profile.decision_history.append(decision)
        return profile
