# Skill: Writing Image-Generator Prompts (Gemini and others)

How to write prompts Olly pastes into Google Gemini (or another image generator) to make images for trainings, Reels, covers and pages. Built 2026-10-23 from the "How To Use Emotional Resonance" training frames. Read this before writing any image prompt.

---

## 1. How to hand prompts over

- **One complete prompt per image, each in its own code block**, so Olly can copy it in one click. Never "paste this style line at the end of each": repeat the whole style line inside every prompt (Olly asked for this: "Just outline the every prompt, so I can just copy it").
- Put the **file name above each block** (e.g. **1. Ordinary Sunday.jpg**) so he knows which is which.
- Separate images = separate prompts. Never ask for several images in one prompt.
- Say where to save them (the exact folder path) once, at the end.

## 2. Every prompt must end with these two lines

```
Do not add any text, symbols, or anything else to the image. Name the image file "<File Name>.jpg".
```

- **No text or symbols** (Olly, 2026-10-23). Image generators love adding captions, labels, fake logos and watermarks. Say it in the style line ("no text, no logos, no watermarks") AND as the final sentence. The only exception is an image that is *meant* to carry words (see section 5).
- **The file name** must match the name the page or training already expects (the `<img src>` / placeholder label), e.g. `Ordinary Sunday.jpg`.
- **Tell Olly honestly that Gemini usually can't set the download's file name.** The files often arrive with generic names. That's fine: he drops them in the folder with any name, and Claude looks at each image (`Read` the file), works out which slot it belongs to, and renames it (or points the `src` at the real name). Never ask him to rename files himself. **If he has already renamed them himself (e.g. "Couple at coffee shop.jpg"), keep his names and point the `src` and placeholder label at them; don't rename his files** (2026-10-23: he renamed them while I was renaming, and two `mv`s failed). `ls` the folder right before any rename.

## 3. The standard style line (photo frames in trainings)

Paste this, word for word, into every photographic prompt:

```
Style: photorealistic, natural candid photography, warm golden-hour light with a soft hint of violet in the shadows, shallow depth of field, gentle and emotional, no text, no logos, no watermarks. Portrait orientation, 3:4 aspect ratio (1536x2048 px). Keep faces and key subjects away from the edges.
```

- Warm golden light + a hint of violet sits well on the purple slides (#4B1466 → #150818 → #0A0510).
- **Keep faces and key subjects away from the edges**: frames crop and tilt slightly.

## 4. Size and shape, by where the image goes

| Where it goes | Shape | Ask for |
|---|---|---|
| Training photo frame (`.photo-frame`, tilted card) | Portrait 3:4 | 1536x2048 px |
| Wide training frame (`.photo-frame--wide`, graphs) | Landscape 16:9 | 1920x1080 px |
| Training step image (`.step-imgwrap`) | Square 1:1 | 1024x1024 px |
| Tall slide image (e.g. the emotional scale) | Portrait 9:16 | 1080x1920 px |
| Skool classroom cover | 1460x752 | (now text-only, made in `program-cover-generator.html`, no image) |

Always state the exact ratio AND pixel size in the prompt.

## 5. Images that are meant to contain words (diagrams, scales)

For slide images that carry text on purpose (like `Emotional Scale.jpg`):
- Give the exact words to show, spelled out, and nothing else.
- Give the slide palette: background gradient #4B1466 → #150818 → #0A0510, text #FFFFFF / #E6DCF2, accents #E1A6FF → #D946EF, a Poppins-style bold sans-serif.
- Add: "leave a margin on every side so no word touches the edge."
- When Olly re-generates from a previous output as a reference, the prompt lists only the changes, plus "keep everything else the same".
- Still end with "Do not add any other text, symbols, or anything else to the image."

## 6. Who's in the pictures

- The audience is driven, growth-minded singles, mostly women aged 30–45 (avatar: Catrin, `marketing\memory\avatar-catrin.md`). Show **ordinary, real-looking people in their late 30s**, not models or glamour shots.
- Couples: warm, genuine, unposed connection. The promised land is calm, ordinary life together (breakfast, walks, cooking, seeing friends and family), not fireworks.
- "Before" images (the stuck state): thoughtful, a little deflated, never crying, mocked or pitiful. Never make fun of being single.
- Write the scene concretely: who, where, what they're doing, the feeling, the light.
- **Phones, books, signs and screens invite stray text.** "A phone with no reply" produced a "NO NEW MESSAGES" label (2026-10-23), and self-help books got readable titles. Either leave them out, or say "the phone screen is dark/blank" and "book covers have no visible writing".

## 7. Checking the result before it goes in

When Olly drops images in:
1. `Read` every file to see what it actually shows. Never trust the file name.
2. Check for **any text, letters, symbols, logos or watermarks**; stray words are common.
3. Check faces look natural (hands, eyes) and nothing important touches the edges.
4. Match each image to its slot, rename it or update the `src`, then rebuild any base64 preview copy and republish.
5. If one fails, give Olly a short fix-up prompt to paste back into Gemini, e.g. *"Keep everything the same but remove all text and symbols."* or *"Keep everything the same but make the faces look more natural."*

## 8. Copyright

Don't recreate or reuse other people's branded images for public content. Example: a heart-rhythm chart that copies HeartMath's well-known chart is fine to talk over, but for public YouTube it's safer to make an original version in the brand colours. Never put a real brand, logo or person's likeness into a prompt.

## 9. Example (the one Olly approved, 2026-10-23)

**5. Ordinary Sunday.jpg**
```
A couple in their late 30s having a slow Sunday breakfast together at home, still in comfortable weekend clothes, coffee mugs, sunlight across the table, one reaching for the other's hand. Calm, safe, peaceful, completely ordinary and happy. Style: photorealistic, natural candid photography, warm golden-hour light with a soft hint of violet in the shadows, shallow depth of field, gentle and emotional, no text, no logos, no watermarks. Portrait orientation, 3:4 aspect ratio (1536x2048 px). Keep faces and key subjects away from the edges. Do not add any text, symbols, or anything else to the image. Name the image file "Ordinary Sunday.jpg".
```

---

## Changelog

- **2026-10-23:** Created from the emotional resonance training session. Rules: one copy-ready prompt per image with the full style line repeated; every prompt ends with "Do not add any text, symbols, or anything else to the image." and the file name; Gemini may ignore the file name, so Claude identifies and renames dropped-in images; sizes per slot; check images for stray text before use; copyright caution on recreated charts.

- 2026-10-29: Carousel slides (content generator) get prompts built in the page: 3:4, 1080x1440, subject in the top half and the middle/lower part calm because white text boxes sit there; real-people mode keeps one woman across slides ("same woman as the earlier images in this chat", pasted in order in one Gemini chat); colour mode = brand purples with lilac/magenta glows, no objects.
