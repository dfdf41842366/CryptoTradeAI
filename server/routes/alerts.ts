import { Router } from 'express';
import { db } from '../db';
import { alerts } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { marketDataService } from '../services/marketData';

const router = Router();

interface CreateAlertRequest {
  type: 'price' | 'volume' | 'technical' | 'news' | 'ai_signal';
  symbol: string;
  condition: string;
  value: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notifications: ('ui' | 'email' | 'telegram' | 'discord')[];
}

// Get all alerts
router.get('/', async (req, res) => {
  try {
    const allAlerts = await db.select().from(alerts).orderBy(alerts.createdAt);
    
    // Check alert statuses and update current values
    const alertsWithCurrentData = await Promise.all(
      allAlerts.map(async (alert) => {
        try {
          if (alert.type === 'price' || alert.type === 'volume') {
            const quote = await marketDataService.getQuote(alert.symbol);
            const currentValue = alert.type === 'price' ? quote.price : quote.volume;
            
            // Check if alert should be triggered
            let isTriggered = false;
            if (alert.condition === 'above' && currentValue > alert.value) {
              isTriggered = true;
            } else if (alert.condition === 'below' && currentValue < alert.value) {
              isTriggered = true;
            }
            
            // Update alert status if triggered
            if (isTriggered && alert.status === 'active') {
              await db.update(alerts)
                .set({ 
                  status: 'triggered', 
                  triggeredAt: new Date(),
                  currentValue: Math.round(currentValue * 100) / 100
                })
                .where(eq(alerts.id, alert.id));
              
              return { 
                ...alert, 
                status: 'triggered', 
                triggeredAt: new Date(),
                currentValue: Math.round(currentValue * 100) / 100
              };
            }
            
            return { ...alert, currentValue: Math.round(currentValue * 100) / 100 };
          }
          return alert;
        } catch (error) {
          console.error(`Error updating alert ${alert.id}:`, error);
          return alert;
        }
      })
    );
    
    res.json(alertsWithCurrentData);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Create new alert
router.post('/', async (req, res) => {
  try {
    const { type, symbol, condition, value, priority, notifications } = req.body as CreateAlertRequest;
    
    if (!type || !symbol || !condition || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`🚨 Creating ${type} alert for ${symbol}: ${condition} ${value}`);

    // Get current market data for initial value
    let currentValue = 0;
    try {
      const quote = await marketDataService.getQuote(symbol);
      currentValue = type === 'price' ? quote.price : quote.volume;
    } catch (error) {
      console.warn(`Could not get current data for ${symbol}:`, error);
    }

    const newAlert = await db.insert(alerts).values({
      type,
      symbol: symbol.toUpperCase(),
      condition,
      value: Math.round(value * 100) / 100,
      currentValue: Math.round(currentValue * 100) / 100,
      status: 'active',
      priority,
      notifications: notifications.join(','),
      createdAt: new Date()
    }).returning();

    res.json(newAlert[0]);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Delete alert
router.delete('/:id', async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    
    await db.delete(alerts).where(eq(alerts.id, alertId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

// Update alert status
router.patch('/:id/status', async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    const { status } = req.body;
    
    const updatedAlert = await db.update(alerts)
      .set({ status })
      .where(eq(alerts.id, alertId))
      .returning();
    
    res.json(updatedAlert[0]);
  } catch (error) {
    console.error('Error updating alert status:', error);
    res.status(500).json({ error: 'Failed to update alert status' });
  }
});

export default router;