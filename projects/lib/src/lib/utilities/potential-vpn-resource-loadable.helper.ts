export function potentialVPNResourceLoadable(url?: string): Promise<boolean> {
  if (!url) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
    })
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
  });
}
