const rawDomain =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;

export const productionURLfunction = () => {
   const productionurl = rawDomain
     ? `https://${rawDomain}`
     : "https://rent-nest-delta.vercel.app";
  return productionurl
};
