# CodeQuarry Tier System

## Overview
The tier system replaces traditional "Beginner/Intermediate/Advanced" levels with CodeQuarry-themed progression tiers.

## Tier Levels

### 🥉 Copper - Foundational
- **Target:** Absolute beginners
- **Characteristics:** 
  - Core syntax and fundamentals
  - Basic concepts with simple examples
  - 3-5 short modules
  - Heavy hint system recommended
- **Examples:** "Python Basics", "JavaScript Fundamentals", "C Syntax"
- **Color:** Orange (`bg-orange-600/20 text-orange-300`)

### ⚪ Silver - Intermediate
- **Target:** Learners with foundation knowledge
- **Characteristics:**
  - Building upon basic concepts
  - More complex problems
  - 5-8 moderate modules
  - Mix of guided and open-ended challenges
- **Examples:** "Advanced Python", "Web Development", "C Pointers"
- **Color:** Slate (`bg-slate-600/20 text-slate-300`)

### 🟡 Gold - Advanced
- **Target:** Experienced learners seeking mastery
- **Characteristics:**
  - Complex real-world scenarios
  - Advanced patterns and techniques
  - 5-10 challenging modules
  - Bonus challenges included
- **Examples:** "Algorithm Mastery", "Full Stack Development", "Memory Management"
- **Color:** Yellow (`bg-yellow-600/20 text-yellow-300`)

### 💎 Platinum - Expert
- **Target:** Experts and competitive coders
- **Characteristics:**
  - Expert-level problems
  - Performance optimization focus
  - 5-15 intense modules
  - Community challenges
- **Examples:** "Competitive Programming", "System Design", "Advanced Optimization"
- **Color:** Purple (`bg-purple-600/20 text-purple-300`)

## Best Practices

### Setting the Right Tier
1. **Consider prerequisites:** What should students know before this course?
2. **Test difficulty:** Can a target learner complete the course in 2-3 hours?
3. **Pain points:** Are there many conceptual jumps or complex APIs?
4. **Progression:** Does this course logically follow other courses?

### Tier Progression Path
**Recommended learning flow:**
```
Copper (Foundation) 
    ↓
Silver (Build Skills)
    ↓
Gold (Master Concepts)
    ↓
Platinum (Expert Level)
```

### Content Tips by Tier

#### Copper Modules Should:
- Have clear, unambiguous instructions
- Provide detailed hints (3 + solution)
- Use simple variable names and clean code
- Include introductory videos
- Avoid complex nested logic

#### Silver Modules Should:
- Balance guided problems with open exploration
- Reduce hints to 2 per module
- Introduce edge cases
- Include intermediate-level hints
- Mix theory with practice

#### Gold Modules Should:
- Present real-world scenarios
- Minimal hints (1-2 per module)
- Require optimization thinking
- Include performance benchmarks
- Add bonus challenges

#### Platinum Modules Should:
- Feature competitive programming problems
- Assume learner independence
- Minimal or no hints (learning through struggle)
- Include code golf / optimization challenges
- Require research and exploration

## Display in UI

### Course List
- Shows tier with emoji and name
- Tier-specific background color
- Example: "🥉 Copper - Foundational"

### Course Preview
- Tier badge with color coding
- Module count and stats
- Difficulty progression indication

### Admin Dashboard
- Color-coded tier badges
- Quick visual tier identification
- Sortable by tier (future feature)

## Using Custom Icons

While using preset emojis, consider tier-appropriate icons:
- **Copper:** Mining tools (⛏️), ore (💎), pickaxe
- **Silver:** Progression symbols (📈), intermediate tools
- **Gold:** Achievement symbols (🏆), advanced concepts
- **Platinum:** Expert symbols (👑), mastery concepts

Or upload custom images that represent your course theme!

## Migration Notes

If updating existing courses from the old system:
- Beginner → Copper
- Intermediate → Silver
- Advanced → Gold
- (Add Platinum for new expert courses)

All existing course data will automatically display with the new tier system upon update.
