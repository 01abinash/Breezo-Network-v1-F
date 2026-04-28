export function mapApiKey(key) {
  return {
    id: key._id,
    name: key.name,
    maskedKey: maskKey(key.key),
    createdAt: key.createdAt,
    usage: key.usedCount,
    limit: key.requestLimit,
    status: key.isActive ? "active" : "revoked",
  };
}

function maskKey(key) {
  if (!key) return "";
  return key.slice(0, 6) + "..." + key.slice(-4);
}
