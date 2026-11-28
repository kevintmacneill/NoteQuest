#!/usr/bin/env python3
"""Build the engine's CURRICULUM block from approved curriculum v3.2 (Kevin, C-B11).

Sources (all checked into the repo):
  coordination/curriculum/curriculum-v3-h02-candidate-v3.2.json   the approved curriculum
  tests/generator_contract_v32.json                               26 corrected skill shapes (Kevin S-1)
Owner decisions applied here (coordination/DECISIONS.md, 2026-11-23):
  S-1  use the 26 corrected shapes; three listening-judgment skills become grown-up (teacher) checks
  S-2  Journey Readiness per world = all of that world's playable skills, grouped
       navigation / timing / performance; worlds NQ-00..NQ-07 (the last world needs none)
  C-B12 skills the engine can't play yet stay in the data and show as "coming soon" (the engine decides)

Writes the block between /*NQ-CURRICULUM-BEGIN*/ and /*NQ-CURRICULUM-END*/ in index.html.
Usage:  python3 tools/curriculum/build_v32.py           (rewrite index.html)
        python3 tools/curriculum/build_v32.py --check   (exit 1 if index.html is out of date)
"""
import json, os, sys, collections

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'coordination/curriculum/curriculum-v3-h02-candidate-v3.2.json')
FIX = os.path.join(ROOT, 'tests/generator_contract_v32.json')
INDEX = os.path.join(ROOT, 'index.html')
BEGIN, END = '/*NQ-CURRICULUM-BEGIN*/', '/*NQ-CURRICULUM-END*/'

# Curriculum annotations the engine and screens never read (kept in the source file, left out of the game).
# NOT 'notes': in note skills that field is the list of pitches to ask about.
DROP_CONTENT = {'objective', 'source', 'validation', 'designStatus', 'requiresEngineType',
                'requiresEngineExtension', 'manualFollowup'}
# Types the engine shows as "coming soon" until they are built or authored (C-B12)
COMING_SOON = {'conceptChoice', 'echo'}
GROWN_UP = {'caregiver', 'self', 'teacher'}

# S-1: a quiz can't judge these listening comparisons, so a grown-up checks them (C-B13 path)
TEACHER_OVERRIDES = {
    # WP-0.3 / #124: whole-performance objectives require honest grown-up assessment.
    "NQ-01-U01-S02": {
        'prompt': "Play the black-key groups going up the piano, then coming back down.",
        'checklist': ["Plays each 2-black-key and 3-black-key group in order going up","Plays each group in order going down","Uses black keys only","No long stops between groups"],
    },
    "NQ-01-U04-S03": {
        'prompt': "Play C-D-E-F-G and back with your right hand in middle C position.",
        'checklist': ["Thumb on middle C, fingers 1-2-3-4-5 on C-D-E-F-G","Plays up and back down in order","Each note clear","No stopping to search"],
    },
    "NQ-01-U05-S03": {
        'prompt': "Play a five-note tune (like C-D-E-F-G-F-E-D-C) while I clap or count a steady beat.",
        'checklist': ["Correct notes in order","Notes land with the steady beat","No speeding up or slowing down","Finishes without stopping"],
    },
    "NQ-01-U08-S02": {
        'prompt': "Count '1-2-3-4' out loud, then play a short tune that repeats notes (like C-C-G-G-A-A-G).",
        'checklist': ["Says a steady count-in before playing","Starts on time after the count","Repeated notes played again, not held","Keeps the beat to the end"],
    },
    'NQ-07-U05-S01': {
        'prompt': 'Grown-up: listen together to two recordings of the same piece. Ask how the chords sound different.',
        'checklist': ['Hears a difference between the two recordings',
                      'Describes it in their own words (for example: fuller or thinner, brighter or darker)',
                      'Points to where in the music they hear it']},
    'NQ-08-U07-S01': {
        'prompt': 'Grown-up: listen together to two recordings of the same piece. Ask what each performer does differently.',
        'checklist': ['Notices at least two differences (speed, loudness, touch, mood)',
                      'Says which recording they prefer and why',
                      'Uses a music word for at least one difference']},
    'NQ-08-U03-S02': {
        'prompt': 'Grown-up: play or listen to a short passage with modal harmony and one with chromatic harmony. Ask how the colors differ.',
        'checklist': ['Hears that the two passages sound different',
                      'Describes the colors in their own words',
                      'Can tell which passage is which when you play them again']},
}


# Harbor variety quick fix (Kevin, 2026-11-26 22:40: "very shallow and repetitive"). Same IDs, richer questions:
# U01-S01 asks for groups of two AND three (its title always said so; the content only asked for two);
# U05-S01, which repeated U01-S01 exactly, asks for one named key inside a group;
# U01-S02 asks "higher" and "lower"; U03-S01, which repeated U01-S02 exactly, asks both with notes 3 to 7 semitones apart.
HARBOR_VARIETY = {
    'NQ-00-U01-S01': {'type': 'keyGroup', 'groups': [2, 3]},
    'NQ-00-U05-S01': {'type': 'keyGroup', 'groups': [2, 3], 'positions': True},
    'NQ-00-U01-S02': {'type': 'highLow', 'lo': 48, 'hi': 76, 'minGap': 6, 'asks': ['higher', 'lower']},
    'NQ-00-U03-S01': {'type': 'highLow', 'lo': 48, 'hi': 76, 'minGap': 3, 'maxGap': 7, 'asks': ['higher', 'lower']},
}
HARBOR_TITLES = {
    'NQ-00-U05-S01': {'child': 'Find the exact black key', 'adult': 'Find a named key inside a black-key group'},
}


def content_for(skill, fixes):
    if skill['id'] in TEACHER_OVERRIDES:
        return dict({'type': 'teacher'}, **TEACHER_OVERRIDES[skill['id']])
    if skill['id'] in HARBOR_VARIETY:
        return dict(HARBOR_VARIETY[skill['id']])
    f = fixes.get(skill['id'])
    c = (f.get('content', f) if isinstance(f, dict) else None) or skill['content']
    return {k: v for k, v in c.items() if k not in DROP_CONTENT}


def evidence_for(skill, content):
    if skill['id'] in TEACHER_OVERRIDES:
        return ['teacher']
    return list(skill['evidence'])


def readiness_part(content, evidence):
    t, ev = content.get('type'), set(evidence)
    if t == 'rhythmTap' or 'tap' in ev:
        return 'timing'
    if t in ('notePlay', 'song') or t in GROWN_UP or ev & ({'mic'} | GROWN_UP):
        return 'performance'
    return 'navigation'


def playable(content):
    t = content.get('type')
    if t in COMING_SOON:
        return t == 'conceptChoice' and bool(content.get('choices'))
    return True


def build():
    src = json.load(open(SRC))
    fixes = json.load(open(FIX))['skills']
    skills_out, by_id = [], {}
    for s in src['skills']:
        c = content_for(s, fixes)
        ev = evidence_for(s, c)
        out = collections.OrderedDict()
        out['id'] = s['id']
        out['title'] = HARBOR_TITLES.get(s['id'], s['title'])
        out['domains'] = s['domains']
        out['prereqs'] = s['prereqs']
        out['requiresReading'] = bool(s['requiresReading'])
        out['evidence'] = ev
        out['content'] = c
        if s.get('feedback'):
            out['feedback'] = {k: v for k, v in s['feedback'].items() if k != 'version'}
        if s.get('alfredRef'):
            out['alfredRef'] = s['alfredRef']
        if s.get('pictureKey'):
            out['pictureKey'] = s['pictureKey']
        if s.get('masteryOverride') is not None:
            out['masteryOverride'] = s['masteryOverride']
        skills_out.append(out)
        by_id[s['id']] = out

    levels = src['levels']
    stops_src = sorted(src['stops'], key=lambda x: ([l['id'] for l in levels].index(x['level']), x['order']))
    stops_out = []
    for st in stops_src:
        o = collections.OrderedDict()
        o['id'] = st['id']
        o['level'] = st['level']
        o['title'] = {'child': st['title'], 'adult': st['title']} if isinstance(st['title'], str) else st['title']
        o['skills'] = st['skills']
        if st.get('checkpoint'):
            o['checkpoint'] = {k: st['checkpoint'][k] for k in ('skillId', 'requiredEvidence') if k in st['checkpoint']}
        if st.get('picture'):
            o['picture'] = st['picture']
        if st.get('rescueAnimal'):
            o['rescueAnimal'] = st['rescueAnimal']
        stops_out.append(o)

    levels_out = []
    for i, lv in enumerate(levels):
        o = collections.OrderedDict()
        o['id'] = lv['id']
        o['location'] = lv['location']
        o['title'] = lv['location']
        o['focus'] = lv.get('focus')
        o['alfredRef'] = lv.get('alfredRef')
        if i < len(levels) - 1:  # S-2: every world except the last has a readiness check
            parts = {'navigation': [], 'timing': [], 'performance': []}
            for st in stops_out:
                if st['level'] != lv['id']:
                    continue
                for sid in st['skills']:
                    sk = by_id[sid]
                    if playable(sk['content']):
                        parts[readiness_part(sk['content'], sk['evidence'])].append(sid)
            empty = [k for k, v in parts.items() if not v]
            if empty:
                raise SystemExit('readiness for %s has no %s skills' % (lv['id'], ', '.join(empty)))
            o['readiness'] = parts
        levels_out.append(o)

    cur = collections.OrderedDict()
    cur['id'] = '3.2'
    cur['version'] = '3.2'
    cur['source'] = 'coordination/curriculum/curriculum-v3-h02-candidate-v3.2.json + tests/generator_contract_v32.json (built by tools/curriculum/build_v32.py)'
    cur['levels'] = levels_out
    cur['stops'] = stops_out
    cur['skills'] = skills_out
    body = json.dumps(cur, ensure_ascii=False, separators=(',', ':'))
    return BEGIN + '\nconst CURRICULUM=' + body + ';\n' + END


def main():
    block = build()
    html = open(INDEX, encoding='utf8').read()
    a, b = html.find(BEGIN), html.find(END)
    if a < 0 or b < 0:
        raise SystemExit('curriculum markers not found in index.html')
    new = html[:a] + block + html[b + len(END):]
    if '--check' in sys.argv:
        if new != html:
            print('index.html curriculum block is OUT OF DATE: run python3 tools/curriculum/build_v32.py')
            sys.exit(1)
        print('index.html curriculum block is up to date')
        return
    open(INDEX, 'w', encoding='utf8').write(new)
    print('wrote curriculum block: %d bytes' % len(block))


if __name__ == '__main__':
    main()
