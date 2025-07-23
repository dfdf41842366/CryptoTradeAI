# TRADE ANALYSIS LOGIC EXPLAINED

## Core Analysis Framework

### 1. Entry Price Calculation
- **Logic**: Uses current market price as entry point
- **Precision**: Rounded to 2 decimal places for realistic execution

### 2. Target Price Calculation
Based on momentum direction and volatility:
- **Target 1**: 5% move (75% probability) - Quick scalp target
- **Target 2**: 12% move (45% probability) - Momentum continuation
- **Target 3**: 25% move (20% probability) - Full breakout potential

**Direction Logic**:
- If stock moving UP: Targets are HIGHER than entry
- If stock moving DOWN: Targets are LOWER than entry (short setup)

### 3. Stop Loss Calculation
- **Logic**: 8% opposite to momentum direction
- **Purpose**: Limit losses while allowing normal volatility
- **Upward moves**: Stop loss 8% BELOW entry
- **Downward moves**: Stop loss 8% ABOVE entry

### 4. Risk-Reward Ratios
- **Formula**: (Target Price - Entry Price) / (Entry Price - Stop Loss)
- **Target 1**: Typically 0.6:1 ratio (quick profit)
- **Target 2**: Typically 1.5:1 ratio (good risk/reward)
- **Target 3**: Typically 3.1:1 ratio (excellent risk/reward)

### 5. Strategy Classification
Based on stock characteristics:

**LOW_FLOAT_SQUEEZE**: Float < 5M shares
- High volatility potential
- Quick explosive moves
- Short holding periods

**VOLUME_BREAKOUT**: RVOL > 3x
- Strong institutional interest
- Sustained momentum
- Medium holding periods

**GAP_TRADE**: Change > 10%
- News-driven moves
- High probability reversals
- Specific entry/exit timing

**MOMENTUM_SCALP**: Default strategy
- Technical-based moves
- Quick in-and-out trades
- Lower risk exposure

### 6. Position Sizing Logic
Based on combined risk factors:

**HIGH RISK** (1-2% position):
- RVOL > 2x AND Float < 10M
- Maximum volatility stocks
- Smallest position size

**MEDIUM RISK** (2-3% position):
- RVOL > 1.5x OR Change > 5%
- Moderate volatility
- Standard position size

**LOW RISK** (3-5% position):
- Stable momentum plays
- Lower volatility
- Larger position size acceptable

### 7. Holding Period Estimation
Based on strategy and market conditions:

- **MOMENTUM_SCALP**: 15-30 minutes (quick moves)
- **LOW_FLOAT_SQUEEZE**: 1-4 hours (squeeze duration)
- **VOLUME_BREAKOUT**: 2-6 hours (momentum sustainability)
- **GAP_TRADE**: 4-24 hours (news cycle completion)

### 8. Confidence Scoring
Based on Volume Impact Score:
- **HIGH**: VIS > 15 (strong conviction trades)
- **MEDIUM**: VIS 8-15 (moderate conviction)
- **LOW**: VIS < 8 (lower probability setups)

### 9. Catalyst Detection
Automatic catalyst identification:
- **15%+ move**: Major News/Earnings
- **8%+ move**: Analyst Upgrade/News
- **5%+ move**: Social Media Buzz
- **3%+ move**: Technical Breakout

## Real Example:
**Symbol**: ATER at $3.45, +8.2% change, 2.1x RVOL, 8.5M float

**Analysis Output**:
- Strategy: LOW_FLOAT_SQUEEZE
- Entry: $3.45
- Target 1: $3.62 (5% up, 75% probability)
- Target 2: $3.86 (12% up, 45% probability)  
- Target 3: $4.31 (25% up, 20% probability)
- Stop Loss: $3.17 (8% down)
- Risk Level: HIGH
- Position Size: 1-2%
- Holding Period: 1-4 hours
- Catalyst: Analyst Upgrade/News

This systematic approach ensures consistent, data-driven trade analysis for every scanner result.