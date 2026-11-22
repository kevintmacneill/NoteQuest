import assert from "node:assert/strict";
import {
  CHARACTER_IDENTITY_SCHEMA, validateCharacterIdentity, selectCharacterAsset
} from "../assets/characters/identity-system/index.mjs";
import { fromNoteQuestDragonCanon } from "../assets/characters/identity-system/notequest-dragon-adapter.mjs";

let checks = 0;
const ok = fn => { fn(); checks++; };
const originalSha = "1f51be071b1b99e4c2acd8b2d3e5a805c04366ec2e155bc67a9fa0ed38e50052";
const thumbSha = "688d0ec3bebc18b4b7c1f36b174cf661c7b7114635144fc92ee7c2e36c7a9bb9";
const dragonCanon = {
  schema:"notequest.character.canon/1.0",
  id:"milestone-dragon",
  canonicalRole:"journey-milestone-guide",
  displayName:null,
  original:{sha256:originalSha,width:1229,height:1536,repositoryStatus:"FULL_RESOLUTION_ORIGINAL_NOT_YET_COMMITTED"},
  immutableMarkers:["pink membrane wings","purple diamond pendant"],
  image:{path:"reference-v1.webp",type:"image/webp",width:256,height:320,sha256:thumbSha}
};
const base = fromNoteQuestDragonCanon(dragonCanon);
const copy = () => structuredClone(base);
ok(() => assert.equal(base.schema,CHARACTER_IDENTITY_SCHEMA));
ok(() => assert.equal(base.displayName,null));
ok(() => assert.equal(validateCharacterIdentity(base),true));
ok(() => assert.equal(selectCharacterAsset(base).path,"milestone-dragon/reference-v1.webp"));
ok(() => assert.equal(selectCharacterAsset(base,{purpose:"reference",minWidth:256,minHeight:320}).sha256,thumbSha));
ok(() => assert.throws(()=>selectCharacterAsset(base,{purpose:"reference",minWidth:257}),/no approved/));
ok(() => assert.throws(()=>selectCharacterAsset(base,{purpose:"game"}),/no approved/));
ok(() => assert.throws(()=>selectCharacterAsset(base,{purpose:"video",minWidth:1920}),/no approved/));
ok(() => assert.throws(()=>selectCharacterAsset(base,{purpose:"3d-animation"}),/no approved/));
ok(() => {const x=copy();x.assets[0].path="../escape.png";assert.throws(()=>validateCharacterIdentity(x),/safe relative/);});
ok(() => {const x=copy();x.assets[0].sha256="changed";assert.throws(()=>validateCharacterIdentity(x),/hash/);});
ok(() => {const x=copy();x.assets[0].sourceSha256="0".repeat(64);assert.throws(()=>validateCharacterIdentity(x),/trace/);});
ok(() => {const x=copy();x.future3d.status="APPROVED";assert.throws(()=>validateCharacterIdentity(x),/approved 3D/);});
ok(() => {const x=copy();x.assets[0].approval="OWNER_APPROVED";x.assets[0].purposes=["game"];assert.equal(selectCharacterAsset(x,{purpose:"game",minWidth:200}).path,"milestone-dragon/reference-v1.webp");});
ok(() => {const x=copy();x.assets[0].kind="2d-vector";x.assets[0].mediaType="image/svg+xml";delete x.assets[0].width;delete x.assets[0].height;x.assets[0].approval="OWNER_APPROVED";x.assets[0].purposes=["video"];assert.equal(selectCharacterAsset(x,{purpose:"video",minWidth:3840}).kind,"2d-vector");});
console.log(checks+" passed, 0 failed");
