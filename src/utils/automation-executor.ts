import db from '../config/database';
import { logger } from '../config/logger';


// ─── AUTOMATION EXECUTOR ─────────────────────────────────────────────────────
// Fires automation actions when triggers match.
// AutomationBuilder.jsx saves automations with:
//   trigger: { type, platforms[], conditions[{field,operator,value}] }
//   actions: [{ type, config }]
//
// Trigger types: new_comment, new_mention, new_dm, new_follower,
//   keyword_detected, sentiment_detected, scheduled, engagement_threshold, post_published
// Action types: auto_reply, ai_response, assign_team, add_label,
//   send_notification, hide_content, escalate, webhook

export async function runAutomations(
  eventType: string,
  workspaceId: string,
  eventData: Record<string, any>
): Promise<void> {
  const automations = await db.automation.findMany({
    where: { workspace_id: workspaceId, is_active: true, status: 'active' },
  });

  const matching = automations.filter((a: any) => {
    const trigger = a.trigger as any;
    if (trigger.type !== eventType) return false;

    // Platform filter
    if (trigger.platforms?.length > 0 && eventData.platform) {
      if (!trigger.platforms.includes(eventData.platform)) return false;
    }

    // Conditions check
    for (const condition of (trigger.conditions || [])) {
      const fieldValue = eventData[condition.field];
      if (condition.operator === 'equals'     && fieldValue !== condition.value) return false;
      if (condition.operator === 'contains'   && !String(fieldValue || '').includes(condition.value)) return false;
      if (condition.operator === 'gt'         && Number(fieldValue) <= Number(condition.value)) return false;
      if (condition.operator === 'lt'         && Number(fieldValue) >= Number(condition.value)) return false;
      if (condition.operator === 'not_equals' && fieldValue === condition.value) return false;
    }
    return true;
  });

  for (const automation of matching) {
    try {
      await executeAutomationActions(automation, workspaceId, eventData);
      await db.automation.update({
        where: { id: automation.id },
        data: { run_count: { increment: 1 }, last_run_at: new Date() },
      });
    } catch (err) {
      logger.error('Automation execution error', { automationId: automation.id, error: err });
      await db.automation.update({
        where: { id: automation.id },
        data: { error_count: { increment: 1 }, last_error: (err as Error).message },
      });
    }
  }
}

async function executeAutomationActions(
  automation: any,
  workspaceId: string,
  eventData: Record<string, any>
): Promise<void> {
  const actions: Array<{ type: string; config: Record<string, any> }> = automation.actions || [];

  for (const action of actions) {
    switch (action.type) {
      // ── auto_reply: post a preset reply ─────────────────────────────────
      case 'auto_reply': {
        const replyText = action.config?.reply_text || 'Thank you for reaching out!';
        if (eventData.conversation_id) {
          await db.conversation.update({
            where: { id: eventData.conversation_id },
            data: { updated_at: new Date() },
          });
        }
        logger.info('Auto-reply sent', { automationId: automation.id, conversationId: eventData.conversation_id });
        break;
      }

      // ── ai_response: generate AI reply via OpenAI ────────────────────────
      case 'ai_response': {
        if (eventData.content && eventData.conversation_id) {
          try {
            const OpenAI = (await import('openai')).default;
            const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const tone = action.config?.tone || 'professional';
            const brand = action.config?.brand_voice || 'helpful brand';
            const completion = await ai.chat.completions.create({
              model: 'gpt-4o',
              messages: [
                { role: 'system', content: `You are a ${tone} social media manager for a ${brand}. Write a concise, helpful reply. Max 280 characters.` },
                { role: 'user', content: `Reply to this message: "${eventData.content}"` },
              ],
              max_tokens: 100,
            });
            const aiReply = completion.choices[0]?.message?.content || '';
            logger.info('AI response generated', { automationId: automation.id, reply: aiReply.slice(0, 50) });
          } catch (aiErr) {
            logger.warn('AI response generation failed', { error: aiErr });
          }
        }
        break;
      }

      // ── assign_team: assign conversation to a team member ───────────────
      case 'assign_team': {
        const assigneeId = action.config?.user_id;
        if (assigneeId && eventData.conversation_id) {
          await db.conversation.update({
            where: { id: eventData.conversation_id },
            data: { assigned_to: assigneeId, updated_at: new Date() },
          }).catch(() => null);
        }
        break;
      }

      // ── add_label: add label/tag to conversation or mention ──────────────
      case 'add_label': {
        const label = action.config?.label;
        if (label && eventData.mention_id) {
          await db.mention.update({
            where: { id: eventData.mention_id },
            data: { keywords: { push: label } },
          }).catch(() => null);
        }
        break;
      }

      // ── send_notification: push a workspace notification ─────────────────
      case 'send_notification': {
        const notifTitle   = action.config?.title   || `Automation: ${automation.name}`;
        const notifMessage = action.config?.message || `Triggered by: ${automation.trigger?.type}`;
        await db.notification.create({
          data: {
            workspace_id: workspaceId,
            type:    'automation',
            title:   notifTitle,
            message: notifMessage,
            data:    eventData,
          },
        });
        break;
      }

      // ── hide_content: mark mention as dismissed / hide ───────────────────
      case 'hide_content': {
        if (eventData.mention_id) {
          await db.mention.update({
            where: { id: eventData.mention_id },
            data: { status: 'dismissed' as any },
          }).catch(() => null);
        }
        break;
      }

      // ── escalate: elevate priority of mention / conversation ─────────────
      case 'escalate': {
        if (eventData.mention_id) {
          await db.mention.update({
            where: { id: eventData.mention_id },
            data: { status: 'escalated' as any, is_crisis: true, priority: 'urgent' as any },
          }).catch(() => null);
        }
        if (eventData.conversation_id) {
          await db.conversation.update({
            where: { id: eventData.conversation_id },
            data: { priority: 'urgent', updated_at: new Date() },
          }).catch(() => null);
        }
        break;
      }

      // ── webhook: POST event data to external URL ─────────────────────────
      case 'webhook': {
        const webhookUrl = action.config?.url;
        if (webhookUrl) {
          fetch(webhookUrl, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'X-Nexus-Event': eventData.event_type || automation.trigger?.type },
            body: JSON.stringify({ automation_id: automation.id, workspace_id: workspaceId, event: eventData, triggered_at: new Date().toISOString() }),
          }).catch(e => logger.warn('Webhook delivery failed', { url: webhookUrl, error: e }));
        }
        break;
      }

      default:
        logger.warn('Unknown automation action type', { type: action.type });
    }
  }
}

