import track from 'react-tracking';
import ReactGA from 'react-ga';
import { dispatchAnalyticsEvent } from './browser';

ReactGA.initialize('UA-24163874-24', {
  debug: true,
  gaAddress: 'https://www.google-analytics.com/analytics.js',
  titleCase: false
});
ReactGA.ga('set', 'checkProtocolTask', null);

function getSafePathname(pathname: string): string {
  const parts = pathname.split('/');
  const invoiceIdIndex = 2;
  const safeParts = [...parts.slice(0, invoiceIdIndex), ...parts.slice(invoiceIdIndex + 1)];
  return pathname.startsWith('/card') ? `${safeParts.join('/')}` : pathname;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trackComponent(component: React.FC<any>, eventProperties: any = {}): React.FC<any> {
  return track(
    props => ({
      ...eventProperties,
      ...(props.location && props.location.pathname && { pathname: getSafePathname(props.location.pathname) }),
      isPageview: eventProperties.page
    }),
    eventProperties.page ? { dispatchOnMount: true } : {}
  )(component);
}

export function dispatchEvent(event: { [key: string]: string }): void {
  dispatchAnalyticsEvent({ ...event, category: 'widget' });
}

export function sendEventToGa(event: { [key: string]: string }): void {
  console.log('event', event);
  event.isPageview
    ? ReactGA.pageview(event.pathname)
    : ReactGA.event({ category: event.category, action: event.action });
}
