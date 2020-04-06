export function removeProtocolAndWww(url: string): string {
  return url.replace(/(^\w+:|^)\/\//, '').replace(/^www\./, '');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function post(url: string, params: any): Promise<any> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    const err = await response.json();
    throw Error(err.message);
  }
  const data = await response.json();
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupBy(list: any[], props: any): {} {
  return list.reduce((a, b) => {
    (a[b[props]] = a[b[props]] || []).push(b);
    return a;
  }, {});
}
