# 25 Days to Bethlehem

A bilingual (English / Malayalam) Advent journey. Each day has four steps: read a verse (unlocks a tree decoration),
Holy Mass (optional: at Mass or a prayer at home), the day's task (unlocks a treasure for the village) and a story.
Steps earn XP; a streak of tasks done on their own day adds bonus XP; XP buys bonus treasures. Treasures go into the
child's village, a painting they arrange by dragging. On Christmas Day the Holy Family is complete for everyone.

## Where things are

| What | File |
|---|---|
| 25 days, both languages: title, verse paraphrase, Mass prayer, task, story (DRAFT, needs review) | `content/missions.ts` |
| Screen text, both languages (Malayalam is DRAFT) | `lib/i18n.ts` |
| The 25-day plan: treasure and tree decoration per day; every piece's name, description, size, GLB and default spot; where pieces may stand | `lib/village/layout.ts` |
| XP, streaks and bonus prices | `lib/game/xp.ts` (mirrored in `child_xp` / `buy_bonus` in migration 003) |
| Treasure chest and leaderboard | `app/treasure/page.tsx`, `app/leaderboard/page.tsx` |
| Tree rules: ornaments, branch anchors, saved-tree validation | `lib/tree.ts` (mirrored in `save_tree` in migration 002) |
| Date rules | `lib/game/unlock.ts` |
| The village: painting backdrop, pieces placed on it, pan and zoom | `components/world/World.tsx` |
| Placed pieces: GLB models, stand-ins, drag and turn | `components/world/VillageScene.tsx` |
| Procedural stand-ins until a GLB exists | `components/world/parts.tsx` |
| Christmas tree and ornament placement | `components/world/Tree.tsx` |
| The world screen: panels, decorating, saving | `app/play/page.tsx` |
| Colour tokens | `app/globals.css` |
| Village paintings (tall for phones, wide for laptops; day and night) | `public/bg/village-*.webp` |
| Day-screen backdrop (red gradient, wreaths, baubles) and snow/frost | `app/globals.css` (`.day-bg`), `components/Frost.tsx` |
| Sounds | `public/sounds/*.mp3`, `lib/sound.ts` |
| Shrinking a model; cutting a land tile's painted sky; making its height map | `scripts/simplify-glb.mjs` |
| Look at one model on its own | `/models?m=santa` |

## Replacing the village painting

Pieces stand on spots given as fractions of the painting (`PIECES[...].spot` and `GROUND` in `lib/village/layout.ts`), so a new
painting needs its spots, walkable ground, horizon and depth checked. To give a piece its model, set `glb` on it in `PIECES`.
For its picture on the treasure screens, set `image` (for example `/treasures/manger.webp`). Keep raw downloads outside `public/`: everything there is deployed.

To shrink a generated 3D model before using it:

```bash
node scripts/simplify-glb.mjs "../xmas-sources/santa2.glb" public/models/santa.glb 110000
```

## Not built yet

GLB models for most treasures, treasure illustrations, quizzes, the AI companion, the admin dashboard (parishes come from fest_hub), household sharing, age modes,
narration, the offline service worker and end-to-end browser tests.
