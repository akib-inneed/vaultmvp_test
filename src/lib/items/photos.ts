import 'server-only';

export const ITEM_IMAGE_BUCKET = 'item-images';

type StorageClient = {
  storage: {
    from: (bucket: string) => {
      createSignedUrl: (
        path: string,
        expiresIn: number,
      ) => Promise<{ data: { signedUrl: string } | null; error: unknown }>;
    };
  };
};

function isExternalUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export async function getItemImageUrl(
  client: StorageClient,
  photoPathOrUrl: string | null,
  expiresIn = 60 * 60,
) {
  if (!photoPathOrUrl) return null;

  // Existing rows may contain public URLs from the earlier item-photos bucket.
  if (isExternalUrl(photoPathOrUrl)) return photoPathOrUrl;

  const { data, error } = await client.storage
    .from(ITEM_IMAGE_BUCKET)
    .createSignedUrl(photoPathOrUrl, expiresIn);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function addItemImageUrls<T extends { photo_url: string | null }>(
  client: StorageClient,
  items: T[],
  expiresIn?: number,
) {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      photo_url: await getItemImageUrl(client, item.photo_url, expiresIn),
    })),
  );
}
