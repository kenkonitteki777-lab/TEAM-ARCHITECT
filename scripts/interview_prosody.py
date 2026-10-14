"""Keep engine accents; tune punctuation pauses only when alignment is exact."""
import re


def tune_query(query, text, profile):
    query['speedScale'] = profile['speed']
    query['intonationScale'] = profile['intonation']
    query['prePhonemeLength'] = .08
    query['postPhonemeLength'] = .16
    # The engine scales phoneme lengths by speed; both current profiles use 1.0.
    # Do not invent breaths or change pitch/accent positions for an authoritative voice.
    pauses = [p['pause_mora'] for p in query.get('accent_phrases', [])
              if p.get('pause_mora') is not None]
    punctuation = re.findall(r'[、。？！!?]+(?=\s*[^\s、。？！!?])', text)
    if len(pauses) == len(punctuation):
        for pause, mark in zip(pauses, punctuation):
            pause['vowel_length'] = (profile['commaPause'] if mark == '、'
                                     else profile['sentencePause'])
    return query
