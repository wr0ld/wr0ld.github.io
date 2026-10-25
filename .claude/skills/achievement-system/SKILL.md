---
name: "achievement-system"
description: "Manages the blog's achievement/card system. Invoke when adding new achievements, modifying achievement logic, or integrating features with the achievement system."
---

# Achievement System Skill

This skill manages the blog's achievement (card) system, providing unified APIs for achievement operations.

## Core Files

| File | Purpose |
|------|---------|
| `my-blog/themes/stellar/source/js/plugins/achievements.js` | Main achievement system logic |
| `my-blog/source/settings/index.md` | Achievement guide UI and helper functions |

## Unified API (Recommended)

### Basic Unlock

```javascript
CardSystem.unlock('achievement_id');
```

Automatically detects achievement type (normal/hidden/progress) and handles accordingly.

### Progress Achievement

```javascript
CardSystem.unlock('reader_10', { increment: 1 });  // 增加进度
CardSystem.unlock('reader_50', { progress: 25 });  // 设置进度
```

### Batch Unlock

```javascript
var count = CardSystem.unlockAll();  // 返回解锁数量
```

## Legacy API (Compatible)

| Function | Purpose |
|----------|---------|
| `obtainCard(id)` | Unlock normal achievement |
| `obtainHiddenCard(id)` | Unlock hidden achievement |
| `incrementProgress(id, amount)` | Add progress |
| `updateProgress(id, progress)` | Set progress |

## Achievement Types

| Type | Storage | Example IDs |
|------|---------|-------------|
| Normal | `CardSystem.cards` | `first_visit`, `gamer`, `hacker` |
| Hidden | `CardSystem.hiddenCards` | `triple_click`, `scroll_master` |
| Progress | `CardSystem.cards` with `progress/target` | `reader_10`, `code_master` |

## Adding New Achievement

### Step 1: Define in achievements.js

```javascript
'new_achievement_id': {
  name: '成就名称',
  desc: '成就描述',
  icon: '🎯',
  rarity: 'common',  // common, rare, epic, legendary
  flavor: '趣味描述',
  obtained: false,
  obtainTime: null,
  // 进度成就需要以下字段
  progress: 0,
  target: 10
}
```

### Step 2: Trigger Achievement

```javascript
// 在触发点调用
CardSystem.unlock('new_achievement_id');

// 或进度类
CardSystem.unlock('new_achievement_id', { increment: 1 });
```

### Step 3: Add to Guide

在 `settings/index.md` 的 `getAchievementsData()` 函数中添加：

```javascript
{ name: '成就名称', desc: '成就描述', method: '获取方法' }
```

## Rarity Colors

| Rarity | Color | Glow |
|--------|-------|------|
| common | #718096 | rgba(113,128,150,0.3) |
| rare | #63b3ed | rgba(99,179,237,0.3) |
| epic | #b794f4 | rgba(183,148,244,0.3) |
| legendary | #f6e05e | rgba(246,224,94,0.3) |

## Storage Structure

```javascript
localStorage key: 'cardCollection'
{
  cards: {
    'achievement_id': {
      name: 'Name',
      obtained: true,
      obtainTime: timestamp,
      progress: 5,
      target: 10
    }
  },
  hiddenCards: {
    'hidden_id': { obtained: true, ... }
  },
  readTime: 0,
  terminalFlags: []
}
```

## Helper Functions (settings/index.md)

| Function | Purpose |
|----------|---------|
| `showAchievementsGuide()` | Display achievement guide modal |
| `getAchievementsData()` | Get achievement list for display |
| `isObtained(name)` | Check if achievement is obtained |
| `calculateProgress()` | Calculate completion progress |
| `unlockAllAchievements()` | Unlock all achievements (testing) |

## Common Achievement IDs

| ID | Name | Rarity |
|----|------|--------|
| `first_visit` | 初来乍到 | common |
| `reader_10` | 阅读新手 | common |
| `reader_50` | 阅读达人 | rare |
| `gamer` | 游戏玩家 | common |
| `hacker` | 黑客 | epic |
| `ctf_master` | CTF大师 | legendary |
| `card_master` | 卡牌大师 | legendary |
| `triple_click` | 三击达人 | hidden |
| `scroll_master` | 滚动大师 | hidden |

## Best Practices

1. Use `CardSystem.unlock()` for all new code
2. Check if achievement exists before triggering
3. Add meaningful flavor text for each achievement
4. Test with `unlockAllAchievements()` in settings
5. Update AGENTS.md when adding new achievement categories
