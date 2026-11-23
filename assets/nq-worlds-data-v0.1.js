/* Generated from NoteQuest curriculum v3.2 review candidate; preview-only. Do not use this data to unlock lessons. */
window.NQ_WORLD_DATA = Object.freeze({
  "schema": "notequest.world-foundation/0.1",
  "status": "curriculum-v3.2-preview-not-authorized-gameplay",
  "source": {
    "curriculum": "coordination/curriculum/curriculum-v3-h02-candidate-v3.2.json",
    "worlds": "coordination/design/world-maps/nine-world-map-nodes-v0.1.json",
    "journeys": "coordination/design/journey-transition-stories-v0.1.json"
  },
  "worlds": [
    {
      "id": "NQ-00",
      "name": "Melody Harbor",
      "scene": "harbor",
      "colors": [
        "#9ed9e7",
        "#e9d0a0",
        "#54a89b",
        "#e1a86d"
      ],
      "icon": "🎼",
      "intro": "Your first notes begin beside the harbor. Discover how the piano is organized, explore high and low sounds, and build your first steady beat.",
      "journey": "Follow the docks, listen to the waves, and discover your musical compass.",
      "focus": "Orientation, pre-reading musical exploration, placement",
      "stops": [
        {
          "id": "NQ-00-U01",
          "title": "Meet the piano",
          "summary": "black-key groups; registers; C4 reference",
          "domains": [
            "D01"
          ],
          "checkpoint": "NQ-00-U01-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-00-U01-S01",
              "objective": "Find groups of two and three black keys",
              "type": "keyGroup",
              "coach": "Black keys come in groups of two and three. Point to the two-key group, then find three.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-00-U01-S02",
              "objective": "Show high versus low ends of the piano",
              "type": "highLow",
              "coach": "Toward the left, piano sounds are lower; toward the right, they are higher.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-00-U01-S03",
              "objective": "Find left and right keyboard sides",
              "type": "keyboardSide",
              "coach": "The left side has the low sounds, and the right side has the high sounds.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-00-U02",
          "title": "Comfortable setup",
          "summary": "bench; flexible hand; safe body posture",
          "domains": [
            "D04",
            "D10"
          ],
          "checkpoint": "NQ-00-U02-S03",
          "optionalRescue": "harbor otter",
          "skills": [
            {
              "id": "NQ-00-U02-S01",
              "objective": "Choose a comfortable bench distance",
              "type": "self",
              "coach": "Move the bench so you can reach the keys without stretching or hunching.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-00-U02-S02",
              "objective": "Demonstrate relaxed arms and wrists",
              "type": "caregiver",
              "coach": "Keep your shoulders relaxed and wrists easy; don't force a curved hand.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-00-U02-S03",
              "objective": "Notice and stop when tension or pain occurs",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-00-U03",
          "title": "Listen and echo",
          "summary": "high/low; 4 beats; pitches by ear",
          "domains": [
            "D03",
            "D05"
          ],
          "checkpoint": "NQ-00-U03-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-00-U03-S01",
              "objective": "Tell high sounds from low sounds",
              "type": "highLow",
              "coach": "Listen once more. Higher sounds are thinner and brighter; lower sounds feel deeper.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-00-U03-S02",
              "objective": "Tap a steady four-beat pulse",
              "type": "rhythmTap",
              "coach": "Say or tap one-two-three-four steadily, without speeding up.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-00-U03-S03",
              "objective": "Echo a short two- or three-sound pattern",
              "type": "echo",
              "coach": "Listen to the shape first: up, down or same. Echo slowly.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-00-U04",
          "title": "Explore sound",
          "summary": "loud/soft; long/short; call and response",
          "domains": [
            "D07",
            "D08"
          ],
          "checkpoint": "NQ-00-U04-S03",
          "optionalRescue": "pelican",
          "skills": [
            {
              "id": "NQ-00-U04-S01",
              "objective": "Play loud and soft intentionally",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-00-U04-S02",
              "objective": "Explore short and sustained notes",
              "type": "durationCompare",
              "coach": "Compare how long each sound continues, not whether it is higher or lower.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-00-U04-S03",
              "objective": "Create an original three-sound question and answer",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-00-U05",
          "title": "Gentle placement",
          "summary": "keyboard landmarks; 2+2 rhythm; optional C-D-E and staff",
          "domains": [
            "D01",
            "D02",
            "D03"
          ],
          "checkpoint": "NQ-00-U05-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-00-U05-S01",
              "objective": "Find matching black-key groups without prompts",
              "type": "keyGroup",
              "coach": "Spot two or three neighboring black keys before choosing.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-00-U05-S02",
              "objective": "Echo a rhythm with no written words",
              "type": "rhythmTap",
              "coach": "Count the pulse internally before tapping; don't rush after a miss.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-00-U05-S03",
              "objective": "Attempt a note-name or staff sample without pressure",
              "type": "conceptChoice",
              "coach": "Examine the displayed choice carefully; actual options and distractors must be authored.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-00-U06",
          "title": "Practice together",
          "summary": "3–5 minute explorer loop; non-reader symbols; positive review",
          "domains": [
            "D10"
          ],
          "checkpoint": "NQ-00-U06-S03",
          "optionalRescue": "harbor otter",
          "skills": [
            {
              "id": "NQ-00-U06-S01",
              "objective": "Choose one short task to practice",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-00-U06-S02",
              "objective": "Use a hint or caregiver help without penalty",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-00-U06-S03",
              "objective": "Finish a brief exploration and reflect on what improved",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        }
      ],
      "next": {
        "to": "NQ-01",
        "travel": "Sail upriver beneath a rainforest canopy",
        "guide": "Your field journal says the Amazon has new musical patterns. Pack a compass, steady beat, and a short explorer melody.",
        "badge": "Rainforest Navigator"
      }
    },
    {
      "id": "NQ-01",
      "name": "Amazon Rainforest",
      "scene": "rainforest",
      "colors": [
        "#b9e1ba",
        "#4b9f79",
        "#256e65",
        "#ecbc66"
      ],
      "icon": "🦜",
      "intro": "A river leads into a living rainforest. Find C, F and G, learn the grand staff, and begin playing short melodies.",
      "journey": "Follow a winding river from the canopy to the first forest concert.",
      "focus": "First keys, rhythm values, letter notes and grand staff",
      "stops": [
        {
          "id": "NQ-01-U01",
          "title": "Black-key discovery",
          "summary": "black-key groups; 2–3 pitches; up/down/same",
          "domains": [
            "D01"
          ],
          "checkpoint": "NQ-01-U01-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-01-U01-S01",
              "objective": "Identify paired and triplet black-key groups on the piano",
              "type": "keyGroup",
              "coach": "Spot two or three neighboring black keys before choosing.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-01-U01-S02",
              "objective": "Play rising and falling groups of black keys",
              "type": "notePlay",
              "coach": "Check the target pitch, listen to your note, and try the same key again. Only one note is evaluated.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-01-U01-S03",
              "objective": "Match piano (soft) and forte (loud) while exploring black keys",
              "type": "symbol",
              "coach": "Piano means soft, and forte means strong. Both can be played comfortably.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-01-U02",
          "title": "Finger numbers and echoes",
          "summary": "finger numerals 1–5; easy black-key pattern",
          "domains": [
            "D04"
          ],
          "checkpoint": "NQ-01-U02-S03",
          "optionalRescue": "sloth",
          "skills": [
            {
              "id": "NQ-01-U02-S01",
              "objective": "Locate thumb as finger 1 on both hands",
              "type": "finger",
              "coach": "Look at the hand picture and count from the thumb (finger 1).",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-01-U02-S02",
              "objective": "Find fingers 1 through 5 on a pictured hand",
              "type": "finger",
              "coach": "Look at the hand picture and count from the thumb (finger 1).",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-01-U02-S03",
              "objective": "Play gentle two- and three-finger echoes without tension",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-01-U03",
          "title": "White keys and letter names",
          "summary": "C D E F G A B; C4; F3/4; G",
          "domains": [
            "D01",
            "D02"
          ],
          "checkpoint": "NQ-01-U03-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-01-U03-S01",
              "objective": "Locate C immediately left of two black keys",
              "type": "noteFind",
              "coach": "Look immediately left of the pair of two black keys to find C.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-01-U03-S02",
              "objective": "Locate F and G by three-black-key groups",
              "type": "noteFind",
              "coach": "Find the group of three black keys; F is just left of the group, then G next door.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-01-U03-S03",
              "objective": "Match note-letter symbols A–G to keyboard locations using picture cues",
              "type": "letterFind",
              "coach": "Use the repeating A–G keyboard pattern; do not guess from the player's age.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-01-U04",
          "title": "Middle C adventures",
          "summary": "quarter half whole dotted-half; 3/4 and 4/4",
          "domains": [
            "D03"
          ],
          "checkpoint": "NQ-01-U04-S03",
          "optionalRescue": "toucan",
          "skills": [
            {
              "id": "NQ-01-U04-S01",
              "objective": "Place both hands around Middle C without twisting wrists",
              "type": "caregiver",
              "coach": "Find Middle C, then settle each hand without twisting the wrists.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-01-U04-S02",
              "objective": "Read a three-note up/down/same letter-note pattern near Middle C",
              "type": "contourRead",
              "coach": "Trace the written notes: up, down or same.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-01-U04-S03",
              "objective": "Play one-hand middle C position C4–G4 melody",
              "type": "notePlay",
              "coach": "Check the target pitch, listen to your note, and try the same key again. Only one note is evaluated.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-01-U05",
          "title": "C position and three beats",
          "summary": "letter-note reading; Middle C; treble bass grand staff",
          "domains": [
            "D02"
          ],
          "checkpoint": "NQ-01-U05-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-01-U05-S01",
              "objective": "Place fingers on C–D–E–F–G in either hand",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-01-U05-S02",
              "objective": "Count a three-beat measure with dotted half and quarter notes",
              "type": "rhythmTap",
              "coach": "A dotted half note fills three quarter-note beats in 3/4.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-01-U05-S03",
              "objective": "Play one-hand C-position five-note melody in an even pulse",
              "type": "notePlay",
              "coach": "Check the target pitch, listen to your note, and try the same key again. Only one note is evaluated.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-01-U06",
          "title": "Bass staff expedition",
          "summary": "Middle C/C position; C4-G4; alternating hands",
          "domains": [
            "D01",
            "D04"
          ],
          "checkpoint": "NQ-01-U06-S03",
          "optionalRescue": "capybara",
          "skills": [
            {
              "id": "NQ-01-U06-S01",
              "objective": "Identify the bass clef and five-line bass staff",
              "type": "symbol",
              "coach": "The bass clef marks lower staff pitches, not a learner's age.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-01-U06-S02",
              "objective": "Read C3–G3 notes on the bass staff",
              "type": "noteName",
              "coach": "Look at the notehead line or space, then check the clef.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-01-U06-S03",
              "objective": "Play C3–G3 one at a time from bass staff notation",
              "type": "notePlay",
              "coach": "Check the target pitch, listen to your note, and try the same key again. Only one note is evaluated.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-01-U07",
          "title": "Treble staff expedition",
          "summary": "p/f; dynamics; 4-bar phrases",
          "domains": [
            "D05",
            "D07"
          ],
          "checkpoint": "NQ-01-U07-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-01-U07-S01",
              "objective": "Identify the treble clef and five-line treble staff",
              "type": "symbol",
              "coach": "The treble clef circles the G line.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-01-U07-S02",
              "objective": "Read C4–G4 notes on the treble staff",
              "type": "noteName",
              "coach": "Look at the notehead line or space, then check the clef.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-01-U07-S03",
              "objective": "Play C4–G4 one at a time from treble staff notation",
              "type": "notePlay",
              "coach": "Check the target pitch, listen to your note, and try the same key again. Only one note is evaluated.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-01-U08",
          "title": "Grand staff and first recital",
          "summary": "public-domain/original 4–8-bar beginner tune; performance",
          "domains": [
            "D07",
            "D10"
          ],
          "checkpoint": "NQ-01-U08-S03",
          "optionalRescue": "frog",
          "skills": [
            {
              "id": "NQ-01-U08-S01",
              "objective": "Identify notes on treble and bass staves together",
              "type": "noteName",
              "coach": "Choose the staff first; then locate the line or space.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-01-U08-S02",
              "objective": "Play a one-hand piece using a count-in and repeated notes",
              "type": "notePlay",
              "coach": "Check the target pitch, listen to your note, and try the same key again. Only one note is evaluated.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-01-U08-S03",
              "objective": "Play a short piece for a listener and describe one improvement",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        }
      ],
      "next": {
        "to": "NQ-02",
        "travel": "Cross the grasslands in a wildlife expedition caravan",
        "guide": "The savanna's rhythms travel across open plains. Show that you can read landmarks, keep pulse and play a phrase with control.",
        "badge": "Savanna Pathfinder"
      }
    },
    {
      "id": "NQ-02",
      "name": "African Savanna",
      "scene": "savanna",
      "colors": [
        "#f7d992",
        "#dcad5d",
        "#a86e47",
        "#92ab5b"
      ],
      "icon": "🦓",
      "intro": "Across the savanna, every step has a rhythm. Learn rests, intervals, articulation, and the beginnings of coordinated playing.",
      "journey": "Travel between watering holes, open plains, and an evening music camp.",
      "focus": "Prep B-type reading, rests, intervals and first coordination",
      "stops": [
        {
          "id": "NQ-02-U01",
          "title": "Staff landmarks",
          "summary": "treble E4/G4; bass G2/B2; staff steps/skips",
          "domains": [
            "D02"
          ],
          "checkpoint": "NQ-02-U01-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-02-U01-S01",
              "objective": "Locate treble and bass clefs and staff line/space landmarks",
              "type": "noteName",
              "coach": "Look at the notehead line or space, then check the clef.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-02-U01-S02",
              "objective": "Read a second or third by relative shape",
              "type": "interval",
              "coach": "Count the distance between two notes and listen to their relationship.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-02-U01-S03",
              "objective": "Find familiar staff notes without letter stickers",
              "type": "letterFind",
              "coach": "Use the repeating A–G keyboard pattern; do not guess from the player's age.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-02-U02",
          "title": "Moving positions",
          "summary": "C and G five-finger positions",
          "domains": [
            "D01",
            "D04"
          ],
          "checkpoint": "NQ-02-U02-S03",
          "optionalRescue": "meerkat",
          "skills": [
            {
              "id": "NQ-02-U02-S01",
              "objective": "Find C-position hand placement on either hand",
              "type": "noteFind",
              "coach": "Use nearby black-key groups as landmarks, then find the target white key.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-02-U02-S02",
              "objective": "Shift from C to G position without twisting",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-02-U02-S03",
              "objective": "Play one short line after a controlled position change",
              "type": "notePlay",
              "coach": "Check the target pitch, listen to your note, and try the same key again. Only one note is evaluated.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-02-U03",
          "title": "Intervals 2 to 5",
          "summary": "2nd–5th; harmonic/melodic examples",
          "domains": [
            "D02",
            "D05",
            "D06"
          ],
          "checkpoint": "NQ-02-U03-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-02-U03-S01",
              "objective": "Identify melodic second and third in notation",
              "type": "interval",
              "coach": "Count the distance between two notes and listen to their relationship.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-02-U03-S02",
              "objective": "Find a fourth and fifth on the keyboard",
              "type": "noteFind",
              "coach": "Use nearby black-key groups as landmarks, then find the target white key.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-02-U03-S03",
              "objective": "Distinguish melodic versus simultaneous intervals",
              "type": "interval",
              "coach": "Count the distance between two notes and listen to their relationship.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-02-U04",
          "title": "Read the rests",
          "summary": "whole half quarter rests; 4/4",
          "domains": [
            "D03"
          ],
          "checkpoint": "NQ-02-U04-S03",
          "optionalRescue": "giraffe",
          "skills": [
            {
              "id": "NQ-02-U04-S01",
              "objective": "Identify whole and half rests",
              "type": "symbol",
              "coach": "Look closely at the printed music sign and what it means.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-02-U04-S02",
              "objective": "Tap measures containing quarter rests",
              "type": "rhythmTap",
              "coach": "Count the pulse internally before tapping; don't rush after a miss.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-02-U04-S03",
              "objective": "Maintain four beats of silence without losing pulse",
              "type": "rhythmTap",
              "coach": "Count the pulse internally before tapping; don't rush after a miss.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-02-U05",
          "title": "Connected and detached",
          "summary": "slurs, dots, two- and four-note phrases",
          "domains": [
            "D04",
            "D07"
          ],
          "checkpoint": "NQ-02-U05-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-02-U05-S01",
              "objective": "Recognize legato versus staccato signs",
              "type": "symbol",
              "coach": "Look closely at the printed music sign and what it means.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-02-U05-S02",
              "objective": "Play connected versus detached single-line patterns",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-02-U05-S03",
              "objective": "End a short slur/phrase comfortably",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-02-U06",
          "title": "Eighth-note energy",
          "summary": "eighth notes; simple meters; quarter rests",
          "domains": [
            "D03"
          ],
          "checkpoint": "NQ-02-U06-S03",
          "optionalRescue": "zebra",
          "skills": [
            {
              "id": "NQ-02-U06-S01",
              "objective": "Count paired eighth notes steadily",
              "type": "rhythmTap",
              "coach": "Count the pulse internally before tapping; don't rush after a miss.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-02-U06-S02",
              "objective": "Read 2/4, 3/4, and 4/4 measures",
              "type": "conceptChoice",
              "coach": "Examine the displayed choice carefully; actual options and distractors must be authored.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-02-U06-S03",
              "objective": "Perform a short eighth-note tap exercise",
              "type": "rhythmTap",
              "coach": "Count the pulse internally before tapping; don't rush after a miss.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-02-U07",
          "title": "Two hands begin",
          "summary": "hands together; whole-note pedal-free support",
          "domains": [
            "D04",
            "D07"
          ],
          "checkpoint": "NQ-02-U07-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-02-U07-S01",
              "objective": "Play one note with both hands at the same time",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-02-U07-S02",
              "objective": "Alternate left- and right-hand measures",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-02-U07-S03",
              "objective": "Perform simple melody with sustained accompaniment",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-02-U08",
          "title": "Echo and duet",
          "summary": "2–4-bar duets; echo rhythm; basic ensemble timing",
          "domains": [
            "D05",
            "D09"
          ],
          "checkpoint": "NQ-02-U08-S03",
          "optionalRescue": "meerkat",
          "skills": [
            {
              "id": "NQ-02-U08-S01",
              "objective": "Copy a four-beat rhythmic question",
              "type": "rhythmTap",
              "coach": "Count the pulse internally before tapping; don't rush after a miss.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-02-U08-S02",
              "objective": "Take turns with a partner without losing pulse",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-02-U08-S03",
              "objective": "Complete a short two-part phrase and reflect",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        }
      ],
      "next": {
        "to": "NQ-03",
        "travel": "Follow a red-earth track to the Outback",
        "guide": "The trail brings changing note patterns. Prepare with interval reading, rhythmic subdivision and two-hand coordination.",
        "badge": "Outback Wayfinder"
      }
    },
    {
      "id": "NQ-03",
      "name": "Australian Outback",
      "scene": "outback",
      "colors": [
        "#f6c48d",
        "#d47e5c",
        "#985a50",
        "#a9b57f"
      ],
      "icon": "🦘",
      "intro": "Beyond the red-earth trail, musical ideas become longer and more expressive. Explore accidentals, scales and musical phrasing.",
      "journey": "Cross the ochre landscape with careful listening and confident patterns.",
      "focus": "Prep C–D-type reading/technique: eighths, articulation, first scales",
      "stops": [
        {
          "id": "NQ-03-U01",
          "title": "Accidental discovery",
          "summary": "sharp flat natural; F# Bb; C/G/D/F patterns",
          "domains": [
            "D01",
            "D02",
            "D06"
          ],
          "checkpoint": "NQ-03-U01-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-03-U01-S01",
              "objective": "Identify sharp flat and natural symbols",
              "type": "conceptChoice",
              "coach": "Examine the displayed choice carefully; actual options and distractors must be authored.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-03-U01-S02",
              "objective": "Find altered white-key and black-key pitch locations",
              "type": "letterFind",
              "coach": "Use the repeating A–G keyboard pattern; do not guess from the player's age.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-03-U01-S03",
              "objective": "Read a short accidental-based one-hand phrase",
              "type": "notePlay",
              "coach": "Check the target pitch, listen to your note, and try the same key again. Only one note is evaluated.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-03-U02",
          "title": "Hand journeys",
          "summary": "position shift; ledger line C4 and nearby pitches",
          "domains": [
            "D01",
            "D02",
            "D04"
          ],
          "checkpoint": "NQ-03-U02-S03",
          "optionalRescue": "wombat",
          "skills": [
            {
              "id": "NQ-03-U02-S01",
              "objective": "Read a position change beyond five fixed notes",
              "type": "conceptChoice",
              "coach": "Examine the displayed choice carefully; actual options and distractors must be authored.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-03-U02-S02",
              "objective": "Shift one hand between two landmarks smoothly",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-03-U02-S03",
              "objective": "Play a short excerpt containing one hand move",
              "type": "notePlay",
              "coach": "Check the target pitch, listen to your note, and try the same key again. Only one note is evaluated.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-03-U03",
          "title": "Eighth-note paths",
          "summary": "eighths; eighth rests; 2/4 3/4 4/4",
          "domains": [
            "D03"
          ],
          "checkpoint": "NQ-03-U03-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-03-U03-S01",
              "objective": "Recognize eighth-note beaming and rests",
              "type": "symbol",
              "coach": "Look closely at the printed music sign and what it means.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-03-U03-S02",
              "objective": "Tap eighth/quarter patterns with an even pulse",
              "type": "rhythmTap",
              "coach": "Count the pulse internally before tapping; don't rush after a miss.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-03-U03-S03",
              "objective": "Count an eighth-note pattern while playing one hand",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-03-U04",
          "title": "Staccato and accents",
          "summary": "staccato accents dynamic phrases",
          "domains": [
            "D04",
            "D07"
          ],
          "checkpoint": "NQ-03-U04-S03",
          "optionalRescue": "kangaroo",
          "skills": [
            {
              "id": "NQ-03-U04-S01",
              "objective": "Distinguish slur, dot, and accent visually",
              "type": "symbol",
              "coach": "Look closely at the printed music sign and what it means.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-03-U04-S02",
              "objective": "Perform detached versus connected phrases",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-03-U04-S03",
              "objective": "Shape a contrasting loud/soft phrase",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-03-U05",
          "title": "Major-scale trail",
          "summary": "C/G major scales one octave",
          "domains": [
            "D04",
            "D06"
          ],
          "checkpoint": "NQ-03-U05-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-03-U05-S01",
              "objective": "Recognize the C major whole/half-step map",
              "type": "chordQuality",
              "coach": "Compare the chord sound without claiming single-note mic detection can hear all notes.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-03-U05-S02",
              "objective": "Play C major one octave with safe fingering",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-03-U05-S03",
              "objective": "Try G major after locating F#",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-03-U06",
          "title": "Bigger intervals",
          "summary": "intervals 6 7 8; octaves",
          "domains": [
            "D02",
            "D05",
            "D06"
          ],
          "checkpoint": "NQ-03-U06-S03",
          "optionalRescue": "echidna",
          "skills": [
            {
              "id": "NQ-03-U06-S01",
              "objective": "Read a sixth versus seventh on the staff",
              "type": "interval",
              "coach": "Count the distance between two notes and listen to their relationship.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-03-U06-S02",
              "objective": "Recognize an octave on piano and page",
              "type": "noteFind",
              "coach": "Use nearby black-key groups as landmarks, then find the target white key.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-03-U06-S03",
              "objective": "Listen for octave equivalence",
              "type": "interval",
              "coach": "Count the distance between two notes and listen to their relationship.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-03-U07",
          "title": "Pedal colors",
          "summary": "damper pedal; clean pedal changes",
          "domains": [
            "D04",
            "D05",
            "D07"
          ],
          "checkpoint": "NQ-03-U07-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-03-U07-S01",
              "objective": "Locate a sustain pedal and explain its sound",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-03-U07-S02",
              "objective": "Press and release pedal without blur in one chord",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-03-U07-S03",
              "objective": "Choose when no pedal is more appropriate",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-03-U08",
          "title": "Outback music path",
          "summary": "ostinato; simple 16-bar performance",
          "domains": [
            "D07",
            "D08",
            "D09"
          ],
          "checkpoint": "NQ-03-U08-S03",
          "optionalRescue": "wombat",
          "skills": [
            {
              "id": "NQ-03-U08-S01",
              "objective": "Play a two-hand repeating accompaniment pattern",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-03-U08-S02",
              "objective": "Improvise a short melody over a repeated pulse",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-03-U08-S03",
              "objective": "Perform a 16-measure excerpt with a review",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        }
      ],
      "next": {
        "to": "NQ-04",
        "travel": "Board the research vessel toward Arctic and Antarctic stations",
        "guide": "Polar winds ask for clear musical signals. Check your scales, accidentals and a steady expressive phrase.",
        "badge": "Polar Researcher"
      }
    },
    {
      "id": "NQ-04",
      "name": "Polar Expedition",
      "scene": "polar",
      "colors": [
        "#d9eff7",
        "#91c9db",
        "#507baf",
        "#cee2f3"
      ],
      "icon": "🧊",
      "intro": "Travel through the polar world where precision matters. Build confident patterns, hear changing harmony and prepare expressive music.",
      "journey": "Visit separate Arctic and Antarctic research outposts across the ice.",
      "focus": "Prep E–F bridge: reading beyond staff, triads, primary chords and minor",
      "stops": [
        {
          "id": "NQ-04-U01",
          "title": "Ledger-line explorer",
          "summary": "ledger lines; octave locations",
          "domains": [
            "D01",
            "D02"
          ],
          "checkpoint": "NQ-04-U01-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-04-U01-S01",
              "objective": "Locate common notes beyond the five-line staff",
              "type": "noteName",
              "coach": "Look at the notehead line or space, then check the clef.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-04-U01-S02",
              "objective": "Read one ledger line above/below a familiar clef",
              "type": "noteName",
              "coach": "Look at the notehead line or space, then check the clef.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-04-U01-S03",
              "objective": "Play a melody requiring safe position shifts",
              "type": "notePlay",
              "coach": "Check the target pitch, listen to your note, and try the same key again. Only one note is evaluated.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-04-U02",
          "title": "Dotted rhythm guide",
          "summary": "dotted quarters, ties, eighths",
          "domains": [
            "D03"
          ],
          "checkpoint": "NQ-04-U02-S03",
          "optionalRescue": "arctic fox",
          "skills": [
            {
              "id": "NQ-04-U02-S01",
              "objective": "Read dotted-quarter-plus-eighth relationships",
              "type": "beats",
              "coach": "Count a steady beat; match the note's duration.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-04-U02-S02",
              "objective": "Tap dotted rhythm against a steady beat",
              "type": "rhythmTap",
              "coach": "Count the pulse internally before tapping; don't rush after a miss.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-04-U02-S03",
              "objective": "Read tied notes across a measure boundary",
              "type": "rhythmTap",
              "coach": "Count the pulse internally before tapping; don't rush after a miss.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-04-U03",
          "title": "Sixths and octaves",
          "summary": "6ths–8ves; staff interval span",
          "domains": [
            "D02",
            "D05"
          ],
          "checkpoint": "NQ-04-U03-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-04-U03-S01",
              "objective": "Identify sixth and octave shapes",
              "type": "interval",
              "coach": "Count the distance between two notes and listen to their relationship.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-04-U03-S02",
              "objective": "Hear ascending and descending octave motion",
              "type": "interval",
              "coach": "Count the distance between two notes and listen to their relationship.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-04-U03-S03",
              "objective": "Read a phrase that spans a sixth or octave",
              "type": "interval",
              "coach": "Count the distance between two notes and listen to their relationship.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-04-U04",
          "title": "Triad foundations",
          "summary": "C F G and Am triads",
          "domains": [
            "D04",
            "D06"
          ],
          "checkpoint": "NQ-04-U04-S03",
          "optionalRescue": "seal",
          "skills": [
            {
              "id": "NQ-04-U04-S01",
              "objective": "Build a C major triad from stacked thirds",
              "type": "scaleBuild",
              "coach": "Find the starting note and follow the agreed step pattern.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-04-U04-S02",
              "objective": "Recognize major versus minor triad formula",
              "type": "chordQuality",
              "coach": "Compare the chord sound without claiming single-note mic detection can hear all notes.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-04-U04-S03",
              "objective": "Play blocked and broken triads comfortably",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-04-U05",
          "title": "Primary chords",
          "summary": "C major I/IV/V7; 4-bar accompaniment",
          "domains": [
            "D06",
            "D09"
          ],
          "checkpoint": "NQ-04-U05-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-04-U05-S01",
              "objective": "Identify tonic, subdominant, and dominant in C",
              "type": "keySignature",
              "coach": "Read the sharps or flats in the key signature before choosing.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-04-U05-S02",
              "objective": "Play I–IV–V7 with smooth motions",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-04-U05-S03",
              "objective": "Accompany a melody with simple primary chords",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-04-U06",
          "title": "Minor atmosphere",
          "summary": "A minor E minor; major/minor",
          "domains": [
            "D05",
            "D06"
          ],
          "checkpoint": "NQ-04-U06-S03",
          "optionalRescue": "penguin",
          "skills": [
            {
              "id": "NQ-04-U06-S01",
              "objective": "Hear a major versus minor tonic mood",
              "type": "chordQuality",
              "coach": "Compare the chord sound without claiming single-note mic detection can hear all notes.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-04-U06-S02",
              "objective": "Find relative minor of C/G major",
              "type": "keySignature",
              "coach": "Read the sharps or flats in the key signature before choosing.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-04-U06-S03",
              "objective": "Play a short A minor melody and primary chord",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-04-U07",
          "title": "Scale and pedal changes",
          "summary": "one-octave scales; cadence; broken chords",
          "domains": [
            "D04",
            "D07"
          ],
          "checkpoint": "NQ-04-U07-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-04-U07-S01",
              "objective": "Play C or G scale with improved evenness",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-04-U07-S02",
              "objective": "Use controlled pedal on a simple cadence",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-04-U07-S03",
              "objective": "Coordinate melody against repeating bass pattern",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-04-U08",
          "title": "Prep bridge recital",
          "summary": "8–24 bars; dynamics; chords; controlled reading",
          "domains": [
            "D07",
            "D10"
          ],
          "checkpoint": "NQ-04-U08-S03",
          "optionalRescue": "arctic fox",
          "skills": [
            {
              "id": "NQ-04-U08-S01",
              "objective": "Read a short unfamiliar 8-bar phrase",
              "type": "conceptChoice",
              "coach": "Examine the displayed choice carefully; actual options and distractors must be authored.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-04-U08-S02",
              "objective": "Prepare a contrasting two-hand piece",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-04-U08-S03",
              "objective": "Complete a self/caregiver capstone showing safe technique",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        }
      ],
      "next": {
        "to": "NQ-05",
        "travel": "Dive from the ice ship to a protected coral reef research dome",
        "guide": "Below the surface, harmony and rhythmic currents weave together. Practice a clean change, a pattern and expressive balance.",
        "badge": "Reef Listener"
      }
    },
    {
      "id": "NQ-05",
      "name": "Coral Reef",
      "scene": "reef",
      "colors": [
        "#b6eadd",
        "#5ebbc4",
        "#467eae",
        "#ed8d82"
      ],
      "icon": "🐠",
      "intro": "In the coral reef, notes flow in rich patterns. Learn more expressive rhythmic and harmonic connections.",
      "journey": "Explore sunlit coral gardens, reef passages, and marine music discoveries.",
      "focus": "Early intermediate: keys, 6/8, independent hands, harmony and genre",
      "stops": [
        {
          "id": "NQ-05-U01",
          "title": "Key families",
          "summary": "circle of fifths basics; C/G/D/F/A minor",
          "domains": [
            "D01",
            "D06"
          ],
          "checkpoint": "NQ-05-U01-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-05-U01-S01",
              "objective": "Match common key signatures to tonic names",
              "type": "keySignature",
              "coach": "Read the sharps or flats in the key signature before choosing.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-05-U01-S02",
              "objective": "Identify relative major/minor pairs",
              "type": "keySignature",
              "coach": "Read the sharps or flats in the key signature before choosing.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-05-U01-S03",
              "objective": "Transpose a short five-note pattern to a new key",
              "type": "scaleBuild",
              "coach": "Find the starting note and follow the agreed step pattern.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-05-U02",
          "title": "Arpeggio currents",
          "summary": "major/minor scales; broken triads; cadences",
          "domains": [
            "D04",
            "D06"
          ],
          "checkpoint": "NQ-05-U02-S03",
          "optionalRescue": "sea turtle",
          "skills": [
            {
              "id": "NQ-05-U02-S01",
              "objective": "Play major and minor scale models in two keys",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-05-U02-S02",
              "objective": "Arpeggiate a triad with correct chord tones",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-05-U02-S03",
              "objective": "Perform a simple I–IV–V cadence without tension",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-05-U03",
          "title": "Compound waves",
          "summary": "6/8; triplets; ties syncopation",
          "domains": [
            "D03"
          ],
          "checkpoint": "NQ-05-U03-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-05-U03-S01",
              "objective": "Feel compound 6/8 in two large beats",
              "type": "rhythmTap",
              "coach": "Count the pulse internally before tapping; don't rush after a miss.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-05-U03-S02",
              "objective": "Tap triplets against quarter-based rhythm",
              "type": "rhythmTap",
              "coach": "Count the pulse internally before tapping; don't rush after a miss.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-05-U03-S03",
              "objective": "Read simple syncopation and ties without rushing",
              "type": "rhythmTap",
              "coach": "Count the pulse internally before tapping; don't rush after a miss.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-05-U04",
          "title": "Reading patterns",
          "summary": "chord shapes; 8-bar sight-reading",
          "domains": [
            "D02"
          ],
          "checkpoint": "NQ-05-U04-S03",
          "optionalRescue": "octopus",
          "skills": [
            {
              "id": "NQ-05-U04-S01",
              "objective": "Spot triad and interval patterns in notation",
              "type": "interval",
              "coach": "Count the distance between two notes and listen to their relationship.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-05-U04-S02",
              "objective": "Read an unseen short excerpt at modest tempo",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-05-U04-S03",
              "objective": "Mark repeated motives in a two-hand score",
              "type": "conceptChoice",
              "coach": "Examine the displayed choice carefully; actual options and distractors must be authored.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-05-U05",
          "title": "Hands with independence",
          "summary": "Alberti bass; right-hand melody; balance",
          "domains": [
            "D04",
            "D07"
          ],
          "checkpoint": "NQ-05-U05-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-05-U05-S01",
              "objective": "Keep left-hand accompaniment while right plays melody",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-05-U05-S02",
              "objective": "Voice melody louder than accompaniment",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-05-U05-S03",
              "objective": "Demonstrate an Alberti/broken-chord pattern",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-05-U06",
          "title": "Harmonic direction",
          "summary": "tonic predominant dominant; cadences",
          "domains": [
            "D05",
            "D06"
          ],
          "checkpoint": "NQ-05-U06-S03",
          "optionalRescue": "clownfish",
          "skills": [
            {
              "id": "NQ-05-U06-S01",
              "objective": "Hear tonic versus dominant ending",
              "type": "interval",
              "coach": "Count the distance between two notes and listen to their relationship.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-05-U06-S02",
              "objective": "Identify I–IV–V functions in a short phrase",
              "type": "conceptChoice",
              "coach": "Examine the displayed choice carefully; actual options and distractors must be authored.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-05-U06-S03",
              "objective": "Select a supporting chord for a given melody note",
              "type": "contourRead",
              "coach": "Trace the written notes: up, down or same.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-05-U07",
          "title": "Many music styles",
          "summary": "binary form; blues; chord-chart I IV V",
          "domains": [
            "D07",
            "D09"
          ],
          "checkpoint": "NQ-05-U07-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-05-U07-S01",
              "objective": "Identify a classical mini-form and a blues pattern",
              "type": "conceptChoice",
              "coach": "Examine the displayed choice carefully; actual options and distractors must be authored.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-05-U07-S02",
              "objective": "Read simple pop or worship chord symbols",
              "type": "chordQuality",
              "coach": "Compare the chord sound without claiming single-note mic detection can hear all notes.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-05-U07-S03",
              "objective": "Play a stylistic 8–16-bar accompaniment",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-05-U08",
          "title": "Invent variations",
          "summary": "4-bar phrase variation; original motif",
          "domains": [
            "D08",
            "D10"
          ],
          "checkpoint": "NQ-05-U08-S03",
          "optionalRescue": "sea turtle",
          "skills": [
            {
              "id": "NQ-05-U08-S01",
              "objective": "Change the rhythm of a two-measure motive",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-05-U08-S02",
              "objective": "Create a four-measure variation with a clear ending",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-05-U08-S03",
              "objective": "Record/listen and explain one creative choice",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        }
      ],
      "next": {
        "to": "NQ-06",
        "travel": "Take a mountain trail toward the high observatory",
        "guide": "Mountain echoes reveal more complex harmony. Check reading, rhythmic precision and controlled voicing before climbing.",
        "badge": "Mountain Musician"
      }
    },
    {
      "id": "NQ-06",
      "name": "Himalayan Mountains",
      "scene": "mountains",
      "colors": [
        "#d6dfe5",
        "#8fb0b9",
        "#6c8d8e",
        "#c7a77b"
      ],
      "icon": "🏔️",
      "intro": "Climb into the Himalayan mountains where musical lines weave together. Develop independent voices and increasingly complex repertoire.",
      "journey": "Take the mountain trail through villages, clouds and snowy ridges.",
      "focus": "Intermediate through upper intermediate: voicing, chords, improvisation and ensemble",
      "stops": [
        {
          "id": "NQ-06-U01",
          "title": "Technique and stamina",
          "summary": "2-octave patterns; arpeggio; tension control",
          "domains": [
            "D04"
          ],
          "checkpoint": "NQ-06-U01-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-06-U01-S01",
              "objective": "Play two-octave scales in a comfortable key",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-06-U01-S02",
              "objective": "Use arpeggio motion with relaxed rotation",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-06-U01-S03",
              "objective": "Create a safe short exercise for an uneven passage",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-06-U02",
          "title": "Chord grammar",
          "summary": "inversions; sevenths; ii V I",
          "domains": [
            "D06"
          ],
          "checkpoint": "NQ-06-U02-S03",
          "optionalRescue": "red panda",
          "skills": [
            {
              "id": "NQ-06-U02-S01",
              "objective": "Name root, first, and second inversion triads",
              "type": "interval",
              "coach": "Count the distance between two notes and listen to their relationship.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-06-U02-S02",
              "objective": "Form basic dominant and minor seventh chords",
              "type": "scaleBuild",
              "coach": "Find the starting note and follow the agreed step pattern.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-06-U02-S03",
              "objective": "Voice a smooth ii–V–I in one friendly key",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-06-U03",
          "title": "Dense reading",
          "summary": "transposition; altered notes; syncopation",
          "domains": [
            "D02",
            "D03"
          ],
          "checkpoint": "NQ-06-U03-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-06-U03-S01",
              "objective": "Read multiple accidentals and wider leaps",
              "type": "conceptChoice",
              "coach": "Examine the displayed choice carefully; actual options and distractors must be authored.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-06-U03-S02",
              "objective": "Transpose a short melody by a step or fifth",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-06-U03-S03",
              "objective": "Tap syncopated and compound patterns accurately",
              "type": "rhythmTap",
              "coach": "Count the pulse internally before tapping; don't rush after a miss.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-06-U04",
          "title": "Voices and pedal",
          "summary": "voicing; two-voice study; pedaling",
          "domains": [
            "D04",
            "D07"
          ],
          "checkpoint": "NQ-06-U04-S03",
          "optionalRescue": "snow leopard",
          "skills": [
            {
              "id": "NQ-06-U04-S01",
              "objective": "Bring a melodic top line forward in chord textures",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-06-U04-S02",
              "objective": "Play two overlapping voices with distinct articulation",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-06-U04-S03",
              "objective": "Choose clean pedal timings for changing harmony",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-06-U05",
          "title": "Harmony and ear",
          "summary": "V/V; cadences; related-key change",
          "domains": [
            "D05",
            "D06"
          ],
          "checkpoint": "NQ-06-U05-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-06-U05-S01",
              "objective": "Recognize secondary dominant by sound and notation",
              "type": "interval",
              "coach": "Count the distance between two notes and listen to their relationship.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-06-U05-S02",
              "objective": "Identify common cadence/chord bass motion",
              "type": "chordQuality",
              "coach": "Compare the chord sound without claiming single-note mic detection can hear all notes.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-06-U05-S03",
              "objective": "Analyze a short modulation to a related key",
              "type": "conceptChoice",
              "coach": "Examine the displayed choice carefully; actual options and distractors must be authored.",
              "assessment": "engine-checked-if-supported"
            }
          ]
        },
        {
          "id": "NQ-06-U06",
          "title": "Stylistic repertoire",
          "summary": "Baroque/Classical/Romantic/jazz/worship contrast",
          "domains": [
            "D07"
          ],
          "checkpoint": "NQ-06-U06-S03",
          "optionalRescue": "red panda",
          "skills": [
            {
              "id": "NQ-06-U06-S01",
              "objective": "Compare two historic articulation approaches",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-06-U06-S02",
              "objective": "Play a short blues/swing/pop stylistic study",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-06-U06-S03",
              "objective": "Document a stylistic interpretation choice",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-06-U07",
          "title": "Ensemble and lead sheets",
          "summary": "lead sheet; groove; singer cues",
          "domains": [
            "D09"
          ],
          "checkpoint": "NQ-06-U07-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-06-U07-S01",
              "objective": "Comp a simple pop/worship lead sheet",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-06-U07-S02",
              "objective": "Adjust tempo and cue a partner appropriately",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-06-U07-S03",
              "objective": "Accompany a melody while keeping the singer audible",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-06-U08",
          "title": "Compose and arrange",
          "summary": "8–16-bar composition; short program",
          "domains": [
            "D08",
            "D10"
          ],
          "checkpoint": "NQ-06-U08-S03",
          "optionalRescue": "snow leopard",
          "skills": [
            {
              "id": "NQ-06-U08-S01",
              "objective": "Arrange a melody using chord inversions",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-06-U08-S02",
              "objective": "Compose eight to sixteen measures with contrast",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-06-U08-S03",
              "objective": "Present a recorded mini-program and reflect",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            }
          ]
        }
      ],
      "next": {
        "to": "NQ-07",
        "travel": "Launch a musical shuttle to the orbital station",
        "guide": "Space requires steady coordination. Prove advanced notation, rhythmic independence and a short authentic excerpt.",
        "badge": "Orbital Performer"
      }
    },
    {
      "id": "NQ-07",
      "name": "Space Station",
      "scene": "space",
      "colors": [
        "#252d5b",
        "#4d5790",
        "#768dc9",
        "#efc965"
      ],
      "icon": "🪐",
      "intro": "At the orbital station, careful listening and independence guide the mission. Work with more advanced rhythms and musicianship.",
      "journey": "Explore an original orbital observatory and cosmic practice stations.",
      "focus": "Advanced artistry, complex reading, harmony and artistic resilience",
      "stops": [
        {
          "id": "NQ-07-U01",
          "title": "Advanced movement",
          "summary": "advanced passagework; relaxed technique",
          "domains": [
            "D04"
          ],
          "checkpoint": "NQ-07-U01-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-07-U01-S01",
              "objective": "Choose safe movement for rapid passages",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-07-U01-S02",
              "objective": "Control octaves and chord leaps without pain",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-07-U01-S03",
              "objective": "Design a redistribution/fingering plan for a dense phrase",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-07-U02",
          "title": "Complex rhythms",
          "summary": "mixed meter; 3:2; rubato",
          "domains": [
            "D03"
          ],
          "checkpoint": "NQ-07-U02-S03",
          "optionalRescue": "greenhouse robot companion",
          "skills": [
            {
              "id": "NQ-07-U02-S01",
              "objective": "Read mixed meter and shifting beat groups",
              "type": "rhythmTap",
              "coach": "Count the pulse internally before tapping; don't rush after a miss.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-07-U02-S02",
              "objective": "Perform a simple 3-against-2 cross-rhythm",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-07-U02-S03",
              "objective": "Explain rubato while retaining a shared pulse",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-07-U03",
          "title": "Advanced score reading",
          "summary": "score study; dense notes; irregular patterns",
          "domains": [
            "D02"
          ],
          "checkpoint": "NQ-07-U03-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-07-U03-S01",
              "objective": "Find musical structure in a dense score",
              "type": "conceptChoice",
              "coach": "Examine the displayed choice carefully; actual options and distractors must be authored.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-07-U03-S02",
              "objective": "Explain an unfamiliar symbol using a reliable edition",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-07-U03-S03",
              "objective": "Prepare an unseen multi-voice passage with a plan",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-07-U04",
          "title": "Chromatic harmony",
          "summary": "altered chords; borrowed harmonies; large-scale form",
          "domains": [
            "D06"
          ],
          "checkpoint": "NQ-07-U04-S03",
          "optionalRescue": "greenhouse robot companion",
          "skills": [
            {
              "id": "NQ-07-U04-S01",
              "objective": "Spell a secondary dominant and altered dominant",
              "type": "interval",
              "coach": "Count the distance between two notes and listen to their relationship.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-07-U04-S02",
              "objective": "Analyze modal mixture in a phrase",
              "type": "conceptChoice",
              "coach": "Examine the displayed choice carefully; actual options and distractors must be authored.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-07-U04-S03",
              "objective": "Explain a longer harmonic trajectory in a movement",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-07-U05",
          "title": "Expressive ear",
          "summary": "critical listening; phrasing; tone",
          "domains": [
            "D05",
            "D07"
          ],
          "checkpoint": "NQ-07-U05-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-07-U05-S01",
              "objective": "Compare voicing in two recordings",
              "type": "interval",
              "coach": "Count the distance between two notes and listen to their relationship.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-07-U05-S02",
              "objective": "Plan dynamic and tonal-color contrasts",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-07-U05-S03",
              "objective": "Make and evaluate an interpretation recording",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-07-U06",
          "title": "Advanced repertoire studio",
          "summary": "historically varied repertoire; performance",
          "domains": [
            "D07",
            "D10"
          ],
          "checkpoint": "NQ-07-U06-S03",
          "optionalRescue": "greenhouse robot companion",
          "skills": [
            {
              "id": "NQ-07-U06-S01",
              "objective": "Build a multi-week practice schedule for a major work",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-07-U06-S02",
              "objective": "Perform contrasting repertoire excerpts",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-07-U06-S03",
              "objective": "Audit readiness by memorization/performance checks",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-07-U07",
          "title": "Advanced creativity",
          "summary": "advanced harmony; ensemble",
          "domains": [
            "D08",
            "D09"
          ],
          "checkpoint": "NQ-07-U07-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-07-U07-S01",
              "objective": "Improvise across a richer progression",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-07-U07-S02",
              "objective": "Arrange two-part textures for collaborators",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-07-U07-S03",
              "objective": "Rehearse a duet with prepared cues and balance",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-07-U08",
          "title": "Performance resilience",
          "summary": "mock performance; recovery; planning",
          "domains": [
            "D10"
          ],
          "checkpoint": "NQ-07-U08-S03",
          "optionalRescue": "greenhouse robot companion",
          "skills": [
            {
              "id": "NQ-07-U08-S01",
              "objective": "Run a mock recital without stopping at every error",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-07-U08-S02",
              "objective": "Practice recovery after an intentional interruption",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-07-U08-S03",
              "objective": "Write evidence-based next-stage goals",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        }
      ],
      "next": {
        "to": "NQ-08",
        "travel": "Return from orbit to the Grand Music City",
        "guide": "The final journey celebrates independence. Prove a chosen specialty, complex rhythm and an expressive performance portfolio.",
        "badge": "Independent Explorer"
      }
    },
    {
      "id": "NQ-08",
      "name": "Grand Music City",
      "scene": "city",
      "colors": [
        "#e1c7e2",
        "#a982b2",
        "#4f587d",
        "#e8bb69"
      ],
      "icon": "🎶",
      "intro": "Grand Music City brings the journey together. Apply advanced musicianship, make artistic choices, and keep growing as an independent musician.",
      "journey": "Visit plazas, rehearsal rooms and the grand performance hall.",
      "focus": "Independent musician: lifelong repertoire, composition and collaboration",
      "stops": [
        {
          "id": "NQ-08-U01",
          "title": "Repertoire planner",
          "summary": "self-selected repertoire; planning",
          "domains": [
            "D07",
            "D10"
          ],
          "checkpoint": "NQ-08-U01-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-08-U01-S01",
              "objective": "Select a realistic stretch work and explain the choice",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-08-U01-S02",
              "objective": "Break the work into measurable practice goals",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-08-U01-S03",
              "objective": "Track progress toward a meaningful performance",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-08-U02",
          "title": "Specialist technique",
          "summary": "idiom-specific technique",
          "domains": [
            "D04"
          ],
          "checkpoint": "NQ-08-U02-S03",
          "optionalRescue": "ensemble mascot",
          "skills": [
            {
              "id": "NQ-08-U02-S01",
              "objective": "Diagnose a recurring technical problem safely",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-08-U02-S02",
              "objective": "Select repertoire-specific exercises without strain",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-08-U02-S03",
              "objective": "Demonstrate improved passage control over time",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-08-U03",
          "title": "Advanced harmony in use",
          "summary": "reharmonization; modal/chromatic harmony",
          "domains": [
            "D05",
            "D06"
          ],
          "checkpoint": "NQ-08-U03-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-08-U03-S01",
              "objective": "Reharmonize a melody with justified choices",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-08-U03-S02",
              "objective": "Compare modal and chromatic harmonic colors",
              "type": "chordQuality",
              "coach": "Compare the chord sound without claiming single-note mic detection can hear all notes.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-08-U03-S03",
              "objective": "Play a short transposed progression by ear",
              "type": "caregiver",
              "coach": "Ask the observing adult what looked relaxed and what can improve.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-08-U04",
          "title": "Write and orchestrate",
          "summary": "original composition; keyboard arranging",
          "domains": [
            "D08"
          ],
          "checkpoint": "NQ-08-U04-S03",
          "optionalRescue": "concert hall friend",
          "skills": [
            {
              "id": "NQ-08-U04-S01",
              "objective": "Compose an original complete piece",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-08-U04-S02",
              "objective": "Arrange a piece for singer or ensemble",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-08-U04-S03",
              "objective": "Revise a composition after recording/feedback",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-08-U05",
          "title": "Independent improviser",
          "summary": "improv vocabulary; formal arcs",
          "domains": [
            "D08",
            "D09"
          ],
          "checkpoint": "NQ-08-U05-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-08-U05-S01",
              "objective": "Choose an idiom and build motif vocabulary",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-08-U05-S02",
              "objective": "Improvise a coherent solo with clear form",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-08-U05-S03",
              "objective": "Participate in a live call-and-response performance",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-08-U06",
          "title": "Accompany and lead",
          "summary": "singer/ensemble support; leadership",
          "domains": [
            "D09"
          ],
          "checkpoint": "NQ-08-U06-S03",
          "optionalRescue": "ensemble mascot",
          "skills": [
            {
              "id": "NQ-08-U06-S01",
              "objective": "Prepare an accompaniment for another musician",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-08-U06-S02",
              "objective": "Signal entries and adapt to rehearsal changes",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-08-U06-S03",
              "objective": "Transpose or simplify live while supporting an ensemble",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-08-U07",
          "title": "Listen and interpret",
          "summary": "critical recordings; style decisions",
          "domains": [
            "D05",
            "D07"
          ],
          "checkpoint": "NQ-08-U07-S03",
          "optionalRescue": null,
          "skills": [
            {
              "id": "NQ-08-U07-S01",
              "objective": "Compare recordings with stylistic observations",
              "type": "interval",
              "coach": "Count the distance between two notes and listen to their relationship.",
              "assessment": "engine-checked-if-supported"
            },
            {
              "id": "NQ-08-U07-S02",
              "objective": "Research interpretive practice responsibly",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-08-U07-S03",
              "objective": "Present and defend an individual artistic interpretation",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            }
          ]
        },
        {
          "id": "NQ-08-U08",
          "title": "Lifelong portfolio",
          "summary": "portfolio; reflective cycle; new goals",
          "domains": [
            "D10"
          ],
          "checkpoint": "NQ-08-U08-S03",
          "optionalRescue": "concert hall friend",
          "skills": [
            {
              "id": "NQ-08-U08-S01",
              "objective": "Record a personally meaningful performance",
              "type": "teacher",
              "coach": "A trusted teacher can confirm expressive and advanced skills; the app cannot certify them.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-08-U08-S02",
              "objective": "Assess strengths/gaps using evidence",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            },
            {
              "id": "NQ-08-U08-S03",
              "objective": "Define a next independent musical project",
              "type": "self",
              "coach": "Notice one thing that felt comfortable and one small next step.",
              "assessment": "human-confirmed"
            }
          ]
        }
      ],
      "next": null
    }
  ]
});
