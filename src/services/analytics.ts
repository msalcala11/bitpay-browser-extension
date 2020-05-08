import track from 'react-tracking';

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
