import track from 'react-tracking';
import ReactGA from 'react-ga';
import { dispatchAnalyticsEvent } from './browser';

// github.com/react-ga/react-ga/issues/379

// new Promise(resolve => {
//   (function(i, s, o, g, r, a, m) {
//     i.GoogleAnalyticsObject = r;
//     (i[r] =
//       i[r] ||
//       function() {
//         (i[r].q = i[r].q || []).push(arguments);
//       }),
//       (i[r].l = 1 * new Date());
//     (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
//     a.async = 1;
//     a.src = g;
//     a.addEventListener('load', resolve);
//     m.parentNode.insertBefore(a, m);
//   })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
//   window.ga('create', 'UA-24163874-24', 'auto');
//   window.ga('send', 'pageview');
// }).then(() => {
//   ReactGA.initialize('UA-24163874-24', {
//     standardImplementation: true
//   });
//   // ReactGA.pageview('/index.html');
// });

ReactGA.initialize('UA-24163874-24', {
  debug: true,
  gaAddress: 'https://www.google-analytics.com/analytics.js' // 'https://ssl.google-analytics.com/ga.js'
});
ReactGA.ga('set', 'checkProtocolTask', null);
ReactGA.pageview('/index.html');
// console.log('ReactGA', ReactGA);

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
      ...(props.location && props.location.pathname && { pathname: getSafePathname(props.location.pathname) })
    }),
    eventProperties.page ? { dispatchOnMount: true } : {}
  )(component);
}

export function dispatchEvent(event: { [key: string]: string }): void {
  dispatchAnalyticsEvent({ ...event, category: 'widget' });
}

export function sendEventToGa(event: { [key: string]: string }): void {
  if (event && event.page) {
    console.log('logging pageview');
    ReactGA.pageview(event.pathname);
  }
  if (event && event.action) {
    console.log('logging action');
    ReactGA.event({ category: event.category, action: event.action });
  }
  console.log('event', event);
}
