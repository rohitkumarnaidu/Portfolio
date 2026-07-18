/**
 * Type-safe analytics event catalog.
 *
 * Every tracked event is declared here with its allowed properties so that
 * `track(event, props)` is fully type-checked at call sites.
 */
export interface AnalyticsEventMap {
  page_view: { path: string; referrer?: string };
  contact_submit: { subject?: string; source?: string };
  project_view: { slug: string; title?: string; category?: string };
  chat_message_sent: { length?: number; page?: string };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

export type AnalyticsEventProps<E extends AnalyticsEventName> = AnalyticsEventMap[E];
