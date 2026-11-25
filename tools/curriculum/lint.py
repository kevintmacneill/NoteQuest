#!/usr/bin/env python3
"""WP-0.8: lint the approved source and the generated engine curriculum.
Read-only. Run: python3 tools/curriculum/lint.py --self-test
The objective baseline is reviewed data, not regenerated automatically.
"""
import argparse
import copy
import json
import re
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
BASELINE=ROOT/"tools/curriculum/objective_baseline_v32.json"
EVIDENCE={
    "keyGroup":{"keys"},"keyboardSide":{"keys"},"noteFind":{"keys"},"letterFind":{"keys"},
    "highLow":{"listen"},"durationCompare":{"listen"},"echo":{"listen"},
    "self":{"self"},"caregiver":{"caregiver"},"teacher":{"teacher"},
    "rhythmTap":{"tap"},"notePlay":{"mic"},"song":{"mic"},
    "conceptChoice":{"quiz"},"symbol":{"quiz"},"finger":{"quiz"},"contourRead":{"quiz"},
    "noteName":{"quiz"},"stepPattern":{"quiz"},"beats":{"quiz"},"degree":{"quiz"},
    "keySignature":{"quiz"},"harmonize":{"quiz"},"inversion":{"quiz"},
    "interval":{"quiz","listen"},"chordBuild":{"keys","quiz"},
    "chordQuality":{"quiz","listen"},"scaleBuild":{"keys"},
    "cadence":{"listen"},"secondaryDominant":{"listen"}
}
PARTS={"navigation","timing","performance"}

def playable(skill):
    c=skill.get("content",{})
    return c.get("type")!="echo" and (c.get("type")!="conceptChoice" or bool(c.get("choices")))

def part(skill):
    t=skill["content"]["type"]; ev=set(skill["evidence"])
    if t=="rhythmTap" or "tap" in ev: return "timing"
    if t in {"notePlay","song","caregiver","self","teacher"} or ev & {"mic","caregiver","self","teacher"}: return "performance"
    return "navigation"

def version(s):
    m=re.match(r"^(\d+)\.(\d+)(?:\.(\d+))?(?:-|$)",str(s))
    return tuple(int(x or 0) for x in m.groups()) if m else None

def lint(curr, source, baseline):
    errors=[]
    def error(msg): errors.append(msg)
    groups={}
    all_ids=[]
    for kind in ("levels","stops","skills"):
        values=curr.get(kind)
        if not isinstance(values,list):
            error(f"{kind}: expected list"); values=[]
        group={}
        for row in values:
            if not isinstance(row,dict) or not isinstance(row.get("id"),str) or not row["id"]:
                error(f"{kind}: invalid ID"); continue
            ident=row["id"]; all_ids.append(ident)
            if ident in group: error(f"{kind}: duplicate ID {ident}")
            group[ident]=row
        groups[kind]=group
    for ident,n in Counter(all_ids).items():
        if n>1: error(f"non-unique curriculum ID {ident}")
    levels,stops,skills=(groups[k] for k in ("levels","stops","skills"))
    ownership=Counter(); skill_world={}
    for ident,st in stops.items():
        world=st.get("level")
        if world not in levels: error(f"{ident}: unknown world {world}")
        members=st.get("skills")
        if not isinstance(members,list) or not members:
            error(f"{ident}: missing skills"); continue
        for sid in members:
            if sid not in skills: error(f"{ident}: unknown skill {sid}"); continue
            ownership[sid]+=1; skill_world[sid]=world
        checkpoint=st.get("checkpoint",{})
        if checkpoint and checkpoint.get("skillId") not in members:
            error(f"{ident}: checkpoint skill outside stop")
    for sid in skills:
        if ownership[sid]!=1: error(f"{sid}: belongs to {ownership[sid]} stops")
    visiting,visited=set(),set()
    def walk(sid):
        if sid in visiting: error(f"prerequisite cycle at {sid}"); return
        if sid in visited: return
        visiting.add(sid)
        prereqs=skills[sid].get("prereqs")
        if not isinstance(prereqs,list): error(f"{sid}: invalid prereqs"); prereqs=[]
        for p in prereqs:
            if p not in skills: error(f"{sid}: unknown prerequisite {p}")
            else: walk(p)
        visiting.remove(sid); visited.add(sid)
    for sid,s in skills.items():
        walk(sid)
        c=s.get("content")
        if not isinstance(c,dict): error(f"{sid}: missing content"); continue
        t=c.get("type"); ev=s.get("evidence")
        if t not in EVIDENCE: error(f"{sid}: unrecognized content type {t}")
        elif not isinstance(ev,list) or not ev or any(x not in EVIDENCE[t] for x in ev):
            error(f"{sid}: evidence {ev} incompatible with {t}")
        if t=="teacher":
            checklist=c.get("checklist")
            if not isinstance(checklist,list) or len(checklist)<3 or any(not isinstance(x,str) or not x.strip() for x in checklist):
                error(f"{sid}: teacher checklist requires at least three nonempty lines")
    ordered=list(levels)
    for world,lvl in levels.items():
        readiness=lvl.get("readiness")
        if world==ordered[-1] and readiness is None: continue
        if not isinstance(readiness,dict) or set(readiness)!=PARTS:
            error(f"{world}: readiness parts missing or unknown"); continue
        actual=[]
        for p,members in readiness.items():
            if not isinstance(members,list) or not members:
                error(f"{world}: empty readiness {p}"); continue
            for sid in members:
                actual.append(sid)
                if sid not in skills or skill_world.get(sid)!=world:
                    error(f"{world}: foreign or missing readiness skill {sid}"); continue
                sk=skills[sid]
                if not playable(sk): error(f"{world}: unavailable readiness skill {sid}")
                try:
                    if part(sk)!=p: error(f"{world}: {sid} in wrong readiness part {p}")
                except (KeyError,TypeError): error(f"{world}: invalid readiness skill {sid}")
        expected={sid for sid in skills if skill_world.get(sid)==world and playable(skills[sid])}
        if set(actual)!=expected or len(actual)!=len(set(actual)):
            error(f"{world}: readiness must cover each playable skill exactly once")
    src_skills=source.get("skills",[])
    src_ids=[s.get("id") for s in src_skills]
    if len(src_ids)!=len(set(src_ids)) or set(src_ids)!=set(skills):
        error("approved source skill IDs differ from generated curriculum or are duplicated")
    for kind in ("levels","stops"):
        source_ids=[row.get("id") for row in source.get(kind,[])]
        if len(source_ids)!=len(set(source_ids)) or set(source_ids)!=set(groups[kind]):
            error(f"approved source {kind} IDs differ from generated curriculum or are duplicated")
    current_version=version(source.get("version")); accepted_version=version(baseline.get("source_version"))
    if not current_version or not accepted_version: error("invalid objective version")
    elif current_version<accepted_version: error("objective source version rolled back")
    elif current_version==accepted_version:
        objectives={s["id"]:s.get("objective") for s in src_skills}
        if objectives!=baseline.get("objectives"):
            changed=sorted(k for k in set(objectives)|set(baseline["objectives"]) if objectives.get(k)!=baseline["objectives"].get(k))
            error("objective changes require curriculum version bump and review: "+", ".join(changed))
    return errors

def load():
    baseline=json.loads(BASELINE.read_text(encoding="utf8"))
    source=json.loads((ROOT/baseline["source"]).read_text(encoding="utf8"))
    html=(ROOT/"index.html").read_text(encoding="utf8")
    block=re.search(r"/\*NQ-CURRICULUM-BEGIN\*/\nconst CURRICULUM=(.*?);\n/\*NQ-CURRICULUM-END\*/",html,re.S)
    if not block: raise ValueError("generated curriculum not found")
    return json.loads(block.group(1)),source,baseline

def self_test(curr,source,baseline):
    cases=[]
    x=copy.deepcopy(curr); x["skills"].append(copy.deepcopy(x["skills"][0])); cases.append(("duplicate ID",x,source,"duplicate ID"))
    x=copy.deepcopy(curr); x["skills"][0]["prereqs"]=[x["skills"][0]["id"]]; cases.append(("cycle",x,source,"prerequisite cycle"))
    x=copy.deepcopy(curr); x["skills"][0]["evidence"]=["bogus"]; cases.append(("invalid evidence",x,source,"incompatible"))
    x=copy.deepcopy(curr); x["levels"][0]["readiness"]["navigation"]=[]; cases.append(("empty readiness",x,source,"empty readiness"))
    x=copy.deepcopy(curr); next(s for s in x["skills"] if s["content"]["type"]=="teacher")["content"]["checklist"]=[]; cases.append(("teacher rubric",x,source,"teacher checklist"))
    s=copy.deepcopy(source); s["skills"][0]["objective"]+=" (unapproved edit)"; cases.append(("objective version",curr,s,"objective changes"))
    x=copy.deepcopy(curr); x["stops"][0]["skills"].append("unknown-skill"); cases.append(("unknown reference",x,source,"unknown skill"))
    failures=[]
    for name,c,s,expected in cases:
        if not any(expected in e for e in lint(c,s,baseline)): failures.append(name)
    if failures: raise AssertionError("seeded defects not detected: "+", ".join(failures))
    print(f"curriculum lint: {len(cases)} seeded defects detected")

def main():
    parser=argparse.ArgumentParser(); parser.add_argument("--self-test",action="store_true"); args=parser.parse_args()
    curr,source,baseline=load()
    errors=lint(curr,source,baseline)
    if errors:
        for e in errors: print("FAIL",e)
        return 1
    print("curriculum lint: approved source and generated curriculum pass")
    if args.self_test: self_test(curr,source,baseline)
    return 0

if __name__=="__main__": raise SystemExit(main())
