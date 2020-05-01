import { browser, Tabs } from 'webextension-polyfill-ts';
import * as uuid from 'uuid';
import { GiftCardInvoiceMessage } from '../services/gift-card.types';
import {
  isBitPayAccepted,
  fetchMerchants,
  Merchant,
  fetchCachedMerchants,
  getBitPayMerchantFromUrl
} from '../services/merchant';
import { get, set } from '../services/storage';
import { generatePairingToken } from '../services/bitpay-id';

let cachedMerchants: Merchant[] | undefined;
let cacheDate = 0;
const cacheValidityDuration = 1000 * 60;

const windowIdResolveMap: { [windowId: number]: (message: GiftCardInvoiceMessage) => GiftCardInvoiceMessage } = {};

function getIconPath(bitpayAccepted: boolean): string {
  return `/assets/icons/favicon${bitpayAccepted ? '' : '-inactive'}-128.png`;
}

function setIcon(bitpayAccepted: boolean): void {
  browser.browserAction.setIcon({ path: getIconPath(bitpayAccepted) });
}

async function getCachedMerchants(): Promise<Merchant[]> {
  return cachedMerchants || fetchCachedMerchants();
}

async function refreshCachedMerchants(): Promise<void> {
  cachedMerchants = await fetchCachedMerchants();
  cacheDate = Date.now();
}

async function refreshCachedMerchantsIfNeeded(): Promise<void> {
  if (Date.now() < cacheDate + cacheValidityDuration) return;
  await fetchMerchants();
  await refreshCachedMerchants();
}

async function handleUrlChange(url: string): Promise<void> {
  const merchants = await getCachedMerchants();
  const bitpayAccepted = !!(url && isBitPayAccepted(url, merchants));
  await setIcon(bitpayAccepted);
  await refreshCachedMerchantsIfNeeded();
}

async function createClientIdIfNotExists(): Promise<void> {
  const clientId = await get<string>('clientId');
  if (!clientId) {
    await set<string>('clientId', uuid.v4());
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendMessageToTab(message: any, tab: Tabs.Tab): Promise<void> {
  return browser.tabs.sendMessage(tab.id as number, message);
}

browser.browserAction.onClicked.addListener(async tab => {
  if (!tab.url || (!tab.url.startsWith('https://') && !tab.url.startsWith('http://'))) {
    browser.tabs.create({ url: `${process.env.API_ORIGIN}/directory?launchExtension=true` });
    return;
  }
  const merchant = tab.url && getBitPayMerchantFromUrl(tab.url, await getCachedMerchants());
  await browser.tabs.sendMessage(tab.id as number, {
    name: 'EXTENSION_ICON_CLICKED',
    merchant
  });
});

browser.runtime.onInstalled.addListener(async () => {
  await Promise.all([refreshCachedMerchantsIfNeeded(), createClientIdIfNotExists()]);
  const tabs = await browser.tabs.query({});
  await Promise.all(Array.from(tabs, tab => browser.tabs.reload(tab.id)));
});

async function launchWindowAndListenForEvents({
  url,
  height = 735,
  width = 430
}: {
  url: string;
  height: number;
  width: number;
}): Promise<GiftCardInvoiceMessage> {
  const { id } = await browser.windows.create({ url, type: 'popup', height, width });
  const promise = new Promise<GiftCardInvoiceMessage>(resolve => {
    windowIdResolveMap[id as number] = resolve as () => GiftCardInvoiceMessage;
  });
  const message = await promise;
  return message;
}

async function pairBitpayId(payload: { secret: string; code?: string }): Promise<void> {
  await generatePairingToken(payload);
}

browser.runtime.onMessage.addListener(async (message, sender) => {
  const { tab } = sender;
  switch (message && message.name) {
    case 'LAUNCH_TAB':
      return browser.tabs.create({ url: message.url });
    case 'LAUNCH_WINDOW':
      return tab && launchWindowAndListenForEvents(message);
    case 'ID_CONNECTED': {
      const resolveFn = windowIdResolveMap[tab?.windowId as number];
      delete windowIdResolveMap[tab?.windowId as number];
      browser.tabs.remove(tab?.id as number);
      await pairBitpayId(message.data);
      return resolveFn && resolveFn({ data: { status: 'complete' } });
    }
    case 'INVOICE_EVENT': {
      if (!message.data || !message.data.status) {
        return;
      }
      const resolveFn = windowIdResolveMap[tab?.windowId as number];
      return resolveFn && resolveFn(message);
    }
    case 'REDIRECT':
      return browser.tabs.update({
        url: message.url
      });
    case 'REFRESH_MERCHANT_CACHE':
      return refreshCachedMerchants();
    case 'URL_CHANGED':
      return handleUrlChange(message.url);
    default:
      return tab && sendMessageToTab(message, tab);
  }
});

browser.windows.onRemoved.addListener(windowId => {
  const resolveFn = windowIdResolveMap[windowId];
  return resolveFn && resolveFn({ data: { status: 'closed' } });
});
