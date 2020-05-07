import track from 'react-tracking';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trackComponent(component: React.FC<any>, eventProperties: any): React.FC<any> {
  return track(
    props => ({
      pathname: props.location.pathname,
      ...eventProperties
    }),
    { dispatchOnMount: true }
  )(component);
}
