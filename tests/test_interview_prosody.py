import copy
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from interview_prosody import tune_query

PROFILE = dict(speed=1., intonation=1.12, commaPause=.18, sentencePause=.36)


class ProsodyTest(unittest.TestCase):
    def query(self):
        return {'accent_phrases': [
            {'accent': 2, 'moras': [{'pitch': 5.2}], 'pause_mora': {'vowel_length': .5}},
            {'accent': 1, 'moras': [{'pitch': 5.0}], 'pause_mora': {'vowel_length': .5}},
            {'accent': 3, 'moras': [{'pitch': 5.4}], 'pause_mora': None}],
            'pitchScale': 0, 'volumeScale': 1}

    def test_sentence_pause_is_longer_without_rewriting_accents(self):
        original = self.query()
        result = tune_query(copy.deepcopy(original), '店長として、何を実行しますか。具体的に教えてください。', PROFILE)
        self.assertEqual([p['pause_mora']['vowel_length'] for p in result['accent_phrases'][:2]], [.18, .36])
        for before, after in zip(original['accent_phrases'], result['accent_phrases']):
            self.assertEqual(before['moras'], after['moras'])
            self.assertEqual(before['accent'], after['accent'])
        self.assertEqual(result['pitchScale'], 0)
        self.assertEqual(result['intonationScale'], 1.12)

    def test_unmatched_punctuation_keeps_engine_pauses(self):
        result = tune_query(self.query(), '括弧などの解析が一致しない場合？', PROFILE)
        self.assertEqual([p['pause_mora']['vowel_length'] for p in result['accent_phrases'][:2]], [.5, .5])

    def test_question_mark_between_sentences_is_a_sentence_pause(self):
        query = {'accent_phrases': [{'pause_mora': {'vowel_length': .5}}]}
        result = tune_query(query, '何をしますか？ 数字で教えてください。', PROFILE)
        self.assertEqual(result['accent_phrases'][0]['pause_mora']['vowel_length'], .36)
